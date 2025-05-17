from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Literal, Callable
from services.nlp_service import NLPService
from services.request_validator_service import RequestValidatorService
from services.transfer_service import TransferService
from services.analytics_service import AnalyticsService
from config import Settings
import logging
from fastapi.middleware.cors import CORSMiddleware
from dataclasses import field
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Banking NLP Service",
    description="A service that processes natural language commands",
    version="1.0.0"
)

# Initialize settings and services
settings = Settings()
nlp_service = NLPService()
validator_service = RequestValidatorService()
transfer_service = TransferService()
analytics_service = AnalyticsService()

# Add CORS middleware


class TextCommand(BaseModel):
    text: str
    user_id: str

class SubModule(BaseModel):
    submoduleCode: str
    submoduleName: str
    endpoint: Optional[str] = None
    requestFile: Optional[str] = None

class Module(BaseModel):
    moduleCode: str
    moduleName: str

class Question(BaseModel):
    parameter: str
    question: str

class ValidationResult(BaseModel):
    is_complete: bool
    missing_parameters: List[Dict[str, Any]]
    questions: Optional[List[Question]] = None

class ResolutionMatch(BaseModel):
    identifier: str
    description: str

class ResolutionParameter(BaseModel):
    name: str
    possible_matches: List[ResolutionMatch]

class ResolutionResult(BaseModel):
    is_resolved: bool
    resolution_parameters: Optional[List[ResolutionParameter]] = None
    questions: Optional[List[Question]] = None
    data: Optional[Dict[str, Any]] = None

class NLPResponse(BaseModel):
    module: Module
    sub_module: SubModule
    flow: Literal["QUERY", "TRANSFER", "ANALYTICS"]
    entities: Dict[str, Any]
    validation: Optional[ValidationResult] = None
    resolution: Optional[ResolutionResult] = None
    raw_text: str
    error: Optional[str] = None
    # to_dict: Callable[[], Dict[str, Any]] = Field(default_factory=lambda: self.model_dump())

class SimplifiedNLPResponse(BaseModel):
    moduleCode: str
    submoduleCode: str
    flow: Literal["QUERY", "TRANSFER", "ANALYTICS"]
    entities: Dict[str, Any]
    raw_text: str
    error: Optional[str] = None
    # Add optional fields for ANALYTICS flow
    visualizationType: Optional[str] = None
    analyticsType: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    # New field for distribution type
    distributionType: Optional[str] = None


async def determine_flow(text: str, module_code: str) -> str:
    """Determine the flow type based on the text and module code using NLP service."""
    return await nlp_service.determine_flow(text, module_code)

async def process_text(command: TextCommand) -> NLPResponse | SimplifiedNLPResponse:
    """Process the text command and return structured response."""
    try:
        # Process the text command using NLP service (now includes flow type)
        result = await nlp_service.process_command(command.text)
        
        # If there's an error in the result, return it
        if "error" in result:
            # For error responses, still use the simplified format
            return SimplifiedNLPResponse(
                moduleCode="",
                submoduleCode="",
                flow="QUERY",
                entities={},
                raw_text=command.text,
                error=result["error"]
            )
            
        # Extract module data
        module_data = {
            "moduleCode": result["module"]["moduleCode"],
            "moduleName": result["module"]["moduleName"]
        }

        # Get the flow type from the result (already determined in the single API call)
        flow = result.get("flow", "QUERY")
        
        # Extract entities from the result - these are already processed by the NLP model
        entities = result.get("entities", {})
        module_code = module_data["moduleCode"]
        submodule_code = result["sub_module"]["submoduleCode"]

        # For QUERY flow, use entities directly from the NLP model
        # No validation service needed for QUERY flow
        if flow == "QUERY":
            logger.info(f"Using direct entities for {module_code}/{submodule_code} QUERY flow - skipping validator")
            validation_result = {
                "validation": {
                    "is_complete": True,
                    "missing_parameters": [],
                    "questions": None
                },
                "entities": entities,
                "raw_text": command.text
            }
            
            # Resolution result for QUERY flow - always resolved
            resolution_result = {
                "is_resolved": True,
                "resolution_parameters": [],
                "questions": None
            }
            
            # Return simplified response for QUERY flow
            return SimplifiedNLPResponse(
                moduleCode=module_code,
                submoduleCode=submodule_code,
                flow=flow,
                entities=entities,
                raw_text=command.text,
                error=None
            )
        
        # For ANALYTICS flow, also use simplified response
        elif flow == "ANALYTICS":
            logger.info(f"Using simplified response for {module_code}/{submodule_code} ANALYTICS flow")
            
            # Determine analytics type based on submodule code
            analytics_type = _determine_analytics_type(submodule_code, command.text)
            
            # Determine visualization type based on submodule and text
            visualization_type = _determine_visualization_type(submodule_code, command.text, entities)
            
            # Determine distribution type if visualization is pie chart or distribution analysis
            distribution_type = None
            if visualization_type == "pie_chart" or "pie" in command.text.lower() or "distribution" in command.text.lower():
                distribution_type = _determine_distribution_type(command.text, entities)
            
            # Extract relevant filters from entities
            filters = _extract_analytics_filters(entities, submodule_code)
            
            # Add distribution type to filters if it was determined
            if distribution_type:
                filters["distributionType"] = distribution_type
            
            # Return simplified response for ANALYTICS flow
            return SimplifiedNLPResponse(
                moduleCode=module_code,
                submoduleCode=submodule_code,
                flow=flow,
                entities=entities,
                visualizationType=visualization_type,
                analyticsType=analytics_type,
                distributionType=distribution_type,
                filters=filters,
                raw_text=command.text,
                error=None
            )

        # For TRANSFER flow, also use simplified response
        elif flow == "TRANSFER":
            logger.info(f"Using simplified response for {module_code}/{submodule_code} TRANSFER flow")
            
            # For transfers, we can use the entities directly from the NLP model
            # This skips validation and resolution for now, focusing on simplicity
            
            # Normalize entity names for consistency
            # Convert recipientName to beneficiaryName if present
            if "recipientName" in entities and "beneficiaryName" not in entities:
                entities["beneficiaryName"] = entities["recipientName"]
                del entities["recipientName"]
            
            # Extract currency from text if not already in entities
            if "currency" not in entities and "rupees" in command.text.lower():
                entities["currency"] = "INR"
            elif "currency" not in entities and "Rs." in command.text:
                entities["currency"] = "INR"
            elif "currency" not in entities and "rs." in command.text.lower():
                entities["currency"] = "INR"
            elif "currency" not in entities and "Rs" in command.text:
                entities["currency"] = "INR"
            elif "currency" not in entities and "rs" in command.text.lower():
                entities["currency"] = "INR"
            elif "currency" not in entities and "dollars" in command.text.lower():
                entities["currency"] = "USD"
            elif "currency" not in entities and "euros" in command.text.lower():
                entities["currency"] = "EUR"
            elif "currency" not in entities and "$" in command.text:
                entities["currency"] = "USD"
            elif "currency" not in entities and "£" in command.text:
                entities["currency"] = "GBP"
            elif "currency" not in entities and "€" in command.text:
                entities["currency"] = "EUR"
            
            # Return simplified response for TRANSFER flow
            return SimplifiedNLPResponse(
                moduleCode=module_code,
                submoduleCode=submodule_code,
                flow=flow,
                entities=entities,
                raw_text=command.text,
                error=None
            )
            
        # Use validator service for legacy support
        validation_result = await validator_service.validate_and_get_questions(
            module_code=module_code,
            submodule_code=submodule_code,
            raw_text=command.text
        )
        validation_result["raw_text"] = command.text    
        
        # Get resolution result based on flow type
        resolution_result = None
        if flow == "TRANSFER":
            resolution_result = await transfer_service.resolve_transfer_entities(
                entities=validation_result["entities"],
                module_code=module_code,
                submodule_code=submodule_code
            )
        # Removed ANALYTICS flow here as it now uses the simplified response
        
        # For other flows, return complete response
        return NLPResponse(
            module=Module(**module_data),
            sub_module=result["sub_module"],
            flow=flow,
            entities=validation_result["entities"],
            validation=ValidationResult(**validation_result["validation"]),
            resolution=ResolutionResult(**resolution_result),
            raw_text=command.text,
            error=None
        )
        
    except Exception as e:
        logger.error(f"Error processing text command: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error processing the text command"
        )

def _determine_analytics_type(submodule_code: str, text: str) -> str:
    """Determine the analytics type based on submodule code and text."""
    # Map submodule codes to analytics types
    submodule_to_analytics = {
        "ANALYTICS_TRANSACTIONS": "transaction_analysis",
        "ANALYTICS_SPENDING": "spending_trends",
        "ANALYTICS_INCOME": "income_analysis",
        "ANALYTICS_BUDGET": "budget_tracking",
        "ANALYTICS_INVESTMENT": "investment_performance"
    }
    
    # Use keyword mapping for more specific analytics types
    keyword_mapping = {
        "spend": "spending_trends",
        "spending": "spending_trends",
        "expense": "spending_trends", 
        "expenses": "spending_trends",
        "income": "income_analysis",
        "earning": "income_analysis",
        "salary": "income_analysis",
        "budget": "budget_tracking",
        "investment": "investment_performance",
        "portfolio": "investment_performance",
        "trend": "trending_analysis",
        "compare": "comparison_analysis",
        "comparison": "comparison_analysis",
        "distribution": "distribution_analysis",
        "transaction": "transaction_analysis",
        "activity": "transaction_analysis"
    }
    
    # Check for comparison analysis first (higher priority)
    text_lower = text.lower()
    if any(word in text_lower for word in ["compare", "comparison", "versus", "vs"]):
        return "comparison_analysis"
        
    # Check for distribution analysis
    if any(word in text_lower for word in ["distribution", "breakdown", "split", "allocation"]):
        return "distribution_analysis"
    
    # First try to match from submodule code
    if submodule_code in submodule_to_analytics:
        return submodule_to_analytics[submodule_code]
    
    # Otherwise try to match from keywords in text
    for keyword, analytics_type in keyword_mapping.items():
        if keyword in text_lower:
            return analytics_type
            
    # Default fallback
    return "general_analytics"

def _determine_visualization_type(submodule_code: str, text: str, entities: Dict[str, Any] = None) -> str:
    """Determine the most appropriate visualization type based on context."""
    # Default visualizations based on submodule
    submodule_to_viz = {
        "ANALYTICS_TRANSACTIONS": "table",
        "ANALYTICS_SPENDING": "bar_chart",
        "ANALYTICS_INCOME": "line_chart",
        "ANALYTICS_BUDGET": "pie_chart",
        "ANALYTICS_INVESTMENT": "area_chart"
    }
    
    # Keyword-based visualization mapping
    keyword_mapping = {
        "table": "table",
        "list": "table",
        "chart": "bar_chart",
        "bar chart": "bar_chart",
        "bar graph": "bar_chart",
        "graph": "line_chart",
        "line chart": "line_chart",
        "line graph": "line_chart",
        "pie": "pie_chart",
        "pie chart": "pie_chart",
        "distribution": "pie_chart",
        "breakdown": "pie_chart",
        "trend": "line_chart",
        "trends": "line_chart",
        "compare": "bar_chart",
        "comparison": "bar_chart",
        "time series": "line_chart",
        "timeline": "line_chart",
        "over time": "line_chart"
    }
    
    # Analytics type to visualization type mapping (for when no explicit viz is requested)
    analytics_to_viz = {
        "spending_trends": "line_chart",
        "income_analysis": "line_chart",
        "budget_tracking": "pie_chart",
        "transaction_analysis": "table",
        "distribution_analysis": "pie_chart",
        "comparison_analysis": "bar_chart",
        "trending_analysis": "line_chart"
    }
    
    # First check if there's a visualization entity explicitly specified
    if entities and "visualization" in entities:
        viz_value = entities["visualization"]
        if isinstance(viz_value, str):
            viz_value = viz_value.lower()
            
            # Direct mapping for common visualization references
            if viz_value in ["table", "list", "grid"]:
                return "table"
            elif "bar" in viz_value or "column" in viz_value:
                return "bar_chart"
            elif "line" in viz_value:
                return "line_chart"
            elif "pie" in viz_value or "circle" in viz_value:
                return "pie_chart"
            elif "area" in viz_value or "fill" in viz_value:
                return "area_chart"
    
    # Check for explicit visualization requests in text
    text_lower = text.lower()
    
    # First check for exact visualization types 
    for keyword, viz_type in keyword_mapping.items():
        if keyword in text_lower:
            return viz_type
    
    # Determine analytics type for viz mapping
    analytics_type = _determine_analytics_type(submodule_code, text)
    if analytics_type in analytics_to_viz:
        return analytics_to_viz[analytics_type]
    
    # Fall back to submodule-based default
    if submodule_code in submodule_to_viz:
        return submodule_to_viz[submodule_code]
    
    # Ultimate fallback
    return "table"

def _determine_distribution_type(text: str, entities: Dict[str, Any]) -> Optional[str]:
    """Determine the distribution type for analytics based on the text and entities."""
    
    # Default distribution types based on keywords in the text
    text_lower = text.lower()
    
    # Map of keywords to distribution types
    distribution_mapping = {
        "category": "category",
        "categories": "category",
        "spending category": "category",
        "expense category": "category",
        
        "amount range": "amount_range",
        "price range": "amount_range",
        "value range": "amount_range",
        "transaction size": "amount_range",
        
        "time of day": "time_of_day",
        "hour of day": "time_of_day",
        "day time": "time_of_day",
        
        "day of week": "day_of_week",
        "weekday": "day_of_week",
        "weekdays": "day_of_week",
        "week day": "day_of_week",
        
        "transaction type": "transaction_type",
        "payment method": "payment_method",
        "payment type": "payment_method",
        
        "merchant": "merchant",
        "vendor": "merchant",
        "shop": "merchant",
        "store": "merchant",
        
        "location": "location",
        "region": "location",
        "place": "location",
        
        "month": "month",
        "monthly": "month",
        "by month": "month"
    }
    
    # Check for distribution type in entities first (if explicitly provided)
    if "distributionType" in entities:
        return entities["distributionType"]
    
    # Check for explicit mentions in the text
    for keyword, dist_type in distribution_mapping.items():
        if keyword in text_lower:
            return dist_type
    
    # If text mentions pie chart or distribution, try to infer the most appropriate type
    if "pie" in text_lower or "distribution" in text_lower or "breakdown" in text_lower:
        # Default to category for general distribution requests
        if "category" in entities:
            return "category"
        elif any(word in text_lower for word in ["spend", "expense", "payment", "transaction"]):
            return "category"
        
    # Return None if no distribution type could be determined
    return None

def _extract_analytics_filters(entities: Dict[str, Any], submodule_code: str) -> Dict[str, Any]:
    """Extract relevant filters from entities based on the analytics submodule."""
    filters = {}
    
    # Handle date-related entities
    current_year = datetime.now().year
    current_month = datetime.now().month
    
    if "year" in entities:
        year = int(entities["year"]) if isinstance(entities["year"], int) else int(entities["year"])
        filters["startDate"] = f"{year}-01-01"
        filters["endDate"] = f"{year}-12-31"
        
        # Handle quarter if present
        if "quarter" in entities:
            quarter = entities["quarter"].upper() if isinstance(entities["quarter"], str) else f"Q{entities['quarter']}"
            quarter_num = int(quarter.replace("Q", ""))
            if 1 <= quarter_num <= 4:
                start_month = (quarter_num - 1) * 3 + 1
                end_month = quarter_num * 3
                filters["startDate"] = f"{year}-{start_month:02d}-01"
                # Use last day of the end month for proper quarter end date
                end_day = 31 if end_month in [3, 5, 7, 8, 10, 12] else 30
                end_day = 28 if end_month == 2 and year % 4 != 0 else end_day  # Simplified leap year check
                end_day = 29 if end_month == 2 and year % 4 == 0 else end_day
                filters["endDate"] = f"{year}-{end_month:02d}-{end_day}"
                
    elif "month" in entities and "year" in entities:
        year = int(entities["year"]) if isinstance(entities["year"], int) else int(entities["year"])
        month_val = entities["month"]
        
        # Handle month as string (e.g., "January")
        month_mapping = {
            "january": 1, "jan": 1, "february": 2, "feb": 2, "march": 3, "mar": 3,
            "april": 4, "apr": 4, "may": 5, "june": 6, "jun": 6, "july": 7, "jul": 7,
            "august": 8, "aug": 8, "september": 9, "sep": 9, "october": 10, "oct": 10,
            "november": 11, "nov": 11, "december": 12, "dec": 12
        }
        
        if isinstance(month_val, str) and month_val.lower() in month_mapping:
            month = month_mapping[month_val.lower()]
        else:
            month = int(month_val) if isinstance(month_val, int) else int(month_val)
            
        # Determine last day of month
        last_day = 31 if month in [1, 3, 5, 7, 8, 10, 12] else 30
        last_day = 28 if month == 2 and year % 4 != 0 else last_day
        last_day = 29 if month == 2 and year % 4 == 0 else last_day
        
        filters["startDate"] = f"{year}-{month:02d}-01"
        filters["endDate"] = f"{year}-{month:02d}-{last_day}"
        
    elif "startDate" in entities:
        filters["startDate"] = entities["startDate"]
        if "endDate" in entities:
            filters["endDate"] = entities["endDate"]
        else:
            # Default to current date if only start date provided
            filters["endDate"] = datetime.now().strftime("%Y-%m-%d")
            
    elif "period" in entities:
        # Handle relative time periods
        period = entities["period"].lower() if isinstance(entities["period"], str) else str(entities["period"]).lower()
        
        # Today
        if period in ["today"]:
            today = datetime.now().strftime("%Y-%m-%d")
            filters["startDate"] = today
            filters["endDate"] = today
            
        # Yesterday
        elif period in ["yesterday"]:
            yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            filters["startDate"] = yesterday
            filters["endDate"] = yesterday
            
        # This week
        elif period in ["this week", "current week", "week"]:
            today = datetime.now()
            start_of_week = today - timedelta(days=today.weekday())
            filters["startDate"] = start_of_week.strftime("%Y-%m-%d")
            filters["endDate"] = datetime.now().strftime("%Y-%m-%d")
            
        # Last week
        elif period in ["last week", "previous week"]:
            today = datetime.now()
            start_of_last_week = today - timedelta(days=today.weekday() + 7)
            end_of_last_week = start_of_last_week + timedelta(days=6)
            filters["startDate"] = start_of_last_week.strftime("%Y-%m-%d")
            filters["endDate"] = end_of_last_week.strftime("%Y-%m-%d")
            
        # This month
        elif period in ["this month", "current month", "month"]:
            filters["startDate"] = f"{current_year}-{current_month:02d}-01"
            filters["endDate"] = datetime.now().strftime("%Y-%m-%d")
            
        # Last month
        elif period in ["last month", "previous month"]:
            last_month = current_month - 1
            last_month_year = current_year
            if last_month == 0:
                last_month = 12
                last_month_year -= 1
                
            # Determine last day of last month
            last_day = 31 if last_month in [1, 3, 5, 7, 8, 10, 12] else 30
            last_day = 28 if last_month == 2 and last_month_year % 4 != 0 else last_day
            last_day = 29 if last_month == 2 and last_month_year % 4 == 0 else last_day
            
            filters["startDate"] = f"{last_month_year}-{last_month:02d}-01"
            filters["endDate"] = f"{last_month_year}-{last_month:02d}-{last_day}"
            
        # Last quarter
        elif period in ["last quarter", "previous quarter"]:
            current_quarter = (current_month - 1) // 3 + 1
            last_quarter = current_quarter - 1
            last_quarter_year = current_year
            
            if last_quarter == 0:
                last_quarter = 4
                last_quarter_year -= 1
                
            start_month = (last_quarter - 1) * 3 + 1
            end_month = last_quarter * 3
            
            # Last day of end month
            last_day = 31 if end_month in [3, 5, 7, 8, 10, 12] else 30
            last_day = 28 if end_month == 2 and last_quarter_year % 4 != 0 else last_day
            last_day = 29 if end_month == 2 and last_quarter_year % 4 == 0 else last_day
            
            filters["startDate"] = f"{last_quarter_year}-{start_month:02d}-01"
            filters["endDate"] = f"{last_quarter_year}-{end_month:02d}-{last_day}"
            
        # This quarter
        elif period in ["this quarter", "current quarter", "quarter"]:
            current_quarter = (current_month - 1) // 3 + 1
            start_month = (current_quarter - 1) * 3 + 1
            
            filters["startDate"] = f"{current_year}-{start_month:02d}-01"
            filters["endDate"] = datetime.now().strftime("%Y-%m-%d")
            
        # Year to date
        elif period in ["year to date", "ytd", "this year"]:
            filters["startDate"] = f"{current_year}-01-01"
            filters["endDate"] = datetime.now().strftime("%Y-%m-%d")
            
        # Last year
        elif period in ["last year", "previous year"]:
            last_year = current_year - 1
            filters["startDate"] = f"{last_year}-01-01"
            filters["endDate"] = f"{last_year}-12-31"
            
        # Past X days
        elif period.startswith("last ") or period.startswith("past "):
            parts = period.split()
            if len(parts) >= 3 and parts[1].isdigit():
                days = int(parts[1])
                if days > 0 and days < 366:  # reasonable range check
                    today = datetime.now()
                    past_date = today - timedelta(days=days)
                    filters["startDate"] = past_date.strftime("%Y-%m-%d")
                    filters["endDate"] = today.strftime("%Y-%m-%d")
    
    # Handle time period from the timePeriod entity (extracted from some analytics queries)
    elif "timePeriod" in entities:
        time_period = entities["timePeriod"]
        
        # Handle quarter specification like "Q1 2024" or "2024 Q1"
        if isinstance(time_period, str) and "Q" in time_period.upper():
            parts = time_period.upper().replace("Q", " Q").split()
            year_part = None
            quarter_part = None
            
            for part in parts:
                if part.startswith("Q") and len(part) >= 2 and part[1:].isdigit():
                    quarter_part = part
                elif part.isdigit() and len(part) == 4:
                    year_part = part
                    
            if year_part and quarter_part:
                year = int(year_part)
                quarter_num = int(quarter_part[1:])
                
                if 1 <= quarter_num <= 4:
                    start_month = (quarter_num - 1) * 3 + 1
                    end_month = quarter_num * 3
                    
                    # Last day of end month
                    last_day = 31 if end_month in [3, 5, 7, 8, 10, 12] else 30
                    last_day = 28 if end_month == 2 and year % 4 != 0 else last_day
                    last_day = 29 if end_month == 2 and year % 4 == 0 else last_day
                    
                    filters["startDate"] = f"{year}-{start_month:02d}-01"
                    filters["endDate"] = f"{year}-{end_month:02d}-{last_day}"
    
    # Add other entity-based filters
    for key, value in entities.items():
        # Category filters
        if key in ["category", "analysisCategory", "spendCategory"]:
            filters["category"] = value
            
        # Transaction type
        elif key in ["transactionType", "paymentType", "transferType"]:
            filters["transactionType"] = value
            
        # Account/card filters
        elif key in ["accountId", "accountNumber"]:
            filters["accountId"] = value
        elif key == "accountType":
            filters["accountType"] = value
        elif key in ["cardId", "cardNumber"]:
            filters["cardId"] = value
        elif key == "cardType":
            filters["cardType"] = value
            
        # Merchant/payee filters
        elif key in ["merchant", "payee", "beneficiary"]:
            filters["merchant"] = value
            
        # Amount range filters
        elif key in ["minAmount", "minimumAmount"]:
            filters["minAmount"] = value
        elif key in ["maxAmount", "maximumAmount"]:
            filters["maxAmount"] = value
    
    # Add distribution type if specified
    if "distributionType" in entities:
        filters["distributionType"] = entities["distributionType"]
    
    # Add distribution-specific filters
    if "amountRangeBuckets" in entities:
        filters["amountRangeBuckets"] = entities["amountRangeBuckets"]
    
    if "timeOfDayRanges" in entities:
        filters["timeOfDayRanges"] = entities["timeOfDayRanges"]
    
    return filters


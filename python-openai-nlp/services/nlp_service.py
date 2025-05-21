from openai import AsyncOpenAI
from typing import Dict, Any, List, Tuple
import json
import logging
import httpx
import os
from config import Settings
from datetime import datetime
logger = logging.getLogger(__name__)

class NLPService:
    def __init__(self):
        self.settings = Settings()
        # Initialize with custom httpx client to avoid the proxies issue
        self.client = AsyncOpenAI(
            api_key=self.settings.openai_api_key,
            http_client=httpx.AsyncClient()
        )
        # Load module mappings
        self.module_mappings = self._load_module_mappings()
        
    def _load_module_mappings(self) -> Dict[str, Any]:
        """Load all module mappings from the mapping directory."""
        try:
            # Load index file
            with open('mapping/index.json', 'r') as f:
                modules = json.load(f)
            
            # Load individual module mappings
            mappings = {}
            for module in modules:
                with open(f"mapping/{module['mappingFile']}", 'r') as f:
                    module_data = json.load(f)
                    mappings[module['moduleCode']] = {
                        **module,
                        'submodules': module_data.get('submodules', [])
                    }
            return mappings
        except Exception as e:
            logger.error(f"Error loading module mappings: {str(e)}")
            raise
        
    async def process_command(self, text: str) -> Dict[str, Any]:
        """
        Process a natural language command and extract intent and entities.
        
        Args:
            text (str): The input text command
            
        Returns:
            Dict[str, Any]: A dictionary containing module, submodule, entities, flow, and raw text
        """
        try:
            # For QUERY flows, we'll use a combined approach with a single API call
            result, flow = await self._combined_analysis(text)
            
            # Check for error response
            if "error" in result:
                return {
                    "error": result["error"],
                    "raw_text": text
                }
            
            # Get the module code
            module_code = result["module"]
            
            # Check if the module code is valid
            if module_code not in self.module_mappings:
                return {
                    "error": f"Invalid module code: {module_code}",
                    "raw_text": text
                }
                
            # Get the complete submodule object if available
            submodule = None
            if "sub_module" in result and isinstance(result["sub_module"], dict) and "submoduleCode" in result["sub_module"]:
                submodule_code = result["sub_module"]["submoduleCode"]
                for sm in self.module_mappings[module_code]["submodules"]:
                    if isinstance(sm, dict) and sm.get("submoduleCode") == submodule_code:
                        submodule = sm
                        break
                        
            # Construct final response
            final_response = {
                "module": self.module_mappings[module_code],
                "sub_module": submodule if submodule else result.get("sub_module", {}),
                "entities": result.get("entities", {}),
                "flow": flow,
                "raw_text": text
            }
            
            logger.info(f"Final response: {final_response}")
            return final_response
            
        except Exception as e:
            logger.error(f"Error processing command: {str(e)}")
            logger.error(f"Error type: {type(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {
                "error": str(e),
                "raw_text": text
            }
    
    async def _combined_analysis(self, text: str) -> Tuple[Dict[str, Any], str]:
        """
        Performs combined analysis of the text in a single API call.
        Returns both the module/submodule/entities data and the flow type.
        """
        messages = [
            {
                "role": "system",
                "content": self._create_combined_prompt()
            },
            {
                "role": "assistant",
                "content": """I understand. I will analyze banking commands and return structured JSON responses with appropriate entities based on the module. Here are examples across different modules:

1. For account-related queries:
```
For "Show my account balance", I would return:
{
  "module": "ACC",
  "sub_module": {
    "submoduleCode": "ACC_BALANCE",
    "submoduleName": "Account Balance"
  },
  "entities": {
    "accountType": "SAV"
  },
  "flow": "QUERY"
}
```

2. For card-related queries:
```
For "Block my debit card", I would return:
{
  "module": "CARD",
  "sub_module": {
    "submoduleCode": "CARD_BLOCK",
    "submoduleName": "Block Card"
  },
  "entities": {
    "cardStatus": "inactive",
    "cardType": "DEBIT"
  },
  "flow": "QUERY"
}
```

3. For transfer-related queries:
```
For "Transfer $500 from savings to checking", I would return:
{
  "module": "TRF",
  "sub_module": {
    "submoduleCode": "TRF_IMMEDIATE",
    "submoduleName": "Internal Transfer"
  },
  "entities": {
    "amount": "500",
    "sourceAccountType": "SAV",
    "targetAccountType": "CUR"
  },
  "flow": "TRANSFER"
}
```

For "Transfer $100 to John Smith", I would return:
```
{
  "module": "TRF",
  "sub_module": {
    "submoduleCode": "TRF_IMMEDIATE",
    "submoduleName": "Immediate Transfer"
  },
  "entities": {
    "amount": "100",
    "beneficiaryName": "John Smith"
  },
  "flow": "TRANSFER"
}
```

4. For analytics-related queries:
```
For "Show my spending trends for 2024", I would return:
{
  "module": "ANALYTICS",
  "sub_module": {
    "submoduleCode": "ANALYTICS_SPENDING",
    "submoduleName": "Spending Analytics"
  },
  "entities": {
    "year": "2024"
  },
  "flow": "ANALYTICS"
}
```

5. For "Show transaction details for last month in a table", I would return:
```
{
  "module": "ANALYTICS",
  "sub_module": {
    "submoduleCode": "ANALYTICS_TRANSACTIONS",
    "submoduleName": "Transaction Analytics"
  },
  "entities": {
    "period": "last month"
  },
  "flow": "ANALYTICS"
}
```

6. For "Compare my spending by category for Q1 2024", I would return:
```
{
  "module": "ANALYTICS",
  "sub_module": {
    "submoduleCode": "ANALYTICS_SPENDING",
    "submoduleName": "Spending Analytics"
  },
  "entities": {
    "year": "2024",
    "quarter": "Q1",
    "category": "spending"
  },
  "flow": "ANALYTICS"
}
```

7. For "Show the distribution of my expenses", I would return:
```
{
  "module": "ANALYTICS",
  "sub_module": {
    "submoduleCode": "ANALYTICS_SPENDING",
    "submoduleName": "Spending Analytics"
  },
  "entities": {
    "analysisType": "distribution"
  },
  "flow": "ANALYTICS"
}
```"""
            },
            {
                "role": "user",
                "content": f"Extract the module, sub_module, entities, and flow from this banking command: {text}\n\nReturn ONLY a JSON object with the defined structure."
            }
        ]
        
        # Call OpenAI API (single call)
        response = await self.client.chat.completions.create(
            model=self.settings.openai_model,
            messages=messages,
            temperature=0.1,  # Low temperature for consistent results
            response_format={"type": "json_object"}  # Ensure JSON response
        )
        
        # Get the response content and parse it
        try:
            content = response.choices[0].message.content
            logger.info(f"Content to parse: {content}")
            result = json.loads(content)
            logger.info(f"Parsed result: {result}")
            
            # Extract the flow type and the rest of the data
            flow = result.get("flow", "QUERY").upper()
            if flow not in ["QUERY", "TRANSFER", "ANALYTICS"]:
                flow = "QUERY"  # Default to QUERY for invalid flow types
                
            # Remove flow from the result to maintain compatibility with existing code
            if "flow" in result:
                del result["flow"]
                
            return result, flow
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response: {content}")
            raise ValueError("Invalid JSON response from OpenAI")
            
    def _create_combined_prompt(self) -> str:
        """
        Create a system prompt for combined module/submodule and flow determination.
        Includes detailed entity extraction guidance for all available modules.
        Enhances entity extraction by using allowed values when appropriate.
        """
        modules_info = []
        entity_extraction_guides = []
        
        # Add detailed entity extraction guide for all modules
        for module_code, module_data in self.module_mappings.items():
            # Process module information for the available modules section
            submodules = []
            for submodule in module_data['submodules']:
                if isinstance(submodule, dict) and 'submoduleName' in submodule and 'submoduleCode' in submodule:
                    submodules.append(f"    - {submodule['submoduleName']} ({submodule['submoduleCode']})")
            
            modules_info.append(
                f"   - {module_data['moduleName']} ({module_code}):\n" + 
                "\n".join(submodules)
            )
            
            # Extract entity information for this module
            module_properties = module_data.get("properties", {})
            if module_properties:
                entity_details = []
                for prop_name, prop_data in module_properties.items():
                    prop_type = prop_data.get("type", "string")
                    prop_desc = prop_data.get("description", "")
                    enum_values = prop_data.get("enum", [])
                    
                    prop_info = f"- {prop_name}: {prop_desc} (type: {prop_type})"
                    if enum_values:
                        prop_info += f", allowed values: [{', '.join(str(v) for v in enum_values)}]"
                    entity_details.append(prop_info)
                
                if entity_details:
                    module_guide = f"\nFor {module_data['moduleName']} ({module_code}) module, extract these specific entities when present:\n"
                    module_guide += "\n".join(entity_details)
                    entity_extraction_guides.append(module_guide)
        
        # Add Analytics-specific guidance
        analytics_guide = """
For ANALYTICS module, pay special attention to:

1. Analytics Submodules:
   - ANALYTICS_SPENDING: For spending analysis, expense trends, spending by category/merchant (e.g., "show my spending trends", "analyze my expenses")
   - ANALYTICS_INCOME: For income analysis and income trends (e.g., "show my income analysis", "income trends")
   - ANALYTICS_TRANSACTIONS: For transaction analysis, statements, activity (e.g., "show my transactions", "analyze my recent activity")
   - ANALYTICS_BUDGET: For budget tracking and planning (e.g., "how am I doing on my budget", "budget analysis")
   - ANALYTICS_INVESTMENT: For investment performance (e.g., "show my investment performance", "analyze my portfolio")

2. Analytics-specific entities:
   - year: When a specific year is mentioned (e.g., "2024" in "spending for 2024")
   - month: When a specific month is mentioned (e.g., "January", "Jan", "01")
   - quarter: For quarterly analysis (e.g., "Q1", "Q2", "first quarter")
   - period: For relative time periods (e.g., "last month", "past quarter", "year to date")
   - category: For specific spending categories (e.g., "groceries", "entertainment")
   - comparison: For comparative analysis (e.g., "compare", "versus", "vs")
   - visualization: For specific visualization requests (e.g., "pie chart", "bar graph", "table")
   - distributionType: For distribution analysis (e.g., "category", "amount_range", "time_of_day", "day_of_week", "transaction_type", "merchant", "location", "month")
   - amountRangeBuckets: The specific amount ranges for grouping transactions (e.g., ["0-50", "51-100", "101-500", "500+"])
   - timeOfDayRanges: The specific time ranges for grouping transactions (e.g., ["morning", "afternoon", "evening", "night"])

3. Flow Determination:
   - ALWAYS use ANALYTICS flow (not QUERY) when the user asks for:
     - Any trends or patterns (e.g., "spending trends", "income patterns")
     - Distribution analysis (e.g., "distribution of expenses")
     - Comparative analysis (e.g., "compare spending across categories")
     - Performance metrics (e.g., "budget performance", "investment performance")
     - Insights or summaries (e.g., "insights on my spending", "financial summary")
     - Visual representations (e.g., "show me a chart of", "graph my spending")
     
4. For distribution analysis with pie charts, extract these additional entities when appropriate:
   - distributionType: The type of distribution to analyze (category, amount_range, time_of_day, day_of_week, etc.)
   - When user mentions "pie chart of spending by category" → distributionType="category"
   - When user mentions "distribution of transactions by amount" → distributionType="amount_range"
   - When user mentions "breakdown of spending by time of day" → distributionType="time_of_day"
   - When user mentions "transactions by day of week" → distributionType="day_of_week"
"""

        # Add Transfer-specific guidance
        transfer_guide = """
For TRANSFER module (TRF), pay special attention to:

1. Always use consistent entity names:
   - For recipient/beneficiary information, always use "beneficiaryName" as the entity name
   - For amount, use "amount" as the entity name
   - For currency, use "currency" as the entity name when explicitly mentioned
   - For account types, use "sourceAccountType" and "targetAccountType"

2. When processing transfer commands like:
   - "Transfer $100 to John Smith" → use entities: {"amount": "100", "beneficiaryName": "John Smith", "currency": "USD"}
   - "Send 500 euros to Alice Johnson" → use entities: {"amount": "500", "beneficiaryName": "Alice Johnson", "currency": "EUR"}
   
3. Never use "recipientName" - always use "beneficiaryName" instead for consistency
"""

        # Combine all entity extraction guides
        entity_extraction_guide = "\n".join(entity_extraction_guides) if entity_extraction_guides else ""
        entity_extraction_guide += analytics_guide
        entity_extraction_guide += transfer_guide
        
        return f"""You are a banking command processor. Your task is to analyze banking commands to identify:
1. The appropriate module and submodule
2. Any relevant entities based on the module properties
3. The flow type (QUERY, TRANSFER, or ANALYTICS)

Available Banking Modules and Submodules:
{chr(10).join(modules_info)}

Flow Types:
- QUERY: Simple information retrieval or basic actions (e.g., "show balance", "check mini statement", "show card details")
- TRANSFER: Financial transactions requiring validations (e.g., "send $100 to John", "pay electricity bill")
- ANALYTICS: Requests involving visualization, insights, or analytics (e.g., "show spending trends", "monthly expense analysis")

{entity_extraction_guide}

Entity Extraction Guidelines:
1. Extract ALL relevant entities explicitly mentioned in the user's query
2. If an entity is implied but not explicitly stated, use context to determine the most appropriate value
3. When an entity type is identified but its exact value is not specified:
   - If the property has allowed values (enum), use the MOST APPROPRIATE value from the allowed list
   - For boolean properties, infer the likely value based on context (true/false)
   - For date-related properties, use appropriate date values in YYYY-MM-DD format
4. Don't include entities that are completely unrelated to the query

For any given command:
1. Identify the most appropriate module from the list above and return the exact module code
2. Select the most suitable submodule within that module and return the exact submodule code
3. Determine the flow type based on the nature of the request
4. Extract ALL relevant entities based on properties of the identified module
5. Be thorough in extracting all possible entities as described above for each module

Return a JSON response with this exact structure:
{{
  "module": "<module_code>",
  "sub_module": {{
    "submoduleCode": "<submodule_code>",
    "submoduleName": "<submodule_name>"
  }},
  "entities": {{
    /* Entity names and values will vary based on the identified module */
    /* Include all relevant entities for the specific module identified */
    /* Use allowed values from property definitions where appropriate */
    /* Only include entities that are relevant to the specific module and query */
  }},
  "flow": "<QUERY, TRANSFER, or ANALYTICS>"
}}

Only return an error object if you absolutely cannot map the command to any module:
{{
  "error": "descriptive error message"
}}

Always extract entities based on the properties of the identified module.
Be generous in interpretation - try to map commands to the closest matching module/submodule.
Provide no additional text outside of the JSON object.
"""
            
    def _create_system_prompt(self) -> str:
        """
        Create the system prompt using actual module mappings.
        This is a legacy method maintained for backward compatibility.
        For actual analysis, _create_combined_prompt is used.
        """
        modules_info = []
        entity_extraction_guides = []
        
        # Add module information
        for module_code, module_data in self.module_mappings.items():
            submodules = []
            for submodule in module_data['submodules']:
                if isinstance(submodule, dict) and 'submoduleName' in submodule and 'submoduleCode' in submodule:
                    submodules.append(f"    - {submodule['submoduleName']} ({submodule['submoduleCode']})")
            
            modules_info.append(
                f"   - {module_data['moduleName']} ({module_code}):\n" + 
                "\n".join(submodules)
            )
            
            # Add entity extraction guide for module
            module_properties = module_data.get("properties", {})
            if module_properties:
                entity_details = []
                for prop_name, prop_data in module_properties.items():
                    entity_details.append(f"    - {prop_name}: {prop_data.get('description', '')}")
                
                if entity_details:
                    module_guide = f"\nFor {module_data['moduleName']} ({module_code}), extract properties like:\n"
                    module_guide += "\n".join(entity_details)
                    entity_extraction_guides.append(module_guide)
        
        # Combine all entity extraction guides
        entity_extraction_guide = "\n".join(entity_extraction_guides) if entity_extraction_guides else ""
            
        return f"""You are a banking command processor. Your task is to analyze banking commands and identify the appropriate module, submodule, and entities.

Available Banking Modules and Submodules:
{chr(10).join(modules_info)}

{entity_extraction_guide}

For any given command:
1. Identify the most appropriate module from the list above and return the exact module code
2. Select the most suitable submodule within that module and return the exact submodule code
3. Extract all relevant entities based on the properties available for the identified module
4. For dates, use appropriate values in YYYY-MM-DD format based on today's date {datetime.now().strftime("%Y-%m-%d")}

Return a JSON response with this exact structure:
{{
  "module": "<module_code>",
  "sub_module": {{
    "submoduleCode": "<submodule_code>",
    "submoduleName": "<submodule_name>"
  }},
  "entities": {{
    /* Include any relevant entities based on the module properties */
    /* The exact entity names will vary based on the identified module */
    /* Include values for properties even if they are implied rather than explicitly stated */
  }}
}}

Only return an error object if you absolutely cannot map the command to any module:
{{
  "error": "descriptive error message"
}}

Be generous in interpretation - try to map commands to the closest matching module/submodule rather than returning errors.
Provide no additional text outside of the JSON object."""

    # Maintain the determine_flow method for backward compatibility, but it will no longer make API calls for QUERY flow
    async def determine_flow(self, text: str, module_code: str) -> str:
        """
        Determine the flow type based on the module code.
        For ACC (Accounts) module with QUERY submodules, returns "QUERY" without making an API call.
        For other flows, make a separate API call for now.
        
        Args:
            text: The input text command
            module_code: The module code identified from the command
            
        Returns:
            str: The determined flow type (QUERY, TRANSFER, or ANALYTICS)
        """
        # For QUERY flow determination without API call
        if module_code == "ACC":
            logger.info(f"ACC module detected - using QUERY flow for '{text}'")
            return "QUERY"
            
        # Fall back to API call for other modules or more complex flows
        try:
            messages = [
                {
                    "role": "system",
                    "content": """You are a banking command classifier. Your task is to classify banking commands into one of three flows:

QUERY: Simple information retrieval or basic actions (e.g., "show balance", "check mini statement", "show card details", "block Card").

TRANSFER: Financial transactions requiring validations and resolutions (e.g., "send $100 to John", "pay electricity bill", "setup auto-pay").

ANALYTICS: Requests involving data visualization, insights, or financial management analytics (e.g., "show spending trends", "monthly expense analysis", "income versus expense chart").

Return ONLY one of these three values: "QUERY", "TRANSFER", or "ANALYTICS".
Do not include any additional text or explanation."""
                },
                {
                    "role": "user",
                    "content": f"Classify this banking command: {text}"
                }
            ]
            
            response = await self.client.chat.completions.create(
                model=self.settings.openai_model,
                messages=messages,
                temperature=0.1,  # Low temperature for consistent results
                max_tokens=10  # We only need a single word response
            )
            
            flow = response.choices[0].message.content.strip().upper()
            logger.info(f"Determined flow for text '{text}': {flow}")
            
            # Validate the response is one of the expected values
            if flow not in ["QUERY", "TRANSFER", "ANALYTICS"]:
                logger.warning(f"Unexpected flow type '{flow}', defaulting to QUERY")
                return "QUERY"
                
            return flow
            
        except Exception as e:
            logger.error(f"Error determining flow: {str(e)}")
            return "QUERY"  # Default to QUERY in case of errors 
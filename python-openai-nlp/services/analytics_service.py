from typing import Dict, Any, List, Optional
import httpx
import logging
from config import Settings
import json
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self):
        self.settings = Settings()
        self.client = httpx.AsyncClient()
        
    async def process_analytics_request(
        self,
        user_id: str,
        nlp_response: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process analytics request from NLP response and return visualization data.
        
        Args:
            user_id: The user ID to fetch analytics for
            nlp_response: Complete NLP response containing intent and context
            
        Returns:
            Processed analytics data with visualization information
        """
        try:
            entities = nlp_response.get("entities", {})
            
            # Validate analytics type
            analytics_type = entities.get("analyticsType")
            
            # Validate visualization type
            viz_type = entities.get("visualizationType")
            
            
            # Get analytics data
            analytics_data = await self.get_analytics_data(user_id, entities, nlp_response)
            
            # Return in the expected resolution format
            return {
                "is_resolved": True,
                "data": analytics_data,
                "questions": None,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error processing analytics request: {str(e)}")
            return {
                "is_resolved": False,
                "error": str(e),
                "questions": None,
                "data": None
            }
            
    def _is_valid_analytics_type(self, analytics_type: str) -> bool:
        """Validate analytics type against hardcoded values."""
        valid_types = ["income", "expenses", "balance"]
        return analytics_type.lower() in [t.lower() for t in valid_types]
        
    def _is_valid_visualization_type(self, viz_type: str) -> bool:
        """Validate visualization type against hardcoded values."""
        valid_types = ["pie chart", "bar chart", "line chart", "table"]
        return viz_type.lower() in [t.lower() for t in valid_types]
        
    def _is_valid_time_period(self, time_period: str) -> bool:
        """Validate the time period format."""
        valid_periods = [
            "last month", "last quarter", "last year",
            "this month", "this quarter", "this year",
            "ytd", "custom"
        ]
        return time_period.lower() in valid_periods

    async def get_analytics_data(self, user_id: str, entities: Dict[str, Any], nlp_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fetch and process analytics data based on NLP entities.
        
        Args:
            user_id: The user ID to fetch analytics for
            entities: Dictionary of extracted entities from NLP
            nlp_response: Complete NLP response containing intent and context
            
        Returns:
            Processed analytics data with visualization information
        """
        try:
            # Construct query parameters from entities
            params = {
                "startDate": entities.get("startDate"),
                "endDate": entities.get("endDate"),
                "transactionType": entities.get("transactionType"),
                "channel": entities.get("channel"),
                "category": entities.get("category"),
                "analyticsType": entities.get("analyticsType"),
                "visualizationType": entities.get("visualizationType"),
                "accountId": entities.get("accountId"),
                "cardId": entities.get("cardId"),
                "beneficiaryId": entities.get("beneficiaryId")
            }
            
            # Remove None values
            params = {k: v for k, v in params.items() if v is not None}
            
            # Call analytics API
            response = await self.client.get(
                f"{self.settings.external_api_base_url}/analytics/{user_id}",
                params=params
            )
            response.raise_for_status()
            analytics_data = response.json()
            
            # Generate visualization data using OpenAI
            visualization_data = await self._generate_visualization_data(
                analytics_data,
                entities.get("analyticsType", ""),
                entities.get("visualizationType", ""),
                nlp_response["raw_text"]
            )
            
            # Add visualization data to response
            analytics_data["visualization"] = visualization_data
            analytics_data.pop("data")
            
            return analytics_data
            
        except Exception as e:
            logger.error(f"Error fetching analytics data: {str(e)}")
            raise
            
    async def _generate_visualization_data(
        self,
        analytics_data: Dict[str, Any],
        analytics_type: str,
        visualization_type: str,
        user_query: str
    ) -> Dict[str, Any]:
        """
        Generate visualization-ready data structure using OpenAI.
        
        Args:
            analytics_data: Raw analytics data from API
            analytics_type: Type of analytics requested
            visualization_type: Type of visualization requested
            user_query: Original user query
            
        Returns:
            Visualization data structure specific to the requested chart type
        """
        client = AsyncOpenAI(api_key=self.settings.openai_api_key)
        
        # Map common visualization type variations
        viz_type_mapping = {
            "line graph": "line",
            "line chart": "line",
            "bar graph": "bar",
            "bar chart": "bar",
            "pie chart": "pie",
            "pie graph": "pie",
            
        }
        
        normalized_viz_type = viz_type_mapping.get(visualization_type.lower(), visualization_type.lower())
        
        # Create a simplified version of analytics data to prevent circular references
        safe_analytics_data = self._create_safe_analytics_data(analytics_data)
        
        prompt = f"""
        Given the following:
        1. User Query: "{user_query}"
        2. Analytics Type: {analytics_type}
        3. Visualization Type: {normalized_viz_type}
        4. Analytics Data: {json.dumps(safe_analytics_data)}

        Generate a visualization configuration JSON object ONLY for a {normalized_viz_type} chart/visualization.
        The configuration should include:
        
        {self._get_chart_specific_requirements(normalized_viz_type)}
        
        Ensure the response includes the following keys:
        - 'xAxis' for the x-axis configuration (Object)
        - 'yAxis' for the y-axis configuration (Object)
        - 'series' for the data series (Array of Objects)
        - data series object should be like  "x" : "2024-01-01", "y" : 100 

        The response should be a valid JSON object that can be directly used for visualization.
        Focus on making the visualization intuitive and informative.
        Include ONLY the configuration needed for a {normalized_viz_type} chart.
        Use default values if necessary to maintain consistency.
        """
        
        try:
            response = await client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a data visualization expert. Generate precise, visualization-ready JSON structures."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            try:
                visualization_data = json.loads(response.choices[0].message.content)
                
                # Validate the generated visualization data
                if not self._is_valid_visualization_data(visualization_data, normalized_viz_type):
                    logger.warning("Generated visualization data failed validation, using fallback")
                    return self._create_fallback_visualization(normalized_viz_type, analytics_type, safe_analytics_data)
                
                return {
                    "type": normalized_viz_type,
                    "config": visualization_data
                }
                
            except json.JSONDecodeError as json_err:
                logger.error(f"Failed to parse OpenAI response: {str(json_err)}")
                return self._create_fallback_visualization(normalized_viz_type, analytics_type, safe_analytics_data)
                
        except Exception as e:
            logger.error(f"Error generating visualization data: {str(e)}")
            return self._create_fallback_visualization(normalized_viz_type, analytics_type, safe_analytics_data)
            
    def _get_chart_specific_requirements(self, chart_type: str) -> str:
        """Get specific configuration requirements based on chart type."""
        requirements = {
            "line": """
                1. X-axis configuration (time series format)
                2. Y-axis configuration with appropriate scale
                3. Data series format with timestamps and values
                4. Line style and color
                5. Point/marker configuration (if needed)
                6. Title and axis labels
                7. Legend configuration (if multiple series)""",
                
            "bar": """
                1. X-axis categories
                2. Y-axis value configuration
                3. Bar colors and styles
                4. Bar width and spacing
                5. Title and axis labels
                6. Legend configuration (if multiple series)""",
                
            "pie": """
                1. Data series with labels and values
                2. Color scheme for segments
                3. Label placement and format
                4. Percentage calculations
                5. Title configuration
                6. Legend configuration""",
                
            # "table": """
            #     1. Column definitions and headers
            #     2. Data formatting rules
            #     3. Sorting configuration
            #     4. Column alignment
            #     5. Header styling
            #     6. Title configuration"""
        }
        return requirements.get(chart_type, "Basic chart configuration requirements")
        
    def _generate_fallback_data(self, chart_type: str, analytics_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate basic fallback visualization data if OpenAI generation fails."""
        if chart_type == "line":
            return {
                "xAxis": {"type": "time"},
                "yAxis": {"type": "value"},
                "series": [{"data": analytics_data.get("monthlyTrends", {})}]
            }
        elif chart_type == "pie":
            return {
                "series": [{"data": analytics_data.get("transactionsByCategory", {})}]
            }
        elif chart_type == "bar":
            return {
                "xAxis": {"type": "category"},
                "yAxis": {"type": "value"},
                "series": [{"data": analytics_data.get("transactionsByType", {})}]
            }
        elif chart_type == "table":
            return {
                "columns": ["Date", "Amount", "Type", "Category"],
                "data": analytics_data.get("data", [])
            }
        return {"data": analytics_data}

    def _create_safe_analytics_data(self, analytics_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a simplified version of analytics data to prevent circular references."""
        safe_data = {}
        
        # Extract only the necessary data for visualization
        if "data" in analytics_data:
            # For raw transaction data, limit to essential fields
            safe_data["data"] = [
                {
                    "date": item.get("date"),
                    "amount": item.get("amount"),
                    "type": item.get("type"),
                    "category": item.get("category")
                }
                for item in analytics_data["data"][:100]  # Limit to 100 items for safety
            ]
        
        # Extract other common analytics fields
        for key in ["monthlyTrends", "transactionsByCategory", "transactionsByType"]:
            if key in analytics_data:
                safe_data[key] = analytics_data[key]
        
        return safe_data

    def _is_valid_visualization_data(self, data: Dict[str, Any], viz_type: str) -> bool:
        """Validate the structure of generated visualization data."""
        try:
            logger.info(f"Validating visualization data for {viz_type}: {data}")
            # Check for xAxes and yAxes and transform them if xAxis or yAxis are missing
            if "xAxes" in data and "xAxis" not in data:
                data["xAxis"] = data.pop("xAxes")
            if "yAxes" in data and "yAxis" not in data:
                data["yAxis"] = data.pop("yAxes")

            logger.info(f"Transformed data: {data}")

            if viz_type == "line":
                is_valid = all(key in data for key in ["xAxis", "yAxis", "series"])
                if not is_valid:
                    logger.info(f"Missing keys in line chart data: {set(['xAxis', 'yAxis', 'series']) - set(data.keys())}")
                return is_valid
            elif viz_type == "bar":
                is_valid = all(key in data for key in ["xAxis", "yAxis", "series"])
                if not is_valid:
                    logger.info(f"Missing keys in bar chart data: {set(['xAxis', 'yAxis', 'series']) - set(data.keys())}")
                return is_valid
            elif viz_type == "pie":
                return "series" in data and isinstance(data["series"], list)
            elif viz_type == "table":
                return "columns" in data and "data" in data
            return False
        except Exception as e:
            logger.error(f"Error validating visualization data: {str(e)}")
            return False

    def _create_fallback_visualization(
        self,
        viz_type: str,
        analytics_type: str,
        analytics_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a standardized fallback visualization structure."""
        title = f"{analytics_type.capitalize()} Analytics"
        
        if viz_type == "line":
            return {
                "type": viz_type,
                "config": {
                    "title": {"text": title},
                    "xAxis": {
                        "type": "time",
                        "name": "Date"
                    },
                    "yAxis": {
                        "type": "value",
                        "name": "Amount"
                    },
                    "series": [{
                        "name": analytics_type,
                        "type": "line",
                        "data": analytics_data.get("monthlyTrends", [])
                    }]
                }
            }
        elif viz_type == "bar":
            return {
                "type": viz_type,
                "config": {
                    "title": {"text": title},
                    "xAxis": {
                        "type": "category",
                        "data": list(analytics_data.get("transactionsByType", {}).keys())
                    },
                    "yAxis": {
                        "type": "value"
                    },
                    "series": [{
                        "name": analytics_type,
                        "type": "bar",
                        "data": list(analytics_data.get("transactionsByType", {}).values())
                    }]
                }
            }
        elif viz_type == "pie":
            categories = analytics_data.get("transactionsByCategory", {})
            return {
                "type": viz_type,
                "config": {
                    "title": {"text": title},
                    "series": [{
                        "type": "pie",
                        "data": [
                            {"name": k, "value": v}
                            for k, v in categories.items()
                        ]
                    }]
                }
            }
        elif viz_type == "table":
            return {
                "type": viz_type,
                "config": {
                    "title": {"text": title},
                    "columns": [
                        {"title": "Date", "field": "date"},
                        {"title": "Amount", "field": "amount"},
                        {"title": "Type", "field": "type"},
                        {"title": "Category", "field": "category"}
                    ],
                    "data": analytics_data.get("data", [])
                }
            }
        
        # Generic fallback if type is not recognized
        return {
            "type": "table",
            "config": {
                "title": {"text": title},
                "columns": [{"title": "Data", "field": "data"}],
                "data": analytics_data
            }
        } 
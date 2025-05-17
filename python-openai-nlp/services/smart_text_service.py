from typing import Dict, Any, Optional, List
import json
import logging
import os
from datetime import datetime
from services.nlp_service import NLPService
from services.request_validator_service import RequestValidatorService
from services.transfer_service import TransferService
from services.analytics_service import AnalyticsService
from services.query_service import process_text, NLPResponse, TextCommand
from models.smart_text_models import (
    Module, SubModule, ValidationResult, ResolutionResult,
    SmartResponseContent, CardEntity
)
from config import Settings
from openai import AsyncOpenAI
import httpx

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

class SmartTextService:
    def __init__(self):
        self.settings = Settings()
        self.nlp_service = NLPService()
        self.validator_service = RequestValidatorService()
        
        self.transfer_service = TransferService()
        self.analytics_service = AnalyticsService()
        self.context_file = "data/conversation_context.json"
        self.client = AsyncOpenAI(
            api_key=self.settings.openai_api_key,
            http_client=httpx.AsyncClient()
        )
        self.api_client = httpx.AsyncClient(base_url=self.settings.external_api_base_url)
        self.current_user_id = None
        
        # Create data directory if it doesn't exist
        os.makedirs(os.path.dirname(self.context_file), exist_ok=True)
        
    async def process_smart_text(self, user_id: str, raw_text: str, is_new_session: bool) -> Dict[str, Any]:
        """Process user text with context awareness and generate smart responses."""
        try:
            # Store the current user_id for API calls
            self.current_user_id = user_id
            
            # 1. Context Retrieval (if needed)
            previous_context = None
            if not is_new_session:
                previous_context = self._get_conversation_context(user_id)
            
            # 2. NLP Analysis
            nlp_result = None
            flow_type = None
            try:
                nlp_response_object = await process_text(TextCommand(text=raw_text, user_id=user_id))
                # Convert NLPResponse object to dict format expected by rest of code
                nlp_result = {
                    "module": nlp_response_object.module.model_dump(),
                    "sub_module": nlp_response_object.sub_module.model_dump(),
                    "entities": nlp_response_object.entities,
                    "error": nlp_response_object.error
                }
                if nlp_result["error"] is not None:
                    return self._create_error_response(
                        raw_text=raw_text,
                        error_msg="Could not determine module/submodule",
                        user_message="Sorry, I couldn't understand your request clearly. Could you please rephrase?",
                        nlp_result=nlp_result
                    )
                
                # Determine flow type
                flow_type = await self.nlp_service.determine_flow(raw_text, nlp_result["module"]["moduleCode"])
                
                # Check if flow type is TRANSFER and return graceful message
                if flow_type == "TRANSFER":
                    return self._create_error_response(
                        raw_text=raw_text,
                        error_msg="Transfer functionality not available in smart mode",
                        user_message="I apologize, but I cannot process transfer requests at the moment. Please use the regular transfer feature in the app to make your transaction.",
                        nlp_result=nlp_result,
                        flow_type=flow_type
                    )
            except Exception as e:
                logger.error(f"Error in NLP analysis: {str(e)}")
                return self._create_error_response(
                    raw_text=raw_text,
                    error_msg=f"NLP analysis failed: {str(e)}",
                    user_message="I'm having trouble understanding your request. Could you try rephrasing it?",
                    nlp_result=nlp_result,
                    flow_type=flow_type
                )
            
            # 3. Data Retrieval based on flow type
            api_data = {}
            try:
                # Skip API call for ANALYTICS flow and use NLP response data
                if flow_type == "ANALYTICS":
                    api_data = nlp_result.get("resolution", {})
                    logger.info("Using NLP response data for analytics flow")
                else:
                    api_data = await self._get_api_data(flow_type, nlp_result)
                    if "error" in api_data:
                        logger.error(f"API error: {api_data['error']}")
                        return self._create_error_response(
                            raw_text=raw_text,
                            error_msg=api_data["error"],
                            user_message="I apologize, but I encountered an error while processing your request. Please try again later.",
                            nlp_result=nlp_result,
                            flow_type=flow_type
                        )
            except Exception as e:
                logger.error(f"Error in API data retrieval: {str(e)}")
                return self._create_error_response(
                    raw_text=raw_text,
                    error_msg=f"API data retrieval failed: {str(e)}",
                    user_message="I'm having trouble fetching the required information. Please try again later.",
                    nlp_result=nlp_result,
                    flow_type=flow_type
                )
            
            # 4. Create validation and resolution results
            validation_result = ValidationResult(
                is_complete=True,
                missing_parameters=[],
                questions=None
            )
            
            resolution_result = ResolutionResult(
                is_resolved=True,
                resolution_parameters=[],
                questions=None
            )
            
            # 5. Generate smart response
            try:
                smart_response = await self._generate_smart_response(
                    raw_text=raw_text,
                    nlp_result=nlp_result,
                    api_data=api_data,
                    previous_context=previous_context
                )
            except Exception as e:
                logger.error(f"Error generating smart response: {str(e)}")
                return self._create_error_response(
                    raw_text=raw_text,
                    error_msg=f"Smart response generation failed: {str(e)}",
                    user_message="I understand your request but am having trouble formulating a response. Please try again.",
                    nlp_result=nlp_result,
                    flow_type=flow_type
                )
            
            # 6. Context Storage
            current_context = {
                "timestamp": datetime.now().isoformat(),
                "raw_text": raw_text,
                "response": smart_response
            }
            self._save_conversation_context(user_id, current_context)
            
            # 7. Create success response
            return {
                "module": Module(**nlp_result["module"]),
                "sub_module": SubModule(**nlp_result["sub_module"]),
                "flow": flow_type,
                "entities": nlp_result["entities"],
                "validation": validation_result,
                "resolution": resolution_result,
                "raw_text": raw_text,
                "smart_response": smart_response,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error processing smart text: {str(e)}")
            return self._create_error_response(
                raw_text=raw_text,
                error_msg=str(e),
                user_message="I apologize, but something went wrong. Please try again.",
                nlp_result=nlp_result if 'nlp_result' in locals() else None,
                flow_type=flow_type if 'flow_type' in locals() else None
            )
    
    def _create_error_response(
        self, 
        raw_text: str, 
        error_msg: str, 
        user_message: str,
        nlp_result: Optional[Dict[str, Any]] = None,
        flow_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a standardized error response while preserving any available information.
        
        Args:
            raw_text: The original user query
            error_msg: Technical error message
            user_message: User-friendly error message
            nlp_result: NLP analysis result if available
            flow_type: Determined flow type if available
        """
        response = {
            "module": None,
            "sub_module": None,
            "flow": None,
            "entities": None,
            "validation": None,
            "resolution": None,
            "raw_text": raw_text,
            "smart_response": SmartResponseContent(
                type="text",
                content=user_message,
                entities=None
            ),
            "error": error_msg
        }
        
        # Preserve any available information from NLP result
        if nlp_result:
            if "module" in nlp_result and nlp_result["module"]:
                try:
                    response["module"] = Module(**nlp_result["module"])
                except Exception:
                    pass
                    
            if "sub_module" in nlp_result and nlp_result["sub_module"]:
                try:
                    response["sub_module"] = SubModule(**nlp_result["sub_module"])
                except Exception:
                    pass
                    
            if "entities" in nlp_result and nlp_result["entities"]:
                response["entities"] = nlp_result["entities"]
        
        # Preserve flow type if available
        if flow_type:
            response["flow"] = flow_type
            
        return response
    
    async def _get_api_data(self, flow_type: str, nlp_result: Dict[str, Any]) -> Dict[str, Any]:
        """Get data from appropriate backend APIs based on flow type and NLP result."""
        try:
            # Extract module and submodule codes
            module_code = nlp_result["module"]["moduleCode"]
            submodule = nlp_result["sub_module"]
            
            if not module_code or not submodule:
                raise ValueError("Missing module or submodule in NLP result")
            
            # Get endpoint from submodule if available, otherwise construct it
            endpoint = submodule.get("endpoint")
            if not endpoint:
                endpoint = f"/{module_code.lower()}/{submodule['submoduleCode'].lower()}"
            
            # Add query parameters based on extracted entities
            params = {}
            for key, value in nlp_result.get("entities", {}).items():
                if value is not None:
                    params[key] = value
            
            # Process URL parameters (e.g., :userId)
            url_params = {}
            parts = endpoint.split('/')
            processed_parts = []
            
            for part in parts:
                if part.startswith(':'):
                    param_name = part[1:]  # Remove the : prefix
                    if param_name == 'userId':
                        # Handle userId from the request context
                        url_params[param_name] = self.current_user_id
                    else:
                        # Check if the parameter exists in entities
                        param_value = nlp_result.get("entities", {}).get(param_name)
                        if param_value:
                            url_params[param_name] = param_value
                        else:
                            logger.warning(f"Missing URL parameter: {param_name}")
                            url_params[param_name] = ''
                    processed_parts.append(url_params[param_name])
                else:
                    processed_parts.append(part)
            
            # Reconstruct the endpoint with replaced parameters
            processed_endpoint = '/'.join(p for p in processed_parts if p)
            
            # Make the API call
            logger.info(f"Making API call to endpoint: {processed_endpoint} with params: {params}")
            response = await self.api_client.get(processed_endpoint, params=params)
            response.raise_for_status()
            
            api_data = response.json()
            logger.info(f"Received API response: {api_data}")
            
            # Check if the response has the expected structure
            # if not isinstance(api_data, dict):
            #     raise ValueError("Invalid API response format")
            
            # return api_data.get("data", api_data)
            return api_data
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred: {str(e)}")
            return {
                "error": f"API request failed: {str(e)}",
                "status_code": e.response.status_code
            }
        except Exception as e:
            logger.error(f"Error getting API data: {str(e)}")
            return {"error": str(e)}
    
    async def _generate_smart_response(
        self,
        raw_text: str,
        nlp_result: Dict[str, Any],
        api_data: Dict[str, Any],
        previous_context: Optional[Dict[str, Any]] = None
    ) -> SmartResponseContent:
        """Generate a conversational smart response using OpenAI."""
        try:
            # Create context-aware prompt
            context_text = ""
            if previous_context:
                context_text = f"""Previous interaction:
User: {previous_context['raw_text']}
Assistant: {previous_context['response']}

"""
            
            messages = [
                {
                    "role": "system",
                    "content": """You are an intelligent banking assistant. Generate structured responses for banking queries.
                    For card-related queries, include card details in a structured format.
                    Return responses in a clear, professional yet friendly tone.
                    Include specific details from the API data when available."""
                },
                {
                    "role": "user",
                    "content": f"""{context_text}Current user query: {raw_text}

Available information:
Module: {nlp_result['module']['moduleName']}
Submodule: {nlp_result['sub_module'].get('submoduleName', 'N/A')}
Extracted Entities: {json.dumps(nlp_result['entities'], indent=2)}
API Data: {json.dumps(api_data, indent=2)}

Generate a natural, conversational response that addresses the user's query while incorporating this information.
For card-related queries, format the response with markdown for better readability."""
                }
            ]
            
            response = await self.client.chat.completions.create(
                model=self.settings.openai_model,
                messages=messages,
                temperature=0.7,
                max_tokens=200
            )
            
            content = response.choices[0].message.content.strip()
            
            # For card-related queries, try to extract structured data
            if nlp_result["module"]["moduleCode"] == "CARD":
                return self._create_card_response(content, api_data)
            
            # For other queries, return text response
            return SmartResponseContent(
                type="text",
                content=content,
                entities=None
            )
            
        except Exception as e:
            logger.error(f"Error generating smart response: {str(e)}")
            return SmartResponseContent(
                type="text",
                content=f"I apologize, but I encountered an error while processing your request. {str(e)}",
                entities=None
            )
    
    def _create_card_response(self, content: str, api_data: Dict[str, Any]) -> SmartResponseContent:
        """Create a structured response for card-related queries."""
        try:
            # Extract card entities from API data
            card_entities: List[CardEntity] = []
            if "cards" in api_data:
                for card in api_data["cards"]:
                    card_entities.append(CardEntity(
                        card_name=card["name"],
                        card_number=card["masked_number"],
                        status=card["status"],
                        limit=float(card["limit"]),
                        usage_percent=float(card["usage_percent"])
                    ))
            
            return SmartResponseContent(
                type="structured_message",
                content=content,
                entities=card_entities if card_entities else None
            )
        except Exception as e:
            logger.error(f"Error creating card response: {str(e)}")
            return SmartResponseContent(
                type="text",
                content=content,
                entities=None
            )
    
    def _get_conversation_context(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve previous conversation context from file storage."""
        try:
            if os.path.exists(self.context_file):
                try:
                    with open(self.context_file, 'r', encoding='utf-8') as f:
                        contexts = json.load(f)
                        return contexts.get(user_id)
                except json.JSONDecodeError:
                    logger.warning("Invalid JSON in context file. Creating new context file.")
                    # If JSON is invalid, create a new empty context file
                    with open(self.context_file, 'w', encoding='utf-8') as f:
                        json.dump({}, f)
                    return None
            return None
        except Exception as e:
            logger.error(f"Error reading conversation context: {str(e)}")
            return None
    
    def _save_conversation_context(self, user_id: str, context: Dict[str, Any]):
        """Save current conversation context to file storage."""
        try:
            contexts = {}
            if os.path.exists(self.context_file):
                try:
                    with open(self.context_file, 'r', encoding='utf-8') as f:
                        contexts = json.load(f)
                except json.JSONDecodeError:
                    logger.warning("Invalid JSON in context file. Starting with empty context.")
                    contexts = {}
            
            # Ensure the context is JSON serializable
            context_copy = {
                "timestamp": context["timestamp"],
                "raw_text": context["raw_text"],
                "response": context["response"].model_dump() if hasattr(context["response"], "model_dump") else context["response"]
            }
            
            contexts[user_id] = context_copy
            
            # Write with proper encoding and formatting
            with open(self.context_file, 'w', encoding='utf-8') as f:
                json.dump(contexts, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            logger.error(f"Error saving conversation context: {str(e)}") 
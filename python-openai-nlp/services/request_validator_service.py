from typing import Dict, Any, List, Optional
import httpx
import logging
from config import Settings
import json
from openai import AsyncOpenAI
import os

logger = logging.getLogger(__name__)

class RequestValidatorService:
    def __init__(self):
        self.settings = Settings()
        self.base_url = self.settings.external_api_base_url
        self.client = httpx.AsyncClient()
        # Load module mappings to use local data instead of API calls
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
                        'submodules': module_data.get('submodules', []),
                        'properties': module_data.get('properties', {})
                    }
            return mappings
        except Exception as e:
            logger.error(f"Error loading module mappings: {str(e)}")
            return {}
        
    async def validate_and_get_questions(
        self, 
        module_code: str, 
        submodule_code: str, 
        raw_text: str
    ) -> Dict[str, Any]:
        """
        Extract entities and validate against required parameters.
        Uses local mapping data for any module if available to avoid external API calls.
        
        Args:
            module_code: The module code (e.g., 'ACC', 'TRF')
            submodule_code: The submodule code (e.g., 'ACC_TYPE', 'TRF_INTERNAL')
            raw_text: The original text command
            
        Returns:
            Dict containing validation results, entities, and any necessary clarifying questions
        """
        try:
            # Check if we have local data for this module
            if module_code in self.module_mappings and 'properties' in self.module_mappings[module_code]:
                logger.info(f"Using local data for {module_code}/{submodule_code}")
                # Create a schema from the properties in the mapping json file
                properties = self.module_mappings[module_code].get('properties', {})
                schema = {
                    "properties": properties,
                    "required": []  # We don't enforce required parameters when using local data
                }
            else:
                # For modules without local data, use the external API
                logger.info(f"Using API for {module_code}/{submodule_code} - no local data available")
                try:
                    response = await self.client.post(
                        f"{self.base_url}/common/request-format",
                        json={
                            "moduleCode": module_code,
                            "submoduleCode": submodule_code
                        }
                    )
                    response.raise_for_status()
                    schema = response.json().get("data")
                except Exception as e:
                    logger.error(f"API call failed, using empty schema: {str(e)}")
                    schema = {"properties": {}, "required": []}

            logger.info(f"Schema: {schema}")
            if schema is None:
                return {
                    "entities": {},
                    "validation": {
                        "is_complete": True,
                        "missing_parameters": [],   
                        "questions": None
                    }
                }
                
            # Extract mandatory parameters from JSON schema
            mandatory_params = self._get_mandatory_parameters(schema)
            
            # Extract entities from raw text based on schema properties
            entities = await self._extract_entities(raw_text, schema)
            
            # Check which mandatory parameters are missing
            missing_params = self._get_missing_parameters(mandatory_params, entities)
            
            # Generate questions for missing parameters
            questions = self._generate_questions(missing_params)
            
            # Add default values for optional parameters if not provided
            entities = self._add_default_values(entities, schema)
            
            validation_result = {
                "is_complete": len(missing_params) == 0,
                "missing_parameters": missing_params,
                "questions": questions if questions else None
            }
            
            return {
                "entities": entities,
                "validation": validation_result
            }
            
        except Exception as e:
            logger.error(f"Error validating request: {str(e)}")
            # Return empty result on error
            return {
                "entities": {},
                "validation": {
                    "is_complete": True,
                    "missing_parameters": [],
                    "questions": None
                }
            }
            
    def _get_mandatory_parameters(self, schema: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract mandatory parameters from JSON schema."""
        mandatory = []
        required_fields = schema.get("required", [])
        properties = schema.get("properties", {})
        
        for field_name in required_fields:
            if field_name in properties:
                field_schema = properties[field_name]
                mandatory.append({
                    "name": field_name,
                    "type": field_schema.get("type", "string"),
                    "description": field_schema.get("description", ""),
                    "validation": {
                        "enum": field_schema.get("enum", []),
                        "minimum": field_schema.get("minimum"),
                        "maximum": field_schema.get("maximum"),
                        "pattern": field_schema.get("pattern")
                    }
                })
                
        return mandatory
        
    async def _extract_entities(self, raw_text: str, schema: Dict[str, Any]) -> Dict[str, Any]:
        """Extract entities from raw text based on JSON schema properties."""
        try:
            client = AsyncOpenAI(
                api_key=self.settings.openai_api_key,
                http_client=httpx.AsyncClient()
            )
            
            # Create a prompt that includes property information from schema
            properties = schema.get("properties", {})
            param_info = []
            for name, prop in properties.items():
                description = prop.get("description", "")
                param_type = prop.get("type", "string")
                enum_values = prop.get("enum", [])
                min_val = prop.get("minimum")
                max_val = prop.get("maximum")
                
                info = f"- {name} ({param_type}): {description}"
                if enum_values:
                    info += f" [Allowed values: {', '.join(map(str, enum_values))}]"
                if min_val is not None or max_val is not None:
                    info += f" [Range: {min_val or 'any'} to {max_val or 'any'}]"
                    
                param_info.append(info)
            
            messages = [
                {
                    "role": "system",
                    "content": f"""Extract parameter values from the text based on these parameters:
{chr(10).join(param_info)}

Return ONLY a JSON object with parameter names as keys and extracted values.
- For numbers, return numeric values
- For booleans, return true/false
- For arrays, return an array of values
- If a parameter value is not found in the text, omit it from the response
- Respect any enum values or ranges specified"""
                },
                {
                    "role": "user",
                    "content": raw_text
                }
            ]
            
            response = await client.chat.completions.create(
                model=self.settings.openai_model,
                messages=messages,
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error extracting entities: {str(e)}")
            return {}
            
    def _get_missing_parameters(
        self, 
        mandatory_params: List[Dict[str, Any]], 
        entities: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Identify which mandatory parameters are missing from the entities."""
        missing = []
        
        for param in mandatory_params:
            param_name = param["name"]
            if param_name not in entities:
                missing.append(param)
                
        return missing
        
    def _generate_questions(self, missing_params: List[Dict[str, Any]]) -> Optional[List[Dict[str, str]]]:
        """Generate clarifying questions for missing parameters."""
        if not missing_params:
            return None
            
        questions = []
        for param in missing_params:
            question = {
                "parameter": param["name"],
                "question": self._create_question(param)
            }
            questions.append(question)
            
        return questions
        
    def _create_question(self, param: Dict[str, Any]) -> str:
        """Create a natural language question for the missing parameter."""
        param_name = param["name"]
        param_type = param["type"]
        description = param["description"]
        validation = param["validation"]
        
        base_question = f"Please provide the {description or param_name}"
        
        if validation.get("enum"):
            options = ", ".join(map(str, validation["enum"]))
            return f"{base_question}. Choose from: {options}"
        elif validation.get("minimum") is not None and validation.get("maximum") is not None:
            return f"{base_question} (between {validation['minimum']} and {validation['maximum']})"
        elif param_type == "boolean":
            return f"{base_question} (yes/no)"
        elif param_type == "array":
            return f"{base_question} (provide a list)"
            
        return base_question
        
    def _add_default_values(self, entities: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        """Add default values for optional parameters if not provided."""
        properties = schema.get("properties", {})
        
        for name, prop in properties.items():
            if name not in entities and "default" in prop:
                entities[name] = prop["default"]
                
        return entities 
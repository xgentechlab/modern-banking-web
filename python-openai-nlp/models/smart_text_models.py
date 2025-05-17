from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Literal

class Module(BaseModel):
    moduleCode: str
    moduleName: str

class SubModule(BaseModel):
    submoduleCode: str
    submoduleName: str
    endpoint: Optional[str] = None
    requestFile: Optional[str] = None

class ValidationResult(BaseModel):
    is_complete: bool
    missing_parameters: List[str]
    questions: Optional[Any] = None

class ResolutionResult(BaseModel):
    is_resolved: bool
    resolution_parameters: List[Any]
    questions: Optional[Any] = None

class CardEntity(BaseModel):
    card_name: str
    card_number: str
    status: str
    limit: float
    usage_percent: float

class SmartResponseContent(BaseModel):
    type: Literal["text", "structured_message"]
    content: str
    entities: Optional[List[CardEntity]] = None

class SmartTextRequest(BaseModel):
    user_id: str
    text: str
    is_new_session: bool = Field(alias="is_new", default=False)

class SmartTextResponse(BaseModel):
    module: Optional[Module] = None
    sub_module: Optional[SubModule] = None
    flow: Optional[str] = None
    entities: Optional[Dict[str, Any]] = None
    validation: Optional[ValidationResult] = None
    resolution: Optional[ResolutionResult] = None
    raw_text: str
    smart_response: Optional[SmartResponseContent] = None
    error: Optional[str] = None 
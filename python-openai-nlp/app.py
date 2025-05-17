from fastapi import FastAPI
from typing import Union

from services.query_service import process_text, NLPResponse, TextCommand, SimplifiedNLPResponse
from services.smart_text_service import SmartTextService
from models.smart_text_models import SmartTextRequest, SmartTextResponse
from config import Settings
import logging
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Banking NLP Service",
    description="A service that processes natural language commands",
    version="1.0.0"
)

# Initialize settings and services
settings = Settings()
smart_text_service = SmartTextService()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process-text", response_model=Union[NLPResponse, SimplifiedNLPResponse])
async def process_text_endpoint(command: TextCommand):
    """
    Process a natural language text command and return structured response.
    For QUERY flow, a simplified response format is returned to reduce response time.
    """
    return await process_text(command)

@app.post("/process-smart-text", response_model=SmartTextResponse)
async def process_smart_text_endpoint(request: SmartTextRequest):
    """
    Process a natural language query with context awareness and smart response generation.
    
    Args:
        request: SmartTextRequest containing user_id, raw_text, and is_new_session flag
        
    Returns:
        SmartTextResponse containing processed data and conversational response
    """
    return await smart_text_service.process_smart_text(
        user_id=request.user_id,
        raw_text=request.text,
        is_new_session=request.is_new_session == "true"
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
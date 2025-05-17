from typing import Dict, Any, List, Optional
import httpx
import logging
from config import Settings
import json
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class TransferService:
    def __init__(self):
        self.settings = Settings()
        self.client = httpx.AsyncClient()
        
    async def resolve_transfer_entities(
        self, 
        entities: Dict[str, Any],
        module_code: str,
        submodule_code: str
    ) -> Dict[str, Any]:
        """
        Resolve transfer-specific entities like beneficiary details, account numbers, etc.
        
        Args:
            entities: Dictionary of extracted entities
            module_code: The module code (e.g., 'TRF')
            submodule_code: The submodule code (e.g., 'TRF_INTERNAL')
            
        Returns:
            Dict containing resolution results and any necessary clarifying questions
        """
        try:
            resolution_parameters = []
            questions = []
            
            # Example: Resolve beneficiary if present
            if "toAccountId" in entities:
                beneficiary_matches = await self._fetch_beneficiary_matches(entities["toAccountId"])
                if beneficiary_matches:
                    resolution_parameters.append({
                        "name": "toAccountId",
                        "possible_matches": [
                            {
                                "identifier": match["id"],
                                "description": match["name"]
                            }
                            for match in beneficiary_matches
                        ]
                    })
                    if len(beneficiary_matches) > 1:
                        questions.append({
                            "parameter": "toAccountId",
                            "question": f"I found multiple matches for {entities['toAccountId']}. Which one did you mean?"
                        })
                        
            # Example: Resolve account if present
            if "account" in entities:
                account_matches = await self._fetch_account_matches(entities["account"])
                if account_matches:
                    resolution_parameters.append({
                        "name": "account",
                        "possible_matches": [
                            {
                                "identifier": match["id"],
                                "description": match["name"]
                            }
                            for match in account_matches
                        ]
                    })
                    if len(account_matches) > 1:
                        questions.append({
                            "parameter": "account",
                            "question": f"I found multiple accounts matching {entities['account']}. Which one would you like to use?"
                        })
            
            return {
                "is_resolved": len(questions) == 0,
                "resolution_parameters": resolution_parameters,
                "questions": questions if questions else None
            }
            
        except Exception as e:
            logger.error(f"Error resolving transfer entities: {str(e)}")
            raise
            
    async def _fetch_beneficiary_matches(self, beneficiary_name: str) -> List[Dict[str, Any]]:
        """Mock function to return beneficiary matches."""
        # Mock data for beneficiaries
        mock_beneficiaries = {
            "john": [
                {"id": "BEN001", "name": "John Smith", "account": "1234567890"},
                {"id": "BEN002", "name": "John Doe", "account": "0987654321"}
            ],
            "mary": [
                {"id": "BEN003", "name": "Mary Johnson", "account": "5555666677"}
            ],
            "dad": [
                {"id": "BEN004", "name": "Robert Wilson", "account": "1111222233", "relationship": "Father"}
            ],
            "mom": [
                {"id": "BEN005", "name": "Sarah Wilson", "account": "4444555566", "relationship": "Mother"}
            ]
        }
        
        # Convert beneficiary name to lowercase for case-insensitive matching
        search_term = beneficiary_name.lower()
        
        # Return matching beneficiaries or empty list
        matches = []
        for key, beneficiaries in mock_beneficiaries.items():
            if search_term in key or any(search_term in ben["name"].lower() for ben in beneficiaries):
                matches.extend(beneficiaries)
                
        return matches
            
    async def _fetch_account_matches(self, account_query: str) -> List[Dict[str, Any]]:
        """Mock function to return account matches."""
        # Mock data for accounts
        mock_accounts = {
            "savings": [
                {"id": "ACC001", "name": "Primary Savings Account", "type": "SAVINGS", "balance": "5000.00"},
                {"id": "ACC002", "name": "Holiday Savings Account", "type": "SAVINGS", "balance": "2500.00"}
            ],
            "checking": [
                {"id": "ACC003", "name": "Primary Checking Account", "type": "CHECKING", "balance": "3000.00"}
            ],
            "credit": [
                {"id": "ACC004", "name": "Platinum Credit Card", "type": "CREDIT", "limit": "10000.00"},
                {"id": "ACC005", "name": "Rewards Credit Card", "type": "CREDIT", "limit": "5000.00"}
            ],
            "investment": [
                {"id": "ACC006", "name": "Investment Portfolio", "type": "INVESTMENT", "value": "25000.00"}
            ]
        }
        
        # Convert account query to lowercase for case-insensitive matching
        search_term = account_query.lower()
        
        # Return matching accounts or empty list
        matches = []
        for key, accounts in mock_accounts.items():
            if search_term in key or any(search_term in acc["name"].lower() for acc in accounts):
                matches.extend(accounts)
                
        return matches 
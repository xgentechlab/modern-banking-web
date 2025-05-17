import asyncio
import time
import json
from services.query_service import process_text, TextCommand
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_transfer_optimization():
    """
    Test the optimized TRANSFER flow with a simplified response format.
    Verifies that:
    1. Module and submodule are correctly determined
    2. Entities like amount, recipient, and currency are correctly extracted
    3. The response uses the simplified format
    """
    print("\n==== TESTING OPTIMIZED TRANSFER FLOW ====\n")
    
    # Test queries for different transfer scenarios
    test_queries = [
        {
            "text": "transfer $100 to John Smith", 
            "expected_module": "TRF",
            "expected_submodule": "TRF_IMMEDIATE",
            "expected_entities": ["amount", "recipient", "currency"],  # Generic recipient entity
            "recipient_variations": ["recipientName", "beneficiaryName"],  # Accept either name
            "expected_amount": 100,
            "expected_currency": "USD"
        },
        {
            "text": "send 500 euros to Alice Johnson", 
            "expected_module": "TRF",
            "expected_submodule": "TRF_IMMEDIATE",
            "expected_entities": ["amount", "recipient", "currency"],  # Generic recipient entity
            "recipient_variations": ["recipientName", "beneficiaryName"],  # Accept either name
            "expected_amount": 500,
            "expected_currency": "EUR"
        },
        {
            "text": "pay electricity bill of Rs. 2500", 
            "expected_module": "BILL",
            "expected_submodule": "BILL_PAY",
            "expected_entities": ["amount", "billType", "currency"],
            "expected_amount": 2500,
            "expected_currency": "INR"
        }
    ]
    
    results_summary = {
        "total_tests": len(test_queries),
        "successful_module_match": 0,
        "successful_submodule_match": 0,
        "successful_entity_extractions": 0,
        "total_expected_entities": sum(len(q["expected_entities"]) for q in test_queries),
        "avg_response_time": 0,
        "total_time": 0
    }
    
    for i, query_info in enumerate(test_queries):
        query_text = query_info["text"]
        expected_module = query_info["expected_module"]
        expected_submodule = query_info["expected_submodule"]
        expected_entities = query_info["expected_entities"]
        recipient_variations = query_info.get("recipient_variations", [])
        expected_amount = query_info.get("expected_amount")
        expected_currency = query_info.get("expected_currency")
        
        print(f"\n{'='*60}")
        print(f"Test {i+1}: '{query_text}'")
        print(f"Expected module: {expected_module}")
        print(f"Expected submodule: {expected_submodule}")
        print(f"Expected entities: {', '.join(expected_entities) if expected_entities else 'None'}")
        if expected_amount:
            print(f"Expected amount: {expected_amount}")
        if expected_currency:
            print(f"Expected currency: {expected_currency}")
        print(f"{'-'*60}")
        
        # Create command
        query_command = TextCommand(text=query_text, user_id="user123")
        
        # Record start time
        start_time = time.time()
        
        # Process the command
        response = await process_text(query_command)
        
        # Calculate elapsed time
        elapsed_time = time.time() - start_time
        results_summary["total_time"] += elapsed_time
        
        # Display the response time and flow
        print(f"Response time: {elapsed_time:.2f} seconds")
        print(f"Flow type: {response.flow}")
        
        # Basic validations
        if response.flow != "TRANSFER":
            print(f"❌ Flow mismatch: expected TRANSFER, got {response.flow}")
            continue
            
        # Check module matches expected
        actual_module = response.moduleCode if hasattr(response, 'moduleCode') else None
        if actual_module == expected_module:
            print(f"✅ Module matched: {actual_module}")
            results_summary["successful_module_match"] += 1
        else:
            print(f"❌ Module mismatch: expected {expected_module}, got {actual_module}")
            
        # Check submodule matches expected
        actual_submodule = response.submoduleCode if hasattr(response, 'submoduleCode') else None
        if actual_submodule == expected_submodule:
            print(f"✅ Submodule matched: {actual_submodule}")
            results_summary["successful_submodule_match"] += 1
        else:
            print(f"❌ Submodule mismatch: expected {expected_submodule}, got {actual_submodule}")
        
        # Check for simplified response structure
        if hasattr(response, 'moduleCode') and hasattr(response, 'entities'):
            print("\nUsing simplified response format for TRANSFER ✅")
            
            # Check for expected entities
            entity_match_count = 0
            for entity_name in expected_entities:
                # Special handling for recipient entity which can have multiple variations
                if entity_name == "recipient" and recipient_variations:
                    recipient_found = False
                    recipient_value = None
                    
                    for variation in recipient_variations:
                        if variation in response.entities:
                            recipient_found = True
                            recipient_value = response.entities[variation]
                            break
                    
                    if recipient_found:
                        entity_match_count += 1
                        print(f"✅ Found recipient entity as '{variation}' = {recipient_value}")
                    else:
                        print(f"❌ Missing recipient entity (tried {', '.join(recipient_variations)})")
                
                # Standard entity check for other entities
                elif entity_name in response.entities:
                    entity_match_count += 1
                    print(f"✅ Found expected entity: {entity_name} = {response.entities[entity_name]}")
                    
                    # Verify specific entity values if expected
                    if entity_name == "amount" and expected_amount:
                        if float(response.entities[entity_name]) == expected_amount:
                            print(f"✅ Amount value matched: {expected_amount}")
                        else:
                            print(f"❌ Amount value mismatch: expected {expected_amount}, got {response.entities[entity_name]}")
                    
                    if entity_name == "currency" and expected_currency:
                        if response.entities[entity_name] == expected_currency:
                            print(f"✅ Currency value matched: {expected_currency}")
                        else:
                            print(f"❌ Currency value mismatch: expected {expected_currency}, got {response.entities[entity_name]}")
                else:
                    print(f"❌ Missing expected entity: {entity_name}")
            
            results_summary["successful_entity_extractions"] += entity_match_count
            
            # Display all extracted entities
            entity_count = len(response.entities) if response.entities else 0
            print(f"\nAll extracted entities ({entity_count}):")
            if entity_count > 0:
                for name, value in response.entities.items():
                    print(f"  - {name}: {value}")
            else:
                print("  None")
        else:
            print("❌ Not using simplified response format")
            
    # Print summary of results
    print("\n" + "="*60)
    print("SUMMARY OF RESULTS".center(60))
    print("="*60)
    print(f"Total tests: {results_summary['total_tests']}")
    print(f"Successful module matches: {results_summary['successful_module_match']} ({results_summary['successful_module_match']/results_summary['total_tests']*100:.0f}%)")
    print(f"Successful submodule matches: {results_summary['successful_submodule_match']} ({results_summary['successful_submodule_match']/results_summary['total_tests']*100:.0f}%)")
    
    entity_extraction_percentage = 0
    if results_summary['total_expected_entities'] > 0:
        entity_extraction_percentage = results_summary['successful_entity_extractions'] / results_summary['total_expected_entities'] * 100
    print(f"Entity extraction accuracy: {results_summary['successful_entity_extractions']}/{results_summary['total_expected_entities']} ({entity_extraction_percentage:.0f}%)")
    
    results_summary["avg_response_time"] = results_summary["total_time"] / results_summary["total_tests"]
    print(f"Average response time: {results_summary['avg_response_time']:.2f} seconds")
    print(f"Total test execution time: {results_summary['total_time']:.2f} seconds")
    
    print("="*60)
    
    return results_summary 
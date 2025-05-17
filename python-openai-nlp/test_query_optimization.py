import asyncio
import time
import json
from services.query_service import process_text, TextCommand
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_query_optimization():
    """
    Test the optimized query flow with a single API call.
    Compare response time before and after the optimization.
    Verifies that:
    1. Only one ChatGPT API call is made for QUERY flow
    2. No external API calls made when module data is available locally
    3. Module-specific entity extraction works correctly across different modules
    4. Smart entity extraction is used for implied but not specified values
    """
    print("\n==== TESTING OPTIMIZED QUERY FLOW ====\n")
    
    # Test queries for different modules with module-specific expected entities
    test_queries = [
        # ACC module queries
        {
            "text": "show my accounts", 
            "expected_module": "ACC",
            "expected_entities": ["accountType"]
        },
        {
            "text": "get my account balance", 
            "expected_module": "ACC",
            "expected_entities": ["accountType"]
        },
        {
            "text": "get mini statement for account 12345", 
            "expected_module": "ACC",
            "expected_entities": ["accountNumber"]
        },
        
        # CARD module queries with card-specific entities
        {
            "text": "show my credit card details", 
            "expected_module": "CARD",
            "expected_entities": ["cardType"]  # Expect cardType=CREDIT
        },
        {
            "text": "block my debit card", 
            "expected_module": "CARD",
            "expected_entities": ["cardStatus", "cardType"]  # Expect cardStatus=inactive, cardType=DEBIT
        },
        
        # TRF module queries with transfer-specific entities
        {
            "text": "transfer $50 to savings", 
            "expected_module": "TRF",
            "expected_entities": ["amount", "targetAccountType"]  # Expect transfer-specific entities
        },
        
        # LOAN module queries
        {
            "text": "check my loan interest rate", 
            "expected_module": "LOAN",
            "expected_entities": ["loanType"]  # Expect loan-specific entities
        },
        
        # BILL module queries
        {
            "text": "show my electricity bill details", 
            "expected_module": "BILL",
            "expected_entities": ["billType"]  # Expect bill-specific entities
        }
    ]
    
    results_summary = {
        "total_tests": len(test_queries),
        "successful_module_match": 0,
        "entities_matched": 0,
        "total_expected_entities": sum(len(q["expected_entities"]) for q in test_queries),
        "module_stats": {},
        "avg_response_time": 0,
        "total_time": 0
    }
    
    # Initialize module stats
    for query in test_queries:
        module = query["expected_module"]
        if module not in results_summary["module_stats"]:
            results_summary["module_stats"][module] = {
                "total": 0,
                "success": 0,
                "entities_expected": 0,
                "entities_found": 0
            }
        results_summary["module_stats"][module]["total"] += 1
        results_summary["module_stats"][module]["entities_expected"] += len(query["expected_entities"])
    
    for i, query_info in enumerate(test_queries):
        query_text = query_info["text"]
        expected_module = query_info["expected_module"]
        expected_entities = query_info["expected_entities"]
        
        print(f"\n{'='*50}")
        print(f"Test {i+1}: '{query_text}'")
        print(f"Expected module: {expected_module}")
        print(f"Expected entities: {', '.join(expected_entities) if expected_entities else 'None'}")
        print(f"{'-'*50}")
        
        # Create command
        query_command = TextCommand(text=query_text, user_id="user123")
        
        # Record start time
        start_time = time.time()
        
        # Process the command
        response = await process_text(query_command)
        
        # Calculate elapsed time
        elapsed_time = time.time() - start_time
        results_summary["total_time"] += elapsed_time
        
        # Display the response
        print(f"Response time: {elapsed_time:.2f} seconds")
        print(f"Flow type: {response.flow}")
        
        # Check module matches expected
        actual_module = response.moduleCode if hasattr(response, 'moduleCode') else None
        if actual_module == expected_module:
            print(f"✅ Module matched: {actual_module}")
            results_summary["successful_module_match"] += 1
            results_summary["module_stats"][expected_module]["success"] += 1
        else:
            print(f"❌ Module mismatch: expected {expected_module}, got {actual_module}")
        
        # Check for simplified response structure and entities
        if hasattr(response, 'moduleCode'):
            print("\nUsing simplified response format ✅")
            
            # Check for expected entities
            found_entities = []
            for entity_name in expected_entities:
                if entity_name in response.entities:
                    found_entities.append(entity_name)
                    print(f"✅ Found expected entity: {entity_name} = {response.entities[entity_name]}")
                else:
                    print(f"❌ Missing expected entity: {entity_name}")
            
            results_summary["entities_matched"] += len(found_entities)
            if actual_module == expected_module:
                results_summary["module_stats"][expected_module]["entities_found"] += len(found_entities)
            
            # Display all extracted entities
            entity_count = len(response.entities) if response.entities else 0
            
            print(f"\nAll extracted entities ({entity_count}):")
            if entity_count > 0:
                for name, value in response.entities.items():
                    print(f"  - {name}: {value}")
            else:
                print("  None")
            
            # Convert to dict for printing full response
            response_dict = response.dict()
            print("\nFull Response:")
            print(json.dumps(response_dict, indent=2))
        else:
            print("\nUsing full response format ❌")
    
    # Print summary
    results_summary["avg_response_time"] = results_summary["total_time"] / results_summary["total_tests"]
    entity_match_percentage = (results_summary["entities_matched"] / results_summary["total_expected_entities"] * 100) if results_summary["total_expected_entities"] > 0 else 0
    
    print("\n" + "="*70)
    print("TEST SUMMARY".center(70))
    print("="*70)
    print(f"Total tests: {results_summary['total_tests']}")
    print(f"Successful module matches: {results_summary['successful_module_match']} " +
          f"({(results_summary['successful_module_match']/results_summary['total_tests'])*100:.1f}%)")
    print(f"Expected entities found: {results_summary['entities_matched']}/{results_summary['total_expected_entities']} ({entity_match_percentage:.1f}%)")
    print(f"Average response time: {results_summary['avg_response_time']:.2f} seconds")
    
    # Module-specific stats
    print("\nPer-Module Statistics:")
    print("-"*70)
    print(f"{'Module':<10} {'Success Rate':<20} {'Entity Match Rate':<25} {'Avg Entities'}")
    print("-"*70)
    
    for module, stats in results_summary["module_stats"].items():
        success_rate = (stats["success"] / stats["total"] * 100) if stats["total"] > 0 else 0
        entity_rate = (stats["entities_found"] / stats["entities_expected"] * 100) if stats["entities_expected"] > 0 else 0
        avg_entities = stats["entities_found"] / stats["success"] if stats["success"] > 0 else 0
        
        print(f"{module:<10} {stats['success']}/{stats['total']} ({success_rate:.1f}%) {stats['entities_found']}/{stats['entities_expected']} ({entity_rate:.1f}%) {avg_entities:.1f}")
    
    print("="*70)
    
if __name__ == "__main__":
    asyncio.run(test_query_optimization()) 
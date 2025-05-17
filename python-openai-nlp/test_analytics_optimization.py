import asyncio
import time
import json
from services.query_service import process_text, TextCommand
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_analytics_optimization():
    """
    Test the optimized ANALYTICS flow with a simplified response format.
    Verifies that:
    1. Module-specific analytics types are correctly determined
    2. Appropriate visualization types are selected
    3. Entities are correctly extracted and mapped to filters
    4. The response uses the simplified format with analytics-specific fields
    """
    print("\n==== TESTING OPTIMIZED ANALYTICS FLOW ====\n")
    
    # Test queries for different analytics scenarios
    test_queries = [
        {
            "text": "show my spending trends for 2024", 
            "expected_module": "ANALYTICS",
            "expected_submodule": "ANALYTICS_SPENDING",
            "expected_analytics_type": "spending_trends",
            "expected_visualization": "line_chart",
            "expected_entities": ["year"],
            "expected_filters": ["startDate", "endDate"]
        },
        {
            "text": "display my income analysis as a line chart", 
            "expected_module": "ANALYTICS",
            "expected_submodule": "ANALYTICS_INCOME",
            "expected_analytics_type": "income_analysis",
            "expected_visualization": "line_chart",
            "expected_entities": [],
            "expected_filters": []
        },
        {
            "text": "show transaction details for last month in a table", 
            "expected_module": "ANALYTICS",
            "expected_submodule": "ANALYTICS_TRANSACTIONS",
            "expected_analytics_type": "transaction_analysis",
            "expected_visualization": "table",
            "expected_entities": ["period"],
            "expected_filters": ["startDate", "endDate"]
        },
        {
            "text": "compare my spending by category for Q1 2024", 
            "expected_module": "ANALYTICS",
            "expected_submodule": "ANALYTICS_SPENDING",
            "expected_analytics_type": "comparison_analysis",
            "expected_visualization": "bar_chart",
            "expected_entities": ["year"],
            "expected_filters": ["startDate", "endDate"]
        },
        {
            "text": "show the distribution of my expenses", 
            "expected_module": "ANALYTICS",
            "expected_submodule": "ANALYTICS_SPENDING",
            "expected_analytics_type": "distribution_analysis",
            "expected_visualization": "pie_chart",
            "expected_entities": [],
            "expected_filters": []
        }
    ]
    
    results_summary = {
        "total_tests": len(test_queries),
        "successful_module_match": 0,
        "successful_submodule_match": 0,
        "successful_analytics_type_match": 0,
        "successful_visualization_match": 0,
        "entities_matched": 0,
        "filters_matched": 0,
        "total_expected_entities": sum(len(q["expected_entities"]) for q in test_queries),
        "total_expected_filters": sum(len(q["expected_filters"]) for q in test_queries),
        "avg_response_time": 0,
        "total_time": 0
    }
    
    for i, query_info in enumerate(test_queries):
        query_text = query_info["text"]
        expected_module = query_info["expected_module"]
        expected_submodule = query_info["expected_submodule"]
        expected_analytics_type = query_info["expected_analytics_type"]
        expected_visualization = query_info["expected_visualization"]
        expected_entities = query_info["expected_entities"]
        expected_filters = query_info["expected_filters"]
        
        print(f"\n{'='*60}")
        print(f"Test {i+1}: '{query_text}'")
        print(f"Expected module: {expected_module}")
        print(f"Expected submodule: {expected_submodule}")
        print(f"Expected analytics type: {expected_analytics_type}")
        print(f"Expected visualization: {expected_visualization}")
        print(f"Expected entities: {', '.join(expected_entities) if expected_entities else 'None'}")
        print(f"Expected filters: {', '.join(expected_filters) if expected_filters else 'None'}")
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
        if response.flow != "ANALYTICS":
            print(f"❌ Flow mismatch: expected ANALYTICS, got {response.flow}")
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
        if hasattr(response, 'moduleCode') and hasattr(response, 'visualizationType') and hasattr(response, 'analyticsType'):
            print("\nUsing simplified response format for ANALYTICS ✅")
            
            # Check analytics type
            actual_analytics_type = response.analyticsType
            if actual_analytics_type == expected_analytics_type:
                print(f"✅ Analytics type matched: {actual_analytics_type}")
                results_summary["successful_analytics_type_match"] += 1
            else:
                print(f"❌ Analytics type mismatch: expected {expected_analytics_type}, got {actual_analytics_type}")
                
            # Check visualization type
            actual_visualization = response.visualizationType
            if actual_visualization == expected_visualization:
                print(f"✅ Visualization type matched: {actual_visualization}")
                results_summary["successful_visualization_match"] += 1
            else:
                print(f"❌ Visualization type mismatch: expected {expected_visualization}, got {actual_visualization}")
            
            # Check for expected entities
            found_entities = []
            for entity_name in expected_entities:
                if entity_name in response.entities:
                    found_entities.append(entity_name)
                    print(f"✅ Found expected entity: {entity_name} = {response.entities[entity_name]}")
                else:
                    print(f"❌ Missing expected entity: {entity_name}")
            
            results_summary["entities_matched"] += len(found_entities)
            
            # Check for expected filters
            if hasattr(response, 'filters') and response.filters:
                found_filters = []
                for filter_name in expected_filters:
                    if filter_name in response.filters:
                        found_filters.append(filter_name)
                        print(f"✅ Found expected filter: {filter_name} = {response.filters[filter_name]}")
                    else:
                        print(f"❌ Missing expected filter: {filter_name}")
                
                results_summary["filters_matched"] += len(found_filters)
            else:
                print("❌ No filters found in response")
            
            # Display all extracted entities
            entity_count = len(response.entities) if response.entities else 0
            print(f"\nAll extracted entities ({entity_count}):")
            if entity_count > 0:
                for name, value in response.entities.items():
                    print(f"  - {name}: {value}")
            else:
                print("  None")
            
            # Display all filters
            filter_count = len(response.filters) if hasattr(response, 'filters') and response.filters else 0
            print(f"\nAll filters ({filter_count}):")
            if filter_count > 0:
                for name, value in response.filters.items():
                    print(f"  - {name}: {value}")
            else:
                print("  None")
            
            # Convert to dict for printing full response
            response_dict = response.dict()
            print("\nFull Response:")
            print(json.dumps(response_dict, indent=2))
        else:
            print("\nNot using simplified response format for ANALYTICS ❌")
    
    # Print summary
    results_summary["avg_response_time"] = results_summary["total_time"] / results_summary["total_tests"]
    entity_match_percentage = (results_summary["entities_matched"] / results_summary["total_expected_entities"] * 100) if results_summary["total_expected_entities"] > 0 else 0
    filter_match_percentage = (results_summary["filters_matched"] / results_summary["total_expected_filters"] * 100) if results_summary["total_expected_filters"] > 0 else 0
    
    print("\n" + "="*70)
    print("ANALYTICS OPTIMIZATION TEST SUMMARY".center(70))
    print("="*70)
    print(f"Total tests: {results_summary['total_tests']}")
    print(f"Successful module matches: {results_summary['successful_module_match']} " +
          f"({(results_summary['successful_module_match']/results_summary['total_tests'])*100:.1f}%)")
    print(f"Successful submodule matches: {results_summary['successful_submodule_match']} " +
          f"({(results_summary['successful_submodule_match']/results_summary['total_tests'])*100:.1f}%)")
    print(f"Successful analytics type matches: {results_summary['successful_analytics_type_match']} " +
          f"({(results_summary['successful_analytics_type_match']/results_summary['total_tests'])*100:.1f}%)")
    print(f"Successful visualization matches: {results_summary['successful_visualization_match']} " +
          f"({(results_summary['successful_visualization_match']/results_summary['total_tests'])*100:.1f}%)")
    print(f"Expected entities found: {results_summary['entities_matched']}/{results_summary['total_expected_entities']} ({entity_match_percentage:.1f}%)")
    print(f"Expected filters found: {results_summary['filters_matched']}/{results_summary['total_expected_filters']} ({filter_match_percentage:.1f}%)")
    print(f"Average response time: {results_summary['avg_response_time']:.2f} seconds")
    print("="*70)
    
if __name__ == "__main__":
    asyncio.run(test_analytics_optimization()) 
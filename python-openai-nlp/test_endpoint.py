import requests
import json

def test_process_text():
    """
    Test the /process-text endpoint with a QUERY flow command
    and verify the simplified response format is returned.
    """
    url = "http://localhost:8000/process-text"
    headers = {"Content-Type": "application/json"}
    
    # Text command that should trigger QUERY flow
    payload = {
        "text": "show my accounts",
        "user_id": "user123"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        # Print response status and content
        print(f"Status code: {response.status_code}")
        print("Response content:")
        print(json.dumps(response.json(), indent=2))
        
        # Verify it's the simplified format
        data = response.json()
        
        # Check if it has only the simplified fields
        simplified_fields = {"moduleCode", "submoduleCode", "flow", "entities", "raw_text", "error"}
        actual_fields = set(data.keys())
        
        print("\nValidation:")
        if actual_fields.issubset(simplified_fields) and len(actual_fields) <= len(simplified_fields):
            print("✅ Response uses the simplified format as expected")
        else:
            print("❌ Response does not match the simplified format")
            print(f"Extra fields: {actual_fields - simplified_fields}")
            print(f"Missing fields: {simplified_fields - actual_fields}")
        
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")

if __name__ == "__main__":
    test_process_text() 
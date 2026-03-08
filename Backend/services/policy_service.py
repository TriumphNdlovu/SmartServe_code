import json


# Mock policy data as a Python dict
POLICIES = json.loads("""{
    "POL12345": {
        "policy_number": "POL12345",
        "policy_type": "Value Funeral",
        "start_date": "2024-01-01",
        "end_date": "2025-12-31",
        "premium": 500,
        "holder": {
            "name": "John Doe",
            "id_number": "9001011234567"
        },
        "beneficiaries": [
            {"name": "Jane Doe", "relation": "spouse", "share": 50},
            {"name": "Junior Doe", "relation": "child", "share": 50}
        ],
        "status": "active"
    }
}""")

def get_policy(policy_number: str):
    """
    Returns the policy JSON for a given policy number.
    """
    policy = POLICIES.get(policy_number)

    return policy
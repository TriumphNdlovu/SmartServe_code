import json

POLICIES = {
    "CH30367157": {
        "contractReference": "CH30367157",
        "status": "INF",
        "commencementDate": "2010-10-01",
        "maturityDate": "2068-09-30",
        "product": {
            "productCode": "FUN_PROV_PLAN",
            "productName": "Funeral Provider Plan"
        },
        "holder": {
            "firstName": "TSHEDISO",
            "lastName": "MOKOENA",
            "age": 62,
            "cellPhoneNumber": "0834210001"
        },
        "beneficiaries": [
            {
                "firstName": "LERATO",
                "lastName": "MOKOENA",
                "relationship": "Spouse",
                "apportionmentPercentage": 60.0
            },
            {
                "firstName": "TEBOGO",
                "lastName": "MOKOENA",
                "relationship": "Child",
                "apportionmentPercentage": 40.0
            }
        ],
        "benefits": [
            {
                "benefitCode": "FunMainRsk",
                "benefitLabel": "Policyholder funeral cover",
                "coverAmount": 15000.0,
                "premium": 115.67
            },
            {
                "benefitCode": "CashBack",
                "benefitLabel": "Cash Back Benefit",
                "coverAmount": None,
                "premium": None
            },
            {
                "benefitCode": "DoubleAcc",
                "benefitLabel": "Double Accident Benefit",
                "coverAmount": None,
                "premium": None
            },
            {
                "benefitCode": "WaiverTempRsk",
                "benefitLabel": "Temporary waiver of funeral premium",
                "coverAmount": None,
                "premium": None
            }
        ],
        "premiumCollection": {
            "collectionDay": 15,
            "frequency": "MONTHLY",
            "amount": 140.12
        }
    },

    "CH40123456": {
        "contractReference": "CH40123456",
        "status": "INF",
        "commencementDate": "2015-03-01",
        "maturityDate": "2055-02-28",
        "product": {
            "productCode": "LIFE_PROT_PLAN",
            "productName": "Life Protection Plan"
        },
        "holder": {
            "firstName": "NOMVULA",
            "lastName": "DLAMINI",
            "age": 45,
            "cellPhoneNumber": "0761230002"
        },
        "beneficiaries": [
            {
                "firstName": "SIPHO",
                "lastName": "DLAMINI",
                "relationship": "Spouse",
                "apportionmentPercentage": 50.0
            },
            {
                "firstName": "AYANDA",
                "lastName": "DLAMINI",
                "relationship": "Child",
                "apportionmentPercentage": 25.0
            },
            {
                "firstName": "ZINTLE",
                "lastName": "DLAMINI",
                "relationship": "Child",
                "apportionmentPercentage": 25.0
            }
        ],
        "benefits": [
            {
                "benefitCode": "LifeCover",
                "benefitLabel": "Life Cover",
                "coverAmount": 500000.0,
                "premium": 320.00
            },
            {
                "benefitCode": "PermDisab",
                "benefitLabel": "Permanent Disability Benefit",
                "coverAmount": 500000.0,
                "premium": 85.50
            },
            {
                "benefitCode": "DreadDis",
                "benefitLabel": "Dread Disease Benefit",
                "coverAmount": 250000.0,
                "premium": 120.00
            },
            {
                "benefitCode": "FunMainRsk",
                "benefitLabel": "Policyholder funeral cover",
                "coverAmount": 20000.0,
                "premium": 145.00
            }
        ],
        "premiumCollection": {
            "collectionDay": 1,
            "frequency": "MONTHLY",
            "amount": 670.50
        }
    },

    "CH50789012": {
        "contractReference": "CH50789012",
        "status": "INF",
        "commencementDate": "2020-07-01",
        "maturityDate": "2060-06-30",
        "product": {
            "productCode": "INCOME_PROT_PLAN",
            "productName": "Income Protection Plan"
        },
        "holder": {
            "firstName": "KAGISO",
            "lastName": "SITHOLE",
            "age": 38,
            "cellPhoneNumber": "0829870003"
        },
        "beneficiaries": [
            {
                "firstName": "PALESA",
                "lastName": "SITHOLE",
                "relationship": "Spouse",
                "apportionmentPercentage": 100.0
            }
        ],
        "benefits": [
            {
                "benefitCode": "IncomeProtect",
                "benefitLabel": "Income Protection Benefit",
                "coverAmount": 25000.0,
                "premium": 410.00
            },
            {
                "benefitCode": "TempDisab",
                "benefitLabel": "Temporary Disability Benefit",
                "coverAmount": 25000.0,
                "premium": 95.00
            },
            {
                "benefitCode": "LifeCover",
                "benefitLabel": "Life Cover",
                "coverAmount": 1000000.0,
                "premium": 580.00
            },
            {
                "benefitCode": "FunMainRsk",
                "benefitLabel": "Policyholder funeral cover",
                "coverAmount": 15000.0,
                "premium": 115.67
            },
            {
                "benefitCode": "PolicyFee",
                "benefitLabel": "Policy Fee",
                "coverAmount": None,
                "premium": 24.45
            }
        ],
        "premiumCollection": {
            "collectionDay": 25,
            "frequency": "MONTHLY",
            "amount": 1225.12
        }
    },

    "CH60345678": {
        "contractReference": "CH60345678",
        "status": "LAP",  # Lapsed
        "commencementDate": "2018-01-01",
        "maturityDate": "2058-12-31",
        "product": {
            "productCode": "FUN_PROV_PLAN",
            "productName": "Funeral Provider Plan"
        },
        "holder": {
            "firstName": "BONGANI",
            "lastName": "NKOSI",
            "age": 50,
            "cellPhoneNumber": "0714560004"
        },
        "beneficiaries": [
            {
                "firstName": "THANDIWE",
                "lastName": "NKOSI",
                "relationship": "Spouse",
                "apportionmentPercentage": 70.0
            },
            {
                "firstName": "LUNGELO",
                "lastName": "NKOSI",
                "relationship": "Child",
                "apportionmentPercentage": 30.0
            }
        ],
        "benefits": [
            {
                "benefitCode": "FunMainRsk",
                "benefitLabel": "Policyholder funeral cover",
                "coverAmount": 10000.0,
                "premium": 89.00
            },
            {
                "benefitCode": "FunSpouseRsk",
                "benefitLabel": "Spouse funeral cover",
                "coverAmount": 10000.0,
                "premium": 89.00
            },
            {
                "benefitCode": "FunChildRsk",
                "benefitLabel": "Child funeral cover",
                "coverAmount": 5000.0,
                "premium": 35.00
            }
        ],
        "premiumCollection": {
            "collectionDay": 28,
            "frequency": "MONTHLY",
            "amount": 213.00
        }
    }
}


def get_policy(contract_reference: str):
    """
    Returns the policy for a given contract reference, or None if not found.
    """
    return POLICIES.get(contract_reference)
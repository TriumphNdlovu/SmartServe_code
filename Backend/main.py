import requests

def chat_with_model():
    url = "http://localhost:11434/api/chat"

    payload = {
        "model": "gemma3:4b",
        "messages": [
            {
                "role": "user",
                "content": "Solve: 2 * 2"
            }
        ],
        "stream": False
    }

    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()

        data = response.json()
        print("\nResponse:\n")
        print(data["message"]["content"])

    except requests.exceptions.RequestException as e:
        print("Request failed:", e)


if __name__ == "__main__":
    chat_with_model()
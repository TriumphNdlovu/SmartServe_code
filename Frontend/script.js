const API_BASE = "http://127.0.0.1:8000"; // I will change this once we go live

function login() {
  const contract = document.getElementById("contractRef").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginError = document.getElementById("loginError");

  if (contract === "" || password === "") {
    loginError.innerText = "Please enter contract reference and password";
    return;
  }

  loginError.innerText = "";
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
  document.getElementById("contractDisplay").innerText = "Contract Ref: " + contract;
  document.getElementById("clientName").innerText = contract;
}

function logout() {
  document.getElementById("mainApp").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("contractRef").value = "";
  document.getElementById("password").value = "";
}

function showSection(sectionId, buttonElement) {
  const sections = document.querySelectorAll(".section-view");
  sections.forEach(section => section.classList.add("hidden"));

  document.getElementById(sectionId).classList.remove("hidden");

  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach(item => item.classList.remove("active"));

  if (buttonElement) {
    buttonElement.classList.add("active");
  }
}

function prefillMessage(text) {
  showSection("chatSection", document.querySelectorAll(".menu-item")[1]);
  document.getElementById("messageInput").value = text;
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();

  if (message === "") return;

  const chat = document.getElementById("chatMessages");

  // Append user message
  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.innerText = message;
  chat.appendChild(userMsg);

  input.value = "";
  chat.scrollTop = chat.scrollHeight;

  // Show a loading indicator while waiting for the backend
  const loadingMsg = document.createElement("div");
  loadingMsg.className = "bot-message";
  loadingMsg.innerText = "Thinking…";
  chat.appendChild(loadingMsg);
  chat.scrollTop = chat.scrollHeight;

  try {
    const response = await fetch(`${API_BASE}/ask-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    loadingMsg.innerText = data.answer;
  } catch (err) {
    console.error("AI request failed:", err);
    loadingMsg.innerText =
      "Sorry, I couldn't reach the server. Please try again.";
  }

  chat.scrollTop = chat.scrollHeight;
}

document.addEventListener("keydown", function (event) {
  const activeInput = document.getElementById("messageInput");
  if (!activeInput) return;

  if (event.key === "Enter" && document.activeElement === activeInput) {
    sendMessage();
  }
});
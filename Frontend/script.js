const API_BASE = "http://localhost:8000"; // I will change this once we go live, sorry guys

// ─── Auth ────────────────────────────────────────────────────────────────────

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

// ─── Navigation ──────────────────────────────────────────────────────────────

function showSection(sectionId, buttonElement) {
  document.querySelectorAll(".section-view").forEach(s => s.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");

  document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
  if (buttonElement) buttonElement.classList.add("active");
}

function prefillMessage(text) {
  showSection("chatSection", document.querySelectorAll(".menu-item")[1]);
  document.getElementById("messageInput").value = text;
  document.getElementById("messageInput").focus();
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

function appendMessage(text, className) {
  const chat = document.getElementById("chatMessages");
  const msg = document.createElement("div");
  msg.className = className;
  msg.innerText = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message === "") return;

  // Disable input while waiting
  input.value = "";
  input.disabled = true;
  document.querySelector(".chat-input-row button").disabled = true;

  appendMessage(message, "user-message");

  // Loading indicator
  const loadingMsg = appendMessage("Thinking…", "bot-message loading");

  try {
    const response = await fetch(`${API_BASE}/ask-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    loadingMsg.innerText = data.answer;
    loadingMsg.classList.remove("loading");

  } catch (err) {
    console.error("AI request failed:", err);
    loadingMsg.innerText = "Sorry, I couldn't reach the assistant. Please try again.";
    loadingMsg.classList.remove("loading");
  } finally {
    // Re-enable input
    input.disabled = false;
    document.querySelector(".chat-input-row button").disabled = false;
    input.focus();
  }

  document.getElementById("chatMessages").scrollTop =
    document.getElementById("chatMessages").scrollHeight;
}

// ─── Keyboard shortcut ───────────────────────────────────────────────────────

document.addEventListener("keydown", function (event) {
  const input = document.getElementById("messageInput");
  if (input && event.key === "Enter" && document.activeElement === input) {
    sendMessage();
  }
});
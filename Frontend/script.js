const API_BASE = "http://localhost:8000";

// ─── Auth ─────────────────────────────────────────────────────────────────

function login() {
  const contract = document.getElementById("contractRef").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginError = document.getElementById("loginError");

  if (contract === "" || password === "") {
    loginError.innerText = "Please enter your contract reference and password.";
    return;
  }

  loginError.innerText = "";

  // Populate user info across the UI
  const initials = contract.replace(/[^A-Z0-9]/gi, "").slice(0, 2).toUpperCase() || "?";
  document.getElementById("userAvatar").innerText = initials;
  document.getElementById("sidebarName").innerText = contract;
  document.getElementById("sidebarRef").innerText = "Logged in";
  document.getElementById("clientName").innerText = contract;
  document.getElementById("contractDisplay").innerText = "Contract Ref: " + contract;

  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("mainApp").classList.remove("hidden");
}

function logout() {
  document.getElementById("mainApp").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("contractRef").value = "";
  document.getElementById("password").value = "";
  document.getElementById("loginError").innerText = "";
}

// ─── Navigation ───────────────────────────────────────────────────────────

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

// ─── Chat ─────────────────────────────────────────────────────────────────

function appendBotMessage(content, isLoading = false) {
  const chat = document.getElementById("chatMessages");
  const wrapper = document.createElement("div");
  wrapper.className = "bot-message" + (isLoading ? " loading" : "");

  const bubble = document.createElement("div");
  bubble.className = "bot-bubble";

  if (isLoading) {
    bubble.innerHTML = `<div class="dot-loader"><span></span><span></span><span></span></div>`;
  } else {
    bubble.innerText = content;
  }

  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
  return wrapper;
}

function appendUserMessage(text) {
  const chat = document.getElementById("chatMessages");
  const msg = document.createElement("div");
  msg.className = "user-message";
  msg.innerText = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();
  if (message === "") return;

  input.value = "";
  input.disabled = true;
  document.querySelector(".send-btn").disabled = true;

  appendUserMessage(message);
  const loadingEl = appendBotMessage("", true);

  try {
    const response = await fetch(`${API_BASE}/ask-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: message }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    // Replace loader with real answer
    loadingEl.classList.remove("loading");
    loadingEl.querySelector(".bot-bubble").innerText = data.answer;

  } catch (err) {
    console.error("AI request failed:", err);
    loadingEl.classList.remove("loading");
    loadingEl.querySelector(".bot-bubble").innerText =
      "Sorry, I couldn't reach the assistant right now. Please try again.";
  } finally {
    input.disabled = false;
    document.querySelector(".send-btn").disabled = false;
    input.focus();
    document.getElementById("chatMessages").scrollTop =
      document.getElementById("chatMessages").scrollHeight;
  }
}

// ─── Keyboard ─────────────────────────────────────────────────────────────

document.addEventListener("keydown", function (event) {
  const input = document.getElementById("messageInput");
  if (input && event.key === "Enter" && document.activeElement === input) {
    sendMessage();
  }
});

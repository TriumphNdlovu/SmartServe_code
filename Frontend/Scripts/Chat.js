authGuard();

const policy = getPolicy();
renderSidebar("chat");
populateSharedUI(policy);

// ─── Conversation history ─────────────────────────────────────────────────
// Persisted in sessionStorage so it survives page refreshes within the session

function loadHistory() {
  const raw = sessionStorage.getItem("ss_history");
  return raw ? JSON.parse(raw) : [];
}

function saveHistory(history) {
  sessionStorage.setItem("ss_history", JSON.stringify(history));
}

let conversationHistory = loadHistory();

// ─── Pre-fill from URL query param (from dashboard quick actions) ──────────
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q) {
    document.getElementById("messageInput").value = q;
  }
});

// ─── Typing effect ────────────────────────────────────────────────────────

function typeMessage(element, text, speed = 18) {
  return new Promise(resolve => {
    let i = 0;
    element.innerText = "";
    function tick() {
      if (i < text.length) {
        element.innerText += text[i++];
        document.getElementById("chatMessages").scrollTop =
          document.getElementById("chatMessages").scrollHeight;
        setTimeout(tick, speed);
      } else {
        resolve();
      }
    }
    tick();
  });
}

// ─── Message rendering ────────────────────────────────────────────────────

function appendBotMessage(content, isLoading = false) {
  const chat    = document.getElementById("chatMessages");
  const wrapper = document.createElement("div");
  wrapper.className = "bot-message" + (isLoading ? " loading" : "");
  const bubble  = document.createElement("div");
  bubble.className = "bot-bubble";

  if (isLoading) {
    bubble.innerHTML = `
      <div class="robot-loader">
        <svg class="robot-svg" width="40" height="64" viewBox="0 0 40 68" fill="none">
          <line x1="20" y1="4" x2="20" y2="10" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round"/>
          <circle class="robot-antenna-ball" cx="20" cy="3" r="3" fill="#0ea5e9"/>
          <g class="robot-head">
            <rect x="8" y="10" width="24" height="18" rx="4" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>
            <circle class="robot-eye left"  cx="14" cy="19" r="3" fill="#0ea5e9"/>
            <circle class="robot-eye right" cx="26" cy="19" r="3" fill="#0ea5e9"/>
            <circle cx="15" cy="18" r="1" fill="white" opacity="0.8"/>
            <circle cx="27" cy="18" r="1" fill="white" opacity="0.8"/>
          </g>
          <rect x="17" y="28" width="6" height="3" rx="1" fill="#0ea5e9" opacity="0.6"/>
          <rect x="6" y="31" width="28" height="20" rx="5" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>
          <rect x="12" y="35" width="16" height="10" rx="2" fill="#0ea5e9" opacity="0.15" stroke="#0ea5e9" stroke-width="1"/>
          <line class="robot-mouth" x1="15" y1="39" x2="25" y2="39" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round"/>
          <line class="robot-mouth" x1="17" y1="42" x2="23" y2="42" stroke="#0ea5e9" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
          <rect class="robot-arm-left"  x="0" y="31" width="6" height="14" rx="3" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>
          <rect class="robot-arm-right" x="34" y="31" width="6" height="14" rx="3" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>
          <rect class="robot-leg-left"  x="10" y="51" width="8" height="14" rx="3" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>
          <rect class="robot-leg-right" x="22" y="51" width="8" height="14" rx="3" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>
          <rect x="8"  y="62" width="12" height="5" rx="2.5" fill="#0ea5e9" opacity="0.7"/>
          <rect x="20" y="62" width="12" height="5" rx="2.5" fill="#0ea5e9" opacity="0.7"/>
        </svg>
        <span class="robot-loader-text">Thinking…</span>
      </div>`;
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
  const msg  = document.createElement("div");
  msg.className = "user-message";
  msg.innerText = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

// ─── Send message ─────────────────────────────────────────────────────────

async function sendMessage() {
  const input   = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;

  input.value = "";
  input.disabled = true;
  document.querySelector(".send-btn").disabled = true;

  conversationHistory.push({ role: "user", content: message });
  appendUserMessage(message);
  const loadingEl = appendBotMessage("", true);

  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/ask-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question:      message,
        policy_number: policy.contractReference,
        history:       conversationHistory.slice(0, -1),
      }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    loadingEl.classList.remove("loading");
    const bubble = loadingEl.querySelector(".bot-bubble");
    bubble.innerHTML = "";
    await typeMessage(bubble, data.answer);

    conversationHistory.push({ role: "assistant", content: data.answer });

    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    saveHistory(conversationHistory);

  } catch (err) {
    console.error("AI request failed:", err);
    conversationHistory.pop();
    loadingEl.classList.remove("loading");
    loadingEl.querySelector(".bot-bubble").innerText =
      "Sorry, I couldn't reach the assistant right now. Please try again.";
  } finally {
    input.disabled = false;
    document.querySelector(".send-btn").disabled = false;
    input.focus();
  }
}

// ─── Keyboard ─────────────────────────────────────────────────────────────

document.addEventListener("keydown", e => {
  const input = document.getElementById("messageInput");
  if (input && e.key === "Enter" && document.activeElement === input) {
    sendMessage();
  }
});
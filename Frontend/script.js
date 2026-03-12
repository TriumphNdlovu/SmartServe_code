const API_BASE = "http://localhost:8000";

// Holds the authenticated policy number for the session
let currentPolicyNumber = null;

// ─── Auth ─────────────────────────────────────────────────────────────────

async function login() {
  const contract = document.getElementById("contractRef").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginError = document.getElementById("loginError");
  const loginBtn = document.querySelector(".login-btn");

  if (contract === "" || password === "") {
    loginError.innerText = "Please enter your contract reference and password.";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.querySelector("span").innerText = "Signing in…";
  loginError.innerText = "";

  try {
    const response = await fetch(`${API_BASE}/policy/${contract}`);

    if (response.status === 404) {
      loginError.innerText = "Contract reference not found. Please check and try again.";
      return;
    }

    if (!response.ok) {
      loginError.innerText = "Something went wrong. Please try again.";
      return;
    }

    const policy = await response.json();

    // Store policy number for use in every chat message
    currentPolicyNumber = policy.policy_number;

    // Populate header / sidebar with real holder name
    const holderName = policy.holder?.name || contract;
    const initials = holderName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    document.getElementById("userAvatar").innerText = initials;
    document.getElementById("sidebarName").innerText = holderName;
    document.getElementById("sidebarRef").innerText = policy.policy_number;
    document.getElementById("clientName").innerText = holderName.split(" ")[0];
    document.getElementById("contractDisplay").innerText = "Policy: " + policy.policy_number;

    // Dashboard cards
    document.getElementById("dashPolicyType").innerText = policy.policy_type || "—";
    document.getElementById("dashPremium").innerText = policy.premium
      ? `R${policy.premium.toLocaleString("en-ZA")} / month`
      : "—";
    document.getElementById("dashStatus").innerText =
      policy.status === "active" ? "Active" : policy.status || "—";

    // Policy section
    document.getElementById("polPlanName").innerText = policy.policy_type || "—";
    document.getElementById("polStartDate").innerText = formatDate(policy.start_date);
    document.getElementById("polEndDate").innerText = formatDate(policy.end_date);
    document.getElementById("polPremium").innerText = policy.premium
      ? `R${policy.premium.toLocaleString("en-ZA")} pm`
      : "—";

    // Beneficiaries
    renderBeneficiaries(policy.beneficiaries || []);

    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");

  } catch (err) {
    console.error("Login failed:", err);
    loginError.innerText = "Could not connect to the server. Please try again.";
  } finally {
    loginBtn.disabled = false;
    loginBtn.querySelector("span").innerText = "Sign in";
  }
}

function logout() {
  currentPolicyNumber = null;
  document.getElementById("mainApp").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("contractRef").value = "";
  document.getElementById("password").value = "";
  document.getElementById("loginError").innerText = "";
  document.getElementById("chatMessages").innerHTML = `
    <div class="bot-message">
      <div class="bot-bubble">Hello 👋 I'm your AI life insurance assistant. Ask me about your death benefit, disability cover, dread disease, income protection, premiums, or beneficiary details.</div>
    </div>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function renderBeneficiaries(beneficiaries) {
  const list = document.getElementById("beneficiariesList");
  if (!list) return;
  if (beneficiaries.length === 0) {
    list.innerHTML = "<li>No beneficiaries on record.</li>";
    return;
  }
  list.innerHTML = beneficiaries.map(b => `
    <li>
      <span class="benefit-icon">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      <span><strong>${b.name}</strong> — ${capitalise(b.relation)}, ${b.share}% share</span>
    </li>
  `).join("");
}

function capitalise(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
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
  bubble.innerHTML = isLoading
    ? `<div class="dot-loader"><span></span><span></span><span></span></div>`
    : "";
  if (!isLoading) bubble.innerText = content;
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
      body: JSON.stringify({
        question: message,
        policy_number: currentPolicyNumber, 
      }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
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
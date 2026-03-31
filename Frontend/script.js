const API_BASE = (typeof CONFIG !== "undefined" && CONFIG.BACKEND_URL)
  ? CONFIG.BACKEND_URL
  : "http://localhost:8000";

// Holds the contract reference for the current session
let currentPolicyNumber = null;

// Conversation history — sent to backend with every message
// Each entry: { role: "user" | "assistant", content: "..." }
let conversationHistory = [];

// ─── Status helpers ───────────────────────────────────────────────────────

const STATUS_MAP = {
  INF: { label: "In Force",  colour: "green" },
  LAP: { label: "Lapsed",    colour: "amber" },
  CAN: { label: "Cancelled", colour: "red"   },
  MAT: { label: "Matured",   colour: "blue"  },
};

function resolveStatus(code) {
  return STATUS_MAP[code] || { label: code || "Unknown", colour: "gray" };
}

// ─── Auth ─────────────────────────────────────────────────────────────────

async function login() {
  const contract  = document.getElementById("contractRef").value.trim();
  const password  = document.getElementById("password").value.trim();
  const loginError = document.getElementById("loginError");
  const loginBtn  = document.querySelector(".login-btn");

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

    // Store for every chat message
    currentPolicyNumber = policy.contractReference;

    // ── Holder name ──────────────────────────────────────────────────────
    const firstName  = capitalise(policy.holder?.firstName || "");
    const lastName   = capitalise(policy.holder?.lastName  || "");
    const fullName   = `${firstName} ${lastName}`.trim() || contract;
    const initials   = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase();

    // ── Status ───────────────────────────────────────────────────────────
    const status = resolveStatus(policy.status);

    // ── Premium ──────────────────────────────────────────────────────────
    const amount       = policy.premiumCollection?.amount;
    const collectionDay = policy.premiumCollection?.collectionDay;
    const premiumLabel = amount
      ? `R${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })} / month`
      : "—";
    const collectionLabel = collectionDay
      ? `Deducted on the ${ordinal(collectionDay)} of each month`
      : "Monthly debit order";

    // ── Sidebar & topbar ─────────────────────────────────────────────────
    document.getElementById("userAvatar").innerText       = initials || "?";
    document.getElementById("sidebarName").innerText      = fullName;
    document.getElementById("sidebarRef").innerText       = policy.contractReference;
    document.getElementById("clientName").innerText       = firstName;
    document.getElementById("contractDisplay").innerText  = `Ref: ${policy.contractReference}`;

    // ── Status pill (topbar) ─────────────────────────────────────────────
    const pill = document.getElementById("statusPill");
    pill.className = `status-pill status-${status.colour}`;
    pill.innerHTML = `<span class="status-dot"></span> ${status.label}`;

    // ── Dashboard cards ──────────────────────────────────────────────────
    document.getElementById("dashPolicyType").innerText = policy.product?.productName || "—";
    document.getElementById("dashPremium").innerText    = premiumLabel;
    document.getElementById("dashStatus").innerText     = status.label;
    document.getElementById("dashStatus").className     = `status-text text-${status.colour}`;

    // ── Policy section cards ─────────────────────────────────────────────
    document.getElementById("polPlanName").innerText  = policy.product?.productName || "—";
    document.getElementById("polPremium").innerText   = premiumLabel;
    document.getElementById("polCollectionDay").innerText = collectionLabel;
    document.getElementById("polStartDate").innerText = formatDate(policy.commencementDate);
    document.getElementById("polEndDate").innerText   = formatDate(policy.maturityDate);

    // ── Beneficiaries & benefits ─────────────────────────────────────────
    renderBeneficiaries(policy.beneficiaries || []);
    renderBenefits(policy.benefits || []);

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
  document.getElementById("contractRef").value    = "";
  document.getElementById("password").value       = "";
  document.getElementById("loginError").innerText = "";
  conversationHistory = [];
  document.getElementById("chatMessages").innerHTML = `
    <div class="bot-message">
      <div class="bot-bubble">Hello 👋 I'm your AI insurance assistant. Ask me about your cover, benefits, premiums, or claims.</div>
    </div>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function capitalise(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function ordinal(n) {
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function renderBeneficiaries(beneficiaries) {
  const list = document.getElementById("beneficiariesList");
  if (!list) return;
  if (!beneficiaries.length) {
    list.innerHTML = `<li class="empty-state">No beneficiaries on record.</li>`;
    return;
  }
  list.innerHTML = beneficiaries.map(b => {
    const name = `${capitalise(b.firstName)} ${capitalise(b.lastName)}`.trim();
    const rel  = capitalise(b.relationship || "");
    const pct  = b.apportionmentPercentage != null ? `${b.apportionmentPercentage}% share` : "";
    return `
      <li>
        <span class="benefit-icon">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM3 14c0-3 2-5 5-5s5 2 5 5"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span><strong>${name}</strong>${rel ? ` — ${rel}` : ""}${pct ? `, ${pct}` : ""}</span>
      </li>`;
  }).join("");
}

function renderBenefits(benefits) {
  const list = document.getElementById("benefitsList");
  if (!list) return;
  const active = benefits.filter(b => b.benefitLabel);
  if (!active.length) {
    list.innerHTML = `<li class="empty-state">No benefits on record.</li>`;
    return;
  }
  list.innerHTML = active.map(b => {
    const cover   = b.coverAmount != null
      ? `<span class="benefit-meta">Cover: R${b.coverAmount.toLocaleString("en-ZA")}</span>` : "";
    const premium = b.premium != null
      ? `<span class="benefit-meta">Premium: R${b.premium.toFixed(2)} pm</span>` : "";
    return `
      <li>
        <span class="benefit-icon">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="benefit-row">
          <span class="benefit-name">${b.benefitLabel}</span>
          <span class="benefit-metas">${cover}${premium}</span>
        </span>
      </li>`;
  }).join("");
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

// ─── Typing effect ────────────────────────────────────────────────────────

function typeMessage(element, text, speed = 18) {
  return new Promise(resolve => {
    let i = 0;
    element.innerText = "";

    function tick() {
      if (i < text.length) {
        element.innerText += text[i];
        i++;
        // Scroll chat as text grows
        const chat = document.getElementById("chatMessages");
        chat.scrollTop = chat.scrollHeight;
        setTimeout(tick, speed);
      } else {
        resolve();
      }
    }

    tick();
  });
}

function appendBotMessage(content, isLoading = false) {
  const chat    = document.getElementById("chatMessages");
  const wrapper = document.createElement("div");
  wrapper.className = "bot-message" + (isLoading ? " loading" : "");
  const bubble  = document.createElement("div");
  bubble.className = "bot-bubble";

  if (isLoading) {
    bubble.innerHTML = `
      <div class="robot-loader">
        <svg class="robot-svg" width="40" height="64" viewBox="0 0 40 68" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Antenna -->
          <line x1="20" y1="4" x2="20" y2="10" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round"/>
          <circle class="robot-antenna-ball" cx="20" cy="3" r="3" fill="#0ea5e9"/>

          <!-- Head -->
          <g class="robot-head">
            <rect x="8" y="10" width="24" height="18" rx="4" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>
            <!-- Eyes -->
            <circle class="robot-eye left"  cx="14" cy="19" r="3" fill="#0ea5e9"/>
            <circle class="robot-eye right" cx="26" cy="19" r="3" fill="#0ea5e9"/>
            <!-- Eye shine -->
            <circle cx="15" cy="18" r="1" fill="white" opacity="0.8"/>
            <circle cx="27" cy="18" r="1" fill="white" opacity="0.8"/>
          </g>

          <!-- Neck -->
          <rect x="17" y="28" width="6" height="3" rx="1" fill="#0ea5e9" opacity="0.6"/>

          <!-- Body -->
          <rect x="6" y="31" width="28" height="20" rx="5" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>
          <!-- Chest screen -->
          <rect x="12" y="35" width="16" height="10" rx="2" fill="#0ea5e9" opacity="0.15" stroke="#0ea5e9" stroke-width="1"/>
          <!-- Mouth/screen flicker lines -->
          <line class="robot-mouth" x1="15" y1="39" x2="25" y2="39" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round"/>
          <line class="robot-mouth" x1="17" y1="42" x2="23" y2="42" stroke="#0ea5e9" stroke-width="1" stroke-linecap="round" opacity="0.6"/>

          <!-- Left arm -->
          <rect class="robot-arm-left"  x="0" y="31" width="6" height="14" rx="3" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>
          <!-- Right arm -->
          <rect class="robot-arm-right" x="34" y="31" width="6" height="14" rx="3" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>

          <!-- Left leg -->
          <rect class="robot-leg-left"  x="10" y="51" width="8" height="14" rx="3" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>
          <!-- Right leg -->
          <rect class="robot-leg-right" x="22" y="51" width="8" height="14" rx="3" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="1.5"/>

          <!-- Feet -->
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
  msg.className  = "user-message";
  msg.innerText  = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input   = document.getElementById("messageInput");
  const message = input.value.trim();
  if (!message) return;

  input.value = "";
  input.disabled = true;
  document.querySelector(".send-btn").disabled = true;

  // Add user message to history before sending
  conversationHistory.push({ role: "user", content: message });

  appendUserMessage(message);
  const loadingEl = appendBotMessage("", true);

  try {
    const response = await fetch(`${API_BASE}/ask-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question:      message,
        policy_number: currentPolicyNumber,
        history:       conversationHistory.slice(0, -1), // send history excluding current message
      }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    // Swap robot out, type the answer in
    loadingEl.classList.remove("loading");
    const bubble = loadingEl.querySelector(".bot-bubble");
    bubble.innerHTML = "";
    await typeMessage(bubble, data.answer);

    // Add assistant response to history only after fully typed
    conversationHistory.push({ role: "assistant", content: data.answer });

    // Keep history from growing too large (last 20 messages = 10 exchanges)
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    loadingEl.classList.remove("loading");
    loadingEl.querySelector(".bot-bubble").innerText = data.answer;

  } catch (err) {
    console.error("AI request failed:", err);
    // Remove the failed user message from history
    conversationHistory.pop();
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
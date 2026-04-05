// ─── State ────────────────────────────────────────────────────────────────
// Policy is stored in sessionStorage so it survives page navigation
// but is cleared when the browser tab is closed.

function getPolicy() {
  const raw = sessionStorage.getItem("ss_policy");
  return raw ? JSON.parse(raw) : null;
}

function savePolicy(policy) {
  sessionStorage.setItem("ss_policy", JSON.stringify(policy));
}

function clearSession() {
  sessionStorage.removeItem("ss_policy");
  sessionStorage.removeItem("ss_history");
}

// ─── Auth guard ───────────────────────────────────────────────────────────
// Call at the top of every inner page script.
// Redirects to login if no session exists.

function authGuard() {
  if (!getPolicy()) {
    window.location.href = "login.html";
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const STATUS_MAP = {
  INF: { label: "In Force",  colour: "green" },
  LAP: { label: "Lapsed",    colour: "amber" },
  CAN: { label: "Cancelled", colour: "red"   },
  MAT: { label: "Matured",   colour: "blue"  },
};

function resolveStatus(code) {
  return STATUS_MAP[code] || { label: code || "Unknown", colour: "gray" };
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function capitalise(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Sidebar injection ────────────────────────────────────────────────────
// Injects the sidebar HTML into #sidebarMount and sets the active nav item.
// activePage: "dashboard" | "chat" | "claims" | "policy"

function renderSidebar(activePage) {
  const mount = document.getElementById("sidebarMount");
  if (!mount) return;

  const items = [
    { id: "dashboard", label: "Dashboard",     href: "dashboard.html", icon: `<rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.4"/>` },
    { id: "chat",      label: "Chat Assistant", href: "chat.html",      icon: `<path d="M13 2H3C2.448 2 2 2.448 2 3V10C2 10.552 2.448 11 3 11H5L8 14L11 11H13C13.552 11 14 10.552 14 10V3C14 2.448 13.552 2 13 2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>` },
    { id: "claims",    label: "Claims",         href: "claims.html",    icon: `<path d="M9 2H4C3.448 2 3 2.448 3 3V13C3 13.552 3.448 14 4 14H12C12.552 14 13 13.552 13 13V6L9 2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 2V6H13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M6 9H10M6 11.5H8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>` },
    { id: "policy",    label: "Policy",         href: "policy.html",    icon: `<path d="M8 2L14 5V9C14 12 11.5 14.5 8 15C4.5 14.5 2 12 2 9V5L8 2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>` },
  ];

  const navItems = items.map(item => `
    <button class="menu-item ${item.id === activePage ? "active" : ""}"
      onclick="navigate('${item.href}')">
      <span class="menu-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">${item.icon}</svg>
      </span>
      ${item.label}
    </button>`).join("");

  mount.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-top">
        <div class="sidebar-brand">
          <div class="sidebar-logo">
            <svg width="22" height="28" viewBox="0 0 40 52" fill="none">
              <line x1="20" y1="2" x2="20" y2="7" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="20" cy="1.5" r="2" fill="#0ea5e9"/>
              <rect x="8" y="7" width="24" height="16" rx="4" fill="rgba(14,165,233,0.2)" stroke="white" stroke-width="1.5"/>
              <circle cx="14" cy="15" r="2.5" fill="white"/>
              <circle cx="26" cy="15" r="2.5" fill="white"/>
              <circle cx="14.8" cy="14.2" r="0.9" fill="#0ea5e9"/>
              <circle cx="26.8" cy="14.2" r="0.9" fill="#0ea5e9"/>
              <rect x="17" y="23" width="6" height="3" rx="1" fill="white" opacity="0.5"/>
              <rect x="6" y="26" width="28" height="18" rx="5" fill="rgba(14,165,233,0.2)" stroke="white" stroke-width="1.5"/>
              <rect x="12" y="30" width="16" height="8" rx="2" fill="rgba(14,165,233,0.15)" stroke="#0ea5e9" stroke-width="1"/>
              <line x1="15" y1="34" x2="25" y2="34" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round"/>
              <rect x="0" y="27" width="6" height="11" rx="3" fill="rgba(14,165,233,0.2)" stroke="white" stroke-width="1.5"/>
              <rect x="34" y="27" width="6" height="11" rx="3" fill="rgba(14,165,233,0.2)" stroke="white" stroke-width="1.5"/>
              <rect x="10" y="44" width="8" height="7" rx="3" fill="rgba(14,165,233,0.2)" stroke="white" stroke-width="1.5"/>
              <rect x="22" y="44" width="8" height="7" rx="3" fill="rgba(14,165,233,0.2)" stroke="white" stroke-width="1.5"/>
            </svg>
          </div>
          <div>
            <div class="sidebar-name">SmartServe</div>
            <div class="sidebar-sub">Life Insurance Portal</div>
          </div>
        </div>
        <nav class="menu">${navItems}</nav>
      </div>
      <div class="sidebar-bottom">
        <div class="sidebar-user">
          <div class="user-avatar" id="userAvatar">—</div>
          <div class="user-info">
            <div class="user-name" id="sidebarName">Client</div>
            <div class="user-ref" id="sidebarRef">—</div>
          </div>
        </div>
        <button class="logout-btn" onclick="logout()">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 2H3C2.448 2 2 2.448 2 3V13C2 13.552 2.448 14 3 14H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M10 5L14 8L10 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 8H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          Sign out
        </button>
      </div>
    </aside>`;
}

// ─── Populate shared UI ───────────────────────────────────────────────────
// Fills topbar and sidebar with real policy data.

function populateSharedUI(policy) {
  const firstName = capitalise(policy.holder?.firstName || "");
  const lastName  = capitalise(policy.holder?.lastName  || "");
  const fullName  = `${firstName} ${lastName}`.trim();
  const initials  = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase();
  const status    = resolveStatus(policy.status);
  const amount    = policy.premiumCollection?.amount;
  const premiumLabel = amount
    ? `R${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })} / month`
    : "—";

  // Sidebar
  const avatar = document.getElementById("userAvatar");
  if (avatar) avatar.innerText = initials || "?";
  const sidebarName = document.getElementById("sidebarName");
  if (sidebarName) sidebarName.innerText = fullName;
  const sidebarRef = document.getElementById("sidebarRef");
  if (sidebarRef) sidebarRef.innerText = policy.contractReference;

  // Topbar
  const clientName = document.getElementById("clientName");
  if (clientName) clientName.innerText = firstName;
  const contractDisplay = document.getElementById("contractDisplay");
  if (contractDisplay) contractDisplay.innerText = `Ref: ${policy.contractReference}`;
  const pill = document.getElementById("statusPill");
  if (pill) {
    pill.className = `status-pill status-${status.colour}`;
    pill.innerHTML = `<span class="status-dot"></span> ${status.label}`;
  }

  return { firstName, fullName, initials, status, premiumLabel };
}

// ─── Navigation ───────────────────────────────────────────────────────────

function navigate(href) {
  closeSidebar();
  window.location.href = href;
}

// ─── Logout ───────────────────────────────────────────────────────────────

function logout() {
  clearSession();
  window.location.href = "login.html";
}

// ─── Mobile sidebar ───────────────────────────────────────────────────────

function toggleSidebar() {
  const sidebar   = document.getElementById("sidebar");
  const overlay   = document.getElementById("sidebarOverlay");
  const hamburger = document.getElementById("hamburgerBtn");
  if (!sidebar) return;

  const isOpen = sidebar.classList.contains("is-open");
  if (isOpen) {
    closeSidebar();
  } else {
    overlay.style.display = "block";
    requestAnimationFrame(() => {
      sidebar.classList.add("is-open");
      overlay.classList.add("is-visible");
      hamburger.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }
}

function closeSidebar() {
  const sidebar   = document.getElementById("sidebar");
  const overlay   = document.getElementById("sidebarOverlay");
  const hamburger = document.getElementById("hamburgerBtn");
  if (!sidebar) return;

  sidebar.classList.remove("is-open");
  overlay.classList.remove("is-visible");
  if (hamburger) hamburger.classList.remove("is-open");
  document.body.style.overflow = "";

  overlay.addEventListener("transitionend", () => {
    overlay.style.display = "none";
  }, { once: true });
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeSidebar();
});
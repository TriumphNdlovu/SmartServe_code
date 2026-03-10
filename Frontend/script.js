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

function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();

  if (message === "") return;

  const chat = document.getElementById("chatMessages");

  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.innerText = message;
  chat.appendChild(userMsg);

  input.value = "";
  chat.scrollTop = chat.scrollHeight;

  setTimeout(() => {
    const botMsg = document.createElement("div");
    botMsg.className = "bot-message";
    botMsg.innerText = getBotResponse(message);
    chat.appendChild(botMsg);
    chat.scrollTop = chat.scrollHeight;
  }, 500);
}

function getBotResponse(message) {
  const text = message.toLowerCase();

  if (text.includes("claim")) {
    return "Your latest claim is currently under review. In a real app, this would fetch live claim data from your backend.";
  }

  if (text.includes("cover") || text.includes("policy")) {
    return "Your policy includes comprehensive cover, third-party liability, and roadside assistance in this demo.";
  }

  if (text.includes("premium") || text.includes("due") || text.includes("payment")) {
    return "Your next premium is scheduled for 25 March 2026. In production, this would come from the billing system.";
  }

  if (text.includes("excess")) {
    return "Your standard excess in this demo policy is R2,500.";
  }

  return "This is a frontend demo response. Later, you can connect this UI to a real AI model or insurance API.";
}

document.addEventListener("keydown", function(event) {
  const activeInput = document.getElementById("messageInput");
  if (!activeInput) return;

  if (event.key === "Enter" && document.activeElement === activeInput) {
    sendMessage();
  }
});

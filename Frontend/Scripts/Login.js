// Redirect to dashboard if already logged in
if (sessionStorage.getItem("ss_policy")) {
  window.location.href = "dashboard.html";
}

async function login() {
  const contract   = document.getElementById("contractRef").value.trim();
  const password   = document.getElementById("password").value.trim();
  const loginError = document.getElementById("loginError");
  const loginBtn   = document.querySelector(".login-btn");

  if (!contract || !password) {
    loginError.innerText = "Please enter your contract reference and password.";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.querySelector("span").innerText = "Signing in…";
  loginError.innerText = "";

  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/policy/${contract}`);

    if (response.status === 404) {
      loginError.innerText = "Contract reference not found. Please check and try again.";
      return;
    }
    if (!response.ok) {
      loginError.innerText = "Something went wrong. Please try again.";
      return;
    }

    const policy = await response.json();

    // Save policy to sessionStorage — all inner pages read from here
    sessionStorage.setItem("ss_policy", JSON.stringify(policy));

    // Navigate to dashboard
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error("Login failed:", err);
    loginError.innerText = "Could not connect to the server. Please try again.";
  } finally {
    loginBtn.disabled = false;
    loginBtn.querySelector("span").innerText = "Sign in";
  }
}

// Allow Enter key on both inputs
document.addEventListener("keydown", e => {
  if (e.key === "Enter") login();
});
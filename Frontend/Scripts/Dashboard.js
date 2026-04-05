authGuard();

const policy = getPolicy();
renderSidebar("dashboard");
const { status, premiumLabel } = populateSharedUI(policy);

// Dashboard-specific cards
document.getElementById("dashPolicyType").innerText = policy.product?.productName || "—";
document.getElementById("dashPremium").innerText    = premiumLabel;
document.getElementById("dashStatus").innerText     = status.label;
document.getElementById("dashStatus").className     = `status-text text-${status.colour}`;
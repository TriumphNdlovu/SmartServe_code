authGuard();

const policy = getPolicy();
renderSidebar("policy");
const { premiumLabel } = populateSharedUI(policy);

// Policy cards
const collectionDay = policy.premiumCollection?.collectionDay;
document.getElementById("polPlanName").innerText      = policy.product?.productName || "—";
document.getElementById("polPremium").innerText       = premiumLabel;
document.getElementById("polCollectionDay").innerText = collectionDay
  ? `Deducted on the ${ordinal(collectionDay)} of each month`
  : "Monthly debit order";
document.getElementById("polStartDate").innerText     = formatDate(policy.commencementDate);
document.getElementById("polEndDate").innerText       = formatDate(policy.maturityDate);

// Benefits
function renderBenefits(benefits) {
  const list   = document.getElementById("benefitsList");
  const active = (benefits || []).filter(b => b.benefitLabel);
  if (!active.length) {
    list.innerHTML = `<li class="empty-state">No benefits on record.</li>`;
    return;
  }
  list.innerHTML = active.map(b => {
    const cover   = b.coverAmount != null ? `<span class="benefit-meta">Cover: R${b.coverAmount.toLocaleString("en-ZA")}</span>` : "";
    const premium = b.premium    != null ? `<span class="benefit-meta">Premium: R${b.premium.toFixed(2)} pm</span>` : "";
    return `
      <li>
        <span class="benefit-icon">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="benefit-row">
          <span class="benefit-name">${b.benefitLabel}</span>
          <span class="benefit-metas">${cover}${premium}</span>
        </span>
      </li>`;
  }).join("");
}

// Beneficiaries
function renderBeneficiaries(beneficiaries) {
  const list = document.getElementById("beneficiariesList");
  if (!(beneficiaries || []).length) {
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
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM3 14c0-3 2-5 5-5s5 2 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </span>
        <span><strong>${name}</strong>${rel ? ` — ${rel}` : ""}${pct ? `, ${pct}` : ""}</span>
      </li>`;
  }).join("");
}

renderBenefits(policy.benefits);
renderBeneficiaries(policy.beneficiaries);
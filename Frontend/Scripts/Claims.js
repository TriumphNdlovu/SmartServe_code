authGuard();

const policy = getPolicy();
renderSidebar("claims");
populateSharedUI(policy);

// Mock claims — replace with a real API call when your /claims endpoint is ready
const MOCK_CLAIMS = [
  { ref: "CLM-2048", type: "Temporary Disability", status: "Under Review", date: "08 Mar 2026", badge: "badge-review" },
  { ref: "CLM-1981", type: "Dread Disease",         status: "Closed",       date: "12 Feb 2026", badge: "badge-closed" },
  { ref: "CLM-1765", type: "Income Protection",     status: "Closed",       date: "22 Dec 2025", badge: "badge-closed" },
];

function renderClaims(claims) {
  const body  = document.getElementById("claimsBody");
  const badge = document.getElementById("claimsBadge");

  badge.innerText = `${claims.length} record${claims.length !== 1 ? "s" : ""}`;

  if (!claims.length) {
    body.innerHTML = `<tr><td colspan="4" style="color:var(--text-muted);font-style:italic;padding:20px 14px;">No claims on record.</td></tr>`;
    return;
  }

  body.innerHTML = claims.map(c => `
    <tr>
      <td><span class="claim-ref">${c.ref}</span></td>
      <td>${c.type}</td>
      <td><span class="badge ${c.badge}">${c.status}</span></td>
      <td>${c.date}</td>
    </tr>`).join("");
}

renderClaims(MOCK_CLAIMS);
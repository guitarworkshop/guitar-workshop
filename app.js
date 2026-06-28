const grid = document.getElementById("productGrid");
const question = document.getElementById("question");
const answer = document.getElementById("answer");
const askBtn = document.getElementById("askBtn");

grid.innerHTML = products.map((p, i) => `
  <article class="product-card">
    <div class="product-image">${i + 1}</div>
    <div class="product-info"><h3>${p.model}</h3><p>${p.desc}</p><div class="price">${p.price}</div></div>
  </article>`).join("");

function reply(q) {
  q = q.trim().toLowerCase();
  if (!q) return "請輸入需求，例如：預算 8000、初學、自彈自唱、需要拾音器。";
  if (q.includes("8000") || q.includes("八千")) return "依你的預算，我會優先推薦 DADARWOOD D20-GAC PLUS。它是桃花心木面單，聲音溫暖，適合初學升級與自彈自唱。";
  if (q.includes("d20") && q.includes("d30")) return "D20 偏溫暖、適合初學升級；D30 是雲杉面單搭配玫瑰木側背，音色層次與延伸感更好，較適合進階使用。";
  if (q.includes("旅行")) return "如果要旅行吉他，可以先看 EITMOSS 36 吋系列，重點是輕巧、好攜帶，適合外出練習。";
  if (q.includes("拾音") || q.includes("直播") || q.includes("演出")) return "如果需要直播、演出或接音箱，建議優先選有拾音器的款式，例如 ANISA R7。";
  return "我會先建議你從用途選：初學可看 D10 / D20，進階可看 D30 或 ANISA，全單可看 AS-01，旅行需求可看 EITMOSS。";
}

askBtn.addEventListener("click", () => { answer.textContent = reply(question.value); });

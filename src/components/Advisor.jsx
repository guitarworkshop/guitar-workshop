import { useState } from "react";
import { products } from "../data/products";

function formatPrice(price) {
  return price ? `NT$ ${price.toLocaleString()}` : "歡迎洽詢";
}

function advisorReply(input) {
  const text = input.trim().toLowerCase();
  if (!text) return "請先輸入需求，例如：預算 8000、初學、自彈自唱、需要拾音器。";

  if (text.includes("d20") && text.includes("d30")) {
    return "D20 偏溫暖、適合初學升級；D30 是雲杉面單搭配玫瑰木側背，音色層次與延伸感更好，較適合進階使用。如果預算夠，D30 是更完整的升級。";
  }

  if (text.includes("全單") || text.includes("全單板")) {
    return "目前可以優先看 ANISA AS-01。它是全相思木全單板、亮面、JF 桶身，適合重視音色與質感的使用者。";
  }

  if (text.includes("旅行") || text.includes("攜帶")) {
    return "如果你要旅行吉他，建議看 EITMOSS 36 吋系列。它的重點是輕巧、方便攜帶，適合外出練習。";
  }

  if (text.includes("拾音") || text.includes("直播") || text.includes("演出")) {
    return "如果需要直播、演出或接音箱，建議優先看有拾音器的型號，例如 ANISA R7。之後產品資料補完整後，我會把 R7 加進推薦系統。";
  }

  const budget = text.match(/\d{4,5}/);
  if (budget) {
    const amount = Number(budget[0]);
    const matched = products
      .filter((product) => product.price && product.price <= amount + 800)
      .sort((a, b) => b.price - a.price);

    if (matched.length) {
      return "依你的預算，可以優先看：\n\n" + matched
        .slice(0, 3)
        .map((product) => `・${product.brand} ${product.model}（${formatPrice(product.price)}）：${product.category}`)
        .join("\n");
    }
  }

  return "我會先建議你從用途選：初學可看 D10 / D20，進階可看 D30 或 ANISA，全單可看 AS-01，旅行需求可看 EITMOSS。";
}

export default function Advisor() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("輸入需求後，這裡會顯示推薦方向。");

  return (
    <section className="advisor" id="advisor">
      <div className="advisor-copy">
        <p className="eyebrow">AI Guitar Advisor</p>
        <h2>不知道怎麼選？<br />讓 AI 幫你找到適合的吉他。</h2>
        <p>正式版會串接真正 AI；目前這版先用產品資料庫與規則做展示，方便確認介面與流程。</p>
      </div>

      <div className="advisor-panel">
        <div className="ai-badge">AI</div>
        <label htmlFor="advisor-input">請描述你的需求</label>
        <textarea
          id="advisor-input"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="例如：預算 8000、初學、自彈自唱、希望音色溫暖"
        />
        <button className="btn primary full" onClick={() => setAnswer(advisorReply(question))}>
          開始諮詢 →
        </button>
        <div className="advisor-answer">{answer}</div>
      </div>
    </section>
  );
}

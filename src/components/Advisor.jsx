import { useMemo, useState } from "react";
import { products } from "../data/products";

const questions = {
  firstGuitar: [
    ["yes", "第一次買吉他"],
    ["no", "不是第一把，想升級"]
  ],
  budget: [
    ["under8000", "8,000 以下"],
    ["8000to15000", "8,000～15,000"],
    ["15000to25000", "15,000～25,000"],
    ["25000up", "25,000 以上"]
  ],
  use: [
    ["singing", "自彈自唱"],
    ["fingerstyle", "Fingerstyle / 演奏"],
    ["practice", "日常練習"],
    ["live", "直播 / 演出"]
  ],
  sound: [
    ["warm", "溫暖厚實"],
    ["bright", "明亮清晰"],
    ["balanced", "均衡耐聽"],
    ["notSure", "我還不確定"]
  ],
  pickup: [
    ["no", "暫時不需要拾音器"],
    ["yes", "需要拾音器"]
  ]
};

function priceText(price) {
  return price ? `NT$ ${price.toLocaleString()}` : "歡迎洽詢";
}

function productText(product) {
  return `${product.brand} ${product.model} ${product.category} ${product.subtitle} ${product.tone} ${product.useCase} ${product.sellingPoints?.join(" ")}`.toLowerCase();
}

function scoreProduct(product, form) {
  const text = productText(product);
  let score = 0;

  if (form.budget === "under8000" && product.price && product.price <= 8000) score += 6;
  if (form.budget === "8000to15000" && product.price && product.price >= 7000 && product.price <= 16000) score += 6;
  if (form.budget === "15000to25000" && (!product.price || (product.price >= 12000 && product.price <= 26000))) score += 6;
  if (form.budget === "25000up" && (!product.price || product.price >= 18000)) score += 5;

  if (form.firstGuitar === "yes" && (text.includes("初學") || text.includes("入門") || text.includes("彈唱") || text.includes("面單"))) score += 4;
  if (form.firstGuitar === "no" && (text.includes("全單") || text.includes("演奏") || text.includes("進階"))) score += 5;

  if (form.use === "singing" && (text.includes("彈唱") || text.includes("溫暖"))) score += 5;
  if (form.use === "fingerstyle" && (text.includes("演奏") || text.includes("層次") || text.includes("全單") || text.includes("清晰"))) score += 5;
  if (form.use === "practice" && (text.includes("練習") || text.includes("初學"))) score += 4;
  if (form.use === "live" && (text.includes("直播") || text.includes("演出") || text.includes("拾音器"))) score += 7;

  if (form.sound === "warm" && (text.includes("溫暖") || text.includes("桃花") || text.includes("低頻"))) score += 4;
  if (form.sound === "bright" && (text.includes("明亮") || text.includes("清晰") || text.includes("雲杉"))) score += 4;
  if (form.sound === "balanced" && (text.includes("均衡") || text.includes("相思") || text.includes("耐聽"))) score += 4;

  if (form.pickup === "yes" && text.includes("拾音器")) score += 8;
  if (form.pickup === "no" && !text.includes("拾音器")) score += 2;

  return score;
}

function brainIntro(form) {
  if (form.firstGuitar === "yes") {
    if (form.budget === "under8000") {
      return "第一次買吉他，如果只是想先體驗，可以從預算較低的琴開始。不過我還是會建議你了解合板和面單的差別，因為如果會認真練習，面單通常比較划算，也比較能陪你用久一點。";
    }
    if (form.budget === "8000to15000") {
      return "第一次買吉他，預算到 8,000～15,000，我通常會建議直接看面單。這個區間重點不是追品牌，而是看材料、做工和你喜歡的聲音。";
    }
    return "第一次買吉他，如果預算已經來到 15,000 以上，我會開始幫你比較高階面單和全單。能買到不錯的全單時，我通常會優先帶你比較全單，因為整體聲音和共鳴會更完整。";
  }

  return "如果你已經有一把吉他，想升級時我會先看這次升級有沒有價值。同價位通常不是升級，只是音色取向不同；如果要換琴，我會希望你換到音質和演奏體驗都有明顯提升的等級。";
}

function reasonFor(product, form) {
  const reasons = [];
  const text = productText(product);

  if (form.use === "singing" && (text.includes("彈唱") || text.includes("溫暖"))) reasons.push("適合自彈自唱，聲音方向比較容易融入人聲。");
  if (form.use === "fingerstyle" && (text.includes("演奏") || text.includes("層次") || text.includes("清晰"))) reasons.push("音色層次比較清楚，適合演奏或更細緻的彈奏。");
  if (form.pickup === "yes" && text.includes("拾音器")) reasons.push("有拾音器，適合直播、演出或接音箱使用。");
  if (form.pickup === "no" && !text.includes("拾音器")) reasons.push("如果暫時沒有演出需求，可以把預算放在吉他本身。");
  if (form.sound === "warm" && (text.includes("溫暖") || text.includes("桃花"))) reasons.push("音色偏溫暖，適合喜歡厚實、耐聽聲音的人。");
  if (form.sound === "bright" && (text.includes("明亮") || text.includes("雲杉") || text.includes("清晰"))) reasons.push("音色比較明亮清晰，適合喜歡穿透力的人。");
  if (!reasons.length) reasons.push("這把琴和你的需求方向接近，可以列入比較。");

  return reasons.slice(0, 3);
}

function notRecommendNote(form) {
  if (form.budget === "8000to15000") {
    return "我不會優先推薦太低價的合板，因為你的預算已經可以看面單，把預算放在琴本身會更有長期價值。";
  }
  if (form.budget === "15000to25000" || form.budget === "25000up") {
    return "如果你的預算已經能碰到全單或更高階產品，我不會只停留在同價位面單，而會先看這次升級有沒有明顯價值。";
  }
  return "如果只是想先體驗，低預算可以接受；但如果確定會練，面單會是更划算的選擇。";
}

export default function Advisor() {
  const [form, setForm] = useState({
    firstGuitar: "yes",
    budget: "8000to15000",
    use: "singing",
    sound: "notSure",
    pickup: "no"
  });

  const recommendations = useMemo(() => {
    return [...products]
      .map((product) => ({ ...product, score: scoreProduct(product, form) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [form]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <section className="gw-ai" id="advisor">
      <div className="gw-ai-head">
        <p className="eyebrow">GW Brain Alpha</p>
        <h2>吉他工坊選琴顧問</h2>
        <p>先了解你的需求，再用吉他工坊的選琴邏輯推薦適合比較的產品。</p>
      </div>

      <div className="gw-ai-layout">
        <div className="gw-ai-questions">
          <Question title="這是你的第一把吉他嗎？" name="firstGuitar" value={form.firstGuitar} options={questions.firstGuitar} onChange={update} />
          <Question title="你的預算大約是？" name="budget" value={form.budget} options={questions.budget} onChange={update} />
          <Question title="主要用途？" name="use" value={form.use} options={questions.use} onChange={update} />
          <Question title="你喜歡什麼聲音？" name="sound" value={form.sound} options={questions.sound} onChange={update} />
          <Question title="是否需要拾音器？" name="pickup" value={form.pickup} options={questions.pickup} onChange={update} />
        </div>

        <div className="gw-ai-result">
          <div className="brain-box">
            <p className="eyebrow">選琴邏輯</p>
            <p>{brainIntro(form)}</p>
            <p>{notRecommendNote(form)}</p>
          </div>

          <h3>我建議你先比較這幾把</h3>

          {recommendations.map((product, index) => (
            <article className="ai-product" key={product.id}>
              <div className="ai-rank">#{index + 1}</div>
              <div>
                <strong>{product.brand} {product.model}</strong>
                <span>{product.category}｜{priceText(product.price)}</span>
                <ul>
                  {reasonFor(product, form).map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </div>
            </article>
          ))}

          <div className="brain-tip">
            真正選琴時，我會建議兩把兩把比較；如果可以盲測，通常更容易找到你真正喜歡的聲音。
          </div>
        </div>
      </div>
    </section>
  );
}

function Question({ title, name, value, options, onChange }) {
  return (
    <div className="gw-question">
      <h3>{title}</h3>
      <div className="gw-options">
        {options.map(([optionValue, label]) => (
          <button
            type="button"
            key={optionValue}
            className={value === optionValue ? "selected" : ""}
            onClick={() => onChange(name, optionValue)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

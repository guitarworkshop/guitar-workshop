import { useMemo, useState } from "react";
import { products } from "../data/products";

const starterMessages = [
  "我第一次買吉他，預算一萬五，想自彈自唱",
  "我預算八千，想買第一把吉他",
  "我已經有一把面單，想升級",
  "我需要直播演出，可以推薦嗎？"
];

function priceText(price) {
  return price ? `NT$ ${price.toLocaleString()}` : "歡迎洽詢";
}

function productText(product) {
  return `${product.brand} ${product.model} ${product.category} ${product.subtitle} ${product.tone} ${product.useCase} ${product.sellingPoints?.join(" ")}`.toLowerCase();
}

function parseUser(text) {
  const input = text.toLowerCase();
  let budget = null;
  const arabic = input.match(/(\d{4,6})/);
  if (arabic) budget = Number(arabic[1]);
  if (input.includes("一萬五")) budget = 15000;
  if (input.includes("一萬")) budget = budget || 10000;
  if (input.includes("八千")) budget = 8000;
  if (input.includes("五千")) budget = 5000;
  if (input.includes("三萬")) budget = 30000;

  return {
    budget,
    isFirst: input.includes("第一次") || input.includes("第一把") || input.includes("新手") || input.includes("初學"),
    isUpgrade: input.includes("升級") || input.includes("換琴") || input.includes("第二把"),
    needsPickup: input.includes("拾音") || input.includes("直播") || input.includes("演出") || input.includes("接音箱"),
    use: input.includes("彈唱") || input.includes("唱歌") ? "singing"
      : input.includes("finger") || input.includes("演奏") || input.includes("指彈") ? "fingerstyle"
      : input.includes("直播") || input.includes("演出") ? "live"
      : input.includes("練習") ? "practice"
      : "notSure",
    sound: input.includes("溫暖") || input.includes("厚") || input.includes("低頻") ? "warm"
      : input.includes("亮") || input.includes("清晰") || input.includes("穿透") ? "bright"
      : input.includes("均衡") || input.includes("耐聽") ? "balanced"
      : "notSure",
    raw: text
  };
}

function scoreProduct(product, info) {
  const text = productText(product);
  let score = 0;

  if (info.budget) {
    if (product.price <= info.budget) score += 8;
    if (product.price > info.budget && product.price <= info.budget * 1.25) score += 4;
    if (product.price > info.budget * 1.4) score -= 5;
  }

  if (info.isFirst && (text.includes("初學") || text.includes("彈唱") || text.includes("面單"))) score += 5;
  if (info.isUpgrade && (text.includes("全單") || text.includes("演奏") || text.includes("進階"))) score += 7;

  if (info.use === "singing" && (text.includes("彈唱") || text.includes("溫暖") || text.includes("桃花"))) score += 6;
  if (info.use === "fingerstyle" && (text.includes("演奏") || text.includes("層次") || text.includes("清晰") || text.includes("全單"))) score += 6;
  if (info.use === "live" && (text.includes("直播") || text.includes("演出") || text.includes("拾音器"))) score += 8;

  if (info.sound === "warm" && (text.includes("溫暖") || text.includes("桃花"))) score += 4;
  if (info.sound === "bright" && (text.includes("明亮") || text.includes("清晰") || text.includes("雲杉"))) score += 4;
  if (info.sound === "balanced" && (text.includes("均衡") || text.includes("相思"))) score += 4;

  if (info.needsPickup && text.includes("拾音器")) score += 8;
  if (!info.needsPickup && !text.includes("拾音器")) score += 2;

  return score;
}

function makeReason(product, info) {
  const text = productText(product);
  if (info.needsPickup && text.includes("拾音器")) return "適合直播、演出或接音箱使用。";
  if (info.use === "singing" && (text.includes("溫暖") || text.includes("彈唱"))) return "聲音方向適合自彈自唱，會比較容易融入人聲。";
  if (info.use === "fingerstyle" && (text.includes("層次") || text.includes("清晰") || text.includes("全單"))) return "音色層次比較清楚，適合演奏或更細緻的彈奏。";
  if (info.sound === "warm" && text.includes("桃花")) return "桃花心木聲音偏溫暖，適合喜歡耐聽音色的人。";
  if (info.sound === "bright" && text.includes("雲杉")) return "雲杉聲音比較明亮清晰，適合喜歡穿透感的人。";
  return "整體條件和你的需求接近，可以列入比較。";
}

function buildAnswer(info, picks) {
  if (!info.raw.trim()) {
    return "你可以直接告訴我：這是不是第一把吉他、預算大約多少、主要用途是彈唱還是演奏。";
  }

  const lines = [];

  if (info.isFirst) {
    lines.push("如果是第一次買吉他，我不會急著只推薦某一個型號，會先讓你知道合板、面單和全單的差別。");
    if (info.budget && info.budget >= 8000) lines.push("以你的預算來看，我會比較建議直接看面單以上，因為如果會認真練習，面單通常會比合板更划算，也能陪你用比較久。");
    if (info.budget && info.budget >= 15000) lines.push("你的預算已經接近可以比較高階面單或部分全單的區間，所以我會建議把預算花在聲音和做工更有價值的琴上。");
  } else if (info.isUpgrade) {
    lines.push("如果是想升級，我會先看這次換琴有沒有明顯價值。同價位很多時候不是升級，只是音色取向不同。");
    lines.push("如果要換，我會希望你往音質、共鳴和演奏體驗都有明顯提升的等級看。");
  } else {
    lines.push("我會先幫你把需求縮小，而不是一次丟很多把琴給你。買吉他最好兩把兩把比較，會比較容易聽出差異。");
  }

  if (info.needsPickup) lines.push("你有直播或演出需求，所以我會把有拾音器、適合接音箱的款式排前面。");
  else lines.push("如果暫時沒有演出需求，我會建議先把預算放在吉他本身，拾音器之後有需要再加裝也可以。");

  lines.push("");
  lines.push("依你目前的描述，我會建議你先比較下面這幾把：");

  picks.forEach((p, i) => {
    lines.push("");
    lines.push(`${i + 1}. ${p.brand} ${p.model}（${priceText(p.price)}）`);
    lines.push(`   ${makeReason(p, info)}`);
  });

  lines.push("");
  lines.push("最後還是建議你用耳朵比較，甚至盲測。不是問哪一把比較好，而是找哪一把的聲音你比較喜歡。");

  return lines.join("\n");
}

export default function Advisor() {
  const [input, setInput] = useState("我第一次買吉他，預算一萬五，想自彈自唱");
  const [submitted, setSubmitted] = useState("我第一次買吉他，預算一萬五，想自彈自唱");

  const info = useMemo(() => parseUser(submitted), [submitted]);

  const picks = useMemo(() => {
    return [...products]
      .map((product) => ({ ...product, score: scoreProduct(product, info) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [info]);

  const answer = useMemo(() => buildAnswer(info, picks), [info, picks]);

  return (
    <section className="section advisor-section" id="advisor">
      <div className="section-title">
        <p className="eyebrow">Guitar Workshop Advisor</p>
        <h2>吉他工坊選琴顧問</h2>
        <p>直接說出你的需求，我會用吉他工坊的選琴邏輯，從目前產品裡推薦適合比較的琴。</p>
      </div>

      <div className="chat-window">
        <div className="message ai">
          <strong>吉他工坊</strong>
          <p>你好，直接告訴我你的預算、用途、是不是第一把吉他，我會幫你縮小到幾把適合比較的琴。</p>
        </div>

        <div className="starter-row">
          {starterMessages.map((text) => (
            <button key={text} type="button" onClick={() => { setInput(text); setSubmitted(text); }}>
              {text}
            </button>
          ))}
        </div>

        <div className="message user">
          <strong>你</strong>
          <p>{submitted}</p>
        </div>

        <div className="message ai answer">
          <strong>吉他工坊選琴顧問</strong>
          <pre>{answer}</pre>
        </div>

        <div className="chat-input">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="例如：我第一次買吉他，預算一萬五，想自彈自唱"
          />
          <button type="button" onClick={() => setSubmitted(input)}>送出</button>
        </div>
      </div>
    </section>
  );
}

export default function WhyUs() {
  const items = [
    ["專業技師調整", "出貨前檢查手感、弦距與基本狀態。"],
    ["嚴選品牌", "以材料、做工、聲音和定位建立產品架構。"],
    ["樂器行合作", "支援店家合作與批發需求。"],
    ["選琴顧問", "用比較邏輯協助客人找到適合的聲音。"]
  ];

  return (
    <section className="section why">
      <div className="section-title">
        <p className="eyebrow">Why Guitar Workshop</p>
        <h2>為什麼選擇吉他工坊？</h2>
      </div>

      <div className="why-grid">
        {items.map(([title, text]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

import { brands } from "../data/products";

export default function Brands() {
  return (
    <section className="section brands" id="brands">
      <div className="section-title">
        <p className="eyebrow">Brand Overview</p>
        <h2>我們代理與經營的品牌</h2>
        <p>吉他工坊不是單一品牌，而是以專業選琴邏輯整合多品牌產品。</p>
      </div>

      <div className="brand-grid">
        {brands.map((brand) => (
          <article className="brand-card" key={brand.name}>
            <p>{brand.title}</p>
            <h3>{brand.name}</h3>
            <span>{brand.description}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

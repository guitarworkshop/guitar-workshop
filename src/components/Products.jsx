import { products } from "../data/products";

function priceText(price) {
  return price ? `NT$ ${price.toLocaleString()}` : "歡迎洽詢";
}

export default function Products() {
  return (
    <section className="section products" id="products">
      <div className="section-title">
        <p className="eyebrow">Products</p>
        <h2>精選產品</h2>
        <p>目前先放主要產品資料，之後可依新品牌與新型號持續擴充。</p>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <div className="product-photo">{product.model.split("-")[0]}</div>
            <div className="product-info">
              <p>{product.brand}</p>
              <h3>{product.model}</h3>
              <span>{product.subtitle}</span>
              <strong>{priceText(product.price)}</strong>
              <div className="chips">
                {product.sellingPoints.map((point) => <em key={point}>{point}</em>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

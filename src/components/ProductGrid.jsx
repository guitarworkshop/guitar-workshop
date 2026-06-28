import { products } from "../data/products";

function formatPrice(price) {
  return price ? `NT$ ${price.toLocaleString()}` : "歡迎洽詢";
}

export default function ProductGrid() {
  return (
    <section className="section products" id="products">
      <div className="section-title row">
        <div>
          <p className="eyebrow">Featured Guitars</p>
          <h2>精選吉他</h2>
        </div>
        <a className="text-link" href="#contact">查看全部產品 →</a>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <div className="product-visual">
              <span>{product.imageCode}</span>
            </div>
            <div className="product-info">
              <p className="product-brand">{product.brand}</p>
              <h3>{product.model}</h3>
              <p>{product.subtitle}</p>
              <strong>{formatPrice(product.price)}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

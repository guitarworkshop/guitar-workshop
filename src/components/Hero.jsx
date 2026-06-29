export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" />
      <div className="hero-copy">
        <p className="eyebrow">Guitar Workshop Official</p>
        <h1>吉他工坊</h1>
        <h2>Every Guitar Has Its Story.</h2>
        <p>品牌代理、產品介紹、樂器行合作與選琴顧問。</p>
        <div className="hero-actions">
          <a className="btn primary" href="#advisor">開始選琴</a>
          <a className="btn secondary" href="#wholesale">樂器行合作</a>
        </div>
      </div>

      <div className="guitar-art" aria-hidden="true">
        <div className="neck" />
        <div className="body">
          <div className="hole" />
          <div className="bridge" />
        </div>
      </div>
    </section>
  );
}

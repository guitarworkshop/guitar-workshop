export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-shade" />
      <div className="hero-copy">
        <p className="eyebrow">Guitar Workshop</p>
        <h1>吉他工坊</h1>
        <h2>Every Guitar Has Its Story.</h2>
        <p>用心挑選每一把吉他，讓音樂成為生活的一部分。</p>
        <div className="hero-actions">
          <a className="btn primary" href="#collections">探索系列 <span>→</span></a>
          <a className="btn ghost" href="#advisor">AI 選琴顧問</a>
        </div>
      </div>

      <div className="hero-product" aria-hidden="true">
        <div className="guitar-neck" />
        <div className="guitar-body">
          <div className="sound-hole" />
          <div className="bridge" />
        </div>
      </div>

      <div className="hero-footer">
        <span>DADARWOOD</span>
        <span>ANISA</span>
        <span>EITMOSS</span>
      </div>
    </section>
  );
}

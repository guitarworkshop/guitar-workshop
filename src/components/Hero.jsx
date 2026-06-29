export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-grain" />
      <div className="hero-light hero-light-one" />
      <div className="hero-light hero-light-two" />

      <div className="hero-copy">
        <p className="eyebrow">Guitar Workshop Official</p>
        <h1>吉他工坊</h1>
        <h2>Every Guitar<br />Has Its Story.</h2>
        <p className="hero-description">
          從第一把琴開始，找到真正適合你的聲音。
        </p>

        <div className="hero-actions">
          <a className="btn primary" href="#collections">探索產品 <span>→</span></a>
          <a className="btn glass" href="#advisor">開始 AI 選琴 <span>→</span></a>
        </div>
      </div>

      <div className="hero-stage" aria-hidden="true">
        <div className="stage-ring ring-one" />
        <div className="stage-ring ring-two" />

        <div className="guitar-silhouette">
          <div className="guitar-head" />
          <div className="guitar-neck" />
          <div className="guitar-body">
            <div className="sound-hole" />
            <div className="bridge" />
            <div className="strings" />
          </div>
        </div>
      </div>

      <div className="hero-meta">
        <span>專業調整</span>
        <span>嚴選品牌</span>
        <span>樂器行合作</span>
      </div>
    </section>
  );
}

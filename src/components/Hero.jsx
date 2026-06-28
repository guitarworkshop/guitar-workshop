export default function Hero() {
  return (
    <section className="hero hero-v301" id="top">
      <div className="hero-grain" />
      <div className="hero-light hero-light-one" />
      <div className="hero-light hero-light-two" />

      <div className="hero-copy">
        <p className="eyebrow">Guitar Workshop Official</p>
        <h1>吉他工坊</h1>
        <h2>Every Guitar<br />Has Its Story.</h2>
        <p className="hero-description">從第一把琴開始，找到真正適合你的聲音。</p>
        <div className="hero-actions">
          <a className="btn primary" href="#collections">Explore Collection <span>→</span></a>
          <a className="btn glass" href="#advisor">AI Guitar Advisor</a>
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
        <span>DADARWOOD</span>
        <span>ANISA</span>
        <span>EITMOSS</span>
      </div>
    </section>
  );
}

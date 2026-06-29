export default function Header() {
  const links = [
    ["品牌系列", "#brands"],
    ["選琴顧問", "#advisor"],
    ["所有產品", "#products"],
    ["樂器行合作", "#wholesale"],
    ["聯絡我們", "#contact"]
  ];

  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <span className="brand-mark">GW</span>
        <span>
          <strong>吉他工坊</strong>
          <small>Guitar Workshop</small>
        </span>
      </a>

      <nav>
        {links.map(([label, href]) => (
          <a key={label} href={href}>{label}</a>
        ))}
      </nav>
    </header>
  );
}

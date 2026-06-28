import { Search, Menu } from "lucide-react";

export default function Header() {
  const links = [
    ["Collections", "#collections"],
    ["Products", "#products"],
    ["AI Advisor", "#advisor"],
    ["Wholesale", "#wholesale"],
    ["Contact", "#contact"]
  ];

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="吉他工坊首頁">
        <span className="brand-mark">GW</span>
        <span>
          <strong>吉他工坊</strong>
          <small>Guitar Workshop</small>
        </span>
      </a>

      <nav className="desktop-nav">
        {links.map(([label, href]) => (
          <a key={label} href={href}>{label}</a>
        ))}
      </nav>

      <div className="header-icons" aria-hidden="true">
        <Search size={19} />
        <Menu size={22} />
      </div>
    </header>
  );
}

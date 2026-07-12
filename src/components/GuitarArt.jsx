export default function GuitarArt({ compact = false }) {
  return (
    <svg className={compact ? 'guitar-art compact' : 'guitar-art'} viewBox="0 0 360 760" role="img" aria-label="吉他示意圖">
      <defs>
        <linearGradient id="wood" x1="0" x2="1">
          <stop offset="0" stopColor="#6b351b"/><stop offset=".48" stopColor="#cf8c45"/><stop offset="1" stopColor="#5a2817"/>
        </linearGradient>
        <radialGradient id="glow"><stop offset="0" stopColor="#f5ce87" stopOpacity=".55"/><stop offset="1" stopColor="#f5ce87" stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse cx="180" cy="420" rx="170" ry="260" fill="url(#glow)"/>
      <rect x="161" y="82" width="38" height="335" rx="18" fill="#472519"/>
      <rect x="169" y="20" width="22" height="85" rx="8" fill="#3a2018"/>
      <path d="M145 35 Q180 3 215 35 L204 90 Q180 108 156 90Z" fill="#5d321f"/>
      <path d="M180 350 C114 338 76 390 91 449 C20 483 36 619 123 645 C151 686 209 686 237 645 C324 619 340 483 269 449 C284 390 246 338 180 350Z" fill="url(#wood)" stroke="#e0aa66" strokeWidth="4"/>
      <circle cx="180" cy="470" r="42" fill="#1d1511" stroke="#e0aa66" strokeWidth="8"/>
      <rect x="174" y="512" width="12" height="120" rx="5" fill="#3d2419"/>
      {[0,1,2,3,4,5].map(i => <line key={i} x1={174+i*2.4} y1="85" x2={174+i*2.4} y2="630" stroke="#e9d7b7" strokeWidth=".8" opacity=".8"/>)}
      {[125,160,195,230,265,300].map(y => <line key={y} x1="160" y1={y} x2="200" y2={y} stroke="#b88a62" strokeWidth="2"/>)}
      <rect x="140" y="590" width="80" height="15" rx="5" fill="#2f211a"/>
    </svg>
  )
}

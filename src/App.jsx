import { useEffect, useMemo, useState } from 'react'
import { loadSiteData, truthy, driveToImage } from './data/loadData'
import GuitarArt from './components/GuitarArt'

const money = value => value === '' || value == null ? '價格洽詢' : `NT$ ${Number(value).toLocaleString('zh-TW')}`
const getSetting = (data, id, fallback = '') => data?.settings?.find(x => x['設定ID'] === id)?.['設定值'] || fallback

const BRAND_CONTENT = {
  DADARWOOD: {
    position: 'PREMIUM CRAFTSMANSHIP',
    motto: 'Crafted Through Tradition.',
    title: '源於工藝，忠於聲音。',
    intro: 'DADARWOOD 起源於世代相傳的手工製琴作坊。1983 年，德國製琴大師 Sebastian Stenzel 參與工藝指導，將精準的音梁排列、接柄角度與嚴謹選材融入每一把吉他。',
    highlights: [
      ['德國工藝', '以精準結構與穩定共鳴為核心，兼顧聲音與演奏性。'],
      ['嚴選木材', '透過敲擊與聆聽確認每一塊板材的天然共鳴。'],
      ['經典結構', '參考 Daniel Friederich 的設計理念，追求乾淨音色與良好殘響。'],
      ['精品系列', '以細緻選材、精準結構與完整製作工藝，呈現品牌對聲音與手感的追求。']
    ]
  },
  ANISA: {
    position: 'PERFORMANCE',
    motto: 'Every Note Deserves to Be Heard.',
    title: '為演奏而生。',
    intro: 'ANISA 誕生於台灣。品牌名稱來自兩位熱愛吉他的朋友，在第一線接觸演奏者需求後共同創造。它沒有虛構的百年歷史，而是從手感、聲音與真實演奏經驗開始。',
    highlights: [
      ['Performance First', '一切設計，都從演奏開始。'],
      ['Comfortable to Play', '好的吉他，應讓你忘記器材，只專注在音樂。'],
      ['Honest Sound', '忠於木材，也忠於每一次觸弦。'],
      ['Built for Musicians', '為真正熱愛音樂、希望持續進步的人而打造。']
    ]
  },
  'ST.MATTHEW': {
    position: 'CLASSIC HERITAGE',
    motto: 'Less is More.',
    title: '經典，留給聲音說話。',
    intro: 'St.Matthew 堅持 Less is More 的設計哲學，將焦點回歸木材、工藝與聲音本身。從選材、結構到演奏手感，每一個細節都經過反覆琢磨，只為讓演奏者在每一次撥弦時，都能感受到自然、純粹且富有層次的音色。',
    highlights: [
      ['精選材料', '重視木材搭配與整體聲音表現。'],
      ['亞洲手感', '以較容易掌握的琴頸設計，提升和弦轉換與演奏舒適度。'],
      ['細緻工藝', '從結構到裝飾，維持一致的完成度。'],
      ['為演奏者而生', '兼顧聲音、手感與長時間演奏的舒適度，讓演奏者能更專注於音樂。']
    ]
  },
  'DO ACOUSTIC': {
    position: 'INNOVATION',
    motto: 'Engineering the Sound.',
    title: '讓調整與聲音，同時進化。',
    intro: 'Do Acoustic 以聲學結構與演奏穩定性為核心。ANS 仰角調節接柄系統讓弦距可精準調整；HDT 蜂巢雙面板則以高剛度、低密度與更靈敏的振動回應，拓展聲音的動態與細節。',
    highlights: [
      ['ANS 接柄系統', '不需磨下弦枕即可調整接柄角度與弦距，兼顧手感與聲音。'],
      ['HDT 蜂巢雙面板', '以 NOMEX 蜂巢結構降低重量並提升剛性與穩定性。'],
      ['長期穩定', '針對溫濕度與長期張力造成的變化，提供更精準的調整方式。'],
      ['聲學旗艦', '從全單手工琴到 Mpro，聚焦靈敏度、動態與一致性。']
    ]
  }
}


const driveToImage = (url='') => {
  const m=String(url).match(/\/file\/d\/([^/]+)/)
  return m?`https://drive.google.com/thumbnail?id=${m[1]}&sz=w2000`:url
}

const normalizeBrand = name => {
  const n = String(name || '').toUpperCase().replace(/\s+/g, ' ').trim()
  if (n.includes('DADAR')) return 'DADARWOOD'
  if (n.includes('ANISA')) return 'ANISA'
  if (n.includes('MATTHEW')) return 'ST.MATTHEW'
  if (n.includes('DO ACOUSTIC') || n === 'DO') return 'DO ACOUSTIC'
  return n
}

function Header({ view, navigate, onOpenAdvisor }) {
  const [open, setOpen] = useState(false)
  const go = target => { navigate(target); setOpen(false) }
  return <header className="header">
    <button className="brandmark" onClick={() => go('home')} aria-label="回首頁"><span className="brandmark-icon">GW</span><span className="brandmark-copy"><b>吉他工坊</b><small>GUITAR WORKSHOP</small></span></button>
    <button className="menu" onClick={() => setOpen(!open)} aria-label="開啟選單">☰</button>
    <nav className={open ? 'open' : ''}>
      <button className={view === 'home' ? 'active' : ''} onClick={() => go('home')}>首頁</button>
      <button className={view === 'brands' || view === 'brand' ? 'active' : ''} onClick={() => go('brands')}>品牌</button>
      <button className={view === 'products' ? 'active' : ''} onClick={() => go('products')}>商品</button>
      <button onClick={onOpenAdvisor}>AI 選琴</button>
      <button className={view === 'about' ? 'active' : ''} onClick={() => go('about')}>關於我們</button>
    </nav>
  </header>
}

function ProductCard({ item, onClick }) {
  const { product, brand, features } = item
  return <article className="product-card" onClick={onClick} tabIndex="0" onKeyDown={e => e.key === 'Enter' && onClick()}>
    <div className="product-visual">{item.image ? <img src={item.image} alt={product['型號']} className="product-image"/> : <GuitarArt compact/>}{truthy(product['是否新品']) && <span className="badge">NEW</span>}</div>
    <div className="product-copy"><p>{brand?.['品牌名稱']}</p><h3>{product['型號']}</h3><div className="tags">{features.slice(0,2).map(f=><span key={f['特色ID'] || f['特色名稱']}>{f['特色名稱']}</span>)}</div><div className="card-foot"><strong>{money(product['售價'])}</strong><span>查看商品</span></div></div>
  </article>
}

function ProductModal({ item, onClose }) {
  if (!item) return null
  const { product, brand, spec, features } = item
  const fields = ['尺寸(吋)','桶身','缺角','面板結構','面板木材','側背板結構','側背板木材','琴頸','指板','琴橋','漆面','拾音器']
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal"><button className="close" onClick={onClose}>×</button><div className="modal-grid"><div className="modal-art">{item.image ? <img src={item.image} alt={product['型號']} className="product-image-large"/> : <GuitarArt/>}</div><div><p className="eyebrow">{brand?.['品牌名稱']}</p><h2>{product['型號']}</h2><div className="price">{money(product['售價'])}</div><p className="service-note">出貨前由專業技師調整弦距與手感，完成檢測後出貨，確保正常、不打弦。</p><div className="feature-list">{features.map(f => <span key={f['特色ID'] || f['特色名稱']}>✓ {f['特色名稱']}</span>)}</div><h3>商品規格</h3><dl className="spec-list">{fields.map(k => spec?.[k] ? <div key={k}><dt>{k}</dt><dd>{spec[k]}</dd></div> : null)}</dl><a className="primary full" href="#contact" onClick={onClose}>洽詢這把吉他</a></div></div></section></div>
}

function Advisor({ data, onClose, onPick }) {
  const [budget, setBudget] = useState(15000), [level, setLevel] = useState('初學'), [style, setStyle] = useState('彈唱'), [pickup, setPickup] = useState('不限')
  const ranked = useMemo(() => data.products.filter(p => truthy(p['是否上架']) && p['售價']).map(p => {
    const spec = data.specs.find(s => s['商品ID'] === p['商品ID']) || {}, ai = data.ai.find(a => a['商品ID'] === p['商品ID']) || {}
    let score = Math.max(0, 50 - Math.abs(Number(p['售價']) - budget) / 350)
    if (Number(p['售價']) <= budget) score += 18
    const key = style === '指彈' ? '指彈適合度' : style === '刷奏' ? '刷奏適合度' : '演奏適合度'
    score += Number(ai[key] || 6) * 3
    if (level === '初學') score += Number(ai['初學適合度'] || 6) * 2
    if (pickup === '需要' && spec['拾音器'] && spec['拾音器'] !== '無') score += 14
    if (pickup === '不需要' && (!spec['拾音器'] || spec['拾音器'] === '無')) score += 8
    return { p, score }
  }).sort((a,b) => b.score-a.score).slice(0,3), [budget, level, style, pickup, data])
  return <div className="modal-backdrop"><section className="advisor modal"><button className="close" onClick={onClose}>×</button><p className="eyebrow">GUITAR ADVISOR</p><h2>找到適合你的琴</h2><p>回答四個問題，從目前商品資料中選出較適合的型號。</p><div className="advisor-controls"><label>預算上限 <strong>{money(budget)}</strong><input type="range" min="5000" max="80000" step="1000" value={budget} onChange={e=>setBudget(Number(e.target.value))}/></label><label>程度<select value={level} onChange={e=>setLevel(e.target.value)}><option>初學</option><option>進階</option></select></label><label>主要用途<select value={style} onChange={e=>setStyle(e.target.value)}><option>彈唱</option><option>指彈</option><option>刷奏</option><option>演奏</option></select></label><label>拾音器<select value={pickup} onChange={e=>setPickup(e.target.value)}><option>不限</option><option>需要</option><option>不需要</option></select></label></div><div className="advisor-results">{ranked.map(({p},i) => <button key={p['商品ID']} onClick={()=>onPick(p)}><b>0{i+1}</b><span>{p['型號']}<small>{money(p['售價'])}</small></span><em>查看</em></button>)}</div></section></div>
}

export default function App() {
  const [data, setData] = useState(null), [view, setView] = useState('home'), [activeBrand, setActiveBrand] = useState(null), [brandFilter, setBrandFilter] = useState('all'), [search, setSearch] = useState(''), [selected, setSelected] = useState(null), [advisor, setAdvisor] = useState(false)
  useEffect(() => { loadSiteData().then(setData) }, [])
  if (!data) return <div className="loading"><GuitarArt compact/><p>正在載入吉他工坊...</p></div>
  console.log(data.photos)
  const brands = data.brands.filter(b => truthy(b['是否顯示']))
  const products = data.products.filter(p => truthy(p['是否上架']))
  const itemFor = p => {
  const photo=data.photos.find(ph=>ph['商品ID']===p['商品ID'] && ph['照片類型']==='主圖')
  return {
    product:p,
    brand:brands.find(b=>b['品牌ID']===p['品牌ID']),
    spec:data.specs.find(s=>s['商品ID']===p['商品ID']),
    features:data.features.filter(f=>f['商品ID']===p['商品ID'] && truthy(f['是否顯示'])),
    image: driveToImage(photo?.['GoogleDrive連結']||'')
  }
}
  const filtered = products.filter(p => (brandFilter === 'all' || p['品牌ID'] === brandFilter) && `${p['型號']} ${p['商品編號']}`.toLowerCase().includes(search.toLowerCase()))
  const featured = products.filter(p=>truthy(p['是否推薦']) || truthy(p['是否精選'])).slice(0,4)
  const phone=getSetting(data,'phone','0930-223-729'), line=getSetting(data,'line_url','#'), address=getSetting(data,'address','台中市東區十甲東路291號')

  const navigate = target => { setView(target); window.scrollTo({top:0,behavior:'smooth'}) }
  const goProducts = brandId => { setBrandFilter(brandId || 'all'); navigate('products') }
  const openBrand = b => { setActiveBrand(b); navigate('brand') }
  const currentBrand = activeBrand
  const currentBrandKey = normalizeBrand(currentBrand?.['品牌名稱'])
  const currentBrandContent = BRAND_CONTENT[currentBrandKey] || {
    position: currentBrand?.['品牌類型'] || 'BRAND', motto: 'Discover Your Sound.', title: currentBrand?.['品牌名稱'], intro: currentBrand?.['品牌簡介'] || '探索品牌理念與目前上架商品。', highlights: []
  }
  const currentBrandProducts = currentBrand ? products.filter(p=>p['品牌ID']===currentBrand['品牌ID']).slice(0,4) : []

  return <><Header view={view} navigate={navigate} onOpenAdvisor={()=>setAdvisor(true)}/><main>
    {view === 'home' && <>
      <section className="hero apple-hero"><div className="hero-copy"><p className="eyebrow">GUITAR WORKSHOP</p><h1><span>從第一把吉他</span><span>到陪伴一生的那一把</span></h1><span className="hero-rule" aria-hidden="true"></span><p>每一位演奏者，都值得找到真正適合自己的吉他。</p><div className="hero-actions"><button className="primary" onClick={()=>navigate('brands')}>探索品牌</button><button className="link-button" onClick={()=>setAdvisor(true)}>AI 選琴 <span aria-hidden="true">→</span></button></div></div><div className="hero-art"><GuitarArt/></div></section>
      <section className="hero-benefits" aria-label="吉他工坊服務特色"><article><span className="benefit-icon" aria-hidden="true">材</span><div><h3>嚴選材料</h3><p>精選優質木材<br/>成就穩定好聲音</p></div></article><article><span className="benefit-icon" aria-hidden="true">調</span><div><h3>專業調整</h3><p>出貨前技師調整<br/>弦距與手感</p></div></article><article><span className="benefit-icon" aria-hidden="true">檢</span><div><h3>品質檢測</h3><p>完整檢測流程<br/>確認最佳狀態</p></div></article><article><span className="benefit-icon" aria-hidden="true">伴</span><div><h3>音樂陪伴</h3><p>從練習到舞台<br/>陪伴每個時刻</p></div></article></section>

      <section className="brand-showcase">{brands.slice(0,4).map((b,i)=>{
        const key=normalizeBrand(b['品牌名稱']), c=BRAND_CONTENT[key]
        return <article className={`brand-panel panel-${i+1}`} key={b['品牌ID']}><div><p className="eyebrow">{c?.position || 'COLLECTION'}</p><h2>{b['品牌名稱']}</h2><p className="brand-motto">{c?.motto || b['品牌簡介']}</p><button className="link-button" onClick={()=>openBrand(b)}>探索品牌 ›</button></div><GuitarArt compact/></article>
      })}</section>

      <section className="section featured-home"><div className="center-head"><p className="eyebrow">FEATURED MODELS</p><h2>精選推薦</h2></div><div className="featured-grid">{featured.map(p=><ProductCard key={p['商品ID']} item={itemFor(p)} onClick={()=>setSelected(itemFor(p))}/>)}</div><div className="center-action"><button className="link-button dark" onClick={()=>goProducts()}>依分類瀏覽商品 ›</button></div></section>

      <section className="advisor-hero"><div><p className="eyebrow">GUITAR ADVISOR</p><h2>不知道從哪一把開始？</h2><p>告訴我們預算、程度與用途，快速取得三個建議。</p><button className="primary" onClick={()=>setAdvisor(true)}>開始選琴</button></div><div className="advisor-orb">AI</div></section>


    </>}

    {view === 'brands' && <section className="page-shell"><div className="page-title"><p className="eyebrow">OUR BRANDS</p><h1>探索品牌</h1></div><div className="brand-page-grid">{brands.map((b,i)=>{const c=BRAND_CONTENT[normalizeBrand(b['品牌名稱'])]; return <article key={b['品牌ID']}><div className="brand-page-art"><GuitarArt compact/></div><p className="eyebrow">{c?.position || `0${i+1}`}</p><h2>{b['品牌名稱']}</h2><p className="brand-motto-dark">{c?.motto || b['品牌簡介']}</p><button className="link-button dark" onClick={()=>openBrand(b)}>閱讀品牌故事 ›</button></article>})}</div></section>}

    {view === 'brand' && currentBrand && <>
      <section className="brand-detail-hero"><div><p className="eyebrow">{currentBrandContent.position}</p><h1>{currentBrand['品牌名稱']}</h1><h2>{currentBrandContent.title}</h2><p>{currentBrandContent.intro}</p><div className="hero-actions left"><button className="primary" onClick={()=>goProducts(currentBrand['品牌ID'])}>查看目前商品</button><button className="link-button" onClick={()=>navigate('brands')}>返回品牌 ›</button></div></div><div className="brand-detail-art"><GuitarArt/></div></section>
      <section className="brand-philosophy"><p className="brand-quote">“{currentBrandContent.motto}”</p><div className="philosophy-grid">{currentBrandContent.highlights.map(([title,copy],i)=><article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section className="section brand-products"><div className="center-head"><p className="eyebrow">CURRENT COLLECTION</p><h2>目前上架商品</h2></div><div className="featured-grid">{currentBrandProducts.map(p=><ProductCard key={p['商品ID']} item={itemFor(p)} onClick={()=>setSelected(itemFor(p))}/>)}</div><div className="center-action"><button className="link-button dark" onClick={()=>goProducts(currentBrand['品牌ID'])}>查看全部 ›</button></div></section>
    </>}

    {view === 'products' && <section className="page-shell products-page"><div className="page-title split"><div><p className="eyebrow">PRODUCTS</p><h1>全部商品</h1></div><div className="filters"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋型號..."/><select value={brandFilter} onChange={e=>setBrandFilter(e.target.value)}><option value="all">全部品牌</option>{brands.map(b=><option key={b['品牌ID']} value={b['品牌ID']}>{b['品牌名稱']}</option>)}</select></div></div><div className="category-strip"><button className={brandFilter==='all'?'active':''} onClick={()=>setBrandFilter('all')}>全部</button>{brands.map(b=><button key={b['品牌ID']} className={brandFilter===b['品牌ID']?'active':''} onClick={()=>setBrandFilter(b['品牌ID'])}>{b['品牌名稱']}</button>)}</div><div className="product-grid">{filtered.map(p=><ProductCard key={p['商品ID']} item={itemFor(p)} onClick={()=>setSelected(itemFor(p))}/>)}</div>{!filtered.length&&<p className="empty">目前沒有符合條件的商品。</p>}</section>}

    {view === 'about' && <section className="page-shell about-page"><div className="page-title"><p className="eyebrow">ABOUT GUITAR WORKSHOP</p><h1>吉他不只是規格，<br/>更重要的是手感與聲音。</h1></div><div className="about-grid"><div className="about-art"><GuitarArt/></div><div><p>吉他工坊提供木吉他與相關樂器的銷售、選琴諮詢及出貨前調整。我們不只比較品牌，而是從預算、材料、桶身與演奏需求，協助你選到真正適合長期使用的樂器。</p><p>所有上架商品以 Google Sheets 作為主要資料來源，品牌故事與技術內容則以實際型錄、產品資料與我們的品牌定位為基礎。</p><button className="primary" onClick={()=>setAdvisor(true)}>開始 AI 選琴</button></div></div></section>}
  </main>

  <section className="contact" id="contact"><div><p className="eyebrow">CONTACT</p><h2>來吉他工坊，<br/>找到適合你的琴。</h2></div><div className="contact-links"><a href={`tel:${phone}`}><span>電話</span><small>{phone}</small></a><a href={line}><span>LINE</span><small>加入好友</small></a><a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer"><span>門市</span><small>{address}</small></a></div></section>
  <footer><span>© 2026 Guitar Workshop</span><span>台中｜吉他銷售・調整・選琴諮詢</span></footer>
  {selected && <ProductModal item={selected} onClose={()=>setSelected(null)}/>} {advisor && <Advisor data={data} onClose={()=>setAdvisor(false)} onPick={p=>{setAdvisor(false);setSelected(itemFor(p))}}/>}
  </>
}

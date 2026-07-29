import { useEffect, useMemo, useRef, useState } from 'react'
import { loadSiteData, truthy, driveToImage } from './data/loadData'
import GuitarArt from './components/GuitarArt'

const parsePrice = value => {
  if (value === '' || value == null) return null
  const cleaned = String(value).replace(/[^0-9.-]/g, '')
  const number = Number(cleaned)
  return Number.isFinite(number) ? number : null
}

const money = value => {
  const number = parsePrice(value)
  return number == null ? '價格洽詢' : `NT$ ${number.toLocaleString('zh-TW')}`
}

const merchantReturnPolicy = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'TW',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 7,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/ReturnShippingFees'
}

const offerShippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'TW'
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 3,
      unitCode: 'DAY'
    },
    transitTime: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 3,
      unitCode: 'DAY'
    }
  }
}
const getSetting = (data, id, fallback = '') => data?.settings?.find(x => x['設定ID'] === id)?.['設定值'] || fallback
const isPublished = product =>
  product?.['Published'] !== ''
    ? truthy(product?.['Published'])
    : truthy(product?.['是否上架'])

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

const BRAND_IMAGES = {
  DADARWOOD: 'images/brands/dadarwood.webp',
  ANISA: 'images/brands/anisa.webp',
  'DO ACOUSTIC': 'images/brands/do-acoustic.webp',
  'ST.MATTHEW': 'images/brands/st-matthew.webp'
}

const KNOWLEDGE_ARTICLES = [{
  slug: 'solid-top-vs-laminate',
  category: '選琴基礎',
  title: '合板、面單、全單吉他差在哪？',
  excerpt: '從結構、聲音、價格與保養一次看懂，找到符合預算與演奏需求的第一把吉他。',
  readTime: '約 7 分鐘'
}]

const brandImage = name => `${import.meta.env.BASE_URL}${BRAND_IMAGES[normalizeBrand(name)] || ''}`



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
      <button className={view === 'knowledge' || view === 'article' ? 'active' : ''} onClick={() => go('knowledge')}>選琴知識</button>
      <button onClick={onOpenAdvisor}>AI 選琴</button>
      <button className={view === 'about' ? 'active' : ''} onClick={() => go('about')}>關於我們</button>
    </nav>
  </header>
}

const articleFromRow = row => ({
  slug: row['網址代號'] || '',
  category: row['分類'] || '選琴知識',
  title: row['標題'] || '',
  excerpt: row['摘要'] || '',
  image: driveToImage(row['封面圖片'] || ''),
  published: row['發布日期'] || '',
  updated: row['更新日期'] || row['發布日期'] || '',
  readTime: row['閱讀時間'] || '',
  seoTitle: row['SEO_Title'] || '',
  seoDescription: row['SEO_Description'] || row['摘要'] || '',
  body: row['內文'] || ''
})

function KnowledgeIndex({ articles, onOpenArticle }) {
  return <section className="page-shell knowledge-page">
    <div className="page-title knowledge-title"><p className="eyebrow">GUITAR GUIDE</p><h1>選琴知識</h1><p className="page-intro">不只看規格，從預算、材質與實際演奏需求，找到真正適合你的吉他。</p></div>
    <div className="knowledge-grid">{articles.map(article => <article className="knowledge-card" key={article.slug} role="link" tabIndex={0} onClick={() => onOpenArticle(article.slug)} onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onOpenArticle(article.slug)
      }
    }}>
      <div className="knowledge-card-visual" aria-hidden="true">{article.image ? <img src={article.image} alt=""/> : <><span>GW</span><b>選琴指南</b></>}</div>
      <div className="knowledge-card-copy"><p className="eyebrow">{article.category}</p><h2>{article.title}</h2><p>{article.excerpt}</p><div className="knowledge-meta"><span>更新：{article.updated}</span><span>{article.readTime}</span></div><button type="button" className="knowledge-link" onClick={event => {
        event.stopPropagation()
        onOpenArticle(article.slug)
      }}>閱讀完整文章 <span>→</span></button></div>
    </article>)}</div>
  </section>
}

const inlineText = text => String(text || '').split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
  part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part
)

function MarkdownArticle({ body }) {
  const lines = String(body || '').replace(/\r/g, '').split('\n')
  const blocks = []
  for (let i = 0; i < lines.length;) {
    const line = lines[i].trim()
    if (!line) { i += 1; continue }
    if (line.startsWith('|') && lines[i + 1]?.trim().match(/^\|[\s:|-]+\|$/)) {
      const rows = []
      rows.push(line.split('|').slice(1, -1).map(cell => cell.trim()))
      i += 2
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].trim().split('|').slice(1, -1).map(cell => cell.trim()))
        i += 1
      }
      blocks.push(<div className="guide-table-wrap" key={`table-${i}`}><table className="guide-table"><thead><tr>{rows[0].map((cell, x) => <th key={x}>{inlineText(cell)}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, y) => <tr key={y}>{row.map((cell, x) => x === 0 ? <th key={x}>{inlineText(cell)}</th> : <td key={x}>{inlineText(cell)}</td>)}</tr>)}</tbody></table></div>)
      continue
    }
    if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2))
        i += 1
      }
      blocks.push(<ul key={`list-${i}`}>{items.map((item, x) => <li key={x}>{inlineText(item)}</li>)}</ul>)
      continue
    }
    if (line.startsWith('## ')) blocks.push(<h2 key={i}>{line.slice(3)}</h2>)
    else if (line.startsWith('> ')) blocks.push(<div className="guide-callout" key={i}>{inlineText(line.slice(2))}</div>)
    else blocks.push(<p key={i}>{inlineText(line)}</p>)
    i += 1
  }
  return blocks
}

function SheetKnowledgeArticle({ article, onBack, onProducts, onAdvisor }) {
  return <article className="guide-article">
    <header className="guide-hero"><button className="product-back" onClick={onBack}>← 返回選琴知識</button><p className="eyebrow">{article.category}</p><h1>{article.title}</h1><p className="guide-lead">{article.excerpt}</p><div className="knowledge-meta"><span>吉他工坊編輯</span><span>更新於 {article.updated}</span><span>{article.readTime}</span></div></header>
    <div className="guide-layout"><button type="button" className="guide-summary guide-summary-link" onClick={onBack} aria-label="查看所有選琴知識文章"><p className="eyebrow">GUITAR GUIDE</p><h2>選琴知識</h2><p>從預算、材質與實際演奏需求，找到真正適合你的吉他。</p><span>查看所有文章 →</span></button><div className="guide-content"><MarkdownArticle body={article.body}/><section className="guide-cta"><p className="eyebrow">NEXT STEP</p><h2>還是不確定哪一把適合你？</h2><p>告訴我們預算、程度與主要用途，先從目前商品中縮小範圍。</p><div className="hero-actions left"><button className="primary" onClick={onAdvisor}>使用 AI 選琴</button><button className="link-button dark" onClick={onProducts}>查看全部商品 →</button></div></section></div></div>
  </article>
}

function KnowledgeArticle({ onBack, onProducts, onAdvisor }) {
  return <article className="guide-article">
    <header className="guide-hero"><button className="product-back" onClick={onBack}>← 返回選琴知識</button><p className="eyebrow">選琴基礎</p><h1>合板、面單、全單吉他差在哪？</h1><p className="guide-lead">買吉他時最常看到的三個名詞，其實是在說「琴身使用多少實木」。它們會影響聲音、價格、耐候性，也會影響你彈了一段時間後是否容易想升級。</p><div className="knowledge-meta"><span>吉他工坊編輯</span><span>更新於 2026 年 7 月 29 日</span><span>約 7 分鐘</span></div></header>
    <div className="guide-layout">
      <aside className="guide-summary"><p className="eyebrow">先看結論</p><h2>怎麼選最快？</h2><ul><li><b>預算約 4,000～5,000：</b>合板琴適合先確認自己是否會持續學習。</li><li><b>預算約 7,000～20,000：</b>面單琴通常是初學者最均衡、也最不容易後悔的選擇。</li><li><b>預算 20,000 以上：</b>若做工與手感合適，優先試全單琴，聲音成長與細節通常更完整。</li></ul></aside>
      <div className="guide-content">
        <section><h2>先弄懂：面板為什麼最重要？</h2><p>吉他的面板就像聲音的引擎。琴弦振動經過琴橋傳到面板，面板推動空氣，形成我們聽到的音色與音量。因此，同樣的外型與尺寸下，面板結構往往比華麗裝飾更直接影響聲音。</p></section>
        <section><h2>合板吉他：穩定、入門門檻低</h2><p>合板是由多層薄木材貼合而成，面板與側背板通常都使用合板。它對溫濕度變化較不敏感、價格也較容易入手，適合預算有限或還不確定是否會持續彈琴的人。</p><p>聲音上，合板的振動會受到膠合層限制，通常較集中、泛音與細節較少。有些琴聽起來會比較「轟」或鬆散；練習一段時間、耳朵開始進步後，也比較容易產生升級需求。</p><div className="guide-callout"><b>適合誰：</b>預算優先、環境變化大、想先用較低成本開始學習的人。</div></section>
        <section><h2>面單吉他：初學到進階最均衡</h2><p>面單的面板使用一整片實木，側板與背板仍是合板。因為最主要的發聲面改為實木，聲音通常比合板更紮實、清楚，動態與細節也更好。</p><p>對多數初學者來說，面單是最划算的長期選擇。它的價格不像全單那麼高，卻已能提供明顯的聲音提升，也足以陪伴練習、彈唱、錄音與小型演出。若預算允許，我們通常會建議第一把正式學習用琴從面單開始。</p><div className="guide-callout"><b>適合誰：</b>確定想持續學習，希望手感與聲音能陪伴數年的初學者與進階玩家。</div></section>
        <section><h2>全單吉他：更完整的共鳴與聲音成長</h2><p>全單代表面板、側板與背板都使用實木。整個琴身能更自由地參與振動，因此通常擁有更豐富的泛音、細節、動態與空間感。隨著演奏時間增加，木材也可能逐漸展現更開放的聲音。</p><p>不過，「全單」不等於一定勝過所有面單。木材等級、結構設計、製作精度與琴頸手感同樣重要。選購時應該實際比較兩把琴，而不是只看標籤。若預算已到兩萬元以上，建議把做工良好的全單納入試琴清單。</p><div className="guide-callout"><b>適合誰：</b>重視音色細節、動態與長期演奏價值，且願意做好濕度管理的人。</div></section>
        <section><h2>三種結構快速比較</h2><div className="guide-table-wrap"><table className="guide-table"><thead><tr><th>項目</th><th>合板</th><th>面單</th><th>全單</th></tr></thead><tbody><tr><th>木材結構</th><td>面、側、背皆合板</td><td>實木面板＋合板側背</td><td>面、側、背皆實木</td></tr><tr><th>聲音表現</th><td>基本、較集中</td><td>紮實清楚、均衡</td><td>細節豐富、動態較大</td></tr><tr><th>耐候性</th><td>較高</td><td>中等</td><td>需注意濕度</td></tr><tr><th>常見預算</th><td>約 4,000～5,000</td><td>約 7,000～20,000</td><td>約 20,000 以上</td></tr><tr><th>適合對象</th><td>嘗試入門</td><td>多數初學與進階者</td><td>重視音色的長期玩家</td></tr></tbody></table></div></section>
        <section><h2>別只看「單板」，手感也同樣重要</h2><p>一把規格漂亮但弦距過高、琴頸不順手的吉他，仍可能讓練習變得吃力。選琴時應同時確認桶身尺寸、琴頸手感、弦距、音準與是否打弦。吉他工坊的上架商品在出貨前都會由專業技師調整弦距與手感，完成檢測後再交付。</p></section>
        <section className="guide-cta"><p className="eyebrow">NEXT STEP</p><h2>還是不確定哪一種適合你？</h2><p>告訴我們預算、程度與主要用途，先從目前商品中縮小範圍，再比較真正有意義的差異。</p><div className="hero-actions left"><button className="primary" onClick={onAdvisor}>使用 AI 選琴</button><button className="link-button dark" onClick={onProducts}>查看全部商品 →</button></div></section>
      </div>
    </div>
  </article>
}

function ProductCard({ item, onClick }) {
  const { product, brand, features } = item
  return <article className="product-card" onClick={onClick} tabIndex="0" onKeyDown={e => e.key === 'Enter' && onClick()}>
    <div className="product-visual">{item.image ? <img src={item.image} alt={product['型號']} className="product-image"/> : <GuitarArt compact/>}{truthy(product['是否新品']) && <span className="badge">NEW</span>}</div>
    <div className="product-copy"><p>{brand?.['品牌名稱']}</p><h3>{product['型號']}</h3><div className="tags">{features.slice(0,2).map(f=><span key={f['特色ID'] || f['特色名稱']}>{f['特色名稱']}</span>)}</div><div className="card-foot"><strong>{money(product['售價'])}</strong><span>查看商品</span></div></div>
  </article>
}

function getYouTubeId(value) {
  const url = String(value || '').trim()
  if (!url) return ''
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{6,})/)
  return match?.[1] || ''
}

function ProductDetail({ item, onBack }) {
  const { product, brand, spec, features } = item
  const fields = ['尺寸(吋)','桶身','缺角','面板結構','面板木材','側背板結構','側背板木材','琴頸','指板','琴橋','漆面','拾音器']
  const images = item.images?.length ? item.images : (item.image ? [{ src: item.image, label: '主圖' }] : [])
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 })
  const touchStart = useRef(null)

  useEffect(() => {
    setActiveIndex(0)
    setLightboxOpen(false)
  }, [product['商品ID']])

  const activeImage = images[activeIndex]
  const showPrevious = () => setActiveIndex(index => (index - 1 + images.length) % images.length)
  const showNext = () => setActiveIndex(index => (index + 1) % images.length)

  useEffect(() => {
    if (!lightboxOpen) return undefined
    const onKeyDown = event => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowLeft' && images.length > 1) showPrevious()
      if (event.key === 'ArrowRight' && images.length > 1) showNext()
    }
    document.body.classList.add('lightbox-open')
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('lightbox-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxOpen, images.length])

  const handlePointerMove = event => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    setZoom({
      active: true,
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100
    })
  }

  const handleTouchStart = event => {
    touchStart.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = event => {
    const startX = touchStart.current
    const endX = event.changedTouches[0]?.clientX
    touchStart.current = null
    if (startX == null || endX == null || images.length < 2) return
    const distance = endX - startX
    if (Math.abs(distance) < 45) return
    if (distance > 0) showPrevious()
    else showNext()
  }

  const videoUrl = [
    product['YouTube網址'], product['影片網址'], product['試聽網址'], product['YouTube'],
    spec?.['YouTube網址'], spec?.['影片網址'], spec?.['試聽網址']
  ].find(Boolean) || ''
  const youtubeId = getYouTubeId(videoUrl)

  return <section className="product-detail-page">
    <button className="product-back" onClick={onBack}>← 返回全部商品</button>
    <div className="product-detail-grid">
      <div className="product-gallery">
        <div
          className={`product-detail-art ${zoom.active ? 'is-zooming' : ''}`}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setZoom(current => ({ ...current, active: false }))}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {activeImage ? <button
            type="button"
            className="gallery-main-button"
            onClick={() => setLightboxOpen(true)}
            aria-label="放大商品照片"
          >
            <img
              src={activeImage.src}
              alt={`${brand?.['品牌名稱'] || ''} ${product['型號']} ${activeImage.label || ''}`.trim()}
              className="product-image-large"
              style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }}
            />
            <span className="gallery-expand-hint">點擊放大</span>
          </button> : <GuitarArt/>}
          {images.length > 1 && <>
            <button type="button" className="gallery-arrow previous" onClick={event => { event.stopPropagation(); showPrevious() }} aria-label="上一張照片">‹</button>
            <button type="button" className="gallery-arrow next" onClick={event => { event.stopPropagation(); showNext() }} aria-label="下一張照片">›</button>
            <span className="gallery-counter">{activeIndex + 1} / {images.length}</span>
          </>}
        </div>

        {images.length > 1 && <div className="product-thumbnails" aria-label="商品照片縮圖">
          {images.map((image, index) => <button
            type="button"
            key={`${image.src}-${index}`}
            className={index === activeIndex ? 'active' : ''}
            onClick={() => setActiveIndex(index)}
            aria-label={`查看第 ${index + 1} 張照片${image.label ? `：${image.label}` : ''}`}
          >
            <img src={image.src} alt="" />
            {image.label && <span>{image.label}</span>}
          </button>)}
        </div>}
        {images.length > 1 && <p className="gallery-mobile-tip">手機可左右滑動照片</p>}
      </div>

      <div className="product-detail-copy">
        <p className="eyebrow">{brand?.['品牌名稱']}</p>
        <h1>{product['型號']}</h1>
        <div className="price">{money(product['售價'])}</div>
        <p className="service-note">出貨前由專業技師調整弦距與手感，完成檢測後出貨，確保正常、不打弦。</p>
        <div className="feature-list">{features.map(f => <span key={f['特色ID'] || f['特色名稱']}>✓ {f['特色名稱']}</span>)}</div>
        <h2>商品規格</h2>
        <dl className="spec-list">{fields.map(k => spec?.[k] ? <div key={k}><dt>{k}</dt><dd>{spec[k]}</dd></div> : null)}</dl>
        {youtubeId && <section className="product-video">
          <h2>試聽與介紹</h2>
          <div className="video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}`} title={`${product['型號']} 試聽與介紹`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
        </section>}
        {!youtubeId && videoUrl && <a className="video-link" href={videoUrl} target="_blank" rel="noreferrer">觀看試聽／介紹影片 ↗</a>}
        <section className="purchase-policy" aria-labelledby="purchase-policy-title">
          <h2 id="purchase-policy-title">配送與退貨說明</h2>
          <dl>
            <div><dt>配送範圍</dt><dd>台灣地區</dd></div>
            <div><dt>運費</dt><dd>依商品與配送地區另行報價，訂購前請先洽詢確認。</dd></div>
            <div><dt>配送時間</dt><dd>確認訂購後 1～3 天出貨，寄出後約 1～3 天送達。</dd></div>
            <div><dt>退貨申請</dt><dd>收到商品後 7 天內可提出申請；非商品瑕疵退貨，退回運費由買家負擔。</dd></div>
          </dl>
        </section>
        <a className="primary full" href="#contact">洽詢這把吉他</a>
      </div>
    </div>

    {lightboxOpen && activeImage && <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="商品照片瀏覽器" onMouseDown={event => event.target === event.currentTarget && setLightboxOpen(false)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <button type="button" className="lightbox-close" onClick={() => setLightboxOpen(false)} aria-label="關閉照片">×</button>
      {images.length > 1 && <button type="button" className="lightbox-arrow previous" onClick={showPrevious} aria-label="上一張照片">‹</button>}
      <figure><img src={activeImage.src} alt={`${brand?.['品牌名稱'] || ''} ${product['型號']} ${activeImage.label || ''}`.trim()} /><figcaption>{activeImage.label || `${activeIndex + 1} / ${images.length}`}</figcaption></figure>
      {images.length > 1 && <button type="button" className="lightbox-arrow next" onClick={showNext} aria-label="下一張照片">›</button>}
      {images.length > 1 && <span className="lightbox-counter">{activeIndex + 1} / {images.length}</span>}
    </div>}
  </section>
}

function Advisor({ data, onClose, onPick }) {
  const [budget, setBudget] = useState(15000), [level, setLevel] = useState('初學'), [style, setStyle] = useState('彈唱'), [pickup, setPickup] = useState('不限')
  const ranked = useMemo(() => data.products.filter(p => truthy(p['是否上架']) && p['售價']).map(p => {
    const spec = (data.specs || []).find(s => s['商品ID'] === p['商品ID']) || {}, ai = (data.ai || []).find(a => a['商品ID'] === p['商品ID']) || {}
    const price = parsePrice(p['售價'])
    let score = Math.max(0, 50 - Math.abs((price ?? budget) - budget) / 350)
    if (price != null && price <= budget) score += 18
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
  const initialPath = window.location.pathname.replace(/^\/guitar-workshop/, '') || '/'
  const [locationPath, setLocationPath] = useState(initialPath)
  const [data, setData] = useState(null), [brandFilter, setBrandFilter] = useState('all'), [search, setSearch] = useState(''), [advisor, setAdvisor] = useState(false)
  useEffect(() => {
    const onPopState = () => setLocationPath(window.location.pathname.replace(/^\/guitar-workshop/, '') || '/')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  useEffect(() => {
    let cancelled = false

    loadSiteData().then(result => {
      if (!cancelled) setData(result)
    })

    return () => { cancelled = true }
  }, [])
  const safeData = data || { brands: [], products: [], specs: [], ai: [], photos: [], features: [], settings: [], articles: [] }
  const brands = safeData.brands.filter(b => truthy(b['是否顯示']))
  const products = safeData.products.filter(isPublished)
  const sheetArticles = (safeData.articles || []).filter(row => truthy(row['是否發布'])).map(articleFromRow).filter(article => article.slug && article.title)
  const articles = sheetArticles.length ? sheetArticles : KNOWLEDGE_ARTICLES
  const itemFor = p => {
    const clean = value => String(value ?? '').trim()
    const normalizeModel = value => clean(value).toUpperCase().replace(/\s+/g, ' ').replace(/[–—]/g, '-')
    const productId = clean(p['商品ID'])
    const model = normalizeModel(p['型號'])
    const matchesProduct = row => {
      const rowId = clean(row?.['商品ID'])
      const rowModel = normalizeModel(row?.['型號'])
      return (productId && rowId === productId) || (model && rowModel === model)
    }

    const productPhotos = (safeData.photos || [])
      .filter(ph => matchesProduct(ph) && (!ph['網站顯示'] || truthy(ph['網站顯示'])))
      .sort((a, b) => Number(a['排序'] || 9999) - Number(b['排序'] || 9999))

    const photo =
      productPhotos.find(ph => clean(ph['照片類型']) === '主圖') ||
      productPhotos[0]

    return {
      product: p,
      brand: brands.find(b => clean(b['品牌ID']) === clean(p['品牌ID'])),
      spec: (safeData.specs || []).find(matchesProduct),
      features: (safeData.features || [])
        .filter(f => matchesProduct(f) && truthy(f['是否顯示']))
        .sort((a, b) => Number(a['排序'] || 9999) - Number(b['排序'] || 9999)),
      photos: productPhotos,
      images: productPhotos
        .map(ph => ({
          src: driveToImage(ph?.['GoogleDrive連結'] || ''),
          label: clean(ph?.['照片名稱']) || clean(ph?.['照片類型']) || '',
          type: clean(ph?.['照片類型'])
        }))
        .filter(image => image.src),
      image: driveToImage(photo?.['GoogleDrive連結'] || '')
    }
  }

  const filtered = products.filter(p => (brandFilter === 'all' || p['品牌ID'] === brandFilter) && `${p['型號']} ${p['商品編號']}`.toLowerCase().includes(search.toLowerCase()))
  const featured = products.filter(p=>truthy(p['是否推薦']) || truthy(p['是否精選'])).slice(0,4)

  const representativeItemForBrand = brand => {
    if (!brand) return null
    const brandProducts = products.filter(p => String(p['品牌ID'] || '').trim() === String(brand['品牌ID'] || '').trim())
    const preferred = brandProducts.find(p => truthy(p['是否推薦']) || truthy(p['是否精選']))
    const ordered = preferred ? [preferred, ...brandProducts.filter(p => p !== preferred)] : brandProducts
    for (const product of ordered) {
      const item = itemFor(product)
      if (item.image) return item
    }
    return ordered[0] ? itemFor(ordered[0]) : null
  }

  const heroItem = (() => {
    const preferred = [...featured, ...products]
    for (const product of preferred) {
      const item = itemFor(product)
      if (item.image) return item
    }
    return null
  })()

  const aboutItem = (() => {
    const preferred = products.slice().reverse()
    for (const product of preferred) {
      const item = itemFor(product)
      if (item.image) return item
    }
    return heroItem
  })()
  const phone=getSetting(safeData,'phone','0930-223-729'), line=getSetting(safeData,'line_url','#'), address=getSetting(safeData,'address','台中市東區十甲東路291號')

  const path = locationPath
  const brandSlug = value => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\./g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const productSlug = path.startsWith('/product/') ? decodeURIComponent(path.split('/')[2] || '') : ''
  const articleSlug = path.startsWith('/knowledge/') ? decodeURIComponent(path.split('/')[2] || '') : ''
  const brandPathValue = path.startsWith('/brand/') || path.startsWith('/brands/')
    ? decodeURIComponent(path.split('/')[2] || '')
    : ''
  const view = productSlug ? 'product' : articleSlug ? 'article' : brandPathValue ? 'brand' : path === '/brands' ? 'brands' : path === '/products' ? 'products' : path === '/knowledge' ? 'knowledge' : path === '/about' ? 'about' : 'home'
  const navigate = target => {
    const routes = { home: '/', brands: '/brands', products: '/products', knowledge: '/knowledge', about: '/about' }
    const next = routes[target] || target
    window.history.pushState({}, '', `${import.meta.env.BASE_URL.replace(/\/$/, '')}${next}`)
    setLocationPath(next)
    window.scrollTo({top:0,behavior:'smooth'})
  }
  const goProducts = brandId => { setBrandFilter(brandId || 'all'); navigate('/products') }
  const openBrand = b => navigate(`/brand/${encodeURIComponent(brandSlug(b['品牌名稱']) || b['品牌ID'])}`)
  const openProduct = p => navigate(`/product/${encodeURIComponent(p.slug)}`)
  const currentBrand = brands.find(b =>
    String(b['品牌ID']) === brandPathValue ||
    brandSlug(b['品牌名稱']) === String(brandPathValue).toLowerCase()
  )
  const currentBrandKey = normalizeBrand(currentBrand?.['品牌名稱'])
  const currentBrandContent = BRAND_CONTENT[currentBrandKey] || {
    position: currentBrand?.['品牌類型'] || 'BRAND', motto: 'Discover Your Sound.', title: currentBrand?.['品牌名稱'], intro: currentBrand?.['品牌簡介'] || '探索品牌理念與目前上架商品。', highlights: []
  }
  const currentBrandProducts = currentBrand ? products.filter(p=>p['品牌ID']===currentBrand['品牌ID']).slice(0,4) : []
  const currentProduct = productSlug ? products.find(p => p.slug === productSlug) : null
  const currentProductItem = currentProduct ? itemFor(currentProduct) : null
  const currentArticle = articleSlug ? articles.find(article => article.slug === articleSlug) : null

  useEffect(() => {
    const base = 'https://guitarworkshop.github.io/guitar-workshop'
    let title = '吉他工坊｜木吉他・電吉他・品牌吉他推薦'
    let description = '吉他工坊提供木吉他選購、專業調整與 AI 選琴服務，探索 DADARWOOD、ANISA、ST.MATTHEW、DO ACOUSTIC 等品牌。'
    const canonical = `${base}${locationPath === '/' ? '/' : locationPath}`
    let image = ''

    if (currentProductItem) {
      const { product, brand, spec } = currentProductItem
      title = product['SEO_Title'] || `${product['型號']}｜${brand?.['品牌名稱'] || '吉他'}｜吉他工坊`
      description = product['SEO_Description'] || `${product['型號']}，${[spec?.['面板結構'], spec?.['面板木材'], spec?.['側背板木材']].filter(Boolean).join('・')}。出貨前由專業技師調整弦距與手感，完成檢測後出貨。`
      image = currentProductItem.image || ''
    } else if (currentBrand) {
      title = `${currentBrand['品牌名稱']} 吉他｜品牌介紹與商品｜吉他工坊`
      description = currentBrandContent.intro
    } else if (view === 'products') {
      title = '全部吉他商品｜木吉他・電吉他｜吉他工坊'
      description = '瀏覽吉他工坊目前上架的吉他商品，依品牌、型號與需求快速選琴。'
    } else if (view === 'knowledge') {
      title = '選琴知識｜初學吉他選購與保養指南｜吉他工坊'
      description = '吉他工坊選琴知識，從預算、合板面單全單、尺寸、木材與手感，幫助初學者選到真正適合的吉他。'
    } else if (view === 'article' && currentArticle) {
      title = currentArticle.seoTitle || `${currentArticle.title}｜吉他工坊`
      description = currentArticle.seoDescription || currentArticle.excerpt
      image = currentArticle.image || ''
    }

    document.title = title
    const setMeta = (selector, attributes, value) => {
      let element = document.head.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        Object.entries(attributes).forEach(([key, val]) => element.setAttribute(key, val))
        document.head.appendChild(element)
      }
      element.setAttribute('content', value)
    }
    setMeta('meta[name="description"]', { name: 'description' }, description)
    setMeta('meta[property="og:title"]', { property: 'og:title' }, title)
    setMeta('meta[property="og:description"]', { property: 'og:description' }, description)
    setMeta('meta[property="og:url"]', { property: 'og:url' }, canonical)
    if (image) {
      setMeta('meta[property="og:image"]', { property: 'og:image' }, image)
      setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
      setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, image)
    }

    let canonicalLink = document.head.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.rel = 'canonical'
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.href = canonical

    document.getElementById('page-schema')?.remove()
    const pageSchema = document.createElement('script')
    pageSchema.id = 'page-schema'
    pageSchema.type = 'application/ld+json'
    const schemas = [{
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${base}/#business`,
      name: '吉他工坊',
      url: `${base}/`,
      telephone: phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressLocality: '台中市',
        addressCountry: 'TW'
      }
    }, {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${base}/#website`,
      name: '吉他工坊',
      url: `${base}/`,
      inLanguage: 'zh-Hant-TW'
    }]
    if (currentProductItem) {
      const { product, brand, spec } = currentProductItem
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product['型號'],
        brand: { '@type': 'Brand', name: brand?.['品牌名稱'] || '' },
        image: currentProductItem.images?.map(entry => entry.src) || (image ? [image] : undefined),
        description,
        sku: product['商品編號'] || product['商品ID'],
        offers: parsePrice(product['售價']) != null ? {
          '@type': 'Offer',
          priceCurrency: 'TWD',
          price: parsePrice(product['售價']),
          availability: String(product['庫存狀態'] || '').includes('缺貨')
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
          url: canonical,
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': `${base}/#business` },
          shippingDetails: offerShippingDetails,
          hasMerchantReturnPolicy: merchantReturnPolicy
        } : undefined,
        additionalProperty: Object.entries(spec || {})
          .filter(([key, value]) => value && !['商品ID', '型號'].includes(key))
          .map(([name, value]) => ({ '@type': 'PropertyValue', name, value }))
      }, {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: '全部商品', item: `${base}/products` },
          { '@type': 'ListItem', position: 3, name: product['型號'], item: canonical }
        ]
      })
    } else if (view === 'article' && currentArticle) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: currentArticle.title,
        description,
        image: currentArticle.image || undefined,
        datePublished: currentArticle.published || undefined,
        dateModified: currentArticle.updated || currentArticle.published || undefined,
        inLanguage: 'zh-Hant-TW',
        author: { '@type': 'Organization', name: '吉他工坊', url: `${base}/` },
        publisher: { '@id': `${base}/#business` },
        mainEntityOfPage: canonical
      }, {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: '選琴知識', item: `${base}/knowledge/` },
          { '@type': 'ListItem', position: 3, name: currentArticle.title, item: canonical }
        ]
      })
    }
    pageSchema.textContent = JSON.stringify(schemas)
    document.head.appendChild(pageSchema)
  }, [locationPath, view, currentBrand, currentBrandContent.intro, currentProductItem, currentArticle])

  if (!data) return <div className="loading"><GuitarArt compact/><p>正在載入吉他工坊...</p></div>

  return <><Header view={view} navigate={navigate} onOpenAdvisor={()=>setAdvisor(true)}/><main>
    {view === 'home' && <>
      <section className="hero apple-hero home-hero-banner" aria-label="吉他工坊首頁主視覺"><div className="hero-copy"><p className="eyebrow">GUITAR WORKSHOP</p><h1><span>從第一把吉他</span><span>到陪伴一生的</span><span>那一把</span></h1><span className="hero-rule" aria-hidden="true"></span><p>每一位演奏者，都值得找到真正適合自己的吉他。</p><div className="hero-actions"><button className="primary" onClick={()=>navigate('brands')}>探索品牌</button><button className="link-button" onClick={()=>setAdvisor(true)}>AI 選琴 <span aria-hidden="true">→</span></button></div></div></section>
      <section className="hero-benefits" aria-label="吉他工坊服務特色"><article><span className="benefit-icon" aria-hidden="true">材</span><div><h3>嚴選材料</h3><p>精選優質木材<br/>成就穩定好聲音</p></div></article><article><span className="benefit-icon" aria-hidden="true">調</span><div><h3>專業調整</h3><p>出貨前技師調整<br/>弦距與手感</p></div></article><article><span className="benefit-icon" aria-hidden="true">檢</span><div><h3>品質檢測</h3><p>完整檢測流程<br/>確認最佳狀態</p></div></article><article><span className="benefit-icon" aria-hidden="true">伴</span><div><h3>音樂陪伴</h3><p>從練習到舞台<br/>陪伴每個時刻</p></div></article></section>

      <section className="brand-showcase">{brands.slice(0,4).map((b,i)=>{
        const key=normalizeBrand(b['品牌名稱']), c=BRAND_CONTENT[key]
        return <article className={`brand-panel brand-banner panel-${i+1}`} key={b['品牌ID']} style={{'--brand-image': `url("${brandImage(b['品牌名稱'])}")`}}><div className="brand-panel-copy"><p className="eyebrow">{c?.position || 'COLLECTION'}</p><h2>{b['品牌名稱']}</h2><p className="brand-motto">{c?.motto || b['品牌簡介']}</p><button className="brand-cta" onClick={()=>openBrand(b)}>探索品牌 <span aria-hidden="true">→</span></button></div></article>
      })}</section>

      <section className="section featured-home"><div className="center-head"><p className="eyebrow">FEATURED MODELS</p><h2>精選推薦</h2></div><div className="featured-grid">{featured.map(p=><ProductCard key={p['商品ID']} item={itemFor(p)} onClick={()=>openProduct(p)}/>)}</div><div className="center-action"><button className="link-button dark" onClick={()=>goProducts()}>依分類瀏覽商品 ›</button></div></section>

      <section className="advisor-hero"><div><p className="eyebrow">GUITAR ADVISOR</p><h2>不知道從哪一把開始？</h2><p>告訴我們預算、程度與用途，快速取得三個建議。</p><button className="primary" onClick={()=>setAdvisor(true)}>開始選琴</button></div><div className="advisor-orb">AI</div></section>

      {articles[0] && <section className="section knowledge-home"><div className="center-head"><p className="eyebrow">GUITAR GUIDE</p><h2>選琴知識</h2><p>從材質、尺寸與預算開始，找到真正適合自己的吉他。</p></div><button type="button" className="knowledge-feature" onClick={()=>navigate(`/knowledge/${articles[0].slug}`)} aria-label={`閱讀文章：${articles[0].title}`}><span><small>最新文章・{articles[0].category}・{articles[0].readTime}</small><b>{articles[0].title}</b></span><em>閱讀文章 →</em></button><div className="knowledge-home-action"><button type="button" className="link-button dark" onClick={()=>navigate('knowledge')}>查看全部選琴文章 →</button></div></section>}
    </>}

    {view === 'brands' && <section className="page-shell brands-page"><div className="page-title"><p className="eyebrow">OUR BRANDS</p><h1>探索品牌</h1><p className="page-intro">四種聲音性格，找到與你最契合的那一把。</p></div><div className="brand-page-grid">{brands.map((b,i)=>{const c=BRAND_CONTENT[normalizeBrand(b['品牌名稱'])]; return <article className="brand-story-card" key={b['品牌ID']} style={{'--brand-image': `url("${brandImage(b['品牌名稱'])}")`}}><div className="brand-story-copy"><p className="eyebrow">{c?.position || `0${i+1}`}</p><h2>{b['品牌名稱']}</h2><p>{c?.motto || b['品牌簡介']}</p><button className="brand-cta" onClick={()=>openBrand(b)}>閱讀品牌故事 <span aria-hidden="true">→</span></button></div></article>})}</div></section>}

    {view === 'brand' && currentBrand && <>
      <section className="brand-detail-hero brand-detail-banner" style={{'--brand-image': `url("${brandImage(currentBrand['品牌名稱'])}")`}}><div className="brand-detail-copy"><p className="eyebrow">{currentBrandContent.position}</p><h1>{currentBrand['品牌名稱']}</h1><h2>{currentBrandContent.title}</h2><p>{currentBrandContent.intro}</p><div className="hero-actions left"><button className="primary light" onClick={()=>goProducts(currentBrand['品牌ID'])}>查看目前商品</button><button className="brand-cta" onClick={()=>navigate('brands')}>返回品牌 <span aria-hidden="true">→</span></button></div></div></section>
      <section className="brand-philosophy"><p className="brand-quote">“{currentBrandContent.motto}”</p><div className="philosophy-grid">{currentBrandContent.highlights.map(([title,copy],i)=><article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section className="section brand-products"><div className="center-head"><p className="eyebrow">CURRENT COLLECTION</p><h2>目前上架商品</h2></div><div className="featured-grid">{currentBrandProducts.map(p=><ProductCard key={p['商品ID']} item={itemFor(p)} onClick={()=>openProduct(p)}/>)}</div><div className="center-action"><button className="link-button dark" onClick={()=>goProducts(currentBrand['品牌ID'])}>查看全部 ›</button></div></section>
    </>}

    {view === 'products' && <section className="page-shell products-page"><div className="page-title split"><div><p className="eyebrow">PRODUCTS</p><h1>全部商品</h1></div><div className="filters"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋型號..."/><select value={brandFilter} onChange={e=>setBrandFilter(e.target.value)}><option value="all">全部品牌</option>{brands.map(b=><option key={b['品牌ID']} value={b['品牌ID']}>{b['品牌名稱']}</option>)}</select></div></div><div className="category-strip"><button className={brandFilter==='all'?'active':''} onClick={()=>setBrandFilter('all')}>全部</button>{brands.map(b=><button key={b['品牌ID']} className={brandFilter===b['品牌ID']?'active':''} onClick={()=>setBrandFilter(b['品牌ID'])}>{b['品牌名稱']}</button>)}</div><div className="product-grid">{filtered.map(p=><ProductCard key={p['商品ID']} item={itemFor(p)} onClick={()=>openProduct(p)}/>)}</div>{!filtered.length&&<p className="empty">目前沒有符合條件的商品。</p>}</section>}

    {view === 'product' && (currentProductItem ? <ProductDetail item={currentProductItem} onBack={()=>navigate('/products')}/> : <section className="page-shell"><div className="page-title"><p className="eyebrow">PRODUCT NOT FOUND</p><h1>找不到這項商品</h1><button className="primary" onClick={()=>navigate('/products')}>返回全部商品</button></div></section>)}

    {view === 'knowledge' && <KnowledgeIndex articles={articles} onOpenArticle={slug=>navigate(`/knowledge/${slug}`)}/>}

    {view === 'article' && (currentArticle
      ? <SheetKnowledgeArticle article={currentArticle} onBack={()=>navigate('/knowledge')} onProducts={()=>navigate('/products')} onAdvisor={()=>setAdvisor(true)}/>
      : <section className="page-shell"><div className="page-title"><p className="eyebrow">ARTICLE NOT FOUND</p><h1>找不到這篇文章</h1><button className="primary" onClick={()=>navigate('/knowledge')}>返回選琴知識</button></div></section>)}

    {view === 'about' && <section className="page-shell about-page"><div className="page-title"><p className="eyebrow">ABOUT GUITAR WORKSHOP</p><h1>吉他不只是規格，<br/>更重要的是手感與聲音。</h1></div><div className="about-grid"><div className="about-art">{aboutItem?.image ? <img src={aboutItem.image} alt={`${aboutItem.brand?.['品牌名稱'] || '吉他工坊'} ${aboutItem.product?.['型號'] || '精選吉他'}`} className="about-product-image"/> : <GuitarArt/>}</div><div><p>吉他工坊提供木吉他與相關樂器的銷售、選琴諮詢及出貨前調整。我們不只比較品牌，而是從預算、材料、桶身與演奏需求，協助你選到真正適合長期使用的樂器。</p><p>所有上架商品以 Google Sheets 作為主要資料來源，品牌故事與技術內容則以實際型錄、產品資料與我們的品牌定位為基礎。</p><button className="primary" onClick={()=>setAdvisor(true)}>開始 AI 選琴</button></div></div></section>}
  </main>

  <section className="contact" id="contact"><div><p className="eyebrow">CONTACT</p><h2>來吉他工坊，<br/>找到適合你的琴。</h2></div><div className="contact-links"><a href={`tel:${phone}`}><span>電話</span><small>{phone}</small></a><a href={line}><span>LINE</span><small>加入好友</small></a><a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer"><span>門市</span><small>{address}</small></a></div></section>
  <footer><span>© 2026 Guitar Workshop</span><span>台中｜吉他銷售・調整・選琴諮詢</span></footer>
  {advisor && <Advisor data={data} onClose={()=>setAdvisor(false)} onPick={p=>{setAdvisor(false);openProduct(p)}}/>}
  </>
}

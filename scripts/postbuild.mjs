import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import Papa from 'papaparse'

const base = 'https://guitarworkshop.github.io/guitar-workshop'
const sheetId = '1b4kqwD0TvO5vrDrKeeLvaEoMBTgXuLqh8A-kmAgTFJ0'
const fallback = JSON.parse(await readFile('src/data/fallback.json', 'utf8'))
const template = await readFile('dist/index.html', 'utf8')

const clean = value => String(value ?? '').trim()
const truthy = value => ['是', 'true', '1', 'yes', 'y'].includes(clean(value).toLowerCase())
const slugify = value => clean(value).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'product'
const escapeHtml = value => clean(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const knownHeaders = [
  '商品ID', '品牌ID', '系列ID', '型號', '商品編號', '售價', '庫存狀態', '是否上架',
  '網址代號', 'Slug', 'SEO_Title', 'SEO_Description', 'Published',
  '品牌名稱', '品牌介紹', '品牌簡介', '是否顯示',
  '面板結構', '面板木材', '側背板木材'
]
const canonicalHeader = value => {
  const header = clean(value)
  return knownHeaders
    .filter(name => header.includes(name))
    .sort((a, b) => header.lastIndexOf(b) - header.lastIndexOf(a) || b.length - a.length)[0] || header
}

function rowsToObjects(rows) {
  const headerIndex = rows.slice(0, 15).findIndex(row => {
    const cells = row.map(clean)
    return cells.some(cell => cell.includes('商品ID') || cell.includes('品牌ID') || cell.includes('設定ID'))
  })
  if (headerIndex < 0) return []
  const headers = rows[headerIndex].map(canonicalHeader)
  return rows.slice(headerIndex + 1)
    .filter(row => row.some(cell => clean(cell)))
    .map(row => Object.fromEntries(headers.map((header, index) => [header || `_col_${index + 1}`, clean(row[index])])))
}

async function fetchSheet(name) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Google Sheets ${name}: ${response.status}`)
  const parsed = Papa.parse(await response.text(), { skipEmptyLines: false })
  if (parsed.errors.length) throw new Error(parsed.errors[0].message)
  return rowsToObjects(parsed.data)
}

let data = fallback
try {
  const [brands, products, specs] = await Promise.all([
    fetchSheet('01_品牌'),
    fetchSheet('03_商品'),
    fetchSheet('04_規格')
  ])
  data = { ...fallback, brands, products, specs }
  console.log(`SEO data: Google Sheets (${products.length} products)`)
} catch (error) {
  console.warn(`SEO data fallback: ${error.message}`)
}

const brands = (data.brands || []).filter(brand => !brand['是否顯示'] || truthy(brand['是否顯示']))
const products = (data.products || [])
  .filter(product => clean(product['商品ID']) || clean(product['型號']))
  .filter(product => clean(product['Published']) ? truthy(product['Published']) : truthy(product['是否上架']))
  .map(product => ({
    ...product,
    slug: slugify(product['Slug'] || product['網址代號'] || product['型號'] || product['商品ID'])
  }))

const brandById = new Map(brands.map(brand => [clean(brand['品牌ID']), brand]))
const specByProductId = new Map((data.specs || []).map(spec => [clean(spec['商品ID']), spec]))

function updateTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`)
}

function pageHtml({ title, description, canonical, schema }) {
  let html = template
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
  html = updateTag(html, /<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
  html = updateTag(html, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`)
  html = updateTag(html, /<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`)
  html = updateTag(html, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${escapeHtml(canonical)}" />`)
  html = updateTag(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`)
  if (schema) html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>\n  </head>`)
  return html
}

async function writeRoute(route, options) {
  const directory = path.join('dist', route.replace(/^\/|\/$/g, ''))
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, 'index.html'), pageHtml(options))
}

const businessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${base}/#business`,
  name: '吉他工坊',
  url: `${base}/`,
  telephone: '0930-223-729',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '十甲東路291號',
    addressLocality: '台中市',
    addressCountry: 'TW'
  }
}

const routes = ['/', '/brands/', '/products/', '/about/']
await writeFile('dist/index.html', pageHtml({
  title: '吉他工坊｜台中木吉他・電吉他・專業選琴與調整',
  description: '吉他工坊位於台中，提供木吉他、電吉他選購、專業技師調整與 AI 選琴服務，探索 DADARWOOD、ANISA、ST.MATTHEW、DO ACOUSTIC 等品牌。',
  canonical: `${base}/`,
  schema: businessSchema
}))
await copyFile('dist/index.html', 'dist/404.html')

await writeRoute('/brands/', {
  title: '吉他品牌｜DADARWOOD・ANISA・ST.MATTHEW・DO ACOUSTIC｜吉他工坊',
  description: '探索吉他工坊品牌故事與目前商品，包含 DADARWOOD、ANISA、ST.MATTHEW、DO ACOUSTIC。',
  canonical: `${base}/brands/`
})
await writeRoute('/products/', {
  title: '吉他商品｜木吉他・電吉他・古典吉他｜吉他工坊',
  description: '瀏覽吉他工坊目前上架的木吉他、電吉他與古典吉他，依品牌、型號、木材與演奏需求挑選。',
  canonical: `${base}/products/`
})
await writeRoute('/about/', {
  title: '關於吉他工坊｜台中吉他銷售・專業調整・選琴諮詢',
  description: '認識吉他工坊的選琴理念、專業技師調整與品質檢測服務，協助演奏者找到適合長期使用的吉他。',
  canonical: `${base}/about/`
})

for (const brand of brands) {
  const brandName = brand['品牌名稱'] || '吉他品牌'
  const brandId = encodeURIComponent(brand['品牌ID'])
  routes.push(`/brands/${brandId}/`)
  await writeRoute(`/brands/${brandId}/`, {
    title: `${brandName} 吉他｜品牌介紹與商品｜吉他工坊`,
    description: brand['品牌簡介'] || brand['品牌介紹'] || `探索 ${brandName} 品牌故事、吉他特色與目前上架商品。`,
    canonical: `${base}/brands/${brandId}/`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Brand',
      name: brandName,
      url: `${base}/brands/${brandId}/`
    }
  })
}

for (const product of products) {
  const brand = brandById.get(clean(product['品牌ID']))
  const spec = specByProductId.get(clean(product['商品ID'])) || {}
  const brandName = brand?.['品牌名稱'] || '吉他'
  const title = product['SEO_Title'] || `${brandName} ${product['型號']}｜吉他工坊`
  const materials = [spec['面板結構'], spec['面板木材'], spec['側背板木材']].filter(Boolean).join('、')
  const description = product['SEO_Description'] || `${brandName} ${product['型號']}${materials ? `，採用${materials}` : ''}。出貨前由專業技師調整弦距與手感並完成檢測。`
  const route = `/product/${encodeURIComponent(product.slug)}/`
  const canonical = `${base}${route}`
  routes.push(route)
  const price = Number(String(product['售價'] || '').replace(/[^0-9.-]/g, ''))
  const schema = [{
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${brandName} ${product['型號']}`,
    brand: { '@type': 'Brand', name: brandName },
    description,
    sku: product['商品編號'] || product['商品ID'],
    offers: Number.isFinite(price) && price > 0 ? {
      '@type': 'Offer',
      priceCurrency: 'TWD',
      price,
      availability: clean(product['庫存狀態']).includes('缺貨') ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: canonical
    } : undefined
  }, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: '全部商品', item: `${base}/products/` },
      { '@type': 'ListItem', position: 3, name: product['型號'], item: canonical }
    ]
  }]
  await writeRoute(route, { title, description, canonical, schema })
}

const today = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(routes)].map(route => `  <url>\n    <loc>${base}${route}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}\n</urlset>\n`
await writeFile('dist/sitemap.xml', xml)
console.log(`Created static SEO pages and sitemap (${products.length} products)`)

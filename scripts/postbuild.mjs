import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

await copyFile('dist/index.html', 'dist/404.html')
await mkdir('dist/product', { recursive: true })

const fallback = JSON.parse(await readFile('src/data/fallback.json', 'utf8'))
const base = 'https://guitarworkshop.github.io/guitar-workshop'
const slugify = value => String(value || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'product'
const urls = ['/', '/brands', '/products', '/about']
for (const brand of fallback.brands || []) urls.push(`/brands/${encodeURIComponent(brand['品牌ID'])}`)
for (const product of fallback.products || []) {
  const slug = product.slug || slugify(product['網址代號'] || product['Slug'] || product['型號'] || product['商品ID'])
  urls.push(`/product/${slug}`)
}
const today = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].map(url => `  <url><loc>${base}${url === '/' ? '/' : url}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`
await writeFile('dist/sitemap.xml', xml)
console.log('Created dist/404.html and sitemap.xml')

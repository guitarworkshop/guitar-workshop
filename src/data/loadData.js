import Papa from 'papaparse'
import fallback from './fallback.json'

const truthy = (v) =>
  ['是', 'true', '1', 'yes', 'y'].includes(
    String(v ?? '').trim().toLowerCase()
  )

// Google Drive 分享網址轉圖片網址
function driveToImage(url) {
  const value = String(url || '').trim()
  if (!value) return ''

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ]

  const fileId = patterns
    .map(pattern => value.match(pattern)?.[1])
    .find(Boolean)

  return fileId
    ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`
    : value
}

const KNOWN_HEADERS = [
  '商品ID','品牌ID','系列ID','型號','商品編號','售價','庫存狀態','是否上架','是否新品','是否推薦','是否停產','商品排序','建立日期','網址代號','備註','資料狀態','蝦皮網址','是否首頁Hero','Hero排序','是否精選',
  'Slug','SEO_Title','SEO_Description','Published',
  '尺寸(吋)','桶身','缺角','面板結構','面板木材','側背板結構','側背板木材','琴頸','指板','琴橋','漆面','拾音器','弦長(mm)','上枕寬(mm)','弦鈕','其他規格',
  '照片ID','顏色ID','照片類型','照片名稱','GoogleDrive連結','排序','網站顯示','海報可用','AI動畫可用',
  '特色ID','特色名稱','特色說明','是否顯示','圖示代號',
  '品牌名稱','品牌類型','品牌簡介','系列名稱','設定ID','設定值'
]

function canonicalHeader(value, index) {
  const header = String(value || '').replace(/\s+/g, ' ').trim()
  if (!header) return `_col_${index + 1}`
  if (KNOWN_HEADERS.includes(header)) return header

  const matches = KNOWN_HEADERS
    .filter(name => header.includes(name))
    .sort((a, b) => header.lastIndexOf(b) - header.lastIndexOf(a) || b.length - a.length)

  return matches[0] || header
}

function pickHeaderRow(rows) {
  const knownHeaders = [
    '商品ID',
    '品牌ID',
    '系列ID',
    '型號',
    '照片ID',
    '特色ID',
    '設定ID',
    '品牌名稱',
    '系列名稱'
  ]

  // 優先尋找真正包含資料欄位名稱的列
  const detectedIndex = rows.slice(0, 15).findIndex(row => {
    const cells = row.map(value => String(value ?? '').trim())
    const matchedHeaders = knownHeaders.filter(header =>
      cells.includes(header)
    )

    return matchedHeaders.length >= 2 ||
      (cells.includes('商品ID') && cells.includes('型號'))
  })

  if (detectedIndex >= 0) {
    return detectedIndex
  }

  // 找不到明確欄位時，才使用原本的非空白格數量判斷
  let bestIndex = 0
  let bestScore = -1

  rows.slice(0, 15).forEach((row, index) => {
    const score = row.filter(
      value => String(value ?? '').trim()
    ).length

    if (score > bestScore) {
      bestScore = score
      bestIndex = index
    }
  })

  return bestIndex
}

function rowsToObjects(rawRows) {
  const headerIndex = pickHeaderRow(rawRows)

  const used = new Set()
  const headers = rawRows[headerIndex].map((h, i) => {
    const canonical = canonicalHeader(h, i)
    if (!used.has(canonical)) {
      used.add(canonical)
      return canonical
    }
    return `${canonical}_${i + 1}`
  })

  return rawRows
    .slice(headerIndex + 1)
    .filter(row => row.some(v => String(v ?? '').trim()))
    .map(row =>
      Object.fromEntries(
        headers.map((h, i) => [
          h,
          String(row[i] ?? '').trim()
        ])
      )
    )
}

async function fetchSheet(sheetId, sheetName) {
  const url =
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`

  const response = await fetch(url, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`無法讀取 ${sheetName}`)
  }

  const text = await response.text()

  const parsed = Papa.parse(text, {
    skipEmptyLines: false
  })

  if (parsed.errors.length) {
    throw new Error(parsed.errors[0].message)
  }

  return rowsToObjects(parsed.data)
}

function slugify(value) {
  const result = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return result || 'product'
}

function repairRelations(data) {
  const clean = value => String(value ?? '').trim()

  const normalizeModel = value =>
    clean(value)
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .replace(/[–—]/g, '-')

  const rawProducts = Array.isArray(data.products) ? data.products : []
  const rawSpecs = Array.isArray(data.specs) ? data.specs : []
  const rawColors = Array.isArray(data.colors) ? data.colors : []
  const rawPhotos = Array.isArray(data.photos) ? data.photos : []
  const rawFeatures = Array.isArray(data.features) ? data.features : []

  // 排除只有說明、公式或空白的資料列
  const products = rawProducts
    .filter(p => clean(p['商品ID']) || clean(p['型號']))
    .map(p => ({
      ...p,
      商品ID: clean(p['商品ID']),
      型號: clean(p['型號']),
      slug:
        clean(p['Slug']) ||
        slugify(
          p['網址代號'] ||
          p['型號'] ||
          p['商品ID']
        )
    }))

  const modelToProduct = new Map(
    products
      .filter(p => p['型號'])
      .map(p => [normalizeModel(p['型號']), p])
  )

  const idToProduct = new Map(
    products
      .filter(p => p['商品ID'])
      .map(p => [clean(p['商品ID']), p])
  )

  const repairRow = row => {
    const originalId = clean(row?.['商品ID'])
    const originalModel = clean(row?.['型號'])

    const matchedProduct =
      idToProduct.get(originalId) ||
      modelToProduct.get(normalizeModel(originalModel))

    return {
      ...row,
      商品ID: originalId || matchedProduct?.['商品ID'] || '',
      型號: originalModel || matchedProduct?.['型號'] || ''
    }
  }

  const specs = rawSpecs
    .filter(r => clean(r['商品ID']) || clean(r['型號']))
    .map(repairRow)

  const colors = rawColors
    .filter(r => clean(r['商品ID']) || clean(r['型號']))
    .map(repairRow)

  const photos = rawPhotos
    .filter(r => clean(r['商品ID']) || clean(r['型號']))
    .map(repairRow)

  const features = rawFeatures
    .filter(r => clean(r['商品ID']) || clean(r['型號']))
    .map(repairRow)

  return {
    ...data,
    products,
    specs,
    colors,
    photos,
    features
  }
}


export async function loadSiteData() {
  try {
    const configResponse = await fetch(
      `${import.meta.env.BASE_URL}site-config.json`,
      {
        cache: 'no-store'
      }
    )

    if (!configResponse.ok) {
      throw new Error('無法讀取 site-config.json')
    }

    const config = await configResponse.json()

    if (!config.useGoogleSheets || !config.googleSheetId) {
      return {
        ...repairRelations(fallback),
        source: '內建資料'
      }
    }

    const entries = await Promise.all(
      Object.entries(config.sheetNames || {}).map(
        async ([key, name]) => [
          key,
          await fetchSheet(config.googleSheetId, name)
        ]
      )
    )

    return {
      ...repairRelations(Object.fromEntries(entries)),
      source: 'Google Sheets'
    }
  } catch (error) {
    console.warn(
      'Google Sheets 載入失敗，改用內建資料：',
      error
    )

    return {
      ...repairRelations(fallback),
      source: '內建資料（Google Sheets 尚未連線）'
    }
  }
}

export {
  truthy,
  driveToImage
}

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
    ? `https://lh3.googleusercontent.com/d/${fileId}=w2000`
    : value
}

const firstValue = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key]
    if (String(value ?? '').trim()) return String(value).trim()
  }
  return ''
}

function pickHeaderRow(rows) {
  let best = 0
  let score = -1

  rows.slice(0, 10).forEach((row, index) => {
    const current = row.filter(v => String(v ?? '').trim()).length

    if (current > score) {
      score = current
      best = index
    }
  })

  return best
}

function rowsToObjects(rawRows) {
  const headerIndex = pickHeaderRow(rawRows)

  const headers = rawRows[headerIndex].map((h, i) =>
    String(h || `_col_${i + 1}`).replace(/^\uFEFF/, '').trim()
  )

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
  const products = data.products.map(p => ({
    ...p,
    slug:
      p.slug ||
      slugify(
        p['網址代號'] ||
        p['Slug'] ||
        p['型號'] ||
        p['商品ID']
      )
  }))

  const modelToId = Object.fromEntries(
    products.map(p => [p['型號'], p['商品ID']])
  )

  const specs = data.specs.map((r, i) => ({
    ...r,
    商品ID: r['商品ID'] || products[i]?.['商品ID'] || '',
    型號: r['型號'] || products[i]?.['型號'] || ''
  }))

  const attach = rows =>
    rows.map(r => ({
      ...r,
      商品ID:
        firstValue(r, ['商品ID', '商品 ID', '產品ID', '產品 ID']) ||
        modelToId[firstValue(r, ['型號', '商品型號'])] || ''
    }))

  return {
    ...data,
    products,
    specs,
    colors: attach(data.colors),
    photos: attach(data.photos),
    features: attach(data.features)
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

    const config = await configResponse.json()

    if (!config.useGoogleSheets || !config.googleSheetId) {
      return {
        ...repairRelations(fallback),
        source: '內建資料'
      }
    }

    const entries = await Promise.all(
      Object.entries(config.sheetNames).map(
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
  driveToImage,
  firstValue
}

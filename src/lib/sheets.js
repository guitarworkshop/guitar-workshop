import fallback from '../data/fallback.json'

const SHEET_NAMES = {
  brands: '01_品牌', series: '02_系列', products: '03_商品', specs: '04_規格',
  photos: '06_照片', features: '07_特色', ai: '08_AI推薦', settings: '09_網站設定'
}

function parseGviz(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}') + 1
  const payload = JSON.parse(text.slice(start, end))
  const cols = payload.table.cols.map(c => c.label)
  return payload.table.rows.map(row => Object.fromEntries(cols.map((c, i) => [c, row.c?.[i]?.v ?? null])))
}

async function fetchTab(sheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&headers=1&range=A4:ZZ&sheet=${encodeURIComponent(sheetName)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Google Sheets ${res.status}`)
  return parseGviz(await res.text())
}

export async function loadDatabase() {
  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID?.trim()
  if (!sheetId) return { ...fallback, source: '內建資料' }
  try {
    const entries = await Promise.all(Object.entries(SHEET_NAMES).map(async ([key, name]) => [key, await fetchTab(sheetId, name)]))
    const data = Object.fromEntries(entries)
    data.settings = Object.fromEntries(data.settings.filter(x => x['設定ID']).map(x => [x['設定ID'], x['設定值']]))
    data.source = 'Google Sheets 即時資料'
    return data
  } catch (error) {
    console.error('Google Sheets 讀取失敗，改用內建資料：', error)
    return { ...fallback, source: '內建資料（Google Sheets 暫時無法讀取）' }
  }
}

# 吉他工坊 v3（商品獨立網址版）

本版本保留原有首頁、品牌頁、Google Sheets 資料、圖片讀取與 AI 選琴，並新增：

- 商品獨立網址：`/product/<slug>`
- 品牌獨立網址：`/brands/<品牌ID>`
- 瀏覽器上一頁／下一頁支援
- 每項商品動態 Title、Description、Canonical、Open Graph
- Product JSON-LD 結構化資料
- 建置時自動建立 `404.html`，支援 GitHub Pages 直接開啟深層網址
- 建置時依內建備援商品建立 `sitemap.xml`

## 本機測試

```bash
npm install
npm run dev
```

## 正式建置

```bash
npm run build
```

建置完成後，`postbuild` 會自動建立 `dist/404.html` 與新版 Sitemap。

## 商品網址來源

優先讀取 Google Sheets 商品表中的：

1. `網址代號`
2. `Slug`
3. `型號`
4. `商品ID`

建議每項商品的 `網址代號` 使用英文小寫，例如 `d20-gac-plus`。

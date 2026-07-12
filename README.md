# 吉他工坊正式官網

React + Vite + GitHub Pages 專案，已內建 `吉他工坊_Master_Database_V4_FINAL.xlsx` 的現有資料快照，並預留 Google Sheets 即時連動。

## 上傳 GitHub

1. 將本資料夾內所有檔案覆蓋到本機 `guitar-workshop` Repository。
2. GitHub Desktop 輸入摘要後按 **Commit to main**。
3. 按 **Push origin**。
4. GitHub Repository → **Settings → Pages → Source** 改成 **GitHub Actions**。
5. 等待 Actions 顯示綠色勾勾。

網站網址：`https://guitarworkshop.github.io/guitar-workshop/`

## 連接 Google Sheets

1. 將 Excel 上傳至 Google Drive 並轉成 Google 試算表。
2. 設定為「知道連結的任何人皆可檢視」，或發布到網路。
3. Google Sheets 網址格式：
   `https://docs.google.com/spreadsheets/d/這一段就是SHEET_ID/edit`
4. 編輯 `public/site-config.json`：

```json
{
  "googleSheetId": "貼上你的SHEET_ID",
  "useGoogleSheets": true
}
```

5. Commit、Push。網站之後會直接讀線上 Google Sheets。

若 Google Sheets 尚未公開、網址錯誤或網路讀取失敗，網站會自動退回內建資料，不會白畫面。

## 資料工作表

網站目前會讀取：
- 01_品牌
- 02_系列
- 03_商品
- 04_規格
- 05_顏色
- 06_照片
- 07_特色
- 08_AI推薦
- 09_網站設定

注意：工作表名稱請保持不變。

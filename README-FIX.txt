吉他工坊 v3 修正版

已修正：
1. Google Sheets 的合併表頭解析（商品ID／型號／規格／照片）
2. 商品頁價格格式（支援 8,200、NT$ 8,200 等格式）
3. 商品規格與照片可用商品ID或型號配對
4. AI 選琴元件內的資料引用錯誤
5. 移除 D20 除錯輸出
6. App.jsx 大小寫統一，避免 GitHub Actions/Linux 建置失敗
7. favicon 404

使用方式：
- 先備份目前資料夾。
- 將本 ZIP 解壓縮。
- 在資料夾執行 npm install，接著 npm run dev。
- 確認商品頁照片、價格、規格正常後，再用 GitHub Desktop 覆蓋／提交。

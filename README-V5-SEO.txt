吉他工坊 V5 SEO 技術修正版

本版保留 V5 首頁主視覺與既有網站外觀，新增：

1. 讀取 Google Sheets「03_商品」的 Slug、SEO_Title、SEO_Description、Published。
2. GitHub Actions 每次建置時同步最新上架商品。
3. 為首頁、品牌頁、商品頁建立可直接讀取的 SEO HTML。
4. 自動產生包含品牌與上架商品的 sitemap.xml。
5. 加入 LocalBusiness、WebSite、Product、Brand 與 BreadcrumbList 結構化資料。
6. 商品頁加入獨立 title、description、canonical 與 Open Graph 資料。
7. 缺貨商品在結構化資料中標示 OutOfStock；不上架商品不進入 Sitemap。

上傳方式：

1. 解壓縮本 ZIP。
2. 將解壓縮後所有檔案複製到原網站資料夾並選擇取代。
3. 請勿上傳 node_modules、dist 或 ZIP。
4. 在 GitHub Desktop 輸入 Summary：完成網站 SEO 技術優化。
5. Commit to main，再 Push origin。
6. 等 GitHub Actions 顯示綠色勾勾後，到 Google Search Console 重新提交：
   https://guitarworkshop.github.io/guitar-workshop/sitemap.xml

注意：

- Google Sheets 必須維持可供網站公開讀取。
- 修改商品 SEO 欄位後，需要重新觸發一次 GitHub Actions 建置，Sitemap 與靜態 SEO 頁才會同步更新。
- 搜尋排名不會立即變動；Google 重新檢索與建立索引通常需要一段時間。

# 全港小學比賽地圖

> 🔗 線上版：https://tyhcch1234.github.io/hk-primary-competitions/

為小三、小四學生而設的香港比賽清單網站，目標是兩年內累積一份講得出口的中一 portfolio。

- 50 項比賽，11 個類別
- 按「技術門檻」與「面試加分潛力」標註
- 可篩選、搜尋、收藏（localStorage）
- 純靜態、零依賴，直接放 GitHub Pages

## 檔案結構

```
.
├── index.html              # 唯一頁面
├── assets/
│   ├── style.css           # 所有樣式（含響應式與列印樣式）
│   └── app.js              # 篩選、排序、收藏、時間軸渲染
├── data/
│   └── competitions.js     # 比賽資料（改這裡就能更新內容）
├── .nojekyll               # 讓 GitHub Pages 不做 Jekyll 處理
└── README.md
```

## 更新資料

所有比賽都在 `data/competitions.js`，格式如下：

```js
{
  id: "hkmos",                    // 唯一識別碼
  name: "香港小學數學奧林匹克比賽",
  org: "香港數學奧林匹克學校（HKMOS）",
  cat: "數學",                    // 語文／數學／科學科技／視藝／音樂／舞蹈／戲劇／體育／棋藝／服務／綜合
  grades: [3, 4, 5, 6],          // 適用年級
  level: 4,                       // 技術門檻 1（最低）–5（最高）
  value: 5,                       // 面試加分潛力 1–5
  free: false,                    // true／false／null（未確定）
  fee: "約 $150（原校考場）／$350（大會考場）",
  reg: "每年 10–11 月",
  event: "翌年 2–3 月",
  mode: "個人筆試，可選原校考場",
  link: "https://www.hkmos.org/", // 無可靠網址時填 null
  note: "中級組正是小三、小四……",
  tags: ["奧數", "個人筆試", "現正接受報名"]
}
```

新增一項只需在陣列中加一個物件，重新載入頁面即生效。統計數字與篩選器會自動更新。

### 標籤約定

`tags` 中的 `"現正接受報名"` 會在卡片上顯示紅色標籤。每學期更新資料時，記得同步移除已截止的標籤。

## 本地預覽

因為用了相對路徑，直接雙擊 `index.html` 也可以。若要用本機伺服器：

```bash
python3 -m http.server 8000
```

然後開 http://localhost:8000

## 部署到 GitHub Pages

### 方法一：用 GitHub CLI（最快）

```bash
cd hk-primary-competitions
git init
git add .
git commit -m "Add HK primary school competitions guide"
gh repo create hk-primary-competitions --public --source=. --push

# 開啟 Pages（用 main 分支根目錄）
gh api -X POST repos/:owner/hk-primary-competitions/pages \
  -f source[branch]=main -f source[path]=/
```

網站會在 `https://<你的帳號>.github.io/hk-primary-competitions/`。

### 方法二：用網頁介面

1. 在 GitHub 建立新的 public repository，例如 `hk-primary-competitions`
2. 把這個資料夾內的所有檔案上傳（drag & drop 亦可）
3. 到 **Settings → Pages**
4. Source 選 **Deploy from a branch**，Branch 選 **main**，資料夾選 **/ (root)**
5. 儲存，等 1–2 分鐘

### 方法三：自訂網域

在 repo 根目錄加一個 `CNAME` 檔，內容為你的網域（例如 `competitions.example.com`），
再到 DNS 加一筆 `CNAME` 指向 `<你的帳號>.github.io`。

## 資料準確性

- 資料整理至 **2026 年 11 月 10 日**
- 屆數、日期、費用每年變動，報名前必須到主辦機構官網核對
- `value`（加分潛力）是依比賽歷史、主辦機構、是否經學校提名等估算，並非官方評分
- `link: null` 的項目表示未找到可靠官方網址，卡片會顯示「官方連結待更新」

## 免責

本網站不構成升學建議。所有報名決定，請以孩子意願與學校老師意見為先。

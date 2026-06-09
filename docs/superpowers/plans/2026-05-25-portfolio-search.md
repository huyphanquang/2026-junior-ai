# Portfolio Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm search bar live-filter vào section Portfolio, lọc project theo tên, tag, và mô tả.

**Architecture:** Thêm `searchQuery` state vào `ArticlePortfolio`, truyền xuống `ArticlePortfolioItems` để filter items. `PortfolioSearchInput` được render là phần tử đầu tiên bên trong `ArticlePortfolioItems` — nằm ngay dưới `CategoryFilter` (được render bởi `Article.jsx`) và trên danh sách cards. Không chạm vào `Article.jsx`, `ArticleDataWrapper.js`, hay bất kỳ file dùng chung nào.

**Tech Stack:** React 18, SCSS với CSS custom properties (theme variables), Font Awesome icons

---

## File Map

| File | Thay đổi |
|---|---|
| `src/components/articles/ArticlePortfolio.jsx` | Thêm state, helper function, component mới, cập nhật props |
| `src/components/articles/ArticlePortfolio.scss` | Thêm styles cho search input và empty state |

---

## Task 1: Thêm SCSS styles

**Files:**
- Modify: `src/components/articles/ArticlePortfolio.scss`

- [ ] **Step 1: Thêm styles vào cuối `ArticlePortfolio.scss`**

Mở file `src/components/articles/ArticlePortfolio.scss` và append vào cuối:

```scss
/** ---------------- SEARCH INPUT ---------------- */
div.portfolio-search-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: $standard-border-radius;
    margin-bottom: 14px;
    background-color: var(--theme-boards-background);
    border: 2px solid var(--theme-standard-borders);
    transition: border-color 0.2s ease;

    &:focus-within {
        border-color: var(--theme-primary);
    }

    i.portfolio-search-input-icon {
        color: var(--theme-texts-light-1);
        font-size: 0.8rem;
        flex-shrink: 0;
    }

    input.portfolio-search-input-field {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--theme-texts);
        font-size: 0.85rem;
        min-width: 0;

        &::placeholder {
            color: var(--theme-texts-light-2);
        }
    }

    button.portfolio-search-input-clear {
        background: none;
        border: none;
        color: var(--theme-texts-light-2);
        cursor: pointer;
        padding: 0;
        line-height: 1;
        flex-shrink: 0;
        opacity: 0.6;

        &:hover {
            opacity: 1;
        }
    }
}

/** ---------------- SEARCH EMPTY STATE ---------------- */
div.portfolio-search-empty {
    color: var(--theme-texts-light-2);
    padding: 2rem 0;
    text-align: center;

    i {
        display: block;
        font-size: 1.5rem;
        margin-bottom: 10px;
        opacity: 0.5;
    }

    p {
        margin: 0;
        font-size: 0.85rem;
    }

    p.portfolio-search-empty-hint {
        margin-top: 4px;
        font-size: 0.75rem;
        opacity: 0.6;
    }
}
```

- [ ] **Step 2: Khởi động dev server và kiểm tra không có lỗi SCSS**

```bash
npm run dev
```

Mở `http://localhost:5173/react-portfolio-template/` — trang load bình thường, không có lỗi trong console. Chưa thấy thay đổi giao diện nào vì chưa có class nào được dùng.

- [ ] **Step 3: Commit**

```bash
git add src/components/articles/ArticlePortfolio.scss
git commit -m "style: Add SCSS for portfolio search input and empty state"
```

---

## Task 2: Thêm helper function và component `PortfolioSearchInput`

**Files:**
- Modify: `src/components/articles/ArticlePortfolio.jsx`

- [ ] **Step 1: Thêm helper `matchesSearch` trước function `ArticlePortfolio`**

Mở `src/components/articles/ArticlePortfolio.jsx`. Thêm function này ngay **trước** `function ArticlePortfolio(...)`:

```jsx
function matchesSearch(itemWrapper, query) {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    const title = (itemWrapper.locales.title || "").replace(/<[^>]+>/g, "").toLowerCase()
    const text = (itemWrapper.locales.text || "").replace(/<[^>]+>/g, "").toLowerCase()
    const tags = (itemWrapper.locales.tags || []).join(" ").toLowerCase()
    return title.includes(q) || text.includes(q) || tags.includes(q)
}
```

- [ ] **Step 2: Thêm component `PortfolioSearchInput` sau `ArticlePortfolioItemFooter`**

Thêm component này vào **cuối file**, ngay trước dòng `export default ArticlePortfolio`:

```jsx
/**
 * @param {String} query
 * @param {Function} setQuery
 * @return {JSX.Element}
 * @constructor
 */
function PortfolioSearchInput({ query, setQuery }) {
    return (
        <div className={`portfolio-search-input`}>
            <i className={`fa-solid fa-magnifying-glass portfolio-search-input-icon`}/>
            <input
                type="text"
                className={`portfolio-search-input-field`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search projects...`}
            />
            {query && (
                <button className={`portfolio-search-input-clear`}
                        onClick={() => setQuery("")}>
                    <i className={`fa-solid fa-xmark`}/>
                </button>
            )}
        </div>
    )
}
```

- [ ] **Step 3: Kiểm tra không có lỗi compile**

Lưu file. Dev server đang chạy sẽ hot-reload — không có lỗi trong console (component `PortfolioSearchInput` chưa được dùng nên chưa thấy trên UI).

- [ ] **Step 4: Commit**

```bash
git add src/components/articles/ArticlePortfolio.jsx
git commit -m "feat: Add matchesSearch helper and PortfolioSearchInput component"
```

---

## Task 3: Kết nối state và filter vào `ArticlePortfolio` + `ArticlePortfolioItems`

**Files:**
- Modify: `src/components/articles/ArticlePortfolio.jsx`

- [ ] **Step 1: Thêm `searchQuery` state vào `ArticlePortfolio`**

Tìm function `ArticlePortfolio` (dòng ~18). Thêm state `searchQuery` ngay bên dưới `selectedItemCategoryId`:

```jsx
function ArticlePortfolio({ dataWrapper, id }) {
    const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")   // ← thêm dòng này

    return (
        <Article id={dataWrapper.uniqueId}
                 type={Article.Types.SPACING_DEFAULT}
                 dataWrapper={dataWrapper}
                 className={`article-portfolio`}
                 selectedItemCategoryId={selectedItemCategoryId}
                 setSelectedItemCategoryId={setSelectedItemCategoryId}>
            <ArticlePortfolioItems dataWrapper={dataWrapper}
                                   selectedItemCategoryId={selectedItemCategoryId}
                                   searchQuery={searchQuery}
                                   setSearchQuery={setSearchQuery}/>
        </Article>
    )
}
```

- [ ] **Step 2: Cập nhật `ArticlePortfolioItems` để nhận props mới, render search input và filter**

Thay toàn bộ function `ArticlePortfolioItems` (dòng ~40–79) bằng:

```jsx
function ArticlePortfolioItems({ dataWrapper, selectedItemCategoryId, searchQuery, setSearchQuery }) {
    const constants = useConstants()
    const language = useLanguage()
    const viewport = useViewport()

    const categoryFilteredItems = dataWrapper.getOrderedItemsFilteredBy(selectedItemCategoryId)
    const filteredItems = categoryFilteredItems.filter(item => matchesSearch(item, searchQuery))
    const customBreakpoint = viewport.getCustomBreakpoint(constants.SWIPER_BREAKPOINTS_FOR_THREE_SLIDES)

    const itemsPerRow = customBreakpoint?.slidesPerView || 1
    const itemsPerRowClass = `article-portfolio-items-${itemsPerRow}-per-row`

    const refreshFlag = dataWrapper.categories?.length ?
        selectedItemCategoryId + "-" + language.getSelectedLanguage()?.id :
        language.getSelectedLanguage()?.id

    const itemsList = dataWrapper.categories?.length ? (
        <Transitionable id={dataWrapper.uniqueId}
                        refreshFlag={refreshFlag}
                        delayBetweenItems={100}
                        animation={Transitionable.Animations.POP}
                        className={`article-portfolio-items ${itemsPerRowClass}`}>
            {filteredItems.map((itemWrapper, key) => (
                <ArticlePortfolioItem itemWrapper={itemWrapper}
                                      key={key}/>
            ))}
        </Transitionable>
    ) : (
        <div className={`article-portfolio-items ${itemsPerRowClass} mb-3 mb-lg-2`}>
            {filteredItems.map((itemWrapper, key) => (
                <ArticlePortfolioItem itemWrapper={itemWrapper}
                                      key={key}/>
            ))}
        </div>
    )

    const showEmptyState = filteredItems.length === 0 && searchQuery.trim().length > 0

    return (
        <>
            <PortfolioSearchInput query={searchQuery}
                                  setQuery={setSearchQuery}/>
            {showEmptyState ? (
                <div className={`portfolio-search-empty text-2`}>
                    <i className={`fa-solid fa-magnifying-glass`}/>
                    <p>No projects found for <strong>"{searchQuery}"</strong></p>
                    <p className={`portfolio-search-empty-hint`}>Try a different keyword or clear the search</p>
                </div>
            ) : itemsList}
        </>
    )
}
```

- [ ] **Step 3: Kiểm tra không có lỗi compile**

Lưu file. Dev server hot-reload — không có lỗi đỏ trong console và không có lỗi hiển thị trên trang.

- [ ] **Step 4: Verify trạng thái mặc định trong browser**

Điều hướng đến section **Portfolio** trong app. Kiểm tra:
- Search bar hiện ra bên dưới category filter pills (All / Apps / Web / Utilities)
- Placeholder text `Search projects...` hiển thị mờ
- Danh sách project cards vẫn hiển thị đủ như trước

- [ ] **Step 5: Verify live filter khi gõ**

Gõ vào search bar (ví dụ `react` hoặc một tag/tên project có trong portfolio):
- Danh sách lọc lại ngay khi gõ — chỉ hiển thị project có tên/tag/mô tả khớp
- Nút ✕ xuất hiện bên phải khi có text
- Nhấn ✕ — ô input xóa trắng, danh sách trở về đủ

- [ ] **Step 6: Verify empty state**

Gõ một từ không tồn tại (ví dụ `xyzxyzxyz`):
- Danh sách cards biến mất
- Hiển thị icon kính lúp + dòng `No projects found for "xyzxyzxyz"` + gợi ý nhỏ bên dưới

- [ ] **Step 7: Verify search + category filter phối hợp**

Chọn category `Apps` rồi gõ vào search:
- Search chỉ tìm trong các project thuộc category Apps
- Đổi category → kết quả search cập nhật theo category mới

- [ ] **Step 8: Verify dark/light theme**

Nhấn nút đổi theme (icon mặt trăng/mặt trời trên sidebar):
- Search bar tự đổi màu theo theme — không bị cứng màu

- [ ] **Step 9: Commit**

```bash
git add src/components/articles/ArticlePortfolio.jsx
git commit -m "feat: Implement live search filter in Portfolio section"
```

---

## Checklist cuối

- [ ] Search bar hiển thị đúng vị trí (dưới category filter, trên cards)
- [ ] Live filter hoạt động với tên, tag, mô tả
- [ ] Nút ✕ xóa search query
- [ ] Empty state rõ ràng khi không có kết quả
- [ ] Search + CategoryFilter phối hợp đúng
- [ ] Dark/light theme tự động
- [ ] Không có lỗi console
- [ ] Không có thay đổi nào trong `Article.jsx`, `ArticleDataWrapper.js`, hay file dùng chung khác

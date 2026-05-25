# Portfolio Search Feature — Design Spec

**Date:** 2026-05-25  
**Branch:** `week2-claude-code-exercise/portfolio-search`  
**Scope:** Thêm tính năng tìm kiếm live trong section Portfolio

---

## Mục tiêu

Cho phép người dùng tìm kiếm dự án trong section Portfolio theo tên, tag công nghệ, và mô tả. Search bar nằm ngay dưới CategoryFilter, lọc kết quả theo thời gian thực khi gõ.

---

## Phạm vi thay đổi

Chỉ thay đổi 2 file:
- `src/components/articles/ArticlePortfolio.jsx`
- `src/components/articles/ArticlePortfolio.scss`

Không chạm vào: `Article.jsx`, `ArticleDataWrapper.js`, `DataProvider.jsx`, hay bất kỳ file dùng chung nào.

---

## Architecture & Data Flow

```
ArticlePortfolio
  ├── state: searchQuery (string, default "")
  ├── state: selectedItemCategoryId (đã có sẵn)
  │
  ├── <Article>
  │     └── <CategoryFilter>  (đã có sẵn, không thay đổi)
  │
  ├── <PortfolioSearchInput>   ← component mới (nằm trong file này)
  │     props: query, setQuery
  │
  └── <ArticlePortfolioItems>  ← thêm prop searchQuery
        filteredItems = dataWrapper
          .getOrderedItemsFilteredBy(selectedItemCategoryId)
          .filter(item => matchesSearch(item, searchQuery))
```

---

## Logic tìm kiếm

Hàm `matchesSearch(itemWrapper, query)`:

```js
function matchesSearch(itemWrapper, query) {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  const title = (itemWrapper.locales.title || "").toLowerCase()
  const text = (itemWrapper.locales.text || "").replace(/<[^>]+>/g, "").toLowerCase()
  const tags = (itemWrapper.locales.tags || []).join(" ").toLowerCase()
  return title.includes(q) || text.includes(q) || tags.includes(q)
}
```

- Case-insensitive
- Strip HTML tags khỏi `text` trước khi tìm (dùng regex đơn giản)
- Search chạy trên tập đã lọc theo category — hai bộ lọc hoạt động đồng thời

---

## Component `PortfolioSearchInput`

```jsx
function PortfolioSearchInput({ query, setQuery }) {
  return (
    <div className="portfolio-search-input">
      <i className="fa-solid fa-magnifying-glass portfolio-search-input-icon" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search projects..."
        className="portfolio-search-input-field"
      />
      {query && (
        <button onClick={() => setQuery("")} className="portfolio-search-input-clear">
          <i className="fa-solid fa-xmark" />
        </button>
      )}
    </div>
  )
}
```

---

## UX — 3 trạng thái

| Trạng thái | Mô tả |
|---|---|
| **Mặc định** | Placeholder `"Search projects..."`, hiển thị toàn bộ item theo category đang chọn |
| **Đang gõ** | Lọc live, nút ✕ hiện ra để xóa nhanh |
| **Không có kết quả** | Tái sử dụng `ArticleNotFound.jsx` đã có sẵn để hiển thị empty state |

---

## Styling (SCSS)

Thêm vào `ArticlePortfolio.scss`. Dùng đúng CSS variables từ theme system của project:

```scss
div.portfolio-search-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: $standard-border-radius;
  margin-bottom: 12px;
  background-color: var(--theme-boards-background);
  border: 2px solid var(--theme-standard-borders);
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: var(--theme-primary);
  }

  .portfolio-search-input-icon {
    color: var(--theme-texts-light-1);
    font-size: 0.8rem;
  }

  input.portfolio-search-input-field {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--theme-texts);
    font-size: 0.85rem;

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
    opacity: 0.6;
    &:hover { opacity: 1; }
  }
}

div.portfolio-search-empty {
  color: var(--theme-texts-light-2);
  i { display: block; font-size: 1.5rem; margin-bottom: 8px; }
}
```

CSS variables dùng: `--theme-boards-background`, `--theme-standard-borders`, `--theme-primary`, `--theme-texts`, `--theme-texts-light-1`, `--theme-texts-light-2` — tất cả đều được định nghĩa trong `_theme-variables-builder.scss` và tự động thay đổi theo dark/light theme.

---

## Empty state

Khi `filteredItems.length === 0` sau khi search, render một JSX inline đơn giản thay cho danh sách rỗng. **Không dùng `ArticleNotFound`** — component đó chỉ dành cho "component type không tồn tại", không phải empty search result.

```jsx
{filteredItems.length === 0 && (
  <div className="portfolio-search-empty text-center text-2 py-4">
    <i className="fa-solid fa-magnifying-glass mb-2" />
    <p>No projects found for <strong>"{searchQuery}"</strong></p>
  </div>
)}
```

---

## Không nằm trong scope

- Highlight từ khóa khớp trong card (có thể làm sau)
- Search ở các section khác (Skills, Experience)
- Debounce input (không cần — số lượng items nhỏ, filter nhanh)
- Persist search query qua navigation

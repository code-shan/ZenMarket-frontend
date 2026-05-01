# ZenMarket Frontend Architecture

## 1. Overview

ZenMarket is a modern marketplace frontend built using Next.js (App Router), React, TypeScript, Tailwind CSS, and shadcn/ui.

This application focuses on delivering a clean, responsive, and intuitive user experience for:
- Browsing product listings
- Creating new listings
- Viewing product details
- Purchasing items

The architecture prioritizes:
- Component reusability
- Clear separation of concerns
- Scalable structure
- API-driven design
- Excellent user experience (UX)

---

## 2. Tech Stack

| Technology | Purpose |
|-----------|--------|
| Next.js (App Router) | Routing, layout system, SSR support |
| React | Component-based UI |
| TypeScript | Type safety and maintainability |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible, reusable UI components |
| Fetch API | Backend communication |

---

## 3. Architectural Principles

### 3.1 Separation of Concerns
- UI components → presentation only
- Services → business logic
- API layer → HTTP handling
- Types → shared contracts

### 3.2 Component-Driven Design
- Small, reusable, composable components
- Clear boundaries between UI and logic

### 3.3 API-First Approach
- No hardcoded data
- All data comes from backend APIs

### 3.4 UX-First Thinking
- Clear states: loading, empty, error
- Immediate feedback for actions
- Disabled states for invalid actions

---

## 4. Folder Structure

```txt
src/
 ├── app/
 │   ├── layout.tsx
 │   ├── page.tsx                → Marketplace
 │   ├── products/
 │   │   └── [id]/
 │   │       └── page.tsx        → Product Details
 │
 ├── components/
 │   ├── layout/
 │   │   ├── Header.tsx
 │   │   └── PageContainer.tsx
 │
 │   ├── products/
 │   │   ├── ProductCard.tsx
 │   │   ├── ProductGrid.tsx
 │   │   ├── ProductForm.tsx
 │   │   ├── ProductFilters.tsx
 │   │   └── ProductEmptyState.tsx
 │
 │   └── ui/                     → shadcn components
 │
 ├── lib/
 │   ├── api.ts                 → base API config
 │   └── utils.ts
 │
 ├── services/
 │   └── productService.ts      → business logic
 │
 ├── types/
 │   └── product.ts
 │
 └── constants/
     └── categories.ts
export type Category = {
  id: string
  label: string
  slug: string
}

export const CATEGORIES: readonly Category[] = [
  { id: "electronics", label: "Electronics", slug: "electronics" },
  { id: "fashion", label: "Fashion", slug: "fashion" },
  { id: "home", label: "Home & Living", slug: "home-living" },
  { id: "sports", label: "Sports & Outdoors", slug: "sports-outdoors" },
  { id: "books", label: "Books & Media", slug: "books-media" },
  { id: "other", label: "Other", slug: "other" },
] as const

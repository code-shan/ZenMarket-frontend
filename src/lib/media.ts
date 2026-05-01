/** Remote placeholders when catalog images are missing */
export const CATEGORY_IMAGE_PLACEHOLDER =
  "https://cdn.pixabay.com/photo/2021/10/11/23/49/app-6702044_1280.png"

export const PRODUCT_IMAGE_PLACEHOLDER =
  "https://cdn.pixabay.com/photo/2016/06/14/04/51/bag-1455765_1280.jpg"

/** Next.js optimizer rejects loopback URLs; use `unoptimized` for these. */
export function isLoopbackHttpUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(url)
}

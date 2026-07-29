/**
 * Vietnamese Unicode → ASCII character map.
 * Covers all tonal variants for every vowel and consonant in modern Vietnamese.
 */
const VIET_MAP: Record<string, string> = {
  // a
  à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
  â: 'a', ầ: 'a', ấ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
  ă: 'a', ằ: 'a', ắ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',

  // A
  À: 'a', Á: 'a', Ả: 'a', Ã: 'a', Ạ: 'a',
  Â: 'a', Ầ: 'a', Ấ: 'a', Ẩ: 'a', Ẫ: 'a', Ậ: 'a',
  Ă: 'a', Ằ: 'a', Ắ: 'a', Ẳ: 'a', Ẵ: 'a', Ặ: 'a',

  // e
  è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
  ê: 'e', ề: 'e', ế: 'e', ể: 'e', ễ: 'e', ệ: 'e',

  // E
  È: 'e', É: 'e', Ẻ: 'e', Ẽ: 'e', Ẹ: 'e',
  Ê: 'e', Ề: 'e', Ế: 'e', Ể: 'e', Ễ: 'e', Ệ: 'e',

  // i
  ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',

  // I
  Ì: 'i', Í: 'i', Ỉ: 'i', Ĩ: 'i', Ị: 'i',

  // o
  ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
  ô: 'o', ồ: 'o', ố: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
  ơ: 'o', ờ: 'o', ớ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',

  // O
  Ò: 'o', Ó: 'o', Ỏ: 'o', Õ: 'o', Ọ: 'o',
  Ô: 'o', Ồ: 'o', Ố: 'o', Ổ: 'o', Ỗ: 'o', Ộ: 'o',
  Ơ: 'o', Ờ: 'o', Ớ: 'o', Ở: 'o', Ỡ: 'o', Ợ: 'o',

  // u
  ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
  ư: 'u', ừ: 'u', ứ: 'u', ử: 'u', ữ: 'u', ự: 'u',

  // U
  Ù: 'u', Ú: 'u', Ủ: 'u', Ũ: 'u', Ụ: 'u',
  Ư: 'u', Ừ: 'u', Ứ: 'u', Ử: 'u', Ữ: 'u', Ự: 'u',

  // y
  ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',

  // Y
  Ỳ: 'y', Ý: 'y', Ỷ: 'y', Ỹ: 'y', Ỵ: 'y',

  // đ / Đ
  đ: 'd', Đ: 'd',
}

/**
 * Generates a URL-friendly slug from a Vietnamese (or any) title.
 *
 * Steps:
 * 1. Replace Vietnamese Unicode characters with their ASCII equivalents.
 * 2. Convert to lowercase.
 * 3. Replace whitespace sequences with a hyphen.
 * 4. Remove any character that is not alphanumeric or a hyphen.
 * 5. Collapse consecutive hyphens into one.
 * 6. Trim leading / trailing hyphens.
 * 7. Truncate to 120 characters (trim any trailing hyphen after truncation).
 */
export function generateSlug(tieuDe: string): string {
  // Step 1: Replace Vietnamese characters using the character map
  let slug = tieuDe
    .split('')
    .map((ch) => VIET_MAP[ch] ?? ch)
    .join('')

  // Step 2: Lowercase
  slug = slug.toLowerCase()

  // Step 3: Replace whitespace sequences with hyphens
  slug = slug.replace(/\s+/g, '-')

  // Step 4: Remove characters that are not alphanumeric or hyphens
  slug = slug.replace(/[^a-z0-9-]/g, '')

  // Step 5: Collapse consecutive hyphens
  slug = slug.replace(/-{2,}/g, '-')

  // Step 6: Trim leading / trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '')

  // Step 7: Truncate to 120 characters, then clean up any trailing hyphen
  slug = slug.slice(0, 120).replace(/-+$/, '')

  return slug
}

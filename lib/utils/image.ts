/**
 * Rewrites a Supabase Storage public URL to use Supabase's image transformation CDN.
 * Falls back to the original URL if it's not a Supabase storage URL.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!url) return ''
  
  // Only optimize Supabase storage URLs
  if (!url.includes('/storage/v1/object/public/')) {
    return url
  }

  // Rewrite URL path from /object/public/ to /render/image/public/
  const optimizedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')

  const params = new URLSearchParams()
  
  if (options.width) {
    params.set('width', String(options.width))
  }
  if (options.height) {
    params.set('height', String(options.height))
  }
  
  // Set quality (defaults to 75 for optimal compression-to-quality ratio)
  params.set('quality', String(options.quality ?? 75))
  
  // 'auto' format automatically detects support for AVIF, WebP, etc.
  params.set('format', 'auto')

  const separator = optimizedUrl.includes('?') ? '&' : '?'
  return `${optimizedUrl}${separator}${params.toString()}`
}

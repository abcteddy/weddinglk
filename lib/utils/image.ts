/**
 * Rewrites a Supabase Storage public URL to use Supabase's image transformation CDN.
 * Falls back to the original URL if it's not a Supabase storage URL.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: { 
    width?: number; 
    height?: number; 
    quality?: number; 
    format?: 'origin' | 'webp' | 'avif' | 'auto';
    resize?: 'cover' | 'contain' | 'fill';
  } = {}
): string {
  if (!url) return ''
  
  // Supabase Free Tier does not support Image Transformation (throws 404/400 at /render/image/public/).
  // We return the original public URL directly to ensure all photos load successfully.
  return url

  /*
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

  // Set resize mode (defaults to 'contain' to maintain aspect ratio when only width or height is provided)
  params.set('resize', options.resize ?? 'contain')
  
  // If format is specified and is NOT 'auto', append it.
  // We omit 'auto' because the project's Supabase instance does not support 'auto' format and throws a 400.
  if (options.format && options.format !== 'auto') {
    params.set('format', options.format)
  }

  const separator = optimizedUrl.includes('?') ? '&' : '?'
  return `${optimizedUrl}${separator}${params.toString()}`
  */
}

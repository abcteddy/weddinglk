/**
 * Video embed utilities — detect YouTube / Vimeo / direct file URLs
 * and convert them to autoplay-ready embed URLs.
 */

export type VideoType = 'youtube' | 'vimeo' | 'direct'

export interface VideoInfo {
  type: VideoType
  embedUrl: string      // the URL to put in src= (iframe or <video>)
  originalUrl: string
}

// ── YouTube ──────────────────────────────────────────────────────
const YT_REGEX =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/

export function extractYoutubeId(url: string): string | null {
  const m = url.match(YT_REGEX)
  return m ? m[1] : null
}

export function buildYoutubeEmbed(videoId: string, options: {
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
} = {}): string {
  const p = new URLSearchParams({
    autoplay:         options.autoplay  ?? true  ? '1' : '0',
    mute:             options.muted     ?? true  ? '1' : '0',   // must be muted for autoplay to work in most browsers
    loop:             options.loop      ?? true  ? '1' : '0',
    controls:         options.controls  ?? false ? '1' : '0',
    playlist:         videoId,   // required for loop to work
    rel:              '0',
    modestbranding:   '1',
    showinfo:         '0',
    iv_load_policy:   '3',
    playsinline:      '1',
    disablekb:        '1',
    fs:               '0',       // hide fullscreen button
    enablejsapi:      '1',
  })
  return `https://www.youtube.com/embed/${videoId}?${p.toString()}`
}

// ── Vimeo ─────────────────────────────────────────────────────────
const VIMEO_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/

export function extractVimeoId(url: string): string | null {
  const m = url.match(VIMEO_REGEX)
  return m ? m[1] : null
}

export function buildVimeoEmbed(videoId: string, options: {
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
} = {}): string {
  const p = new URLSearchParams({
    autoplay: options.autoplay  ?? true  ? '1' : '0',
    muted:    options.muted     ?? true  ? '1' : '0',
    loop:     options.loop      ?? true  ? '1' : '0',
    controls: options.controls  ?? false ? '1' : '0',
    title:    '0',
    byline:   '0',
    portrait: '0',
    dnt:      '1',
    playsinline: '1',
  })
  return `https://player.vimeo.com/video/${videoId}?${p.toString()}`
}

// ── Main resolver ─────────────────────────────────────────────────
export function resolveVideo(url: string, options: {
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
} = {}): VideoInfo {
  const ytId = extractYoutubeId(url)
  if (ytId) {
    return {
      type: 'youtube',
      embedUrl: buildYoutubeEmbed(ytId, options),
      originalUrl: url,
    }
  }

  const vmId = extractVimeoId(url)
  if (vmId) {
    return {
      type: 'vimeo',
      embedUrl: buildVimeoEmbed(vmId, options),
      originalUrl: url,
    }
  }

  // Direct file (Supabase, CDN, etc.)
  return {
    type: 'direct',
    embedUrl: url,
    originalUrl: url,
  }
}

export function isEmbedUrl(url: string): boolean {
  return !!extractYoutubeId(url) || !!extractVimeoId(url)
}

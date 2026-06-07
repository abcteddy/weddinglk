import * as THREE from 'three'
import { TemplateConfig } from '@/types/invitation'

// --- Cached Canvas Textures ---
let cachedEnvMap: THREE.CanvasTexture | null = null
let cachedPaperTexture: THREE.CanvasTexture | null = null
let cachedWoodTexture: THREE.CanvasTexture | null = null
let cachedStoneTexture: THREE.CanvasTexture | null = null

/**
 * Generates a high-contrast gradient map to simulate studio lighting reflections
 * on metallic/gold objects. Essential for making gold look premium rather than flat yellow.
 */
export function getSharedEnvMap() {
  if (typeof window === 'undefined') return null
  if (cachedEnvMap) return cachedEnvMap

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Create sky/ground/horizon gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0.0, '#0c0714') // Deep purple-black sky
  grad.addColorStop(0.35, '#1b1226')
  grad.addColorStop(0.46, '#ffd580') // Champagne gold light reflection
  grad.addColorStop(0.49, '#ffffff') // Direct light source reflection
  grad.addColorStop(0.52, '#c5a059') // Antique gold horizon line
  grad.addColorStop(0.55, '#1e130a') // Deep brown ground reflection
  grad.addColorStop(0.85, '#0a0603')
  grad.addColorStop(1.0, '#040201')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 256)

  // Draw studio light boxes (vertical soft highlight bands)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.fillRect(60, 0, 40, 256)
  ctx.fillRect(180, 0, 100, 256)
  ctx.fillRect(380, 0, 50, 256)

  const texture = new THREE.CanvasTexture(canvas)
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.SRGBColorSpace
  cachedEnvMap = texture
  return texture
}

/**
 * Generates fine-grain noise and paper fibers to simulate rich cotton/linen cardstock.
 */
export function getPaperTexture() {
  if (typeof window === 'undefined') return null
  if (cachedPaperTexture) return cachedPaperTexture

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 256, 256)

  // Random fine-grain noise
  const imgData = ctx.getImageData(0, 0, 256, 256)
  const data = imgData.data
  for (let i = 0; i < data.length; i += 4) {
    const val = 255 + (Math.random() - 0.5) * 14
    data[i] = val
    data[i+1] = val
    data[i+2] = val
  }
  ctx.putImageData(imgData, 0, 0)

  // Fine organic paper fibers
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.lineWidth = 0.5
  for (let i = 0; i < 40; i++) {
    ctx.beginPath()
    const x = Math.random() * 256
    const y = Math.random() * 256
    const len = 4 + Math.random() * 12
    const angle = Math.random() * Math.PI * 2
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)
  cachedPaperTexture = texture
  return texture
}

/**
 * Generates teak wood grain lines and textures for traditional doors.
 */
export function getWoodTexture() {
  if (typeof window === 'undefined') return null
  if (cachedWoodTexture) return cachedWoodTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Warm teak wood brown base
  ctx.fillStyle = '#7a4f2c'
  ctx.fillRect(0, 0, 512, 512)

  // Rings / growth curves
  ctx.strokeStyle = 'rgba(40, 22, 10, 0.3)'
  ctx.lineWidth = 1.2
  for (let i = 0; i < 18; i++) {
    const xCenter = -150 + Math.random() * 80
    const yCenter = 256
    ctx.beginPath()
    ctx.arc(xCenter, yCenter, 180 + i * 35 + Math.random() * 15, -Math.PI / 3, Math.PI / 3)
    ctx.stroke()
  }

  // Draw fine horizontal wood grain fibers
  ctx.fillStyle = 'rgba(50, 28, 12, 0.2)'
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const w = 40 + Math.random() * 200
    const h = 0.8 + Math.random() * 1.2
    ctx.fillRect(x, y, w, h)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  cachedWoodTexture = texture
  return texture
}

/**
 * Generates marble-like stone texture with organic veins.
 */
export function getStoneTexture() {
  if (typeof window === 'undefined') return null
  if (cachedStoneTexture) return cachedStoneTexture

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#a0a5aa'
  ctx.fillRect(0, 0, 256, 256)

  // Grain noise
  const imgData = ctx.getImageData(0, 0, 256, 256)
  const data = imgData.data
  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] + (Math.random() - 0.5) * 18
    data[i] = val
    data[i+1] = val
    data[i+2] = val
  }
  ctx.putImageData(imgData, 0, 0)

  // Marble/stone veins
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)'
  ctx.lineWidth = 1.0
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    let x = Math.random() * 256
    let y = 0
    ctx.moveTo(x, y)
    for (let py = 10; py <= 256; py += 15) {
      x += (Math.random() - 0.5) * 22
      ctx.lineTo(x, py)
    }
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  cachedStoneTexture = texture
  return texture
}

// --- Materials Factory ---

export function createEnvelopeMaterial(template: TemplateConfig) {
  const envMap = getSharedEnvMap()
  const paper = getPaperTexture()
  return new THREE.MeshStandardMaterial({
    color: template.envelopeColor,
    roughness: 0.45,
    metalness: 0.12,
    bumpMap: paper ?? undefined,
    bumpScale: 0.02,
    envMap: envMap ?? undefined,
    envMapIntensity: 0.35,
  })
}

export function createFlapMaterial(template: TemplateConfig) {
  const envMap = getSharedEnvMap()
  const paper = getPaperTexture()
  return new THREE.MeshStandardMaterial({
    color: template.flapColor,
    roughness: 0.45,
    metalness: 0.12,
    bumpMap: paper ?? undefined,
    bumpScale: 0.02,
    envMap: envMap ?? undefined,
    envMapIntensity: 0.35,
    side: THREE.DoubleSide,
  })
}

export function createSealMaterial(template: TemplateConfig) {
  const envMap = getSharedEnvMap()
  return new THREE.MeshStandardMaterial({
    color: template.sealColor,
    roughness: 0.15,
    metalness: 0.85,
    envMap: envMap ?? undefined,
    envMapIntensity: 1.3,
  })
}

export function createPetalMaterial(hue: number, index: number) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(hue + (Math.random() - 0.5) * 0.05, 0.6, 0.45 + Math.random() * 0.25),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95,
    roughness: 0.75,
  })
}

export function createGoldMaterial() {
  const envMap = getSharedEnvMap()
  return new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Rich Royal Gold
    metalness: 1.0,
    roughness: 0.12,
    envMap: envMap ?? undefined,
    envMapIntensity: 1.6,
  })
}

export function createBrassMaterial() {
  const envMap = getSharedEnvMap()
  return new THREE.MeshStandardMaterial({
    color: 0xcca353, // Antique Brass
    metalness: 0.9,
    roughness: 0.2,
    envMap: envMap ?? undefined,
    envMapIntensity: 1.1,
  })
}


import { TemplateConfig, TemplateId } from '@/types/invitation'

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  royalWax: {
    id: 'royalWax',
    name: '👑 Royal Wax Seal',
    bgColor: 0x0b0b0f,
    ambientColor: 0x1a1329,
    keyLightColor: 0xffe8c0, // Warm studio light
    envelopeColor: 0x0e111a, // Premium midnight blue cardstock
    flapColor: 0x131724,
    sealColor: 0x9c1a3c, // Royal red wax
    sealEmissive: 0x5a0b20,
    petalHue: 0.12, // Gold dust particles
    fontFamily: "'Playfair Display', serif",
    accentColor: '#d4af37', // Polished gold
    textColor: '#f9f6f0',
    previewGradient: 'linear-gradient(135deg, #0e111a 0%, #20132a 50%, #0e111a 100%)',
  },
  rosePetal: {
    id: 'rosePetal',
    name: '🌹 Champagne Rose Petal',
    bgColor: 0x0f0b0d,
    ambientColor: 0x221319,
    keyLightColor: 0xffeae0,
    envelopeColor: 0xf2ded1, // Luxury Champagne / Cream cardstock
    flapColor: 0xe5d0c2,
    sealColor: 0xb57c8d, // Velvet Rose Quartz wax
    sealEmissive: 0x542e39,
    petalHue: 0.95, // Soft rose petals
    fontFamily: "'Cormorant Garamond', serif",
    accentColor: '#c890a6',
    textColor: '#fdfbfa',
    previewGradient: 'linear-gradient(135deg, #f2ded1 0%, #c890a6 50%, #f2ded1 100%)',
  },
  sinhalaTraditional: {
    id: 'sinhalaTraditional',
    name: '🥁 Traditional Sri Lankan Teak',
    bgColor: 0x160105,
    ambientColor: 0x230005,
    keyLightColor: 0xffcb80,
    envelopeColor: 0x6e4325, // Teak Wood envelope
    flapColor: 0xcca353,
    sealColor: 0xcca353, // Traditional brass seal
    sealEmissive: 0x7a5a1f,
    petalHue: 0.08, // Golden/orange embers
    fontFamily: "'Cinzel', serif",
    accentColor: '#cca353',
    textColor: '#ffffff',
    previewGradient: 'linear-gradient(135deg, #160105 0%, #4a000e 50%, #160105 100%)',
  },
  royalGardenGate: {
    id: 'royalGardenGate',
    name: '🚪 Royal Arched Gate',
    bgColor: 0x050806, // Deep English garden green
    ambientColor: 0x101b12,
    keyLightColor: 0xffe5b0,
    envelopeColor: 0xd4af37, // Polished Gold
    flapColor: 0xd4af37,
    sealColor: 0xd4af37,
    sealEmissive: 0x8b6914,
    petalHue: 0.12, // Golden light dust
    fontFamily: "'Playfair Display', serif",
    accentColor: '#d4af37',
    textColor: '#f9f6f0',
    previewGradient: 'linear-gradient(135deg, #050806 0%, #172a1e 50%, #050806 100%)',
  },
  coupleMonogram: {
    id: 'coupleMonogram',
    name: '🖤 Luxury Monogram',
    bgColor: 0x090909, // Matte velvet black
    ambientColor: 0x141414,
    keyLightColor: 0xffffff,
    envelopeColor: 0x161616, // Textured Charcoal paper
    flapColor: 0x1f1f1f,
    sealColor: 0x7a0c24, // Embossed burgundy wax
    sealEmissive: 0x3d030f,
    petalHue: 0.12, // Floating gold foil flakes
    fontFamily: "'Playfair Display', serif",
    accentColor: '#d4af37', // Gold foil monogram
    textColor: '#ffffff',
    previewGradient: 'linear-gradient(135deg, #161616 0%, #2b2b2b 50%, #161616 100%)',
  },
  // Backwards compatibility fallbacks
  classic: {
    id: 'classic',
    name: 'Classic Ivory',
    bgColor: 0x0a0005,
    ambientColor: 0x2a0018,
    keyLightColor: 0xff6090,
    envelopeColor: 0x1a0010,
    flapColor: 0x250015,
    sealColor: 0x8b3a5a,
    sealEmissive: 0x3a1020,
    petalHue: 0.92,
    fontFamily: "'Cormorant Garamond', serif",
    accentColor: '#c9889e',
    textColor: '#f5d0df',
    previewGradient: 'linear-gradient(135deg, #1a0010 0%, #3d0020 50%, #1a0010 100%)',
  },
  modernGold: {
    id: 'modernGold',
    name: 'Modern Gold',
    bgColor: 0x080600,
    ambientColor: 0x201800,
    keyLightColor: 0xffd080,
    envelopeColor: 0x1a1400,
    flapColor: 0x221a00,
    sealColor: 0xb8860b,
    sealEmissive: 0x4a3000,
    petalHue: 0.12,
    fontFamily: "'Playfair Display', serif",
    accentColor: '#d4a017',
    textColor: '#fff8e1',
    previewGradient: 'linear-gradient(135deg, #1a1400 0%, #3d3000 50%, #1a1400 100%)',
  },
  tropicalGarden: {
    id: 'tropicalGarden',
    name: 'Tropical Garden',
    bgColor: 0x020a04,
    ambientColor: 0x081a0c,
    keyLightColor: 0x80ff90,
    envelopeColor: 0x0a1a0c,
    flapColor: 0x0c200e,
    sealColor: 0x2d6a4f,
    sealEmissive: 0x081a0c,
    petalHue: 0.35,
    fontFamily: "'Libre Baskerville', serif",
    accentColor: '#52b788',
    textColor: '#d8f3dc',
    previewGradient: 'linear-gradient(135deg, #020a04 0%, #0d2b12 50%, #020a04 100%)',
  },
  royalBlue: {
    id: 'royalBlue',
    name: 'Royal Blue',
    bgColor: 0x00050f,
    ambientColor: 0x000820,
    keyLightColor: 0x4080ff,
    envelopeColor: 0x00081a,
    flapColor: 0x000d22,
    sealColor: 0x1a3a8f,
    sealEmissive: 0x000820,
    petalHue: 0.62,
    fontFamily: "'Cinzel', serif",
    accentColor: '#4a90e2',
    textColor: '#e8f0fe',
    previewGradient: 'linear-gradient(135deg, #00050f 0%, #001030 50%, #00050f 100%)',
  },
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)

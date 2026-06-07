import { TemplateConfig } from '@/types/invitation'

export const TEMPLATES: Record<string, TemplateConfig> = {
  royalRose: {
    id: 'royalRose',
    name: 'Royal Rose',
    accentColor: '#D4AF37', // Gold
    textColor: '#ffffff',
    fontFamily: 'Great Vibes',
    previewGradient: 'linear-gradient(135deg, #1b0207 0%, #4a0312 50%, #1b0207 100%)',
    isPremium: true
  },
  goldenLove: {
    id: 'goldenLove',
    name: 'Golden Love',
    accentColor: '#C5A880',
    textColor: '#ffffff',
    fontFamily: 'Playfair Display',
    previewGradient: 'linear-gradient(135deg, #fbfbfb 0%, #eaeaea 50%, #e0ccb1 100%)',
    isPremium: true
  },
  elegantWhite: {
    id: 'elegantWhite',
    name: 'Elegant White',
    accentColor: '#706053',
    textColor: '#4a3f35',
    fontFamily: 'Montserrat',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #f7f7f7 50%, #eaeaea 100%)',
    isPremium: true
  },
  glitterGold: {
    id: 'glitterGold',
    name: 'Glitter & Gold',
    accentColor: '#D4AF37',
    textColor: '#ffffff',
    fontFamily: 'Alex Brush',
    previewGradient: 'linear-gradient(135deg, #0f0c08 0%, #2a2013 50%, #0f0c08 100%)',
    isPremium: true
  },
  greenery: {
    id: 'greenery',
    name: 'Greenery',
    accentColor: '#1d3f2a',
    textColor: '#2e4a38',
    fontFamily: 'Cormorant Garamond',
    previewGradient: 'linear-gradient(135deg, #f3f7f4 0%, #e4ece7 50%, #c8dad0 100%)',
    isPremium: true
  },
  lavenderDreams: {
    id: 'lavenderDreams',
    name: 'Lavender Dreams',
    accentColor: '#6d597a',
    textColor: '#3d314a',
    fontFamily: 'Pinyon Script',
    previewGradient: 'linear-gradient(135deg, #faf6fa 0%, #eee4ee 50%, #dfcedf 100%)',
    isPremium: true
  },
  classic: {
    id: 'classic',
    name: 'Classic Ivory',
    accentColor: '#D4AF37',
    textColor: '#ffffff',
    fontFamily: 'Playfair Display',
    previewGradient: 'linear-gradient(135deg, #0b0b0f 0%, #1a1a1f 50%, #0b0b0f 100%)',
    isPremium: false,
    
    // Legacy 3D coordinates for landing page rendering
    bgColor: 0x0a0005,
    ambientColor: 0x2a0018,
    keyLightColor: 0xff6090,
    envelopeColor: 0x1a0010,
    flapColor: 0x250015,
    sealColor: 0x8b3a5a,
    sealEmissive: 0x3a1020,
    petalHue: 0.92,
  }
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)
export type TemplateIdType = 'royalRose' | 'goldenLove' | 'elegantWhite' | 'glitterGold' | 'greenery' | 'lavenderDreams' | 'classic'

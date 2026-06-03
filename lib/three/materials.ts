import * as THREE from 'three'
import { TemplateConfig } from '@/types/invitation'

export function createEnvelopeMaterial(template: TemplateConfig) {
  return new THREE.MeshStandardMaterial({
    color: template.envelopeColor,
    roughness: 0.35,
    metalness: 0.08,
  })
}

export function createFlapMaterial(template: TemplateConfig) {
  return new THREE.MeshStandardMaterial({
    color: template.flapColor,
    roughness: 0.4,
    metalness: 0.05,
    side: THREE.DoubleSide,
  })
}

export function createSealMaterial(template: TemplateConfig) {
  return new THREE.MeshStandardMaterial({
    color: template.sealColor,
    roughness: 0.2,
    metalness: 0.6,
    emissive: new THREE.Color(template.sealEmissive),
    emissiveIntensity: 0.6,
  })
}

export function createPetalMaterial(hue: number, index: number) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(hue + (Math.random() - 0.5) * 0.06, 0.6, 0.5 + Math.random() * 0.2),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
    roughness: 0.8,
  })
}

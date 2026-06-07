import * as THREE from 'three'
import { TemplateConfig } from '@/types/invitation'
import {
  createEnvelopeMaterial,
  createFlapMaterial,
  createSealMaterial,
  createGoldMaterial,
  getPaperTexture,
} from '@/lib/three/materials'

export interface EnvelopeGroup extends THREE.Group {
  flap: THREE.Mesh
  seal: THREE.Group
  invitationCard: THREE.Mesh
  flapOpen: boolean
}

/**
 * Builds an organic, dripped wax seal shape using vertex displacement.
 */
function buildOrganicSealGeometry(radius: number) {
  const shape = new THREE.Shape()
  const segments = 36
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    // Trig noise to represent irregular melted wax flow
    const noise = Math.sin(theta * 6) * 0.022 + Math.cos(theta * 11) * 0.012 + Math.sin(theta * 3) * 0.008
    const r = radius + noise
    const x = Math.cos(theta) * r
    const y = Math.sin(theta) * r
    if (i === 0) {
      shape.moveTo(x, y)
    } else {
      shape.lineTo(x, y)
    }
  }

  const extrudeSettings = {
    steps: 1,
    depth: 0.015,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.01,
    bevelSegments: 4,
  }

  return new THREE.ExtrudeGeometry(shape, extrudeSettings)
}

export function buildEnvelope(template: TemplateConfig): EnvelopeGroup {
  const group = new THREE.Group() as EnvelopeGroup
  group.flapOpen = false

  const goldMat = createGoldMaterial()

  // --- Envelope body ---
  const bodyGeo = new THREE.BoxGeometry(3.2, 2.1, 0.05)
  const body = new THREE.Mesh(bodyGeo, createEnvelopeMaterial(template))
  body.receiveShadow = true
  body.castShadow = true
  group.add(body)

  // --- Bottom V fold lines (decorative gold foil embossing) ---
  const linesMat = new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.45 })
  const leftPts = [
    new THREE.Vector3(-1.6, -1.05, 0.032),
    new THREE.Vector3(0, 0.2, 0.032),
    new THREE.Vector3(1.6, -1.05, 0.032),
  ]
  const foldLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftPts), linesMat)
  group.add(foldLine)

  // --- Flap Foil Accent (creates a gold trim line under the flap) ---
  const foilShape = new THREE.Shape()
  foilShape.moveTo(-1.63, 0)
  foilShape.lineTo(0, 1.17)
  foilShape.lineTo(1.63, 0)
  foilShape.closePath()
  const flapFoil = new THREE.Mesh(new THREE.ShapeGeometry(foilShape), goldMat)
  flapFoil.position.set(0, 1.05, 0.035) // Place slightly behind the main flap (z=0.04)
  group.add(flapFoil)

  // --- Top flap (triangle) ---
  const flapShape = new THREE.Shape()
  flapShape.moveTo(-1.6, 0)
  flapShape.lineTo(0, 1.15)
  flapShape.lineTo(1.6, 0)
  flapShape.closePath()

  const flap = new THREE.Mesh(
    new THREE.ShapeGeometry(flapShape),
    createFlapMaterial(template),
  )
  flap.position.set(0, 1.05, 0.04)
  flap.castShadow = true
  group.add(flap)
  group.flap = flap

  // --- Custom Seal (Organic Wax with Detailed Stamps) ---
  const sealGroup = new THREE.Group()
  sealGroup.position.set(0, 0.55, 0.065)
  
  const sealMat = createSealMaterial(template)

  // Organic Melted Wax Base
  const waxBaseGeo = buildOrganicSealGeometry(0.24)
  const waxBase = new THREE.Mesh(waxBaseGeo, sealMat)
  waxBase.castShadow = true
  waxBase.position.z = -0.005
  sealGroup.add(waxBase)

  if (template.id === 'rosePetal') {
    // 3D Rose Bud
    const bud = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), sealMat)
    bud.position.set(0, 0, 0.02)
    sealGroup.add(bud)

    // Inner petals
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), sealMat)
      petal.scale.set(1.2, 0.7, 0.3)
      petal.position.set(Math.cos(angle) * 0.07, Math.sin(angle) * 0.07, 0.02)
      petal.rotation.z = angle + Math.PI / 2
      sealGroup.add(petal)
    }

    // Outer petals
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8 + 0.3
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), sealMat)
      petal.scale.set(1.4, 0.8, 0.3)
      petal.position.set(Math.cos(angle) * 0.13, Math.sin(angle) * 0.13, 0.018)
      petal.rotation.z = angle + Math.PI / 2
      sealGroup.add(petal)
    }
  } else if (template.id === 'coupleMonogram') {
    // Stylized Monogram Ring & Letters (e.g., M & K)
    const letterM = new THREE.Group()
    const verticalLine = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6)
    const mLeft = new THREE.Mesh(verticalLine, goldMat)
    mLeft.position.set(-0.06, 0, 0.02)
    const mRight = new THREE.Mesh(verticalLine, goldMat)
    mRight.position.set(-0.01, 0, 0.02)

    const diagonalLine = new THREE.CylinderGeometry(0.006, 0.006, 0.11, 6)
    const mDiagL = new THREE.Mesh(diagonalLine, goldMat)
    mDiagL.position.set(-0.045, 0.018, 0.02)
    mDiagL.rotation.z = -Math.PI / 6
    const mDiagR = new THREE.Mesh(diagonalLine, goldMat)
    mDiagR.position.set(-0.025, 0.018, 0.02)
    mDiagR.rotation.z = Math.PI / 6
    letterM.add(mLeft, mRight, mDiagL, mDiagR)
    sealGroup.add(letterM)

    const letterK = new THREE.Group()
    const kPole = new THREE.Mesh(verticalLine, goldMat)
    kPole.position.set(0.03, 0, 0.02)
    const kDiagU = new THREE.Mesh(diagonalLine, goldMat)
    kDiagU.position.set(0.05, 0.035, 0.02)
    kDiagU.rotation.z = -Math.PI / 4
    const kDiagD = new THREE.Mesh(diagonalLine, goldMat)
    kDiagD.position.set(0.05, -0.035, 0.02)
    kDiagD.rotation.z = Math.PI / 4
    letterK.add(kPole, kDiagU, kDiagD)
    sealGroup.add(letterK)

    // Gold monogram border crest
    const crestRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.008, 8, 32), goldMat)
    crestRing.position.set(0, 0, 0.02)
    sealGroup.add(crestRing)
  } else {
    // Royal Gold Leaf sprig (Example 1)
    const stemGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.22, 6)
    const stem = new THREE.Mesh(stemGeo, goldMat)
    stem.rotation.z = Math.PI / 6
    stem.position.set(-0.02, 0, 0.02)
    sealGroup.add(stem)

    const leafGeo = new THREE.ConeGeometry(0.022, 0.065, 4)
    leafGeo.scale(1, 1, 0.2) // Flatten cone to look like leaf
    for (let i = 0; i < 4; i++) {
      const leafL = new THREE.Mesh(leafGeo, goldMat)
      leafL.position.set(-0.05 + i * 0.02, -0.06 + i * 0.05, 0.022)
      leafL.rotation.z = Math.PI / 3
      
      const leafR = new THREE.Mesh(leafGeo, goldMat)
      leafR.position.set(0.01 + i * 0.02, -0.09 + i * 0.05, 0.022)
      leafR.rotation.z = -Math.PI / 3
      
      sealGroup.add(leafL, leafR)
    }

    // Outer border detailing
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.008, 6, 28), goldMat)
    outerRing.position.set(0, 0, 0.018)
    sealGroup.add(outerRing)
  }

  group.add(sealGroup)
  group.seal = sealGroup as any

  // --- Inner Invitation Card (inside envelope) ---
  const paperTexture = getPaperTexture()
  const cardMaterial = new THREE.MeshStandardMaterial({
    color: 0xfbf8f2, // Linen/Parchment Ivory Cream
    roughness: 0.5,
    metalness: 0.05,
    bumpMap: paperTexture ?? undefined,
    bumpScale: 0.012,
    side: THREE.DoubleSide,
  })
  
  const cardGeo = new THREE.BoxGeometry(3.0, 2.0, 0.03)
  const card = new THREE.Mesh(cardGeo, cardMaterial)
  card.position.set(0, 0, -0.01)
  card.castShadow = true

  // --- Elegant gold foil border frame on the card face ---
  const frameGroup = new THREE.Group()
  const borderThickness = 0.015
  const cardW = 2.8
  const cardH = 1.8
  
  // Top bar
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(cardW, borderThickness, 0.005), goldMat)
  topBar.position.set(0, cardH / 2, 0.016)
  frameGroup.add(topBar)
  // Bottom bar
  const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(cardW, borderThickness, 0.005), goldMat)
  bottomBar.position.set(0, -cardH / 2, 0.016)
  frameGroup.add(bottomBar)
  // Left bar
  const leftBar = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, cardH, 0.005), goldMat)
  leftBar.position.set(-cardW / 2, 0, 0.016)
  frameGroup.add(leftBar)
  // Right bar
  const rightBar = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, cardH, 0.005), goldMat)
  rightBar.position.set(cardW / 2, 0, 0.016)
  frameGroup.add(rightBar)

  // Ornate corner stars
  const starGeo = new THREE.ConeGeometry(0.025, 0.025, 4)
  const corners = [
    [-cardW/2, cardH/2],
    [cardW/2, cardH/2],
    [-cardW/2, -cardH/2],
    [cardW/2, -cardH/2],
  ]
  corners.forEach(([cx, cy]) => {
    const star = new THREE.Mesh(starGeo, goldMat)
    star.position.set(cx, cy, 0.018)
    star.rotation.x = Math.PI / 2
    frameGroup.add(star)
  })

  card.add(frameGroup)
  group.add(card)
  group.invitationCard = card

  // --- Side flap lines (subtle details) ---
  const sideLineMat = new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.25 })

  const leftLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.6, -1.05, 0.04),
      new THREE.Vector3(0, 0.2, 0.04),
    ]),
    sideLineMat,
  )
  const rightLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(1.6, -1.05, 0.04),
      new THREE.Vector3(0, 0.2, 0.04),
    ]),
    sideLineMat,
  )
  group.add(leftLine, rightLine)

  return group
}

import * as THREE from 'three'
import { TemplateConfig } from '@/types/invitation'
import {
  createGoldMaterial,
  createBrassMaterial,
  getPaperTexture,
  getWoodTexture,
  getStoneTexture,
} from '@/lib/three/materials'

export interface TraditionalDoorGroup extends THREE.Group {
  leftDoor: THREE.Group
  rightDoor: THREE.Group
  invitationCard: THREE.Mesh
  leftFlame: THREE.Mesh
  rightFlame: THREE.Mesh
  doorOpen: boolean
}

export function buildTraditionalDoorAndPoruwa(template: TemplateConfig): TraditionalDoorGroup {
  const mainGroup = new THREE.Group() as TraditionalDoorGroup
  mainGroup.doorOpen = false

  const goldMaterial = createGoldMaterial()
  const brassMaterial = createBrassMaterial()

  // --- Materials ---
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e4325, // Rich Teak/Mahogany Wood
    roughness: 0.55,
    metalness: 0.15,
    map: getWoodTexture() ?? undefined,
    bumpMap: getWoodTexture() ?? undefined,
    bumpScale: 0.03,
  })

  const flameMaterial = new THREE.MeshStandardMaterial({
    color: 0xff5500, // Fire Orange Glow Core
    roughness: 0.1,
    emissive: new THREE.Color(0xff5500),
    emissiveIntensity: 2.5,
  })

  const poruwaMaterial = new THREE.MeshStandardMaterial({
    color: 0x40000a, // Imperial Crimson Lacquer Backdrop
    roughness: 0.45,
    metalness: 0.18,
    bumpMap: getPaperTexture() ?? undefined,
    bumpScale: 0.015,
  })

  const cardMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a000e, // Deep Maroon Velvet Card
    roughness: 0.55,
    metalness: 0.15,
    bumpMap: getPaperTexture() ?? undefined,
    bumpScale: 0.015,
    side: THREE.DoubleSide,
  })

  const stoneFloorMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3135, // Polished Dark Temple Stone
    roughness: 0.7,
    bumpMap: getStoneTexture() ?? undefined,
    bumpScale: 0.03,
  })

  // --- Temple Stone Floor ---
  const floorGeo = new THREE.PlaneGeometry(60, 60)
  const floor = new THREE.Mesh(floorGeo, stoneFloorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.5
  floor.receiveShadow = true
  mainGroup.add(floor)

  // --- Ornate Wooden Temple Doors ---
  const doorWidth = 1.8
  const doorHeight = 3.6

  const buildBeveledDoor = (isLeft: boolean) => {
    const doorGroup = new THREE.Group()
    const pivotX = isLeft ? -1.8 : 1.8
    doorGroup.position.set(pivotX, 0.3, 0)

    const panel = new THREE.Group()
    panel.position.x = isLeft ? 0.9 : -0.9 // pivot offset

    // 1. Base door wood panel (z = 0)
    const baseGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.08)
    const baseDoor = new THREE.Mesh(baseGeo, woodMaterial)
    baseDoor.castShadow = true
    baseDoor.receiveShadow = true
    panel.add(baseDoor)

    // 2. Beveled inner panel border (subtle protrusion on Z, slightly inset on X/Y)
    const borderW = doorWidth - 0.16
    const borderH = doorHeight - 0.16
    const insetBorder = new THREE.Mesh(new THREE.BoxGeometry(borderW, borderH, 0.02), woodMaterial)
    insetBorder.position.z = 0.045
    insetBorder.castShadow = true
    panel.add(insetBorder)

    // 3. Central beveled panels (raised middle blocks for depth)
    const pW = borderW - 0.12
    const pH = (borderH / 2) - 0.16

    const topRaised = new THREE.Mesh(new THREE.BoxGeometry(pW, pH, 0.02), woodMaterial)
    topRaised.position.set(0, borderH / 4, 0.055)
    topRaised.castShadow = true
    panel.add(topRaised)

    const bottomRaised = new THREE.Mesh(new THREE.BoxGeometry(pW, pH, 0.02), woodMaterial)
    bottomRaised.position.set(0, -borderH / 4, 0.055)
    bottomRaised.castShadow = true
    panel.add(bottomRaised)

    // 4. Large Ornate Brass Lotus Medallion in the center
    const medallionGroup = new THREE.Group()
    medallionGroup.position.set(0, 0, 0.065)

    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.015, 24), brassMaterial)
    plate.rotation.x = Math.PI / 2
    plate.castShadow = true
    medallionGroup.add(plate)

    // Lotus petals (8 squashed spheres)
    const petalGeo = new THREE.SphereGeometry(0.04, 12, 12)
    petalGeo.scale(1.4, 0.6, 0.2)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const petal = new THREE.Mesh(petalGeo, brassMaterial)
      petal.position.set(Math.cos(angle) * 0.12, Math.sin(angle) * 0.12, 0.01)
      petal.rotation.z = angle
      petal.castShadow = true
      medallionGroup.add(petal)
    }

    // Central boss dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), brassMaterial)
    dome.position.z = 0.015
    dome.castShadow = true
    medallionGroup.add(dome)

    panel.add(medallionGroup)

    // Decorative brass studs (stud borders)
    const studGeo = new THREE.SphereGeometry(0.018, 8, 8)
    const studsX = [pW / 2 - 0.04, -pW / 2 + 0.04]
    const studsY = [pH / 2 - 0.04, -pH / 2 + 0.04]
    studsX.forEach(sx => {
      studsY.forEach(sy => {
        // top panel studs
        const studT = new THREE.Mesh(studGeo, brassMaterial)
        studT.position.set(sx, borderH / 4 + sy, 0.065)
        panel.add(studT)
        // bottom panel studs
        const studB = new THREE.Mesh(studGeo, brassMaterial)
        studB.position.set(sx, -borderH / 4 + sy, 0.065)
        panel.add(studB)
      })
    })

    // Antique traditional brass drop loop handle
    const handleGroup = new THREE.Group()
    handleGroup.position.set(isLeft ? 0.72 : -0.72, 0, 0.07)

    const handleMount = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), brassMaterial)
    handleMount.rotation.x = Math.PI / 2
    handleGroup.add(handleMount)

    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.014, 8, 24), brassMaterial)
    loop.position.z = 0.015
    loop.castShadow = true
    handleGroup.add(loop)

    panel.add(handleGroup)
    doorGroup.add(panel)
    mainGroup.add(doorGroup)

    return doorGroup
  }

  mainGroup.leftDoor = buildBeveledDoor(true)
  mainGroup.rightDoor = buildBeveledDoor(false)

  // --- Ornate Brass Oil Lamps (Pana) ---
  const buildOilLamp = (xPos: number) => {
    const lampGroup = new THREE.Group()
    lampGroup.position.set(xPos, 0, 0.6)

    // 1. Tiered base steps
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.12, 24), brassMaterial)
    base1.position.y = -1.44
    base1.castShadow = true
    lampGroup.add(base1)

    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.08, 20), brassMaterial)
    base2.position.y = -1.34
    base2.castShadow = true
    lampGroup.add(base2)

    const base3 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.06, 16), brassMaterial)
    base3.position.y = -1.27
    base3.castShadow = true
    lampGroup.add(base3)

    // 2. Ornate turned stem
    const stemSegments = [
      { y: -0.9, r1: 0.03, r2: 0.03, h: 0.7 },
      { y: -0.5, r1: 0.05, r2: 0.05, h: 0.1 },
      { y: -0.2, r1: 0.025, r2: 0.025, h: 0.5 },
      { y: 0.1, r1: 0.06, r2: 0.04, h: 0.15 },
    ]
    stemSegments.forEach(seg => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(seg.r1, seg.r2, seg.h, 12), brassMaterial)
      p.position.y = seg.y
      p.castShadow = true
      lampGroup.add(p)
    })

    // Turned rings along the stem body
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.015, 8, 16), brassMaterial)
    ring1.position.y = -0.55
    ring1.rotation.x = Math.PI / 2
    lampGroup.add(ring1)

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 8, 16), brassMaterial)
    ring2.position.y = -0.15
    ring2.rotation.x = Math.PI / 2
    lampGroup.add(ring2)

    // 3. Ornate oil bowl cup
    const bowlGeo = new THREE.CylinderGeometry(0.22, 0.12, 0.15, 24)
    const bowl = new THREE.Mesh(bowlGeo, brassMaterial)
    bowl.position.y = 0.22
    bowl.castShadow = true
    lampGroup.add(bowl)

    // Rolled rim ring
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.015, 8, 24), brassMaterial)
    rim.position.y = 0.295
    rim.rotation.x = Math.PI / 2
    lampGroup.add(rim)

    // 4. Glowing 3D candle flame (double layered cone)
    const flameInnerGeo = new THREE.ConeGeometry(0.05, 0.2, 12)
    const flameInner = new THREE.Mesh(flameInnerGeo, flameMaterial)
    flameInner.position.y = 0.35
    flameInner.castShadow = true
    lampGroup.add(flameInner)

    // Transparent outer flame aura
    const flameOuterGeo = new THREE.ConeGeometry(0.07, 0.25, 12)
    const flameOuter = new THREE.Mesh(
      flameOuterGeo,
      new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: new THREE.Color(0xff8800),
        emissiveIntensity: 1.6,
        transparent: true,
        opacity: 0.6,
      })
    )
    flameOuter.position.y = 0.35
    lampGroup.add(flameOuter)

    mainGroup.add(lampGroup)
    return flameInner
  }

  mainGroup.leftFlame = buildOilLamp(-2.4)
  mainGroup.rightFlame = buildOilLamp(2.4)

  // --- Traditional Poruwa Backdrop Wall ---
  const wallGroup = new THREE.Group()
  wallGroup.position.set(0, 0.75, -6.0)

  const wallGeo = new THREE.BoxGeometry(6.5, 4.5, 0.1)
  const wall = new THREE.Mesh(wallGeo, poruwaMaterial)
  wall.receiveShadow = true
  wallGroup.add(wall)

  // Double gold foil borders on backdrop wall
  const border1 = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.6, 0.02), goldMaterial)
  border1.position.z = -0.01
  wallGroup.add(border1)

  const border2 = new THREE.Mesh(new THREE.BoxGeometry(6.3, 4.3, 0.02), goldMaterial)
  border2.position.z = 0.015
  border2.castShadow = true
  wallGroup.add(border2)

  // Ornate central Surya Mandalaya sun motif
  const sunCenter = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 24), goldMaterial)
  sunCenter.position.set(0, 0.6, 0.06)
  sunCenter.scale.set(1, 1, 0.3)
  wallGroup.add(sunCenter)

  const innerSunRing = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.02, 8, 36), goldMaterial)
  innerSunRing.position.set(0, 0.6, 0.06)
  wallGroup.add(innerSunRing)

  const outerSunRing = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.025, 8, 48), goldMaterial)
  outerSunRing.position.set(0, 0.6, 0.06)
  wallGroup.add(outerSunRing)

  // Radial spikes
  const spikeGeo = new THREE.ConeGeometry(0.022, 0.28, 4)
  spikeGeo.scale(1, 1, 0.2)
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2
    const spike = new THREE.Mesh(spikeGeo, goldMaterial)
    spike.position.set(Math.cos(angle) * 0.52, 0.6 + Math.sin(angle) * 0.52, 0.06)
    spike.rotation.z = angle - Math.PI / 2
    spike.castShadow = true
    wallGroup.add(spike)
  }

  mainGroup.add(wallGroup)

  // --- Floating 3D Wedding Invitation Card (Deep Crimson with Gold Border Frame) ---
  const cardGroup = new THREE.Group()
  cardGroup.position.set(0, 0.2, -4.8)
  cardGroup.scale.set(0.001, 0.001, 0.001)

  const cardBodyGeo = new THREE.BoxGeometry(2.2, 3.2, 0.04)
  const cardBody = new THREE.Mesh(cardBodyGeo, cardMaterial)
  cardBody.castShadow = true
  cardBody.receiveShadow = true
  cardGroup.add(cardBody)

  // Gold border frame around card face
  const decGroup = new THREE.Group()
  const borderThickness = 0.015
  const borderW = 2.0
  const borderH = 3.0
  
  // Frame paths
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(borderW, borderThickness, 0.004), goldMaterial)
  topBar.position.set(0, borderH / 2, 0.022)
  const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(borderW, borderThickness, 0.004), goldMaterial)
  bottomBar.position.set(0, -borderH / 2, 0.022)
  const leftBar = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, borderH, 0.004), goldMaterial)
  leftBar.position.set(-borderW / 2, 0, 0.022)
  const rightBar = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, borderH, 0.004), goldMaterial)
  rightBar.position.set(borderW / 2, 0, 0.022)
  decGroup.add(topBar, bottomBar, leftBar, rightBar)

  // Corner stars
  const starGeo = new THREE.ConeGeometry(0.025, 0.025, 4)
  const corners = [
    [-borderW / 2, borderH / 2],
    [borderW / 2, borderH / 2],
    [-borderW / 2, -borderH / 2],
    [borderW / 2, -borderH / 2],
  ]
  corners.forEach(([cx, cy]) => {
    const star = new THREE.Mesh(starGeo, goldMaterial)
    star.position.set(cx, cy, 0.025)
    star.rotation.x = Math.PI / 2
    decGroup.add(star)
  })

  // Gold Poruwa Crest on Card Header
  const crest = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.01, 6, 24), goldMaterial)
  crest.position.set(0, 1.05, 0.022)
  decGroup.add(crest)

  cardGroup.add(decGroup)
  mainGroup.add(cardGroup)
  mainGroup.invitationCard = cardGroup as any

  return mainGroup
}

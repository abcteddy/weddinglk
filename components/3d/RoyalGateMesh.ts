import * as THREE from 'three'
import { TemplateConfig } from '@/types/invitation'
import {
  createGoldMaterial,
  getPaperTexture,
  getWoodTexture,
  getStoneTexture,
} from '@/lib/three/materials'

export interface RoyalGateGroup extends THREE.Group {
  leftGate: THREE.Group
  rightGate: THREE.Group
  invitationCard: THREE.Mesh
  gateOpen: boolean
}

export function buildRoyalGateAndGarden(template: TemplateConfig): RoyalGateGroup {
  const mainGroup = new THREE.Group() as RoyalGateGroup
  mainGroup.gateOpen = false

  const goldMat = createGoldMaterial()

  // --- Materials ---
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xe2e6ea, // Polished Slate/Marble
    roughness: 0.65,
    metalness: 0.1,
    bumpMap: getStoneTexture() ?? undefined,
    bumpScale: 0.02,
  })

  const columnMat = new THREE.MeshStandardMaterial({
    color: 0xf1f3f5, // Fine Carrara Marble
    roughness: 0.3,
    metalness: 0.15,
    bumpMap: getStoneTexture() ?? undefined,
    bumpScale: 0.01,
  })

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x112f1a, // Rich Royal Green Velvet Garden
    roughness: 0.85,
    metalness: 0.05,
  })

  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x3d4349, // Slate Cobblestone Path
    roughness: 0.75,
    metalness: 0.15,
    bumpMap: getStoneTexture() ?? undefined,
    bumpScale: 0.04,
  })

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x503622, // Carved Wood
    roughness: 0.8,
    map: getWoodTexture() ?? undefined,
  })

  const leavesMat = new THREE.MeshStandardMaterial({
    color: 0x1b4332, // Deep Emerald Topiary Foliage
    roughness: 0.8,
  })

  // --- Ground Plane ---
  const groundGeo = new THREE.PlaneGeometry(60, 60)
  const ground = new THREE.Mesh(groundGeo, grassMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.5
  ground.receiveShadow = true
  mainGroup.add(ground)

  // --- Stone Pathway ---
  const pathGeo = new THREE.PlaneGeometry(3.6, 40)
  const path = new THREE.Mesh(pathGeo, pathMat)
  path.rotation.x = -Math.PI / 2
  path.position.set(0, -1.49, -10)
  path.receiveShadow = true
  mainGroup.add(path)

  // --- Gothic/Baroque Arched Stone Entryway ---
  const archGroup = new THREE.Group()
  archGroup.position.set(0, 0, 0)
  mainGroup.add(archGroup)

  // Fluted columns body factory
  const buildFlutedPillar = (xPos: number) => {
    const pGroup = new THREE.Group()
    
    // Main column body (fluted core)
    const bodyHeight = 4.2
    const coreGeo = new THREE.CylinderGeometry(0.24, 0.24, bodyHeight, 16)
    const core = new THREE.Mesh(coreGeo, columnMat)
    core.position.y = bodyHeight / 2 - 1.35
    core.castShadow = true
    core.receiveShadow = true
    pGroup.add(core)

    // Vertical rib fluting (8 thin shafts around column)
    const ribGeo = new THREE.CylinderGeometry(0.02, 0.02, bodyHeight, 8)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const rib = new THREE.Mesh(ribGeo, columnMat)
      rib.position.set(Math.cos(angle) * 0.24, bodyHeight / 2 - 1.35, Math.sin(angle) * 0.24)
      rib.castShadow = true
      pGroup.add(rib)
    }

    // Heavy Plinth Base (layered boxes)
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.2, 0.65), stoneMat)
    base1.position.y = -1.4
    base1.castShadow = true
    pGroup.add(base1)

    const base2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.55), stoneMat)
    base2.position.y = -1.15
    base2.castShadow = true
    pGroup.add(base2)

    // Corinthian Capital Top (layered collars + gold ring)
    const cap1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.2, 0.55), stoneMat)
    cap1.position.y = bodyHeight - 1.35
    cap1.castShadow = true
    pGroup.add(cap1)

    const cap2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.15, 0.65), stoneMat)
    cap2.position.y = bodyHeight - 1.175
    cap2.castShadow = true
    pGroup.add(cap2)

    // Gold sphere ornament on top
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), goldMat)
    orb.position.y = bodyHeight - 0.95
    orb.castShadow = true
    pGroup.add(orb)

    pGroup.position.x = xPos
    archGroup.add(pGroup)
  }

  const pillarX = 2.1
  buildFlutedPillar(-pillarX)
  buildFlutedPillar(pillarX)

  // Overhead Stone Arch
  const archRadius = 2.1
  const archRingGeo = new THREE.TorusGeometry(archRadius, 0.15, 8, 36, Math.PI)
  const stoneArch = new THREE.Mesh(archRingGeo, stoneMat)
  stoneArch.position.set(0, 2.85, 0)
  stoneArch.castShadow = true
  archGroup.add(stoneArch)

  // Arched Golden Sun Crest (Example 4)
  const sunGroup = new THREE.Group()
  sunGroup.position.set(0, 2.85, 0.05)
  
  const sunCenter = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), goldMat)
  sunGroup.add(sunCenter)

  // Glowing sun rays radiating
  const rayGeo = new THREE.ConeGeometry(0.015, 0.35, 4)
  rayGeo.scale(1, 1, 0.2) // Flatten rays slightly
  for (let i = 0; i <= 12; i++) {
    const angle = (i / 12) * Math.PI
    const ray = new THREE.Mesh(rayGeo, goldMat)
    ray.position.set(Math.cos(angle) * 0.32, Math.sin(angle) * 0.32, 0)
    ray.rotation.z = angle - Math.PI / 2
    sunGroup.add(ray)
  }
  archGroup.add(sunGroup)

  // Inner gold filigree arch scrollwork
  const filigreeArch = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.03, 6, 24, Math.PI), goldMat)
  filigreeArch.position.set(0, 2.85, 0)
  archGroup.add(filigreeArch)

  // --- Helper to build hollow gates with scroll filigree ---
  const buildGateDoor = (isLeft: boolean) => {
    const gateGroup = new THREE.Group()
    const pivotX = isLeft ? -2.0 : 2.0
    gateGroup.position.set(pivotX, 0.5, 0)

    const doorOffset = isLeft ? 0.95 : -0.95
    const door = new THREE.Group()
    door.position.x = doorOffset

    const gateW = 1.9
    const gateH = 3.3
    const barR = 0.025

    // Hollow Frame (Outer border pipes)
    const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(barR, barR, gateH, 8), goldMat)
    leftPost.position.set(-gateW / 2, 0, 0)
    leftPost.castShadow = true
    door.add(leftPost)

    const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(barR, barR, gateH, 8), goldMat)
    rightPost.position.set(gateW / 2, 0, 0)
    rightPost.castShadow = true
    door.add(rightPost)

    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(barR, barR, gateW, 8), goldMat)
    topBar.rotation.z = Math.PI / 2
    topBar.position.set(0, gateH / 2, 0)
    topBar.castShadow = true
    door.add(topBar)

    const bottomBar = new THREE.Mesh(new THREE.CylinderGeometry(barR, barR, gateW, 8), goldMat)
    bottomBar.rotation.z = Math.PI / 2
    bottomBar.position.set(0, -gateH / 2, 0)
    bottomBar.castShadow = true
    door.add(bottomBar)

    // Vertical design lines (3 inner thinner rods)
    for (let i = 1; i <= 3; i++) {
      const vx = -gateW / 2 + (gateW / 4) * i
      const innerBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, gateH - 0.05, 8), goldMat)
      innerBar.position.set(vx, 0, 0)
      innerBar.castShadow = true
      door.add(innerBar)
    }

    // Wrought Iron Scrollwork detailing (Torus shapes)
    const scrollGeo = new THREE.TorusGeometry(0.2, 0.012, 6, 24)
    for (let y = -1.2; y <= 1.2; y += 0.6) {
      const s1 = new THREE.Mesh(scrollGeo, goldMat)
      s1.position.set(-0.45, y, 0)
      s1.castShadow = true
      
      const s2 = new THREE.Mesh(scrollGeo, goldMat)
      s2.position.set(0.45, y, 0)
      s2.castShadow = true
      door.add(s1, s2)
    }

    // Centered Royal Crest Ring & Leaves on Gate Face
    const centerRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.016, 8, 32), goldMat)
    centerRing.position.set(0, 0, 0.01)
    centerRing.castShadow = true
    door.add(centerRing)

    const leafGeo = new THREE.ConeGeometry(0.03, 0.12, 4)
    leafGeo.scale(1, 1, 0.2) // Flatten leaf
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const leaf = new THREE.Mesh(leafGeo, goldMat)
      leaf.position.set(Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0.015)
      leaf.rotation.z = a - Math.PI / 2
      leaf.castShadow = true
      door.add(leaf)
    }

    gateGroup.add(door)
    mainGroup.add(gateGroup)
    return gateGroup
  }

  mainGroup.leftGate = buildGateDoor(true)
  mainGroup.rightGate = buildGateDoor(false)

  // --- Topiary Garden Trees ---
  const buildTree = (x: number, z: number) => {
    const tGroup = new THREE.Group()
    
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.06, 0.07, 1.3, 8)
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.y = -0.85
    trunk.castShadow = true
    tGroup.add(trunk)

    // Foliage (Champagne flute / conical layered topiary shape)
    const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), leavesMat)
    sphere1.position.y = 0.1
    sphere1.scale.set(1, 1.2, 1)
    sphere1.castShadow = true
    tGroup.add(sphere1)

    const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), leavesMat)
    sphere2.position.y = 0.85
    sphere2.castShadow = true
    tGroup.add(sphere2)

    const sphere3 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), leavesMat)
    sphere3.position.y = 1.35
    sphere3.castShadow = true
    tGroup.add(sphere3)

    tGroup.position.set(x, 0, z)
    mainGroup.add(tGroup)
  }

  // Symmetrical garden layout along stone cobblestone path
  const treeZCoordinates = [-2.5, -7.5, -12.5, -17.5]
  treeZCoordinates.forEach(z => {
    buildTree(-3.8, z)
    buildTree(3.8, z)
  })

  // --- Floating 3D Wedding Invitation Card (Ivory Linen with Gold Filigree Frame) ---
  const cardGroup = new THREE.Group()
  cardGroup.position.set(0, 0.2, -6.0)
  cardGroup.scale.set(0.001, 0.001, 0.001) // Scale up on walkthrough trigger

  const paperTexture = getPaperTexture()
  const cardMaterial = new THREE.MeshStandardMaterial({
    color: 0xfdfbf7, // Linen Cream Ivory
    roughness: 0.5,
    metalness: 0.05,
    bumpMap: paperTexture ?? undefined,
    bumpScale: 0.012,
    side: THREE.DoubleSide,
  })

  const cardBodyGeo = new THREE.BoxGeometry(2.2, 3.2, 0.04)
  const cardBody = new THREE.Mesh(cardBodyGeo, cardMaterial)
  cardBody.castShadow = true
  cardBody.receiveShadow = true
  cardGroup.add(cardBody)

  // Detailed Gold Card Border Frame
  const cardBorderGeo = new THREE.BoxGeometry(2.3, 3.3, 0.02)
  const cardBorder = new THREE.Mesh(cardBorderGeo, goldMat)
  cardBorder.position.z = -0.012
  cardBorder.castShadow = true
  cardGroup.add(cardBorder)

  // Gold foil corner decals
  const decGroup = new THREE.Group()
  const borderThickness = 0.015
  const borderW = 2.0
  const borderH = 3.0
  
  // Outer line piping
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(borderW, borderThickness, 0.004), goldMat)
  topBar.position.set(0, borderH/2, 0.022)
  const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(borderW, borderThickness, 0.004), goldMat)
  bottomBar.position.set(0, -borderH/2, 0.022)
  const leftBar = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, borderH, 0.004), goldMat)
  leftBar.position.set(-borderW/2, 0, 0.022)
  const rightBar = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, borderH, 0.004), goldMat)
  rightBar.position.set(borderW/2, 0, 0.022)
  decGroup.add(topBar, bottomBar, leftBar, rightBar)

  // Ornate central crest ring
  const decRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 24), goldMat)
  decRing.position.set(0, 1.05, 0.022)
  decGroup.add(decRing)

  const decRingBottom = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.01, 6, 16), goldMat)
  decRingBottom.position.set(0, -1.1, 0.022)
  decGroup.add(decRingBottom)

  cardGroup.add(decGroup)
  mainGroup.add(cardGroup)
  mainGroup.invitationCard = cardGroup as any

  return mainGroup
}

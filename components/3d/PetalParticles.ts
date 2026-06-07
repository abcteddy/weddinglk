import * as THREE from 'three'

interface PetalData {
  vx: number
  vy: number
  vz: number
  rx: number
  ry: number
  rz: number
  life: number
  decay: number
}

export class PetalSystem {
  private particles: THREE.Mesh[] = []
  private scene: THREE.Scene
  private hue: number
  private active = false

  constructor(scene: THREE.Scene, petalHue: number) {
    this.scene = scene
    this.hue = petalHue
  }

  burst(count: number = 60) {
    this.active = true
    for (let i = 0; i < count; i++) {
      const w = 0.08 + Math.random() * 0.08
      const h = 0.05 + Math.random() * 0.06

      // Organic petal shape
      const shape = new THREE.Shape()
      shape.moveTo(0, 0)
      shape.quadraticCurveTo(w * 0.5, h * 1.2, w, 0)
      shape.quadraticCurveTo(w * 0.5, -h * 0.4, 0, 0)

      const geo = new THREE.ShapeGeometry(shape)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          this.hue + (Math.random() - 0.5) * 0.06,
          0.55 + Math.random() * 0.25,
          0.5 + Math.random() * 0.25,
        ),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85 + Math.random() * 0.15,
        roughness: 0.9,
      })

      const petal = new THREE.Mesh(geo, mat)
      petal.position.set(
        (Math.random() - 0.5) * 5,
        1.5 + Math.random() * 3,
        (Math.random() - 0.5) * 3,
      )
      petal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      )

      petal.userData = {
        vx: (Math.random() - 0.5) * 0.018,
        vy: -(0.004 + Math.random() * 0.008),
        vz: (Math.random() - 0.5) * 0.012,
        rx: (Math.random() - 0.5) * 0.03,
        ry: (Math.random() - 0.5) * 0.04,
        rz: (Math.random() - 0.5) * 0.02,
        life: 1,
        decay: 1 / (120 + Math.random() * 180),
      } as PetalData

      this.scene.add(petal)
      this.particles.push(petal)
    }
  }

  // Ambient gentle drift (no burst — always-on mode)
  startAmbient(count: number = 20) {
    this.active = true
    for (let i = 0; i < count; i++) {
      const w = 0.06 + Math.random() * 0.07
      const h = 0.04 + Math.random() * 0.05

      const shape = new THREE.Shape()
      shape.moveTo(0, 0)
      shape.quadraticCurveTo(w * 0.5, h * 1.2, w, 0)
      shape.quadraticCurveTo(w * 0.5, -h * 0.4, 0, 0)

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(this.hue + (Math.random() - 0.5) * 0.05, 0.5, 0.55 + Math.random() * 0.2),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5 + Math.random() * 0.4,
        roughness: 0.9,
      })

      const petal = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat)
      // Spread them randomly across the view (initial positions already staggered)
      petal.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 3,
      )
      petal.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)

      petal.userData = {
        vx: (Math.random() - 0.5) * 0.008,
        vy: -(0.002 + Math.random() * 0.005),
        vz: (Math.random() - 0.5) * 0.005,
        rx: (Math.random() - 0.5) * 0.015,
        ry: (Math.random() - 0.5) * 0.02,
        rz: (Math.random() - 0.5) * 0.01,
        life: Math.random(), // start at random life so they don't all reset at same time
        decay: 1 / (200 + Math.random() * 250),
      } as PetalData

      this.scene.add(petal)
      this.particles.push(petal)
    }
  }

  update() {
    if (!this.active) return
    this.particles.forEach(p => {
      const d = p.userData as PetalData
      p.position.x += d.vx
      p.position.y += d.vy
      p.position.z += d.vz
      p.rotation.x += d.rx
      p.rotation.y += d.ry
      p.rotation.z += d.rz

      // Gentle wind sway
      d.vx += (Math.random() - 0.5) * 0.001
      d.vx = Math.max(-0.025, Math.min(0.025, d.vx))

      d.life -= d.decay
      ;(p.material as THREE.MeshStandardMaterial).opacity = Math.max(0, d.life) * 0.85

      // Reset petal when it fades or falls below view
      if (p.position.y < -5 || d.life <= 0) {
        p.position.set((Math.random() - 0.5) * 6, 4 + Math.random() * 2, (Math.random() - 0.5) * 3)
        d.life = 1
      }
    })
  }

  dispose() {
    this.particles.forEach(p => {
      this.scene.remove(p)
      p.geometry.dispose()
      ;(p.material as THREE.Material).dispose()
    })
    this.particles = []
  }
}

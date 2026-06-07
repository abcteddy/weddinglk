'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { TemplateConfig } from '@/types/invitation'
import { buildRoyalGateAndGarden } from './RoyalGateMesh'
import { buildTraditionalDoorAndPoruwa } from './TraditionalDoorMesh'
import { buildEnvelope } from './EnvelopeMesh'
import { PetalSystem } from './PetalParticles'

interface InvitationSceneProps {
  template: TemplateConfig
  /** If true, petals burst immediately. If false, gentle ambient */
  burstMode?: boolean
  /** Called when opening walkthrough or envelope slide finishes */
  onOpen?: () => void
  className?: string
}

interface SceneState {
  dispose: () => void
  openInvite: () => void
}

function initScene(
  canvas: HTMLCanvasElement,
  template: TemplateConfig,
  burstMode: boolean,
  onOpenCallback?: () => void,
): SceneState {
  let onOpen = onOpenCallback

  // Check scene type
  const isWalkthrough = template.id === 'royalGardenGate' || template.id === 'sinhalaTraditional'

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3

  // --- Setup template defaults for safety ---
  const bgColor = template.bgColor ?? 0x0a0005
  const keyLightColor = template.keyLightColor ?? 0xff6090
  const ambientColor = template.ambientColor ?? 0x2a0018
  const petalHue = template.petalHue ?? 0.92

  // --- Scene ---
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(bgColor)
  scene.fog = new THREE.FogExp2(bgColor, isWalkthrough ? 0.04 : 0.035)

  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100)
  camera.position.set(0, 0.5, 7.5)
  camera.lookAt(0, isWalkthrough ? 0.4 : 0, 0)

  // --- Lighting ---
  const ambient = new THREE.AmbientLight(0xffffff, isWalkthrough ? 1.8 : 3.0)
  scene.add(ambient)

  const keyLight = new THREE.DirectionalLight(keyLightColor, isWalkthrough ? 2.2 : 4.0)
  keyLight.position.set(5, 8, 5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.width = 1024
  keyLight.shadow.mapSize.height = 1024
  scene.add(keyLight)

  const softFill = new THREE.PointLight(ambientColor, 1.5, 15)
  softFill.position.set(-4, 3, 2)
  scene.add(softFill)

  // --- Model setup based on template ---
  let gateGroup: any = null
  let envelopeGroup: any = null

  if (template.id === 'royalGardenGate') {
    gateGroup = buildRoyalGateAndGarden(template)
    scene.add(gateGroup)
  } else if (template.id === 'sinhalaTraditional') {
    gateGroup = buildTraditionalDoorAndPoruwa(template)
    scene.add(gateGroup)
  } else {
    envelopeGroup = buildEnvelope(template)
    scene.add(envelopeGroup)
  }

  // --- Particles ---
  const petalSystem = new PetalSystem(scene, petalHue)
  if (burstMode) {
    petalSystem.burst(50)
  } else {
    petalSystem.startAmbient(15)
  }

  // --- Mouse interaction ---
  let mouseX = 0
  let mouseY = 0
  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
  }
  canvas.addEventListener('mousemove', handleMouseMove)

  // --- Click to trigger ---
  let opened = false
  let openTime = 0

  const triggerOpen = () => {
    if (!opened) {
      opened = true
      openTime = performance.now()
      petalSystem.burst(40)
    }
  }

  const handleClick = () => {
    triggerOpen()
  }
  canvas.addEventListener('click', handleClick)

  // --- Resize ---
  const handleResize = () => {
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', handleResize)

  // --- Animation loop ---
  let animId: number
  let t = 0

  const tick = () => {
    animId = requestAnimationFrame(tick)
    const now = performance.now()
    t += 0.005

    // Easing functions
    const easeInOutCubic = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
    const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x)

    if (isWalkthrough && gateGroup) {
      if (opened) {
        const elapsed = now - openTime
        const tWalk = Math.min(elapsed / 2800, 1.0) // 2.8s walkthrough
        const tGate = Math.min(elapsed / 1600, 1.0) // 1.6s doors swing open

        const gateAngle = easeInOutCubic(tGate) * (Math.PI / 1.7)
        if (template.id === 'sinhalaTraditional') {
          // Temple Wooden Doors
          gateGroup.leftDoor.rotation.y = gateAngle
          gateGroup.rightDoor.rotation.y = -gateAngle

          // Animate flickering oil flames (flicker scale)
          if (gateGroup.leftFlame && gateGroup.rightFlame) {
            gateGroup.leftFlame.scale.setScalar(1.0 + Math.sin(t * 30) * 0.15)
            gateGroup.rightFlame.scale.setScalar(1.0 + Math.cos(t * 30) * 0.15)
          }
        } else {
          // Royal Garden Gate
          gateGroup.leftGate.rotation.y = gateAngle
          gateGroup.rightGate.rotation.y = -gateAngle
        }

        // Camera walk forward
        const camFactor = easeInOutCubic(tWalk)
        camera.position.z = THREE.MathUtils.lerp(7.5, -3.2, camFactor)
        
        // Gentle walking bob
        camera.position.y = 0.5 + Math.sin(camFactor * Math.PI * 6) * 0.05
        camera.position.x = mouseX * 0.25 * (1 - camFactor)

        // Float invitation card
        if (camFactor > 0.45) {
          const cardFactor = easeOutQuad((camFactor - 0.45) / 0.55)
          gateGroup.invitationCard.scale.set(cardFactor, cardFactor, cardFactor)
          
          gateGroup.invitationCard.position.y = 0.2 + Math.sin(t * 1.5) * 0.05
          gateGroup.invitationCard.rotation.y = Math.sin(t * 0.5) * 0.04
        }

        if (tWalk >= 1.0) {
          if (onOpen) {
            onOpen()
            onOpen = undefined // single invoke
            petalSystem.burst(60)
          }
        }
      } else {
        // Closed door breathing motion
        const swing = Math.sin(t * 0.7) * 0.015
        if (template.id === 'sinhalaTraditional') {
          gateGroup.leftDoor.rotation.y = swing
          gateGroup.rightDoor.rotation.y = -swing
          if (gateGroup.leftFlame && gateGroup.rightFlame) {
            gateGroup.leftFlame.scale.setScalar(1.0 + Math.sin(t * 20) * 0.1)
            gateGroup.rightFlame.scale.setScalar(1.0 + Math.cos(t * 20) * 0.1)
          }
        } else {
          gateGroup.leftGate.rotation.y = swing
          gateGroup.rightGate.rotation.y = -swing
        }

        camera.position.x = mouseX * 0.35
        camera.position.y = 0.5 + mouseY * -0.15
      }
      camera.lookAt(0, 0.4, -3)

    } else if (envelopeGroup) {
      // Envelope opening
      if (opened) {
        const elapsed = now - openTime
        const tOpen = Math.min(elapsed / 1800, 1.0) // 1.8s open time

        // 1. Seal cracks/scales down first 30% of time
        const sealFactor = Math.max(1.0 - tOpen * 3.3, 0)
        envelopeGroup.seal.scale.setScalar(sealFactor)

        // 2. Flap opens from 25% to 65% of time
        let flapFactor = 0
        if (tOpen > 0.25) {
          flapFactor = Math.min((tOpen - 0.25) / 0.4, 1.0)
        }
        const flapAngle = easeInOutCubic(flapFactor) * -Math.PI
        envelopeGroup.flap.rotation.x = flapAngle

        // 3. Card slides up from 55% to 100% of time
        let cardFactor = 0
        if (tOpen > 0.55) {
          cardFactor = Math.min((tOpen - 0.55) / 0.45, 1.0)
        }
        const slideDistance = easeOutQuad(cardFactor) * 2.3
        envelopeGroup.invitationCard.position.y = slideDistance

        // Card tilt and hover
        if (cardFactor > 0) {
          envelopeGroup.invitationCard.position.z = 0.05 + slideDistance * 0.05
          envelopeGroup.invitationCard.rotation.y = Math.sin(t * 1.5) * 0.05
        }

        if (tOpen >= 1.0) {
          if (onOpen) {
            onOpen()
            onOpen = undefined
            petalSystem.burst(55)
          }
        }
      } else {
        // Floating envelope breath
        envelopeGroup.position.y = Math.sin(t) * 0.08
        envelopeGroup.rotation.y = Math.sin(t * 0.7) * 0.06 + mouseX * 0.12
        envelopeGroup.rotation.x = Math.sin(t * 0.5) * 0.03 - mouseY * 0.06

        // Pulse wax seal glow
        envelopeGroup.seal.scale.setScalar(1.0 + Math.sin(t * 5.0) * 0.02)
      }
      camera.lookAt(0, 0, 0)
    }

    petalSystem.update()
    renderer.render(scene, camera)
  }
  tick()

  return {
    openInvite: () => {
      triggerOpen()
    },
    dispose: () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
      window.removeEventListener('resize', handleResize)
      petalSystem.dispose()
      renderer.dispose()
    },
  }
}

export function InvitationScene({
  template,
  burstMode = false,
  onOpen,
  className,
}: InvitationSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<SceneState | null>(null)

  const openInvite = useCallback(() => {
    stateRef.current?.openInvite()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const state = initScene(canvas, template, burstMode, onOpen)
    stateRef.current = state

    return () => {
      state.dispose()
      stateRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id])

  const clickTitle = isWalkthrough(template.id)
    ? 'Click the Entrance Door to Open'
    : 'Click the Envelope to Open'

  function isWalkthrough(tid: string) {
    return tid === 'royalGardenGate' || tid === 'sinhalaTraditional'
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'block' }}
      title={clickTitle}
    />
  )
}

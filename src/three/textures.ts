// Every image in the store is drawn on a <canvas> at runtime, so the demo
// ships no image assets. The same canvases feed the 3D planes (as textures)
// and the DOM panels (as data URLs), keeping 3D and UI in sync.
import * as THREE from 'three'
import type { ProductColor, ProductKind } from '../data/products'

const SIZE = 512
type Ctx = CanvasRenderingContext2D

const canvasCache = new Map<string, HTMLCanvasElement>()
const textureCache = new Map<string, THREE.CanvasTexture>()
const urlCache = new Map<string, string>()

function makeCanvas(w = SIZE, h = SIZE) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function toTexture(key: string, canvas: HTMLCanvasElement) {
  let tex = textureCache.get(key)
  if (!tex) {
    tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    textureCache.set(key, tex)
  }
  return tex
}

// ── colour helpers ───────────────────────────────────────────
function shade(hex: string, amt: number) {
  const c = new THREE.Color(hex)
  if (amt >= 0) c.lerp(new THREE.Color('#ffffff'), amt)
  else c.lerp(new THREE.Color('#000000'), -amt)
  return `#${c.getHexString()}`
}
const isLight = (hex: string) => {
  const c = new THREE.Color(hex)
  return c.r * 0.3 + c.g * 0.59 + c.b * 0.11 > 0.62
}

/** Paints a soft volume gradient over whatever was drawn last (clipped to it). */
function volume(ctx: Ctx, x0 = 60, x1 = 452, strength = 1) {
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  const g = ctx.createLinearGradient(x0, 0, x1, 0)
  g.addColorStop(0, `rgba(255,255,255,${0.16 * strength})`)
  g.addColorStop(0.45, 'rgba(255,255,255,0)')
  g.addColorStop(1, `rgba(0,0,0,${0.22 * strength})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, SIZE, SIZE)
  const v = ctx.createLinearGradient(0, 0, 0, SIZE)
  v.addColorStop(0, 'rgba(255,255,255,0.06)')
  v.addColorStop(1, `rgba(0,0,0,${0.14 * strength})`)
  ctx.fillStyle = v
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.restore()
}

function seam(ctx: Ctx, color: string, width = 3, dash: number[] = []) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

function logoDot(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.save()
  ctx.fillStyle = color
  ctx.font = `800 ${r * 1.15}px Inter, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('CZ', x, y + r * 0.05)
  ctx.restore()
}

function hanger(ctx: Ctx, topY = 70, half = 120) {
  ctx.save()
  seam(ctx, '#6b6b6b', 6)
  ctx.beginPath()
  ctx.arc(256, 36, 16, Math.PI * 1.05, Math.PI * 0.45, false)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(256, 52)
  ctx.lineTo(256, topY - 8)
  ctx.moveTo(256, topY - 8)
  ctx.lineTo(256 - half, topY + 34)
  ctx.moveTo(256, topY - 8)
  ctx.lineTo(256 + half, topY + 34)
  ctx.stroke()
  ctx.restore()
}

// ── garments ─────────────────────────────────────────────────
function torso(ctx: Ctx, long: boolean) {
  ctx.beginPath()
  ctx.moveTo(206, 92)
  ctx.quadraticCurveTo(256, 132, 306, 92)
  ctx.lineTo(372, 110)
  if (long) {
    ctx.quadraticCurveTo(410, 130, 424, 220)
    ctx.lineTo(452, 410)
    ctx.lineTo(408, 418)
    ctx.lineTo(372, 236)
  } else {
    ctx.lineTo(452, 192)
    ctx.lineTo(404, 232)
    ctx.lineTo(372, 204)
  }
  ctx.lineTo(376, 446)
  ctx.quadraticCurveTo(256, 456, 136, 446)
  if (long) {
    ctx.lineTo(140, 236)
    ctx.lineTo(104, 418)
    ctx.lineTo(60, 410)
    ctx.lineTo(88, 220)
    ctx.quadraticCurveTo(102, 130, 140, 110)
  } else {
    ctx.lineTo(140, 204)
    ctx.lineTo(108, 232)
    ctx.lineTo(60, 192)
    ctx.lineTo(140, 110)
  }
  ctx.closePath()
}

function drawTop(ctx: Ctx, kind: ProductKind, c: ProductColor) {
  const base = c.hex
  const acc = c.accent ?? (isLight(base) ? '#1d1f22' : '#f4f4f2')
  const line = isLight(base) ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.18)'
  const long = kind !== 'tshirt' && kind !== 'polo'
  hanger(ctx)

  if (kind === 'hoodie') {
    // hood behind the neckline
    ctx.fillStyle = shade(base, -0.18)
    ctx.beginPath()
    ctx.ellipse(256, 100, 78, 56, 0, Math.PI, 0)
    ctx.lineTo(320, 120)
    ctx.quadraticCurveTo(256, 150, 192, 120)
    ctx.closePath()
    ctx.fill()
  }

  ctx.fillStyle = base
  torso(ctx, long)
  ctx.fill()
  volume(ctx)

  // neckline / collar
  if (kind === 'polo') {
    ctx.fillStyle = shade(base, -0.06)
    ctx.beginPath()
    ctx.moveTo(206, 92); ctx.lineTo(250, 134); ctx.lineTo(224, 150); ctx.lineTo(196, 104); ctx.closePath()
    ctx.moveTo(306, 92); ctx.lineTo(262, 134); ctx.lineTo(288, 150); ctx.lineTo(316, 104); ctx.closePath()
    ctx.fill()
    seam(ctx, acc, 4)
    ctx.beginPath(); ctx.moveTo(224, 150); ctx.lineTo(196, 104); ctx.moveTo(288, 150); ctx.lineTo(316, 104); ctx.stroke()
    seam(ctx, line, 3)
    ctx.beginPath(); ctx.moveTo(256, 134); ctx.lineTo(256, 196); ctx.stroke()
    ctx.fillStyle = acc
    for (const y of [158, 182]) { ctx.beginPath(); ctx.arc(256, y, 5, 0, Math.PI * 2); ctx.fill() }
  } else if (kind === 'jacket') {
    ctx.fillStyle = shade(base, -0.1)
    ctx.beginPath()
    ctx.moveTo(200, 86); ctx.lineTo(312, 86); ctx.lineTo(306, 122); ctx.quadraticCurveTo(256, 140, 206, 122); ctx.closePath()
    ctx.fill()
    // shoulder yoke in accent colour
    ctx.save()
    torso(ctx, true)
    ctx.clip()
    ctx.fillStyle = acc
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.moveTo(40, 150); ctx.lineTo(220, 176); ctx.lineTo(256, 168); ctx.lineTo(292, 176); ctx.lineTo(472, 150); ctx.lineTo(472, 128); ctx.lineTo(40, 128)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    seam(ctx, shade(base, -0.35), 5)
    ctx.beginPath(); ctx.moveTo(256, 124); ctx.lineTo(256, 448); ctx.stroke()
    seam(ctx, line, 3)
    ctx.beginPath(); ctx.moveTo(180, 330); ctx.lineTo(214, 300); ctx.moveTo(332, 330); ctx.lineTo(298, 300); ctx.stroke()
  } else {
    seam(ctx, shade(base, -0.25), 7)
    ctx.beginPath(); ctx.moveTo(208, 96); ctx.quadraticCurveTo(256, 136, 304, 96); ctx.stroke()
  }

  if (kind === 'hoodie') {
    // kangaroo pocket + drawcords
    seam(ctx, line, 3)
    ctx.beginPath()
    ctx.moveTo(180, 400); ctx.lineTo(196, 316); ctx.lineTo(316, 316); ctx.lineTo(332, 400)
    ctx.stroke()
    seam(ctx, acc, 5)
    ctx.beginPath(); ctx.moveTo(240, 120); ctx.lineTo(236, 210); ctx.moveTo(272, 120); ctx.lineTo(276, 210); ctx.stroke()
  }

  // hem + cuff seams
  seam(ctx, line, 3, [8, 7])
  ctx.beginPath(); ctx.moveTo(140, 430); ctx.quadraticCurveTo(256, 440, 372, 430); ctx.stroke()
  if (long) {
    ctx.beginPath(); ctx.moveTo(64, 392); ctx.lineTo(106, 399); ctx.moveTo(448, 392); ctx.lineTo(406, 399); ctx.stroke()
  }
  ctx.setLineDash([])

  if (kind === 'longsleeve') {
    // sleeve stripes
    seam(ctx, acc, 6)
    ctx.beginPath(); ctx.moveTo(78, 300); ctx.lineTo(118, 306); ctx.moveTo(434, 300); ctx.lineTo(394, 306); ctx.stroke()
  }
  if (kind !== 'jacket') logoDot(ctx, kind === 'polo' ? 318 : 256, kind === 'polo' ? 176 : 214, 22, acc)
  else logoDot(ctx, 316, 214, 16, acc)
}

function drawPants(ctx: Ctx, c: ProductColor) {
  const base = c.hex
  const acc = c.accent ?? '#f2f2f2'
  hanger(ctx, 62, 96)
  ctx.fillStyle = base
  ctx.beginPath()
  ctx.moveTo(168, 96); ctx.lineTo(344, 96)
  ctx.lineTo(362, 300); ctx.lineTo(340, 472); ctx.lineTo(272, 472)
  ctx.lineTo(258, 204); ctx.lineTo(254, 204)
  ctx.lineTo(240, 472); ctx.lineTo(172, 472); ctx.lineTo(150, 300)
  ctx.closePath()
  ctx.fill()
  volume(ctx, 150, 362)
  ctx.fillStyle = shade(base, -0.15)
  ctx.fillRect(168, 84, 176, 26)
  seam(ctx, acc, 5)
  ctx.beginPath(); ctx.moveTo(158, 120); ctx.lineTo(176, 468); ctx.moveTo(354, 120); ctx.lineTo(336, 468); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(244, 110); ctx.lineTo(240, 150); ctx.moveTo(268, 110); ctx.lineTo(272, 150); ctx.stroke()
  // hanger clips
  ctx.fillStyle = '#6b6b6b'
  ctx.fillRect(172, 76, 22, 22); ctx.fillRect(318, 76, 22, 22)
  logoDot(ctx, 314, 150, 14, acc)
}

// ── shoes ────────────────────────────────────────────────────
function drawShoe(ctx: Ctx, kind: ProductKind, c: ProductColor) {
  const base = c.hex
  const acc = c.accent ?? '#ffffff'
  const line = isLight(base) ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.22)'
  ctx.save()
  ctx.translate(0, 40)

  // ground shadow
  const sh = ctx.createRadialGradient(260, 378, 10, 260, 378, 220)
  sh.addColorStop(0, 'rgba(0,0,0,0.28)')
  sh.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = sh
  ctx.fillRect(30, 350, 460, 60)

  if (kind === 'slide') {
    ctx.fillStyle = shade(acc, -0.05)
    roundRect(ctx, 50, 318, 420, 46, 24); ctx.fill()
    ctx.fillStyle = base
    roundRect(ctx, 56, 300, 408, 30, 16); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(200, 304); ctx.quadraticCurveTo(250, 170, 380, 200); ctx.quadraticCurveTo(420, 240, 410, 304); ctx.closePath()
    ctx.fill()
    volume(ctx, 200, 420)
    logoDot(ctx, 316, 250, 26, acc)
    ctx.restore()
    return
  }

  const high = kind === 'hightop'
  const sole = kind === 'runner' ? 52 : 34
  // upper
  ctx.fillStyle = base
  ctx.beginPath()
  ctx.moveTo(66, 340)
  ctx.lineTo(70, high ? 140 : 236)
  ctx.quadraticCurveTo(80, high ? 112 : 196, 124, high ? 108 : 190)
  ctx.quadraticCurveTo(170, high ? 120 : 208, 214, high ? 120 : 212)
  ctx.lineTo(236, high ? 104 : 168)
  ctx.lineTo(272, high ? 112 : 176)
  ctx.quadraticCurveTo(320, 230, 400, 262)
  ctx.quadraticCurveTo(458, 284, 462, 330)
  ctx.lineTo(462, 340)
  ctx.closePath()
  ctx.fill()
  volume(ctx, 60, 470)

  // heel counter + toe cap
  ctx.fillStyle = shade(base, isLight(base) ? -0.08 : 0.12)
  ctx.beginPath()
  ctx.moveTo(66, 340); ctx.lineTo(70, 250); ctx.quadraticCurveTo(140, 270, 150, 340); ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(380, 340); ctx.quadraticCurveTo(384, 270, 420, 270); ctx.quadraticCurveTo(460, 290, 462, 340); ctx.closePath()
  ctx.fill()

  // accent side panel (generic wave, not a real brand mark)
  ctx.fillStyle = acc
  ctx.globalAlpha = 0.95
  ctx.beginPath()
  ctx.moveTo(150, 318)
  ctx.bezierCurveTo(210, 250, 290, 300, 360, 238)
  ctx.lineTo(372, 252)
  ctx.bezierCurveTo(300, 322, 220, 284, 166, 330)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // laces
  seam(ctx, line, 5)
  for (let i = 0; i < (high ? 6 : 4); i++) {
    const t = i / (high ? 5 : 3)
    const x = 236 + t * 90
    const y = (high ? 128 : 186) + t * (high ? 120 : 64)
    ctx.beginPath(); ctx.moveTo(x - 16, y + 6); ctx.lineTo(x + 18, y - 6); ctx.stroke()
  }
  // collar padding
  seam(ctx, shade(base, -0.3), 6)
  ctx.beginPath()
  ctx.moveTo(74, high ? 142 : 232); ctx.quadraticCurveTo(84, high ? 116 : 200, 124, high ? 112 : 194); ctx.quadraticCurveTo(170, high ? 124 : 212, 212, high ? 124 : 214)
  ctx.stroke()

  // sole
  ctx.fillStyle = kind === 'runner' ? acc : '#f4f2ec'
  roundRect(ctx, 52, 334, 420, sole, 20)
  ctx.fill()
  if (kind === 'runner') {
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    roundRect(ctx, 52, 334 + sole - 14, 420, 14, 7); ctx.fill()
  } else {
    seam(ctx, 'rgba(0,0,0,0.18)', 3)
    ctx.beginPath(); ctx.moveTo(60, 352); ctx.lineTo(464, 352); ctx.stroke()
  }
  if (high) {
    ctx.fillStyle = '#f4f2ec'
    ctx.beginPath(); ctx.arc(104, 200, 22, 0, Math.PI * 2); ctx.fill()
    logoDot(ctx, 104, 200, 15, base)
  } else {
    logoDot(ctx, 104, 300, 15, acc)
  }
  ctx.restore()
}

// ── headwear ─────────────────────────────────────────────────
function drawCap(ctx: Ctx, kind: ProductKind, c: ProductColor) {
  const base = c.hex
  const acc = c.accent ?? '#ffffff'
  const line = isLight(base) ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.2)'
  // peg + shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath(); ctx.ellipse(256, 420, 170, 26, 0, 0, Math.PI * 2); ctx.fill()

  if (kind === 'beanie') {
    ctx.fillStyle = base
    ctx.beginPath()
    ctx.moveTo(130, 330)
    ctx.bezierCurveTo(120, 160, 190, 110, 256, 110)
    ctx.bezierCurveTo(322, 110, 392, 160, 382, 330)
    ctx.closePath()
    ctx.fill()
    volume(ctx, 120, 392)
    seam(ctx, line, 3)
    for (let x = 150; x <= 362; x += 18) {
      ctx.beginPath(); ctx.moveTo(x, 330); ctx.quadraticCurveTo(256 + (x - 256) * 0.55, 180, 256 + (x - 256) * 0.2, 118); ctx.stroke()
    }
    ctx.fillStyle = shade(base, -0.12)
    roundRect(ctx, 118, 300, 276, 96, 22); ctx.fill()
    seam(ctx, 'rgba(0,0,0,0.18)', 4)
    for (let x = 134; x < 392; x += 14) { ctx.beginPath(); ctx.moveTo(x, 308); ctx.lineTo(x, 388); ctx.stroke() }
    ctx.fillStyle = acc
    ctx.beginPath(); ctx.arc(256, 92, 44, 0, Math.PI * 2); ctx.fill()
    volume(ctx, 210, 300, 0.6)
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, 220, 330, 72, 34, 6); ctx.fill()
    logoDot(ctx, 256, 347, 15, '#1d1f22')
    return
  }

  if (kind === 'bucket') {
    ctx.fillStyle = shade(base, -0.12)
    ctx.beginPath()
    ctx.moveTo(146, 290); ctx.lineTo(366, 290); ctx.lineTo(452, 380); ctx.quadraticCurveTo(256, 420, 60, 380)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = base
    ctx.beginPath()
    ctx.moveTo(140, 320); ctx.lineTo(166, 150); ctx.quadraticCurveTo(256, 128, 346, 150); ctx.lineTo(372, 320)
    ctx.quadraticCurveTo(256, 334, 140, 320)
    ctx.closePath()
    ctx.fill()
    volume(ctx, 60, 452)
    seam(ctx, line, 3, [7, 6])
    for (let i = 0; i < 4; i++) {
      const y = 340 + i * 12
      ctx.beginPath(); ctx.moveTo(110 - i * 10, y); ctx.quadraticCurveTo(256, y + 26, 402 + i * 10, y); ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.fillStyle = acc
    ctx.fillRect(140, 286, 232, 14)
    logoDot(ctx, 256, 226, 26, acc)
    return
  }

  // baseball cap, 3/4 front view
  ctx.fillStyle = shade(base, -0.2)
  ctx.beginPath()
  ctx.moveTo(110, 318)
  ctx.quadraticCurveTo(256, 290, 402, 318)
  ctx.quadraticCurveTo(470, 360, 420, 396)
  ctx.quadraticCurveTo(256, 430, 92, 396)
  ctx.quadraticCurveTo(44, 360, 110, 318)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = shade(base, -0.32)
  ctx.beginPath(); ctx.ellipse(256, 334, 150, 18, 0, 0, Math.PI); ctx.fill()

  ctx.fillStyle = base
  ctx.beginPath()
  ctx.moveTo(102, 330)
  ctx.bezierCurveTo(96, 170, 180, 118, 256, 118)
  ctx.bezierCurveTo(332, 118, 416, 170, 410, 330)
  ctx.quadraticCurveTo(256, 300, 102, 330)
  ctx.closePath()
  ctx.fill()
  volume(ctx, 100, 412)
  seam(ctx, line, 3)
  ctx.beginPath()
  ctx.moveTo(256, 122); ctx.quadraticCurveTo(250, 220, 256, 312)
  ctx.moveTo(256, 122); ctx.quadraticCurveTo(168, 170, 150, 318)
  ctx.moveTo(256, 122); ctx.quadraticCurveTo(344, 170, 362, 318)
  ctx.stroke()
  ctx.fillStyle = shade(base, -0.15)
  ctx.beginPath(); ctx.arc(256, 120, 11, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = acc
  roundRect(ctx, 210, 206, 92, 58, 10); ctx.fill()
  logoDot(ctx, 256, 235, 26, base)
  // stitched brim lines
  seam(ctx, line, 3, [6, 6])
  ctx.beginPath(); ctx.moveTo(120, 370); ctx.quadraticCurveTo(256, 400, 392, 370); ctx.stroke()
  ctx.setLineDash([])
}

// ── bags ─────────────────────────────────────────────────────
function drawBag(ctx: Ctx, kind: ProductKind, c: ProductColor) {
  const base = c.hex
  const acc = c.accent ?? '#ffffff'
  const line = isLight(base) ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.2)'
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath(); ctx.ellipse(256, 470, 190, 22, 0, 0, Math.PI * 2); ctx.fill()

  if (kind === 'backpack') {
    seam(ctx, shade(base, -0.3), 16)
    ctx.beginPath(); ctx.moveTo(214, 100); ctx.quadraticCurveTo(256, 50, 298, 100); ctx.stroke()
    ctx.fillStyle = shade(base, -0.25)
    roundRect(ctx, 124, 160, 40, 220, 18); ctx.fill()
    roundRect(ctx, 348, 160, 40, 220, 18); ctx.fill()
    ctx.fillStyle = base
    roundRect(ctx, 148, 90, 216, 376, 70); ctx.fill()
    volume(ctx, 148, 364)
    ctx.fillStyle = shade(base, isLight(base) ? -0.08 : 0.08)
    roundRect(ctx, 176, 270, 160, 156, 34); ctx.fill()
    seam(ctx, line, 3, [6, 6])
    roundRect(ctx, 186, 280, 140, 136, 28); ctx.stroke()
    ctx.setLineDash([])
    seam(ctx, acc, 6)
    ctx.beginPath(); ctx.moveTo(180, 214); ctx.quadraticCurveTo(256, 196, 332, 214); ctx.stroke()
    ctx.fillStyle = acc
    roundRect(ctx, 322, 206, 12, 34, 5); ctx.fill()
    logoDot(ctx, 256, 344, 26, acc)
    return
  }

  if (kind === 'tote') {
    seam(ctx, shade(base, -0.25), 14)
    ctx.beginPath(); ctx.moveTo(180, 190); ctx.quadraticCurveTo(200, 40, 256, 44); ctx.quadraticCurveTo(312, 40, 332, 190); ctx.stroke()
    ctx.fillStyle = base
    ctx.beginPath()
    ctx.moveTo(130, 170); ctx.lineTo(382, 170); ctx.lineTo(404, 462); ctx.lineTo(108, 462)
    ctx.closePath()
    ctx.fill()
    volume(ctx, 108, 404)
    ctx.fillStyle = acc
    ctx.font = '800 44px Inter, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('CZ', 256, 310)
    ctx.font = '600 22px Inter, Arial, sans-serif'
    ctx.fillText('STUDIO · KHULNA', 256, 348)
    seam(ctx, line, 3, [7, 6])
    ctx.beginPath(); ctx.moveTo(134, 190); ctx.lineTo(378, 190); ctx.stroke()
    ctx.setLineDash([])
    return
  }

  if (kind === 'duffel') {
    seam(ctx, shade(base, -0.3), 14)
    ctx.beginPath(); ctx.moveTo(176, 200); ctx.quadraticCurveTo(256, 100, 336, 200); ctx.stroke()
    ctx.fillStyle = base
    roundRect(ctx, 56, 196, 400, 236, 100); ctx.fill()
    volume(ctx, 56, 456)
    ctx.fillStyle = shade(base, -0.15)
    ctx.beginPath(); ctx.ellipse(86, 314, 30, 110, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(426, 314, 30, 110, 0, 0, Math.PI * 2); ctx.fill()
    seam(ctx, acc, 5)
    ctx.beginPath(); ctx.moveTo(120, 214); ctx.quadraticCurveTo(256, 196, 392, 214); ctx.stroke()
    ctx.fillStyle = acc
    roundRect(ctx, 150, 330, 212, 18, 9); ctx.fill()
    logoDot(ctx, 256, 290, 26, acc)
    return
  }

  // sling
  seam(ctx, shade(base, -0.35), 16)
  ctx.beginPath(); ctx.moveTo(110, 300); ctx.quadraticCurveTo(160, 40, 420, 120); ctx.stroke()
  ctx.fillStyle = base
  ctx.beginPath()
  ctx.moveTo(90, 300)
  ctx.quadraticCurveTo(100, 220, 256, 214)
  ctx.quadraticCurveTo(420, 214, 430, 300)
  ctx.quadraticCurveTo(440, 420, 256, 430)
  ctx.quadraticCurveTo(80, 420, 90, 300)
  ctx.closePath()
  ctx.fill()
  volume(ctx, 90, 430)
  seam(ctx, acc, 5)
  ctx.beginPath(); ctx.moveTo(120, 274); ctx.quadraticCurveTo(256, 250, 400, 274); ctx.stroke()
  ctx.fillStyle = acc
  roundRect(ctx, 384, 266, 12, 30, 5); ctx.fill()
  logoDot(ctx, 256, 348, 28, acc)
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function drawProduct(kind: ProductKind, color: ProductColor) {
  const c = makeCanvas()
  const ctx = c.getContext('2d')!
  switch (kind) {
    case 'tshirt': case 'longsleeve': case 'hoodie': case 'jacket': case 'polo':
      drawTop(ctx, kind, color); break
    case 'pants': drawPants(ctx, color); break
    case 'runner': case 'court': case 'hightop': case 'slide':
      drawShoe(ctx, kind, color); break
    case 'cap': case 'bucket': case 'beanie':
      drawCap(ctx, kind, color); break
    default: drawBag(ctx, kind, color)
  }
  return c
}

const productKey = (kind: ProductKind, color: ProductColor) => `${kind}|${color.hex}|${color.accent ?? ''}`

function productCanvas(kind: ProductKind, color: ProductColor) {
  const key = productKey(kind, color)
  let c = canvasCache.get(key)
  if (!c) {
    c = drawProduct(kind, color)
    canvasCache.set(key, c)
  }
  return c
}

export function getProductTexture(kind: ProductKind, color: ProductColor) {
  return toTexture(productKey(kind, color), productCanvas(kind, color))
}

export function getProductImage(kind: ProductKind, color: ProductColor) {
  const key = productKey(kind, color)
  let url = urlCache.get(key)
  if (!url) {
    url = productCanvas(kind, color).toDataURL('image/png')
    urlCache.set(key, url)
  }
  return url
}

// ── room textures ────────────────────────────────────────────
function cached(key: string, w: number, h: number, draw: (ctx: Ctx, w: number, h: number) => void) {
  const hit = textureCache.get(key)
  if (hit) return hit
  const c = makeCanvas(w, h)
  draw(c.getContext('2d')!, w, h)
  return toTexture(key, c)
}

export function getFloorTexture() {
  const tex = cached('floor', 512, 512, (ctx, w, h) => {
    const plankH = h / 8
    for (let i = 0; i < 8; i++) {
      const tone = 0.9 + ((i * 37) % 10) / 100
      const col = new THREE.Color('#b98e62').multiplyScalar(tone)
      ctx.fillStyle = `#${col.getHexString()}`
      ctx.fillRect(0, i * plankH, w, plankH)
      // grain
      ctx.strokeStyle = 'rgba(80,50,25,0.12)'
      ctx.lineWidth = 1.5
      for (let g = 0; g < 6; g++) {
        const y = i * plankH + 6 + g * (plankH / 6)
        ctx.beginPath()
        ctx.moveTo(0, y)
        for (let x = 0; x <= w; x += 32) ctx.lineTo(x, y + Math.sin((x + i * 50 + g * 13) / 40) * 2)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(60,35,15,0.35)'
      ctx.fillRect(0, i * plankH, w, 2)
      const joint = ((i * 173) % 400) + 50
      ctx.fillRect(joint, i * plankH, 2, plankH)
    }
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(5, 4)
  return tex
}

export function getWoodTexture() {
  return cached('wood', 256, 64, (ctx, w, h) => {
    ctx.fillStyle = '#c49a6c'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(90,55,25,0.18)'
    for (let g = 0; g < 8; g++) {
      ctx.beginPath()
      const y = 4 + g * 8
      ctx.moveTo(0, y)
      for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + Math.sin((x + g * 30) / 25) * 1.5)
      ctx.stroke()
    }
  })
}

export function getPegboardTexture() {
  const tex = cached('peg', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#d8b88f'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(70,45,20,0.45)'
    for (let y = 16; y < h; y += 32) for (let x = 16; x < w; x += 32) {
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill()
    }
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 2)
  return tex
}

export function getSignTexture(text: string) {
  return cached(`sign|${text}`, 512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#151515'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ffffff'
    ctx.font = '800 64px Inter, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '6px'
    ctx.fillText(text.toUpperCase(), w / 2, h / 2 + 3)
  })
}

export function getLogoTexture() {
  return cached('logo', 1024, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#151515'
    ctx.beginPath(); ctx.arc(250, h / 2, 150, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#f4f3ef'
    ctx.lineWidth = 26
    ctx.beginPath(); ctx.arc(250, h / 2, 92, Math.PI * 0.25, Math.PI * 1.75); ctx.stroke()
    ctx.fillStyle = '#e85d2a'
    ctx.beginPath(); ctx.arc(318, h / 2, 26, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#151515'
    ctx.font = '800 150px Inter, Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText('CZ', 450, h / 2 - 50)
    ctx.font = '600 76px Inter, Arial, sans-serif'
    ctx.letterSpacing = '18px'
    ctx.fillText('STUDIO', 456, h / 2 + 80)
  })
}

const POSTERS = [
  { bg: '#e85d2a', fg: '#fff4ea', title: 'MOVE', sub: 'NEW SEASON 2026', shape: 'circle' },
  { bg: '#1f2a44', fg: '#c9e43c', title: 'RUN\nFREE', sub: 'AERO RUNNER 2', shape: 'stripes' },
  { bg: '#2f5d4a', fg: '#f4efe4', title: 'MADE\nTO MOVE', sub: 'CZ STUDIO · KHULNA', shape: 'arc' },
  { bg: '#ecebe6', fg: '#151515', title: 'STAY\nDRY', sub: 'MONSOON EDIT', shape: 'drops' },
] as const

export function getPosterTexture(i: number) {
  const p = POSTERS[i % POSTERS.length]
  return cached(`poster|${i}`, 384, 512, (ctx, w, h) => {
    ctx.fillStyle = p.bg
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = p.fg
    ctx.strokeStyle = p.fg
    ctx.globalAlpha = 0.22
    if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(w * 0.7, h * 0.32, 130, 0, Math.PI * 2); ctx.fill() }
    if (p.shape === 'stripes') { ctx.lineWidth = 22; for (let x = -200; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + 260, 0); ctx.stroke() } }
    if (p.shape === 'arc') { ctx.lineWidth = 36; ctx.beginPath(); ctx.arc(w / 2, h * 0.95, 220, Math.PI, 0); ctx.stroke() }
    if (p.shape === 'drops') { for (let k = 0; k < 18; k++) { ctx.beginPath(); ctx.ellipse((k * 97) % w, (k * 151) % (h * 0.6) + 30, 8, 18, 0, 0, Math.PI * 2); ctx.fill() } }
    ctx.globalAlpha = 1
    ctx.font = '800 92px Inter, Arial, sans-serif'
    ctx.textBaseline = 'alphabetic'
    p.title.split('\n').forEach((t, k, arr) => ctx.fillText(t, 28, h - 92 - (arr.length - 1 - k) * 88))
    ctx.font = '600 22px Inter, Arial, sans-serif'
    ctx.letterSpacing = '3px'
    ctx.fillText(p.sub, 30, h - 40)
  })
}

export function getShadowTexture() {
  return cached('blob', 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(0,0,0,0.5)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

/** Draws every texture the room needs, yielding between items so the loader can show progress. */
export async function prepareTextures(
  items: { kind: ProductKind; colors: ProductColor[] }[],
  onProgress: (p: number) => void,
) {
  if ('fonts' in document) {
    try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]) } catch { /* ignore */ }
  }
  const jobs: (() => unknown)[] = [
    getFloorTexture, getWoodTexture, getPegboardTexture, getLogoTexture, getShadowTexture,
    ...POSTERS.map((_, i) => () => getPosterTexture(i)),
    ...['Clothing', 'Shoes', 'Caps', 'Bags'].map((t) => () => getSignTexture(t)),
    ...items.flatMap((it) => it.colors.map((c) => () => getProductTexture(it.kind, c))),
  ]
  for (let i = 0; i < jobs.length; i++) {
    jobs[i]()
    if (i % 3 === 2) {
      onProgress((i + 1) / jobs.length)
      await new Promise((r) => setTimeout(r, 0))
    }
  }
  onProgress(1)
}

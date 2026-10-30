import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {EASE_IN_OUT, mix, ramp} from '../anim';
import {Arrow, Formula, Frac, Glow, Label, Motes, Note, Part, Ripple, Spark, Stage, Stream, Sub, Sup, Tint, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Jembatan ke kuantum (AUDIT, kualitatif): elektron dalam kotak → gelombang berdiri ψₙ = sin(nπx/L), ujung terikat.
// λₙ = 2L/n → pₙ = h/λₙ = nh/2L → Eₙ = pₙ²/2m = n²h²/8mL²: tingkat makin renggang ∝ n² (BUKAN sama rata seperti osilator).
// Getaran waktu ψₙ·cos(ωₙt) dengan ωₙ ∝ Eₙ ∝ n² (jujur: mode tinggi berosilasi lebih cepat).
// Membran lingkaran: mode (0,1) J₀(2,405ρ) ↔ orbital 1s, mode (1,1) J₁(3,832ρ)cos φ ↔ orbital 2p (satu bidang simpul).

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const TAU = Math.PI * 2;
/** Opasitas loop: pudar masuk/keluar singkat di ujung siklus (tanpa pop). */
const fz = (ph: number) => Math.max(0, Math.min(1, ph * 7, (1 - ph) * 7));
const PHOTON = '#7dffb4';

/** Fungsi Bessel J₀, J₁ (deret; cukup akurat untuk x ≤ 4). */
const J = (m: number, x: number) => {
  let s = 0;
  let term = (x / 2) ** m / (m === 0 ? 1 : 1);
  for (let k = 0; k < 14; k++) {
    if (k > 0) term *= -(x * x) / 4 / (k * (k + m));
    s += term;
  }
  return s;
};
const J0MAX = 1;
const J1MAX = 0.5819;

const sinMode = (x0: number, L: number, y: number, n: number, amp: number, step = 6) => {
  const pts: string[] = [];
  for (let x = 0; x <= L + 0.01; x += step) pts.push(`${pts.length ? 'L' : 'M'}${(x0 + x).toFixed(1)},${(y - amp * Math.sin((n * Math.PI * x) / L)).toFixed(1)}`);
  return pts.join(' ');
};

const WavePath: React.FC<{d: string; color: string; w?: number; op?: number}> = ({d, color, w = 4, op = 1}) =>
  op <= 0.001 ? null : (
    <g opacity={op}>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={w * 3.2} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );

const Clamp: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x - 12} y={y - 46} width={24} height={92} rx={6} fill="#3a4770" stroke={C.muted} strokeWidth={2} />
    <circle cx={x} cy={y} r={7} fill={C.heat} />
  </g>
);

// ---------- fase 2: tingkat energi ----------
const BX = 1000;
const BL = 440;
const E0Y = 832;
const EK = 33; // px per E₁
const lvY = (n: number) => E0Y - EK * n * n;
const eqY = (n: number) => E0Y - 40 - 128 * (n - 1);
const omega = (n: number) => 0.85 * n * n;

// ---------- fase 3: membran & orbital ----------
const MX = 470;
const MY = 600;
const MR = 230;
const MH = 105;

export const Bridge: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  const tOrb = wordOf(3, 'Orbital');
  const ph1 = 1 - ramp(t, cue(2) - 0.7, cue(2) - 0.1, EASE_IN_OUT);
  const ph2 = Math.min(ramp(t, cue(2) - 0.3, cue(2) + 0.4), 1 - ramp(t, tOrb - 0.7, tOrb - 0.1, EASE_IN_OUT));
  const ph3 = ramp(t, tOrb - 0.3, tOrb + 0.5);

  // ================= fase 1 =================
  const s0 = 1 - ramp(t, cue(1) - 0.6, cue(1), EASE_IN_OUT);
  const s1 = ramp(t, cue(1) - 0.2, cue(1) + 0.6);
  const ideaA = ramp(t, wordOf(0, 'elektron') - 0.4, wordOf(0, 'elektron') + 0.5);
  const ideaB = ramp(t, wordOf(0, 'gelombang', 1) - 0.3, wordOf(0, 'gelombang', 1) + 0.6);
  const plus = ramp(t, wordOf(0, 'gabungkan') - 0.3, wordOf(0, 'gabungkan') + 0.4);
  const ex = 230 + ((((t * 140) % 560) + 560) % 560);
  const eph = (((t * 140) / 560) % 1 + 1) % 1;
  const elPacket = (() => {
    let d = '';
    for (let i = 0; i <= 140; i++) {
      const x = ex - 210 + (420 * i) / 140;
      const uu = x - ex;
      d += `${i ? 'L' : 'M'}${x.toFixed(1)},${(540 - 60 * Math.exp(-(uu * uu) / (2 * 70 * 70)) * Math.sin((TAU * uu) / 60 - t * 7)).toFixed(1)} `;
    }
    return d;
  })();
  // tali (kanan) superposisi mode yang bergantian halus
  const wN = (n: number) => {
    const c = (((t / 2.6 - (n - 1)) % 3) + 3) % 3;
    return Math.max(0, Math.sin((Math.PI * Math.min(c, 1.4)) / 1.4)) * (c < 1.4 ? 1 : 0) + 0;
  };
  const strPts: string[] = [];
  for (let x = 0; x <= 600; x += 6) {
    let y = 0;
    for (let n = 1; n <= 3; n++) y += wN(n) * Math.sin((n * Math.PI * x) / 600) * Math.cos(2.6 * n * t);
    strPts.push(`${strPts.length ? 'L' : 'M'}${(1110 + x).toFixed(1)},${(540 - 85 * y).toFixed(1)}`);
  }
  // L1: kotak + tali, mode n = 2
  const boxOn = ramp(t, wordOf(1, 'kotak') - 0.4, wordOf(1, 'kotak') + 0.5);
  const tali = ramp(t, wordOf(1, 'tali') - 0.4, wordOf(1, 'tali') + 0.5);
  const stand = ramp(t, wordOf(1, 'berdiri') - 0.4, wordOf(1, 'berdiri') + 0.5);
  const c2 = Math.cos(omega(2) * t);

  // ================= fase 2 =================
  const fit = ramp(t, wordOf(2, 'panjang') - 0.4, wordOf(2, 'panjang') + 0.6);
  const pOn = ramp(t, wordOf(2, 'momentum') - 0.4, wordOf(2, 'momentum') + 0.5);
  const eOn = ramp(t, wordOf(2, 'energi') - 0.4, wordOf(2, 'energi') + 0.5);
  const rise = ramp(t, wordOf(2, 'energi') - 0.2, wordOf(2, 'energi') + 1.6, EASE_IN_OUT);
  const modesIn = (n: number) => ramp(t, cue(2) - 0.1 + (n - 1) * 0.35, cue(2) + 0.5 + (n - 1) * 0.35);
  const levelY = (n: number) => mix(eqY(n), lvY(n), rise);
  const cardBox = slot(t, cue(2) - 0.1, tOrb - 0.6);
  const jumpT = cue(3) + 0.4;
  const jump = ramp(t, jumpT, jumpT + 0.6, EASE_IN_OUT);
  const phX = BX + BL + 20 + 520 * Math.max(0, t - jumpT - 0.3);
  const phOp = Math.min(ramp(t, jumpT + 0.3, jumpT + 0.5), 1 - ramp(t, jumpT + 1.3, jumpT + 1.7, EASE_IN_OUT));
  const atomNote = ramp(t, wordOf(3, 'atom') - 0.4, wordOf(3, 'atom') + 0.5);
  const lead3 = ramp(t, cue(3) - 0.4, cue(3) + 0.2);

  // ================= fase 3 =================
  const m = 0.5 - 0.5 * Math.cos(0.75 * Math.max(0, t - tOrb - 1.2));
  const ct = Math.cos(1.6 * t);
  const zAt = (rho: number, phi: number) => {
    const z01 = J(0, 2.405 * rho) / J0MAX;
    const z11 = (J(1, 3.832 * rho) / J1MAX) * Math.cos(phi + 0.35);
    return mix(z01, z11, m) * ct;
  };
  const proj = (rho: number, phi: number, z: number): [number, number] => [MX + MR * rho * Math.cos(phi), MY + MR * 0.42 * rho * Math.sin(phi) - MH * z];
  const zCol = (z: number) => interpolateColors(Math.max(-1, Math.min(1, z)), [-1, -0.15, 0, 0.15, 1], [C.gold, '#c9a860', '#8a94c0', '#a585e0', C.spr]);
  const segs: {x1: number; y1: number; x2: number; y2: number; col: string; front: number}[] = [];
  if (ph3 > 0) {
    const NR = 6;
    const NS = 44;
    for (let r = 1; r <= NR; r++) {
      const rho = r / NR;
      for (let s = 0; s < NS; s++) {
        const a1 = (TAU * s) / NS;
        const a2 = (TAU * (s + 1)) / NS;
        const za = zAt(rho, a1);
        const zb = zAt(rho, a2);
        const [x1, y1] = proj(rho, a1, za);
        const [x2, y2] = proj(rho, a2, zb);
        segs.push({x1, y1, x2, y2, col: zCol((za + zb) / 2), front: Math.sin((a1 + a2) / 2)});
      }
    }
    for (let s = 0; s < 16; s++) {
      const a = (TAU * s) / 16;
      for (let k = 0; k < 8; k++) {
        const r1 = k / 8;
        const r2 = (k + 1) / 8;
        const za = zAt(r1, a);
        const zb = zAt(r2, a);
        const [x1, y1] = proj(r1, a, za);
        const [x2, y2] = proj(r2, a, zb);
        segs.push({x1, y1, x2, y2, col: zCol((za + zb) / 2), front: Math.sin(a)});
      }
    }
  }
  const s1Hi = 1 - m;
  const p2Hi = m;
  const card4 = slot(t, cue(4) - 0.1, 99);
  const tilt = 12 * Math.sin(t * 0.5);
  const breathe = 1 + 0.04 * Math.sin(t * 1.6);
  const lobe = (dir: 1 | -1) => {
    const L = 165 * breathe;
    const W = 78 * breathe;
    return `M0,0 C${W},${-dir * L * 0.25} ${W * 1.05},${-dir * L * 0.95} 0,${-dir * L} C${-W * 1.05},${-dir * L * 0.95} ${-W},${-dir * L * 0.25} 0,0 Z`;
  };

  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="br-1s" cx="42%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#f1e6ff" stopOpacity="0.95" />
            <stop offset="35%" stopColor={C.spr} stopOpacity="0.75" />
            <stop offset="100%" stopColor={C.spr} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="br-lp" cx="50%" cy="60%" r="65%">
            <stop offset="0%" stopColor="#efe2ff" stopOpacity="0.95" />
            <stop offset="60%" stopColor={C.spr} stopOpacity="0.8" />
            <stop offset="100%" stopColor={C.spr} stopOpacity="0.35" />
          </radialGradient>
          <radialGradient id="br-lm" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fff3cf" stopOpacity="0.95" />
            <stop offset="60%" stopColor={C.gold} stopOpacity="0.8" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0.35" />
          </radialGradient>
        </defs>
      </svg>

      {/* ===================== fase 1 ===================== */}
      {ph1 > 0.001 ? (
        <AbsoluteFill style={{opacity: ph1}}>
          <Stage>
            {s0 > 0.001 ? (
              <g opacity={s0}>
                <g opacity={ideaA}>
                  <rect x={150} y={330} width={720} height={420} rx={24} fill="rgba(10,16,36,0.55)" stroke={C.line} strokeWidth={2} />
                  <WavePath d={elPacket} color={C.spr} op={fz(eph)} />
                  <Spark x={ex} y={540} r={12} color="spr" opacity={fz(eph)} />
                  <Label x={510} y={380} size={26} color={C.spr} weight={700}>
                    1 · elektron adalah gelombang
                  </Label>
                  <Label x={510} y={700} size={24} color={C.muted}>
                    λ = h/p
                  </Label>
                </g>
                <g opacity={ideaB}>
                  <rect x={1050} y={330} width={720} height={420} rx={24} fill="rgba(10,16,36,0.55)" stroke={C.line} strokeWidth={2} />
                  <WavePath d={strPts.join(' ')} color={C.cyan} />
                  <Clamp x={1110} y={540} />
                  <Clamp x={1710} y={540} />
                  <Label x={1410} y={380} size={26} color={C.cyan} weight={700}>
                    2 · gelombang terkurung
                  </Label>
                  <Label x={1410} y={700} size={24} color={C.muted}>
                    hanya bentuk tertentu yang bertahan
                  </Label>
                </g>
                <Label x={960} y={540} size={72} color={C.gold} weight={700} opacity={plus}>
                  +
                </Label>
              </g>
            ) : null}
            {s1 > 0.001 ? (
              <g opacity={s1}>
                {/* kotak elektron */}
                <g opacity={boxOn}>
                  <rect x={600} y={300} width={20} height={330} fill="#5b678f" />
                  <rect x={1300} y={300} width={20} height={330} fill="#5b678f" />
                  <line x1={620} y1={620} x2={1300} y2={620} stroke={C.faint} strokeWidth={2} />
                  <Glow x={960} y={465} r={300} color="spr" opacity={0.35} />
                  <path
                    d={`${sinMode(620, 680, 465, 2, 0, 8)}`}
                    stroke={C.faint}
                    strokeWidth={1.5}
                    strokeDasharray="4 8"
                    fill="none"
                  />
                  <WavePath d={sinMode(620, 680, 465, 2, 120 * c2)} color={C.spr} w={5} />
                  <WavePath d={sinMode(620, 680, 465, 2, -120 * c2)} color={C.spr} w={2} op={0.25 * stand} />
                  <circle cx={960} cy={465} r={9} fill={C.heat} opacity={stand} />
                  <Label x={960} y={268} size={26} color={C.spr} weight={700}>
                    elektron dalam kotak
                  </Label>
                  <Motes x={960} y={465} rx={300} ry={120} n={14} color="spr" opacity={0.5} seed={2} />
                </g>
                {/* tali terikat */}
                <g opacity={tali}>
                  <WavePath d={sinMode(620, 680, 760, 2, 60 * c2)} color={C.cyan} w={4} />
                  <Clamp x={620} y={760} />
                  <Clamp x={1300} y={760} />
                  <circle cx={960} cy={760} r={8} fill={C.heat} />
                  <Label x={960} y={846} size={24} color={C.cyan} weight={600}>
                    tali yang kedua ujungnya terikat
                  </Label>
                  <Label x={1340} y={760} size={22} color={C.muted} anchor="start">
                    bentuk sama
                  </Label>
                </g>
              </g>
            ) : null}
          </Stage>
          <Note x={1560} y={465} p={stand} color={C.spr} size={26}>
            gelombang <span style={{color: C.spr}}>berdiri</span>
          </Note>
        </AbsoluteFill>
      ) : null}

      {/* ===================== fase 2: tingkat energi ===================== */}
      {ph2 > 0.001 ? (
        <AbsoluteFill style={{opacity: ph2}}>
          <Stage>
            {/* dinding kotak */}
            <rect x={BX - 18} y={250} width={18} height={E0Y - 250 + 10} fill="#5b678f" />
            <rect x={BX + BL} y={250} width={18} height={E0Y - 250 + 10} fill="#5b678f" />
            <line x1={BX} y1={E0Y} x2={BX + BL} y2={E0Y} stroke={C.faint} strokeWidth={2} />
            <Label x={BX + BL / 2} y={E0Y + 30} size={24} color={C.ink} font="serif" italic>
              L
            </Label>
            <Arrow x1={BX - 70} y1={E0Y} x2={BX - 70} y2={250} color="work" width={4} pulse={false} opacity={eOn} />
            <Label x={BX - 70} y={226} size={26} color={C.work} font="serif" italic weight={700} opacity={eOn}>
              E
            </Label>
            {[1, 2, 3, 4].map((n) => {
              const y = levelY(n);
              const op = modesIn(n);
              return (
                <g key={n} opacity={op}>
                  <line x1={BX} y1={y} x2={BX + BL} y2={y} stroke={C.work} strokeWidth={3} opacity={0.25 + 0.75 * eOn} />
                  <WavePath d={sinMode(BX, BL, y, n, 38 * Math.cos(omega(n) * t))} color={C.spr} w={3.5} />
                  <Label x={BX - 110} y={y} size={24} color={C.muted} anchor="end" font="mono">
                    n = {n}
                  </Label>
                  <Label x={BX + BL + 40} y={y} size={26} color={C.work} anchor="start" weight={700} opacity={eOn}>
                    {n === 1 ? '' : n * n}E<tspan baselineShift="sub" fontSize="0.65em">1</tspan>
                  </Label>
                </g>
              );
            })}
            {/* λ/2 = L pada n = 1 */}
            <g opacity={fit * (1 - eOn)}>
              <Arrow x1={BX + 4} y1={levelY(1) + 52} x2={BX + BL - 4} y2={levelY(1) + 52} color="press" width={3.5} both pulse={false} />
              <Label x={BX + BL / 2} y={levelY(1) + 80} size={22} color={C.press} weight={600}>
                L = n · λ/2
              </Label>
            </g>
            {/* jarak antar-tingkat makin lebar */}
            <g opacity={eOn * rise * (1 - lead3)}>
              {[1, 2, 3].map((n) => (
                <g key={n}>
                  <Arrow x1={BX + BL + 150} y1={lvY(n) - 4} x2={BX + BL + 150} y2={lvY(n + 1) + 4} color="work" width={3} both pulse={false} opacity={0.75} />
                  <Label x={BX + BL + 170} y={(lvY(n) + lvY(n + 1)) / 2} size={22} color={C.work} anchor="start">
                    {2 * n + 1}E<tspan baselineShift="sub" fontSize="0.65em">1</tspan>
                  </Label>
                </g>
              ))}
              <Label x={BX + BL + 210} y={225} size={22} color={C.work} weight={600}>
                makin renggang ∝ n²
              </Label>
            </g>
            {/* pembanding osilator: jarak sama */}
            <g opacity={eOn * rise * 0.8 * (1 - lead3)}>
              {[0, 1, 2, 3].map((k) => (
                <line key={k} x1={1680} y1={E0Y - 40 - 120 * k} x2={1760} y2={E0Y - 40 - 120 * k} stroke={C.gold} strokeWidth={2.5} opacity={0.55} />
              ))}
              <Label x={1720} y={E0Y + 30} size={18} color={C.gold} opacity={0.8}>
                osilator:
              </Label>
              <Label x={1720} y={E0Y + 54} size={18} color={C.gold} opacity={0.8}>
                jarak sama
              </Label>
            </g>
            {/* lompatan 3 → 2 memancarkan foton */}
            <g opacity={lead3}>
              <Spark x={BX + BL / 2} y={mix(lvY(3), lvY(2), jump)} r={10} color="work" />
              <Arrow x1={BX + BL / 2 + 40} y1={lvY(3) + 8} x2={BX + BL / 2 + 40} y2={lvY(2) - 8} color="work" width={3} pulse={false} opacity={jump} />
            </g>
            {phOp > 0.001 ? (
              <path
                d={Array.from({length: 60}, (_, i) => {
                  const x = phX - 120 + i * 4;
                  const uu = x - phX;
                  return `${i ? 'L' : 'M'}${x.toFixed(1)},${((lvY(2) + lvY(3)) / 2 - 22 * Math.exp(-(uu * uu) / 1800) * Math.sin(uu / 5)).toFixed(1)}`;
                }).join(' ')}
                fill="none"
                stroke={PHOTON}
                strokeWidth={3.5}
                opacity={phOp}
              />
            ) : null}
            <Ripple x={BX + BL / 2} y={lvY(2)} p={ramp(t, jumpT + 0.4, jumpT + 1.6)} r={100} color="work" />
            <Motes x={BX + BL / 2} y={550} rx={300} ry={260} n={12} color="spr" opacity={0.3} seed={5} />
          </Stage>
          <Formula x={480} y={470} p={cardBox} accent={C.work} size={56} caption="hanya n = 1, 2, 3, … yang diizinkan">
            <div>
              <Part p={0.25 + 0.75 * fit}>
                <V color={C.press}>λ</V>
                <Sub>n</Sub> = <Frac n="2L" d={<V>n</V>} />
              </Part>
            </div>
            <div>
              <Part p={0.12 + 0.88 * pOn}>
                → <V color={C.kin}>p</V>
                <Sub>n</Sub> = <Frac n={<V>h</V>} d={<><V color={C.press}>λ</V><Sub>n</Sub></>} /> = <Frac n={<><V>n</V><V>h</V></>} d="2L" />
              </Part>
            </div>
            <div>
              <Part p={0.12 + 0.88 * eOn}>
                → <V color={C.work}>E</V>
                <Sub>n</Sub> = <Frac n={<><V>n</V><Sup>2</Sup><V>h</V><Sup>2</Sup></>} d={<>8<V>m</V>L<Sup>2</Sup></>} />
              </Part>
            </div>
          </Formula>
          <Note x={450} y={765} p={atomNote} color={PHOTON} size={24}>
            lompatan antar-tingkat → cahaya berwarna tertentu
          </Note>
        </AbsoluteFill>
      ) : null}

      {/* ===================== fase 3: membran → orbital ===================== */}
      {ph3 > 0.001 ? (
        <AbsoluteFill style={{opacity: ph3}}>
          <Stage>
            {/* membran 2D (3D semu) */}
            <ellipse cx={MX} cy={MY + 150} rx={MR * 0.95} ry={30} fill="#000" opacity={0.25} />
            {segs
              .filter((s) => s.front < 0)
              .map((s, i) => (
                <line key={`b${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.col} strokeWidth={2} opacity={0.55} />
              ))}
            {segs
              .filter((s) => s.front >= 0)
              .map((s, i) => (
                <line key={`f${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.col} strokeWidth={2.6} opacity={0.9} />
              ))}
            <ellipse cx={MX} cy={MY} rx={MR + 8} ry={MR * 0.42 + 4} fill="none" stroke={C.muted} strokeWidth={5} opacity={0.7} />
            <Label x={MX} y={MY + 210} size={24} color={C.ink} weight={600}>
              membran: gelombang berdiri 2D
            </Label>
            {/* aliran ke orbital yang sesuai */}
            <Stream pts={[[MX + 260, MY - 40], [1060, 560]]} color="spr" n={6} speed={0.6} r={4} opacity={s1Hi * 0.8} jitter={3} />
            <Stream pts={[[MX + 260, MY - 40], [1060, 470], [1380, 470]]} color="spr" n={8} speed={0.6} r={4} opacity={p2Hi * 0.8} seed={2} jitter={3} />
            {/* orbital 1s */}
            <g opacity={0.45 + 0.55 * s1Hi}>
              <Glow x={1200} y={MY - 40} r={240} color="spr" opacity={0.5 * s1Hi} />
              <circle cx={1200} cy={MY - 40} r={120 * breathe} fill="url(#br-1s)" />
              <ellipse cx={1200} cy={MY - 40} rx={120 * breathe} ry={34} fill="none" stroke={C.spr} strokeWidth={1.5} opacity={0.5} strokeDasharray="5 6" />
              <Label x={1200} y={MY + 130} size={34} color={C.spr} weight={700}>
                1s
              </Label>
            </g>
            {/* orbital 2p */}
            <g opacity={0.45 + 0.55 * p2Hi}>
              <Glow x={1560} y={MY - 40} r={260} color="spr" opacity={0.4 * p2Hi} />
              <g transform={`translate(1560 ${MY - 40}) rotate(${tilt})`}>
                <path d={lobe(1)} fill="url(#br-lp)" stroke={C.spr} strokeWidth={2} />
                <path d={lobe(-1)} fill="url(#br-lm)" stroke={C.gold} strokeWidth={2} />
                <line x1={-130} y1={0} x2={130} y2={0} stroke={C.heat} strokeWidth={3} strokeDasharray="8 7" />
                <ellipse cx={0} cy={0} rx={130} ry={26} fill={C.heat} opacity={0.08} />
              </g>
              <Label x={1560} y={MY + 160} size={34} color={C.spr} weight={700}>
                2p
              </Label>
              <Label x={1418} y={MY - 40} size={20} color={C.heat} anchor="end" weight={600}>
                simpul
              </Label>
            </g>
            <Label x={1380} y={MY + 210} size={24} color={C.ink} weight={600}>
              orbital: gelombang berdiri 3D
            </Label>
            <g>
              <circle cx={1290} cy={MY + 246} r={9} fill={C.spr} />
              <Label x={1306} y={MY + 246} size={20} color={C.muted} anchor="start">
                fase +
              </Label>
              <circle cx={1420} cy={MY + 246} r={9} fill={C.gold} />
              <Label x={1436} y={MY + 246} size={20} color={C.muted} anchor="start">
                fase −
              </Label>
            </g>
            <Ripple x={960} y={250} p={ramp(t, cue(4) - 0.1, cue(4) + 1.4)} r={300} color="spr" />
            <Twinkles x={960} y={250} rx={420} ry={70} n={6} color="spr" opacity={card4} seed={9} />
            <Motes x={960} y={MY} rx={760} ry={260} n={16} color="spr" opacity={0.3} seed={6} />
          </Stage>
          <Formula x={960} y={252} p={card4} accent={C.spr} size={56} caption={<>persamaan Schrödinger = <span style={{color: C.spr}}>persamaan gelombang untuk materi</span></>}>
            −<Frac n={<>ħ<Sup>2</Sup></>} d={<>2<V>m</V></>} />
            <Frac n={<>d<Sup>2</Sup><V color={C.spr}>ψ</V></>} d={<>d<V>x</V><Sup>2</Sup></>} /> + <V>V</V>
            <V color={C.spr}>ψ</V> = <Tint c={C.work}><V>E</V></Tint>
            <V color={C.spr}>ψ</V>
          </Formula>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

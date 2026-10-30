import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {EASE_IN_OUT, mix, ramp, smoothPath} from '../anim';
import {Arrow, Badge, Formula, Frac, Glow, Label, Motes, Note, Ripple, Stage, Stream, Tint, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {ATOM, C} from '../theme';

// Difraksi sinar-X (AUDIT): Bragg nλ = 2d sin θ. NaCl (200): d = 0,282 nm; Cu Kα λ = 0,154 nm
// → sin θ = 0,154 / 0,564 = 0,273 → θ = 15,9° ("≈ 16°"), puncak terkuat pada 2θ ≈ 31,7°.
// Puncak lain NaCl (Cu Kα, sebagai hiasan grafik): (111) 27,4° ≈ 13 %, (220) 45,5° ≈ 55 %.
// Diagram Bragg berskala 800 px/nm: d = 226 px, λ = 123 px → gelombang keluar sefase tepat saat θ = 15,9°.

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const XR = '#d9ccff'; // sinar-X: ungu pucat
const NA = ATOM.Na.fill;
const CL = ATOM.Cl.fill;

/** Bola atom dengan gradien (Na kecil ungu, Cl besar hijau). */
const Ion: React.FC<{x: number; y: number; r: number; na: boolean; op?: number}> = ({x, y, r, na, op = 1}) =>
  op <= 0.01 ? null : (
    <g opacity={op}>
      <circle cx={x} cy={y} r={r} fill={na ? NA : CL} />
      <circle cx={x} cy={y} r={r} fill="url(#xr-shade)" />
      <circle cx={x - r * 0.35} cy={y - r * 0.38} r={r * 0.28} fill="#fff" opacity={0.5} />
    </g>
  );

// ---------- fase 1: kisi NaCl 3D ----------
const N3 = 4;
const S3 = 100;
// ---------- fase 2: Bragg ----------
const D2 = 226;
const L2 = 123;
const Y1 = 580;
const Y2 = Y1 + D2;
const OX = 960;
const LIN = 620;
const LOUT = 520;
const THB = Math.asin(L2 / (2 * D2)); // 15,8° pada skala gambar (asli 15,9°)
// ---------- fase 3: difraktometer ----------
const G: [number, number] = [500, 640];
const GR = 300;
const PX0 = 1010;
const PX1 = 1740;
const PY0 = 800;
const PH = 360;
const tt2x = (a: number) => PX0 + ((a - 20) / 30) * (PX1 - PX0);
const gpk = (a: number, c: number, w = 0.32) => Math.exp(-((a - c) ** 2) / (2 * w * w));
const xrd = (a: number) => 100 * gpk(a, 31.7) + 13 * gpk(a, 27.37) + 55 * gpk(a, 45.45) + 3 + 1.2 * Math.sin(a * 7.3) * Math.sin(a * 2.1);

export const XRay: React.FC = () => {
  const {t, cue, cueEnd, wordOf} = useScene();

  const ph1 = 1 - ramp(t, cue(2) - 0.7, cue(2) - 0.1, EASE_IN_OUT);
  const ph2 = Math.min(ramp(t, cue(2) - 0.3, cue(2) + 0.4), 1 - ramp(t, cue(4) - 0.6, cue(4) - 0.1, EASE_IN_OUT));
  const ph3 = Math.min(ramp(t, cue(4) - 0.3, cue(4) + 0.4), 1 - ramp(t, cue(5) - 0.6, cue(5) - 0.1, EASE_IN_OUT));
  const ph4 = ramp(t, cue(5) - 0.3, cue(5) + 0.4);

  // ================= fase 1 =================
  const f1 = ramp(t, cue(1) - 0.2, cue(1) + 1.8, EASE_IN_OUT);
  const yaw = (1 - f1) * (0.62 + 0.32 * Math.sin(0.33 * t));
  const pitch = (1 - f1) * (0.4 + 0.06 * Math.sin(0.5 * t));
  const CX = mix(1060, 700, f1);
  const CY = 540;
  const grain = 1 - ramp(t, cue(1) - 0.4, cue(1) + 0.4, EASE_IN_OUT);
  const qLbl = ramp(t, wordOf(0, 'kecil') - 0.3, wordOf(0, 'kecil') + 0.5);
  const atoms3: {x: number; y: number; z: number; r: number; na: boolean; k: number; key: string}[] = [];
  const pos3: Record<string, [number, number]> = {};
  if (ph1 > 0) {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    for (let i = 0; i < N3; i++)
      for (let j = 0; j < N3; j++)
        for (let k = 0; k < N3; k++) {
          const x = (i - 1.5) * S3;
          const y = (j - 1.5) * S3;
          const z = (k - 1.5) * S3;
          const x1 = x * cy + z * sy;
          const z1 = -x * sy + z * cy;
          const y2 = y * cp - z1 * sp;
          const z2 = y * sp + z1 * cp;
          const f = 1500 / (1500 + z2);
          const na = (i + j + k) % 2 === 0;
          const sx = CX + x1 * f;
          const syy = CY + y2 * f;
          atoms3.push({x: sx, y: syy, z: z2, r: (na ? 19 : 30) * f, na, k, key: `${i}${j}${k}`});
          pos3[`${i}${j}${k}`] = [sx, syy];
        }
    atoms3.sort((a, b) => b.z - a.z);
  }
  const bonds: [number, number, number, number, number][] = [];
  if (ph1 > 0)
    for (let i = 0; i < N3; i++)
      for (let j = 0; j < N3; j++)
        for (let k = 0; k < N3; k++) {
          const a = pos3[`${i}${j}${k}`];
          const op = k === 0 ? 1 : 1 - 0.85 * f1;
          if (i < N3 - 1) bonds.push([...a, ...pos3[`${i + 1}${j}${k}`], op]);
          if (j < N3 - 1) bonds.push([...a, ...pos3[`${i}${j + 1}${k}`], op]);
          if (k < N3 - 1) bonds.push([...a, ...pos3[`${i}${j}${k + 1}`], (1 - f1) * 0.9]);
        }
  const dOn = ramp(t, wordOf(1, 'antarbidang') - 0.3, wordOf(1, 'antarbidang') + 0.6);
  const lamOn = ramp(t, wordOf(1, 'sinar') - 0.5, wordOf(1, 'sinar') + 0.4);
  const nmOn = ramp(t, wordOf(1, 'nanometer') - 0.3, wordOf(1, 'nanometer') + 0.5);
  // gelombang sinar-X di kanan (skala sama: d = 100 px ↔ 0,282 nm → λ = 54,6 px)
  const lam1 = (S3 * 0.154) / 0.282;
  const xw: string[] = [];
  if (ph1 > 0)
    for (let x = 1120; x <= 1740; x += 3) {
      const e = clamp01((x - 1120) / 40) * clamp01((1740 - x) / 40);
      xw.push(`${xw.length ? 'L' : 'M'}${x},${(CY - 40 * e * Math.sin((TAU * (x - 1120 - 75 * t)) / lam1)).toFixed(1)}`);
    }

  // ================= fase 2 =================
  const lock = ramp(t, wordOf(2, 'kelipatan') - 0.6, wordOf(2, 'kelipatan') + 0.8, EASE_IN_OUT);
  const sweep = Math.sin(0.62 * (t - cue(2) + 0.4));
  const th = mix(THB + 9.5 * DEG * sweep, THB, lock);
  const u: [number, number] = [Math.cos(th), Math.sin(th)];
  const v: [number, number] = [Math.cos(th), -Math.sin(th)];
  const dS = D2 * Math.sin(th);
  const q = (2 * dS) / L2;
  const amp = Math.abs(Math.cos(Math.PI * q)) ** 4; // puncak dipertajam (kristal nyata punya banyak bidang)
  const k2 = TAU / L2;
  const w2 = TAU * 0.55;
  const raysOn = ramp(t, cue(2) - 0.1, cue(2) + 0.8);
  const extraOn = ramp(t, wordOf(2, 'selisih') - 0.4, wordOf(2, 'selisih') + 0.5);
  const braggCard = slot(t, cue(3) - 0.1, cue(4) - 0.5);
  const pt = (o: [number, number], dir: [number, number], s: number): [number, number] => [o[0] + dir[0] * s, o[1] + dir[1] * s];
  const O1: [number, number] = [OX, Y1];
  const O2: [number, number] = [OX, Y2];
  const A = pt(O2, u, -dS);
  const B = pt(O2, v, dS);
  // gelombang sepanjang sinar: simpangan tegak lurus sinar, fase = k·(lintasan) − ωt
  const rayWave = (o: [number, number], dir: [number, number], s0: number, s1: number, p0: number, ampW: number) => {
    const n: [number, number] = [-dir[1], dir[0]];
    const out: string[] = [];
    for (let s = s0; s <= s1 + 0.01; s += 5) {
      const P = p0 + (s - s0);
      const e = clamp01((s - s0) / 30) * clamp01((s1 - s) / 30) * raysOn;
      const y = ampW * e * Math.sin(k2 * P - w2 * t);
      const [x0, y0] = pt(o, dir, s);
      out.push(`${out.length ? 'L' : 'M'}${(x0 + n[0] * y).toFixed(1)},${(y0 + n[1] * y).toFixed(1)}`);
    }
    return out.join(' ');
  };
  const inc1 = rayWave(O1, u, -LIN, 0, 0, 22);
  const inc2 = rayWave(O2, u, -(LIN + dS), 0, 0, 22);
  const out1 = rayWave(O1, v, 0, LOUT, LIN, 22);
  const out2 = rayWave(O2, v, 0, LOUT + dS, LIN + dS, 22);
  const end1 = pt(O1, v, LOUT);
  const end2 = pt(O2, v, LOUT + dS);
  const detC: [number, number] = [(end1[0] + end2[0]) / 2 + v[0] * 40, (end1[1] + end2[1]) / 2 + v[1] * 40];
  const atomsRow = Array.from({length: 7}, (_, i) => OX + D2 * (i - 3));

  // ================= fase 3 =================
  const tEnam = wordOf(4, 'enam');
  const tt2 = interpolate(t, [cue(4) + 0.2, tEnam, cueEnd(4) + 0.4], [20, 31.7, 50], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const th3 = (tt2 / 2) * DEG;
  const tube = [G[0] - GR * Math.cos(th3), G[1] - GR * Math.sin(th3)] as [number, number];
  const det = [G[0] + GR * Math.cos(th3), G[1] - GR * Math.sin(th3)] as [number, number];
  const Inow = xrd(tt2) / 100;
  const plotPts: [number, number][] = [];
  if (ph3 > 0) for (let a = 20; a <= tt2 + 0.001; a += 0.08) plotPts.push([tt2x(a), PY0 - PH * (xrd(a) / 100)]);
  const peakOn = ramp(t, tEnam + 0.1, tEnam + 0.8);
  const card3 = slot(t, wordOf(4, 'derajat') - 0.6, cue(5) - 0.4);
  const cuOn = ramp(t, wordOf(4, 'tembaga') - 0.3, wordOf(4, 'tembaga') + 0.5);

  // ================= fase 4 =================
  const tSpot = cue(5) + 0.1;
  const protOn = ramp(t, wordOf(5, 'protein') - 0.4, wordOf(5, 'protein') + 0.5);
  const dnaOn = ramp(t, wordOf(5, 'DNA') - 0.5, wordOf(5, 'DNA') + 0.5);
  const salt = ramp(t, wordOf(5, 'garam') - 0.4, wordOf(5, 'garam') + 0.5);
  const spots: {x: number; y: number; r: number; op: number; i: number}[] = [];
  if (ph4 > 0) {
    let i = 0;
    for (let h = -4; h <= 4; h++)
      for (let k = -4; k <= 4; k++) {
        const rr = Math.hypot(h, k);
        if (rr > 4.3 || rr === 0) continue;
        const appear = ramp(t, tSpot + rr * 0.35, tSpot + rr * 0.35 + 0.5);
        const strength = Math.exp(-rr * 0.33) * (0.75 + 0.25 * Math.sin(t * 2.2 + i * 1.7));
        spots.push({x: 520 + 52 * h, y: 520 + 52 * k, r: 4 + 7 * Math.exp(-rr * 0.35), op: appear * strength, i: i++});
      }
  }
  const helix = (side: number) => {
    const pts: [number, number][] = [];
    for (let y = 280; y <= 790; y += 8) pts.push([1330 + 78 * Math.sin((TAU * (y - 280)) / 255 + t * 1.1 + side * 0.78 * Math.PI), y]);
    return pts;
  };
  const rungs = Array.from({length: 20}, (_, i) => 290 + i * 25.5);

  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="xr-shade" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.25" />
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id="xr-prot" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.cyan} />
            <stop offset="50%" stopColor={C.work} />
            <stop offset="100%" stopColor={C.gold} />
          </linearGradient>
        </defs>
      </svg>

      {/* ===================== fase 1: kristal garam ===================== */}
      {ph1 > 0.001 ? (
        <AbsoluteFill style={{opacity: ph1}}>
          <Stage>
            {/* butir garam & garis zoom */}
            <g opacity={grain}>
              <g transform={`translate(330 560) rotate(${4 * Math.sin(t * 0.6)})`}>
                <path d="M-60,-20 L0,-50 L60,-20 L0,10 Z" fill="#f4f7ff" />
                <path d="M-60,-20 L0,10 L0,80 L-60,50 Z" fill="#c9d2ee" />
                <path d="M60,-20 L0,10 L0,80 L60,50 Z" fill="#a3afd4" />
              </g>
              <Glow x={330} y={570} r={120} color="white" opacity={0.35} />
              <line x1={390} y1={530} x2={CX - 200} y2={CY - 230} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.6} />
              <line x1={390} y1={610} x2={CX - 200} y2={CY + 230} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.6} />
              <Label x={330} y={680} size={26} color={C.ink} weight={600}>
                sebutir garam
              </Label>
              <Label x={330} y={720} size={22} color={C.muted} opacity={qLbl}>
                atom terlalu kecil untuk dilihat
              </Label>
            </g>
            <Glow x={CX} y={CY} r={330} color="spr" opacity={0.35} />
            {bonds.map(([x1, y1, x2, y2, op], i) => (op > 0.02 ? <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8e9cc8" strokeWidth={2} opacity={0.35 * op} /> : null))}
            {atoms3.map((a) => (
              <Ion key={a.key} x={a.x} y={a.y} r={a.r} na={a.na} op={a.k === 0 ? 1 : 1 - 0.8 * f1} />
            ))}
            {/* bidang atom & d */}
            <g opacity={dOn * f1}>
              {[0, 1, 2, 3].map((j) => (
                <line key={j} x1={CX - 210} y1={CY + (j - 1.5) * S3} x2={CX + 210} y2={CY + (j - 1.5) * S3} stroke={C.gold} strokeWidth={2} strokeDasharray="8 8" opacity={0.6} />
              ))}
              <Arrow x1={CX + 250} y1={CY - 0.5 * S3 - 46} x2={CX + 250} y2={CY - 0.5 * S3 + 46} color="ink" width={4} both pulse={false} />
              <Label x={CX + 275} y={CY - 0.5 * S3} size={30} color={C.ink} anchor="start" font="serif" italic weight={600}>
                d
              </Label>
              <Label x={CX} y={CY + 222} size={24} color={C.ink} weight={600} opacity={nmOn}>
                d = 0,282 nm
              </Label>
            </g>
            {/* legenda */}
            <g>
              <Ion x={CX - 110} y={830} r={13} na />
              <Label x={CX - 88} y={830} size={22} color={NA} anchor="start" weight={600}>
                Na⁺
              </Label>
              <Ion x={CX + 40} y={830} r={18} na={false} />
              <Label x={CX + 66} y={830} size={22} color={CL} anchor="start" weight={600}>
                Cl⁻
              </Label>
            </g>
            {/* sinar-X sebagai pembanding */}
            <g opacity={lamOn}>
              <Glow x={1430} y={CY} r={240} color="spr" opacity={0.3} />
              <path d={xw.join(' ')} fill="none" stroke={XR} strokeOpacity={0.25} strokeWidth={11} strokeLinejoin="round" />
              <path d={xw.join(' ')} fill="none" stroke={XR} strokeWidth={3.5} strokeLinejoin="round" />
              <line x1={1400} y1={CY - 60} x2={1400} y2={CY - 96} stroke={C.press} strokeWidth={2} strokeDasharray="4 4" />
              <line x1={1400 + lam1} y1={CY - 60} x2={1400 + lam1} y2={CY - 96} stroke={C.press} strokeWidth={2} strokeDasharray="4 4" />
              <Arrow x1={1404} y1={CY - 80} x2={1400 + lam1 - 4} y2={CY - 80} color="press" width={3.5} both pulse={false} />
              <Label x={1400 + lam1 / 2} y={CY - 124} size={26} color={C.press} weight={700}>
                λ = 0,154 nm
              </Label>
              <Label x={1430} y={CY + 100} size={26} color={XR} weight={600}>
                sinar-X
              </Label>
              <Label x={1430} y={CY + 255} size={24} color={C.ink} weight={600} opacity={nmOn}>
                λ dan d seorde → cocok untuk "mengukur" kisi
              </Label>
            </g>
            <Motes x={CX} y={CY} rx={330} ry={300} n={14} color="spr" opacity={0.35} seed={4} />
          </Stage>
        </AbsoluteFill>
      ) : null}

      {/* ===================== fase 2: pantulan Bragg ===================== */}
      {ph2 > 0.001 ? (
        <AbsoluteFill style={{opacity: ph2}}>
          <Stage>
            {/* bidang atom */}
            {[Y1, Y2].map((y, r) => (
              <g key={y}>
                <line x1={200} y1={y} x2={1720} y2={y} stroke={C.gold} strokeWidth={2} strokeDasharray="10 9" opacity={0.45} />
                {atomsRow.map((x, i) => (
                  <Ion key={i} x={x + 2 * Math.sin(t * 2 + i + r)} y={y} r={(i + r) % 2 ? 17 : 26} na={(i + r) % 2 === 1} />
                ))}
              </g>
            ))}
            <Arrow x1={1700} y1={Y1 + 34} x2={1700} y2={Y2 - 34} color="ink" width={4} both pulse={false} />
            <Label x={1726} y={(Y1 + Y2) / 2} size={32} color={C.ink} anchor="start" font="serif" italic weight={600}>
              d
            </Label>
            {/* sinar */}
            <g opacity={raysOn}>
              {[
                [pt(O1, u, -LIN), O1, end1],
                [pt(O2, u, -(LIN + dS)), O2, end2],
              ].map(([a, o, e], i) => (
                <path key={i} d={`M${a[0]},${a[1]} L${o[0]},${o[1]} L${e[0]},${e[1]}`} fill="none" stroke={XR} strokeWidth={2} opacity={0.35} />
              ))}
              {[inc1, inc2, out1, out2].map((d, i) => (
                <g key={i}>
                  <path d={d} fill="none" stroke={XR} strokeOpacity={0.22} strokeWidth={10} strokeLinejoin="round" />
                  <path d={d} fill="none" stroke={XR} strokeWidth={3.2} strokeLinejoin="round" />
                </g>
              ))}
              <circle cx={O1[0]} cy={O1[1]} r={7} fill="#fff" />
              <circle cx={O2[0]} cy={O2[1]} r={7} fill="#fff" />
              {/* sudut θ */}
              <path d={`M${OX - 190},${Y1} A190,190 0 0 1 ${OX - 190 * u[0]},${Y1 - 190 * u[1]}`} fill="none" stroke={C.gold} strokeWidth={3} />
              <Label x={OX - 225} y={Y1 - 24} size={30} color={C.gold} font="serif" italic weight={700}>
                θ
              </Label>
            </g>
            {/* selisih lintasan 2d sin θ */}
            <g opacity={extraOn}>
              <line x1={O1[0]} y1={O1[1]} x2={A[0]} y2={A[1]} stroke="#fff" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.6} />
              <line x1={O1[0]} y1={O1[1]} x2={B[0]} y2={B[1]} stroke="#fff" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.6} />
              <path d={`M${A[0]},${A[1]} L${O2[0]},${O2[1]} L${B[0]},${B[1]}`} fill="none" stroke={C.press} strokeOpacity={0.3} strokeWidth={16} strokeLinejoin="round" />
              <path d={`M${A[0]},${A[1]} L${O2[0]},${O2[1]} L${B[0]},${B[1]}`} fill="none" stroke={C.press} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
              <Label x={OX} y={Y2 + 48} size={26} color={C.press} weight={700}>
                ekstra = d sin θ + d sin θ = 2d sin θ
              </Label>
            </g>
            {/* detektor: dua gelombang keluar dijumlahkan */}
            <g opacity={raysOn}>
              <g transform={`translate(${detC[0]} ${detC[1]}) rotate(${-th / DEG})`}>
                <rect x={0} y={-115} width={26} height={230} rx={8} fill="#1f2a50" stroke={C.muted} strokeWidth={2} />
                <rect x={4} y={-111} width={18} height={222} rx={6} fill={XR} opacity={0.85 * amp * amp} />
              </g>
              <Glow x={detC[0] + 20} y={detC[1]} r={190} color="spr" opacity={amp * amp * 0.9} />
            </g>
            <g opacity={raysOn}>
              <Label x={1610} y={215} size={26} color={C.gold} weight={600}>
                θ = {(th / DEG).toFixed(1).replace('.', ',')}°
              </Label>
              <Label x={1610} y={255} size={26} color={C.press} weight={600}>
                2d sin θ = {q.toFixed(2).replace('.', ',')} λ
              </Label>
              <Label x={1610} y={300} size={26} color={XR} weight={700} opacity={amp * amp}>
                saling menguatkan
              </Label>
              <Label x={1610} y={300} size={26} color={C.muted} weight={600} opacity={1 - amp * amp}>
                saling melemahkan
              </Label>
            </g>
            <Twinkles x={detC[0]} y={detC[1]} rx={90} ry={110} n={5} color="spr" opacity={lock} seed={3} />
            <Motes x={960} y={680} rx={760} ry={200} n={12} color="spr" opacity={0.25} seed={8} />
          </Stage>
          <Formula x={960} y={250} p={braggCard} accent={C.gold} size={68} caption="n = 1, 2, 3, … (kelipatan bulat)">
            <V color={C.gold}>n</V>
            <V color={C.press}>λ</V> = 2<V>d</V> sin <V color={C.gold}>θ</V>
          </Formula>
        </AbsoluteFill>
      ) : null}

      {/* ===================== fase 3: difraktometer ===================== */}
      {ph3 > 0.001 ? (
        <AbsoluteFill style={{opacity: ph3}}>
          <Stage>
            {/* goniometer */}
            <circle cx={G[0]} cy={G[1]} r={GR + 30} fill="none" stroke={C.line} strokeWidth={2} />
            <path d={`M${G[0] - GR - 30},${G[1]} A${GR + 30},${GR + 30} 0 0 1 ${G[0] + GR + 30},${G[1]}`} fill="none" stroke={C.faint} strokeWidth={10} opacity={0.5} />
            {Array.from({length: 19}, (_, i) => {
              const a = (i * 10) * DEG;
              return <line key={i} x1={G[0] + (GR + 22) * Math.cos(a)} y1={G[1] - (GR + 22) * Math.sin(a)} x2={G[0] + (GR + 38) * Math.cos(a)} y2={G[1] - (GR + 38) * Math.sin(a)} stroke={C.muted} strokeWidth={2} opacity={0.6} />;
            })}
            {/* berkas */}
            <line x1={tube[0]} y1={tube[1]} x2={G[0]} y2={G[1]} stroke={XR} strokeWidth={6} opacity={0.35} />
            <Stream pts={[tube, G]} color="spr" n={8} speed={1.1} r={4} jitter={0} />
            <line x1={G[0]} y1={G[1]} x2={det[0]} y2={det[1]} stroke={XR} strokeWidth={4 + 8 * Inow} opacity={0.15 + 0.75 * Inow} />
            <Stream pts={[G, det]} color="spr" n={8} speed={1.1} r={4} jitter={0} opacity={0.15 + 0.85 * Inow} />
            {/* sampel */}
            <rect x={G[0] - 70} y={G[1]} width={140} height={22} rx={4} fill="#e8edff" />
            <rect x={G[0] - 70} y={G[1] + 22} width={140} height={10} rx={3} fill="#5b678f" />
            <Label x={G[0]} y={G[1] + 70} size={22} color={C.muted}>
              serbuk NaCl
            </Label>
            {/* tabung & detektor */}
            <g transform={`translate(${tube[0]} ${tube[1]}) rotate(${th3 / DEG})`}>
              <rect x={-90} y={-26} width={90} height={52} rx={12} fill="#2a355e" stroke={C.muted} strokeWidth={2} />
              <circle cx={0} cy={0} r={9} fill={XR} />
            </g>
            <Label x={tube[0] - 40} y={tube[1] + 60} size={22} color={C.muted} opacity={1}>
              sinar-X Cu
            </Label>
            <g transform={`translate(${det[0]} ${det[1]}) rotate(${-th3 / DEG})`}>
              <rect x={0} y={-24} width={80} height={48} rx={10} fill="#2a355e" stroke={C.muted} strokeWidth={2} />
              <rect x={6} y={-18} width={12} height={36} rx={4} fill={XR} opacity={0.2 + 0.8 * Inow} />
            </g>
            <Glow x={det[0]} y={det[1]} r={120} color="spr" opacity={Inow} />
            <Label x={det[0] + 40} y={det[1] + 58} size={22} color={C.muted}>
              detektor
            </Label>
            {/* sudut 2θ */}
            <line x1={G[0]} y1={G[1]} x2={G[0] + 190 * Math.cos(th3)} y2={G[1] + 190 * Math.sin(th3)} stroke={XR} strokeWidth={2} strokeDasharray="6 6" opacity={0.5} />
            <path
              d={`M${G[0] + 150 * Math.cos(th3)},${G[1] + 150 * Math.sin(th3)} A150,150 0 0 0 ${G[0] + 150 * Math.cos(th3)},${G[1] - 150 * Math.sin(th3)}`}
              fill="none"
              stroke={C.gold}
              strokeWidth={3}
            />
            <Label x={G[0] + 200} y={G[1] + 4} size={26} color={C.gold} weight={700}>
              2θ
            </Label>
            {/* grafik intensitas */}
            <line x1={PX0} y1={PY0} x2={PX1 + 10} y2={PY0} stroke={C.muted} strokeWidth={2} />
            <line x1={PX0} y1={PY0} x2={PX0} y2={PY0 - PH - 20} stroke={C.muted} strokeWidth={2} />
            {[20, 30, 40, 50].map((a) => (
              <g key={a}>
                <line x1={tt2x(a)} y1={PY0} x2={tt2x(a)} y2={PY0 + 10} stroke={C.muted} strokeWidth={2} />
                <Label x={tt2x(a)} y={PY0 + 30} size={20} color={C.muted} font="mono">
                  {a}°
                </Label>
              </g>
            ))}
            <Label x={PX1 - 10} y={PY0 + 64} size={22} color={C.gold} anchor="end" weight={600}>
              sudut 2θ
            </Label>
            <Label x={PX0 + 14} y={PY0 - PH - 30} size={22} color={C.muted} anchor="start">
              intensitas
            </Label>
            {plotPts.length > 1 ? (
              <>
                <path d={`${smoothPath(plotPts)} L${plotPts[plotPts.length - 1][0]},${PY0} L${PX0},${PY0} Z`} fill={XR} opacity={0.08} />
                <path d={smoothPath(plotPts)} fill="none" stroke={XR} strokeOpacity={0.25} strokeWidth={9} />
                <path d={smoothPath(plotPts)} fill="none" stroke={XR} strokeWidth={3} />
                <circle cx={tt2x(tt2)} cy={PY0 - PH * Inow} r={7} fill="#fff" />
              </>
            ) : null}
            <g opacity={peakOn}>
              <line x1={tt2x(31.7)} y1={PY0 - PH - 6} x2={tt2x(31.7)} y2={PY0} stroke={C.gold} strokeWidth={1.5} strokeDasharray="4 6" opacity={0.6} />
              <Label x={tt2x(31.7) + 16} y={PY0 - PH + 10} size={26} color={C.gold} anchor="start" weight={700}>
                2θ ≈ 31,7°
              </Label>
              <Label x={tt2x(31.7) + 16} y={PY0 - PH + 46} size={22} color={C.muted} anchor="start">
                θ ≈ 16°
              </Label>
            </g>
            <Ripple x={tt2x(31.7)} y={PY0 - PH} p={ramp(t, tEnam - 0.1, tEnam + 1.3)} r={120} color="gold" />
            <Ripple x={det[0]} y={det[1]} p={ramp(t, tEnam - 0.1, tEnam + 1.3)} r={140} color="spr" />
            <Motes x={G[0]} y={G[1] - 120} rx={300} ry={200} n={10} color="spr" opacity={0.3} seed={11} />
          </Stage>
          <Badge x={G[0]} y={238} text="Cu Kα: λ = 0,154 nm" color={XR} opacity={cuOn} size={26} />
          <Formula x={1290} y={258} p={card3} accent={C.gold} size={56} caption={<>θ ≈ 16° → puncak pada 2θ ≈ 31,7°</>}>
            sin <V color={C.gold}>θ</V> = <Frac n={<V color={C.press}>λ</V>} d={<>2<V>d</V></>} /> = <Frac n="0,154" d="2 × 0,282" /> ≈ <Tint c={C.gold}>0,273</Tint>
          </Formula>
        </AbsoluteFill>
      ) : null}

      {/* ===================== fase 4: pola titik → struktur ===================== */}
      {ph4 > 0.001 ? (
        <AbsoluteFill style={{opacity: ph4}}>
          <Stage>
            {/* film pola titik (NaCl, simetri lipat empat) */}
            <circle cx={520} cy={520} r={250} fill="#060914" stroke={C.faint} strokeWidth={3} />
            <circle cx={520} cy={520} r={250} fill="url(#soft-spr)" opacity={0.25} />
            {spots.map((s) => (
              <g key={s.i} opacity={s.op}>
                <circle cx={s.x} cy={s.y} r={s.r * 2.6} fill="url(#soft-spr)" />
                <circle cx={s.x} cy={s.y} r={s.r * 0.75} fill="#f3eeff" />
              </g>
            ))}
            <circle cx={520} cy={520} r={16} fill="#1f2a50" stroke={C.muted} strokeWidth={2} />
            <Label x={520} y={812} size={26} color={C.ink} weight={600} opacity={0.4 + 0.6 * salt}>
              garam (NaCl)
            </Label>
            <Twinkles x={520} y={520} rx={200} ry={200} n={6} color="spr" seed={5} />
            {/* protein (pita heliks) */}
            <g opacity={protOn} transform={`translate(950 520) rotate(${6 * Math.sin(t * 0.5)}) translate(-950 -520)`}>
              <path
                d={smoothPath(
                  Array.from({length: 90}, (_, i) => {
                    const s = i / 89;
                    const bx = 860 + 180 * s + 30 * Math.sin(s * 5);
                    const by = 400 + 240 * Math.sin(s * Math.PI * 1.4) * 0.5 + 120 * s;
                    return [bx + 26 * Math.cos(s * 38 + t * 1.4), by + 26 * Math.sin(s * 38 + t * 1.4) * 0.5] as [number, number];
                  }),
                )}
                fill="none"
                stroke="url(#xr-prot)"
                strokeWidth={9}
                strokeLinecap="round"
                opacity={0.9}
              />
              <Label x={950} y={812} size={26} color={C.ink} weight={600}>
                protein
              </Label>
            </g>
            {/* DNA heliks ganda */}
            <g opacity={dnaOn}>
              {rungs.map((y, i) => {
                const a = 1330 + 78 * Math.sin((TAU * (y - 280)) / 255 + t * 1.1);
                const b = 1330 + 78 * Math.sin((TAU * (y - 280)) / 255 + t * 1.1 + 0.78 * Math.PI);
                return <line key={i} x1={a} y1={y} x2={b} y2={y} stroke={i % 2 ? C.gold : C.press} strokeWidth={4} opacity={0.55} />;
              })}
              {[0, 1].map((s) => (
                <g key={s}>
                  <path d={smoothPath(helix(s))} fill="none" stroke={s ? C.spr : C.cyan} strokeOpacity={0.25} strokeWidth={16} />
                  <path d={smoothPath(helix(s))} fill="none" stroke={s ? C.spr : C.cyan} strokeWidth={6} />
                </g>
              ))}
              <Label x={1330} y={812} size={26} color={C.ink} weight={700}>
                DNA
              </Label>
              {/* pola "X" difraksi heliks (foto 51) */}
              <circle cx={1630} cy={530} r={115} fill="#060914" stroke={C.faint} strokeWidth={2} />
              {Array.from({length: 7}, (_, m) => m - 3)
                .filter((m) => m !== 0)
                .flatMap((m) => [-1, 1].map((sx) => ({m, sx})))
                .map(({m, sx}, i) => (
                  <ellipse key={i} cx={1630 + sx * Math.abs(m) * 13} cy={530 + m * 26} rx={7} ry={4} fill="#efe8ff" opacity={(0.5 + 0.4 * Math.sin(t * 2 + i)) * (Math.abs(m) === 3 ? 0.35 : 1)} />
                ))}
              <Label x={1630} y={672} size={20} color={C.muted}>
                "foto 51" · 1952
              </Label>
            </g>
            <Stream pts={[[780, 450], [860, 450]]} color="spr" n={4} speed={0.6} r={3} opacity={protOn * 0.6} />
            <Motes x={1000} y={520} rx={760} ry={300} n={14} color="spr" opacity={0.3} seed={12} />
          </Stage>
          <Note x={960} y={215} p={dnaOn} color={C.spr} size={26}>
            pola titik terang → susunan atom
          </Note>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

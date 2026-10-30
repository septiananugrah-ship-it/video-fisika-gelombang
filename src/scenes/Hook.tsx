import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp, rand, win} from '../anim';
import {Spring} from '../components/physics';
import {Glow, Label, Motes, Ripple, Stage, Twinkles} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Pembuka: tiga osilator yang dihitung analitik per frame.
// (A) pegas–balok: ditarik lalu dilepas, x = A cos ω(t − tr), T = 1,5 dtk;
// (B) bandul jam: θ = θ₀ cos(2πt/T), T = 2 dtk (L = 1 m → T ≈ 2 s, AUDIT), jarum detik berdetak tiap ayunan;
// (C) molekul HCl bergetar mengitari pusat massa (H bergerak 35× lebih jauh daripada Cl), diperlambat
//     ("gerak lambat"; aslinya ≈ 9×10¹³ kali/detik, AUDIT hook);
// lalu ketiganya berjajar dengan jejak x–t masing-masing → kata "osilasi" → sinar IR diserap molekul →
// sumur parabola dengan anak tangga tingkat energi (petunjuk kuantum).

// ---- pegas ----
const SA = 120;
const STP = 1.5;
// ---- bandul ----
const PL = 300;
const PTH = 0.3;
const PTP = 2.0;
// ---- molekul ----
const MF = 1.3; // Hz tampilan (gerak lambat)
const MS = 24; // amplitudo regang ikatan (px)
const FH = 34.969 / (34.969 + 1.008); // bagian H dari regangan
const FCL = 1.008 / (34.969 + 1.008);

const springX = (t: number, t0: number, tr: number) => (t < tr ? SA * ramp(t, t0, tr - 0.15, EASE_IN_OUT) : SA * Math.cos(((2 * Math.PI) / STP) * (t - tr)));
const pendTh = (t: number) => PTH * Math.cos(((2 * Math.PI) / PTP) * t);
const molS = (t: number, amp = MS) => amp * Math.cos(2 * Math.PI * MF * t);

const Block: React.FC<{x: number}> = ({x}) => (
  <g>
    <ellipse cx={x} cy={48} rx={60} ry={6} fill="#000" opacity={0.4} />
    <rect x={x - 55} y={-45} width={110} height={90} rx={12} fill="url(#crate)" stroke={C.ink} strokeOpacity={0.55} strokeWidth={2.5} />
    <rect x={x - 46} y={-37} width={92} height={9} rx={4.5} fill="#fff" opacity={0.1} />
  </g>
);

const SpringRig: React.FC<{x: number; v: number; hand: number}> = ({x, v, hand}) => (
  <g>
    <rect x={-360} y={45} width={640} height={50} fill="url(#ground)" />
    <line x1={-360} y1={45} x2={280} y2={45} stroke="#7d89b5" strokeWidth={4} />
    <rect x={-372} y={-90} width={34} height={135} fill="#1a2550" stroke="#7d89b5" strokeWidth={3} />
    {Array.from({length: 6}, (_, i) => (
      <line key={i} x1={-372} y1={-80 + i * 22} x2={-342} y2={-92 + i * 22} stroke="#56628f" strokeWidth={2} />
    ))}
    <line x1={0} y1={-70} x2={0} y2={70} stroke={C.gold} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 8" />
    <Spring xa={-338} xb={x - 55} y={0} coils={10} amp={22} color={C.spr} width={5} />
    <Block x={x} />
    {/* garis gerak di belakang balok cepat */}
    {[0, 1, 2].map((j) => {
      return (
        <line
          key={j}
          x1={x - Math.sign(v) * (66 + j * 6)}
          y1={-22 + j * 22}
          x2={x - Math.sign(v) * (92 + j * 14)}
          y2={-22 + j * 22}
          stroke="#cfe0ff"
          strokeOpacity={0.3 * Math.min(1, Math.abs(v) / 450) * (1 - hand)}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      );
    })}
    {/* tangan yang menarik */}
    <g opacity={hand} transform={`translate(${x + 55} 0)`}>
      <line x1={0} y1={0} x2={30} y2={0} stroke={C.muted} strokeWidth={3} />
      <path d="M30,-5 C38,-22 58,-26 72,-19 L104,-19 L104,19 L72,19 C58,26 38,22 30,5 Z" fill="#2a3768" stroke={C.cyan} strokeOpacity={0.7} strokeWidth={2.5} />
      <rect x={104} y={-22} width={34} height={44} rx={7} fill="#1d2754" stroke={C.cyan} strokeOpacity={0.4} strokeWidth={2} />
    </g>
  </g>
);

const Pendulum: React.FC<{t: number; t1: number}> = ({t, t1}) => {
  const th = pendTh(t);
  const bx = PL * Math.sin(th);
  const by = -230 + PL * Math.cos(th);
  // jarum detik berdetak tiap setengah periode (saat bandul di simpangan terjauh), bergerak halus singkat
  const k = (t - t1) / (PTP / 2);
  const n = Math.floor(k);
  const f = k - n;
  const step = n + Math.min(1, f / 0.12) ** 2 * (3 - 2 * Math.min(1, f / 0.12));
  const ang = (step * 6 * Math.PI) / 180;
  const tickP = f / 0.5;
  return (
    <g>
      {/* rumah jam */}
      <path d="M-120,110 L-120,-300 Q-120,-370 0,-380 Q120,-370 120,-300 L120,110 Z" fill="rgba(26,37,80,0.55)" stroke="#7d89b5" strokeWidth={3} />
      <path d="M-104,104 L-104,-226 L104,-226 L104,104 Z" fill="rgba(7,11,24,0.55)" stroke="#56628f" strokeWidth={2} />
      {/* dial */}
      <circle cx={0} cy={-300} r={56} fill="#0e1736" stroke={C.gold} strokeOpacity={0.8} strokeWidth={3} />
      {Array.from({length: 12}, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={46 * Math.sin(a)} y1={-300 - 46 * Math.cos(a)} x2={52 * Math.sin(a)} y2={-300 - 52 * Math.cos(a)} stroke={C.gold} strokeWidth={2.5} opacity={0.8} />;
      })}
      <line x1={0} y1={-300} x2={26 * Math.sin(1.1 + t * 0.01)} y2={-300 - 26 * Math.cos(1.1 + t * 0.01)} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      <line x1={0} y1={-300} x2={44 * Math.sin(ang)} y2={-300 - 44 * Math.cos(ang)} stroke={C.press} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={0} cy={-300} r={4} fill={C.ink} />
      {/* bandul */}
      <circle cx={0} cy={-230} r={5} fill="#c9d3ee" />
      <line x1={0} y1={-230} x2={bx} y2={by} stroke="#c9d3ee" strokeWidth={3} />
      <circle cx={bx} cy={by} r={56} fill="url(#soft-gold)" opacity={0.5} />
      <circle cx={bx} cy={by} r={30} fill="url(#hk-bob)" stroke="#fff3c4" strokeOpacity={0.7} strokeWidth={2} />
      <circle cx={bx - 10} cy={by - 11} r={7} fill="#fff" opacity={0.6} />
      {/* busur ayunan */}
      <path d={`M${PL * Math.sin(-PTH)},${-230 + PL * Math.cos(-PTH)} Q0,${-230 + PL + 22} ${PL * Math.sin(PTH)},${-230 + PL * Math.cos(PTH)}`} fill="none" stroke={C.gold} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="4 8" />
      <Ripple x={0} y={-300} p={tickP} r={80} color="gold" rings={1} width={2} />
    </g>
  );
};

const Molecule: React.FC<{t: number; amp: number}> = ({t, amp}) => {
  const s = molS(t, amp);
  const xCl = -62 - FCL * s;
  const xH = 68 + FH * s;
  return (
    <g>
      <circle cx={0} cy={0} r={140} fill="url(#soft-work)" opacity={0.35} />
      <Spring xa={xCl + 40} xb={xH - 26} y={0} coils={5} amp={10} color={C.spr} width={4} />
      <circle cx={xCl} cy={0} r={44} fill="url(#hk-cl)" stroke="#bff5c9" strokeOpacity={0.6} strokeWidth={2} />
      <circle cx={xCl - 14} cy={-15} r={10} fill="#fff" opacity={0.45} />
      <circle cx={xH} cy={0} r={28} fill="url(#hk-h)" stroke="#fff" strokeOpacity={0.6} strokeWidth={2} />
      <circle cx={xH - 9} cy={-9} r={6} fill="#fff" opacity={0.7} />
      <text x={xCl} y={2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={28} fill="#0b2a16">
        Cl
      </text>
      <text x={xH} y={2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={24} fill="#1c2340">
        H
      </text>
    </g>
  );
};

/** Jejak x–t kecil yang tergambar langsung (pena di ujung kanan). */
const Strip: React.FC<{x: number; y: number; w: number; amp: number; f: (tt: number) => number; t: number; op: number; color?: string}> = ({x, y, w, amp, f, t, op, color = C.press}) => {
  if (op <= 0.01) return null;
  const span = 2.6;
  const pts = Array.from({length: 64}, (_, i) => {
    const tau = t - span + (span * i) / 63;
    return `${i ? 'L' : 'M'}${(x - w / 2 + (w * i) / 63).toFixed(1)},${(y - amp * f(tau)).toFixed(1)}`;
  }).join(' ');
  return (
    <g opacity={op}>
      <line x1={x - w / 2} y1={y} x2={x + w / 2} y2={y} stroke={C.line} strokeWidth={2} />
      <path d={pts} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={12} strokeLinejoin="round" />
      <path d={pts} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x + w / 2} cy={y - amp * f(t)} r={16} fill="url(#soft-press)" />
      <circle cx={x + w / 2} cy={y - amp * f(t)} r={6} fill="#fff" />
    </g>
  );
};

export const Hook: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const t0 = wordOf(0, 'tarik') - 0.1;
  const tr = wordOf(0, 'lepaskan') + 0.1;
  const sx = springX(t, t0, tr);
  const hand = ramp(t, t0 - 0.6, t0) * (1 - ramp(t, tr - 0.05, tr + 0.4, EASE_IN_OUT));

  // posisi tiap objek: "pahlawan" (besar) → panel berjajar
  const mS = ramp(t, cue(1) - 0.6, cue(1) + 0.7, EASE_IN_OUT);
  const mP = ramp(t, cue(2) - 0.6, cue(2) + 0.7, EASE_IN_OUT);
  const mM = ramp(t, cue(3) - 0.6, cue(3) + 0.7, EASE_IN_OUT);
  const sPos = {x: mix(1000, 400, mS), y: mix(540, 440, mS), s: mix(1.35, 0.78, mS)};
  const pPos = {x: mix(1060, 960, mP), y: mix(600, 500, mP), s: mix(1.0, 0.78, mP)};
  const mPos = {x: mix(1300, 1520, mM), y: mix(470, 430, mM), s: mix(1.9, 1.0, mM)};
  const pIn = ramp(t, cue(1) - 0.3, cue(1) + 0.6);
  const mIn = ramp(t, cue(2) - 0.3, cue(2) + 0.6);
  const focusM = win(t, cue(2) - 0.3, cue(3) - 0.2, 0.6, 0.8);
  const dimS = 1 - 0.55 * win(t, cue(1) + 0.3, cue(3) - 0.4, 0.6, 0.8);
  const dimP = 1 - 0.55 * focusM;
  const strips = win(t, cue(3) - 0.2, wordOf(4, 'osilasi') - 0.4, 0.7, 0.6);
  const word = ramp(t, wordOf(4, 'osilasi') - 0.2, wordOf(4, 'osilasi') + 0.5);
  const molHi = win(t, wordOf(5, 'molekul') - 0.3, dur, 0.6, 0.8);
  const irP = ramp(t, wordOf(5, 'inframerah') - 0.4, wordOf(5, 'inframerah') + 1.2, EASE_IN_OUT);
  const irOn = ramp(t, wordOf(5, 'inframerah') - 0.4, wordOf(5, 'inframerah'));
  const absorbed = ramp(t, wordOf(5, 'inframerah') + 0.8, wordOf(5, 'inframerah') + 1.6);
  const q = ramp(t, wordOf(5, 'kuantum') - 0.6, wordOf(5, 'kuantum') + 0.8);
  const pendFade = 1 - q;
  const push = 1 + 0.03 * ramp(t, -0.8, dur, EASE_IN_OUT);
  const intro = ramp(t, -0.6, 0.8);

  // sumur parabola (petunjuk kuantum)
  const BX = 960;
  const BB = 600;
  const BW = 270;
  const BT = 230;
  const cK = (BB - BT) / (BW * BW);
  const bowl = Array.from({length: 41}, (_, i) => {
    const dx = -BW + (2 * BW * i) / 40;
    return `${i ? 'L' : 'M'}${(BX + dx).toFixed(1)},${(BB - cK * dx * dx).toFixed(1)}`;
  }).join(' ');
  const rungs = [0, 1, 2, 3, 4].map((n) => {
    const y = BB - (n + 0.5) * 68;
    return {y, w: Math.sqrt((BB - y) / cK), n};
  });

  // molekul latar (tiap molekul bergetar)
  const field = Array.from({length: 14}, (_, i) => {
    const a = rand(i * 3.7) * Math.PI * 2;
    const rr = 430 + rand(i * 1.9) * 330;
    return {x: 1300 + rr * Math.cos(a) * 1.15, y: 500 + rr * Math.sin(a) * 0.55, r: rand(i * 5.1) * 360, ph: rand(i * 2.3) * 6, k: i};
  }).filter((m) => m.x > 120 && m.x < 1800 && m.y > 180 && m.y < 860);

  const irHead = mix(1880, mPos.x + 110, irP);
  const irPts = Array.from({length: 50}, (_, i) => {
    const X = irHead + ((1880 - irHead) * i) / 49;
    const env = Math.min(1, (X - irHead) / 50);
    return `${i ? 'L' : 'M'}${X.toFixed(1)},${(mPos.y + 18 * env * Math.sin((X - 1880) * 0.06 + t * 9)).toFixed(1)}`;
  }).join(' ');

  return (
    <AbsoluteFill style={{opacity: intro}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '960px 500px'}}>
        <Stage>
          <defs>
            <radialGradient id="hk-bob" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fff6d6" />
              <stop offset="45%" stopColor="#e0a93a" />
              <stop offset="100%" stopColor="#5a3b0e" />
            </radialGradient>
            <radialGradient id="hk-cl" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#c8ffd2" />
              <stop offset="50%" stopColor="#5fdc7a" />
              <stop offset="100%" stopColor="#1d5c2c" />
            </radialGradient>
            <radialGradient id="hk-h" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#dfe5f7" />
              <stop offset="100%" stopColor="#7b86a8" />
            </radialGradient>
          </defs>
          <Glow x={960} y={500} r={760} color="press" opacity={0.14} />
          <Motes x={960} y={500} rx={860} ry={330} n={30} color="gold" opacity={0.35} seed={21} />

          {/* molekul latar: setiap molekul bergetar */}
          <g opacity={0.32 * win(t, cue(2) - 0.2, cue(3) + 0.4, 0.8, 1.0)}>
            {field.map((m) => {
              const s = 7 * Math.cos(2 * Math.PI * MF * (t + m.ph));
              return (
                <g key={m.k} transform={`translate(${m.x} ${m.y}) rotate(${m.r}) scale(0.32)`}>
                  <circle cx={-62 - FCL * s * 3} cy={0} r={44} fill="#5fdc7a" />
                  <line x1={-20} y1={0} x2={40 + FH * s * 3} y2={0} stroke={C.spr} strokeWidth={8} />
                  <circle cx={68 + FH * s * 3} cy={0} r={28} fill="#dfe5f7" />
                </g>
              );
            })}
          </g>

          {/* sumur parabola + anak tangga tingkat energi (kuantum) */}
          <g opacity={q}>
            <Glow x={BX} y={BB - 120} r={330} color="work" opacity={0.3} />
            <path d={bowl} fill="none" stroke={C.spr} strokeOpacity={0.25} strokeWidth={16} />
            <path d={bowl} fill="none" stroke={C.spr} strokeWidth={4} />
            {rungs.map((r) => (
              <g key={r.n} opacity={ramp(t, wordOf(5, 'kuantum') - 0.4 + r.n * 0.18, wordOf(5, 'kuantum') + 0.2 + r.n * 0.18)}>
                <line x1={BX - r.w} y1={r.y} x2={BX + r.w} y2={r.y} stroke={C.work} strokeWidth={4} strokeLinecap="round" opacity={0.85 - r.n * 0.1} />
              </g>
            ))}
            <circle cx={BX + rungs[0].w * 0.8 * Math.sin(t * 2.6)} cy={rungs[0].y} r={22} fill="url(#soft-work)" />
            <circle cx={BX + rungs[0].w * 0.8 * Math.sin(t * 2.6)} cy={rungs[0].y} r={7} fill={C.work} />
            <Label x={BX + BW + 30} y={BT + 30} size={24} font="serif" italic color={C.work} anchor="start">
              E
            </Label>
            <Twinkles x={BX} y={BB - 180} rx={220} ry={130} n={5} color="work" opacity={0.8} seed={9} />
          </g>

          {/* (A) pegas */}
          <g transform={`translate(${sPos.x} ${sPos.y}) scale(${sPos.s})`} opacity={dimS}>
            <Glow x={0} y={0} r={300} color="spr" opacity={0.3} />
            <SpringRig x={sx} v={(springX(t + 1 / 60, t0, tr) - springX(t - 1 / 60, t0, tr)) * 30} hand={hand} />
          </g>
          {/* (B) bandul jam */}
          <g transform={`translate(${pPos.x} ${pPos.y}) scale(${pPos.s})`} opacity={pIn * dimP * pendFade}>
            <Pendulum t={t - cue(1) + 0.3} t1={0} />
          </g>
          {/* (C) molekul HCl */}
          <g transform={`translate(${mPos.x} ${mPos.y}) scale(${mPos.s})`} opacity={mIn}>
            <circle cx={0} cy={0} r={150} fill="url(#soft-heat)" opacity={0.6 * molHi + 0.6 * absorbed * irOn} />
            <Molecule t={t} amp={MS * (1 + 0.35 * absorbed)} />
          </g>
          <Ripple x={mPos.x} y={mPos.y} p={ramp(t, wordOf(5, 'molekul') - 0.2, wordOf(5, 'molekul') + 1.2, (z) => z)} r={180} color="work" rings={2} />
          <Ripple x={mPos.x} y={mPos.y} p={ramp(t, wordOf(5, 'inframerah') + 0.7, wordOf(5, 'inframerah') + 2.0, (z) => z)} r={200} color="heat" rings={2} />
          {/* sinar IR */}
          <g opacity={irOn * (1 - absorbed * 0.7)}>
            <path d={irPts} fill="none" stroke={C.heat} strokeOpacity={0.25} strokeWidth={14} />
            <path d={irPts} fill="none" stroke={C.heat} strokeWidth={4} strokeLinecap="round" />
            <Label x={1760} y={mPos.y + 56} size={22} color={C.heat} font="mono" opacity={1 - absorbed}>
              IR
            </Label>
          </g>
          {/* label molekul */}
          <g opacity={mIn}>
            <g opacity={1 - mM}>
              <rect x={mPos.x - 120} y={mPos.y + 112} width={240} height={42} rx={21} fill="rgba(10,16,36,0.85)" stroke={C.heat} strokeOpacity={0.6} strokeWidth={2} />
              <text x={mPos.x} y={mPos.y + 134} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={22} fill={C.heat}>
                ◷ gerak lambat
              </text>
              <Label x={mPos.x} y={mPos.y + 186} size={24} color={C.muted} font="sans">
                aslinya ≈ 9 × 10¹³ getaran per detik
              </Label>
            </g>
            <Label x={mPos.x} y={mPos.y + 100} size={20} color={C.heat} font="mono" opacity={mM}>
              HCl · gerak lambat
            </Label>
          </g>

          {/* jejak x–t tiap osilator */}
          <Strip x={400} y={690} w={340} amp={42} f={(tt) => springX(tt, t0, tr) / SA} t={t} op={strips} />
          <Strip x={960} y={690} w={340} amp={42} f={(tt) => Math.sin(pendTh(tt - cue(1) + 0.3)) / Math.sin(PTH)} t={t} op={strips} />
          <Strip x={1520} y={690} w={340} amp={42} f={(tt) => molS(tt, 1)} t={t} op={strips} />
          <g opacity={strips}>
            {[400, 960, 1520].map((x, i) => (
              <Label key={i} x={x - 170} y={636} size={20} font="serif" italic color={C.press} anchor="start">
                {['x', 'θ', 'r'][i]}
              </Label>
            ))}
          </g>

          {/* garis kosinus emas di bawah kata "osilasi" */}
          <g opacity={word}>
            {(() => {
              const w = 560 * ramp(t, wordOf(4, 'osilasi') - 0.1, wordOf(4, 'osilasi') + 1.2, EASE_IN_OUT);
              if (w < 4) return null;
              const d = Array.from({length: 61}, (_, i) => {
                const X = 960 - w + (2 * w * i) / 60;
                const e = Math.cos(((X - 960) / 560) * (Math.PI / 2));
                return `${i ? 'L' : 'M'}${X.toFixed(1)},${(830 + 16 * e * Math.cos((X - 960) * 0.045 - t * 5)).toFixed(1)}`;
              }).join(' ');
              return (
                <>
                  <path d={d} fill="none" stroke={C.gold} strokeOpacity={0.25} strokeWidth={12} />
                  <path d={d} fill="none" stroke={C.gold} strokeWidth={3.5} strokeLinecap="round" />
                </>
              );
            })()}
          </g>
          <Ripple x={960} y={730} p={ramp(t, wordOf(4, 'osilasi') - 0.1, wordOf(4, 'osilasi') + 1.4, (z) => z)} r={520} color="gold" rings={2} width={2} />
        </Stage>
      </AbsoluteFill>
      {/* kata "osilasi": huruf mengikuti gelombang kosinus */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', opacity: word}}>
        {'osilasi'.split('').map((ch, i) => {
          const p = ramp(t, wordOf(4, 'osilasi') - 0.2 + i * 0.05, wordOf(4, 'osilasi') + 0.5 + i * 0.05);
          const bob = 10 * Math.cos(t * 3.2 - i * 0.7);
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT.head,
                fontWeight: 700,
                fontSize: 128,
                letterSpacing: 2,
                display: 'inline-block',
                color: C.ink,
                opacity: p,
                translate: `0px ${(1 - p) * 40 + bob}px`,
                textShadow: `0 0 ${36 + 12 * Math.sin(t * 2 + i)}px rgba(255,111,174,0.55)`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};


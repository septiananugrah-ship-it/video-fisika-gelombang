import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, pathOf, ramp, win} from '../anim';
import {Badge, Formula, Glow, Label, Motes, Note, Ripple, Spark, Stage, Sub, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Superposisi dua pulsa: toska (dari kiri, ke kanan) dan ungu (dari kanan, ke kiri).
// Dua lintasan atas = tiap pulsa "sendirian"; tali bawah = jumlah persisnya y = y₁ + y₂ (putih).
// Tiap lintasan pulsa memakai jam lambat di sekitar titik temu (d = aτ + bτ³, sama untuk kedua pulsa → "gerak lambat").
// Lintasan: 1 & 2 puncak+puncak (konstruktif), 3 puncak+lembah (destruktif, identik → tepat nol), 4 bentuk berbeda.

const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));

const RX0 = 230;
const RX1 = 1690;
const MX = 960;
const T1 = 270;
const T2 = 405;
const SY = 620;
const AP = 58;
const AA = 55;
const BB = 29.4; // sebelum/sesudah temu: cepat masuk & keluar

type Pass = {m: number; s: number; w1: number; w2: number; a1: number; a2: number; bOut?: number};

// jarak tiap pulsa dari titik temu; bOut kecil = setelah temu bergerak lebih lama di layar (tetap kontinu, kemiringan sama di τ = 0)
const dOf = (tau: number, bOut = BB) => {
  const b = tau < 0 ? BB : bOut;
  const q = Math.max(-3.2, Math.min(tau < 0 ? 3.2 : 7, tau));
  return AA * q + b * q * q * q;
};

export const Interference: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  const passes: Pass[] = [
    {m: cue(1) + 1.3, s: 1, w1: 60, w2: 60, a1: 1, a2: 1},
    {m: wordOf(2, 'menguatkan'), s: 1, w1: 60, w2: 60, a1: 1, a2: 1},
    {m: wordOf(3, 'meniadakan'), s: -1, w1: 60, w2: 60, a1: 1, a2: 1},
    {m: cue(4) + 1.4, s: 1, w1: 78, w2: 36, a1: 0.85, a2: 1.15, bOut: 3.5},
  ];

  const intro = ramp(t, -0.6, 0.8);
  const taper = (X: number) => Math.max(0, Math.min(1, (X - RX0) / 40, (RX1 - X) / 40));
  const y1 = (X: number) => passes.reduce((acc, p) => {
    const c = MX + dOf(t - p.m, p.bOut);
    const d = (X - c) / p.w1;
    return acc + p.a1 * Math.exp(-d * d);
  }, 0) * taper(X);
  const y2 = (X: number) => passes.reduce((acc, p) => {
    const c = MX - dOf(t - p.m, p.bOut);
    const d = (X - c) / p.w2;
    return acc + p.s * p.a2 * Math.exp(-d * d);
  }, 0) * taper(X);

  const N = 220;
  const xs = Array.from({length: N + 1}, (_, i) => RX0 + ((RX1 - RX0) * i) / N);
  const v1 = xs.map(y1);
  const v2 = xs.map(y2);
  const p1 = pathOf(xs.map((X, i) => [X, T1 - AP * v1[i] * intro]));
  const p2 = pathOf(xs.map((X, i) => [X, T2 - AP * v2[i] * intro]));
  const s1 = pathOf(xs.map((X, i) => [X, SY - AP * v1[i] * intro]));
  const s2 = pathOf(xs.map((X, i) => [X, SY - AP * v2[i] * intro]));
  const sum = pathOf(xs.map((X, i) => [X, SY - AP * (v1[i] + v2[i]) * intro]));

  // gerak lambat di sekitar titik temu
  const slow = Math.max(...passes.map((p) => Math.max(0, 1 - Math.abs(t - p.m) / 1.7)));
  const slowOp = Math.min(1, slow * 2.2);

  // jadwal
  const card = slot(t, wordOf(1, 'dijumlahkan') - 0.4, cue(2) - 0.1);
  const stackOn = win(t, wordOf(1, 'bertemu') - 0.4, cue(4) - 0.2, 0.5, 0.7);
  const konP = slot(t, wordOf(2, 'konstruktif') - 0.4, cue(3) - 0.1);
  const desP = slot(t, wordOf(3, 'destruktif') - 0.4, cue(4) - 0.1);
  const endP = slot(t, wordOf(4, 'melanjutkan') - 0.3, dur + 2);
  const dashOn = ramp(t, cue(4) + 0.4, cue(4) + 1.2);
  const push = 1 + 0.025 * ramp(t, -0.8, dur, EASE_IN_OUT);

  // panah susun di titik temu
  const a1v = y1(MX) * AP * intro;
  const a2v = y2(MX) * AP * intro;

  const m2 = passes[1].m;
  const m3 = passes[2].m;

  // pulsa terdepan (untuk percik)
  const lead = passes.map((p) => ({c1: MX + dOf(t - p.m, p.bOut), c2: MX - dOf(t - p.m, p.bOut), p}));

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '960px 500px'}}>
        <Stage>
          <Glow x={MX} y={SY} r={520} color="white" opacity={0.08 * intro} />
          <Glow x={MX} y={SY - 100} r={220} color="gold" opacity={0.5 * Math.max(0, 1 - Math.abs(t - m2) / 0.9)} />
          <Glow x={MX} y={SY} r={220} color="heat" opacity={0.45 * Math.max(0, 1 - Math.abs(t - m3) / 0.9)} />
          <Motes x={MX} y={450} rx={720} ry={250} n={24} color="cyan" opacity={0.3 * intro} seed={11} />
          <Motes x={MX} y={450} rx={720} ry={250} n={18} color="spr" opacity={0.3 * intro} seed={4} />

          {/* lintasan "sendirian" */}
          <g opacity={intro}>
            <line x1={RX0} y1={T1} x2={RX1} y2={T1} stroke={C.cyan} strokeOpacity={0.22} strokeWidth={2} strokeDasharray="5 9" />
            <line x1={RX0} y1={T2} x2={RX1} y2={T2} stroke={C.spr} strokeOpacity={0.22} strokeWidth={2} strokeDasharray="5 9" />
            <Label x={RX0 - 30} y={T1} size={32} font="serif" italic color={C.cyan} anchor="end">
              y<tspan baselineShift="sub" fontSize="0.65em">1</tspan>
            </Label>
            <Label x={RX0 - 30} y={T2} size={32} font="serif" italic color={C.spr} anchor="end">
              y<tspan baselineShift="sub" fontSize="0.65em">2</tspan>
            </Label>
            <Label x={RX1} y={T1 + 32} size={20} color={C.muted} font="sans" anchor="end">
              gelombang 1 sendirian
            </Label>
            <Label x={RX1} y={T2 + 32} size={20} color={C.muted} font="sans" anchor="end">
              gelombang 2 sendirian
            </Label>
            <path d={p1} fill="none" stroke={C.cyan} strokeOpacity={0.22} strokeWidth={13} strokeLinecap="round" />
            <path d={p1} fill="none" stroke={C.cyan} strokeWidth={4} strokeLinecap="round" />
            <path d={p2} fill="none" stroke={C.spr} strokeOpacity={0.22} strokeWidth={13} strokeLinecap="round" />
            <path d={p2} fill="none" stroke={C.spr} strokeWidth={4} strokeLinecap="round" />
          </g>

          {/* garis temu */}
          <line x1={MX} y1={T1 - 90} x2={MX} y2={SY + 90} stroke={C.ink} strokeOpacity={0.28 * stackOn} strokeWidth={2} strokeDasharray="4 8" />

          {/* tali sebenarnya */}
          <g opacity={intro}>
            <Label x={RX0 - 30} y={SY} size={30} font="serif" italic color={C.white} anchor="end">
              y
            </Label>
            <Label x={RX1} y={SY + 44} size={20} color={C.muted} font="sans" anchor="end">
              tali sebenarnya = jumlahnya
            </Label>
            <rect x={RX0 - 22} y={SY - 16} width={20} height={32} rx={6} fill="#2a3768" stroke={C.ink} strokeOpacity={0.5} strokeWidth={2} />
            <rect x={RX1 + 2} y={SY - 16} width={20} height={32} rx={6} fill="#2a3768" stroke={C.ink} strokeOpacity={0.5} strokeWidth={2} />
            <path d={s1} fill="none" stroke={C.cyan} strokeOpacity={0.45 * (1 - dashOn)} strokeWidth={12} strokeLinecap="round" />
            <path d={s2} fill="none" stroke={C.spr} strokeOpacity={0.45 * (1 - dashOn)} strokeWidth={12} strokeLinecap="round" />
            <path d={sum} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={16} strokeLinecap="round" />
            <path d={sum} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
            <g opacity={dashOn}>
              <path d={s1} fill="none" stroke={C.cyan} strokeWidth={3} strokeDasharray="8 8" transform="translate(0 -10)" />
              <path d={s2} fill="none" stroke={C.spr} strokeWidth={3} strokeDasharray="8 8" transform="translate(0 -10)" />
            </g>
          </g>

          {/* panah susun y₁ + y₂ di titik temu */}
          <g opacity={stackOn}>
            <line x1={MX - 14} y1={SY} x2={MX - 14} y2={SY - a1v} stroke={C.cyan} strokeWidth={5} opacity={Math.min(1, Math.abs(a1v) / 10)} markerEnd="url(#arrow-cyan)" />
            <line x1={MX + 14} y1={SY - a1v} x2={MX + 14} y2={SY - a1v - a2v} stroke={C.spr} strokeWidth={5} opacity={Math.min(1, Math.abs(a2v) / 10)} markerEnd="url(#arrow-spr)" />
            <circle cx={MX} cy={SY - a1v - a2v} r={8} fill="#fff" />
          </g>

          {/* percik pada puncak pulsa */}
          {lead.map((l, i) => (
            <g key={i}>
              <Spark x={l.c1} y={T1 - AP * l.p.a1 * intro} r={5} color="cyan" opacity={taper(l.c1) * 0.9} />
              <Spark x={l.c2} y={T2 - AP * l.p.s * l.p.a2 * intro} r={5} color="spr" opacity={taper(l.c2) * 0.9} />
            </g>
          ))}

          <Ripple x={MX} y={SY - 2 * AP} p={ramp(t, m2 - 0.2, m2 + 1.2, (q) => q)} r={170} color="gold" />
          <Ripple x={MX} y={SY} p={ramp(t, m3 - 0.2, m3 + 1.2, (q) => q)} r={170} color="heat" />
          <Label x={MX + 84} y={SY - 2 * AP - 8} size={26} color={C.gold} font="head" weight={600} anchor="start" opacity={win(t, m2 - 0.3, m2 + 0.6, 0.3, 0.6)}>
            2× tinggi
          </Label>
          <Label x={MX + 70} y={SY + 40} size={26} color={C.heat} font="head" weight={600} anchor="start" opacity={win(t, m3 - 0.3, m3 + 0.6, 0.3, 0.6)}>
            y = 0
          </Label>
          <Twinkles x={MX} y={SY - 40} rx={520} ry={80} n={6} color="white" opacity={endP} seed={9} />
        </Stage>
      </AbsoluteFill>

      <Badge x={1565} y={190} text="gerak lambat" color={C.muted} opacity={slowOp * intro} size={20} />
      <Formula x={MX} y={808} p={card} accent={C.white} size={60} caption="prinsip superposisi">
        <V>y</V> = <V color={C.cyan}>y</V>
        <Sub color={C.cyan}>1</Sub> + <V color={C.spr}>y</V>
        <Sub color={C.spr}>2</Sub>
      </Formula>
      <Note x={MX} y={808} p={konP} color={C.gold} size={32}>
        puncak + puncak → saling menguatkan: <b style={{color: C.gold}}>konstruktif</b>
      </Note>
      <Note x={MX} y={808} p={desP} color={C.heat} size={32}>
        puncak + lembah → saling meniadakan: <b style={{color: C.heat}}>destruktif</b>
      </Note>
      <Note x={MX} y={808} p={endP} color={C.ink} size={32}>
        setelah berpapasan: bentuk & arah tiap pulsa tetap
      </Note>
    </AbsoluteFill>
  );
};

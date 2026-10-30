import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {EASE_IN_OUT, cyc, ramp, rand} from '../anim';
import {Glow, Motes, Spark, Stage, Twinkles} from '../components/primitives';
import {SpringV} from '../components/physics';
import {BRAND} from '../brand';
import {useScene} from '../SceneContext';
import {C, FONT, type Hue} from '../theme';

const REFS = [
  'R. A. Serway & J. W. Jewett, Physics for Scientists and Engineers (bab Gelombang & Bunyi)',
  'D. Halliday, R. Resnick & J. Walker, Fundamentals of Physics (gelombang, interferensi, gelombang materi)',
  'A. G. Sarojo, Seri Fisika Dasar: Gelombang dan Optik',
  'P. Atkins & J. de Paula, Physical Chemistry (difraksi sinar-X, dualisme gelombang–partikel)',
  'CODATA (tetapan Planck) · ICDD (data difraksi NaCl)',
  'RPS Fisika Umum S1 Kimia UNESA (gelombang)',
];

// butir yang mengorbit logo (warna = kode warna osilasi: Us, v, F, x, K, redaman/panas)
const ORBIT: {hue: Hue; ph: number}[] = [
  {hue: 'spr', ph: 0},
  {hue: 'cyan', ph: 1.05},
  {hue: 'force', ph: 2.09},
  {hue: 'press', ph: 3.14},
  {hue: 'kin', ph: 4.19},
  {hue: 'heat', ph: 5.24},
];
const OC = {x: 960, y: 188, rx: 190, ry: 48, tilt: -14, sp: 0.5};

const orbitPt = (a: number): [number, number] => {
  const c = Math.cos((OC.tilt * Math.PI) / 180);
  const s = Math.sin((OC.tilt * Math.PI) / 180);
  const ex = OC.rx * Math.cos(a);
  const ey = OC.ry * Math.sin(a);
  return [OC.x + ex * c - ey * s, OC.y + ex * s + ey * c];
};

/** Motif kiri: dua bandul (panjang berbeda → periode berbeda, T ∝ √L) dengan jejak busur. */
const Pendulums: React.FC<{x: number; y: number; t: number; opacity: number}> = ({x, y, t, opacity}) => {
  if (opacity <= 0.001) return null;
  const top = y - 200;
  const items = [
    {px: x + 80, L: 150, T: 1.9, col: C.press, hue: 'press' as Hue, ph: 0},
    {px: x + 170, L: 100, T: 1.9 * Math.sqrt(100 / 150), col: C.gold, hue: 'gold' as Hue, ph: 1.2},
  ];
  return (
    <g opacity={opacity}>
      <Glow x={x + 125} y={y - 100} r={150} color="press" opacity={0.35} />
      <line x1={x + 10} y1={y} x2={x + 30} y2={top - 6} stroke="#5b6a9e" strokeWidth={5} strokeLinecap="round" />
      <line x1={x + 240} y1={y} x2={x + 220} y2={top - 6} stroke="#5b6a9e" strokeWidth={5} strokeLinecap="round" />
      <rect x={x + 20} y={top - 10} width={210} height={9} rx={4} fill="#8fa0d0" />
      <rect x={x - 6} y={y - 4} width={262} height={10} rx={4} fill="#26305a" stroke="#5b6a9e" strokeWidth={2} />
      {items.map((it) => {
        const th0 = 0.42;
        const th = th0 * Math.cos((2 * Math.PI * t) / it.T + it.ph);
        const bx = it.px + it.L * Math.sin(th);
        const by = top + it.L * Math.cos(th);
        const arc: string[] = [];
        for (let i = 0; i <= 16; i++) {
          const a = -th0 + (2 * th0 * i) / 16;
          arc.push(`${(it.px + it.L * Math.sin(a)).toFixed(1)},${(top + it.L * Math.cos(a)).toFixed(1)}`);
        }
        const trail = [1, 2, 3, 4].map((k): [number, number] => {
          const a = th0 * Math.cos((2 * Math.PI * (t - k * 0.04)) / it.T + it.ph);
          return [it.px + it.L * Math.sin(a), top + it.L * Math.cos(a)];
        });
        return (
          <g key={it.L}>
            <polyline points={arc.join(' ')} fill="none" stroke={it.col} strokeWidth={1.5} strokeDasharray="3 6" opacity={0.45} />
            <line x1={it.px} y1={top} x2={bx} y2={by} stroke="#c9d2ee" strokeWidth={2} opacity={0.85} />
            <ellipse cx={bx} cy={y - 8} rx={14} ry={3} fill="#000" opacity={0.3} />
            <Spark x={bx} y={by} r={11} color={it.hue} trail={trail} />
          </g>
        );
      })}
    </g>
  );
};

/** Motif kanan: pegas–balok tegak (x = A cos ωt) + molekul diatomik kecil yang bergetar (gerak lambat). */
const SpringMol: React.FC<{x: number; y: number; t: number; opacity: number}> = ({x, y, t, opacity}) => {
  if (opacity <= 0.001) return null;
  const top = y - 200;
  const w = 2 * Math.PI * 0.62;
  const dx = 26 * Math.cos(w * t);
  const by = top + 110 + dx;
  const v = -26 * w * Math.sin(w * t);
  const s = Math.sin(2 * Math.PI * 1.1 * t + 0.5);
  const mx = x + 190;
  const my = y - 70;
  const a = mx - 34 - 6 * s;
  const b = mx + 30 + 14 * s;
  return (
    <g opacity={opacity}>
      <Glow x={x + 120} y={y - 100} r={150} color="spr" opacity={0.4} />
      <rect x={x + 10} y={top - 10} width={130} height={9} rx={4} fill="#8fa0d0" />
      <line x1={x + 20} y1={y} x2={x + 26} y2={top - 6} stroke="#5b6a9e" strokeWidth={5} strokeLinecap="round" />
      <rect x={x - 6} y={y - 4} width={262} height={10} rx={4} fill="#26305a" stroke="#5b6a9e" strokeWidth={2} />
      <SpringV x={x + 80} ya={top} yb={by - 30} coils={7} amp={14} width={3.5} color={C.spr} />
      <rect x={x + 52} y={by - 30} width={56} height={52} rx={8} fill="url(#crate)" stroke={C.press} strokeWidth={2.5} />
      <line x1={x + 116} y1={by - 4} x2={x + 116} y2={by - 4 + v * 0.35} stroke={C.cyan} strokeWidth={3} strokeLinecap="round" opacity={Math.min(1, Math.abs(v) / 25)} />
      <line x1={x + 46} y1={top + 110} x2={x + 114} y2={top + 110} stroke={C.gold} strokeWidth={1.5} strokeDasharray="4 5" opacity={0.6} />
      {/* molekul */}
      <circle cx={(a + b) / 2} cy={my} r={60} fill="url(#soft-heat)" opacity={0.25 + 0.1 * s} />
      <line x1={a} y1={my} x2={b} y2={my} stroke={C.spr} strokeWidth={4} strokeDasharray="5 4" />
      <circle cx={a} cy={my} r={20} fill="#4fd68a" stroke="#c8ffe0" strokeWidth={2} />
      <circle cx={b} cy={my} r={10} fill="#eef3ff" />
      <circle cx={a - 6} cy={my - 7} r={5} fill="#fff" opacity={0.5} />
    </g>
  );
};

/** Penutup: logo SCIENTIAN, tagline, nama penyusun, rujukan, dan pil penutup seri (motif osilasi). */
export const Outro: React.FC = () => {
  const {t, dur} = useScene();
  const logo = ramp(t, 0.2, 1.6);
  const name = ramp(t, 1.4, 2.4);
  const by = ramp(t, 2.4, 3.4);
  const next = ramp(t, 6, 7);
  const motif = ramp(t, 1.0, 3.0);
  const out = 1 - ramp(t, dur - 1.6, dur - 0.1, EASE_IN_OUT);
  const orbitOn = ramp(t, 0.8, 2.2);
  const pts = ORBIT.map((o) => {
    const a = o.ph + t * OC.sp;
    const trail = [1, 2, 3, 4, 5].map((k) => orbitPt(a - k * 0.07));
    return {o, a, p: orbitPt(a), trail, front: Math.sin(a) > 0};
  });
  const ring = (front: boolean) =>
    pts
      .filter((q) => q.front === front)
      .map((q) => <Spark key={q.o.hue} x={q.p[0]} y={q.p[1]} r={5.25 + 1.25 * Math.sin(q.a)} color={q.o.hue} trail={q.trail} opacity={orbitOn * (0.8 + 0.2 * Math.sin(q.a))} />);
  const ellipseD = (() => {
    let d = '';
    for (let i = 0; i <= 48; i++) {
      const [x, y] = orbitPt((i / 48) * Math.PI * 2);
      d += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    return d;
  })();
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <Glow x={960} y={240} r={440} color="cyan" opacity={0.35 * logo} />
        <Glow x={960} y={188} r={200} color="spr" opacity={0.3 * logo} />
        <Motes x={960} y={300} rx={620} ry={260} n={40} color="cyan" opacity={0.45 * logo} seed={13} />
        {/* butir yang hanyut pelan sambil berosilasi (jejak sinus) */}
        {Array.from({length: 24}, (_, k) => {
          const p = ((((t + rand(k * 3.1) * 14) / (10 + 5 * rand(k))) % 1) + 1) % 1;
          const x = -40 + p * 2000;
          const base = 140 + rand(k * 5.3) * 780;
          const amp = 8 + 10 * rand(k * 2.2);
          const yAt = (xx: number) => base + amp * Math.sin(xx * 0.03 + k);
          const tail = [1, 2, 3, 4, 5, 6].map((j) => `${(x - j * 6).toFixed(1)},${yAt(x - j * 6).toFixed(1)}`);
          return (
            <g key={k} opacity={cyc(p) * 0.4 * logo}>
              <polyline points={`${x.toFixed(1)},${yAt(x).toFixed(1)} ${tail.join(' ')}`} fill="none" stroke="#e6d4ff" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
              <circle cx={x} cy={yAt(x)} r={2.4} fill="#fff" />
            </g>
          );
        })}
        <path d={ellipseD} fill="none" stroke={C.cyan} strokeOpacity={0.18 * orbitOn} strokeWidth={1.5} strokeDasharray="4 10" strokeDashoffset={-t * 14} />
        {ring(false)}
        <Pendulums x={110} y={860} t={t} opacity={0.85 * motif} />
        <SpringMol x={1560} y={860} t={t} opacity={0.85 * motif} />
        <Twinkles x={960} y={530} rx={360} ry={30} n={4} color="gold" opacity={by * 0.7} seed={17} />
      </Stage>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 70}}>
        <Img
          src={staticFile('scientian-logo.png')}
          style={{
            width: 230,
            height: 230,
            opacity: logo,
            scale: String((0.85 + 0.15 * logo) * (1 + 0.015 * Math.sin(t * 1.3))),
            rotate: `${(1 - logo) * -20}deg`,
          }}
        />
        <div style={{fontFamily: FONT.head, fontSize: 64, fontWeight: 700, letterSpacing: 16 + 6 * (1 - name), color: C.ink, marginTop: 4, opacity: name, textShadow: `0 0 ${18 + 8 * Math.sin(t * 1.6)}px ${C.cyan}55`}}>{BRAND.channel}</div>
        <div style={{fontFamily: FONT.head, fontSize: 28, color: C.muted, letterSpacing: 3, marginTop: 4, opacity: name}}>
          Explore <span style={{color: C.gold}}>Science</span> with Yayan
        </div>
        <div style={{marginTop: 34, fontFamily: FONT.sans, fontSize: 24, color: C.muted, opacity: by, letterSpacing: 2}}>DISUSUN OLEH</div>
        <div style={{fontFamily: FONT.head, fontSize: 46, fontWeight: 600, color: C.ink, opacity: by, marginTop: 2, translate: `0px ${(1 - by) * 12}px`}}>{BRAND.author}</div>
        <div style={{marginTop: 34, textAlign: 'center'}}>
          <div style={{fontFamily: FONT.mono, fontSize: 18, letterSpacing: 4, color: C.gold, marginBottom: 10, opacity: ramp(t, 3.4, 4.2)}}>RUJUKAN</div>
          {REFS.map((r, i) => {
            const o = ramp(t, 3.7 + i * 0.22, 4.6 + i * 0.22);
            return (
              <div key={r} style={{fontFamily: FONT.sans, fontSize: 21, color: C.muted, lineHeight: 1.55, opacity: o, translate: `0px ${(1 - o) * 10}px`}}>
                {r}
              </div>
            );
          })}
          <div style={{marginTop: 12, fontFamily: FONT.sans, fontSize: 19, color: C.muted, opacity: 0.85 * ramp(t, 5.2, 6.0)}}>
            Ilustrasi skematis · panjang gelombang tidak berskala kecuali disebut · bunyi di udara ≈ 340 m/s
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            fontFamily: FONT.head,
            fontSize: 30,
            color: C.ink,
            opacity: next,
            padding: '10px 28px',
            borderRadius: 999,
            border: `2px solid ${C.spr}`,
            background: 'rgba(10,16,36,0.85)',
            boxShadow: `0 0 ${16 + 12 * (0.5 + 0.5 * Math.sin(t * 2))}px ${C.spr}66`,
            translate: `0px ${(1 - next) * 14}px`,
          }}
        >
          <span style={{color: C.ink}}>{BRAND.next}</span>
        </div>
      </AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible'}}>
        {ring(true)}
      </svg>
    </AbsoluteFill>
  );
};

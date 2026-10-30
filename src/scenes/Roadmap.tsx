import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, ramp, smoothPath, win} from '../anim';
import {Spring} from '../components/physics';
import {Arrow, DrawPath, Glow, Motes, Ripple, Spark, Stage, Stream, pointAlong} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT, type Hue} from '../theme';

// Peta video: tiga kartu bagian dengan ikon yang terus bergerak (dihitung analitik):
// (1) balok pada pegas: x = A cos ωt, panah x merah muda dan gaya pemulih kuning F = −kx (selalu berlawanan),
// (2) molekul HCl bergetar mengitari pusat massa (gerak lambat) sambil menyerap gelombang inframerah,
// (3) jam berdetak + gedung tinggi bergoyang dengan bandul peredam di puncaknya;
// dihubungkan oleh lintasan tempat sebutir cahaya merambat.
const PARTS = [
  {n: '1', title: 'Konsep osilasi', color: C.cyan, hue: 'cyan' as Hue, items: ['Gaya pemulih', 'Gerak harmonik sederhana', 'Periode & frekuensi', 'Energi osilasi', 'Bandul', 'Redaman', 'Resonansi']},
  {n: '2', title: 'Osilasi di dunia kimia', color: C.spr, hue: 'spr' as Hue, items: ['Molekul sebagai pegas', 'Spektrum inframerah', 'Efek isotop', 'Jembatan ke kuantum']},
  {n: '3', title: 'Penerapan', color: C.work, hue: 'work' as Hue, items: ['Jam: bandul → kuarsa', 'Peredam kendaraan', 'Peredam gedung tinggi']},
];
const KEYS = [
  ['pemulih', 'harmonik', 'periode', 'energi', 'bandul', 'redaman', 'resonansi'],
  ['pegas', 'inframerah', 'isotop', 'kuantum'],
  ['jam', 'kendaraan', 'gedung'],
];
const CX = [380, 960, 1540];
const TOP = 196;
const CW = 500;
const CH = 600;
const PY = TOP + CH + 40;
const ICON_Y = TOP + 205;

const X0P = CX[0] - 200;
const X1P = CX[2] + 200;
const PTS: [number, number][] = Array.from({length: 61}, (_, i) => {
  const u = i / 60;
  const x = X0P + (X1P - X0P) * u;
  const y = PY + 9 * (1 - Math.cos(((x - CX[0]) / (CX[1] - CX[0])) * Math.PI * 2)) * (x > CX[0] && x < CX[2] ? 1 : 0.3);
  return [x, y];
});
const PTS_D = smoothPath(PTS);
const UX = CX.map((x) => (x - X0P) / (X1P - X0P));

/** Ikon tiap bagian (SVG, selalu bergerak). */
const Icon: React.FC<{i: number; x: number; y: number; t: number; act: number}> = ({i, x, y, t, act}) => {
  if (i === 0) {
    // balok pada pegas: x = A cos ωt (T = 1,6 dtk); F = −kx kuning, x merah muda
    const A = 70;
    const om = (2 * Math.PI) / 1.6;
    const dx = A * Math.cos(om * t);
    const eq = x + 30;
    const bx = eq + dx;
    const fl = y + 50;
    const wl = x - 200;
    return (
      <g>
        <Glow x={x} y={y} r={170} color="cyan" opacity={0.25 + 0.3 * act} />
        <rect x={wl - 6} y={fl} width={430} height={34} fill="url(#ground)" />
        <line x1={wl - 6} y1={fl} x2={x + 220} y2={fl} stroke="#7d89b5" strokeWidth={3} />
        <rect x={wl - 22} y={y - 70} width={22} height={120} fill="#1a2550" stroke="#7d89b5" strokeWidth={2.5} />
        <line x1={eq} y1={y - 80} x2={eq} y2={fl + 40} stroke={C.gold} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="5 7" />
        <Spring xa={wl} xb={bx - 40} y={y + 12} coils={8} amp={14} color={C.spr} width={4} />
        <rect x={bx - 40} y={y - 26} width={80} height={76} rx={10} fill="url(#crate)" stroke={C.ink} strokeOpacity={0.6} strokeWidth={2.5} />
        <Arrow x1={bx} y1={y - 50} x2={bx - 0.9 * dx} y2={y - 50} color="force" width={6} pulse={false} opacity={Math.min(1, Math.abs(dx) / 12)} />
        <Arrow x1={eq} y1={fl + 24} x2={bx} y2={fl + 24} color="press" width={5} pulse={false} opacity={Math.min(1, Math.abs(dx) / 12)} />
      </g>
    );
  }
  if (i === 1) {
    // HCl bergetar (gerak lambat): H bergerak 35× lebih jauh daripada Cl; gelombang IR datang dari kiri
    const s = 22 * Math.cos(2 * Math.PI * 1.2 * t);
    const xCl = x + 10 - 0.028 * s;
    const xH = x + 130 + 0.972 * s;
    const head = x - 40;
    const wave = Array.from({length: 48}, (_, k) => {
      const X = x - 230 + ((head - (x - 230)) * k) / 47;
      const env = Math.min(1, (X - (x - 230)) / 40) * Math.min(1, (head - X) / 30 + 0.2);
      return `${k ? 'L' : 'M'}${X.toFixed(1)},${(y + 16 * env * Math.sin((X - x) * 0.07 - t * 8)).toFixed(1)}`;
    }).join(' ');
    return (
      <g>
        <Glow x={x} y={y} r={170} color="spr" opacity={0.25 + 0.3 * act} />
        <path d={wave} fill="none" stroke={C.heat} strokeOpacity={0.25} strokeWidth={12} />
        <path d={wave} fill="none" stroke={C.heat} strokeWidth={3.5} strokeLinecap="round" />
        <circle cx={xCl} cy={y} r={70 + 8 * Math.sin(t * 7.5)} fill="url(#soft-heat)" opacity={0.6} />
        <Spring xa={xCl + 38} xb={xH - 24} y={y} coils={4} amp={9} color={C.spr} width={4} />
        <circle cx={xCl} cy={y} r={42} fill="#5fdc7a" stroke="#bff5c9" strokeOpacity={0.6} strokeWidth={2} />
        <circle cx={xCl - 13} cy={y - 14} r={9} fill="#fff" opacity={0.4} />
        <circle cx={xH} cy={y} r={26} fill="#e6ebf8" stroke="#fff" strokeWidth={2} />
        <circle cx={xH - 8} cy={y - 8} r={6} fill="#fff" />
        <text x={xCl} y={y + 2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={26} fill="#0b2a16">
          Cl
        </text>
        <text x={xH} y={y + 2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={22} fill="#1c2340">
          H
        </text>
        <text x={x + 60} y={y + 78} textAnchor="middle" fontFamily={FONT.mono} fontSize={20} fill={C.heat} opacity={0.85}>
          gerak lambat · IR
        </text>
      </g>
    );
  }
  // jam berdetak + gedung tinggi bergoyang dengan bandul peredam
  const k = t;
  const n = Math.floor(k);
  const f = Math.min(1, (k - n) / 0.14);
  const ang = ((n + f * f * (3 - 2 * f)) * 6 * Math.PI) / 180;
  const cx0 = x - 110;
  const cy0 = y - 6;
  const om = (2 * Math.PI) / 2.6;
  const sway = 7 * Math.sin(om * t);
  const ball = -16 * Math.sin(om * t - 0.4);
  const gx = x + 110;
  const gTop = y - 120;
  const gBot = y + 82;
  return (
    <g>
      <Glow x={x} y={y} r={170} color="work" opacity={0.25 + 0.3 * act} />
      <circle cx={cx0} cy={cy0} r={74} fill="#0e1736" stroke={C.work} strokeOpacity={0.8} strokeWidth={4} />
      {Array.from({length: 12}, (_, j) => {
        const a = (j / 12) * Math.PI * 2;
        return <line key={j} x1={cx0 + 60 * Math.sin(a)} y1={cy0 - 60 * Math.cos(a)} x2={cx0 + 68 * Math.sin(a)} y2={cy0 - 68 * Math.cos(a)} stroke={C.ink} strokeOpacity={0.7} strokeWidth={j % 3 === 0 ? 4 : 2} />;
      })}
      <line x1={cx0} y1={cy0} x2={cx0 + 34 * Math.sin(2.1 + t * 0.02)} y2={cy0 - 34 * Math.cos(2.1 + t * 0.02)} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      <line x1={cx0} y1={cy0} x2={cx0 + 58 * Math.sin(ang)} y2={cy0 - 58 * Math.cos(ang)} stroke={C.work} strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx0} cy={cy0} r={5} fill={C.ink} />
      <Ripple x={cx0} y={cy0} p={(k - n) / 0.6} r={110} color="work" rings={1} width={2} />
      {/* gedung (miring halus) */}
      <path d={`M${gx - 38},${gBot} L${gx - 30 + sway},${gTop} L${gx + 30 + sway},${gTop} L${gx + 38},${gBot} Z`} fill="#16224a" stroke="#7d89b5" strokeWidth={2.5} />
      {Array.from({length: 7}, (_, j) => {
        const yy = gTop + 22 + j * 24;
        const sh = sway * (1 - (yy - gTop) / (gBot - gTop));
        return <line key={j} x1={gx - 22 + sh} y1={yy} x2={gx + 22 + sh} y2={yy} stroke={C.cyan} strokeOpacity={0.35 + 0.25 * Math.sin(t * 2 + j)} strokeWidth={3} strokeDasharray="7 5" />;
      })}
      <line x1={gx + sway} y1={gTop + 6} x2={gx + sway + ball} y2={gTop + 34} stroke="#c9d3ee" strokeWidth={2} />
      <circle cx={gx + sway + ball} cy={gTop + 38} r={11} fill={C.gold} stroke="#fff3c4" strokeWidth={1.5} />
      <path d={`M${gx - 50},${gBot} L${gx + 50},${gBot}`} stroke="#7d89b5" strokeWidth={3} />
    </g>
  );
};

export const Roadmap: React.FC = () => {
  const {t, cue, dur, wordOf} = useScene();
  const head = ramp(t, 0, 0.8);
  const ps = [ramp(t, cue(1) - 0.2, cue(1) + 0.7, BACK), ramp(t, cue(2) - 0.2, cue(2) + 0.7, BACK), ramp(t, cue(3) - 0.2, cue(3) + 0.7, BACK)];
  const act = [win(t, cue(1) - 0.2, cue(2) - 0.3, 0.6, 0.8), win(t, cue(2) - 0.2, cue(3) - 0.3, 0.6, 0.8), win(t, cue(3) - 0.2, dur, 0.6, 0.8)];
  const pathP =
    UX[0] * ramp(t, 0.6, cue(1), EASE_IN_OUT) +
    (UX[1] - UX[0]) * ramp(t, cue(2) - 0.6, cue(2) + 0.6, EASE_IN_OUT) +
    (UX[2] - UX[1]) * ramp(t, cue(3) - 0.6, cue(3) + 0.6, EASE_IN_OUT) +
    (1 - UX[2]) * ramp(t, cue(3) + 0.6, cue(3) + 2.2, EASE_IN_OUT);
  const [lx, ly] = pointAlong(PTS, pathP);
  const lead: [number, number][] = [1, 2, 3, 4, 5].map((k) => pointAlong(PTS, Math.max(0, pathP - k * 0.008)));
  const loop = ramp(t, cue(3) + 1.6, cue(3) + 2.6);
  const ghost = win(t, 0.4, cue(3) + 0.6, 0.8, 0.8);
  const itemAt = (i: number, k: number) => wordOf(i + 1, KEYS[i][k]) - 0.15;
  const imp = ramp(t, wordOf(0, 'osilasi') - 0.2, wordOf(0, 'osilasi') + 0.6);
  const three = ramp(t, wordOf(0, 'tiga') - 0.2, wordOf(0, 'tiga') + 0.6);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center', fontFamily: FONT.head, fontSize: 50, fontWeight: 700, color: C.ink, opacity: head, translate: `0px ${(1 - head) * 14}px`}}>
        Peta perjalanan: <span style={{color: C.press, opacity: 0.35 + 0.65 * imp}}>osilasi</span> <span style={{color: C.muted, opacity: 0.35 + 0.65 * three}}>dalam tiga bagian</span>
      </div>
      <Stage>
        <Motes x={960} y={520} rx={900} ry={340} n={36} color="gold" opacity={0.4} seed={11} />
        {/* gelombang kosinus samar di latar yang terus merambat */}
        {[250, 520, 790].map((y, k) => (
          <path
            key={k}
            d={Array.from({length: 49}, (_, j) => {
              const X = -20 + j * 41;
              return `${j ? 'L' : 'M'}${X},${(y + 22 * Math.cos(X * 0.008 * (1 + 0.3 * k) - t * (0.9 + 0.25 * k) + k)).toFixed(1)}`;
            }).join(' ')}
            fill="none"
            stroke={k === 1 ? C.gold : C.press}
            strokeOpacity={0.16}
            strokeWidth={2}
            opacity={head}
          />
        ))}
        {PARTS.map((p, i) => (
          <rect
            key={`gh${i}`}
            x={CX[i] - CW / 2}
            y={TOP}
            width={CW}
            height={CH}
            rx={24}
            fill="none"
            stroke={p.color}
            strokeOpacity={0.35}
            strokeWidth={2}
            strokeDasharray="10 12"
            strokeDashoffset={-t * 24}
            opacity={ghost * (1 - Math.min(1, ps[i]))}
          />
        ))}
        {PARTS.map((p, i) => (
          <Glow key={`gl${i}`} x={CX[i]} y={TOP + CH / 2} r={420} color={p.hue} opacity={0.35 * act[i]} />
        ))}
        <path d={PTS_D} fill="none" stroke={C.line} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" opacity={head} />
        <DrawPath d={PTS_D} p={pathP} stroke="spr" width={3} halo opacity={0.85} />
        <Spark x={lx} y={ly} r={7} color="spr" trail={lead} opacity={(1 - loop) * ramp(t, 0.6, 1.0)} />
        <Stream pts={PTS} color="spr" n={5} speed={0.12} r={5} jitter={2} opacity={loop} />
        {PARTS.map((p, i) => (
          <g key={i} opacity={Math.min(1, ps[i])}>
            <Ripple x={CX[i]} y={PY} p={ramp(t, cue(i + 1) - 0.1, cue(i + 1) + 1.4, (x) => x)} r={90} color={p.hue} />
            <circle cx={CX[i]} cy={PY} r={20 + 4 * Math.sin(t * 2.4 + i)} fill={`url(#soft-${p.hue})`} />
            <circle cx={CX[i]} cy={PY} r={11} fill={p.color} />
            <circle cx={CX[i]} cy={PY} r={4.5} fill="#fff" opacity={0.8} />
          </g>
        ))}
      </Stage>
      {PARTS.map((p, i) => {
        const q0 = Math.min(1, ps[i]);
        return (
          <div
            key={p.n}
            style={{
              position: 'absolute',
              left: CX[i] - CW / 2,
              top: TOP,
              width: CW,
              height: CH,
              borderRadius: 24,
              background: 'linear-gradient(160deg, rgba(22,34,72,0.94), rgba(10,16,36,0.94))',
              border: `1.5px solid ${p.color}55`,
              borderTop: `8px solid ${p.color}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.45), 0 0 ${40 + 40 * act[i]}px ${p.color}${Math.round(0x22 + 0x30 * act[i]).toString(16).padStart(2, '0')}`,
              opacity: Math.min(1, ps[i] * 1.3) * (0.35 + 0.65 * q0),
              translate: `0px ${(1 - q0) * 40 - 6 * act[i]}px`,
              scale: String(0.9 + 0.1 * ps[i]),
              fontFamily: FONT.head,
              color: C.ink,
              padding: '22px 34px',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: `linear-gradient(105deg, transparent ${-40 + 150 * q0 - 16}%, rgba(220,240,255,0.12) ${-40 + 150 * q0}%, transparent ${-40 + 150 * q0 + 16}%)`,
              }}
            />
            <div style={{fontFamily: FONT.mono, fontSize: 22, color: p.color, letterSpacing: 4}}>BAGIAN {p.n}</div>
            <div style={{fontSize: 31, fontWeight: 700, marginTop: 4, letterSpacing: -0.5, whiteSpace: 'nowrap'}}>{p.title}</div>
            <div style={{height: 216}} />
            <div>
              {p.items.map((it, k) => {
                const q = ramp(t, itemAt(i, k), itemAt(i, k) + 0.6);
                return (
                  <div key={it} style={{fontSize: i === 0 ? 24 : 28, color: C.muted, lineHeight: i === 0 ? 1.36 : 1.7, opacity: q, translate: `${(1 - q) * 14}px 0px`, whiteSpace: 'nowrap'}}>
                    <span style={{color: p.color, marginRight: 8}}>—</span>
                    {it}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <Stage>
        {PARTS.map((_, i) => (
          <g key={i} opacity={Math.min(1, ps[i])}>
            <g transform={`translate(${CX[i]} ${ICON_Y}) scale(0.84) translate(${-CX[i]} ${-ICON_Y})`}>
              <Icon i={i} x={CX[i]} y={ICON_Y} t={t} act={act[i]} />
            </g>
          </g>
        ))}
      </Stage>
    </AbsoluteFill>
  );
};

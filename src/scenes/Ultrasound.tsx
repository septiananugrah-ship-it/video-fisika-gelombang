import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, ramp, rand, win} from '../anim';
import {Arrow, Formula, Frac, Glow, Label, Motes, Note, Ripple, Stage, Stream, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Ultrasonografi: probe di atas penampang tubuh mengirim pulsa MHz (toska) yang sebagian memantul (ungu) di setiap
// batas jaringan. Kedalaman batas 0,25 · 1,4 · 2,6 · 5,0 cm; waktu gema t = 2d/v (v ≈ 1540 m/s) → 3,2 · 18 · 34 · 65 μs.
// Gema 65 μs → d = 1540 × 65×10⁻⁶ / 2 = 0,050 m (pergi–pulang, dibagi 2). Lalu gambar tersusun garis demi garis.
// Gerak sangat diperlambat (65 μs ditampilkan ≈ 2,2 dtk).

const BX = 500; // sumbu berkas
const Y0 = 235; // permukaan kulit
const PXCM = 88; // px per cm
const DEPTHS = [0.25, 1.4, 2.6, 5.0];
const YB = DEPTHS.map((d) => Y0 + PXCM * d);
const REFL = [0.55, 0.4, 0.35, 0.65];
const VV = 400; // px/dtk tampilan
const PER = 3.0; // periode pulsa (dtk tampilan)
const US_PER_S = 65 / ((2 * (YB[3] - Y0)) / VV); // μs per detik tampilan
const ECHO_US = YB.map((y) => ((2 * (y - Y0)) / VV) * US_PER_S);
const AX = (us: number) => 1060 + us * 8.75;
const ABASE = 430;
const SPH = [0.75, 0.55, 0.45, 0.8].map((v) => v * 125);
const curve = (y: number, x: number) => y + 0.00035 * (x - BX) * (x - BX);
const LX0 = 200;
const LX1 = 860;
const LAYERS: {name: string; fill: string; op: number}[] = [
  {name: 'kulit', fill: '#d49a8f', op: 0.6},
  {name: 'lemak', fill: '#9a8540', op: 0.35},
  {name: 'otot', fill: '#93404f', op: 0.45},
  {name: 'cairan', fill: '#0c2550', op: 0.85},
  {name: 'organ', fill: '#5d4a63', op: 0.6},
];
const layerPath = (ya: number, yb: number | null) => {
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= 22; i++) {
    const x = LX0 + ((LX1 - LX0) * i) / 22;
    top.push(`${i ? 'L' : 'M'}${x.toFixed(1)},${curve(ya, x).toFixed(1)}`);
    const xb = LX1 - ((LX1 - LX0) * i) / 22;
    bot.push(`L${xb.toFixed(1)},${(yb === null ? 850 : curve(yb, xb)).toFixed(1)}`);
  }
  return top.join(' ') + ' ' + bot.join(' ') + ' Z';
};
const curveD = (y: number) => {
  let d = '';
  for (let i = 0; i <= 22; i++) {
    const x = LX0 + ((LX1 - LX0) * i) / 22;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${curve(y, x).toFixed(1)}`;
  }
  return d;
};
// ---- kipas gambar B-mode ----
const FA = {x: 1410, y: 232, R: 550, half: 36};
const fp = (r: number, deg: number): [number, number] => [FA.x + r * Math.sin((deg * Math.PI) / 180), FA.y + r * Math.cos((deg * Math.PI) / 180)];
const wedge = (r: number, a0: number, a1: number) => {
  const p0 = fp(r, a0);
  const p1 = fp(r, a1);
  return `M${FA.x},${FA.y} L${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${r},${r} 0 0 0 ${p1[0].toFixed(1)},${p1[1].toFixed(1)} Z`;
};
const arcD = (r: number) => {
  const p0 = fp(r, -FA.half);
  const p1 = fp(r, FA.half);
  return `M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${r},${r} 0 0 0 ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
};
const SPECK = Array.from({length: 150}, (_, i) => {
  const r = 20 + Math.sqrt(rand(i * 3.7)) * 520;
  const a = (rand(i * 5.1 + 2) - 0.5) * 2 * (FA.half - 2);
  const [x, y] = fp(r, a);
  return {x, y, r: 0.9 + rand(i * 1.3) * 1.8, o: 0.12 + rand(i * 2.9) * 0.3};
});

/** Pulsa sebagai deret muka gelombang (rapatan) di berkas. */
const Packet: React.FC<{yc: number; a: number; color: string; w: number}> = ({yc, a, color, w}) => (
  <g>
    {[-3, -2, -1, 0, 1, 2, 3].map((j) => {
      const env = Math.exp(-((j / 2) ** 2));
      const hw = w * a * env + 3;
      return <line key={j} x1={BX - hw} y1={yc + j * 11} x2={BX + hw} y2={yc + j * 11} stroke={color} strokeWidth={3} strokeLinecap="round" opacity={Math.min(1, env * (0.35 + a))} />;
    })}
  </g>
);

export const Ultrasound: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const intro = ramp(t, -0.3, 1.0);
  const c1 = cue(1);
  const c2 = cue(2);
  const c3 = cue(3);
  const tau = ((t % PER) + PER) % PER;
  const echoBoost = 0.5 + 0.5 * ramp(t, c1, c1 + 1.2);

  // ---- pulsa turun & gema ----
  const yDown = Y0 + VV * tau;
  let aDown = 1;
  YB.forEach((y) => {
    if (yDown > y) aDown *= 0.8;
  });
  const echoes = YB.map((y, b) => {
    const tb = (y - Y0) / VV;
    let aIn = 1;
    for (let k = 0; k < b; k++) aIn *= 0.8;
    return {b, tb, y: y - VV * (tau - tb), on: tau > tb && y - VV * (tau - tb) > Y0 - 4, a: REFL[b] * aIn};
  });
  const usNow = tau * US_PER_S;

  // ---- panel kanan ----
  const ruler = win(t, 0.6, c1 - 0.2, 0.8, 0.5);
  const chart = ramp(t, c1 + 0.2, c1 + 1.0) * (1 - ramp(t, c3 - 0.4, c3 + 0.2, EASE_IN_OUT));
  const ghost = ramp(t, c1 + 2.6, c1 + 3.4);
  const curFade = 1 - ramp(tau, 2.72, 2.96);
  const note1 = win(t, wordOf(1, 'seribu') - 0.4, c2 - 0.3, 0.6, 0.5);
  const form2 = win(t, wordOf(2, 'enam') + 0.2, c3 - 0.4, 0.7, 0.5);
  const lbl65 = ramp(t, wordOf(2, 'enam') - 0.2, wordOf(2, 'enam') + 0.5) * chart;
  const rt = win(t, c2 + 0.3, c3 - 0.3, 0.8, 0.6);
  const fan = ramp(t, c3 - 0.2, c3 + 0.6);
  const reveal = ramp(t, c3 + 0.4, c3 + 5.2, (x) => x);
  const theta = -FA.half + 2 * FA.half * reveal;
  const tanpa = ramp(t, wordOf(3, 'tanpa') - 0.3, wordOf(3, 'tanpa') + 0.5);
  const outAll = 1 - ramp(t, dur - 0.9, dur, EASE_IN_OUT);

  const trace = (limit: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const us = (i / 200) * 80;
      if (us > limit) break;
      let y = ABASE + 2.2 * Math.sin(i * 1.7 + 3 * rand(i));
      ECHO_US.forEach((e, b) => {
        const d = us - e;
        if (Math.abs(d) < 3) y -= SPH[b] * Math.exp(-((d / 0.8) ** 2)) * (0.65 + 0.35 * Math.cos(d * 7));
      });
      pts.push(`${AX(us).toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const fpT = fp(FA.R, theta);
  const rescan = (((t * 0.22) % 1) + 1) % 1;
  const fpR = fp(FA.R, -FA.half + 2 * FA.half * rescan);
  const bob = 2.5 * Math.sin(t * 1.3);

  return (
    <AbsoluteFill style={{opacity: outAll}}>
      <Stage>
        <defs>
          <linearGradient id="us-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.bg} stopOpacity="0" />
            <stop offset="100%" stopColor={C.bg} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="us-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.cyan} stopOpacity="0.28" />
            <stop offset="100%" stopColor={C.cyan} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="us-soft">
            <stop offset="0%" stopColor="#c9d0de" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c9d0de" stopOpacity="0.08" />
          </radialGradient>
          <clipPath id="us-reveal">
            <path d={wedge(FA.R + 2, -FA.half, Math.max(-FA.half + 0.01, theta))} />
          </clipPath>
        </defs>

        {/* ---------------- penampang tubuh ---------------- */}
        <g opacity={intro}>
          {LAYERS.map((L, i) => (
            <path key={L.name} d={layerPath(i === 0 ? Y0 : YB[i - 1], i < 4 ? YB[i] : null)} fill={L.fill} opacity={L.op} />
          ))}
          {/* serat otot & tekstur organ */}
          {Array.from({length: 9}, (_, k) => (
            <path key={k} d={curveD(YB[1] + 10 + k * 10.5)} fill="none" stroke="#e08a96" strokeWidth={1} opacity={0.18} strokeDasharray="18 10" strokeDashoffset={k * 7} />
          ))}
          {Array.from({length: 24}, (_, k) => (
            <circle key={k} cx={LX0 + 20 + rand(k * 3.3) * 620} cy={curve(YB[3], LX0 + 20 + rand(k * 3.3) * 620) + 20 + rand(k * 7.1) * 140} r={2 + rand(k) * 4} fill="#b9a3c4" opacity={0.18} />
          ))}
          {YB.map((y, b) => (
            <path key={b} d={curveD(y)} fill="none" stroke="#e7d9f2" strokeWidth={b === 3 ? 2.5 : 1.5} opacity={0.45} />
          ))}
          <rect x={LX0 - 10} y={760} width={LX1 - LX0 + 20} height={95} fill="url(#us-fade)" />
          {LAYERS.map((L, i) => {
            const ya = i === 0 ? Y0 : YB[i - 1];
            const yb = i < 4 ? YB[i] : 800;
            const ym = i === 0 ? Y0 - 2 : (ya + yb) / 2 + 30;
            return (
              <Label key={L.name} x={840} y={i === 0 ? ym + 2 : ym} size={20} color="muted" anchor="end" opacity={i === 0 ? 0 : 0.9}>
                {L.name}
              </Label>
            );
          })}
          <Label x={840} y={Y0 + 36} size={18} color="muted" anchor="end" opacity={0.9}>
            kulit · gel
          </Label>
          {/* penggaris kedalaman */}
          {Array.from({length: 7}, (_, k) => (
            <g key={k}>
              <line x1={180} y1={Y0 + k * PXCM} x2={196} y2={Y0 + k * PXCM} stroke={C.muted} strokeWidth={2} />
              <text x={170} y={Y0 + k * PXCM} textAnchor="end" dominantBaseline="central" fontFamily={FONT.mono} fontSize={17} fill={C.muted}>
                {k}
              </text>
            </g>
          ))}
          <line x1={188} y1={Y0} x2={188} y2={Y0 + 6 * PXCM} stroke={C.muted} strokeWidth={1.5} opacity={0.6} />
          <text x={170} y={Y0 + 6 * PXCM + 34} textAnchor="end" dominantBaseline="central" fontFamily={FONT.mono} fontSize={16} fill={C.muted}>
            cm
          </text>
          {/* berkas */}
          <rect x={BX - 40} y={Y0} width={80} height={600} fill="url(#us-beam)" opacity={0.7 + 0.3 * Math.sin(t * 2)} />
          {/* pulsa turun */}
          {yDown < 840 ? (
            <g opacity={1 - ramp(yDown, 760, 840)}>
              <Packet yc={yDown} a={aDown} color={C.cyan} w={36} />
              <circle cx={BX} cy={yDown} r={40} fill="url(#soft-cyan)" opacity={0.6} />
            </g>
          ) : null}
          {/* gema */}
          {echoes.map((e) =>
            e.on ? (
              <g key={e.b} opacity={echoBoost * ramp(e.y, Y0 - 4, Y0 + 30)}>
                <Packet yc={e.y} a={e.a} color={C.spr} w={30} />
              </g>
            ) : null,
          )}
          {echoes.map((e) => (
            <Ripple key={e.b} x={BX} y={YB[e.b]} p={(tau - e.tb) / 0.9} r={70} color="spr" rings={2} width={2} />
          ))}
          {YB.map((y, b) => (
            <Ripple key={b} x={BX} y={y} p={(t - wordOf(1, 'memantul') + 0.2 - b * 0.12) / 1.2} r={150} color="spr" rings={2} />
          ))}
          {/* probe */}
          <path d={`M${BX + 30},168 C${BX + 120},150 ${BX + 200},190 ${BX + 330},172`} fill="none" stroke="#5b6a9e" strokeWidth={6} strokeLinecap="round" />
          <ellipse cx={BX} cy={Y0 - 2} rx={52} ry={7} fill="#7fd8ff" opacity={0.35} />
          <path d={`M${BX - 34},160 L${BX + 34},160 L${BX + 46},226 Q${BX},236 ${BX - 46},226 Z`} fill="#2a3768" stroke="#9aa6d6" strokeWidth={2.5} />
          <rect x={BX - 44} y={222} width={88} height={10} rx={5} fill="#c9d2ee" />
          <circle cx={BX} cy={Y0} r={30 + 20 * tau} fill="url(#soft-cyan)" opacity={Math.max(0, 1 - tau * 2.5)} />
          {/* pergi–pulang */}
          <g opacity={rt}>
            <path d={curveD(YB[3])} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="8 7" />
            <Arrow x1={590} y1={Y0 + 14} x2={590} y2={YB[3] - 12} color="work" width={5} />
            <Arrow x1={690} y1={YB[3] - 12} x2={690} y2={Y0 + 14} color="work" width={5} />
            <Label x={590} y={590} size={22} color="work">
              pergi
            </Label>
            <Label x={690} y={360} size={22} color="work">
              pulang
            </Label>
            <Label x={330} y={YB[3] - 26} size={28} color="gold" weight={600}>
              d = 5 cm
            </Label>
          </g>
        </g>

        {/* ---------------- penggaris frekuensi ---------------- */}
        <g opacity={ruler}>
          <Label x={1410} y={250} size={20} font="mono" color="muted">
            frekuensi bunyi (skala log)
          </Label>
          <line x1={1060} y1={ABASE} x2={1760} y2={ABASE} stroke={C.muted} strokeWidth={2} />
          {[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
            <line key={d} x1={1060 + ((d - 1) / 7) * 700} y1={ABASE - 6} x2={1060 + ((d - 1) / 7) * 700} y2={ABASE + 6} stroke={C.muted} strokeWidth={1.5} />
          ))}
          {[
            [1, '10 Hz'],
            [3, '1 kHz'],
            [5, '100 kHz'],
            [7, '10 MHz'],
          ].map(([d, s]) => (
            <text key={s} x={1060 + (((d as number) - 1) / 7) * 700} y={ABASE + 42} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={16} fill={C.muted}>
              {s}
            </text>
          ))}
          <rect x={1068} y={ABASE - 26} width={1346 - 1068} height={52} rx={8} fill={C.cyan} opacity={0.22} />
          <rect x={1068} y={ABASE - 26} width={1346 - 1068} height={52} rx={8} fill="none" stroke={C.cyan} strokeWidth={2} opacity={0.7} />
          <Label x={1207} y={ABASE + 76} size={21} color="cyan">
            pendengaran 20 Hz – 20 kHz
          </Label>
          <Glow x={1648} y={ABASE} r={90} color="gold" opacity={0.7} />
          <rect x={1586} y={ABASE - 26} width={125} height={52} rx={8} fill={C.gold} opacity={0.3 + 0.1 * Math.sin(t * 3)} />
          <rect x={1586} y={ABASE - 26} width={125} height={52} rx={8} fill="none" stroke={C.gold} strokeWidth={2} />
          <Label x={1648} y={ABASE - 56} size={24} color="gold" weight={600}>
            USG ≈ 2–15 MHz
          </Label>
          <Arrow x1={1360} y1={ABASE + 76} x2={1574} y2={ABASE + 76} color="gold" width={3} dash="6 6" />
          <Label x={1467} y={ABASE + 102} size={19} color="gold">
            ≥ 100× lebih tinggi
          </Label>
          {/* pulsa MHz yang melaju */}
          {(() => {
            const pts: string[] = [];
            const head = 1100 + ((t * 260) % 700);
            for (let i = 0; i <= 140; i++) {
              const x = 1080 + i * 5;
              const e = Math.exp(-(((x - head) / 60) ** 2)) + Math.exp(-(((x - head + 700) / 60) ** 2)) + Math.exp(-(((x - head - 700) / 60) ** 2));
              pts.push(`${x},${(640 + 34 * e * Math.sin(x * 0.42 - t * 30)).toFixed(1)}`);
            }
            return <polyline points={pts.join(' ')} fill="none" stroke={C.gold} strokeWidth={2.5} opacity={0.85} />;
          })()}
          <Label x={1410} y={700} size={20} font="mono" color="muted">
            pulsa ultrasonik · jutaan getaran per detik
          </Label>
        </g>

        {/* ---------------- grafik gema (A-mode) ---------------- */}
        <g opacity={chart}>
          <Label x={1410} y={205} size={20} font="mono" color="muted">
            gema yang kembali ke probe
          </Label>
          <line x1={1060} y1={ABASE} x2={1770} y2={ABASE} stroke={C.muted} strokeWidth={2} />
          {[0, 20, 40, 60, 80].map((u) => (
            <g key={u}>
              <line x1={AX(u)} y1={ABASE} x2={AX(u)} y2={ABASE + 8} stroke={C.muted} strokeWidth={1.5} />
              <text x={AX(u)} y={ABASE + 24} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={16} fill={C.muted}>
                {u}
              </text>
            </g>
          ))}
          <text x={1770} y={ABASE + 50} textAnchor="end" dominantBaseline="central" fontFamily={FONT.mono} fontSize={16} fill={C.muted}>
            t (μs)
          </text>
          <polyline points={trace(80)} fill="none" stroke={C.spr} strokeWidth={2} opacity={0.32 * ghost} />
          <g opacity={curFade}>
            <polyline points={trace(Math.min(80, usNow))} fill="none" stroke={C.spr} strokeWidth={2.6} />
            {usNow < 80 ? (
              <g>
                <line x1={AX(usNow)} y1={ABASE - 140} x2={AX(usNow)} y2={ABASE + 4} stroke={C.ink} strokeWidth={1.5} opacity={0.35} />
                <circle cx={AX(usNow)} cy={ABASE} r={4} fill="#fff" />
              </g>
            ) : null}
          </g>
          {ECHO_US.map((e, b) => (
            <circle key={b} cx={AX(e)} cy={ABASE - SPH[b]} r={22} fill="url(#soft-spr)" opacity={curFade * cyc(Math.min(0.999, Math.max(0, (usNow - e) / 30)))} />
          ))}
          <g opacity={lbl65}>
            <circle cx={AX(65)} cy={ABASE - SPH[3]} r={26} fill="url(#soft-gold)" />
            <Label x={AX(65)} y={ABASE - SPH[3] - 26} size={24} color="gold" weight={600}>
              65 μs
            </Label>
            <Arrow x1={AX(0) + 4} y1={262} x2={AX(65) - 4} y2={262} color="ink" width={2.5} both pulse={false} />
            <Label x={(AX(0) + AX(65)) / 2} y={238} size={20} color="ink">
              waktu pergi + pulang
            </Label>
          </g>
        </g>

        {/* ---------------- gambar tersusun (kipas) ---------------- */}
        <g opacity={fan}>
          <path d={wedge(FA.R, -FA.half, FA.half)} fill="#05070e" stroke={C.cyan} strokeOpacity={0.35} strokeWidth={2} />
          <g clipPath="url(#us-reveal)">
            {SPECK.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#cfd5e2" opacity={s.o} />
            ))}
            <path d={arcD(28)} fill="none" stroke="#dfe4ee" strokeWidth={12} opacity={0.45} />
            <path d={arcD(85)} fill="none" stroke="#c9cfdc" strokeWidth={8} opacity={0.3} />
            <path d={arcD(150)} fill="none" stroke="#d3d9e6" strokeWidth={18} opacity={0.38} />
            <ellipse cx={1410} cy={505} rx={250} ry={178} fill="#03040a" opacity={0.9} />
            <path d={arcD(470)} fill="none" stroke="#d7dce8" strokeWidth={34} opacity={0.42} />
            <g transform={`translate(0 ${bob})`}>
              <ellipse cx={1478} cy={540} rx={112} ry={66} transform="rotate(18 1478 540)" fill="url(#us-soft)" stroke="#e8ecf4" strokeWidth={3} strokeOpacity={0.55} />
              <circle cx={1336} cy={470} r={68} fill="url(#us-soft)" stroke="#f1f4fa" strokeWidth={4.5} strokeOpacity={0.85} />
              {Array.from({length: 9}, (_, k) => {
                const a = (-150 + k * 16) * (Math.PI / 180);
                return <circle key={k} cx={1478 + 100 * Math.cos(a + 0.31)} cy={540 + 58 * Math.sin(a + 0.31)} r={4} fill="#f1f4fa" opacity={0.7} />;
              })}
              <path d="M1430,568 Q1396,616 1356,594" fill="none" stroke="#e1e6f0" strokeWidth={7} strokeLinecap="round" opacity={0.6} />
              <path d="M1552,582 Q1566,636 1504,632" fill="none" stroke="#e1e6f0" strokeWidth={7} strokeLinecap="round" opacity={0.55} />
              <path d="M1290,500 Q1300,528 1330,536" fill="none" stroke="#f1f4fa" strokeWidth={3} opacity={0.5} />
            </g>
          </g>
          {reveal > 0 && reveal < 1 ? (
            <g>
              <line x1={FA.x} y1={FA.y} x2={fpT[0]} y2={fpT[1]} stroke={C.cyan} strokeWidth={14} opacity={0.18} />
              <line x1={FA.x} y1={FA.y} x2={fpT[0]} y2={fpT[1]} stroke="#e8fbff" strokeWidth={2.5} opacity={0.85} />
            </g>
          ) : null}
          <line x1={FA.x} y1={FA.y} x2={fpR[0]} y2={fpR[1]} stroke="#e8fbff" strokeWidth={2} opacity={cyc(rescan) * 0.3 * ramp(t, c3 + 5.2, c3 + 6)} />
          <rect x={FA.x - 34} y={FA.y - 36} width={68} height={36} rx={9} fill="#2a3768" stroke="#9aa6d6" strokeWidth={2} />
          <Label x={FA.x} y={176} size={20} font="mono" color="muted">
            ribuan gema → gambar
          </Label>
        </g>
        <Stream
          pts={[
            [BX + 60, 196],
            [800, 178],
            [1100, 178],
            [FA.x - 40, FA.y - 20],
          ]}
          color="spr"
          n={9}
          speed={0.5}
          r={5}
          opacity={fan * 0.8}
        />
        <Twinkles x={1410} y={520} rx={230} ry={150} n={5} color="cyan" opacity={ramp(t, c3 + 5.0, c3 + 5.8) * 0.6} seed={9} />
        <Motes x={BX} y={520} rx={330} ry={260} n={22} color="cyan" opacity={0.3 * intro} seed={6} />
      </Stage>

      <Note x={1410} y={640} p={note1} color={C.work}>
        <span style={{color: C.work}}>v ≈ 1540 m/s</span> dalam jaringan lunak
      </Note>
      <Formula
        x={1410}
        y={650}
        p={form2}
        accent={C.gold}
        size={58}
        caption="(1540 m/s × 65×10⁻⁶ s) ÷ 2 = 0,050 m · dibagi 2 karena pergi–pulang"
      >
        <V>d</V> = <Frac n={<span><V color={C.work}>v</V> <V>t</V></span>} d="2" /> ≈ <span style={{color: C.gold}}>5,0 cm</span>
      </Formula>
      <Note x={1410} y={846} p={tanpa} color={C.work}>
        tanpa <span style={{color: C.work}}>radiasi pengion</span> · aman untuk janin
      </Note>
    </AbsoluteFill>
  );
};

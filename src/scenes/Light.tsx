import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors} from 'remotion';
import {EASE_IN_OUT, mix, ramp} from '../anim';
import {Arrow, Badge, Formula, Frac, Glow, Label, Motes, Note, Ripple, Stage, Sup, Tint, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Cahaya = gelombang elektromagnetik (AUDIT): c = λν; 500 nm → ν = 3×10⁸ / 5×10⁻⁷ = 6×10¹⁴ Hz;
// spektrum radio → sinar-X (semua merambat dengan c, hanya λ yang beda); Young 1801 (celah ganda):
// intensitas di layar ∝ cos²(πΔ/λ), Δ = selisih lintasan dari kedua celah (dihitung eksak per titik layar).

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const TAU = Math.PI * 2;

/** Warna kira-kira untuk panjang gelombang tampak (nm), dicerahkan sedikit untuk latar gelap. */
const nmRGB = (nm: number) => {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 440) {
    r = (440 - nm) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = (510 - nm) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = (645 - nm) / 65;
  } else r = 1;
  const f = (v: number) => Math.round(255 * (0.15 + 0.85 * clamp01(v)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
};
const GREEN = nmRGB(500);
const BCOL = C.pot;

// ---------- fase A: gelombang EM 3D semu ----------
const AX0 = 250;
const AX1 = 1690;
const AY = 590;
const LAM = 260; // px (gambar), mewakili 500 nm
const VC = 130; // px/s
const E0 = 150;
const B0 = 130;
const PX = 700; // titik pengamatan
const prj = (x: number, yUp: number, z: number): [number, number] => [x - 0.5 * z, AY - yUp + 0.34 * z];

// ---------- fase B: spektrum ----------
const SX0 = 160;
const SX1 = 1760;
const SBY = 330;
const WY = 610;
const SPEC_U = [0, 0.22, 0.38, 0.53, 0.545, 0.565, 0.585, 0.6, 0.615, 0.63, 0.645, 0.8, 1];
const SPEC_C = ['#7d8fd0', '#9b86c9', '#b5505e', '#ff3b3b', nmRGB(680), nmRGB(610), nmRGB(575), nmRGB(530), nmRGB(490), nmRGB(450), nmRGB(410), '#9f80ff', '#ded3ff'];
const BANDS: {name: string; key: string; a: number; b: number}[] = [
  {name: 'radio', key: 'radio', a: 0, b: 0.22},
  {name: 'gelombang mikro', key: 'mikro', a: 0.22, b: 0.38},
  {name: 'inframerah', key: 'inframerah', a: 0.38, b: 0.535},
  {name: 'tampak', key: 'tampak', a: 0.535, b: 0.655},
  {name: 'ultraungu', key: 'ultraungu', a: 0.655, b: 0.8},
  {name: 'sinar-X', key: 'sinar', a: 0.8, b: 1},
];
const colorAt = (u: number) => interpolateColors(u, SPEC_U, SPEC_C);

// ---------- fase C: celah ganda Young ----------
const SRCX = 150;
const BARX = 600;
const SY = 540;
const DS = 150; // jarak celah (px)
const S1: [number, number] = [BARX, SY - DS / 2];
const S2: [number, number] = [BARX, SY + DS / 2];
const SCRX = 1360;
const YLAM = 26; // λ gambar
const YV = 150; // px/s
const SCR0 = 235;
const SCR1 = 845;

export const Light: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  const phA = 1 - ramp(t, cue(3) - 0.7, cue(3) - 0.1, EASE_IN_OUT);
  const phB = Math.min(ramp(t, cue(3) - 0.3, cue(3) + 0.4), 1 - ramp(t, cue(4) - 0.6, cue(4) - 0.1, EASE_IN_OUT));
  const phC = ramp(t, cue(4) - 0.3, cue(4) + 0.4);

  // ================= fase A =================
  const front = AX0 + 170 * (t + 0.8);
  const env = (x: number) => {
    const e = clamp01((front - x) / 140);
    return e * e * (3 - 2 * e);
  };
  const ph = (x: number) => (TAU * (x - AX0 - VC * t)) / LAM;
  const Ef = (x: number) => E0 * env(x) * Math.sin(ph(x));
  const Bf = (x: number) => B0 * env(x) * Math.sin(ph(x));
  const eOn = ramp(t, wordOf(0, 'listrik') - 0.3, wordOf(0, 'listrik') + 0.5);
  const bOn = ramp(t, wordOf(0, 'magnet') - 0.3, wordOf(0, 'magnet') + 0.5);
  const vac = ramp(t, wordOf(1, 'hampa') - 0.4, wordOf(1, 'hampa') + 0.5);
  const cB = slot(t, wordOf(1, 'tiga') - 0.3, cue(2) - 0.1, 0.6, 0.5);
  const card1 = slot(t, cue(2) - 0.1, wordOf(2, 'hijau') - 0.1);
  const card2 = slot(t, wordOf(2, 'hijau') - 0.1, cue(3) - 0.5);
  const lamB = ramp(t, wordOf(2, 'lambda') - 0.3, wordOf(2, 'lambda') + 0.5) * (1 - ramp(t, cue(3) - 0.9, cue(3) - 0.4, EASE_IN_OUT));
  const nuB = ramp(t, wordOf(2, 'enam') - 0.3, wordOf(2, 'enam') + 0.5) * (1 - ramp(t, cue(3) - 0.9, cue(3) - 0.4, EASE_IN_OUT));
  const zoomA = mix(1, 0.965, ramp(t, cue(1), cue(1) + 3, EASE_IN_OUT));
  const ePts: string[] = [];
  const bPts: string[] = [];
  for (let x = AX0; x <= AX1; x += 6) {
    const e = Ef(x);
    const b = Bf(x);
    ePts.push(`${ePts.length ? 'L' : 'M'}${x.toFixed(1)},${(AY - e).toFixed(1)}`);
    const [bx, by] = prj(x, 0, b);
    bPts.push(`${bPts.length ? 'L' : 'M'}${bx.toFixed(1)},${by.toFixed(1)}`);
  }
  const stems: number[] = [];
  for (let x = AX0 + 12; x <= AX1 - 6; x += 24) stems.push(x);
  const pE = Ef(PX);
  const pB = Bf(PX);
  const pBt = prj(PX, 0, pB);

  // ================= fase B =================
  const kw = BANDS.map((b) => wordOf(3, b.key));
  const uKeys = [0.11, 0.3, 0.46, 0.595, 0.72, 0.9];
  const uAt = (tt: number) => interpolate(tt, [cue(3) - 0.5, ...kw], [0.04, ...uKeys], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT});
  const lamAt = (tt: number) => Math.exp(mix(Math.log(520), Math.log(14), uAt(tt)));
  const u = uAt(t);
  const lamB2 = lamAt(t);
  let theta = 0;
  if (phB > 0) {
    const tb0 = cue(3) - 1;
    const steps = 200;
    const dt = Math.max(0, t - tb0) / steps;
    for (let i = 0; i < steps; i++) theta += ((TAU * 110) / lamAt(tb0 + (i + 0.5) * dt)) * dt;
  }
  const wCol = colorAt(u);
  const wavePts: string[] = [];
  if (phB > 0) {
    const step = Math.max(1.6, lamB2 / 10);
    for (let x = SX0; x <= SX1; x += step) {
      const edge = clamp01((x - SX0) / 60) * clamp01((SX1 - x) / 60);
      const y = WY - 85 * edge * Math.sin((TAU * (x - SX0)) / lamB2 - theta);
      wavePts.push(`${wavePts.length ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
  }
  const sameB = ramp(t, wordOf(3, 'sama') - 0.3, wordOf(3, 'sama') + 0.5);
  const mx = mix(SX0, SX1, u);

  // ================= fase C =================
  const tc0 = cue(4) - 0.4;
  const yFront = Math.max(0, YV * (t - tc0));
  const srcOn = ramp(t, tc0, tc0 + 0.6);
  const slitFront = YV * (t - tc0) - (BARX - SRCX - 60);
  const rFront = Math.max(0, slitFront);
  const young = ramp(t, wordOf(4, 'Young') - 0.3, wordOf(4, 'Young') + 0.5);
  const screenOn = ramp(t, wordOf(4, 'layar') - 0.4, wordOf(4, 'layar') + 1.6);
  const proof = ramp(t, wordOf(4, 'bukti') - 0.3, wordOf(4, 'bukti') + 0.6);
  const yP = SY + 250 * Math.sin(0.32 * (t - wordOf(4, 'pita')));
  const pOn = ramp(t, wordOf(4, 'pita') - 0.2, wordOf(4, 'pita') + 0.6);
  const intensity = (y: number) => {
    const r1 = Math.hypot(SCRX - S1[0], y - S1[1]);
    const r2 = Math.hypot(SCRX - S2[0], y - S2[1]);
    const d = r1 - r2;
    const envY = Math.exp(-((y - SY) ** 2) / (2 * 330 ** 2));
    const reach = clamp01((rFront - Math.max(r1, r2)) / 60);
    return {I: Math.cos((Math.PI * d) / YLAM) ** 2 * envY * reach, d};
  };
  const fr: {y: number; I: number}[] = [];
  if (phC > 0) for (let y = SCR0; y <= SCR1; y += 5) fr.push({y, I: intensity(y).I});
  const plotD = fr.map((f, i) => `${i ? 'L' : 'M'}${(SCRX + 46 + 230 * f.I * screenOn).toFixed(1)},${f.y.toFixed(1)}`).join(' ');
  const pd = intensity(yP).d / YLAM;
  const arcs: {r: number; op: number; s: number}[] = [];
  if (phC > 0 && rFront > 0) {
    const r0 = (((YV * t) % YLAM) + YLAM) % YLAM;
    for (let k = 0; k < 34; k++) {
      const r = r0 + k * YLAM;
      if (r > rFront || r < 4) continue;
      const op = 0.5 * Math.min(1, (rFront - r) / 40) * Math.min(1, 140 / (r + 60) + 0.25);
      arcs.push({r, op, s: 0}, {r, op, s: 1});
    }
  }
  const planes: number[] = [];
  if (phC > 0) {
    const x0 = SRCX + 60 + ((((YV * t) % YLAM) + YLAM) % YLAM);
    for (let x = x0; x < BARX - 8; x += YLAM) if (x < SRCX + 60 + yFront) planes.push(x);
  }

  return (
    <AbsoluteFill>
      {/* ===================== fase A: gelombang EM ===================== */}
      {phA > 0.001 ? (
        <AbsoluteFill style={{opacity: phA}}>
          <Stage>
            <g transform={`translate(960 560) scale(${zoomA}) translate(-960 -560)`}>
              <g opacity={vac * 0.9}>
                <Twinkles x={960} y={520} rx={820} ry={300} n={10} color="ink" seed={3} />
              </g>
              {/* bidang E (tegak) & bidang B (mendatar, 3D semu) */}
              <rect x={AX0} y={AY - 175} width={AX1 - AX0} height={350} fill={GREEN} opacity={0.03 + 0.03 * eOn} stroke={GREEN} strokeOpacity={0.12} strokeWidth={1.5} />
              <path
                d={`M${prj(AX0, 0, -150).join(',')} L${prj(AX1, 0, -150).join(',')} L${prj(AX1, 0, 150).join(',')} L${prj(AX0, 0, 150).join(',')} Z`}
                fill={BCOL}
                opacity={0.035 + 0.04 * bOn}
                stroke={BCOL}
                strokeOpacity={0.14}
                strokeWidth={1.5}
              />
              {/* tangkai medan B (di belakang) */}
              <g opacity={0.3 + 0.45 * bOn}>
                {stems.map((x) => {
                  const [bx, by] = prj(x, 0, Bf(x));
                  return <line key={x} x1={x} y1={AY} x2={bx} y2={by} stroke={BCOL} strokeWidth={2.4} strokeOpacity={0.6} />;
                })}
                <path d={bPts.join(' ')} fill="none" stroke={BCOL} strokeOpacity={0.25} strokeWidth={12} strokeLinejoin="round" />
                <path d={bPts.join(' ')} fill="none" stroke={BCOL} strokeWidth={4} strokeLinejoin="round" />
              </g>
              {/* sumbu rambat */}
              <line x1={AX0} y1={AY} x2={AX1 + 40} y2={AY} stroke={C.muted} strokeWidth={2} strokeOpacity={0.6} />
              <path d={`M${AX1 + 40},${AY - 9} L${AX1 + 58},${AY} L${AX1 + 40},${AY + 9} Z`} fill={C.muted} opacity={0.7} />
              {/* tangkai medan E */}
              <g opacity={0.35 + 0.55 * eOn}>
                {stems.map((x) => (
                  <line key={x} x1={x} y1={AY} x2={x} y2={AY - Ef(x)} stroke={GREEN} strokeWidth={2.4} strokeOpacity={0.55} />
                ))}
                <path d={ePts.join(' ')} fill="none" stroke={GREEN} strokeOpacity={0.25} strokeWidth={13} strokeLinejoin="round" />
                <path d={ePts.join(' ')} fill="none" stroke={GREEN} strokeWidth={4.5} strokeLinejoin="round" />
              </g>
              {/* titik pengamatan: medan hanya berosilasi di tempat */}
              <g opacity={Math.max(eOn, bOn)}>
                <circle cx={PX} cy={AY} r={8} fill="#fff" />
                <g opacity={eOn}>
                  <Arrow x1={PX} y1={AY} x2={PX} y2={AY - pE} color={GREEN} width={7} pulse={false} />
                </g>
                <g opacity={bOn}>
                  <Arrow x1={PX} y1={AY} x2={pBt[0]} y2={pBt[1]} color="pot" width={7} pulse={false} />
                </g>
              </g>
              <Label x={330} y={AY - 215} size={32} color={GREEN} anchor="start" weight={700} opacity={0.4 + 0.6 * eOn}>
                <tspan fontFamily="Source Serif 4, serif" fontStyle="italic">
                  E
                </tspan>{' '}
                medan listrik
              </Label>
              <Label x={300} y={AY + 112} size={32} color={BCOL} anchor="start" weight={700} opacity={0.4 + 0.6 * bOn}>
                <tspan fontFamily="Source Serif 4, serif" fontStyle="italic">
                  B
                </tspan>{' '}
                medan magnet
              </Label>
              <Label x={PX} y={AY + 205} size={22} color={C.muted} opacity={Math.max(eOn, bOn) * (1 - nuB)}>
                E ⟂ B, keduanya ⟂ arah rambat
              </Label>
              {/* sumber */}
              <Glow x={AX0} y={AY} r={120} color="white" opacity={0.7} />
              <circle cx={AX0} cy={AY} r={20} fill="#fff" />
              <Ripple x={AX0} y={AY} p={((t * 0.5) % 1 + 1) % 1} r={110} color="white" rings={2} width={2} />
              {/* c */}
              <g opacity={cB}>
                <Arrow x1={1340} y1={360} x2={1660} y2={360} color="work" width={7} />
              </g>
              {/* λ */}
              <g opacity={lamB}>
                <line x1={900} y1={AY - 160} x2={900} y2={AY - 205} stroke={C.press} strokeWidth={2} strokeDasharray="5 5" />
                <line x1={900 + LAM} y1={AY - 160} x2={900 + LAM} y2={AY - 205} stroke={C.press} strokeWidth={2} strokeDasharray="5 5" />
                <Arrow x1={906} y1={AY - 190} x2={900 + LAM - 6} y2={AY - 190} color="press" width={4} both pulse={false} />
                <Label x={900 + LAM / 2} y={AY - 222} size={28} color={C.press} weight={700}>
                  λ = 500 nm
                </Label>
              </g>
              <g opacity={nuB}>
                <circle cx={PX} cy={AY - pE} r={11} fill={C.gold} />
                <circle cx={PX} cy={AY - pE} r={26} fill="url(#soft-gold)" />
                <Label x={PX} y={AY + 205} size={26} color={C.gold} weight={600}>
                  6×10¹⁴ getaran per detik
                </Label>
              </g>
              <Motes x={960} y={AY} rx={760} ry={230} n={16} color="cyan" opacity={0.25} seed={2} />
            </g>
          </Stage>
          <Badge x={1500} y={290} text="c = 3×10⁸ m/s" color={C.work} opacity={cB} size={30} />
          <Note x={960} y={835} p={vac * (1 - ramp(t, cue(2) - 0.6, cue(2) - 0.1, EASE_IN_OUT))} color={C.ink} size={28}>
            tanpa medium → merambat di <span style={{color: C.cyan}}>ruang hampa</span>
          </Note>
          <Formula x={1290} y={250} p={card1} accent={C.cyan} size={64}>
            <V>c</V> = <V color={C.press}>λ</V>
            <V color={C.gold}>ν</V>
          </Formula>
          <Formula x={1290} y={250} p={card2} accent={C.gold} size={56}>
            <V color={C.gold}>ν</V> = <Frac n={<V>c</V>} d={<V color={C.press}>λ</V>} /> = <Frac n={<>3×10<Sup>8</Sup></>} d={<>5×10<Sup>−7</Sup></>} /> ={' '}
            <Tint c={C.gold}>
              6×10<Sup>14</Sup> Hz
            </Tint>
          </Formula>
        </AbsoluteFill>
      ) : null}

      {/* ===================== fase B: spektrum ===================== */}
      {phB > 0.001 ? (
        <AbsoluteFill style={{opacity: phB}}>
          <Stage>
            <defs>
              <linearGradient id="li-spec" x1="0" y1="0" x2="1" y2="0">
                {SPEC_U.map((s, i) => (
                  <stop key={i} offset={`${s * 100}%`} stopColor={SPEC_C[i]} />
                ))}
              </linearGradient>
            </defs>
            <rect x={SX0 - 6} y={SBY - 28} width={SX1 - SX0 + 12} height={56} rx={28} fill="#0a1128" stroke={C.line} strokeWidth={2} />
            <rect x={SX0} y={SBY - 22} width={SX1 - SX0} height={44} rx={22} fill="url(#li-spec)" opacity={0.85} />
            {BANDS.slice(1).map((b) => (
              <line key={b.key} x1={mix(SX0, SX1, b.a)} y1={SBY - 22} x2={mix(SX0, SX1, b.a)} y2={SBY + 22} stroke="#070b18" strokeWidth={3} />
            ))}
            {BANDS.map((b, i) => {
              const on = ramp(t, kw[i] - 0.3, kw[i] + 0.4);
              const near = Math.max(0, 1 - Math.abs(u - (b.a + b.b) / 2) / 0.12);
              return (
                <Label key={b.key} x={mix(SX0, SX1, (b.a + b.b) / 2)} y={SBY + 56} size={b.key === 'mikro' ? 23 : 25} color={mix(0, 1, near) > 0.5 ? C.ink : C.muted} weight={600} opacity={0.35 + 0.65 * on}>
                  {b.name}
                </Label>
              );
            })}
            {/* penanda pada pita */}
            <path d={`M${mx - 14},${SBY - 46} L${mx + 14},${SBY - 46} L${mx},${SBY - 26} Z`} fill={wCol} />
            <circle cx={mx} cy={SBY} r={30} fill="none" stroke="#fff" strokeWidth={3} opacity={0.85} />
            <line x1={mx} y1={SBY + 80} x2={mx} y2={WY - 110} stroke={wCol} strokeWidth={2} strokeDasharray="4 7" opacity={0.6} />
            {/* arah λ & ν */}
            <Arrow x1={560} y1={225} x2={240} y2={225} color="press" width={4} pulse={false} />
            <Label x={580} y={225} size={26} color={C.press} anchor="start" weight={600}>
              λ panjang
            </Label>
            <Arrow x1={1360} y1={225} x2={1680} y2={225} color="press" width={4} pulse={false} />
            <Label x={1340} y={225} size={26} color={C.press} anchor="end" weight={600}>
              λ pendek
            </Label>
            <Label x={960} y={225} size={24} color={C.gold} weight={600}>
              ν rendah → ν tinggi
            </Label>
            {/* gelombang yang λ-nya mengecil */}
            <Glow x={mx} y={WY} r={260} color="white" opacity={0.25} />
            <path d={wavePts.join(' ')} fill="none" stroke={wCol} strokeOpacity={0.25} strokeWidth={12} strokeLinejoin="round" />
            <path d={wavePts.join(' ')} fill="none" stroke={wCol} strokeWidth={4} strokeLinejoin="round" />
            <line x1={SX0} y1={WY} x2={SX1} y2={WY} stroke={C.faint} strokeWidth={1.5} strokeDasharray="3 8" />
            <Label x={mx < 900 ? mx + 30 : mx - 30} y={WY - 135} size={28} color={C.press} anchor={mx < 900 ? 'start' : 'end'} weight={700}>
              λ ≈ {lamB2 > 100 ? 'panjang' : lamB2 > 30 ? 'sedang' : 'sangat pendek'}
            </Label>
            <g opacity={sameB}>
              <Arrow x1={760} y1={790} x2={1160} y2={790} color="work" width={6} />
              <Label x={960} y={840} size={26} color={C.work} weight={600}>
                semuanya merambat dengan c = 3×10⁸ m/s
              </Label>
            </g>
            <Twinkles x={mx} y={SBY} rx={60} ry={40} n={4} color="white" seed={7} />
            <Motes x={960} y={WY} rx={800} ry={160} n={14} color="cyan" opacity={0.25} seed={5} />
          </Stage>
        </AbsoluteFill>
      ) : null}

      {/* ===================== fase C: celah ganda Young ===================== */}
      {phC > 0.001 ? (
        <AbsoluteFill style={{opacity: phC}}>
          <Stage>
            <defs>
              <clipPath id="li-young">
                <rect x={BARX + 7} y={SCR0 - 20} width={SCRX - BARX - 9} height={SCR1 - SCR0 + 40} />
              </clipPath>
            </defs>
            {/* sumber & muka gelombang datar */}
            <g opacity={srcOn}>
              <Glow x={SRCX} y={SY} r={140} color="work" opacity={0.6} />
              <rect x={SRCX - 50} y={SY - 40} width={90} height={80} rx={14} fill="#1f2a50" stroke={C.muted} strokeWidth={2} />
              <circle cx={SRCX + 40} cy={SY} r={12} fill={GREEN} />
              <Label x={SRCX} y={SY + 78} size={20} color={C.muted}>
                cahaya hijau
              </Label>
              {planes.map((x) => (
                <line key={x} x1={x} y1={SY - 150} x2={x} y2={SY + 150} stroke={GREEN} strokeWidth={3} opacity={0.55 * Math.min(1, (BARX - x) / 30)} />
              ))}
            </g>
            {/* sekat dengan dua celah */}
            <rect x={BARX - 7} y={SCR0 - 15} width={14} height={S1[1] - 9 - (SCR0 - 15)} fill="#5b678f" />
            <rect x={BARX - 7} y={S1[1] + 9} width={14} height={S2[1] - S1[1] - 18} fill="#5b678f" />
            <rect x={BARX - 7} y={S2[1] + 9} width={14} height={SCR1 + 15 - S2[1] - 9} fill="#5b678f" />
            {/* muka gelombang lingkaran dari tiap celah */}
            <g clipPath="url(#li-young)">
              {arcs.map((a, i) => {
                const [cx, cy] = a.s ? S2 : S1;
                return <circle key={i} cx={cx} cy={cy} r={a.r} fill="none" stroke={GREEN} strokeWidth={2.6} opacity={a.op} />;
              })}
            </g>
            <Glow x={S1[0]} y={S1[1]} r={50} color="work" opacity={0.7 * clamp01(rFront / 40)} />
            <Glow x={S2[0]} y={S2[1]} r={50} color="work" opacity={0.7 * clamp01(rFront / 40)} />
            <Label x={BARX - 26} y={S1[1]} size={22} color={C.muted} anchor="end" opacity={young}>
              celah 1
            </Label>
            <Label x={BARX - 26} y={S2[1]} size={22} color={C.muted} anchor="end" opacity={young}>
              celah 2
            </Label>
            {/* layar & pola pita */}
            <rect x={SCRX - 4} y={SCR0 - 10} width={30} height={SCR1 - SCR0 + 20} rx={4} fill="#121b3a" stroke={C.faint} strokeWidth={2} />
            {fr.map((f) => (
              <rect key={f.y} x={SCRX} y={f.y - 2.6} width={22} height={5.4} fill={GREEN} opacity={f.I * screenOn} />
            ))}
            <Glow x={SCRX + 10} y={SY} r={140} color="work" opacity={0.35 * screenOn} />
            {/* grafik intensitas */}
            <g opacity={screenOn}>
              <line x1={SCRX + 46} y1={SCR0} x2={SCRX + 46} y2={SCR1} stroke={C.faint} strokeWidth={2} />
              <path d={plotD} fill="none" stroke={GREEN} strokeOpacity={0.25} strokeWidth={10} strokeLinejoin="round" />
              <path d={plotD} fill="none" stroke={GREEN} strokeWidth={3.5} strokeLinejoin="round" />
              <Label x={SCRX + 170} y={205} size={24} color={C.ink} weight={600}>
                I ∝ cos²(πΔ/λ)
              </Label>
            </g>
            {/* titik P & selisih lintasan */}
            <g opacity={pOn}>
              <line x1={S1[0]} y1={S1[1]} x2={SCRX} y2={yP} stroke={C.cyan} strokeWidth={2.5} opacity={0.8} />
              <line x1={S2[0]} y1={S2[1]} x2={SCRX} y2={yP} stroke={C.spr} strokeWidth={2.5} opacity={0.8} />
              <circle cx={SCRX} cy={yP} r={9} fill="#fff" />
              <Label x={SCRX - 24} y={yP - 34} size={24} color={C.press} anchor="end" weight={700}>
                Δ = {pd.toFixed(1).replace('.', ',').replace('-', '−')} λ
              </Label>
            </g>
            <g opacity={proof}>
              <Label x={SCRX + 150} y={SY - 128} size={22} color={GREEN} anchor="start" weight={600}>
                terang: Δ = nλ
              </Label>
              <Label x={SCRX + 150} y={SY + 66} size={22} color={C.muted} anchor="start" weight={600}>
                gelap: Δ = (n + ½)λ
              </Label>
            </g>
            <Motes x={980} y={SY} rx={360} ry={280} n={12} color="work" opacity={0.25} seed={9} />
          </Stage>
          <Badge x={360} y={235} text="Thomas Young · 1801" color={C.gold} opacity={young} size={28} />
          <Note x={960} y={845} p={proof} color={GREEN} size={28}>
            pita terang-gelap = cahaya <span style={{color: GREEN}}>berinterferensi</span> → cahaya adalah gelombang
          </Note>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp, rand, win} from '../anim';
import {Arrow, Badge, Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Stage, Stream, Sqrt, Sup, Tint, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Gelombang materi (AUDIT): de Broglie 1924, λ = h/p.
// Elektron 54 eV: λ = h/√(2mE) = 6,626×10⁻³⁴ / √(2·9,109×10⁻³¹·54·1,602×10⁻¹⁹) = 0,167 nm ("≈ 0,17 nm").
// Davisson–Germer 1927, kristal nikel: berkas tegak lurus permukaan, puncak hambur pada ≈ 50° (d sin φ = λ, d = 0,215 nm).
// Bola kasti 0,145 kg × 40 m/s: λ = 6,626×10⁻³⁴ / 5,8 = 1,1×10⁻³⁴ m.
// Skala gambar fase 2: 600 px/nm → λ = 100 px, jarak baris atom nikel 0,215 nm = 129 px.

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const TAU = Math.PI * 2;
/** Opasitas loop: pudar masuk/keluar singkat di ujung siklus (tanpa pop). */
const fz = (ph: number) => Math.max(0, Math.min(1, ph * 7, (1 - ph) * 7));
const DEG = Math.PI / 180;
const LIGHT = '#ffe08a';
const NI = '#b9c3dc';

/** Paket gelombang materi yang menempel pada elektron (fase bergerak di dalam selubung). */
const packet = (xc: number, y: number, lam: number, amp: number, sig: number, phase: number) => {
  const n = 160;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = xc - 3 * sig + (6 * sig * i) / n;
    const uu = x - xc;
    const yy = y - amp * Math.exp(-(uu * uu) / (2 * sig * sig)) * Math.sin((TAU * uu) / lam - phase);
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)} `;
  }
  return d;
};

const WavePath: React.FC<{d: string; color: string; w?: number; op?: number}> = ({d, color, w = 4, op = 1}) =>
  op <= 0.001 ? null : (
    <g opacity={op}>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={w * 3.2} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" />
    </g>
  );

// ---------- Davisson–Germer ----------
const IX = 720;
const IY = 690;
const DGR = 300;
const dgI = (phi: number) => 0.32 + 0.68 * Math.exp(-((Math.abs(phi) - 50) ** 2) / (2 * 6.5 ** 2)) + 0.1 * Math.cos(phi * DEG * 2);
const QX0 = 1180;
const QX1 = 1720;
const QY0 = 780;
const QH = 330;
const q2x = (phi: number) => QX0 + (phi / 90) * (QX1 - QX0);

// ---------- tangga skala ----------
const LX = 1540;
const LY0 = 360;
const LK = 14; // px per orde
const ly = (e: number) => LY0 + -e * LK;

export const Matter: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  const phA = 1 - ramp(t, cue(3) - 0.7, cue(3) - 0.1, EASE_IN_OUT);
  const phB = Math.min(ramp(t, cue(3) - 0.3, cue(3) + 0.4), 1 - ramp(t, cue(4) - 0.6, cue(4) - 0.1, EASE_IN_OUT));
  const phC = ramp(t, cue(4) - 0.3, cue(4) + 0.4);

  // ================= fase A =================
  const a0 = 1 - ramp(t, cue(1) - 0.7, cue(1) - 0.1, EASE_IN_OUT);
  const a1 = win(t, cue(1) - 0.3, cue(2) - 0.6, 0.6, 0.5);
  const a2 = ramp(t, cue(2) - 0.2, cue(2) + 0.6);
  const deB = ramp(t, wordOf(0, 'Broglie') - 0.4, wordOf(0, 'Broglie') + 0.5);
  const lightOn = ramp(t, 0, 0.8);
  const asPart = ramp(t, wordOf(0, 'partikel') - 0.4, wordOf(0, 'partikel') + 0.6);
  const elOn = ramp(t, 0.6, 1.4);
  const elWave = ramp(t, wordOf(0, 'gelombang') - 0.5, wordOf(0, 'gelombang') + 0.9);
  // panel kiri: cahaya
  const lx = 200 + ((((t * 150) % 620) + 620) % 620);
  const lph = (((t * 150) / 620) % 1 + 1) % 1;
  const lightD = packet(lx, 540, 70, 70, 80, t * 9);
  // panel kanan: elektron
  const ex0 = 1120 + ((((t * 120) % 560) + 560) % 560);
  const eph = (((t * 120) / 560) % 1 + 1) % 1;
  const elD = packet(ex0, 540, 64, 64 * elWave, 70, t * 7);

  // lajur L1: p kecil vs p besar (kecepatan grup ∝ p, λ ∝ 1/p)
  const lanes = [
    {y: 520, lam: 128, v: 170, p: 1, key: 'kecil'},
    {y: 735, lam: 64, v: 340, p: 2, key: 'besar'},
  ].map((ln) => {
    const span = 1300;
    const s = (((t * ln.v) % span) + span) % span;
    return {...ln, x: 300 + s, ph: s / span};
  });
  const card1 = slot(t, cue(1) - 0.1, cue(2) - 0.3);
  const card2 = slot(t, cue(2) - 0.1, cue(3) - 0.5);
  const lamTag = ramp(t, wordOf(2, 'nanometer') - 0.6, wordOf(2, 'nanometer') + 0.3);
  const atomTag = ramp(t, wordOf(2, 'antaratom') - 0.5, wordOf(2, 'antaratom') + 0.4);
  const ROWY = 690;
  const row = Array.from({length: 11}, (_, i) => 315 + i * 129);
  const e2x = 260 + ((((t * 160) % 1400) + 1400) % 1400);
  const e2ph = (((t * 160) / 1400) % 1 + 1) % 1;
  const e2D = packet(e2x, 520, 100, 70, 150, t * 6);

  // ================= fase B: Davisson–Germer =================
  const dgOn = ramp(t, cue(3) - 0.1, cue(3) + 0.6);
  const nik = ramp(t, wordOf(3, 'nikel') - 0.4, wordOf(3, 'nikel') + 0.5);
  const dif = ramp(t, wordOf(3, 'berdifraksi') - 0.6, wordOf(3, 'berdifraksi') + 0.6);
  const xr = ramp(t, wordOf(3, 'sinar') - 0.4, wordOf(3, 'sinar') + 0.6);
  const phiDet = 50 + 28 * Math.sin(0.55 * (t - cue(3)) - 1.2);
  const detP: [number, number] = [IX + DGR * Math.sin(phiDet * DEG), IY - DGR * Math.cos(phiDet * DEG)];
  const Idet = dgI(phiDet);
  const polar: string[] = [];
  for (let a = -88; a <= 88; a += 2) {
    const r = 70 + 190 * dgI(a) * dif;
    polar.push(`${polar.length ? 'L' : 'M'}${(IX + r * Math.sin(a * DEG)).toFixed(1)},${(IY - r * Math.cos(a * DEG)).toFixed(1)}`);
  }
  const plotD: string[] = [];
  for (let a = 0; a <= 90; a += 1) plotD.push(`${plotD.length ? 'L' : 'M'}${q2x(a).toFixed(1)},${(QY0 - QH * dgI(a) * 0.95).toFixed(1)}`);
  // elektron terhambur: arah diambil sesuai distribusi (sampel bertimbang sederhana)
  const scat = Array.from({length: 18}, (_, i) => {
    const per = 1.6;
    const raw = t / per + rand(i * 3.3);
    const cy = Math.floor(raw);
    const ph = raw - cy;
    let a = (rand(i * 7.1 + cy * 1.37) - 0.5) * 170;
    if (rand(i * 2.9 + cy * 0.71) < 0.55) a = (a > 0 ? 1 : -1) * (50 + (rand(i * 5.3 + cy) - 0.5) * 12);
    const r = 30 + ph * 330;
    return {x: IX + r * Math.sin(a * DEG), y: IY - r * Math.cos(a * DEG), op: fz(ph) * dif, i};
  });

  // ================= fase C: bola kasti =================
  const ballX = 220 + ((((t - cue(4)) * 300) % 1000) + 1000) % 1000;
  const ballPh = ((((t - cue(4)) * 300) / 1000) % 1 + 1) % 1;
  const ballY = 600 - 80 * Math.sin(Math.PI * ballPh);
  const card3 = slot(t, wordOf(4, 'panjang') - 0.4, 99);
  const ladder = ramp(t, wordOf(4, 'sepuluh') - 0.6, wordOf(4, 'sepuluh') + 0.4);
  const ptrE = mix(-1, -34, ramp(t, wordOf(4, 'sepuluh') - 0.2, wordOf(4, 'teramati') + 0.2, EASE_IN_OUT));
  const tiny = ramp(t, wordOf(4, 'terlalu') - 0.3, wordOf(4, 'terlalu') + 0.5);
  const marks: {e: number; txt: string; col: string}[] = [
    {e: -1, txt: 'bola kasti ~ 10⁻¹ m', col: C.ink},
    {e: -5, txt: 'sel ~ 10⁻⁵ m', col: C.muted},
    {e: -10, txt: 'atom ~ 10⁻¹⁰ m', col: C.muted},
    {e: -15, txt: 'inti atom ~ 10⁻¹⁵ m', col: C.muted},
    {e: -34, txt: 'λ bola ≈ 10⁻³⁴ m', col: C.press},
  ];

  return (
    <AbsoluteFill>
      {/* ===================== fase A ===================== */}
      {phA > 0.001 ? (
        <AbsoluteFill style={{opacity: phA}}>
          <Stage>
            <defs>
              <clipPath id="ma-clip">
                <rect x={150} y={160} width={1620} height={740} />
              </clipPath>
              <clipPath id="ma-pl">
                <rect x={142} y={360} width={756} height={330} />
              </clipPath>
              <clipPath id="ma-pr">
                <rect x={1022} y={360} width={756} height={330} />
              </clipPath>
            </defs>
            {/* --- L0: dualitas --- */}
            {a0 > 0.001 ? (
              <g opacity={a0}>
                <rect x={140} y={300} width={760} height={480} rx={24} fill="rgba(10,16,36,0.55)" stroke={C.line} strokeWidth={2} />
                <rect x={1020} y={300} width={760} height={480} rx={24} fill="rgba(10,16,36,0.55)" stroke={C.line} strokeWidth={2} />
                <g opacity={lightOn}>
                  <Label x={520} y={340} size={26} color={LIGHT} weight={700} spacing={2}>
                    CAHAYA
                  </Label>
                  <g clipPath="url(#ma-pl)">
                  <WavePath d={lightD} color={LIGHT} op={fz(lph) * (1 - 0.55 * asPart)} />
                  {[-2, -1, 0, 1, 2].map((k) => (
                    <Spark key={k} x={lx + k * 34} y={540 + 6 * Math.sin(t * 5 + k)} r={7} color="gold" opacity={asPart * fz(lph) * Math.exp(-(k * k) / 5)} />
                  ))}
                  </g>
                  <Label x={520} y={720} size={24} color={C.ink} weight={600}>
                    gelombang <tspan fill={C.muted}>→ juga</tspan> partikel (foton)
                  </Label>
                </g>
                <g opacity={elOn}>
                  <Label x={1400} y={340} size={26} color={C.spr} weight={700} spacing={2}>
                    ELEKTRON
                  </Label>
                  <g clipPath="url(#ma-pr)">
                  <WavePath d={elD} color={C.spr} op={fz(eph) * elWave} />
                  <Spark x={ex0} y={540} r={13} color="spr" opacity={fz(eph)} trail={[0, 1, 2, 3].map((i) => [ex0 - 16 * (i + 1), 540])} />
                  </g>
                  <Label x={1400} y={720} size={24} color={C.ink} weight={600}>
                    partikel <tspan fill={C.muted}>→ juga</tspan> gelombang?
                  </Label>
                </g>
                <Label x={960} y={540} size={54} color={C.gold} weight={700} opacity={elWave}>
                  ⇄
                </Label>
                <Twinkles x={1400} y={540} rx={200} ry={90} n={4} color="spr" opacity={elWave} seed={2} />
              </g>
            ) : null}

            {/* --- L1: λ = h/p, dua lajur --- */}
            {a1 > 0.001 ? (
              <g opacity={a1} clipPath="url(#ma-clip)">
                {lanes.map((ln) => (
                  <g key={ln.key}>
                    <line x1={260} y1={ln.y} x2={1660} y2={ln.y} stroke={C.faint} strokeWidth={1.5} strokeDasharray="4 9" />
                    <WavePath d={packet(ln.x, ln.y, ln.lam, 62, 150, t * 8 * ln.p)} color={C.spr} op={fz(ln.ph)} />
                    <g opacity={fz(ln.ph)}>
                      <Spark x={ln.x} y={ln.y} r={12} color="spr" />
                      <Arrow x1={ln.x} y1={ln.y - 100} x2={ln.x + 90 * ln.p} y2={ln.y - 100} color="kin" width={6} pulse={false} />
                      <Label x={ln.x + 45 * ln.p} y={ln.y - 130} size={26} color={C.kin} font="serif" italic weight={700}>
                        p
                      </Label>
                      <Arrow x1={ln.x - ln.lam / 2} y1={ln.y + 92} x2={ln.x + ln.lam / 2} y2={ln.y + 92} color="press" width={3.5} both pulse={false} />
                      <Label x={ln.x} y={ln.y + 120} size={24} color={C.press} font="serif" italic weight={700}>
                        λ
                      </Label>
                    </g>
                    <Label x={250} y={ln.y - 50} size={24} color={C.muted} anchor="start" weight={600}>
                      {ln.p === 1 ? 'p kecil → λ panjang' : 'p besar → λ pendek'}
                    </Label>
                  </g>
                ))}
              </g>
            ) : null}

            {/* --- L2: 54 eV vs jarak antaratom --- */}
            {a2 > 0.001 ? (
              <g opacity={a2}>
                <rect x={240} y={ROWY - 40} width={1440} height={170} rx={16} fill="#121a36" opacity={0.6} />
                {row.map((x, i) => (
                  <g key={i}>
                    <circle cx={x + 1.5 * Math.sin(t * 3 + i)} cy={ROWY} r={34} fill={NI} />
                    <circle cx={x + 1.5 * Math.sin(t * 3 + i)} cy={ROWY} r={34} fill="url(#ma-shade)" />
                    <circle cx={x + 64.5 + 1.5 * Math.sin(t * 3 + i + 1)} cy={ROWY + 80} r={34} fill={NI} opacity={i < 10 ? 0.55 : 0} />
                  </g>
                ))}
                <Label x={960} y={ROWY + 150} size={22} color={C.muted}>
                  atom nikel
                </Label>
                <g clipPath="url(#ma-clip)">
                  <WavePath d={e2D} color={C.spr} op={fz(e2ph)} />
                  <Spark x={e2x} y={520} r={12} color="spr" opacity={fz(e2ph)} />
                </g>
                {/* penanda skala (tetap) */}
                <g opacity={lamTag}>
                  <line x1={830} y1={395} x2={830} y2={425} stroke={C.press} strokeWidth={2} />
                  <line x1={930} y1={395} x2={930} y2={425} stroke={C.press} strokeWidth={2} />
                  <Arrow x1={834} y1={410} x2={926} y2={410} color="press" width={3.5} both pulse={false} />
                  <Label x={880} y={372} size={26} color={C.press} weight={700}>
                    λ ≈ 0,17 nm
                  </Label>
                </g>
                <g opacity={atomTag}>
                  <Arrow x1={row[6] + 4} y1={ROWY - 70} x2={row[7] - 4} y2={ROWY - 70} color="ink" width={3.5} both pulse={false} />
                  <Label x={(row[6] + row[7]) / 2} y={ROWY - 98} size={24} color={C.ink} weight={600}>
                    jarak antaratom
                  </Label>
                </g>
                <Motes x={960} y={560} rx={760} ry={180} n={12} color="spr" opacity={0.3} seed={3} />
              </g>
            ) : null}
          </Stage>
          <Badge x={960} y={235} text="Louis de Broglie · 1924" color={C.gold} opacity={deB * a0} size={30} />
          <Formula x={960} y={250} p={card1} accent={C.spr} size={72} caption="tetapan Planck dibagi momentum">
            <V color={C.press}>λ</V> = <Frac n={<V>h</V>} d={<V color={C.kin}>p</V>} />
          </Formula>
          <Formula x={960} y={250} p={card2} accent={C.spr} size={56} caption="elektron 54 eV — seukuran jarak antaratom">
            <V color={C.press}>λ</V> = <Frac n={<V>h</V>} d={<Sqrt>2<V>mE</V></Sqrt>} /> ≈ <Tint c={C.press}>0,17 nm</Tint>
          </Formula>
          <Note x={1500} y={845} p={atomTag} color={C.spr} size={26}>
            λ ≈ jarak atom → kristal bisa jadi "kisi difraksi"
          </Note>
        </AbsoluteFill>
      ) : null}

      {/* ===================== fase B: Davisson–Germer ===================== */}
      {phB > 0.001 ? (
        <AbsoluteFill style={{opacity: phB}}>
          <Stage>
            {/* senapan elektron & berkas */}
            <g opacity={dgOn}>
              <rect x={IX - 34} y={190} width={68} height={110} rx={12} fill="#2a355e" stroke={C.muted} strokeWidth={2} />
              <rect x={IX - 14} y={300} width={28} height={18} rx={4} fill="#5b678f" />
              <Label x={IX - 56} y={245} size={22} color={C.muted} anchor="end">
                senapan elektron
              </Label>
              <line x1={IX} y1={318} x2={IX} y2={IY} stroke={C.spr} strokeWidth={10} opacity={0.18} />
              <Stream pts={[[IX, 320], [IX, IY - 4]]} color="spr" n={10} speed={1.2} r={4} jitter={0} />
            </g>
            {/* kristal nikel */}
            <rect x={IX - 280} y={IY} width={560} height={130} rx={10} fill="#1a2348" stroke={C.muted} strokeWidth={2} />
            {Array.from({length: 3}, (_, r) =>
              Array.from({length: 9}, (_, i) => (
                <circle key={`${r}-${i}`} cx={IX - 256 + i * 64 + (r % 2) * 32} cy={IY + 22 + r * 40} r={15} fill={NI} opacity={0.85 - r * 0.2} />
              )),
            )}
            <Label x={IX} y={IY + 156} size={24} color={NI} weight={600} opacity={0.4 + 0.6 * nik}>
              kristal nikel
            </Label>
            {/* pola hambur kutub */}
            <g opacity={dif}>
              <path d={`${polar.join(' ')} Z`} fill={C.spr} opacity={0.1} />
              <path d={polar.join(' ')} fill="none" stroke={C.spr} strokeWidth={3.5} />
            </g>
            {scat.map((s) => (
              <circle key={s.i} cx={s.x} cy={s.y} r={5} fill={C.spr} opacity={s.op} />
            ))}
            {/* busur detektor */}
            <path d={`M${IX + DGR * Math.sin(10 * DEG)},${IY - DGR * Math.cos(10 * DEG)} A${DGR},${DGR} 0 0 1 ${IX + DGR * Math.sin(85 * DEG)},${IY - DGR * Math.cos(85 * DEG)}`} fill="none" stroke={C.faint} strokeWidth={3} strokeDasharray="6 8" />
            <line x1={IX} y1={IY} x2={detP[0]} y2={detP[1]} stroke={C.spr} strokeWidth={2} strokeDasharray="5 6" opacity={0.5} />
            <g transform={`translate(${detP[0]} ${detP[1]}) rotate(${phiDet})`}>
              <rect x={-26} y={-44} width={52} height={40} rx={8} fill="#2a355e" stroke={C.muted} strokeWidth={2} />
              <rect x={-18} y={-12} width={36} height={8} rx={3} fill={C.spr} opacity={0.2 + 0.8 * Idet * dif} />
            </g>
            <Glow x={detP[0]} y={detP[1]} r={90} color="spr" opacity={Idet * dif} />
            <Label x={detP[0] + 50} y={detP[1] + 30} size={22} color={C.muted} anchor="start">
              detektor
            </Label>
            <Ripple x={IX + 230 * Math.sin(50 * DEG)} y={IY - 230 * Math.cos(50 * DEG)} p={ramp(t, wordOf(3, 'berdifraksi') - 0.1, wordOf(3, 'berdifraksi') + 1.4)} r={120} color="spr" />
            {/* grafik pembanding */}
            <g opacity={dif}>
              <line x1={QX0} y1={QY0} x2={QX1 + 10} y2={QY0} stroke={C.muted} strokeWidth={2} />
              <line x1={QX0} y1={QY0} x2={QX0} y2={QY0 - QH - 30} stroke={C.muted} strokeWidth={2} />
              {[0, 30, 60, 90].map((a) => (
                <g key={a}>
                  <line x1={q2x(a)} y1={QY0} x2={q2x(a)} y2={QY0 + 10} stroke={C.muted} strokeWidth={2} />
                  <Label x={q2x(a)} y={QY0 + 30} size={20} color={C.muted} font="mono">
                    {a}°
                  </Label>
                </g>
              ))}
              <Label x={QX1} y={QY0 + 66} size={22} color={C.muted} anchor="end">
                sudut detektor
              </Label>
              <Label x={QX0 + 12} y={QY0 - QH - 40} size={22} color={C.muted} anchor="start">
                jumlah elektron
              </Label>
              <path d={plotD.join(' ')} fill="none" stroke={C.spr} strokeOpacity={0.25} strokeWidth={10} />
              <path d={plotD.join(' ')} fill="none" stroke={C.spr} strokeWidth={3.5} />
              <circle cx={q2x(phiDet)} cy={QY0 - QH * Idet * 0.95} r={8} fill="#fff" />
              <Label x={q2x(50)} y={QY0 - QH - 8} size={24} color={C.spr} weight={700}>
                puncak difraksi
              </Label>
            </g>
            <g opacity={xr}>
              <path d={plotD.join(' ')} fill="none" stroke="#d9ccff" strokeWidth={3} strokeDasharray="8 8" transform="translate(0 -14)" opacity={0.8} />
              <Label x={QX0 + 270} y={QY0 - 60} size={22} color="#d9ccff" weight={600}>
                sinar-X dengan λ sama: pola serupa
              </Label>
            </g>
            <Motes x={IX} y={IY - 200} rx={300} ry={180} n={12} color="spr" opacity={0.3} seed={7} />
          </Stage>
          <Badge x={1450} y={240} text="Davisson & Germer · 1927" color={C.gold} opacity={dgOn} size={28} />
        </AbsoluteFill>
      ) : null}

      {/* ===================== fase C: bola kasti ===================== */}
      {phC > 0.001 ? (
        <AbsoluteFill style={{opacity: phC}}>
          <Stage>
            <defs>
              <radialGradient id="ma-ball" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#e7e2d6" />
                <stop offset="100%" stopColor="#9a947f" />
              </radialGradient>
            </defs>
            {/* bola kasti terbang */}
            <ellipse cx={660} cy={790} rx={480} ry={14} fill="#000" opacity={0.25} />
            <line x1={180} y1={800} x2={1260} y2={800} stroke={C.faint} strokeWidth={2} />
            <g opacity={fz(ballPh)}>
              {[1, 2, 3, 4].map((i) => (
                <line key={i} x1={ballX - 50 - i * 18} y1={ballY - 22 + i * 9} x2={ballX - 90 - i * 18} y2={ballY - 22 + i * 9} stroke={C.muted} strokeWidth={3} opacity={0.4} strokeLinecap="round" />
              ))}
              <g transform={`translate(${ballX} ${ballY}) rotate(${(t - cue(4)) * 540})`}>
                <circle r={42} fill="url(#ma-ball)" />
                <path d="M-30,-29 Q-8,0 -30,29" fill="none" stroke="#e0464f" strokeWidth={3.5} strokeDasharray="4 4" />
                <path d="M30,-29 Q8,0 30,29" fill="none" stroke="#e0464f" strokeWidth={3.5} strokeDasharray="4 4" />
              </g>
              {/* "gelombang"-nya rata total */}
              <line x1={ballX - 150} y1={ballY + 70} x2={ballX + 150} y2={ballY + 70} stroke={C.spr} strokeWidth={3} opacity={0.7} />
            </g>
            <Label x={700} y={420} size={26} color={C.ink} weight={600}>
              m = 0,145 kg · v = 40 m/s
            </Label>
            <g opacity={tiny}>
              <Label x={700} y={850} size={24} color={C.spr} weight={600}>
                gelombangnya "rata" — tak teramati
              </Label>
            </g>
            {/* tangga skala logaritmik */}
            <g opacity={ladder}>
              <line x1={LX} y1={ly(0)} x2={LX} y2={ly(-35)} stroke={C.muted} strokeWidth={3} />
              {Array.from({length: 36}, (_, i) => (
                <line key={i} x1={LX - (i % 5 ? 6 : 12)} y1={ly(-i)} x2={LX + (i % 5 ? 6 : 12)} y2={ly(-i)} stroke={C.muted} strokeWidth={i % 5 ? 1.5 : 2.5} opacity={0.7} />
              ))}
              <Label x={LX - 22} y={ly(0)} size={18} color={C.muted} anchor="end" font="mono">
                1 m
              </Label>
              {marks.map((m) => (
                <g key={m.e}>
                  <circle cx={LX} cy={ly(m.e)} r={6} fill={m.col} />
                  <Label x={LX + 24} y={ly(m.e)} size={21} color={m.col} anchor="start" weight={m.e === -34 ? 700 : 500}>
                    {m.txt}
                  </Label>
                </g>
              ))}
              <path d={`M${LX - 30},${ly(-16)} L${LX - 30},${ly(-33)}`} stroke={C.press} strokeWidth={2} strokeDasharray="4 6" />
              <Label x={LX - 42} y={ly(-24.5)} size={20} color={C.press} anchor="end" weight={600}>
                ≈ 19 orde lebih kecil
              </Label>
              <Label x={LX - 42} y={ly(-24.5) + 26} size={20} color={C.press} anchor="end" weight={600}>
                dari inti atom
              </Label>
              {/* penunjuk turun */}
              <path d={`M${LX - 34},${ly(ptrE) - 10} L${LX - 16},${ly(ptrE)} L${LX - 34},${ly(ptrE) + 10} Z`} fill={C.gold} />
              <Glow x={LX} y={ly(ptrE)} r={40} color="gold" opacity={0.8} />
            </g>
            <Twinkles x={LX} y={ly(-34)} rx={40} ry={16} n={3} color="press" opacity={tiny} seed={4} />
            <Motes x={700} y={600} rx={500} ry={160} n={10} color="ink" opacity={0.25} seed={9} />
          </Stage>
          <Formula x={790} y={252} p={card3} accent={C.press} size={56} caption="bola kasti: terlalu kecil untuk teramati">
            <V color={C.press}>λ</V> = <Frac n={<V>h</V>} d={<V>mv</V>} /> = <Frac n={<>6,63×10<Sup>−34</Sup></>} d="0,145 × 40" /> ≈{' '}
            <Tint c={C.press}>
              1,1×10<Sup>−34</Sup> m
            </Tint>
          </Formula>
        </AbsoluteFill>
      ) : null}
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="ma-shade" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
          </radialGradient>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp, win} from '../anim';
import {Arrow, Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Stage, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Bab 02 — λ, f, T, v. Gelombang analitik y = A sin(kx − ωt) (gerak lambat).
// Bagian 1: λ (kurung merah muda, ikut puncak yang berjalan), penghitung puncak di gerbang emas (f),
//   jam periode (jarum berputar satu kali tiap puncak lewat, T), lalu demonstrasi "satu T → maju tepat satu λ" → v = λf.
// Bagian 2: garpu tala (sumber) → bunyi di udara (rapatan + grafik tekanan), v ≈ 340 m/s, 440 Hz → λ ≈ 77 cm;
//   lalu bunyi masuk ke air: f tetap (sumber), v lebih besar (medium) → λ lebih panjang (kualitatif, tanpa angka).
const TAU = Math.PI * 2;
const sm = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const bump = (x: number, a: number, b: number, e = 60) => sm((x - a) / e) * sm((b - x) / e);
const line = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const fr = (v: number) => v - Math.floor(v);

// ---- bagian 1 ----
const WX0 = 160;
const WX1 = 1760;
const WY = 430;
const WA = 85;
const LAM = 520;
const PER = 2;
const KW = TAU / LAM;
const OM = TAU / PER;
const VW = LAM / PER;
const XG = 1240;
const CLX = 260;
const CLY = 715;
const CNX = 1590;
const CNY = 715;
const yW = (x: number, t: number) => WA * Math.sin(KW * x - OM * t);

// ---- bagian 2 ----
const FX = 280;
const FY = 440;
const SX0 = 350;
const XB = 980;
const SX1 = 1820;
const SA = 66;
const SF = 1.0;
const LA = 220;
const LWAT = LA * 1.6;
const OMS = TAU * SF;

const Bracket: React.FC<{x0: number; x1: number; y: number; color: string; label: React.ReactNode; op: number; down?: boolean; size?: number}> = ({x0, x1, y, color, label, op, down, size = 40}) => {
  if (op <= 0.01) return null;
  const s = down ? -1 : 1;
  return (
    <g opacity={op}>
      <path d={`M${x0},${y + 14 * s} L${x0},${y} L${x1},${y} L${x1},${y + 14 * s}`} fill="none" stroke={color} strokeWidth={3.5} strokeLinejoin="round" />
      <Label x={(x0 + x1) / 2} y={y - 30 * s} size={size} color={color} font="serif" italic weight={600}>
        {label}
      </Label>
    </g>
  );
};

export const Quantities: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  // ================= bagian 1 =================
  const opW = ramp(t, cue(0) - 0.9, cue(0) + 0.3) * (1 - ramp(t, cue(3) - 0.9, cue(3) + 0.1, EASE_IN_OUT));
  const wPts: [number, number][] = Array.from({length: 121}, (_, i) => {
    const x = WX0 + ((WX1 - WX0) * i) / 120;
    return [x, WY - yW(x, t)];
  });
  const edge = (x: number) => bump(x, WX0, WX1, 40);
  // kurung λ antara dua puncak berurutan (puncak: x = λ/4 + mλ + vt)
  const lamOp = win(t, wordOf(0, 'panjang') - 0.3, cue(2) - 0.7, 0.6, 0.6);
  const crestBase = LAM / 4 + VW * t;
  const mStart = Math.floor((WX0 - crestBase) / LAM);
  const crestXs = Array.from({length: 6}, (_, j) => crestBase + (mStart + j) * LAM).filter((x) => x > WX0 - LAM && x < WX1 + LAM);
  const puncak = win(t, wordOf(0, 'puncak') - 0.3, cue(1) + 0.4, 0.5, 0.6);
  // gerbang & penghitung
  const psi = (OM * t - KW * XG + Math.PI / 2) / TAU; // bilangan bulat saat puncak tepat di gerbang
  const gate = ramp(t, wordOf(1, 'banyak') - 0.3, wordOf(1, 'banyak') + 0.5) * (1 - ramp(t, cue(3) - 0.9, cue(3) + 0.1, EASE_IN_OUT));
  const cntOp = ramp(t, wordOf(1, 'frekuensi') - 0.5, wordOf(1, 'frekuensi') + 0.4);
  const clkOp = ramp(t, wordOf(1, 'periode') - 0.5, wordOf(1, 'periode') + 0.4);
  const n0 = Math.floor(psi);
  const n1 = n0 - Math.floor((OM * (wordOf(1, 'banyak') - 0.3) - KW * XG + Math.PI / 2) / TAU);
  const roll = sm(fr(psi) / 0.22);
  const count = Math.max(0, n1);
  const cntFlash = 1 - sm(fr(psi) / 0.5);
  // demonstrasi satu periode
  const ts = wordOf(2, 'periode') - 0.2;
  const mStar = Math.round((560 - LAM / 4 - VW * ts) / LAM);
  const xd0 = LAM / 4 + mStar * LAM + VW * ts;
  const dp = Math.min(1, Math.max(0, (t - ts) / PER));
  const demo = win(t, ts - 0.4, cue(3) - 1.0, 0.4, 0.6);
  const done = ramp(t, ts + PER - 0.05, ts + PER + 0.4);
  const xRide = xd0 + VW * Math.max(0, t - ts);
  const formV = win(t, wordOf(2, 'cepat') - 0.3, cue(3) - 1.0, 0.7, 0.6);
  const ghost: [number, number][] = Array.from({length: 81}, (_, i) => {
    const x = WX0 + ((WX1 - WX0) * i) / 80;
    return [x, WY - yW(x, ts)];
  });

  // ================= bagian 2 =================
  const t5 = cue(3) - 0.6;
  const opS = ramp(t, cue(3) - 0.5, cue(3) + 0.5);
  const wat = ramp(t, cue(5) - 0.2, cue(5) + 1.2, EASE_IN_OUT);
  const kA = TAU / LA;
  const kWt = TAU / LWAT;
  const kEff = kA + (kWt - kA) * wat;
  const phi = (x: number) => (x < XB ? OMS * t - kA * (x - SX0) : OMS * t - kA * (XB - SX0) - kEff * (x - XB));
  const front = SX0 + LA * SF * (t - t5);
  const sAmp = (x: number) => SA * sm((front - x) / 80) * (t > t5 ? 1 : 0);
  const sPts: [number, number][] = Array.from({length: 161}, (_, i) => {
    const x = SX0 + ((SX1 - SX0) * i) / 160;
    return [x, FY - sAmp(x) * Math.sin(phi(x))];
  });
  // posisi rapatan (puncak tekanan): φ = π/2 + 2πm
  const compX: number[] = [];
  for (let m = Math.floor((OMS * t) / TAU) + 1; m > Math.floor((OMS * t) / TAU) - 14; m--) {
    const xa = SX0 + (OMS * t - Math.PI / 2 - TAU * m) / kA;
    if (xa >= SX0 && xa < XB) compX.push(xa);
    const pb = OMS * t - kA * (XB - SX0) - Math.PI / 2 - TAU * m;
    const xb = XB + pb / kEff;
    if (xb >= XB && xb <= SX1) compX.push(xb);
  }
  const prong = 5 * Math.sin(OMS * t) * opS;
  const v340 = win(t, wordOf(3, 'merambat') - 0.3, cue(4) - 0.6, 0.6, 0.5);
  const vArrow = ramp(t, wordOf(3, 'merambat') - 0.3, wordOf(3, 'merambat') + 0.5);
  const hz = ramp(t, wordOf(4, 'hertz') - 0.6, wordOf(4, 'hertz') + 0.3);
  const lamA = win(t, wordOf(4, 'panjang') - 0.4, dur, 0.6, 0.6);
  const formL = win(t, wordOf(4, 'panjang') - 0.3, cue(5) - 0.6, 0.7, 0.5);
  const res = ramp(t, wordOf(4, 'tujuh') - 0.2, wordOf(4, 'tujuh') + 0.5);
  const medium = ramp(t, wordOf(5, 'medium') - 0.4, wordOf(5, 'medium') + 0.4);
  const source = ramp(t, wordOf(5, 'sumber') - 0.4, wordOf(5, 'sumber') + 0.4);
  // pasangan puncak untuk kurung λ di udara & di air
  const airPairs = compX.filter((x) => x < XB).map((x) => ({x, op: bump(x, SX0 + 40, XB - 20 - LA, 40)}));
  const watPairs = compX.filter((x) => x >= XB).map((x) => ({x, op: bump(x, XB + 20, SX1 - 20 - TAU / kEff, 40)}));
  const end = 1 - ramp(t, dur - 0.6, dur + 0.4, EASE_IN_OUT);

  return (
    <AbsoluteFill style={{opacity: end}}>
      <Stage>
        <defs>
          <linearGradient id="qn-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3aa0ff" stopOpacity={0.26} />
            <stop offset="100%" stopColor="#123a7a" stopOpacity={0.42} />
          </linearGradient>
          <clipPath id="qn-cnt">
            <rect x={CNX - 60} y={CNY - 22} width={120} height={80} />
          </clipPath>
        </defs>
        <Motes x={960} y={500} rx={880} ry={320} n={28} color="cyan" opacity={0.3} seed={8} />

        {/* ================= bagian 1 ================= */}
        <g opacity={opW}>
          <Glow x={960} y={WY} r={720} color="cyan" opacity={0.16} />
          <line x1={WX0} y1={WY} x2={WX1} y2={WY} stroke={C.faint} strokeWidth={2} strokeDasharray="6 10" />
          {/* bayangan gelombang saat demonstrasi dimulai */}
          <path d={line(ghost)} fill="none" stroke={C.ink} strokeOpacity={0.3} strokeWidth={2.5} strokeDasharray="7 8" opacity={demo * ramp(t, ts, ts + 0.3)} />
          <path d={line(wPts)} fill="none" stroke={C.cyan} strokeOpacity={0.2} strokeWidth={14} strokeLinejoin="round" />
          <path d={line(wPts)} fill="none" stroke={C.cyan} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" />
          {/* titik medium (hanya naik-turun) */}
          {Array.from({length: 33}, (_, i) => {
            const x = WX0 + 25 + i * 48;
            return <circle key={i} cx={x} cy={WY - yW(x, t)} r={4} fill="#d9f6ff" opacity={0.65 * edge(x)} />;
          })}
          {/* puncak */}
          {crestXs.map((x, j) => (
            <g key={j} opacity={edge(x)}>
              <circle cx={x} cy={WY - WA} r={9} fill="#fff" opacity={0.9} />
              <circle cx={x} cy={WY - WA} r={22} fill="url(#soft-cyan)" />
              <Label x={x} y={WY - WA - 34} size={22} color={C.ink} font="mono" opacity={puncak}>
                puncak
              </Label>
            </g>
          ))}
          {/* kurung λ yang ikut puncak berjalan */}
          {crestXs.map((x, j) => (
            <g key={`b${j}`}>
              <line x1={x} y1={WY - WA - 6} x2={x} y2={WY - WA - 60} stroke={C.press} strokeOpacity={0.6} strokeWidth={2} strokeDasharray="3 5" opacity={lamOp * bump(x, WX0 + 120, WX1 - 120 - LAM, 110)} />
              <line x1={x + LAM} y1={WY - WA - 6} x2={x + LAM} y2={WY - WA - 60} stroke={C.press} strokeOpacity={0.6} strokeWidth={2} strokeDasharray="3 5" opacity={lamOp * bump(x, WX0 + 120, WX1 - 120 - LAM, 110)} />
              <Bracket x0={x} x1={x + LAM} y={WY - WA - 64} color={C.press} label="λ" op={lamOp * bump(x, WX0 + 120, WX1 - 120 - LAM, 110)} size={48} />
            </g>
          ))}
          {/* gerbang penghitung */}
          <g opacity={gate}>
            <line x1={XG} y1={WY - WA - 40} x2={XG} y2={WY + WA + 40} stroke={C.gold} strokeWidth={3} strokeDasharray="8 7" />
            <Ripple x={XG} y={WY - WA} p={fr(psi) / 0.55} r={90} color="gold" rings={1} width={3} />
            <circle cx={XG} cy={WY - yW(XG, t)} r={30} fill="url(#soft-gold)" />
            <circle cx={XG} cy={WY - yW(XG, t)} r={11} fill={C.gold} stroke="#fff3c4" strokeWidth={2} />
            <Label x={XG} y={WY + WA + 62} size={22} color={C.gold} font="mono">
              gerbang
            </Label>
          </g>
          {/* penghitung puncak (f) */}
          <g opacity={cntOp * gate}>
            <rect x={CNX - 150} y={CNY - 70} width={300} height={150} rx={18} fill="rgba(13,20,48,0.85)" stroke={C.gold} strokeOpacity={0.5 + 0.5 * cntFlash} strokeWidth={2.5} />
            <Label x={CNX} y={CNY - 46} size={21} color={C.muted} font="mono">
              puncak lewat
            </Label>
            <g clipPath="url(#qn-cnt)">
              <text x={CNX} y={CNY + 18 - 70 * roll} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontWeight={600} fontSize={58} fill={C.gold}>
                {Math.max(0, count - 1)}
              </text>
              <text x={CNX} y={CNY + 18 + 70 * (1 - roll)} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontWeight={600} fontSize={58} fill={C.gold}>
                {count}
              </text>
            </g>
            <Label x={CNX} y={CNY + 108} size={26} color={C.gold} weight={600}>
              <tspan fontFamily={FONT.serif} fontStyle="italic">f</tspan> = puncak per detik
            </Label>
          </g>
          {/* jam periode (T) */}
          <g opacity={clkOp * gate}>
            <circle cx={CLX} cy={CLY} r={72} fill="#0e1736" stroke={C.gold} strokeOpacity={0.8} strokeWidth={3.5} />
            <path
              d={(() => {
                const a = TAU * fr(psi);
                const large = a > Math.PI ? 1 : 0;
                return `M${CLX},${CLY} L${CLX},${CLY - 62} A62,62 0 ${large} 1 ${CLX + 62 * Math.sin(a)},${CLY - 62 * Math.cos(a)} Z`;
              })()}
              fill={C.gold}
              opacity={0.18}
            />
            {Array.from({length: 12}, (_, j) => {
              const a = (j / 12) * TAU;
              return <line key={j} x1={CLX + 58 * Math.sin(a)} y1={CLY - 58 * Math.cos(a)} x2={CLX + 66 * Math.sin(a)} y2={CLY - 66 * Math.cos(a)} stroke={C.ink} strokeOpacity={0.6} strokeWidth={j % 3 === 0 ? 3.5 : 2} />;
            })}
            <line x1={CLX} y1={CLY} x2={CLX + 56 * Math.sin(TAU * fr(psi))} y2={CLY - 56 * Math.cos(TAU * fr(psi))} stroke={C.gold} strokeWidth={4.5} strokeLinecap="round" />
            <circle cx={CLX} cy={CLY} r={6} fill={C.gold} />
            <Ripple x={CLX} y={CLY} p={fr(psi) / 0.5} r={120} color="gold" rings={1} width={2} />
            <Label x={CLX + 130} y={CLY - 20} size={44} color={C.gold} font="serif" italic weight={600} anchor="start">
              T
            </Label>
            <Label x={CLX + 130} y={CLY + 26} size={22} color={C.muted} font="sans" anchor="start">
              waktu antarpuncak
            </Label>
          </g>
          {/* demonstrasi: satu periode → maju satu λ */}
          <g opacity={demo}>
            <Arrow x1={xd0} y1={WY - WA - 50} x2={xd0 + LAM * dp} y2={WY - WA - 50} color="work" width={6} pulse={false} />
            <Label x={xd0 + LAM / 2} y={WY - WA - 90} size={30} color={C.gold} weight={600} opacity={done}>
              dalam 1 <tspan fontFamily={FONT.serif} fontStyle="italic">T</tspan>
            </Label>
            <Bracket x0={xd0} x1={xd0 + LAM} y={WY + WA + 34} color={C.press} label="tepat 1 λ" op={done} down size={34} />
            <Spark x={xRide} y={WY - WA} r={9} color="white" opacity={bump(xRide, WX0, WX1 - 40, 60)} />
            <Ripple x={xd0 + LAM} y={WY - WA} p={ramp(t, ts + PER - 0.1, ts + PER + 1.1, (z) => z)} r={120} color="work" rings={2} />
          </g>
          <Twinkles x={960} y={760} rx={260} ry={60} n={5} color="work" opacity={0.6 * formV} seed={9} />
        </g>

        {/* ================= bagian 2 ================= */}
        <g opacity={opS}>
          <Glow x={FX} y={FY} r={260} color="gold" opacity={0.25 + 0.2 * hz} />
          {/* air (medium kedua) */}
          <g opacity={wat}>
            <rect x={XB} y={FY - 150} width={SX1 - XB + 20} height={300} rx={10} fill="url(#qn-water)" />
            <line x1={XB} y1={FY - 150} x2={XB} y2={FY + 150} stroke={C.water} strokeOpacity={0.7} strokeWidth={3} />
            {Array.from({length: 9}, (_, i) => {
              const ph = fr(t * 0.18 + i * 0.37);
              return <circle key={i} cx={XB + 60 + i * 88 + 10 * Math.sin(t + i)} cy={FY + 140 - ph * 280} r={3 + (i % 3)} fill="none" stroke="#bfe3ff" strokeWidth={1.5} opacity={0.5 * Math.min(1, ph * 6) * (1 - ph)} />;
            })}
          </g>
          <Label x={(SX0 + XB) / 2} y={FY + 182} size={28} color={C.ink} weight={600} opacity={wat}>
            udara
          </Label>
          <Label x={(XB + SX1) / 2} y={FY + 182} size={28} color={C.water} weight={600} opacity={wat}>
            air
          </Label>
          {/* rapatan */}
          {compX.map((x, j) => {
            const op = bump(x, SX0, SX1, 50) * sm((front - x) / 80);
            return <path key={j} d={`M${x - 16},${FY - 112} Q${x + 18},${FY} ${x - 16},${FY + 112}`} fill="none" stroke={C.cyan} strokeOpacity={0.32} strokeWidth={10} strokeLinecap="round" opacity={op} />;
          })}
          <line x1={SX0} y1={FY} x2={SX1} y2={FY} stroke={C.faint} strokeWidth={2} strokeDasharray="6 10" />
          <path d={line(sPts)} fill="none" stroke={C.cyan} strokeOpacity={0.2} strokeWidth={12} strokeLinejoin="round" />
          <path d={line(sPts)} fill="none" stroke={C.cyan} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
          {/* garpu tala */}
          <g>
            <line x1={FX} y1={FY + 92} x2={FX} y2={FY + 178} stroke="#9aa6d6" strokeWidth={12} strokeLinecap="round" />
            <path d={`M${FX - 26 - prong},${FY - 120} Q${FX - 26 - prong * 0.5},${FY - 20} ${FX - 26},${FY + 60} Q${FX - 26},${FY + 92} ${FX},${FY + 92} Q${FX + 26},${FY + 92} ${FX + 26},${FY + 60} Q${FX + 26 + prong * 0.5},${FY - 20} ${FX + 26 + prong},${FY - 120}`} fill="none" stroke="#c9d3ee" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${FX - 30 - prong},${FY - 112} L${FX - 30 - prong * 0.5},${FY - 30}`} stroke="#fff" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
            {[0, 1].map((k) => (
              <path key={k} d={`M${FX + (k ? 52 : -52)},${FY - 92} q${k ? 10 : -10},16 0,32`} fill="none" stroke={C.gold} strokeWidth={3} strokeLinecap="round" opacity={0.4 + 0.4 * Math.abs(Math.sin(OMS * t))} />
            ))}
          </g>
          <Label x={FX + 10} y={FY - 168} size={20} color={C.muted} font="mono" anchor="start">
            gerak lambat
          </Label>
          {/* v */}
          <Arrow x1={SX0 + 110} y1={FY + 128} x2={SX0 + 110 + 220} y2={FY + 128} color="work" width={6} opacity={vArrow} />
          <g opacity={wat}>
            <Arrow x1={XB + 110} y1={FY + 128} x2={XB + 110 + 352} y2={FY + 128} color="work" width={6} />
          </g>
          {/* kurung λ */}
          {airPairs.map((p, j) => (
            <Bracket key={j} x0={p.x} x1={p.x + LA} y={FY - 136} color={C.press} label="" op={lamA * p.op} size={34} />
          ))}
          <Label x={(SX0 + XB) / 2 - 10} y={FY - 196} size={34} color={C.press} weight={600} opacity={lamA}>
            <tspan fontFamily={FONT.serif} fontStyle="italic">λ</tspan>
            {' ≈ 77 cm'}
          </Label>
          {watPairs.map((p, j) => (
            <Bracket key={`w${j}`} x0={p.x} x1={p.x + TAU / kEff} y={FY - 136} color={C.press} label="" op={wat * p.op} size={34} />
          ))}
          <Label x={(XB + SX1) / 2} y={FY - 196} size={30} color={C.press} weight={600} opacity={wat}>
            <tspan fontFamily={FONT.serif} fontStyle="italic">λ</tspan>
            {' lebih panjang'}
          </Label>
          <Twinkles x={(SX0 + XB) / 2} y={FY - 196} rx={150} ry={30} n={4} color="press" opacity={res * (1 - wat)} seed={2} />
          <Ripple x={FX} y={FY - 40} p={ramp(t, wordOf(5, 'sumber') - 0.1, wordOf(5, 'sumber') + 1.3, (z) => z)} r={180} color="gold" rings={2} />
          <Ripple x={XB + 300} y={FY} p={ramp(t, wordOf(5, 'medium') - 0.1, wordOf(5, 'medium') + 1.3, (z) => z)} r={260} color="work" rings={2} />
        </g>
      </Stage>

      <Formula x={960} y={770} p={formV} accent={C.work} size={68} caption={<>jarak λ ditempuh dalam waktu T = 1/f</>}>
        <V color={C.work}>v</V> = <V color={C.press}>λ</V> <V color={C.gold}>f</V>
      </Formula>
      <Formula x={960} y={770} p={v340} accent={C.work} size={62} caption="bunyi di udara">
        <V color={C.work}>v</V> ≈ <span style={{color: C.work}}>340 m/s</span>
      </Formula>
      <Formula x={1100} y={775} p={formL} accent={C.press} size={56}>
        <V color={C.press}>λ</V> ={' '}
        <Frac n={<V color={C.work}>v</V>} d={<V color={C.gold}>f</V>} /> ={' '}
        <Frac n={<span style={{color: C.work}}>340 m/s</span>} d={<span style={{color: C.gold}}>440 Hz</span>} /> ≈ <span style={{color: C.press, opacity: 0.4 + 0.6 * res}}>0,77 m</span>
      </Formula>
      <Note x={FX + 20} y={FY + 240} p={hz * opS} color={C.gold} size={28}>
        <span style={{color: C.gold, fontWeight: 600}}>440 Hz</span> · nada A
      </Note>
      <Note x={760} y={790} p={medium * opS} color={C.work} size={30}>
        <V color={C.work}>v</V> ditentukan <span style={{color: C.work}}>medium</span>
      </Note>
      <Note x={1320} y={790} p={source * opS} color={C.gold} size={30}>
        <V color={C.gold}>f</V> ditentukan <span style={{color: C.gold}}>sumber</span> · tetap
      </Note>
    </AbsoluteFill>
  );
};

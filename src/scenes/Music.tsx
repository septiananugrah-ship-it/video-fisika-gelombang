import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, smoothPath, win} from '../anim';
import {Arrow, Badge, Card, Formula, Glow, Label, Motes, Note, Ripple, Stage, Sub, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Alat musik: gitar dengan senar A (L = 65 cm, f₁ = 110 Hz) yang bergetar sebagai gelombang berdiri.
// Bentuk senar nyata = jumlah harmonik y = Σ aₙ sin(nπx/L) cos(nωt) (110, 220, 330 Hz, …) → spektrum = warna suara.
// Menekan fret memperpendek L → f₁ = 110·L/L' naik; simpul ikut bergeser. Getaran digambar gerak lambat & diperbesar.

const TW = 2 * Math.PI;
// ---- gitar ----
const NUT = 200;
const SAD = 1560;
const SL = SAD - NUT; // = 65 cm
const GY = 300;
const SY = [272, 284, 296, 308, 320, 332]; // senar; indeks 1 = senar A
const fretX = (n: number) => NUT + SL * (1 - Math.pow(2, -n / 12));
// ---- panel senar diperbesar ----
const PL = 300;
const PR = 1140;
const PW = PR - PL;
const F0 = 0.9; // Hz tampilan nada dasar (gerak lambat)
const A_N = [1, 0.5, 0.33, 0.25, 0.2, 0.17];
// ---- spektrum ----
const SX = (f: number) => 1270 + f * 0.72;
const BASE = 790;

const BODY: [number, number][] = [
  [946, 0],
  [952, -48],
  [975, -88],
  [1020, -104],
  [1110, -108],
  [1210, -97],
  [1290, -82],
  [1370, -100],
  [1470, -127],
  [1580, -134],
  [1690, -118],
  [1742, -72],
  [1760, 0],
];
const bodyD = (() => {
  const top = BODY.map(([x, h]): [number, number] => [x, GY + h]);
  const bot = BODY.slice(0, -1)
    .reverse()
    .map(([x, h]): [number, number] => [x, GY - h]);
  return smoothPath([...top, ...bot]) + ' Z';
})();

const cm = (px: number) => ((px / PW) * 65).toFixed(1).replace('.', ',');

export const Music: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const intro = ramp(t, -0.3, 1.2);
  const c2 = cue(2);
  const c3 = cue(3);

  // ---- fret: tekan di fret 5, lalu geser ke fret 12 (L/2 → satu oktaf) ----
  const leftAt = (tt: number) => {
    const p = ramp(tt, c3 + 0.8, c3 + 1.3, EASE_IN_OUT);
    const s = ramp(tt, c3 + 3.6, c3 + 4.8, EASE_IN_OUT);
    return mix(NUT, fretX(5 + 7 * s), p);
  };
  const ratioAt = (tt: number) => SL / (SAD - leftAt(tt));
  const hover = ramp(t, c3 + 0.1, c3 + 0.8) * (1 - ramp(t, dur - 1.0, dur));
  const press = ramp(t, c3 + 0.8, c3 + 1.3, EASE_IN_OUT);
  const leftX = leftAt(t);
  const ratio = ratioAt(t);
  const f1 = 110 * ratio;
  // fase terintegrasi (frekuensi berubah → fase tetap menyambung, tanpa loncatan)
  let acc = t;
  if (t > c3 + 0.8) {
    const dt = 1 / 30;
    for (let s = c3 + 0.8; s < t; s += dt) acc += (ratioAt(s) - 1) * Math.min(dt, t - s);
  }
  const ph = TW * F0 * acc;

  // ---- harmonik ----
  const fadeH = 1 - ramp(t, c3 - 0.3, c3 + 0.6, EASE_IN_OUT);
  const tDua = wordOf(2, 'dua');
  const tTiga = wordOf(2, 'tiga');
  const tDst = wordOf(2, 'seterusnya');
  const b2 = ramp(t, tDua - 0.2, tDua + 0.7);
  const b3 = ramp(t, tTiga - 0.2, tTiga + 0.7);
  const b4 = ramp(t, tDst - 0.2, tDst + 0.7);
  const w = [1, b2 * fadeH, b3 * fadeH, b4 * fadeH, b4 * fadeH, b4 * fadeH];
  const shape = (u: number) => {
    let s = 0;
    for (let n = 1; n <= 6; n++) if (w[n - 1] > 0.001) s += w[n - 1] * A_N[n - 1] * Math.sin(n * Math.PI * u) * Math.cos(n * ph);
    return s;
  };
  const mode = (n: number, u: number) => Math.sin(n * Math.PI * u) * Math.cos(n * ph);
  const whiteness = Math.max(b2 * fadeH, ramp(t, wordOf(2, 'Campuran') - 0.3, wordOf(2, 'Campuran') + 0.5) * fadeH);
  const strCol = interpolateColors(whiteness, [0, 1], [C.cyan, '#ffffff']);

  const rows = win(t, c2 + 0.2, c3 - 0.4, 0.8, 0.8);
  const sy = mix(650, 770, rows);
  const amp = mix(80, 30, rows);
  const pl = PL + (PW * (leftX - NUT)) / SL;
  const mainPts: [number, number][] = Array.from({length: 97}, (_, i) => {
    const u = i / 96;
    return [pl + (PR - pl) * u, sy - amp * shape(u)];
  });
  const env = win(t, wordOf(0, 'berdiri') - 0.3, c2, 0.8, 0.8);
  const envPts = (sg: number): [number, number][] => Array.from({length: 41}, (_, i) => [pl + ((PR - pl) * i) / 40, sy - sg * amp * Math.sin((Math.PI * i) / 40)]);
  const nodeLbl = win(t, wordOf(0, 'terikat') - 0.2, c2, 0.6, 0.8);
  const dimOn = ramp(t, cue(1) + 0.2, cue(1) + 0.9) * (1 - rows);
  const g2 = ramp(t, c3 + 1.5, c3 + 2.3) * (1 - ramp(t, dur - 1.0, dur));
  const mid = (pl + PR) / 2;

  // ---- senar A di gitar ----
  const gPts: [number, number][] = Array.from({length: 61}, (_, i) => {
    const u = i / 60;
    return [leftX + (SAD - leftX) * u, SY[1] - 6 * shape(u)];
  });

  // ---- teks kanan ----
  const note0 = win(t, wordOf(0, 'kedua') - 0.2, cue(1) - 0.4, 0.6, 0.5);
  const form1 = win(t, wordOf(1, 'seratus') - 0.4, c2 - 0.2, 0.7, 0.5);
  const specOn = ramp(t, c2 + 0.1, c2 + 0.8);
  const bw = [ramp(t, c2 + 0.3, c2 + 0.9), b2, b3, b4, b4, b4];
  const lblOut = 1 - ramp(t, c3 - 0.2, c3 + 0.4, EASE_IN_OUT);
  const warna = win(t, wordOf(2, 'warna') - 0.3, c3 - 0.5, 0.6, 0.5);
  const readout = ramp(t, c3 + 0.4, c3 + 1.0) * (1 - ramp(t, dur - 1.0, dur));
  const naik = ramp(t, wordOf(3, 'naik') - 0.3, wordOf(3, 'naik') + 0.4);

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="mu-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b4a2e" />
            <stop offset="55%" stopColor="#4a3020" />
            <stop offset="100%" stopColor="#2c1c14" />
          </linearGradient>
          <linearGradient id="mu-neck" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a1d17" />
            <stop offset="100%" stopColor="#15100e" />
          </linearGradient>
          <linearGradient id="mu-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.gold} />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <Motes x={900} y={300} rx={820} ry={150} n={26} color="cyan" opacity={0.35 * intro} seed={4} />
        {/* ---------------- gitar ---------------- */}
        <g opacity={intro} transform={`translate(0 ${(1 - intro) * 20})`}>
          <ellipse cx={1000} cy={448} rx={760} ry={12} fill="#000" opacity={0.25} />
          <path d={bodyD} fill="url(#mu-wood)" stroke="#a7825c" strokeWidth={3} />
          <path d={bodyD} fill="none" stroke="#e8c79a" strokeOpacity={0.25} strokeWidth={10} transform={`translate(0 0)`} strokeDasharray="2 14" />
          {/* lubang suara + rosette */}
          <circle cx={1180} cy={GY} r={74} fill="none" stroke="#d9b98a" strokeOpacity={0.5} strokeWidth={6} />
          <circle cx={1180} cy={GY} r={64} fill="none" stroke="#d9b98a" strokeOpacity={0.3} strokeWidth={2} />
          <circle cx={1180} cy={GY} r={58} fill="#0a0d1a" />
          {/* bunyi keluar dari lubang suara */}
          {[0, 1, 2].map((k) => {
            const q = (t * 0.45 + k / 3) % 1;
            return <circle key={k} cx={1180} cy={GY} r={60 + q * 150} fill="none" stroke={C.cyan} strokeWidth={2} opacity={cyc(q) * 0.22} />;
          })}
          {/* jembatan */}
          <rect x={1528} y={252} width={70} height={96} rx={10} fill="#1d130e" stroke="#7a5a3c" strokeWidth={2} />
          <line x1={SAD} y1={258} x2={SAD} y2={342} stroke="#f1e6d0" strokeWidth={4} />
          {SY.map((y) => (
            <circle key={y} cx={1584} cy={y} r={3.2} fill="#e9dcc4" />
          ))}
          {/* leher & kepala */}
          <polygon points={`190,256 96,246 90,354 190,344`} fill="url(#mu-neck)" stroke="#6d5440" strokeWidth={2} />
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <circle cx={116 + k * 26} cy={236} r={8} fill="#c9d2ee" opacity={0.8} />
              <circle cx={116 + k * 26} cy={364} r={8} fill="#c9d2ee" opacity={0.8} />
            </g>
          ))}
          <rect x={190} y={262} width={820} height={76} fill="url(#mu-neck)" stroke="#55402f" strokeWidth={2} />
          {[3, 5, 7, 9, 15, 17].map((n) => (
            <circle key={n} cx={(fretX(n) + fretX(n - 1)) / 2} cy={GY} r={6} fill="#e8e2d0" opacity={0.55} />
          ))}
          <circle cx={(fretX(12) + fretX(11)) / 2} cy={GY - 20} r={6} fill="#e8e2d0" opacity={0.55} />
          <circle cx={(fretX(12) + fretX(11)) / 2} cy={GY + 20} r={6} fill="#e8e2d0" opacity={0.55} />
          {Array.from({length: 19}, (_, i) => (
            <line key={i} x1={fretX(i + 1)} y1={263} x2={fretX(i + 1)} y2={337} stroke="#c9d2ee" strokeWidth={2.5} opacity={0.75} />
          ))}
          {[3, 5, 7, 9, 12].map((n) => (
            <text key={n} x={(fretX(n) + fretX(n - 1)) / 2} y={358} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={15} fill={C.muted}>
              {n}
            </text>
          ))}
          <rect x={192} y={260} width={9} height={80} fill="#efe6d2" />
          {/* senar lain (diam) */}
          {SY.map((y, i) =>
            i === 1 ? null : (
              <g key={y}>
                <line x1={NUT} y1={y} x2={SAD} y2={y} stroke="#cfd6ea" strokeWidth={1 + (5 - i) * 0.35} opacity={0.55} />
                <line x1={NUT} y1={y} x2={128 + (i % 3) * 26} y2={i < 3 ? 240 : 360} stroke="#cfd6ea" strokeWidth={1} opacity={0.35} />
              </g>
            ),
          )}
          {/* senar A: bagian di belakang jari diam, bagian bergetar */}
          <line x1={NUT} y1={SY[1]} x2={leftX} y2={SY[1]} stroke="#cfd6ea" strokeWidth={2.4} opacity={0.6} />
          <line x1={NUT} y1={SY[1]} x2={142} y2={240} stroke="#cfd6ea" strokeWidth={1} opacity={0.35} />
          <path d={smoothPath(gPts)} fill="none" stroke={strCol} strokeOpacity={0.3} strokeWidth={8} />
          <path d={smoothPath(gPts)} fill="none" stroke={strCol} strokeWidth={2.6} />
          {/* simpul di kedua ujung */}
          <circle cx={leftX} cy={SY[1]} r={6} fill={C.heat} opacity={nodeLbl + 0.6 * press} />
          <circle cx={SAD} cy={SY[1]} r={6} fill={C.heat} opacity={Math.max(nodeLbl, 0.6 * press)} />
          {/* jari menekan fret */}
          {hover > 0.01 ? (
            <g opacity={hover} transform={`translate(${leftX - 16} ${SY[1] - 34 * (1 - press)})`}>
              <ellipse cx={3} cy={6} rx={19} ry={27} fill="#000" opacity={0.3} />
              <ellipse cx={0} cy={0} rx={18} ry={26} fill="#e3b49a" stroke="#9c6b55" strokeWidth={2} />
              <ellipse cx={-4} cy={-9} rx={8} ry={10} fill="#f6d8c6" opacity={0.7} />
            </g>
          ) : null}
          <Label x={leftX - 16} y={214} size={22} color="muted" opacity={hover}>
            tekan fret
          </Label>
        </g>
        <Ripple x={NUT} y={SY[1]} p={(t - wordOf(0, 'terikat') + 0.2) / 1.2} r={60} color="heat" rings={2} />
        <Ripple x={SAD} y={SY[1]} p={(t - wordOf(0, 'terikat') + 0.2) / 1.2} r={60} color="heat" rings={2} />
        <Ripple x={leftX} y={SY[1]} p={(t - c3 - 1.0) / 1.2} r={70} color="heat" rings={2} />

        {/* ---------------- panel senar diperbesar ---------------- */}
        <g opacity={ramp(t, 0.4, 1.6)}>
          <Label x={720} y={474} size={18} font="mono" color="muted">
            senar A diperbesar · gerak lambat
          </Label>
          <Glow x={(pl + PR) / 2} y={sy} r={360} color="cyan" opacity={0.35} />
          {/* baris komponen harmonik */}
          {[1, 2, 3].map((n) => {
            const o = rows * (n === 1 ? 1 : n === 2 ? b2 : b3);
            if (o < 0.01) return null;
            const ry = [525, 598, 655][n - 1];
            const ra = 30 * A_N[n - 1];
            const col = [C.cyan, C.spr, C.water][n - 1];
            const pts: [number, number][] = Array.from({length: 61}, (_, i) => [PL + (PW * i) / 60, ry - ra * mode(n, i / 60)]);
            return (
              <g key={n} opacity={o}>
                <line x1={PL} y1={ry} x2={PR} y2={ry} stroke={C.faint} strokeWidth={1} strokeDasharray="3 6" />
                <path d={smoothPath(pts)} fill="none" stroke={col} strokeWidth={2.8} />
                {Array.from({length: n + 1}, (_, k) => (
                  <circle key={k} cx={PL + (PW * k) / n} cy={ry} r={4.5} fill={C.heat} />
                ))}
                <Label x={272} y={ry} size={22} font="mono" color="gold" anchor="end">
                  {110 * n} Hz
                </Label>
              </g>
            );
          })}
          <Label x={272} y={sy} size={21} color="ink" anchor="end" opacity={rows}>
            bentuk nyata
          </Label>
          {/* tiang penjepit */}
          <rect x={pl - 10} y={sy - 52} width={12} height={104} rx={4} fill="#5b6a9e" stroke="#9aa6d6" strokeWidth={1.5} opacity={1 - rows * 0.6} />
          <rect x={PR - 2} y={sy - 52} width={12} height={104} rx={4} fill="#5b6a9e" stroke="#9aa6d6" strokeWidth={1.5} opacity={1 - rows * 0.6} />
          {/* selubung gelombang berdiri */}
          <g opacity={env * 0.6}>
            <path d={smoothPath(envPts(1))} fill="none" stroke={C.cyan} strokeWidth={1.8} strokeDasharray="6 8" />
            <path d={smoothPath(envPts(-1))} fill="none" stroke={C.cyan} strokeWidth={1.8} strokeDasharray="6 8" />
          </g>
          {/* mode 2 bayangan (saat fret ditekan) */}
          {g2 > 0.01 ? (
            <path
              d={smoothPath(Array.from({length: 61}, (_, i): [number, number] => [pl + ((PR - pl) * i) / 60, sy - amp * 0.55 * mode(2, i / 60)]))}
              fill="none"
              stroke={C.spr}
              strokeWidth={2.4}
              opacity={0.75 * g2}
            />
          ) : null}
          {/* senar utama */}
          <path d={smoothPath(mainPts)} fill="none" stroke={strCol} strokeOpacity={0.25} strokeWidth={14} />
          <path d={smoothPath(mainPts)} fill="none" stroke={strCol} strokeWidth={4} />
          {/* simpul */}
          <circle cx={pl} cy={sy} r={8} fill={C.heat} />
          <circle cx={PR} cy={sy} r={8} fill={C.heat} />
          <circle cx={mid} cy={sy} r={7} fill={C.heat} opacity={g2} />
          <Label x={mid} y={sy + 36} size={20} color="heat" opacity={g2}>
            simpul
          </Label>
          <Label x={pl} y={sy - 72} size={22} color="heat" opacity={nodeLbl}>
            simpul
          </Label>
          <Label x={PR} y={sy - 72} size={22} color="heat" opacity={nodeLbl}>
            simpul
          </Label>
          <Label x={(pl + PR) / 2} y={sy - 106} size={22} color="cyan" opacity={nodeLbl}>
            perut
          </Label>
          {/* ukuran L */}
          <g opacity={dimOn}>
            <line x1={pl} y1={sy + 92} x2={pl} y2={sy + 122} stroke={C.muted} strokeWidth={1.5} />
            <line x1={PR} y1={sy + 92} x2={PR} y2={sy + 122} stroke={C.muted} strokeWidth={1.5} />
            <Arrow x1={pl + 4} y1={sy + 107} x2={PR - 4} y2={sy + 107} color="muted" width={2.5} both pulse={false} />
            <Label x={(pl + PR) / 2} y={sy + 136} size={26} font="mono" color="ink">
              {`L = ${cm(PR - pl)} cm`}
            </Label>
          </g>
        </g>

        {/* ---------------- spektrum ---------------- */}
        <g opacity={specOn}>
          <Label x={1515} y={520} size={20} font="mono" color="muted" opacity={1 - ramp(t, c3 - 0.5, c3 - 0.1)}>
            spektrum harmonik
          </Label>
          <line x1={1258} y1={BASE} x2={1790} y2={BASE} stroke={C.muted} strokeWidth={2} />
          {[0, 200, 400, 600].map((f) => (
            <g key={f}>
              <line x1={SX(f)} y1={BASE} x2={SX(f)} y2={BASE + 8} stroke={C.muted} strokeWidth={1.5} />
              <text x={SX(f)} y={BASE + 24} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={16} fill={C.muted}>
                {f}
              </text>
            </g>
          ))}
          <text x={1790} y={BASE + 50} textAnchor="end" dominantBaseline="central" fontFamily={FONT.mono} fontSize={16} fill={C.muted}>
            f (Hz)
          </text>
          {A_N.map((a, i) => {
            const n = i + 1;
            const x = SX(n * f1);
            const o = bw[i] * (1 - ramp(x, 1735, 1772));
            if (o < 0.01) return null;
            const h = 180 * a * bw[i] * (0.94 + 0.06 * Math.sin(t * 3 + n * 1.7));
            return (
              <g key={n} opacity={o}>
                <rect x={x - 13} y={BASE - h} width={26} height={h} rx={5} fill="url(#mu-bar)" />
                <circle cx={x} cy={BASE - h} r={16} fill="url(#soft-gold)" />
                <line x1={x - 13} y1={BASE - h} x2={x + 13} y2={BASE - h} stroke="#fff6d8" strokeWidth={2.5} strokeLinecap="round" />
                {n <= 3 ? (
                  <text x={x} y={BASE - h - 20} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={18} fill={C.gold} opacity={lblOut}>
                    {110 * n}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
        <Twinkles x={1515} y={566} rx={230} ry={30} n={5} color="gold" opacity={warna} seed={3} />
        <Twinkles x={1515} y={545} rx={180} ry={30} n={4} color="gold" opacity={naik * readout} seed={8} />
      </Stage>

      <Note x={1515} y={650} p={note0} color={C.heat}>
        kedua ujung terikat → <span style={{color: C.heat}}>simpul</span>
      </Note>
      <Formula
        x={1515}
        y={650}
        p={form1}
        accent={C.gold}
        caption={
          <span>
            <V color={C.press}>λ</V>
            <Sub>1</Sub> = 2<V>L</V> = 130 cm · setengah gelombang di senar
          </span>
        }
      >
        <V color={C.gold}>f</V>
        <Sub>1</Sub> = <span style={{color: C.gold}}>110 Hz</span>
      </Formula>
      <Badge x={1515} y={566} text="warna suara = campuran harmonik" color={C.gold} opacity={warna} size={24} />
      <Card x={1515} y={545} opacity={readout} accent={C.gold} style={{padding: '12px 28px'}}>
        <div style={{fontFamily: FONT.serif, fontSize: 44, whiteSpace: 'nowrap'}}>
          <V color={C.gold}>f</V>
          <Sub>1</Sub> = <span style={{color: C.gold, fontFamily: FONT.mono, fontSize: 40}}>{Math.round(f1)}</span> Hz
          <span style={{fontFamily: FONT.head, fontSize: 26, color: C.work, marginLeft: 18, opacity: 0.4 + 0.6 * naik}}>▲ nada naik</span>
        </div>
      </Card>
    </AbsoluteFill>
  );
};

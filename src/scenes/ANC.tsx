import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, win} from '../anim';
import {Formula, Glow, Label, Motes, Ripple, Stage, Stream, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Peredam bising aktif: mikrofon merekam bising (toska), elektronik membuat gelombang tandingan terbalik (ungu,
// y_t(x,t) = −g·y(x, t − τ)), jumlah di telinga (putih) hampir datar. Dengung rendah & teratur (mesin pesawat) teredam baik;
// bunyi tinggi & tak teratur kurang teredam karena keterlambatan τ yang sama menjadi selisih fase ωτ yang besar (kualitatif).

const TW = 2 * Math.PI;
const G = 0.94; // penguatan tandingan
const TAU = 0.035; // keterlambatan elektronik (tampilan)
// panel kanan
const X0 = 1040;
const X1 = 1790;
const ROWS = [300, 452, 612];
// bising dengung: sinus rendah + sedikit harmonik 2
const VW = 133; // px/dtk
const FL = 0.7; // Hz tampilan
const hum = (x: number, t: number) => {
  const ph = TW * FL * (x / VW - t);
  return Math.sin(ph) + 0.18 * Math.sin(2 * ph + 0.7);
};
// bunyi tinggi tak teratur (perbandingan)
const HI = [
  {f: 2.4, a: 0.45, p: 0.3},
  {f: 3.3, a: 0.35, p: 2.1},
  {f: 4.6, a: 0.3, p: 4.0},
];
const hiss = (x: number, t: number) => {
  let s = 0;
  for (const c of HI) s += c.a * Math.sin(TW * c.f * (x / VW - t) + c.p);
  return s * (0.75 + 0.35 * Math.sin(TW * 0.37 * (x / VW - t) + 1.3));
};
const lowC = (x: number, t: number) => Math.sin(TW * 0.5 * (x / VW - t));

const wavePts = (f: (x: number) => number, xa: number, xb: number, y: number, a: number, n = 120) => {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = xa + ((xb - xa) * i) / n;
    pts.push(`${x.toFixed(1)},${(y - a * f(x)).toFixed(1)}`);
  }
  return pts.join(' ');
};

/** Mesin jet tampak depan: kipas berputar. */
const Engine: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  const rot = t * 2.6;
  return (
    <g>
      <Glow x={x} y={y} r={170} color="cyan" opacity={0.3} />
      <circle cx={x} cy={y} r={104} fill="#1a2348" stroke="#9aa6d6" strokeWidth={6} />
      <circle cx={x} cy={y} r={94} fill="#0b1026" />
      {Array.from({length: 14}, (_, k) => {
        const a = rot + (k * TW) / 14;
        const p = (r: number, da: number) => `${(x + r * Math.cos(a + da)).toFixed(1)},${(y + r * Math.sin(a + da)).toFixed(1)}`;
        return <path key={k} d={`M${p(24, 0)} L${p(90, 0.08)} L${p(90, 0.36)} L${p(24, 0.22)} Z`} fill="#5b6a9e" stroke="#c9d2ee" strokeWidth={1} opacity={0.8} />;
      })}
      <circle cx={x} cy={y} r={24} fill="#c9d2ee" />
      <path d={`M${x},${y} m-12,0 a12,12 0 0 1 24,0`} fill="none" stroke="#2a3768" strokeWidth={3} transform={`rotate(${(rot * 180) / Math.PI} ${x} ${y})`} />
      <ellipse cx={x} cy={y + 122} rx={90} ry={8} fill="#000" opacity={0.3} />
    </g>
  );
};

export const ANC: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const intro = ramp(t, -0.3, 1.0);
  const c2 = cue(2);
  const c3 = cue(3);
  const out = 1 - ramp(t, dur - 0.9, dur, EASE_IN_OUT);

  const mic = ramp(t, wordOf(0, 'mikrofon') - 0.3, wordOf(0, 'mikrofon') + 0.4);
  const rowsOut = 1 - ramp(t, c3 - 0.3, c3 + 0.3, EASE_IN_OUT);
  const r0 = ramp(t, wordOf(0, 'mendengarkan') - 0.3, wordOf(0, 'mendengarkan') + 0.5) * rowsOut;
  const r1 = ramp(t, wordOf(1, 'tandingan') - 0.3, wordOf(1, 'tandingan') + 0.5) * rowsOut;
  const pk = win(t, wordOf(1, 'puncak') - 0.3, c2 + 0.5, 0.5, 0.8) * rowsOut;
  const r2 = ramp(t, c2 - 0.1, c2 + 0.6) * rowsOut;
  const form = win(t, wordOf(2, 'destruktif') - 0.5, c3 - 0.4, 0.7, 0.5);
  const quiet = ramp(t, wordOf(2, 'berkurang') - 0.8, wordOf(2, 'berkurang') + 0.6, EASE_IN_OUT);
  const anti = ramp(t, wordOf(1, 'tandingan') - 0.3, wordOf(1, 'tandingan') + 0.6);
  const cmp = ramp(t, c3 + 0.2, c3 + 0.9);
  const hlLow = ramp(t, wordOf(3, 'dengung') - 0.3, wordOf(3, 'dengung') + 0.4);
  const jet = ramp(t, wordOf(3, 'pesawat') - 0.4, wordOf(3, 'pesawat') + 0.4);

  // bising di telinga: tinggi sebelum tandingan aktif, turun setelah interferensi
  const level = mix(0.82, 0.12, quiet) * (0.92 + 0.08 * Math.sin(t * 7.3) * Math.sin(t * 3.1));
  const hx = 700; // pusat cangkir headphone
  const hy = 520;

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <Motes x={560} y={520} rx={460} ry={260} n={24} color="cyan" opacity={0.3 * intro} seed={11} />
        {/* ---------------- sumber bising ---------------- */}
        <g opacity={intro}>
          <Engine x={230} y={hy} t={t} />
          <Label x={230} y={hy + 160} size={22} color="cyan" opacity={1 - jet}>
            bising sekitar
          </Label>
          <Label x={230} y={hy + 160} size={22} color="cyan" opacity={jet}>
            mesin pesawat
          </Label>
          {/* muka gelombang bising yang menjalar ke kanan */}
          {[0, 1, 2, 3].map((k) => {
            const q = (((t * FL * 0.5 + k / 4) % 1) + 1) % 1;
            const r = 110 + q * 300;
            const a = 0.55;
            return (
              <path
                key={k}
                d={`M${(230 + r * Math.cos(-a)).toFixed(1)},${(hy + r * Math.sin(-a)).toFixed(1)} A${r},${r} 0 0 1 ${(230 + r * Math.cos(a)).toFixed(1)},${(hy + r * Math.sin(a)).toFixed(1)}`}
                fill="none"
                stroke={C.cyan}
                strokeWidth={2.5}
                opacity={cyc(q) * 0.4}
              />
            );
          })}
          <polyline points={wavePts((x) => hum(x, t), 345, 596, hy, 26, 60)} fill="none" stroke={C.cyan} strokeWidth={3} opacity={0.85} />
        </g>

        {/* ---------------- headphone (potongan) ---------------- */}
        <g opacity={intro}>
          {/* bando */}
          <path d={`M${hx - 10},382 C${hx - 10},240 ${hx + 130},205 ${hx + 230},205`} fill="none" stroke="#2a3460" strokeWidth={26} strokeLinecap="round" />
          <path d={`M${hx - 10},382 C${hx - 10},240 ${hx + 130},205 ${hx + 230},205`} fill="none" stroke="#9aa6d6" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
          {/* kepala & telinga (samar) */}
          <path d={`M${hx + 128},250 C${hx + 230},250 ${hx + 280},380 ${hx + 280},520 C${hx + 280},680 ${hx + 220},780 ${hx + 128},800`} fill="none" stroke="#3a4770" strokeWidth={3} opacity={0.7} />
          <path d={`M${hx + 150},470 C${hx + 120},470 ${hx + 118},585 ${hx + 152},585 C${hx + 170},585 ${hx + 172},555 ${hx + 160},540`} fill="none" stroke="#c8a99a" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
          <Glow x={hx + 150} y={hy} r={90} color="work" opacity={0.5 * quiet} />
          {/* cangkir */}
          <path d={`M${hx + 70},378 L${hx - 40},378 Q${hx - 100},378 ${hx - 100},440 L${hx - 100},600 Q${hx - 100},662 ${hx - 40},662 L${hx + 70},662`} fill="#1b2450" stroke="#9aa6d6" strokeWidth={5} />
          <path d={`M${hx + 70},398 L${hx - 30},398 Q${hx - 80},398 ${hx - 80},448 L${hx - 80},592 Q${hx - 80},642 ${hx - 30},642 L${hx + 70},642`} fill="#0b1026" stroke="none" />
          {/* bantalan busa */}
          <rect x={hx + 66} y={386} width={42} height={268} rx={20} fill="#3b3560" stroke="#7d74b0" strokeWidth={2} />
          {Array.from({length: 18}, (_, k) => (
            <circle key={k} cx={hx + 78 + (k % 2) * 18} cy={402 + k * 14} r={3} fill="#5b528a" />
          ))}
          {/* pengeras suara */}
          <rect x={hx - 30} y={492} width={22} height={56} rx={4} fill="#4a557f" />
          {(() => {
            const d = anti * 4 * hum(hx + 40, t);
            return (
              <path
                d={`M${hx - 8},496 L${hx + 36 + d},446 L${hx + 36 + d},594 L${hx - 8},544 Z`}
                fill="#2a3768"
                stroke={C.spr}
                strokeWidth={2.5}
              />
            );
          })()}
          {/* gelombang tandingan keluar dari pengeras */}
          {[0, 1, 2].map((k) => {
            const q = (((t * 0.8 + k / 3) % 1) + 1) % 1;
            const r = 20 + q * 40;
            return (
              <path
                key={k}
                d={`M${hx + 40 + r * 0.5},${hy - r} Q${hx + 40 + r * 1.1},${hy} ${hx + 40 + r * 0.5},${hy + r}`}
                fill="none"
                stroke={C.spr}
                strokeWidth={2.5}
                opacity={cyc(q) * anti * 0.9}
              />
            );
          })}
          {/* elektronik */}
          <rect x={hx - 62} y={588} width={46} height={30} rx={4} fill="#152040" stroke={C.gold} strokeWidth={1.5} />
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={hx - 56 + k * 11} y1={618} x2={hx - 56 + k * 11} y2={626} stroke={C.gold} strokeWidth={1.5} />
          ))}
          <Label x={hx - 39} y={700} size={19} color="muted">
            elektronik
          </Label>
          {/* mikrofon di luar cangkir */}
          <Glow x={hx - 104} y={430} r={60} color="gold" opacity={0.8 * mic} />
          <rect x={hx - 122} y={414} width={26} height={32} rx={8} fill="#2a3768" stroke={C.gold} strokeWidth={2.5} />
          {[0, 1, 2].map((k) => (
            <line key={k} x1={hx - 117} y1={421 + k * 8} x2={hx - 101} y2={421 + k * 8} stroke={C.gold} strokeWidth={1.5} opacity={0.8} />
          ))}
          <Label x={hx - 109} y={386} size={22} color="gold" opacity={0.4 + 0.6 * mic}>
            mikrofon
          </Label>
        </g>
        <Ripple x={hx - 109} y={430} p={(t - wordOf(0, 'mikrofon') + 0.2) / 1.2} r={80} color="gold" rings={2} />
        <Stream
          pts={[
            [hx - 109, 448],
            [hx - 80, 520],
            [hx - 50, 586],
          ]}
          color="cyan"
          n={5}
          speed={0.7}
          r={4}
          jitter={2}
          opacity={r0 + (1 - rowsOut) * 0.8}
        />
        <Stream
          pts={[
            [hx - 30, 586],
            [hx - 20, 560],
            [hx - 8, 534],
          ]}
          color="spr"
          n={4}
          speed={0.7}
          r={4}
          jitter={2}
          opacity={anti}
        />
        {/* pengukur bising di telinga */}
        <g opacity={intro}>
          <Label x={hx + 236} y={350} size={19} color="muted">
            di telinga
          </Label>
          <rect x={hx + 224} y={378} width={24} height={240} rx={8} fill="#0b1026" stroke="#3a4770" strokeWidth={2} />
          <rect x={hx + 228} y={614 - 232 * level} width={16} height={232 * level} rx={5} fill={C.cyan} opacity={0.35 + 0.5 * (1 - quiet)} />
          <rect x={hx + 228} y={614 - 232 * level} width={16} height={232 * level} rx={5} fill="#ffffff" opacity={0.6 * quiet} />
        </g>
        <Ripple x={hx + 150} y={hy} p={(t - wordOf(2, 'berkurang') + 0.3) / 1.4} r={120} color="work" rings={2} />

        {/* ---------------- panel tiga baris ---------------- */}
        {[
          {o: r0, y: ROWS[0], col: C.cyan, lbl: 'bising (didengar mikrofon)', f: (x: number) => hum(x, t)},
          {o: r1, y: ROWS[1], col: C.spr, lbl: 'gelombang tandingan (terbalik)', f: (x: number) => -G * hum(x, t - TAU)},
          {o: r2, y: ROWS[2], col: '#ffffff', lbl: 'jumlah di telinga', f: (x: number) => hum(x, t) - G * hum(x, t - TAU)},
        ].map((r, i) =>
          r.o > 0.01 ? (
            <g key={i} opacity={r.o}>
              <line x1={X0} y1={r.y} x2={X1} y2={r.y} stroke={C.faint} strokeWidth={1.2} strokeDasharray="4 7" />
              <polyline points={wavePts(r.f, X0, X1, r.y, 46)} fill="none" stroke={r.col} strokeOpacity={0.25} strokeWidth={10} />
              <polyline points={wavePts(r.f, X0, X1, r.y, 46)} fill="none" stroke={r.col} strokeWidth={i === 2 ? 4 : 3} />
              <text x={X0} y={r.y - 66} dominantBaseline="central" fontFamily={FONT.head} fontSize={23} fill={r.col} fontWeight={500}>
                {r.lbl}
              </text>
            </g>
          ) : null,
        )}
        <Label x={X0 - 28} y={(ROWS[0] + ROWS[1]) / 2} size={34} color="muted" opacity={r1}>
          +
        </Label>
        <Label x={X0 - 28} y={ROWS[2] - 40} size={34} color="muted" opacity={r2}>
          =
        </Label>
        {/* puncak ↔ lembah: garis penghubung pada setiap puncak bising */}
        <g opacity={pk}>
          {Array.from({length: 6}, (_, k) => {
            const lam = VW / FL;
            const x = X0 + ((((lam / 4 + VW * t - X0) % lam) + lam) % lam) + (k - 1) * lam;
            const edge = Math.min(ramp(x, X0, X0 + 40), 1 - ramp(x, X1 - 40, X1));
            if (edge <= 0.001) return null;
            return (
              <g key={k} opacity={edge}>
                <line x1={x} y1={ROWS[0] - 50} x2={x} y2={ROWS[1] + 50} stroke={C.gold} strokeWidth={2} strokeDasharray="5 6" />
                <circle cx={x} cy={ROWS[0] - 46 * hum(x, t)} r={6} fill={C.cyan} />
                <circle cx={x} cy={ROWS[1] + 46 * G * hum(x, t - TAU)} r={6} fill={C.spr} />
              </g>
            );
          })}
          <Label x={1640} y={(ROWS[0] + ROWS[1]) / 2 - 4} size={21} color="gold">
            puncak ↔ lembah
          </Label>
        </g>
        <Glow x={1415} y={ROWS[2]} r={260} color="white" opacity={0.18 * r2 * quiet} still />

        {/* ---------------- perbandingan ---------------- */}
        {[
          {x: 1040, title: 'dengung rendah, teratur', sub: 'mis. mesin pesawat', ok: true, hl: hlLow},
          {x: 1435, title: 'bunyi tinggi, tak teratur', sub: 'mis. suara orang', ok: false, hl: 0},
        ].map((b, i) => {
          const w = 355;
          const cy = 520;
          const f = (x: number) => (b.ok ? lowC(x, t) : hiss(x, t));
          const res = (x: number) => (b.ok ? lowC(x, t) - G * lowC(x, t - TAU) : hiss(x, t) - G * hiss(x, t - TAU));
          return (
            <g key={i} opacity={cmp * (i === 0 ? 1 : ramp(t, c3 + 0.7, c3 + 1.4))}>
              <Glow x={b.x + w / 2} y={cy} r={260} color={b.ok ? 'work' : 'heat'} opacity={0.25 + 0.3 * b.hl} />
              <rect x={b.x} y={250} width={w} height={560} rx={18} fill="#0d1532" stroke={b.ok ? C.work : C.heat} strokeOpacity={0.5 + 0.3 * b.hl} strokeWidth={2} />
              <text x={b.x + w / 2} y={290} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontSize={25} fontWeight={600} fill={C.ink}>
                {b.title}
              </text>
              <text x={b.x + w / 2} y={324} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.sans} fontSize={19} fill={C.muted}>
                {b.sub}
              </text>
              <text x={b.x + 24} y={386} dominantBaseline="central" fontFamily={FONT.mono} fontSize={17} fill={C.cyan}>
                bising
              </text>
              <polyline points={wavePts(f, b.x + 24, b.x + w - 24, 470, 50, 140)} fill="none" stroke={C.cyan} strokeWidth={2.5} opacity={0.8} />
              <text x={b.x + 24} y={574} dominantBaseline="central" fontFamily={FONT.mono} fontSize={17} fill="#ffffff">
                sisa di telinga
              </text>
              <line x1={b.x + 24} y1={656} x2={b.x + w - 24} y2={656} stroke={C.faint} strokeWidth={1} strokeDasharray="4 6" />
              <polyline points={wavePts(res, b.x + 24, b.x + w - 24, 656, 50, 140)} fill="none" stroke="#ffffff" strokeWidth={3.5} />
              <text x={b.x + w / 2} y={764} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontSize={24} fontWeight={600} fill={b.ok ? C.work : C.heat}>
                {b.ok ? '✓ teredam baik' : '✗ kurang teredam'}
              </text>
            </g>
          );
        })}
        <Twinkles x={1217} y={660} rx={150} ry={30} n={4} color="work" opacity={hlLow * cmp} seed={4} />
      </Stage>

      <Formula x={1415} y={790} p={form} accent="#ffffff" size={56} caption="interferensi destruktif: puncak bertemu lembah">
        <V color={C.cyan}>y</V> + (<span style={{color: C.spr}}>
          −<V color={C.spr}>y</V>
        </span>) ≈ <span style={{color: '#ffffff'}}>0</span>
      </Formula>
    </AbsoluteFill>
  );
};

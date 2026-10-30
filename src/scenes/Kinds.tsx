import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp, smoothPath, win} from '../anim';
import {Arrow, Glow, Label, Motes, Note, Ripple, Stage, Twinkles} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Bab 01 — getaran yang merambat. Semua gerak analitik per frame.
// (A) rantai partikel: partikel ke-i mengulang getaran sumber dengan tunda iΔ → y_i(t) = s(t − iΔ);
//     pola maju (panah hijau di puncak) sedangkan partikel bertanda emas hanya naik-turun.
// (B) transversal: tali dikibaskan tangan, y(x,t) = s(t − x/v) (getar ⊥ rambat);
// (C) longitudinal: slinki, simpangan mendatar ξ(x,t) = s(t − x/v) → rapatan & renggangan (getar ∥ rambat).
const TAU = Math.PI * 2;
const sm = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const bump = (x: number, a: number, b: number, e = 60) => sm((x - a) / e) * sm((b - x) / e);
/** sinyal sumber: mulai dari diam, amplitudo naik halus. */
const sig = (tau: number, A: number, f: number, rise: number) => (tau <= 0 ? 0 : A * sm(tau / rise) * Math.sin(TAU * f * tau));
const line = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

// ---- (A) rantai ----
const NA = 22;
const AX0 = 250;
const AX1 = 1670;
const AY = 450;
const AA = 70;
const AF = 0.6;
const DEL = 0.16;
const SP = (AX1 - AX0) / (NA - 1);
const MI = 12;
// plot mini
const PX0 = 620;
const PX1 = 1300;
const PY0 = 775;
const PWIN = 2.4;

// ---- (B) tali ----
const RX0 = 330;
const RX1 = 1640;
const RA = 66;
const RF = 0.7;
const RV = 420;
const RMK = 1010;

// ---- (C) slinki ----
const LX0 = 400;
const LX1 = 1640;
const NL = 56;
const LA = 26;
const LF = 0.7;
const LV = 350;
const LY = 655;
const LMK = 23;

const Ball: React.FC<{x: number; y: number; r?: number; gold?: boolean; op?: number}> = ({x, y, r = 14, gold, op = 1}) => (
  <g opacity={op}>
    <circle cx={x} cy={y} r={r * 2.4} fill={`url(#soft-${gold ? 'gold' : 'cyan'})`} opacity={gold ? 0.9 : 0.45} />
    <circle cx={x} cy={y} r={r} fill={gold ? '#ffcf5a' : '#2b6f9a'} stroke={gold ? '#fff3c4' : C.cyan} strokeWidth={2.5} />
    <circle cx={x - r * 0.32} cy={y - r * 0.34} r={r * 0.32} fill="#fff" opacity={0.55} />
  </g>
);

const Hand: React.FC<{x: number; y: number; op: number; push?: boolean}> = ({x, y, op, push}) => (
  <g opacity={op}>
    {push ? (
      <>
        <line x1={x - 150} y1={y} x2={x - 40} y2={y} stroke="#56628f" strokeWidth={10} strokeLinecap="round" />
        <path d={`M${x - 70},${y - 26} C${x - 52},${y - 34} ${x - 30},${y - 30} ${x - 18},${y - 20} L${x - 18},${y + 20} C${x - 30},${y + 30} ${x - 52},${y + 34} ${x - 70},${y + 26} Z`} fill="#2a3768" stroke={C.cyan} strokeOpacity={0.7} strokeWidth={2.5} />
      </>
    ) : (
      <>
        <path d={`M${x - 170},${y + 70} Q${x - 110},${y + 40} ${x - 46},${y + 6}`} fill="none" stroke="#56628f" strokeWidth={22} strokeLinecap="round" />
        <path d={`M${x - 58},${y - 22} C${x - 40},${y - 32} ${x - 12},${y - 28} ${x + 2},${y - 14} L${x + 2},${y + 16} C${x - 12},${y + 28} ${x - 40},${y + 30} ${x - 58},${y + 22} Z`} fill="#2a3768" stroke={C.cyan} strokeOpacity={0.7} strokeWidth={2.5} />
        {[-12, -2, 8].map((d) => (
          <line key={d} x1={x - 22} y1={y + d} x2={x - 4} y2={y + d} stroke={C.cyan} strokeOpacity={0.35} strokeWidth={2} />
        ))}
      </>
    )}
  </g>
);

export const Kinds: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  // ---------------- (A) rantai partikel ----------------
  const t0 = cue(0) + 0.5;
  const opA = ramp(t, cue(0) - 0.7, cue(0) + 0.4) * (1 - ramp(t, cue(2) - 0.9, cue(2) + 0.1, EASE_IN_OUT));
  const yA = (i: number, tt = t) => sig(tt - t0 - i * DEL, AA, AF, 0.8);
  const ptsA: [number, number][] = Array.from({length: NA}, (_, i) => [AX0 + i * SP, AY - yA(i)]);
  const nb = win(t, wordOf(0, 'tetangga') - 0.3, cue(1) + 0.5, 0.5, 0.8);
  const plotOp = ramp(t, wordOf(0, 'tetangga') - 0.2, wordOf(0, 'tetangga') + 0.6) * opA;
  const late = ramp(t, wordOf(0, 'terlambat') - 0.2, wordOf(0, 'terlambat') + 0.5);
  const l1 = ramp(t, cue(1) - 0.2, cue(1) + 0.6) * opA;
  const mk = ramp(t, wordOf(1, 'medium') - 0.3, wordOf(1, 'medium') + 0.4) * opA;
  const pola = ramp(t, wordOf(1, 'pola') - 0.3, wordOf(1, 'pola') + 0.5) * opA;
  // titik waktu → x pada plot mini
  const tx = (tau: number) => PX1 - ((t - tau) / PWIN) * (PX1 - PX0);
  const trace = (i: number) =>
    line(
      Array.from({length: 61}, (_, k) => {
        const tau = t - PWIN + (PWIN * k) / 60;
        return [tx(tau), PY0 - 0.48 * yA(i, tau)] as [number, number];
      }),
    );
  // puncak berurutan di plot mini (partikel 1 lalu partikel 2, berjarak Δt)
  const pairs = Array.from({length: 4}, (_, j) => {
    const m = Math.floor((t - t0) * AF) - j;
    const c0 = t0 + (0.25 + m) / AF;
    const c1 = c0 + DEL;
    const x0 = tx(c0);
    const x1 = tx(c1);
    const op = c0 > t0 + 0.8 ? bump(x0, PX0 + 30, PX1 - 50, 50) * bump(x1, PX0 + 30, PX1 + 40, 30) : 0;
    return {x0, x1, op};
  });
  // panah hijau menunggangi puncak yang berjalan
  const crests = Array.from({length: 4}, (_, j) => {
    const m = Math.floor((t - t0) * AF) - j;
    const ic = (t - t0 - (0.25 + m) / AF) / DEL;
    const x = AX0 + ic * SP;
    return {x, op: ic >= 0 && ic <= NA - 1 ? bump(x, AX0 + 40, AX1 - 30, 90) : 0};
  });
  const xm = AX0 + MI * SP;
  const ym = AY - yA(MI);

  // ---------------- (B) tali transversal ----------------
  const t2 = cue(2) + 0.25;
  const opB = ramp(t, cue(2) - 0.5, cue(2) + 0.6);
  const ry = mix(470, 330, ramp(t, cue(3) - 0.7, cue(3) + 0.6, EASE_IN_OUT));
  const yR = (x: number) => sig(t - t2 - (x - RX0) / RV, RA, RF, 0.6);
  const ropePts: [number, number][] = Array.from({length: 88}, (_, k) => {
    const x = RX0 + ((RX1 - RX0) * k) / 87;
    return [x, ry - yR(x)];
  });
  const ropeD = line(ropePts);
  const beads = Array.from({length: 26}, (_, k) => RX0 + 30 + k * 50);
  const trLab = ramp(t, wordOf(2, 'tegak') - 0.3, wordOf(2, 'tegak') + 0.5);
  const trName = ramp(t, wordOf(2, 'transversal') - 0.3, wordOf(2, 'transversal') + 0.5);
  const ymR = ry - yR(RMK);

  // ---------------- (C) slinki longitudinal ----------------
  const t3 = cue(3) + 0.25;
  const opL = ramp(t, cue(3) - 0.5, cue(3) + 0.6);
  const xi = (x: number) => sig(t - t3 - (x - LX0) / LV, LA, LF, 0.6);
  const loops = Array.from({length: NL}, (_, j) => {
    const x = LX0 + ((LX1 - LX0) * j) / (NL - 1);
    return x + xi(x);
  });
  const lgLab = ramp(t, wordOf(3, 'searah') - 0.3, wordOf(3, 'searah') + 0.5);
  const rap = ramp(t, wordOf(3, 'rapatan') - 0.3, wordOf(3, 'rapatan') + 0.5);
  const ren = ramp(t, wordOf(3, 'renggangan') - 0.3, wordOf(3, 'renggangan') + 0.5);
  const lgName = ramp(t, wordOf(3, 'longitudinal') - 0.3, wordOf(3, 'longitudinal') + 0.5);
  // pusat rapatan: kerapatan ∝ 1 − ∂ξ/∂x maksimum di fase τ = (m + ¼)/f… (ξ = A sin(2πf(t − x/v)))
  const kL = (TAU * LF) / LV;
  const lam = LV / LF;
  const comp = Array.from({length: 6}, (_, j) => {
    const m = Math.floor((t - t3) * LF) - j;
    // ∂ξ/∂x = −(2πf/v)A cos(...) → paling negatif (paling rapat) saat cos = 1 → 2πf(t − x/v) = 2πm
    const x = LX0 + LV * (t - t3 - m / LF);
    const front = LX0 + LV * (t - t3) - lam * 0.5;
    return {x, op: x < front ? bump(x, LX0 + 40, Math.min(LX1 - 20, front), 70) : 0};
  });
  const xmL = LX0 + ((LX1 - LX0) * LMK) / (NL - 1);

  // ---------------- baris 4: contoh ----------------
  const ex1 = ramp(t, wordOf(4, 'bunyi') - 0.3, wordOf(4, 'bunyi') + 0.5);
  const ex2 = ramp(t, wordOf(4, 'senar') - 0.3, wordOf(4, 'senar') + 0.5);
  const end = 1 - ramp(t, dur - 0.6, dur + 0.4, EASE_IN_OUT);

  return (
    <AbsoluteFill style={{opacity: end}}>
      <Stage>
        <defs>
          <linearGradient id="kd-comp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.cyan} stopOpacity={0} />
            <stop offset="50%" stopColor={C.cyan} stopOpacity={0.22} />
            <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Motes x={960} y={520} rx={880} ry={330} n={30} color="cyan" opacity={0.35} seed={4} />

        {/* ============ (A) rantai partikel ============ */}
        <g opacity={opA}>
          <Glow x={960} y={AY} r={700} color="cyan" opacity={0.18} />
          <line x1={AX0 - 30} y1={AY} x2={AX1 + 30} y2={AY} stroke={C.faint} strokeWidth={2} strokeDasharray="6 10" />
          {ptsA.map(([x], i) => (
            <line key={i} x1={x} y1={AY - 8} x2={x} y2={AY + 8} stroke={C.faint} strokeWidth={2} />
          ))}
          {/* rel & pegangan sumber */}
          <line x1={AX0} y1={AY - AA - 30} x2={AX0} y2={AY + AA + 30} stroke={C.gold} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="5 7" />
          <rect x={AX0 - 92} y={AY - yA(0) - 13} width={66} height={26} rx={10} fill="#2a3768" stroke={C.gold} strokeWidth={2.5} />
          <line x1={AX0 - 26} y1={AY - yA(0)} x2={AX0 - 14} y2={AY - yA(0)} stroke={C.gold} strokeWidth={4} />
          <Label x={AX0 - 20} y={AY + AA + 62} size={22} color={C.gold} font="mono">
            sumber getar
          </Label>
          <path d={smoothPath(ptsA)} fill="none" stroke={C.cyan} strokeOpacity={0.2} strokeWidth={12} />
          <path d={smoothPath(ptsA)} fill="none" stroke={C.cyan} strokeWidth={3} strokeOpacity={0.8} />
          {/* panah pola (hijau) */}
          <g opacity={l1}>
            {crests.map((c, j) =>
              c.op > 0.01 ? <Arrow key={j} x1={c.x - 55} y1={AY - AA - 48} x2={c.x + 55} y2={AY - AA - 48} color="work" width={6} opacity={c.op} pulse={false} /> : null,
            )}
          </g>
          <Label x={AX1 - 10} y={AY - AA - 110} size={28} color={C.work} anchor="end" opacity={pola} weight={600}>
            pola berjalan →
          </Label>
          {/* jejak tegak partikel bertanda */}
          <g opacity={mk}>
            <line x1={xm} y1={AY - AA - 14} x2={xm} y2={AY + AA + 14} stroke={C.gold} strokeOpacity={0.6} strokeWidth={2.5} strokeDasharray="4 6" />
            <Arrow x1={xm + 34} y1={AY} x2={xm + 34} y2={AY - AA + 6} color="gold" width={4} pulse={false} />
            <Arrow x1={xm + 34} y1={AY} x2={xm + 34} y2={AY + AA - 6} color="gold" width={4} pulse={false} />
            <Label x={xm} y={AY + AA + 62} size={26} color={C.gold} weight={600}>
              medium: hanya naik-turun di tempat
            </Label>
          </g>
          <Ripple x={xm} y={ym} p={ramp(t, wordOf(1, 'medium') - 0.1, wordOf(1, 'medium') + 1.2, (z) => z)} r={110} color="gold" rings={2} />
          {ptsA.map(([x, y], i) => (
            <Ball key={i} x={x} y={y} r={13} gold={i === 0} />
          ))}
          <Ball x={xm} y={ym} r={15} gold op={mk} />
          {/* nomor partikel 1 & 2 + cincin tetangga */}
          <g opacity={nb}>
            <circle cx={ptsA[1][0]} cy={ptsA[1][1]} r={24} fill="none" stroke={C.cyan} strokeWidth={3} />
            <Label x={ptsA[0][0]} y={ptsA[0][1] - 38} size={22} color={C.gold} font="mono">
              1
            </Label>
            <Label x={ptsA[1][0]} y={ptsA[1][1] - 38} size={22} color={C.cyan} font="mono">
              2
            </Label>
          </g>
          {/* plot mini simpangan–waktu */}
          <g opacity={plotOp}>
            <rect x={PX0 - 30} y={PY0 - 70} width={PX1 - PX0 + 60} height={140} rx={14} fill="rgba(13,20,48,0.72)" stroke={C.line} strokeWidth={2} />
            <line x1={PX0} y1={PY0} x2={PX1} y2={PY0} stroke={C.faint} strokeWidth={2} />
            <line x1={PX1} y1={PY0 - 52} x2={PX1} y2={PY0 + 52} stroke={C.muted} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="3 5" />
            <path d={trace(0)} fill="none" stroke={C.gold} strokeWidth={3.5} strokeLinejoin="round" />
            <path d={trace(1)} fill="none" stroke={C.cyan} strokeWidth={3.5} strokeLinejoin="round" />
            <circle cx={PX1} cy={PY0 - 0.48 * yA(0)} r={7} fill={C.gold} />
            <circle cx={PX1} cy={PY0 - 0.48 * yA(1)} r={7} fill={C.cyan} />
            <Label x={PX0 - 50} y={PY0 - 22} size={20} color={C.gold} font="mono" anchor="end">
              partikel 1
            </Label>
            <Label x={PX0 - 50} y={PY0 + 22} size={20} color={C.cyan} font="mono" anchor="end">
              partikel 2
            </Label>
            {pairs.map((p, j) =>
              p.op > 0.01 ? (
                <g key={j} opacity={p.op * late}>
                  <line x1={p.x0} y1={PY0 - 46} x2={p.x0} y2={PY0 - 58} stroke={C.gold} strokeWidth={2.5} />
                  <line x1={p.x1} y1={PY0 - 46} x2={p.x1} y2={PY0 - 58} stroke={C.cyan} strokeWidth={2.5} />
                  <line x1={p.x0} y1={PY0 - 52} x2={p.x1} y2={PY0 - 52} stroke={C.gold} strokeWidth={2.5} />
                </g>
              ) : null,
            )}
            <Label x={PX1 + 60} y={PY0 - 16} size={26} color={C.gold} anchor="start" opacity={late} weight={600}>
              Δt: sedikit
            </Label>
            <Label x={PX1 + 60} y={PY0 + 18} size={26} color={C.gold} anchor="start" opacity={late} weight={600}>
              terlambat
            </Label>
          </g>
        </g>

        {/* ============ (B) tali transversal ============ */}
        <g opacity={opB}>
          <Glow x={980} y={ry} r={520} color="cyan" opacity={0.16} />
          <line x1={RX0} y1={ry} x2={RX1} y2={ry} stroke={C.faint} strokeWidth={2} strokeDasharray="6 10" />
          <Hand x={RX0} y={ry - yR(RX0)} op={1} />
          <path d={ropeD} fill="none" stroke={C.cyan} strokeOpacity={0.22} strokeWidth={16} strokeLinejoin="round" />
          <path d={ropeD} fill="none" stroke={C.cyan} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
          {beads.map((x) => (
            <circle key={x} cx={x} cy={ry - yR(x)} r={4.5} fill="#d9f6ff" opacity={0.8} />
          ))}
          <line x1={RMK} y1={ry - RA - 12} x2={RMK} y2={ry + RA + 12} stroke={C.gold} strokeOpacity={0.55 * trLab} strokeWidth={2.5} strokeDasharray="4 6" />
          <Ball x={RMK} y={ymR} r={12} gold />
          <g opacity={trLab}>
            <Arrow x1={RMK - 38} y1={ry} x2={RMK - 38} y2={ry - RA + 4} color="gold" width={4} pulse={false} />
            <Arrow x1={RMK - 38} y1={ry} x2={RMK - 38} y2={ry + RA - 4} color="gold" width={4} pulse={false} />
            <Label x={RMK - 60} y={ry - RA - 34} size={24} color={C.gold} anchor="end" weight={600}>
              getar ↕
            </Label>
            <Arrow x1={RX1 - 200} y1={ry - RA - 40} x2={RX1 - 20} y2={ry - RA - 40} color="work" width={6} />
            <Label x={RX1 - 110} y={ry - RA - 78} size={24} color={C.work} weight={600}>
              rambat →
            </Label>
          </g>
          <Label x={RX0 - 10} y={ry - RA - 90} size={30} color={C.cyan} anchor="start" weight={700} opacity={trName} spacing={2}>
            TRANSVERSAL
          </Label>
          <Label x={RX0 + 236} y={ry - RA - 90} size={24} color={C.muted} anchor="start" opacity={trName} font="sans">
            getar ⊥ arah rambat
          </Label>
          <Ripple x={RMK} y={ry} p={ramp(t, wordOf(2, 'transversal') - 0.1, wordOf(2, 'transversal') + 1.3, (z) => z)} r={160} color="cyan" rings={2} />
        </g>

        {/* ============ (C) slinki longitudinal ============ */}
        <g opacity={opL}>
          <Glow x={1000} y={LY} r={520} color="cyan" opacity={0.14} />
          {/* pita rapatan bergerak */}
          {comp.map((c, j) =>
            c.op > 0.01 ? <rect key={j} x={c.x - lam * 0.16} y={LY - 70} width={lam * 0.32} height={140} fill="url(#kd-comp)" opacity={c.op} /> : null,
          )}
          <Hand x={LX0 - 26 + xi(LX0)} y={LY} op={1} push />
          <rect x={LX0 - 26 + xi(LX0)} y={LY - 56} width={14} height={112} rx={5} fill="#3b4a7a" stroke={C.cyan} strokeOpacity={0.6} strokeWidth={2} />
          {loops.map((x, j) => (
            <ellipse key={`b${j}`} cx={x} cy={LY} rx={8} ry={46} fill="none" stroke="#2c5f86" strokeWidth={3} strokeDasharray="0 72 74 0" />
          ))}
          <line x1={LX0} y1={LY - 46} x2={LX1} y2={LY - 46} stroke={C.cyan} strokeOpacity={0.06} strokeWidth={2} />
          {loops.map((x, j) => (
            <path key={j} d={`M${x},${LY - 46} C${x + 11},${LY - 30} ${x + 11},${LY + 30} ${x},${LY + 46}`} fill="none" stroke={j === LMK ? C.gold : C.cyan} strokeWidth={j === LMK ? 4 : 3} strokeLinecap="round" />
          ))}
          <g opacity={lgLab}>
            <Arrow x1={xmL - 4 - 46} y1={LY - 78} x2={xmL - 4 + 46} y2={LY - 78} color="gold" width={4} both pulse={false} />
            <Label x={xmL} y={LY - 112} size={24} color={C.gold} weight={600}>
              getar ↔
            </Label>
            <Arrow x1={LX1 - 200} y1={LY - 100} x2={LX1 - 20} y2={LY - 100} color="work" width={6} />
            <Label x={LX1 - 110} y={LY - 138} size={24} color={C.work} weight={600}>
              rambat →
            </Label>
          </g>
          {comp.map((c, j) =>
            c.op > 0.01 ? (
              <g key={`l${j}`} opacity={c.op}>
                <Label x={c.x} y={LY + 84} size={24} color={C.ink} weight={600} opacity={rap}>
                  rapatan
                </Label>
                <Label x={c.x + lam / 2} y={LY + 84} size={24} color={C.muted} opacity={ren * bump(c.x + lam / 2, LX0 + 40, LX1 - 20, 70)}>
                  renggangan
                </Label>
              </g>
            ) : null,
          )}
          <Label x={LX0 - 30} y={LY - 112} size={30} color={C.cyan} anchor="start" weight={700} opacity={lgName} spacing={2}>
            LONGITUDINAL
          </Label>
          <Label x={LX0 + 248} y={LY - 112} size={24} color={C.muted} anchor="start" opacity={lgName} font="sans">
            getar ∥ arah rambat
          </Label>
          <Ripple x={xmL} y={LY} p={ramp(t, wordOf(3, 'longitudinal') - 0.1, wordOf(3, 'longitudinal') + 1.3, (z) => z)} r={160} color="cyan" rings={2} />
          <Twinkles x={LX1 - 120} y={LY} rx={120} ry={60} n={4} color="cyan" opacity={0.5 * ex1} seed={3} />
          <Twinkles x={RX1 - 120} y={330} rx={120} ry={60} n={4} color="cyan" opacity={0.5 * ex2} seed={5} />
        </g>
        {/* unused helper guard (kL dipakai untuk dokumentasi kerapatan) */}
        <g opacity={0 * kL} />
      </Stage>
      <Note x={1640} y={ry + RA + 70} p={ex2} color={C.cyan} anchor="right" size={28}>
        senar gitar → <span style={{color: C.cyan}}>transversal</span>
      </Note>
      <Note x={1640} y={LY + 150} p={ex1} color={C.gold} anchor="right" size={28}>
        bunyi di udara → <span style={{color: C.cyan}}>longitudinal</span>
      </Note>
    </AbsoluteFill>
  );
};

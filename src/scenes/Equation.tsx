import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, pathOf, ramp, win} from '../anim';
import {Badge, Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Stage, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Persamaan gelombang berjalan y = A sin(kx − ωt) (ke +x), dihitung per frame.
// Tali: λ = 400 px, f = 0,4 Hz (gerak lambat) → v = λf = 160 px/s. Titik medium hanya naik-turun.
// "Bekukan waktu": laju waktu tali (τ) melambat mulus ke nol lalu jalan lagi → foto y(x).
// "Bekukan posisi": titik emas di x tetap → jejak y(t) = osilasi harmonik.

const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));

const X0 = 160;
const X1 = 1760;
const CY = 470;
const A = 88;
const LAM = 400;
const K = (2 * Math.PI) / LAM;
const F = 0.4;
const OM = 2 * Math.PI * F;
const XD = X0 + 600; // titik emas (u = 1,5 λ)
const TAU = Math.PI * 2;

// panel bawah
const PL0 = 160;
const PL1 = 930;
const PR0 = 990;
const PR1 = 1760;
const PT = 652;
const PB = 872;
const PY = 790;
const PA = 50;
const PS = 0.55; // skala foto (λ tampak 220 px)
const GX0 = PR0 + 50;
const GX1 = PR1 - 40;
const VEL = 80; // px/s jejak y(t)

const G = (u: number) => u * u * u - (u * u * u * u) / 2;
const cl = (x: number) => Math.max(0, Math.min(1, x));

export const Equation: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  // ---- jadwal ----
  const intro = ramp(t, -0.6, 0.8);
  const tf = wordOf(4, 'bekukan', 0) + 0.15; // bekukan waktu
  const t2 = wordOf(4, 'bekukan', 1); // bekukan posisi
  const fa = tf;
  const fd = 0.3;
  const fb = Math.max(tf + 1.2, t2 - 0.5);
  const fe = 0.4;
  const frozenAt = (s: number) => fd * G(cl((s - fa) / fd)) + Math.max(0, Math.min(s - (fa + fd), fb - (fa + fd))) + fe * (cl((s - fb) / fe) - G(cl((s - fb) / fe)));
  const tauOf = (s: number) => s - frozenAt(s);
  const tau = tauOf(t);
  const tauF = tauOf(tf + fd + 0.05);
  const frozen = ramp(t, tf, tf + 0.3) * (1 - ramp(t, fb, fb + fe, EASE_IN_OUT));

  const yAt = (X: number, tt: number) => CY - A * intro * Math.sin(K * (X - X0) - OM * tt);
  const yDot = yAt(XD, tau);

  const xOn = win(t, wordOf(1, 'posisinya') - 0.4, cue(3) - 0.6, 0.5, 0.6);
  const tOn = win(t, wordOf(1, 'waktunya') - 0.4, cue(3) - 0.6, 0.5, 0.6);
  const yOn = ramp(t, cue(1) - 0.2, cue(1) + 0.6);
  const card = ramp(t, wordOf(2, 'sinus') - 0.6, wordOf(2, 'sinus') + 0.3);
  const vOn = ramp(t, wordOf(2, 'kanan') - 0.4, wordOf(2, 'kanan') + 0.4);
  const kOn = slot(t, cue(3) - 0.2, cue(4) - 0.1);
  const lamP = ramp(t, wordOf(3, 'lambda') - 0.5, wordOf(3, 'lambda') + 0.4);
  const omP = ramp(t, wordOf(3, 'omega') - 0.5, wordOf(3, 'omega') + 0.3);
  const fotoP = ramp(t, tf + 0.1, tf + 0.9);
  const posP = ramp(t, t2 - 0.3, t2 + 0.5);
  const flash = Math.max(0, 1 - Math.abs(t - tf - 0.05) / 0.25);
  const push = 1 + 0.03 * ramp(t, -0.8, dur, EASE_IN_OUT);

  // tali (sum dari rumus)
  const rope: [number, number][] = Array.from({length: 201}, (_, i) => {
    const X = X0 + ((X1 - X0) * i) / 200;
    return [X, yAt(X, tau)];
  });
  const ropeD = pathOf(rope);

  // puncak yang diikuti panah v (dipudarkan saat berganti puncak)
  const cBase = X0 + 280;
  const xc0 = X0 + (Math.PI / 2 + OM * tau) / K;
  const ph = ((((xc0 - cBase) / LAM) % 1) + 1) % 1;
  const xc = cBase + ph * LAM;
  const crestOp = Math.min(1, ph * 5, (1 - ph) * 5);

  // foto (t tetap)
  const fotoPts: [number, number][] = Array.from({length: 121}, (_, i) => {
    const X = PL0 + 40 + ((PL1 - PL0 - 80) * i) / 120;
    const u = (X - (PL0 + 40)) / PS;
    return [X, PY - PA * Math.sin(K * u - OM * tauF)];
  });
  const fotoD = pathOf(fotoPts);

  // jejak y(t) di x tetap
  const s0 = t2 + 0.2;
  const pen = Math.min(GX1, GX0 + VEL * Math.max(0, t - s0));
  const sOld = Math.max(s0, t - (pen - GX0) / VEL);
  const nP = Math.max(2, Math.ceil((t - sOld) * 20));
  const trace: [number, number][] = Array.from({length: nP + 1}, (_, i) => {
    const s = sOld + ((t - sOld) * i) / nP;
    return [pen - (t - s) * VEL, PY - PA * Math.sin(K * 600 - OM * tauOf(s))];
  });
  const traceD = pathOf(trace);
  const penY = PY - PA * Math.sin(K * 600 - OM * tau);

  // fasor ω
  const phx = 1090;
  const phy = 750;
  const pr = 52;
  const ang = OM * tau;

  // jam t
  const clkA = t * 1.6;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '960px 520px'}}>
        <Stage>
          <Glow x={960} y={CY} r={620} color="cyan" opacity={0.18 * intro} />
          <Glow x={XD} y={yDot} r={120} color="gold" opacity={0.35 * intro} />
          <Motes x={960} y={CY} rx={760} ry={150} n={26} color="cyan" opacity={0.4 * intro} seed={3} />

          {/* sumbu setimbang */}
          <line x1={X0} y1={CY} x2={X1} y2={CY} stroke={C.muted} strokeOpacity={0.3 * intro} strokeWidth={2} strokeDasharray="6 10" />
          {/* tiang ujung kiri (sumber) */}
          <g opacity={intro}>
            <rect x={X0 - 34} y={CY - 130} width={20} height={260} rx={6} fill="#1a2550" stroke="#7d89b5" strokeWidth={2.5} />
            <circle cx={X0 - 6} cy={yAt(X0, tau)} r={10} fill="#c9d3ee" />
          </g>

          {/* kilatan foto */}
          <rect x={X0 - 40} y={CY - A - 60} width={X1 - X0 + 80} height={2 * A + 120} rx={20} fill="#fff" opacity={0.28 * flash} />
          <rect x={X0 - 40} y={CY - A - 60} width={X1 - X0 + 80} height={2 * A + 120} rx={20} fill="none" stroke={C.ink} strokeOpacity={0.35 * frozen} strokeWidth={3} strokeDasharray="14 10" />
          <Badge x={X1 - 120} y={CY - A - 60} text="⏸ waktu dibekukan" color={C.ink} opacity={frozen} size={22} />

          {/* tali */}
          <path d={ropeD} fill="none" stroke={C.cyan} strokeOpacity={0.22} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={intro} />
          <path d={ropeD} fill="none" stroke={C.cyan} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={intro} />

          {/* titik medium: hanya naik-turun */}
          {Array.from({length: 41}, (_, i) => {
            const X = X0 + i * 40;
            if (Math.abs(X - XD) < 1) return null;
            return <circle key={i} cx={X} cy={yAt(X, tau)} r={4.5} fill="#e6f8ff" opacity={0.8 * intro} />;
          })}
          <line x1={XD} y1={CY - A - 22} x2={XD} y2={CY + A + 22} stroke={C.gold} strokeOpacity={0.45 * intro} strokeWidth={2} strokeDasharray="4 7" />

          {/* panah y pada titik emas */}
          <line x1={XD + 26} y1={CY} x2={XD + 26} y2={yDot} stroke={C.cyan} strokeWidth={4} opacity={yOn * Math.min(1, Math.abs(yDot - CY) / 14)} markerEnd="url(#arrow-cyan)" />
          <Label x={XD + 50} y={(CY + yDot) / 2} size={30} font="serif" italic color={C.cyan} anchor="start" opacity={yOn * Math.min(1, Math.abs(yDot - CY) / 30)}>
            y
          </Label>

          {/* x: posisi */}
          <g opacity={xOn}>
            <line x1={X0} y1={CY + A + 48} x2={XD - 6} y2={CY + A + 48} stroke={C.ink} strokeWidth={3} markerEnd="url(#arrow-ink)" />
            <line x1={X0} y1={CY + A + 36} x2={X0} y2={CY + A + 60} stroke={C.ink} strokeWidth={3} />
            <Label x={(X0 + XD) / 2} y={CY + A + 78} size={32} font="serif" italic>
              x
            </Label>
          </g>
          {/* t: jam */}
          <g opacity={tOn} transform="translate(1560 720)">
            <circle r={54} fill="#111a3a" stroke={C.ink} strokeOpacity={0.8} strokeWidth={4} />
            {Array.from({length: 12}, (_, i) => (
              <circle key={i} cx={44 * Math.cos((i * TAU) / 12)} cy={44 * Math.sin((i * TAU) / 12)} r={2.5} fill={C.muted} />
            ))}
            <line x1={0} y1={0} x2={34 * Math.sin(clkA)} y2={-34 * Math.cos(clkA)} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
            <line x1={0} y1={0} x2={22 * Math.sin(clkA / 12)} y2={-22 * Math.cos(clkA / 12)} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
            <circle r={5} fill={C.gold} />
            <Label x={84} y={0} size={34} font="serif" italic anchor="start">
              t
            </Label>
          </g>

          {/* panah v mengikuti satu puncak */}
          <g opacity={vOn * crestOp * (1 - 0.7 * frozen) * (1 - ramp(t, cue(4) - 0.4, cue(4) + 0.2, EASE_IN_OUT))}>
            <line x1={xc - 56} y1={CY - A - 34} x2={xc + 56} y2={CY - A - 34} stroke={C.work} strokeWidth={5} markerEnd="url(#arrow-work)" />
            <Label x={xc + 84} y={CY - A - 34} size={30} font="serif" italic color={C.work}>
              v
            </Label>
          </g>

          {/* λ & k (baris 3) */}
          <g opacity={kOn * lamP}>
            {[0, 1].map((j) => (
              <line key={j} x1={X0 + 200 + j * LAM} y1={CY + A + 24} x2={X0 + 200 + j * LAM} y2={CY + A + 58} stroke={C.press} strokeWidth={3} />
            ))}
            <line x1={X0 + 206} y1={CY + A + 41} x2={X0 + 194 + LAM} y2={CY + A + 41} stroke={C.press} strokeWidth={3.5} markerEnd="url(#arrow-press)" markerStart="url(#arrow-press)" />
            <Label x={X0 + 200 + LAM / 2} y={CY + A + 72} size={30} font="serif" italic color={C.press}>
              λ
            </Label>
          </g>
          {/* fasor ω */}
          <g opacity={kOn * omP}>
            <circle cx={phx} cy={phy} r={pr} fill="none" stroke={C.gold} strokeOpacity={0.5} strokeWidth={3} />
            <line x1={phx} y1={phy} x2={phx + pr * Math.cos(ang)} y2={phy - pr * Math.sin(ang)} stroke={C.gold} strokeWidth={4} />
            <circle cx={phx + pr * Math.cos(ang)} cy={phy - pr * Math.sin(ang)} r={7} fill={C.gold} />
            <path
              d={`M${phx + (pr + 16) * Math.cos(0.4)},${phy - (pr + 16) * Math.sin(0.4)} A${pr + 16},${pr + 16} 0 0 0 ${phx + (pr + 16) * Math.cos(1.3)},${phy - (pr + 16) * Math.sin(1.3)}`}
              fill="none"
              stroke={C.gold}
              strokeWidth={3}
              markerEnd="url(#arrow-gold)"
            />
          </g>

          {/* titik emas */}
          <Spark x={XD} y={yDot} r={10} color="gold" opacity={intro} />
          {/* pin "x tetap" */}
          <g opacity={posP} transform={`translate(${XD} ${CY - A - 46})`}>
            <path d="M0,22 L-12,-4 A14,14 0 1 1 12,-4 Z" fill={C.gold} />
            <circle cx={0} cy={-8} r={5} fill={C.bg} />
          </g>
          <Ripple x={XD} y={yDot} p={ramp(t, t2 - 0.1, t2 + 1.2, (q) => q)} r={110} color="gold" rings={2} />
          <Ripple x={960} y={CY} p={ramp(t, tf, tf + 1.3, (q) => q)} r={420} color="white" rings={2} />

          {/* panel foto: t tetap */}
          <g opacity={fotoP}>
            <rect x={PL0} y={PT} width={PL1 - PL0} height={PB - PT} rx={18} fill="#0d1636" fillOpacity={0.88} stroke={C.ink} strokeOpacity={0.35} strokeWidth={2} />
            <g transform={`translate(${PL0 + 46} ${PT + 34})`}>
              <rect x={-24} y={-15} width={48} height={32} rx={6} fill="none" stroke={C.ink} strokeWidth={3} />
              <rect x={-9} y={-21} width={18} height={7} rx={2} fill={C.ink} />
              <circle cx={0} cy={1} r={9} fill="none" stroke={C.ink} strokeWidth={3} />
            </g>
            <Label x={PL0 + 86} y={PT + 34} size={25} anchor="start" weight={600}>
              t tetap → foto y(x)
            </Label>
            <line x1={PL0 + 40} y1={PY} x2={PL1 - 30} y2={PY} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <Label x={PL1 - 22} y={PY + 24} size={24} font="serif" italic color={C.muted}>
              x
            </Label>
            <path d={fotoD} fill="none" stroke={C.cyan} strokeOpacity={0.25} strokeWidth={12} strokeLinecap="round" />
            <path d={fotoD} fill="none" stroke={C.cyan} strokeWidth={4} strokeLinecap="round" />
          </g>
          {/* panel jejak: x tetap */}
          <g opacity={posP}>
            <rect x={PR0} y={PT} width={PR1 - PR0} height={PB - PT} rx={18} fill="#0d1636" fillOpacity={0.88} stroke={C.gold} strokeOpacity={0.4} strokeWidth={2} />
            <g transform={`translate(${PR0 + 40} ${PT + 34})`}>
              <path d="M0,14 L-9,-3 A10,10 0 1 1 9,-3 Z" fill={C.gold} />
            </g>
            <Label x={PR0 + 70} y={PT + 34} size={25} anchor="start" weight={600}>
              x tetap → y(t): osilasi harmonik
            </Label>
            <line x1={GX0} y1={PY} x2={GX1 + 20} y2={PY} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <Label x={GX1 + 26} y={PY + 24} size={24} font="serif" italic color={C.muted}>
              t
            </Label>
            <path d={traceD} fill="none" stroke={C.gold} strokeOpacity={0.25} strokeWidth={12} strokeLinecap="round" />
            <path d={traceD} fill="none" stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
            <Spark x={pen} y={penY} r={7} color="gold" opacity={ramp(t, s0 - 0.2, s0 + 0.2)} />
          </g>
          <Twinkles x={960} y={225} rx={380} ry={70} n={5} color="gold" opacity={win(t, wordOf(2, 'sinus'), cue(3))} seed={4} />
        </Stage>
      </AbsoluteFill>

      <Note x={960} y={740} p={slot(t, cue(0) + 0.6, cue(1) + 0.2)} color={C.cyan} size={34}>
        <span style={{fontFamily: FONT.serif, fontStyle: 'italic'}}>y</span> = … ?
      </Note>
      <Note x={960} y={740} p={slot(t, cue(1) + 0.3, cue(2) + 0.3)} color={C.cyan} size={34}>
        simpangan <V color={C.cyan}>y</V>(<V>x</V>, <V>t</V>)
      </Note>
      <Formula x={960} y={222} p={card} accent={C.cyan} size={64} caption="gelombang berjalan ke kanan (+x)">
        <V color={C.cyan}>y</V> = <V color={C.cyan}>A</V> sin(<V color={C.press}>k</V>
        <V>x</V> − <V color={C.gold}>ω</V>
        <V>t</V>)
      </Formula>
      <Note x={640} y={770} p={kOn * lamP} color={C.press} size={34}>
        <V color={C.press}>k</V> = <Frac n="2π" d={<V color={C.press}>λ</V>} />
        <span style={{fontSize: 22, color: C.muted, marginLeft: 14}}>bilangan gelombang</span>
      </Note>
      <Note x={1420} y={750} p={kOn * omP} color={C.gold} size={34}>
        <V color={C.gold}>ω</V> = 2π<V color={C.gold}>f</V>
        <span style={{fontSize: 22, color: C.muted, marginLeft: 14}}>frekuensi sudut</span>
      </Note>
    </AbsoluteFill>
  );
};

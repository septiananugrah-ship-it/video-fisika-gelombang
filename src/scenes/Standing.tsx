import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, pathOf, ramp, win} from '../anim';
import {Formula, Frac, Glow, Label, Motes, Note, Part, Ripple, Spark, Stage, Sub, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Gelombang berdiri pada tali terikat di kedua ujung (dihitung per frame).
//  datang  y₁ = A sin(kx − ωt) (muka gelombang maju dengan v),
//  pantul  y₂ = A sin(kx + ωt) (muncul dari ujung kanan setelah muka gelombang tiba),
//  jumlah  y = 2A sin(kx) cos(ωt). Bobot muka gelombang sama di x = L → ujung kanan selalu simpul.
// Mode utama n = 3 (kL = 3π): simpul tiap λ/2 = L/3. Lalu mode n = 1..4 (fₙ = n f₁), percobaan f = 2,5 f₁ gagal, tangga frekuensi.

const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));
const cl = (x: number) => Math.max(0, Math.min(1, x));

const SX0 = 260;
const SX1 = 1660;
const LL = SX1 - SX0;
const SY = 500;
const A = 62;
const NM = 3;
const K = (NM * Math.PI) / LL;
const FQ = 0.5;
const OM = 2 * Math.PI * FQ;
const VV = ((2 * LL) / NM) * FQ;
const T0 = 0.3;

// tumpukan mode
const MX0 = 210;
const MX1 = 1050;
const ML = MX1 - MX0;
const ROWS = [360, 480, 600, 720];
const F1 = 0.35;
const MA = 34;

// panel kanan
const RX0 = 1390;
const RX1 = 1790;

export const Standing: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  const intro = ramp(t, -0.6, 0.8);
  const xf = VV * Math.max(0, t - T0);
  const wInc = (x: number) => { const q = cl((xf - x) / 180); return q * q * (3 - 2 * q); };
  const wRef = (x: number) => { const q = cl((x - (2 * LL - xf)) / 180); return q * q * (3 - 2 * q); };

  const mainOp = intro * (1 - ramp(t, cue(3) - 0.5, cue(3) + 0.3, EASE_IN_OUT));
  const compOp = 1 - 0.75 * ramp(t, cue(1) - 0.3, cue(1) + 1);
  const nodeOn = ramp(t, wordOf(1, 'simpul') - 0.4, wordOf(1, 'simpul') + 0.3);
  const antiOn = ramp(t, wordOf(1, 'perut') - 0.4, wordOf(1, 'perut') + 0.3);
  const envOn = ramp(t, cue(1) + 0.5, cue(1) + 1.5);
  const card1 = slot(t, cue(1) + 0.2, cue(3) - 0.1);
  const halfOn = ramp(t, wordOf(2, 'setengah') - 0.5, wordOf(2, 'setengah') + 0.4);
  const endsHi = win(t, wordOf(2, 'ujung') - 0.3, wordOf(2, 'muat'), 0.4, 0.6);
  const lNote = slot(t, wordOf(2, 'kelipatan') - 0.3, cue(3) - 0.1);
  const card2 = slot(t, cue(3) - 0.1, cue(5) - 0.1);
  const stackOn = ramp(t, cue(3) - 0.2, cue(3) + 0.6);
  const tryP = slot(t, cue(4) - 0.2, cue(5) - 0.1);
  const stairP = slot(t, cue(5) - 0.1, dur + 2);
  const chain1 = ramp(t, wordOf(5, 'batasan') - 0.4, wordOf(5, 'batasan') + 0.3);
  const chain2 = ramp(t, wordOf(5, 'diskret') - 0.4, wordOf(5, 'diskret') + 0.3);
  const chain3 = ramp(t, wordOf(5, 'kuantisasi') - 0.5, wordOf(5, 'kuantisasi') + 0.3);
  const push = 1 + 0.025 * ramp(t, -0.8, dur, EASE_IN_OUT);

  // tali utama
  const N = 180;
  const xs = Array.from({length: N + 1}, (_, i) => (LL * i) / N);
  const yi = xs.map((x) => A * Math.sin(K * x - OM * t) * wInc(x));
  const yr = xs.map((x) => A * Math.sin(K * x + OM * t) * wRef(x));
  const pIn = pathOf(xs.map((x, i) => [SX0 + x, SY - yi[i]]));
  const pRe = pathOf(xs.map((x, i) => [SX0 + x, SY - yr[i]]));
  const pSum = pathOf(xs.map((x, i) => [SX0 + x, SY - yi[i] - yr[i]]));
  const envU = pathOf(xs.map((x) => [SX0 + x, SY - 2 * A * Math.abs(Math.sin(K * x))]));
  const envD = pathOf(xs.map((x) => [SX0 + x, SY + 2 * A * Math.abs(Math.sin(K * x))]));
  const yLeft = -(yi[0] + yr[0]);

  // percobaan f = 2,5 f₁ (tidak tumbuh) vs f = 3 f₁ (tumbuh)
  const tA = cue(4) - 0.2;
  const RL = RX1 - RX0;
  const kT = (2.5 * Math.PI) / RL;
  const wob = 1 + 0.25 * Math.sin(2 * Math.PI * 0.45 * (t - tA));
  const tryPts: [number, number][] = Array.from({length: 61}, (_, i) => {
    const x = (RL * i) / 60;
    return [RX0 + x, 430 - 15 * wob * Math.sin(kT * (RL - x)) * Math.cos(2 * Math.PI * F1 * 2.5 * t)];
  });
  const GX0 = RX0 + 10;
  const GX1 = RX1;
  const GY = 700;
  const gT = 6.5;
  const gNow = cl((t - tA) / gT);
  const gN = Math.max(2, Math.round(60 * gNow));
  const okPts: [number, number][] = Array.from({length: gN + 1}, (_, i) => {
    const s = (gT * gNow * i) / gN;
    return [GX0 + ((GX1 - GX0) * s) / gT, GY - 110 * (1 - Math.exp(-s / 1.6))];
  });
  const badPts: [number, number][] = Array.from({length: gN + 1}, (_, i) => {
    const s = (gT * gNow * i) / gN;
    return [GX0 + ((GX1 - GX0) * s) / gT, GY - 18 * Math.abs(Math.sin(Math.PI * 0.45 * s)) - 4];
  });

  // tangga frekuensi
  const STX = 1420;
  const SW = 72;
  const stepY = (n: number) => 800 - n * 92;
  const hopPh = (((t - cue(5)) / 6) % 1 + 1) % 1;
  const hopU = hopPh * 5;
  const hj = Math.min(4, Math.floor(hopU));
  const hq = hopU - hj;
  const tread = (n: number): [number, number] => [STX + (n - 0.5) * SW, stepY(n) - 16];
  const hA = tread(hj + 1);
  const hB = tread(Math.min(5, hj + 2));
  const hx = hj >= 4 ? hA[0] : hA[0] + (hB[0] - hA[0]) * hq;
  const hy = hj >= 4 ? hA[1] : hA[1] + (hB[1] - hA[1]) * hq - 50 * Math.sin(Math.PI * hq);
  const hopOp = Math.min(1, hopPh * 8) * (1 - hopPh);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '960px 520px'}}>
        <Stage>
          <Glow x={960} y={SY} r={640} color="cyan" opacity={0.14 * mainOp} />
          <Motes x={960} y={SY} rx={760} ry={200} n={24} color="cyan" opacity={0.35 * mainOp} seed={12} />

          {/* ======= tali utama ======= */}
          <g opacity={mainOp}>
            {/* tiang */}
            {[SX0, SX1].map((X, i) => (
              <g key={i}>
                <rect x={X + (i ? 4 : -24)} y={SY - 150} width={20} height={300} rx={6} fill="#1a2550" stroke="#7d89b5" strokeWidth={2.5} />
                <circle cx={X} cy={i ? SY : SY + yLeft} r={9} fill="#c9d3ee" />
              </g>
            ))}
            <line x1={SX0} y1={SY} x2={SX1} y2={SY} stroke={C.muted} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="6 10" />
            <path d={envU} fill="none" stroke="#fff" strokeOpacity={0.3 * envOn} strokeWidth={2} strokeDasharray="5 8" />
            <path d={envD} fill="none" stroke="#fff" strokeOpacity={0.3 * envOn} strokeWidth={2} strokeDasharray="5 8" />
            <path d={pIn} fill="none" stroke={C.cyan} strokeWidth={3.5} opacity={0.85 * compOp} />
            <path d={pRe} fill="none" stroke={C.spr} strokeWidth={3.5} opacity={0.85 * compOp} />
            <path d={pSum} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={16} strokeLinecap="round" />
            <path d={pSum} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
            {/* arah datang & pantul */}
            <g opacity={win(t, 0.4, cue(1) + 0.4, 0.5, 0.8)}>
              <line x1={420} y1={SY - 2 * A - 46} x2={600} y2={SY - 2 * A - 46} stroke={C.cyan} strokeWidth={4} markerEnd="url(#arrow-cyan)" />
              <Label x={630} y={SY - 2 * A - 46} size={23} color={C.cyan} anchor="start" font="sans">
                datang
              </Label>
              <line x1={1500} y1={SY - 2 * A - 46} x2={1320} y2={SY - 2 * A - 46} stroke={C.spr} strokeWidth={4} markerEnd="url(#arrow-spr)" opacity={cl((xf - LL) / 200)} />
              <Label x={1290} y={SY - 2 * A - 46} size={23} color={C.spr} anchor="end" font="sans" opacity={cl((xf - LL) / 200)}>
                pantulan
              </Label>
            </g>
            <Ripple x={SX1} y={SY} p={ramp(t, T0 + LL / VV - 0.1, T0 + LL / VV + 1.1, (q) => q)} r={110} color="spr" rings={2} />
            {/* simpul */}
            {Array.from({length: NM + 1}, (_, m) => {
              const X = SX0 + (m * LL) / NM;
              const end = m === 0 || m === NM;
              return (
                <g key={m} opacity={nodeOn}>
                  <circle cx={X} cy={SY} r={13 + 4 * (end ? endsHi : 0)} fill={C.heat} opacity={0.3} />
                  <circle cx={X} cy={SY} r={8} fill={C.heat} />
                  {!end ? (
                    <Label x={X} y={SY + 2 * A + 30} size={24} color={C.heat} font="head" weight={600}>
                      simpul
                    </Label>
                  ) : null}
                </g>
              );
            })}
            {[0, 1].map((i) => (
              <Ripple key={i} x={i ? SX1 : SX0} y={SY} p={ramp(t, wordOf(2, 'ujung') - 0.2, wordOf(2, 'ujung') + 1.2, (q) => q)} r={90} color="heat" rings={2} />
            ))}
            {/* perut */}
            {Array.from({length: NM}, (_, m) => {
              const X = SX0 + ((m + 0.5) * LL) / NM;
              const yy = SY - 2 * A * Math.cos(OM * t) * Math.sin(K * (X - SX0));
              return (
                <g key={m} opacity={antiOn}>
                  <circle cx={X} cy={yy} r={8} fill={C.gold} />
                  <Label x={X} y={SY - 2 * A - 32} size={24} color={C.gold} font="head" weight={600}>
                    perut
                  </Label>
                </g>
              );
            })}
            {/* λ/2 */}
            <g opacity={halfOn}>
              {Array.from({length: NM}, (_, m) => {
                const xa = SX0 + (m * LL) / NM;
                const xb = SX0 + ((m + 1) * LL) / NM;
                return (
                  <g key={m}>
                    <line x1={xa + 8} y1={SY + 2 * A + 70} x2={xb - 8} y2={SY + 2 * A + 70} stroke={C.press} strokeWidth={3.5} markerEnd="url(#arrow-press)" markerStart="url(#arrow-press)" />
                    <Label x={(xa + xb) / 2} y={SY + 2 * A + 98} size={26} color={C.press} font="serif" italic>
                      λ/2
                    </Label>
                  </g>
                );
              })}
            </g>
          </g>

          {/* ======= tumpukan mode n = 1..4 ======= */}
          {ROWS.map((ry, i) => {
            const n = i + 1;
            const on = stackOn * ramp(t, cue(3) + i * 0.35, cue(3) + i * 0.35 + 0.5);
            if (on <= 0.001) return null;
            const kk = (n * Math.PI) / ML;
            const c = Math.cos(2 * Math.PI * F1 * n * t);
            const pts: [number, number][] = Array.from({length: 81}, (_, j) => {
              const x = (ML * j) / 80;
              return [MX0 + x, ry - MA * Math.sin(kk * x) * c];
            });
            const lamTxt = ['2L', 'L', '2L/3', 'L/2'][i];
            return (
              <g key={i} opacity={on}>
                <line x1={MX0} y1={ry} x2={MX1} y2={ry} stroke={C.muted} strokeOpacity={0.2} strokeWidth={2} strokeDasharray="4 8" />
                <rect x={MX0 - 12} y={ry - 26} width={8} height={52} rx={3} fill="#7d89b5" />
                <rect x={MX1 + 4} y={ry - 26} width={8} height={52} rx={3} fill="#7d89b5" />
                <path d={pathOf(pts)} fill="none" stroke="#fff" strokeOpacity={0.16} strokeWidth={12} />
                <path d={pathOf(pts)} fill="none" stroke="#fff" strokeWidth={3.5} />
                {Array.from({length: n + 1}, (_, m) => (
                  <circle key={m} cx={MX0 + (m * ML) / n} cy={ry} r={6} fill={C.heat} />
                ))}
                <Label x={MX0 - 32} y={ry} size={24} anchor="end" font="mono" color={C.ink}>
                  n={n}
                </Label>
                <Label x={MX1 + 36} y={ry} size={28} anchor="start" font="serif" italic color={C.gold}>
                  {n === 1 ? '' : n}f<tspan baselineShift="sub" fontSize="0.65em">1</tspan>
                </Label>
                <Label x={MX1 + 130} y={ry} size={24} anchor="start" font="serif" italic color={C.press}>
                  λ = {lamTxt}
                </Label>
              </g>
            );
          })}

          {/* ======= percobaan frekuensi sembarang ======= */}
          <g opacity={tryP}>
            <Label x={(RX0 + RX1) / 2} y={335} size={26} color={C.gold} font="serif" italic>
              coba f = 2,5 f<tspan baselineShift="sub" fontSize="0.65em">1</tspan>
            </Label>
            <rect x={RX0 - 22} y={430 - 22 + 6 * Math.cos(2 * Math.PI * F1 * 2.5 * t)} width={16} height={32} rx={4} fill="#2a3768" stroke={C.ink} strokeOpacity={0.5} strokeWidth={2} />
            <rect x={RX1 + 2} y={404} width={10} height={52} rx={3} fill="#7d89b5" />
            <line x1={RX0} y1={430 - MA} x2={RX1} y2={430 - MA} stroke="#fff" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="5 8" />
            <line x1={RX0} y1={430 + MA} x2={RX1} y2={430 + MA} stroke="#fff" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="5 8" />
            <path d={pathOf(tryPts)} fill="none" stroke={C.heat} strokeWidth={3.5} />
            <Label x={(RX0 + RX1) / 2} y={505} size={23} color={C.heat} font="head" weight={600}>
              ✗ pantulan tak sefase → tidak tumbuh
            </Label>
            {/* grafik amplitudo terhadap waktu */}
            <line x1={GX0} y1={GY} x2={GX1 + 16} y2={GY} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <line x1={GX0} y1={GY + 8} x2={GX0} y2={GY - 140} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <Label x={GX0 + 12} y={GY - 150} size={20} color={C.muted} anchor="start" font="sans">
              amplitudo
            </Label>
            <Label x={GX1 + 4} y={GY + 26} size={22} color={C.muted} font="serif" italic>
              t
            </Label>
            <path d={pathOf(okPts)} fill="none" stroke={C.work} strokeWidth={4} />
            <path d={pathOf(badPts)} fill="none" stroke={C.heat} strokeWidth={4} />
            <Label x={GX1 - 10} y={GY - 132} size={22} color={C.work} anchor="end" font="sans" opacity={cl(gNow * 3)}>
              3f₁ ✓
            </Label>
            <Label x={GX1 - 10} y={GY - 42} size={22} color={C.heat} anchor="end" font="sans" opacity={cl(gNow * 3)}>
              2,5f₁ ✗
            </Label>
          </g>

          {/* ======= tangga frekuensi diizinkan ======= */}
          <g opacity={stairP}>
            <Glow x={1590} y={540} r={300} color="gold" opacity={0.25} />
            <line x1={STX - 30} y1={812} x2={STX + 5 * SW + 30} y2={812} stroke={C.muted} strokeWidth={2} />
            <line x1={STX - 30} y1={812} x2={STX - 30} y2={290} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
            <Label x={STX - 44} y={300} size={24} color={C.gold} font="serif" italic anchor="end">
              f
            </Label>
            {/* rampa kontinu yang dicoret */}
            <line x1={STX} y1={800} x2={STX + 5 * SW} y2={stepY(5) + 10} stroke={C.muted} strokeOpacity={0.4} strokeWidth={3} strokeDasharray="6 8" />
            <Label x={STX + 3.4 * SW} y={780} size={20} color={C.muted} font="sans">
              sembarang ✗
            </Label>
            {Array.from({length: 5}, (_, i) => {
              const n = i + 1;
              const op = ramp(t, cue(5) + 0.2 + i * 0.25, cue(5) + 0.6 + i * 0.25);
              const x0 = STX + i * SW;
              return (
                <g key={i} opacity={op}>
                  <path d={`M${x0},${stepY(i)} L${x0},${stepY(n)} L${x0 + SW},${stepY(n)}`} fill="none" stroke={C.gold} strokeWidth={4} strokeLinejoin="round" opacity={i === 0 ? 0 : 0.5} />
                  <line x1={x0 + 4} y1={stepY(n)} x2={x0 + SW - 4} y2={stepY(n)} stroke={C.gold} strokeWidth={6} strokeLinecap="round" />
                  <Label x={x0 + SW / 2} y={stepY(n) - 26} size={22} color={C.gold} font="serif" italic>
                    {n === 1 ? '' : n}f<tspan baselineShift="sub" fontSize="0.65em">1</tspan>
                  </Label>
                </g>
              );
            })}
            <Spark x={hx} y={hy} r={8} color="gold" opacity={hopOp} />
          </g>
          <Twinkles x={960} y={222} rx={420} ry={60} n={6} color="gold" opacity={chain3 * stairP} seed={3} />
        </Stage>
      </AbsoluteFill>

      <Formula x={960} y={222} p={card1} accent={C.white} size={60}>
        <V>y</V> = 2<V color={C.cyan}>A</V> sin(<V color={C.press}>k</V>
        <V>x</V>) cos(<V color={C.gold}>ω</V>
        <V>t</V>)
      </Formula>
      <Note x={960} y={800} p={lNote} color={C.press} size={32}>
        <V>L</V> = <V>n</V> · <Frac n={<V color={C.press}>λ</V>} d="2" /> <span style={{color: C.muted, fontSize: 24, marginLeft: 12}}>(di sini n = 3)</span>
      </Note>
      <Formula x={960} y={222} p={card2} accent={C.gold} size={58}>
        <V color={C.press}>λ</V>
        <Sub color={C.press}>n</Sub> = <Frac n={<>2<V>L</V></>} d={<V>n</V>} />
        <span style={{display: 'inline-block', width: 70}} />
        <V color={C.gold}>f</V>
        <Sub color={C.gold}>n</Sub> = <V>n</V> <V color={C.gold}>f</V>
        <Sub color={C.gold}>1</Sub>
      </Formula>
      <Note x={960} y={222} p={stairP} color={C.gold} size={40}>
        <Part p={chain1}>batasan</Part>
        <Part p={chain2}>
          <span style={{color: C.muted}}> → </span>pilihan diskret
        </Part>
        <Part p={chain3} color={C.gold}>
          <span style={{color: C.muted}}> → </span>
          <b>kuantisasi</b>
        </Part>
      </Note>
    </AbsoluteFill>
  );
};

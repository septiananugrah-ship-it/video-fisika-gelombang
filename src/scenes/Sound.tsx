import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, pathOf, ramp, rand} from '../anim';
import {Person} from '../components/physics';
import {Glow, Label, Motes, Note, Ripple, Spark, Stage, Twinkles} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Bunyi = gelombang longitudinal: partikel udara bergeser ξ = s₀ sin(kx₀ − ωt) di tempat → rapatan (ξ' < 0) & renggangan merambat.
// Doppler: sumber bergerak v_s = 0,35c; muka gelombang ke-i dipancarkan pada tᵢ dari x_s(tᵢ) dengan jari-jari c(t − tᵢ).
// Di depan λ' = (c − v_s)T (pendek, nada naik, rona biru), di belakang λ' = (c + v_s)T (panjang, nada turun, rona merah).

const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));
const frac = (x: number) => ((x % 1) + 1) % 1;

// medan partikel
const FX0 = 300;
const FX1 = 1730;
const ROWS = 7;
const FY0 = 262;
const FDY = 34;
const S0 = 13;
const LAM = 300;
const KK = (2 * Math.PI) / LAM;
const FQ = 0.55;
const OM = 2 * Math.PI * FQ;

// Doppler
const DY = 545;
const CW = 170; // c (px/s)
const TE = 0.55; // periode pancaran
const VS = 0.35 * CW;
const AGE = 6.4;
const BLUE = '#5aa8ff';
const RED = '#ff5a6e';

const logX = (f: number) => 300 + ((Math.log10(f) - 0.7) / (5 - 0.7)) * 1340;

export const Sound: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  const intro = ramp(t, -0.6, 0.8);
  const t2 = cue(2) - 0.4;
  const fieldOp = intro * (1 - ramp(t, t2 - 0.3, t2 + 0.5, EASE_IN_OUT));
  const dopOp = ramp(t, t2, t2 + 0.9);
  const labOn = ramp(t, wordOf(0, 'rapatan') - 0.3, wordOf(0, 'rapatan') + 0.4);
  const pitchP = slot(t, wordOf(0, 'nada') - 0.4, cue(1) - 0.1);
  const loudP = Math.min(pitchP, ramp(t, wordOf(0, 'keras') - 0.4, wordOf(0, 'keras') + 0.3));
  const barP = slot(t, cue(1) - 0.1, t2 + 0.1);
  const frontP = ramp(t, wordOf(2, 'depan') - 0.5, wordOf(2, 'depan') + 0.3);
  const backP = ramp(t, wordOf(3, 'menjauh') - 0.4, wordOf(3, 'menjauh') + 0.3);
  const noteF = slot(t, wordOf(2, 'memendek') - 0.4, cue(3) - 0.1);
  const noteB = slot(t, wordOf(3, 'merenggang') - 0.4, wordOf(3, 'doppler') - 0.1);
  const noteD = slot(t, wordOf(3, 'doppler') - 0.1, dur + 2);
  const push = 1 + 0.025 * ramp(t, -0.8, dur, EASE_IN_OUT);

  const xi = (x0: number) => S0 * Math.sin(KK * (x0 - FX0) - OM * t);

  // label rapatan & renggangan mengikuti pola (pudar saat berganti)
  const xc0 = FX0 + (Math.PI + OM * t) / KK;
  const phC = frac((xc0 - 620) / LAM);
  const xcL = 620 + phC * LAM;
  const phR = frac((xc0 + LAM / 2 - 1100) / LAM);
  const xrL = 1100 + phR * LAM;
  const fadeEdge = (p: number) => Math.min(1, p * 5, (1 - p) * 5);

  // tekanan (−ξ')
  const presPts: [number, number][] = Array.from({length: 121}, (_, i) => {
    const X = FX0 + ((FX1 - FX0) * i) / 120;
    return [X, 518 + 22 * Math.cos(KK * (X - FX0) - OM * t)];
  });

  // sapuan frekuensi di batang pendengaran
  const sweepF = Math.pow(10, 1.301 + 3 * (0.5 - 0.5 * Math.cos(((t - cue(1)) / 4.5) * Math.PI)));
  const sweepX = logX(sweepF);

  // Doppler
  const xs = (s: number) => 420 + VS * (s - cue(2));
  const xsN = xs(t);
  const iMin = Math.ceil((t - AGE) / TE);
  const iMax = Math.floor(t / TE);
  const rings: {cx: number; r: number; op: number}[] = [];
  for (let i = iMin; i <= iMax; i++) {
    const ti = i * TE;
    const age = t - ti;
    if (age <= 0) continue;
    rings.push({cx: xs(ti), r: CW * age, op: Math.min(1, age / 0.25) * (1 - age / AGE)});
  }
  const lamF = (CW - VS) * TE;
  const lamB = (CW + VS) * TE;
  // posisi perpotongan muka gelombang di sumbu (depan & belakang)
  const iNow = Math.floor(t / TE);
  const rx = (i: number) => xs(i * TE) + CW * (t - i * TE);
  const lx = (i: number) => xs(i * TE) - CW * (t - i * TE);
  let jF = iNow;
  while (rx(jF) < xsN + 160 && jF > iMin) jF--;
  let jB = iNow;
  while (lx(jB) > xsN - 160 && jB > iMin) jB--;
  const pickF = Math.max(0, Math.min(0.999, (rx(jF) - (xsN + 160)) / lamF));
  const pickB = Math.max(0, Math.min(0.999, (xsN - 160 - lx(jB)) / lamB));
  const bF0 = rx(jF);
  const bF1 = rx(jF - 1);
  const bB0 = lx(jB);
  const bB1 = lx(jB - 1);
  const siren = 0.5 + 0.5 * Math.sin(t * 9);
  const wheel = (xsN / 18) * (180 / Math.PI);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '960px 520px'}}>
        <Stage>
          {/* ======= medan partikel udara ======= */}
          <g opacity={fieldOp}>
            <Glow x={1000} y={370} r={620} color="cyan" opacity={0.14} />
            <Motes x={1000} y={370} rx={720} ry={180} n={18} color="cyan" opacity={0.3} seed={21} />
            {/* pengeras suara */}
            <g transform={`translate(${200 + 0.8 * xi(FX0 - 60)} 365)`}>
              <rect x={-70} y={-80} width={46} height={160} rx={10} fill="#1a2550" stroke="#7d89b5" strokeWidth={3} />
              <path d="M-24,-40 L22,-110 L22,110 L-24,40 Z" fill="#2a3768" stroke={C.ink} strokeOpacity={0.6} strokeWidth={3} />
              <ellipse cx={22} cy={0} rx={10} ry={110} fill="#33427a" stroke={C.ink} strokeOpacity={0.6} strokeWidth={2} />
            </g>
            {Array.from({length: ROWS}, (_, r) =>
              Array.from({length: 48}, (_, j) => {
                const seed = r * 97 + j;
                const x0 = FX0 + j * 30 + (rand(seed) - 0.5) * 12;
                const y0 = FY0 + r * FDY + (rand(seed + 5) - 0.5) * 12;
                const gold = r === 3 && j === 20;
                if (gold) return null;
                return <circle key={`${r}-${j}`} cx={x0 + xi(x0)} cy={y0} r={4.2} fill="#cfefff" opacity={0.75} />;
              }),
            )}
            {/* partikel emas: hanya maju-mundur di tempat */}
            {(() => {
              const x0 = FX0 + 20 * 30 + (rand(3 * 97 + 20) - 0.5) * 12;
              const y0 = FY0 + 3 * FDY + (rand(3 * 97 + 25) - 0.5) * 12;
              return (
                <g>
                  <line x1={x0 - S0} y1={y0 + 24} x2={x0 + S0} y2={y0 + 24} stroke={C.gold} strokeWidth={2.5} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" opacity={0.8} />
                  <Spark x={x0 + xi(x0)} y={y0} r={7} color="gold" />
                </g>
              );
            })()}
            {/* label rapatan / renggangan */}
            <g opacity={labOn}>
              <rect x={xcL - 34} y={FY0 - 18} width={68} height={ROWS * FDY + 2} rx={20} fill={C.cyan} opacity={0.1 * fadeEdge(phC)} />
              <Label x={xcL} y={FY0 - 42} size={24} color={C.cyan} font="head" weight={600} opacity={fadeEdge(phC)}>
                rapatan
              </Label>
              <Label x={xrL} y={FY0 - 42} size={24} color={C.muted} font="head" weight={600} opacity={fadeEdge(phR)}>
                renggangan
              </Label>
            </g>
            {/* kurva tekanan */}
            <path d={pathOf(presPts)} fill="none" stroke={C.cyan} strokeWidth={3} opacity={0.55 * labOn} />
            <Label x={FX0 - 20} y={518} size={20} color={C.cyan} anchor="end" font="sans" opacity={0.8 * labOn}>
              tekanan
            </Label>
          </g>

          {/* nada ↔ frekuensi */}
          <g opacity={pitchP}>
            <rect x={160} y={600} width={770} height={265} rx={18} fill="#0d1636" fillOpacity={0.88} stroke={C.gold} strokeOpacity={0.4} strokeWidth={2} />
            <Label x={545} y={634} size={25} color={C.gold} font="head" weight={600}>
              tinggi nada ← frekuensi
            </Label>
            {[
              {y: 715, l: 260, lab: 'f kecil → rendah'},
              {y: 810, l: 95, lab: 'f besar → tinggi'},
            ].map((w, i) => (
              <g key={i}>
                <path
                  d={pathOf(Array.from({length: 91}, (_, j) => {
                    const X = 420 + (480 * j) / 90;
                    return [X, w.y - 26 * Math.sin((2 * Math.PI * (X - 420)) / w.l - (2 * Math.PI * 165 * t) / w.l)] as [number, number];
                  }))}
                  fill="none"
                  stroke={C.gold}
                  strokeWidth={3.5}
                />
                <Label x={190} y={w.y} size={22} color={C.ink} anchor="start" font="sans">
                  {w.lab}
                </Label>
              </g>
            ))}
          </g>
          {/* keras ↔ amplitudo */}
          <g opacity={loudP}>
            <rect x={990} y={600} width={770} height={265} rx={18} fill="#0d1636" fillOpacity={0.88} stroke={C.cyan} strokeOpacity={0.4} strokeWidth={2} />
            <Label x={1375} y={634} size={25} color={C.cyan} font="head" weight={600}>
              keras bunyi ← amplitudo
            </Label>
            {[
              {y: 715, a: 9, lab: 'A kecil → pelan'},
              {y: 810, a: 34, lab: 'A besar → keras'},
            ].map((w, i) => (
              <g key={i}>
                <path
                  d={pathOf(Array.from({length: 91}, (_, j) => {
                    const X = 1250 + (480 * j) / 90;
                    return [X, w.y - w.a * Math.sin((2 * Math.PI * (X - 1250)) / 150 - (2 * Math.PI * 165 * t) / 150)] as [number, number];
                  }))}
                  fill="none"
                  stroke={C.cyan}
                  strokeWidth={3.5}
                />
                <Label x={1020} y={w.y} size={22} color={C.ink} anchor="start" font="sans">
                  {w.lab}
                </Label>
              </g>
            ))}
          </g>

          {/* batang pendengaran 20 Hz – 20 kHz */}
          <g opacity={barP}>
            <defs>
              <linearGradient id="snd-aud" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={C.kin} />
                <stop offset="50%" stopColor={C.gold} />
                <stop offset="100%" stopColor={C.work} />
              </linearGradient>
            </defs>
            <rect x={300} y={700} width={1340} height={40} rx={20} fill="#1a2550" />
            <rect x={logX(20)} y={700} width={logX(20000) - logX(20)} height={40} rx={8} fill="url(#snd-aud)" opacity={0.85} />
            <Label x={(300 + logX(20)) / 2} y={680} size={20} color={C.muted} font="sans">
              infrasonik
            </Label>
            <Label x={(logX(20000) + 1640) / 2} y={680} size={20} color={C.muted} font="sans">
              ultrasonik
            </Label>
            {[20, 200, 2000, 20000].map((f) => (
              <g key={f}>
                <line x1={logX(f)} y1={692} x2={logX(f)} y2={748} stroke={C.ink} strokeWidth={3} />
                <Label x={logX(f)} y={774} size={24} color={f === 20 || f === 20000 ? C.gold : C.ink} font="mono" weight={f === 20 || f === 20000 ? 600 : 400}>
                  {f >= 1000 ? `${f / 1000} kHz` : `${f} Hz`}
                </Label>
              </g>
            ))}
            <Label x={(logX(20) + logX(20000)) / 2} y={820} size={26} color={C.gold} font="head" weight={600}>
              terdengar telinga manusia
            </Label>
            {/* penanda sapuan + gelombang kecil */}
            <path d={`M${sweepX},${690} l-10,-16 l20,0 Z`} fill={C.ink} />
            <path
              d={pathOf(Array.from({length: 61}, (_, j) => {
                const u = j / 60;
                const cyc = 1 + 9 * ((Math.log10(sweepF) - 1.3) / 3);
                return [sweepX - 90 + 180 * u, 630 - 16 * Math.sin(2 * Math.PI * cyc * u - t * 6)] as [number, number];
              }))}
              fill="none"
              stroke={C.gold}
              strokeWidth={3}
            />
            <Twinkles x={(logX(20) + logX(20000)) / 2} y={720} rx={460} ry={30} n={5} color="gold" seed={2} />
          </g>

          {/* ======= Doppler ======= */}
          <g opacity={dopOp}>
            <defs>
              <linearGradient id="dop-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={RED} />
                <stop offset="50%" stopColor="#dfe6ff" />
                <stop offset="100%" stopColor={BLUE} />
              </linearGradient>
              <clipPath id="dop-clip">
                <rect x={80} y={180} width={1760} height={700} />
              </clipPath>
            </defs>
            <Glow x={xsN + 380} y={DY} r={480} color="water" opacity={0.3 + 0.3 * frontP} />
            <Glow x={xsN - 420} y={DY} r={520} color="heat" opacity={0.22 + 0.3 * backP} />
            <g clipPath="url(#dop-clip)">
              {rings.map((g, i) => (
                <circle key={i} cx={g.cx} cy={DY} r={g.r} fill="none" stroke="url(#dop-grad)" strokeWidth={3} opacity={0.8 * g.op} />
              ))}
            </g>
            {/* jalan */}
            <rect x={80} y={DY + 62} width={1760} height={8} rx={4} fill="#26325e" />
            {Array.from({length: 14}, (_, i) => (
              <rect key={i} x={110 + i * 128} y={DY + 84} width={60} height={5} rx={2} fill="#3a4770" />
            ))}
            {/* pendengar */}
            <Person x={1745} y={DY + 62} scale={0.62} color={BLUE} />
            <Person x={175} y={DY + 62} scale={0.62} color={RED} />
            {/* ambulans */}
            <g transform={`translate(${xsN} ${DY})`}>
              {[0, 1, 2].map((k) => (
                <line key={k} x1={-110 - k * 14} y1={-24 + k * 18} x2={-150 - k * 20} y2={-24 + k * 18} stroke={C.ink} strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />
              ))}
              <ellipse cx={0} cy={64} rx={100} ry={8} fill="#000" opacity={0.35} />
              <rect x={-92} y={-44} width={130} height={88} rx={10} fill="#eef3ff" stroke="#9aa6d6" strokeWidth={2.5} />
              <path d="M38,-28 L72,-28 L94,4 L94,44 L38,44 Z" fill="#e3e9fb" stroke="#9aa6d6" strokeWidth={2.5} />
              <path d="M44,-20 L68,-20 L84,4 L44,4 Z" fill="#7fb6ff" opacity={0.8} />
              <rect x={-92} y={8} width={186} height={10} fill={RED} />
              <rect x={-44} y={-30} width={10} height={30} fill={RED} />
              <rect x={-54} y={-20} width={30} height={10} fill={RED} />
              <rect x={-60} y={-56} width={20} height={12} rx={4} fill={RED} opacity={0.35 + 0.65 * siren} />
              <rect x={-36} y={-56} width={20} height={12} rx={4} fill={BLUE} opacity={1 - 0.65 * siren} />
              <circle cx={-50} cy={-50} r={26} fill={`url(#soft-heat)`} opacity={siren} />
              <circle cx={-26} cy={-50} r={26} fill={`url(#soft-water)`} opacity={1 - siren} />
              {[-56, 60].map((wx) => (
                <g key={wx} transform={`translate(${wx} 44) rotate(${wheel})`}>
                  <circle r={18} fill="#1a1f33" stroke="#9aa6d6" strokeWidth={3} />
                  <line x1={-12} y1={0} x2={12} y2={0} stroke="#9aa6d6" strokeWidth={3} />
                  <line x1={0} y1={-12} x2={0} y2={12} stroke="#9aa6d6" strokeWidth={3} />
                </g>
              ))}
            </g>
            {/* v sumber */}
            <line x1={xsN - 40} y1={DY - 90} x2={xsN + 60} y2={DY - 90} stroke={C.work} strokeWidth={5} markerEnd="url(#arrow-work)" />
            <Label x={xsN + 92} y={DY - 90} size={26} color={C.work} font="serif" italic anchor="start">
              v<tspan baselineShift="sub" fontSize="0.65em">s</tspan>
            </Label>
            {/* λ depan & belakang */}
            <g opacity={frontP * fadeEdge(pickF)}>
              <line x1={bF0} y1={DY} x2={bF1} y2={DY} stroke={C.press} strokeWidth={4} markerEnd="url(#arrow-press)" markerStart="url(#arrow-press)" />
              <Label x={(bF0 + bF1) / 2} y={DY - 28} size={26} color={C.press} font="serif" italic>
                λ
              </Label>
            </g>
            <g opacity={backP * fadeEdge(pickB)}>
              <line x1={bB0} y1={DY} x2={bB1} y2={DY} stroke={C.press} strokeWidth={4} markerEnd="url(#arrow-press)" markerStart="url(#arrow-press)" />
              <Label x={(bB0 + bB1) / 2} y={DY - 28} size={26} color={C.press} font="serif" italic>
                λ
              </Label>
            </g>
            {/* panel apa yang didengar */}
            {[
              {on: frontP, x0: 1470, col: BLUE, lam: lamF, txt: 'depan: nada tinggi', arrow: '▲'},
              {on: backP, x0: 130, col: RED, lam: lamB, txt: 'belakang: nada rendah', arrow: '▼'},
            ].map((p, i) => (
              <g key={i} opacity={p.on}>
                <rect x={p.x0} y={205} width={330} height={128} rx={16} fill="#0d1636" fillOpacity={0.9} stroke={p.col} strokeOpacity={0.6} strokeWidth={2} />
                <Label x={p.x0 + 165} y={234} size={23} color={p.col} font="head" weight={600}>
                  {p.txt}
                </Label>
                <path
                  d={pathOf(Array.from({length: 71}, (_, j) => {
                    const X = p.x0 + 30 + (230 * j) / 70;
                    return [X, 292 - 20 * Math.sin((2 * Math.PI * (X - p.x0)) / (p.lam * 0.9) - (2 * Math.PI * CW * t) / (p.lam * 0.9))] as [number, number];
                  }))}
                  fill="none"
                  stroke={p.col}
                  strokeWidth={3.5}
                />
                <text x={p.x0 + 292} y={300} textAnchor="middle" fontFamily={FONT.sans} fontSize={30} fill={C.gold}>
                  {p.arrow}
                </text>
                <Label x={p.x0 + 292} y={268} size={20} color={C.gold} font="serif" italic>
                  f
                </Label>
              </g>
            ))}
            <Ripple x={1745} y={DY - 40} p={ramp(t, wordOf(2, 'naik') - 0.2, wordOf(2, 'naik') + 1.1, (q) => q)} r={110} color="water" rings={2} />
            <Ripple x={175} y={DY - 40} p={ramp(t, wordOf(3, 'turun') - 0.2, wordOf(3, 'turun') + 1.1, (q) => q)} r={110} color="heat" rings={2} />
          </g>
          <Twinkles x={960} y={800} rx={300} ry={40} n={5} color="gold" opacity={noteD} seed={8} />
        </Stage>
      </AbsoluteFill>

      <Note x={960} y={800} p={noteF} color={BLUE} size={30}>
        mendekat → λ memendek → <span style={{color: C.gold}}>f naik</span>
      </Note>
      <Note x={960} y={800} p={noteB} color={RED} size={30}>
        menjauh → λ memanjang → <span style={{color: C.gold}}>f turun</span>
      </Note>
      <Note x={960} y={800} p={noteD} color={C.gold} size={32}>
        efek Doppler: nada sirene turun saat ambulans lewat
      </Note>
    </AbsoluteFill>
  );
};

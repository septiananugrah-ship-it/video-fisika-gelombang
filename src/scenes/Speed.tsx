import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, pathOf, ramp, win} from '../anim';
import {SpringV} from '../components/physics';
import {Formula, Frac, Glow, Label, Motes, Note, Ripple, Spark, Sqrt, Stage, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Cepat rambat pada tali v = √(F/μ). Tiga tali, pulsa dilepas bersamaan tiap P detik:
//  · tali A: F = 4F₀, μ = μ₀  → v = 2v₀ (tegang)
//  · tali B: F = F₀,  μ = μ₀  → v = v₀  (acuan)
//  · tali C: F = F₀,  μ = 4μ₀ → v = v₀/2 (berat, lebih tebal)
// Lebar pulsa = v·τ (sentakan tangan sama lama) → pulsa cepat lebih lebar. Tegangan dari beban di katrol.

const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));

const RX0 = 210;
const RX1 = 1150;
const V0 = 280;
const PER = 8;
const TL = 0.5;
const AMP = 50;
const ROPES = [
  {y: 290, F: 4, mu: 1, w: 3.4, tag: 'tegang', chipF: '4F₀', chipM: 'μ₀', vt: '2v₀', box: 66},
  {y: 475, F: 1, mu: 1, w: 3.4, tag: 'acuan', chipF: 'F₀', chipM: 'μ₀', vt: 'v₀', box: 46},
  {y: 660, F: 1, mu: 4, w: 7.5, tag: 'berat', chipF: 'F₀', chipM: '4μ₀', vt: '½v₀', box: 46},
];
const COLX = 1565; // kolom kanan

export const Speed: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  const intro = ramp(t, -0.6, 0.8);
  const hiTop = win(t, wordOf(0, 'tegang') - 0.3, wordOf(0, 'berat') - 0.3, 0.4, 0.6);
  const hiBot = win(t, wordOf(0, 'berat') - 0.3, cue(1) + 0.4, 0.4, 0.8);
  const card = ramp(t, wordOf(1, 'akar') - 0.5, wordOf(1, 'akar') + 0.3);
  const anaP = slot(t, cue(2) - 0.2, cue(3) - 0.1);
  const chip1 = ramp(t, wordOf(2, 'tegangan') - 0.3, wordOf(2, 'tegangan') + 0.4);
  const chip2 = ramp(t, wordOf(2, 'massa') - 0.3, wordOf(2, 'massa') + 0.4);
  const tm = wordOf(3, 'memutar');
  const thickP = slot(t, cue(3) - 0.1, tm - 0.1);
  const pegP = slot(t, tm - 0.1, dur + 2);
  const tighten = ramp(t, tm, wordOf(3, 'menaikkan') + 0.6, EASE_IN_OUT);
  const push = 1 + 0.025 * ramp(t, -0.8, dur, EASE_IN_OUT);

  // frekuensi senar (visual, Hz) naik ∝ √T; fase diintegralkan agar mulus
  const fOf = (s: number) => 2.4 * Math.sqrt(1 + 0.69 * ramp(s, tm, wordOf(3, 'menaikkan') + 0.6, EASE_IN_OUT));
  let phase = 0;
  {
    const s0 = tm - 1;
    const n = Math.max(0, Math.ceil((t - s0) * 30));
    for (let i = 0; i < n; i++) phase += 2 * Math.PI * fOf(s0 + (i + 0.5) / 30) / 30;
    if (t < s0) phase = 2 * Math.PI * 2.4 * (t - s0);
  }
  const fNow = fOf(t);
  const pegAng = tighten * 2.6 * Math.PI;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '700px 480px'}}>
        <Stage>
          <Glow x={680} y={475} r={560} color="work" opacity={0.12 * intro} />
          <Glow x={680} y={290} r={260} color="force" opacity={0.35 * hiTop} />
          <Glow x={680} y={660} r={260} color="spr" opacity={0.35 * hiBot} />
          <Motes x={680} y={475} rx={520} ry={260} n={22} color="work" opacity={0.35 * intro} seed={6} />

          {ROPES.map((r, ri) => {
            const v = V0 * Math.sqrt(r.F / r.mu);
            const w = v * 0.2;
            const cycT = (((t - TL) % PER) + PER) % PER;
            const nCyc = Math.floor((t - TL) / PER);
            const xc = RX0 - 2.6 * w + v * cycT;
            const live = t > TL ? 1 : 0.0001;
            const yOf = (X: number) => {
              const taper = Math.min(1, (RX1 - X) / 70);
              const d = (X - xc) / w;
              return r.y - AMP * intro * live * taper * Math.exp(-d * d);
            };
            const pts: [number, number][] = Array.from({length: 141}, (_, i) => {
              const X = RX0 + ((RX1 - RX0) * i) / 140;
              return [X, yOf(X)];
            });
            const d = pathOf(pts);
            const tArr = TL + nCyc * PER + (RX1 - 30 - (RX0 - 2.6 * w)) / v;
            const pk = Math.max(0, Math.min(1, (xc - RX0) / 80)) * Math.max(0, Math.min(1, (RX1 - 40 - xc) / 60));
            const hi = ri === 0 ? hiTop : ri === 2 ? hiBot : 0;
            return (
              <g key={ri} opacity={intro}>
                {/* jalur & penanda jarak */}
                {Array.from({length: 9}, (_, j) => (
                  <line key={j} x1={RX0 + j * 117.5} y1={r.y + 18} x2={RX0 + j * 117.5} y2={r.y + 28} stroke={C.muted} strokeOpacity={0.5} strokeWidth={2} />
                ))}
                {/* tangan/penyentak */}
                <rect x={RX0 - 44} y={yOf(RX0) - 18} width={34} height={36} rx={10} fill="#2a3768" stroke={C.ink} strokeOpacity={0.6} strokeWidth={2} />
                {/* tali */}
                <path d={d} fill="none" stroke={C.cyan} strokeOpacity={0.2 + 0.2 * hi} strokeWidth={r.w * 3.5} strokeLinecap="round" />
                <path d={d} fill="none" stroke={ri === 2 ? '#8fdcf5' : C.cyan} strokeWidth={r.w} strokeLinecap="round" />
                {/* katrol + beban (tegangan) */}
                <circle cx={RX1} cy={r.y + 22} r={22} fill="#18224a" stroke="#9aa6d6" strokeWidth={3} />
                <circle cx={RX1} cy={r.y + 22} r={5} fill="#9aa6d6" />
                <path d={`M${RX1},${r.y} A22,22 0 0 1 ${RX1 + 22},${r.y + 22} L${RX1 + 22},${r.y + 88}`} fill="none" stroke={C.cyan} strokeWidth={r.w} />
                <g transform={`translate(${RX1 + 22} ${r.y + 88 + 2 * Math.sin(t * 2 + ri)})`}>
                  <rect x={-r.box / 2} y={0} width={r.box} height={r.box * 0.85} rx={8} fill="url(#crate)" stroke={C.force} strokeOpacity={0.8} strokeWidth={2.5} />
                  <text x={0} y={r.box * 0.43} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={r.box > 50 ? 26 : 21} fill={C.force}>
                    {r.chipF}
                  </text>
                </g>
                {/* chip F, μ */}
                <Label x={RX0} y={r.y - 104} size={25} anchor="start" color={C.force} font="mono">
                  F = {r.chipF}
                </Label>
                <Label x={RX0 + 175} y={r.y - 104} size={25} anchor="start" color={C.spr} font="mono">
                  μ = {r.chipM}
                </Label>
                <Label x={RX0 + 340} y={r.y - 104} size={22} anchor="start" color={C.muted} font="sans">
                  ({r.tag})
                </Label>
                {/* panah v sebanding laju */}
                <g opacity={pk}>
                  <line x1={xc - 0.1 * v} y1={r.y - AMP - 26} x2={xc + 0.1 * v} y2={r.y - AMP - 26} stroke={C.work} strokeWidth={5} markerEnd="url(#arrow-work)" />
                  <Label x={xc + 0.1 * v + 22} y={r.y - AMP - 26} size={24} color={C.work} anchor="start" font="serif" italic>
                    {r.vt}
                  </Label>
                </g>
                <Spark x={xc} y={yOf(xc)} r={6} color="cyan" opacity={pk * 0.9} />
                <Ripple x={RX1} y={r.y} p={ramp(t, tArr, tArr + 1, (q) => q)} r={70} color="work" rings={2} />
              </g>
            );
          })}

          {/* analogi pegas (baris 2) */}
          <g opacity={anaP}>
            <rect x={1310} y={430} width={110} height={14} rx={4} fill="#1a2550" stroke="#7d89b5" strokeWidth={2} />
            <SpringV x={1365} ya={444} yb={580 + 34 * Math.sin(t * 3.2)} coils={8} amp={16} color={C.spr} width={4} />
            <rect x={1335} y={580 + 34 * Math.sin(t * 3.2)} width={60} height={50} rx={8} fill="url(#crate)" stroke={C.ink} strokeOpacity={0.6} strokeWidth={2} />
            <text x={1365} y={605 + 34 * Math.sin(t * 3.2)} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={26} fill={C.ink}>
              m
            </text>
            <Label x={1340} y={480} size={24} font="serif" italic color={C.spr} anchor="end">
              k
            </Label>
          </g>

          {/* senar tebal vs tipis */}
          <g opacity={thickP}>
            {[
              {y: 470, w: 9, f: 1.3, lab: 'senar tebal (μ besar) → nada rendah'},
              {y: 640, w: 3, f: 3.0, lab: 'senar tipis (μ kecil) → nada tinggi'},
            ].map((s, i) => {
              const pts: [number, number][] = Array.from({length: 41}, (_, j) => {
                const u = j / 40;
                return [1320 + 480 * u, s.y + 20 * Math.sin(Math.PI * u) * Math.cos(2 * Math.PI * s.f * t)];
              });
              return (
                <g key={i}>
                  <Label x={1560} y={s.y - 62} size={23} color={C.ink} font="sans">
                    {s.lab}
                  </Label>
                  <circle cx={1320} cy={s.y} r={7} fill="#9aa6d6" />
                  <circle cx={1800} cy={s.y} r={7} fill="#9aa6d6" />
                  <path d={pathOf(pts)} fill="none" stroke="#e8d7a8" strokeWidth={s.w} strokeLinecap="round" />
                  <Label x={1560} y={s.y + 50} size={22} color={C.gold} font="mono">
                    {i === 0 ? 'f ↓' : 'f ↑'}
                  </Label>
                </g>
              );
            })}
          </g>

          {/* kepala gitar + penyetem (baris 3) */}
          <g opacity={pegP}>
            <path d="M1400,420 L1520,420 L1540,760 L1380,760 Z" fill="#3b2a1e" stroke="#8a6a4a" strokeWidth={3} />
            <rect x={1395} y={760} width={130} height={110} fill="#2d2016" stroke="#8a6a4a" strokeWidth={3} />
            <rect x={1395} y={756} width={130} height={10} fill="#e9e1cc" />
            {/* senar dari tiang penyetem lewat nut ke bawah, bergetar */}
            {(() => {
              const pts: [number, number][] = Array.from({length: 31}, (_, j) => {
                const u = j / 30;
                return [1460 + 9 * Math.sin(Math.PI * u) * Math.sin(phase), 761 + 109 * u];
              });
              return (
                <>
                  <line x1={1448} y1={520} x2={1460} y2={761} stroke="#e8d7a8" strokeWidth={3} />
                  <path d={pathOf(pts)} fill="none" stroke="#f3e5b8" strokeWidth={3} />
                </>
              );
            })()}
            {/* tiang & kenop penyetem (berputar) */}
            <circle cx={1448} cy={520} r={11} fill="#c9c2ad" stroke="#6d5c40" strokeWidth={2} />
            <line x1={1448 - 9 * Math.cos(pegAng)} y1={520 - 9 * Math.sin(pegAng)} x2={1448 + 9 * Math.cos(pegAng)} y2={520 + 9 * Math.sin(pegAng)} stroke="#6d5c40" strokeWidth={2.5} />
            <rect x={1360} y={514} width={40} height={12} rx={4} fill="#c9c2ad" />
            <ellipse cx={1338} cy={520} rx={8 + 22 * Math.abs(Math.cos(pegAng))} ry={30} fill="#e6dfc8" stroke="#8d8164" strokeWidth={2.5} />
            {[0, 1].map((k) => (
              <circle key={k} cx={1448} cy={600 + k * 90} r={10} fill="#5b4a36" />
            ))}
            {/* panah putar */}
            <path d="M1300,470 A58,58 0 0 1 1300,570" fill="none" stroke={C.gold} strokeWidth={4} markerEnd="url(#arrow-gold)" opacity={0.4 + 0.6 * win(t, tm, wordOf(3, 'menaikkan') + 0.6, 0.3, 0.5)} />
            <Label x={1300} y={610} size={21} color={C.force} font="sans">
              F ↑
            </Label>
            {/* penunjuk nada */}
            <g transform="translate(1690 560)">
              <path d="M-82,0 A82,82 0 0 1 82,0" fill="none" stroke={C.faint} strokeWidth={12} strokeLinecap="round" />
              <path
                d={`M-82,0 A82,82 0 0 1 ${-82 * Math.cos(Math.PI * ((fNow - 2.0) / 1.4))},${-82 * Math.sin(Math.PI * ((fNow - 2.0) / 1.4))}`}
                fill="none"
                stroke={C.gold}
                strokeWidth={12}
                strokeLinecap="round"
              />
              <line x1={0} y1={0} x2={-66 * Math.cos(Math.PI * ((fNow - 2.0) / 1.4))} y2={-66 * Math.sin(Math.PI * ((fNow - 2.0) / 1.4))} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
              <circle r={8} fill={C.gold} />
              <Label x={0} y={44} size={26} color={C.gold} font="serif" italic>
                f
              </Label>
              <Label x={0} y={92} size={23} color={C.gold} font="head" weight={600} opacity={0.4 + 0.6 * tighten}>
                nada naik ♪
              </Label>
            </g>
            {/* not musik melayang */}
            {Array.from({length: 4}, (_, i) => {
              const ph = (((t * 0.3 * fNow) / 2.4 + i / 4) % 1 + 1) % 1;
              const op = Math.min(1, ph * 6) * (1 - ph);
              return (
                <text key={i} x={1560 + 30 * Math.sin(i * 2 + t)} y={760 - ph * 260} fontSize={30} fill={C.gold} opacity={op * 0.8} textAnchor="middle" fontFamily={FONT.sans}>
                  ♪
                </text>
              );
            })}
          </g>
          <Twinkles x={COLX} y={300} rx={220} ry={60} n={5} color="work" opacity={win(t, wordOf(1, 'akar'), cue(2) + 0.5)} seed={7} />
        </Stage>
      </AbsoluteFill>

      <Formula x={COLX} y={290} p={card} accent={C.work} size={62} caption="μ = massa per satuan panjang">
        <V color={C.work}>v</V> ={' '}
        <Sqrt>
          <Frac n={<V color={C.force}>F</V>} d={<V color={C.spr}>μ</V>} />
        </Sqrt>
      </Formula>
      <Note x={1630} y={540} p={anaP * chip1} color={C.force} size={25}>
        tegangan <V color={C.force}>F</V> ↔ kekakuan <V color={C.spr}>k</V>
      </Note>
      <Note x={1630} y={640} p={anaP * chip2} color={C.spr} size={25}>
        <V color={C.spr}>μ</V> ↔ kelembaman <V>m</V>
      </Note>
      <Note x={1565} y={775} p={anaP * chip2} color={C.muted} size={29}>
        pegas: <V>ω</V> = <Sqrt><Frac n={<V>k</V>} d={<V>m</V>} size={0.7} /></Sqrt>
        <span style={{marginLeft: 18}}>
          tali: <V color={C.work}>v</V> = <Sqrt><Frac n={<V color={C.force}>F</V>} d={<V color={C.spr}>μ</V>} size={0.7} /></Sqrt>
        </span>
      </Note>
    </AbsoluteFill>
  );
};

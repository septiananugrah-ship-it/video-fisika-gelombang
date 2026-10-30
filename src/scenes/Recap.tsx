import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, cyc, ramp, rand, win} from '../anim';
import {Frac, Glow, Motes, Ripple, Sqrt, Stage, Stream, Sub, Sup, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT, type Hue} from '../theme';

// Enam kartu rangkuman, masing-masing dengan animasi mini yang terus berulang (fisika analitik):
// gaya pemulih · GHS & periode · energi K ⇄ Us · redaman & resonansi · molekul & IR · tingkat energi kuantum;
// lalu pertanyaan kunci ("apa gaya pemulihnya, berapa frekuensi alaminya?").
const SW = 444;
const SH = 64;

const hex2 = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
const ph = (t: number, period: number, off = 0) => ((((t + off) / period) % 1) + 1) % 1;
const MONO = {fontFamily: FONT.mono, fontSize: 15, fill: C.muted} as const;
const TW = 2 * Math.PI;

/** 01 · Gaya pemulih: balok di pegas, panah F (kuning) selalu menunjuk ke titik setimbang. */
const MiniF: React.FC<{t: number}> = ({t}) => {
  const x = 34 * Math.cos(TW * 0.6 * t);
  const bx = 170 + x;
  const coil: string[] = [];
  const a = 22;
  const b = bx - 22;
  for (let i = 0; i <= 16; i++) {
    const xx = a + ((b - a) * i) / 16;
    coil.push(`${xx.toFixed(1)},${(36 + (i % 2 ? -8 : 8) * (i === 0 || i === 16 ? 0 : 1)).toFixed(1)}`);
  }
  const fLen = -1.6 * x;
  return (
    <g>
      <rect x={10} y={14} width={8} height={44} fill="#5b6a9e" />
      <line x1={10} y1={58} x2={300} y2={58} stroke={C.faint} strokeWidth={2} />
      <line x1={170} y1={8} x2={170} y2={62} stroke={C.gold} strokeWidth={1.5} strokeDasharray="3 4" opacity={0.7} />
      <polyline points={coil.join(' ')} fill="none" stroke={C.spr} strokeWidth={2.5} />
      <rect x={bx - 22} y={20} width={44} height={36} rx={5} fill="url(#crate)" stroke={C.press} strokeWidth={2} />
      {Math.abs(fLen) > 1 ? (
        <line x1={bx} y1={10} x2={bx + fLen} y2={10} stroke={C.force} strokeWidth={3} markerEnd="url(#arrow-force)" opacity={Math.min(1, Math.abs(fLen) / 10)} />
      ) : null}
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.force}>
        F ke setimbang
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central">
        F ∝ −x
      </text>
    </g>
  );
};

/** 02 · GHS: lingkaran acuan (emas) diproyeksikan ke jejak x–t; dua amplitudo, periode sama. */
const MiniSHM: React.FC<{t: number}> = ({t}) => {
  const w = TW * 0.5;
  const a = w * t;
  const cx = 34;
  const cy = 32;
  const R = 24;
  const px = cx + R * Math.cos(a);
  const py = cy - R * Math.sin(a);
  const pts = (A: number) => {
    const out: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const xx = 80 + i * 4.6;
      out.push(`${xx.toFixed(1)},${(cy - A * Math.sin(a - (xx - 80) * 0.035)).toFixed(1)}`);
    }
    return out.join(' ');
  };
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.gold} strokeWidth={1.5} opacity={0.7} />
      <line x1={cx} y1={cy} x2={px} y2={py} stroke={C.gold} strokeWidth={2} />
      <circle cx={px} cy={py} r={4} fill={C.gold} />
      <line x1={px} y1={py} x2={80} y2={py} stroke={C.gold} strokeWidth={1} strokeDasharray="2 3" opacity={0.6} />
      <polyline points={pts(24)} fill="none" stroke={C.press} strokeWidth={2.5} />
      <polyline points={pts(12)} fill="none" stroke={C.press} strokeWidth={2} strokeDasharray="5 4" opacity={0.6} />
      <circle cx={80} cy={py} r={4} fill={C.press} />
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.press}>
        A berbeda
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central" fill={C.gold}>
        T sama
      </text>
    </g>
  );
};

/** 03 · Energi: K (jingga) ⇄ Us (ungu) bergantian, total tetap. */
const MiniE: React.FC<{t: number}> = ({t}) => {
  const w = TW * 0.45;
  const x = Math.cos(w * t);
  const us = x * x;
  const k = 1 - us;
  const H = 48;
  const bx = 120 + 40 * x;
  return (
    <g>
      <line x1={10} y1={58} x2={190} y2={58} stroke={C.faint} strokeWidth={2} />
      <rect x={10} y={30} width={6} height={28} fill="#5b6a9e" />
      <line x1={16} y1={44} x2={bx - 14} y2={44} stroke={C.spr} strokeWidth={2.5} strokeDasharray="4 3" />
      <rect x={bx - 14} y={30} width={28} height={28} rx={4} fill="url(#crate)" stroke={C.press} strokeWidth={1.5} />
      {[
        {v: k, c: C.kin, x: 214, l: 'K'},
        {v: us, c: C.spr, x: 250, l: 'Us'},
      ].map((b) => (
        <g key={b.l}>
          <rect x={b.x} y={58 - H} width={24} height={H} rx={4} fill={b.c} opacity={0.1} />
          <rect x={b.x} y={58 - H * b.v} width={24} height={H * b.v} rx={4} fill={b.c} />
        </g>
      ))}
      <rect x={286} y={10} width={24} height={H} rx={4} fill="none" stroke={C.ink} strokeWidth={1.5} strokeDasharray="4 3" />
      <rect x={289} y={58 - H * us} width={18} height={H * us} fill={C.spr} opacity={0.8} />
      <rect x={289} y={10} width={18} height={H * k} fill={C.kin} opacity={0.8} />
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.kin}>
        K ⇄ Us
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central">
        total tetap
      </text>
    </g>
  );
};

/** 04 · Redaman (jejak merah meluruh) & resonansi (kurva puncak dengan penanda yang menyapu). */
const MiniDR: React.FC<{t: number}> = ({t}) => {
  const q = ph(t, 4);
  const dec: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const tt = (i / 60) * 4;
    dec.push(`${(8 + i * 2.4).toFixed(1)},${(32 - 24 * Math.exp(-0.7 * tt) * Math.cos(TW * 1.4 * tt)).toFixed(1)}`);
  }
  const res = (f: number) => 1 / Math.sqrt((1 - f * f) ** 2 + (0.18 * f) ** 2);
  const rc: string[] = [];
  for (let i = 0; i <= 50; i++) {
    const f = (i / 50) * 2;
    rc.push(`${(176 + i * 2.6).toFixed(1)},${(60 - 9 * Math.min(5.6, res(f))).toFixed(1)}`);
  }
  const fm = 2 * (0.5 - 0.5 * Math.cos(TW * ph(t, 5)));
  const mx = 176 + (fm / 2) * 130;
  const my = 60 - 9 * Math.min(5.6, res(fm));
  return (
    <g>
      <line x1={8} y1={32} x2={156} y2={32} stroke={C.faint} strokeWidth={1.5} />
      <polyline points={dec.join(' ')} fill="none" stroke={C.heat} strokeWidth={2.2} />
      <circle cx={8 + q * 144} cy={32 - 24 * Math.exp(-0.7 * q * 4) * Math.cos(TW * 1.4 * q * 4)} r={3.5} fill="#fff" opacity={cyc(q)} />
      <line x1={176} y1={60} x2={310} y2={60} stroke={C.faint} strokeWidth={1.5} />
      <line x1={241} y1={6} x2={241} y2={60} stroke={C.gold} strokeWidth={1} strokeDasharray="2 3" opacity={0.6} />
      <polyline points={rc.join(' ')} fill="none" stroke={C.gold} strokeWidth={2.2} />
      <circle cx={mx} cy={my} r={4.5} fill={C.gold} />
      <circle cx={mx} cy={my} r={10} fill="url(#soft-gold)" />
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.heat}>
        redaman ↓
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central" fill={C.gold}>
        resonansi ↑
      </text>
    </g>
  );
};

/** 05 · Molekul HCl bergetar (gerak lambat) menyerap foton IR (gelombang merah) yang datang. */
const MiniMol: React.FC<{t: number}> = ({t}) => {
  const s = Math.sin(TW * 1.2 * t);
  const cl = 200 - 3 * s;
  const h = 252 + 14 * s;
  const q = ph(t, 2.4);
  const head = 10 + q * 150;
  const wave: string[] = [];
  for (let i = 0; i <= 30; i++) {
    const x = head - 70 + (70 * i) / 30;
    wave.push(`${x.toFixed(1)},${(32 + 9 * Math.sin((x - t * 90) * 0.22)).toFixed(1)}`);
  }
  return (
    <g>
      <g opacity={cyc(q) * 1.1}>
        <polyline points={wave.join(' ')} fill="none" stroke={C.heat} strokeWidth={2.5} />
      </g>
      <line x1={cl} y1={32} x2={h} y2={32} stroke={C.spr} strokeWidth={3} strokeDasharray="4 3" />
      <circle cx={cl} cy={32} r={19} fill="#4fd68a" stroke="#c8ffe0" strokeWidth={1.5} opacity={0.9} />
      <circle cx={h} cy={32} r={9} fill="#eef3ff" stroke="#fff" strokeWidth={1} />
      <circle cx={(cl + h) / 2} cy={32} r={26} fill="url(#soft-heat)" opacity={0.3 + 0.3 * Math.max(0, Math.sin(Math.PI * q))} />
      <text x={cl} y={33} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontSize={12} fontWeight={700} fill="#0b2a18">
        Cl
      </text>
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.heat}>
        serap IR
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central">
        gerak lambat
      </text>
    </g>
  );
};

/** 06 · Kuantum: parabola potensial dengan tingkat energi berjarak sama; molekul naik satu tingkat (hν). */
const MiniQ: React.FC<{t: number}> = ({t}) => {
  const cx = 150;
  const base = 60;
  const lv = [0, 1, 2, 3].map((v) => base - 7 - v * 13);
  const halfW = (y: number) => Math.sqrt((base - y) / 60) * 110;
  const par: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = cx - 110 + (220 * i) / 40;
    const u = (x - cx) / 110;
    par.push(`${x.toFixed(1)},${(base - 60 * u * u).toFixed(1)}`);
  }
  const q = ph(t, 3);
  const up = Math.min(1, Math.max(0, (q - 0.3) / 0.2));
  const e = up * up * (3 - 2 * up);
  const dotY = lv[0] + (lv[1] - lv[0]) * e;
  return (
    <g>
      <polyline points={par.join(' ')} fill="none" stroke={C.spr} strokeWidth={2} opacity={0.7} />
      {lv.map((y, v) => (
        <line key={v} x1={cx - halfW(y)} y1={y} x2={cx + halfW(y)} y2={y} stroke={C.work} strokeWidth={2.5} opacity={0.9} />
      ))}
      <line x1={cx + 70} y1={lv[0]} x2={cx + 70} y2={lv[1] + 3} stroke={C.gold} strokeWidth={2} markerEnd="url(#arrow-gold)" opacity={cyc(q)} />
      <circle cx={cx} cy={dotY} r={4.5} fill="#fff" opacity={cyc(q) * 1.1} />
      <circle cx={cx} cy={dotY} r={11} fill="url(#soft-work)" opacity={cyc(q)} />
      <text x={326} y={18} {...MONO} dominantBaseline="central" fill={C.work}>
        jarak sama hν
      </text>
      <text x={326} y={42} {...MONO} dominantBaseline="central">
        titik nol ½hν
      </text>
    </g>
  );
};

const ITEMS: {title: string; color: string; hue: Hue; body: React.ReactNode; size?: number; Mini: React.FC<{t: number}>}[] = [
  {
    title: 'Gaya pemulih',
    color: C.force,
    hue: 'force',
    body: (
      <span>
        <V color={C.force}>F</V> = −<V>k</V>
        <V color={C.press}>x</V>
      </span>
    ),
    Mini: MiniF,
  },
  {
    title: 'Gerak harmonik sederhana',
    color: C.press,
    hue: 'press',
    size: 34,
    body: (
      <span>
        <V>T</V> = 2π
        <Sqrt>
          <Frac n={<V>m</V>} d={<V>k</V>} size={0.62} />
        </Sqrt>
        <span style={{fontFamily: FONT.sans, fontSize: 20, color: C.muted}}> &nbsp;(tak bergantung A)</span>
      </span>
    ),
    Mini: MiniSHM,
  },
  {
    title: 'Energi berpindah',
    color: C.kin,
    hue: 'kin',
    size: 34,
    body: (
      <span>
        <V color={C.kin}>K</V> + <V color={C.spr}>U</V>
        <Sub color={C.spr}>s</Sub> = ½<V>k</V>
        <V>A</V>
        <Sup>2</Sup>
      </span>
    ),
    Mini: MiniE,
  },
  {
    title: 'Redaman & resonansi',
    color: C.heat,
    hue: 'heat',
    size: 32,
    body: (
      <span>
        <V>f</V>
        <Sub>paksa</Sub> ≈ <V>f</V>
        <Sub>alami</Sub> → <V>A</V> maks
      </span>
    ),
    Mini: MiniDR,
  },
  {
    title: 'Molekul bergetar',
    color: C.spr,
    hue: 'spr',
    size: 34,
    body: (
      <span>
        <V>ν</V> = <Frac n="1" d="2π" size={0.62} />
        <Sqrt>
          <Frac n={<V>k</V>} d={<V>μ</V>} size={0.62} />
        </Sqrt>
      </span>
    ),
    Mini: MiniMol,
  },
  {
    title: 'Energi terkuantisasi',
    color: C.work,
    hue: 'work',
    size: 34,
    body: (
      <span>
        <V color={C.work}>E</V>
        <Sub color={C.work}>v</Sub> = (<V>v</V> + ½)<V>h</V>
        <V>ν</V>
      </span>
    ),
    Mini: MiniQ,
  },
];

const COLS = [400, 960, 1520];
const ROWS = [326, 596];
const CH = 244;

export const Recap: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const starts = [
    cue(1),
    cue(2),
    cue(3),
    Math.max(cue(3) + 1.6, wordOf(3, 'Redaman') - 0.3),
    cue(4),
    Math.max(cue(4) + 1.6, wordOf(4, 'energi') - 0.3),
  ];
  const nextOf = (i: number) => (i < 5 ? starts[i + 1] : cue(5));
  const head = ramp(t, 0, 0.8);
  const q = ramp(t, cue(5) + 0.2, cue(5) + 1.2);
  const dim = 1 - 0.6 * ramp(t, cue(5), cue(5) + 1.0, EASE_IN_OUT);
  const hlF = ramp(t, wordOf(5, 'pemulihnya') - 0.5, wordOf(5, 'pemulihnya') + 0.3);
  const hlN = ramp(t, wordOf(5, 'alaminya') - 0.5, wordOf(5, 'alaminya') + 0.3);
  // kartu yang diacu pertanyaan ikut menyala lagi
  const reF = hlF * (1 - 0.6 * hlN);
  const reN = hlN;
  return (
    <AbsoluteFill>
      <Stage>
        <Motes x={960} y={470} rx={900} ry={330} n={40} color="gold" opacity={0.3} seed={5} />
        {/* latar: gelombang sinus tipis yang mengalir & bandul kecil berayun */}
        {Array.from({length: 5}, (_, k) => {
          const y = 230 + k * 140;
          const amp = 10 + 6 * rand(k);
          const kk = 0.008 + 0.006 * rand(k + 3);
          const pts: string[] = [];
          for (let i = 0; i <= 48; i++) {
            const x = 60 + i * 37.5;
            pts.push(`${x.toFixed(1)},${(y + amp * Math.sin(x * kk - t * (0.8 + 0.5 * rand(k + 7)) + k)).toFixed(1)}`);
          }
          return <polyline key={k} points={pts.join(' ')} fill="none" stroke={[C.press, C.cyan, C.spr, C.kin, C.gold][k]} strokeWidth={1.5} opacity={0.12} />;
        })}
        {ITEMS.map((it, i) => {
          const x = COLS[i % 3];
          const y = ROWS[Math.floor(i / 3)];
          const o = ramp(t, 0.2 + i * 0.12, 0.9 + i * 0.12) * (1 - ramp(t, starts[i] - 0.2, starts[i] + 0.4));
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 - i * 0.9);
          return o > 0.01 ? (
            <rect key={it.title} x={x - 250} y={y - CH / 2} width={500} height={CH} rx={20} fill={it.color} fillOpacity={0.03 + 0.03 * pulse} stroke={it.color} strokeOpacity={0.25 + 0.25 * pulse} strokeWidth={2} strokeDasharray="10 9" strokeDashoffset={-t * 16} opacity={o} />
          ) : null;
        })}
        {ITEMS.map((it, i) => {
          const x = COLS[i % 3];
          const y = ROWS[Math.floor(i / 3)];
          const act = win(t, starts[i], nextOf(i), 0.5, 0.6) * dim;
          return (
            <g key={it.title}>
              <Glow x={x} y={y} r={300} color={it.hue} opacity={0.35 * act} />
              <Ripple x={x} y={y} p={(t - starts[i] - 0.1) / 1.3} r={300} color={it.hue} rings={2} width={2} />
            </g>
          );
        })}
        <Glow x={COLS[0]} y={ROWS[0]} r={300} color="force" opacity={0.4 * reF} />
        <Glow x={COLS[1]} y={ROWS[0]} r={300} color="press" opacity={0.35 * reN} />
        <g opacity={q}>
          <Stream
            pts={[
              [90, 800],
              [140, 800],
              [190, 800],
            ]}
            color="force"
            n={6}
            speed={0.6}
            r={6}
            jitter={4}
          />
          <Stream
            pts={[
              [1830, 800],
              [1780, 800],
              [1730, 800],
            ]}
            color="gold"
            n={6}
            speed={0.6}
            r={6}
            jitter={4}
          />
          <Twinkles x={960} y={800} rx={620} ry={40} n={7} color="gold" seed={7} />
        </g>
        <Ripple x={700} y={800} p={(t - wordOf(5, 'pemulihnya') + 0.3) / 1.4} r={260} color="force" rings={2} />
        <Ripple x={1300} y={800} p={(t - wordOf(5, 'alaminya') + 0.3) / 1.4} r={260} color="gold" rings={2} />
      </Stage>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT.head, fontSize: 30, letterSpacing: 8 + 2 * (1 - head), color: C.gold, fontWeight: 600, opacity: head}}>
        RANGKUMAN
      </div>
      {ITEMS.map((it, i) => {
        const p = ramp(t, starts[i] - 0.1, starts[i] + 0.7, BACK);
        const x = COLS[i % 3];
        const y = ROWS[Math.floor(i / 3)];
        const re = i === 0 ? reF : i === 1 ? reN : 0;
        const act = Math.max(win(t, starts[i], nextOf(i), 0.5, 0.6), re);
        const dimI = dim + (1 - dim) * re;
        const mini = ramp(t, starts[i] + 0.4, starts[i] + 1.2);
        const bob = 3 * Math.sin(t * 1.1 + i * 1.3);
        const Mini = it.Mini;
        return (
          <div
            key={it.title}
            style={{
              position: 'absolute',
              left: x - 250,
              top: y - CH / 2,
              width: 500,
              height: CH,
              boxSizing: 'border-box',
              borderRadius: 20,
              background: 'linear-gradient(160deg, rgba(22,34,72,0.95), rgba(10,16,36,0.95))',
              border: `1.5px solid ${it.color}${hex2(0x55 + 0x44 * act)}`,
              borderLeft: `8px solid ${it.color}`,
              boxShadow: `0 16px 44px rgba(0,0,0,0.45), 0 0 ${30 + 30 * act}px ${it.color}${hex2(0x22 + 0x22 * act)}`,
              padding: '18px 28px 0',
              opacity: Math.min(1, p) * dimI,
              scale: String(0.9 + 0.1 * p + 0.02 * act),
              translate: `0px ${bob - 6 * act}px`,
              color: C.ink,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(105deg, transparent ${-40 + p * 150 - 16}%, rgba(255,245,220,0.12) ${-40 + p * 150}%, transparent ${-40 + p * 150 + 16}%)`,
                pointerEvents: 'none',
              }}
            />
            <div style={{fontFamily: FONT.head, fontSize: 26, color: it.color, fontWeight: 600, letterSpacing: 1}}>
              {String(i + 1).padStart(2, '0')} · {it.title}
            </div>
            <div style={{fontFamily: FONT.serif, fontSize: it.size ?? 38, marginTop: 10, whiteSpace: 'nowrap', textAlign: 'center', height: 82, lineHeight: '82px'}}>{it.body}</div>
            <svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} style={{display: 'block', marginTop: 2, opacity: mini, overflow: 'visible'}}>
              <Mini t={t + rand(i) * 3} />
            </svg>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 770,
          textAlign: 'center',
          fontFamily: FONT.head,
          fontSize: 46,
          fontWeight: 700,
          color: C.ink,
          opacity: q,
          translate: `0px ${(1 - q) * 20}px`,
          whiteSpace: 'nowrap',
        }}
      >
        Apa{' '}
        <span style={{color: C.force, textShadow: `0 0 ${26 * hlF}px ${C.force}aa`}}>gaya pemulihnya</span>, dan berapa{' '}
        <span style={{color: C.gold, textShadow: `0 0 ${26 * hlN}px ${C.gold}aa`}}>frekuensi alaminya</span>?
      </div>
    </AbsoluteFill>
  );
};

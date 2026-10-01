"""Original score + sound design for the Sound Center commercial, mixed under the supplied voice-over."""
import numpy as np, wave, json, os
from scipy import signal
SR = 44100; DUR = 52.0; OFF = 1.2
rng = np.random.default_rng(7)
N = int(SR * DUR); t_axis = np.arange(N) / SR
def v2t(v): return v - OFF
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return signal.sosfilt(signal.butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i < 0 or i >= N: return
    j = min(N, i + len(x)); buf[i:j] += x[:j - i] * g
def saw(f, n, ph=0):
    t = np.arange(n) / SR; return 2 * ((f * t + ph) % 1) - 1
def env_ad(n, a, d):
    t = np.arange(n) / SR; e = np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d); return e
music = np.zeros(N); sfx = np.zeros(N)
BPM = 110; beat = 60 / BPM
# --- sub drone + pad
roots = [(0, 55.0), (10.45, 55.0), (20, 65.41), (30, 49.0), (40, 55.0)]
drone = np.zeros(N)
for (t0, f) in roots:
    pass
fl = np.zeros(N)
seq = [(0, 55.0), (13, 65.41), (26, 49.0), (39, 55.0)]
for k, (t0, f) in enumerate(seq):
    t1 = seq[k + 1][0] if k + 1 < len(seq) else DUR
    n = int((t1 - t0 + 1.5) * SR); tt = np.arange(n) / SR
    e = np.clip(tt / 1.5, 0, 1) * np.clip((t1 - t0 + 1.5 - tt) / 1.5, 0, 1)
    x = (np.sin(2 * np.pi * f * tt) + .35 * np.sin(2 * np.pi * 2 * f * tt)) * e
    put(drone, x, t0, 1)
pad = np.zeros(N)
chords = [(0, [110, 130.81, 164.81]), (13, [130.81, 164.81, 196]), (26, [98, 123.47, 146.83]), (39, [110, 130.81, 164.81])]
for k, (t0, fs) in enumerate(chords):
    t1 = chords[k + 1][0] if k + 1 < len(chords) else DUR
    n = int((t1 - t0 + 2) * SR); tt = np.arange(n) / SR
    e = np.clip(tt / 2.5, 0, 1) * np.clip((t1 - t0 + 2 - tt) / 2.0, 0, 1)
    x = sum(saw(f * (1 + d), n, rng.random()) for f in fs for d in (-.004, .004))
    put(pad, lp(x, 700) * e, t0, 1)
# slow filter-ish swell on pad
pad *= (.5 + .5 * np.sin(2 * np.pi * t_axis / 13 - 1.2) * .5 + .25)
music += drone * .30 + pad * .028
# --- rhythm from the product section on
start = v2t(11.65); end = v2t(48.55)
def kick():
    n = int(.42 * SR); tt = np.arange(n) / SR
    f = 42 + 110 * np.exp(-tt * 26); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 9) + .25 * lp(rng.standard_normal(n), 3000) * np.exp(-tt * 60)
def hat(open_=False):
    n = int((.18 if open_ else .05) * SR); tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-tt * (22 if open_ else 90))
def pluck(f):
    n = int(.5 * SR); tt = np.arange(n) / SR
    x = saw(f, n) + .6 * saw(f * 1.005, n); x = lp(x, 1600 * np.exp(-tt * 6) + 300, 2) if False else lp(x, 1800)
    return x * np.exp(-tt * 9)
K = kick(); H = hat(); HO = hat(True)
b = start
arp = [110, 164.81, 220, 164.81, 130.81, 196, 261.63, 196, 98, 146.83, 196, 146.83, 110, 164.81, 220, 329.63]
step = 0
while b < end:
    if b < v2t(48.4):
        put(music, K, b, .85)
        put(music, H, b + beat / 2, .18); put(music, HO, b + beat * .75, .0)
        for q in range(4):
            tt0 = b + q * beat / 4
            put(music, pluck(arp[(step * 4 + q) % 16] * (2 if (b > v2t(41.7)) else 1)), tt0, .05 + (.03 if q % 2 == 0 else 0))
    b += beat; step += 1
# kicks quieter before 17.5 voiceover (tension build) handled by ducking
# --- risers / impacts / whooshes
def noise_sweep(dur, f0, f1, up=True):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); seg_n = 2048
    fs = np.geomspace(f0, f1, n // seg_n + 1)
    for i in range(0, n, seg_n):
        f = fs[i // seg_n]; blk = x[i:i + seg_n]
        out[i:i + seg_n] = bp(blk, max(60, f * .6), min(SR / 2 - 100, f * 1.4), 1)
    e = (np.linspace(0, 1, n) ** 2) if up else (np.linspace(1, 0, n) ** 1.5)
    return out * e
def impact(g=1.0):
    n = int(2.4 * SR); tt = np.arange(n) / SR
    f = 36 + 140 * np.exp(-tt * 14); ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(ph) * np.exp(-tt * 2.2)
    crack = hp(rng.standard_normal(n), 1500) * np.exp(-tt * 14) * .5
    return (boom + crack) * g
def whoosh(dur=.7):
    n = int(dur * SR); x = noise_sweep(dur, 400, 6000, True); e = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return x * e
IMP = impact()
hits = [(9.95, 1.0), (11.65, .8), (20.9, .7), (26.0, .8), (31.3, .6), (41.7, .8)]
for v, g in hits:
    t0 = v2t(v) - 0.02
    put(sfx, IMP, t0, g * .55)
# riser into logo
put(sfx, noise_sweep(1.55, 300, 7000, True), v2t(9.95) - 1.55, .22)
put(sfx, noise_sweep(1.2, 300, 6000, True), v2t(48.55) - 1.2, .2)
for v in (11.65, 26.0, 31.3, 41.7):
    put(sfx, whoosh(.65), v2t(v) - .32, .22)
for v in (20.9, 38.45):
    put(sfx, whoosh(.6), v2t(v) - .3, .18)
# logo slam
put(sfx, impact(), v2t(10.28), .75)
# final lockup hit + shimmer
put(sfx, impact(), v2t(48.7), 1.0)
shim = np.zeros(int(3 * SR)); tt = np.arange(len(shim)) / SR
for f in (1318.5, 1760, 2637, 3520):
    shim += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 1.6) * .05
put(sfx, shim, v2t(48.75), 1)
# UI ticks on product beats / grid / stations / plates
def tick(f=2400, d=.06):
    n = int(d * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * f * tt) * np.exp(-tt * 60) + .5 * hp(rng.standard_normal(n), 3000) * np.exp(-tt * 80)
for v in (13.25, 14.15, 15.2, 16.25, 16.85):
    put(sfx, tick(1800), v2t(v), .35)
for i in range(6): put(sfx, tick(2200 + i * 120), v2t(17.5 + i * .09), .22)
for v in (22.0, 22.78, 23.42, 44.85, 45.75, 46.7, 47.62): put(sfx, tick(1500, .09), v2t(v), .5)
for v in (33.1, 33.98, 34.84): put(sfx, impact(), v2t(v), .22); put(sfx, tick(2800), v2t(v), .3)
for v in (27.0, 27.85, 28.75): put(sfx, tick(2000, .1), v2t(v), .4)
for v in (39.25, 40.2): put(sfx, tick(900, .1), v2t(v), .5)
# --- VO with 1.2 s trimmed from the front
w = wave.open('../Sound_Center_VO_Puck_Egyptian.wav'); vsr = w.getframerate()
vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
from scipy.signal import resample_poly
vo = resample_poly(vo, SR, vsr)[int(OFF * SR):]
vo = hp(vo, 70, 2)
vbuf = np.zeros(N); vbuf[:len(vo)] = vo[:N]
vbuf /= np.percentile(np.abs(vbuf), 99.5) * 1.15
# --- reverb on music bus
ir = rng.standard_normal(int(1.6 * SR)) * np.exp(-np.arange(int(1.6 * SR)) / SR * 3.2); ir = lp(ir, 5000)
wet = signal.fftconvolve(music + sfx * .6, ir)[:N] * .018
# --- ducking from the VO envelope
e = np.abs(vbuf); e = lp(e, 6, 1) * 4; e = np.clip(e / np.percentile(e, 95), 0, 1)
duck = 1 - .62 * e
bed = (music * 1.0 + wet) * duck + sfx * (1 - .35 * e)
bed = lp(bed, 14000)
mix = vbuf * .8 + bed * .55
# fades
mix *= np.clip(t_axis / .5, 0, 1) * np.clip((DUR - t_axis) / 1.6, 0, 1)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.max(np.abs(mix)) / .85
st = np.stack([mix, mix], 1)
# slight stereo width on music wet
st[:, 0] += wet[:N] * .3 * duck; st[:, 1] -= wet[:N] * .3 * duck
st = np.clip(st, -1, 1)
os.makedirs('build', exist_ok=True)
with wave.open('build/mix.wav', 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok', np.abs(st).max())

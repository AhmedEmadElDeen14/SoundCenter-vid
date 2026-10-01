"""Derive clean, transparent brand assets from the supplied logo files."""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
import os
R = os.path.join(os.path.dirname(__file__), '..', '..')
O = os.path.join(os.path.dirname(__file__), '..', 'assets')

# --- Sound Center logo: keep native alpha, map the yellow wordmark to white (palette: red/black/white)
src = np.array(Image.open(f'{R}/Sound Center Logo.png').convert('RGBA')).astype(float)
out = src[..., :3].copy(); alpha = src[..., 3] / 255
yellow = (out[..., 0] > 150) & (out[..., 2] < 130) & (out[..., 1] > 40)
u = np.where(yellow, np.clip((out[..., 1] - 30) / 146, 0, 1), 0)
red = np.array([206, 30, 32.])
for c in range(3):
    out[..., c] = np.where(u > 0, red[c] * (1 - u) + 255 * u, out[..., c])
rgba = np.dstack([out, alpha * 255]).clip(0, 255).astype(np.uint8)
img = Image.fromarray(rgba, 'RGBA')
img = img.crop(img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())
img.save(f'{O}/sc_logo.png'); print('logo', img.size)

# --- client logos: trim transparent margins only (colours untouched)
for src, dst in [('Al_Ahly_SC_logo.svg.webp', 'ahly.png'), ('Go_bus_logo.png', 'gobus.png'), ('Blue Bus Logo.webp', 'bluebus.png')]:
    i = Image.open(f'{R}/{src}').convert('RGBA')
    bb = i.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    i = i.crop(bb); i.save(f'{O}/{dst}'); print(dst, i.size)

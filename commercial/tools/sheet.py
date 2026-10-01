import sys
from PIL import Image
fs=sys.argv[2:]; w=360; h=640
im=Image.new('RGB',(w*len(fs),h))
for i,f in enumerate(fs): im.paste(Image.open(f'/tmp/w/a/f_{float(f):.2f}.png').convert('RGB').resize((w,h)),(i*w,0))
im.save(sys.argv[1])

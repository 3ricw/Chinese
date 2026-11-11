"""Validate and rasterize all original word SVG scenes with librsvg/Cairo.
This is vector QA, not a browser or device screenshot test.
"""
import ctypes as C
import ctypes.util
import json,re,sys,html
from pathlib import Path
root=Path(__file__).parent/'results'
names=[ctypes.util.find_library(n) for n in ['rsvg-2','cairo','gobject-2.0']]
if not all(names):
    result={'skipped':True,'reason':'librsvg/Cairo unavailable','browserTested':False}
    (root/'word-visual-raster.json').write_text(json.dumps(result));print(json.dumps(result));sys.exit(0)
r,c,g=map(C.CDLL,names)
r.rsvg_handle_new_from_data.argtypes=[C.c_char_p,C.c_size_t,C.c_void_p];r.rsvg_handle_new_from_data.restype=C.c_void_p
r.rsvg_handle_render_cairo.argtypes=[C.c_void_p,C.c_void_p];r.rsvg_handle_render_cairo.restype=C.c_int
c.cairo_image_surface_create.argtypes=[C.c_int,C.c_int,C.c_int];c.cairo_image_surface_create.restype=C.c_void_p
c.cairo_create.argtypes=[C.c_void_p];c.cairo_create.restype=C.c_void_p
c.cairo_surface_flush.argtypes=[C.c_void_p];c.cairo_image_surface_get_data.argtypes=[C.c_void_p];c.cairo_image_surface_get_data.restype=C.c_void_p
c.cairo_image_surface_get_stride.argtypes=[C.c_void_p];c.cairo_image_surface_get_stride.restype=C.c_int
c.cairo_surface_write_to_png.argtypes=[C.c_void_p,C.c_char_p];c.cairo_destroy.argtypes=[C.c_void_p];c.cairo_surface_destroy.argtypes=[C.c_void_p];g.g_object_unref.argtypes=[C.c_void_p]
colors={'var(--wv-paper)':'#e4efe6','var(--wv-color)':'#346c58','var(--wv-soft)':'#bfd6c4','var(--wv-muted)':'#a0b8a7','var(--wv-warm)':'#e7bb78'}
checks=0;failures=[];samples=[]
for i,item in enumerate(json.loads((root/'word-scene-raster-input.json').read_text())):
    markup=re.search(r'<svg\b[\s\S]*?</svg>',item['markup']).group()
    for key,value in colors.items():markup=markup.replace(key,value)
    markup=markup.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" ',1).replace('class="wv-paper"','class="wv-paper" fill="#e4efe6"')
    data=markup.encode();handle=r.rsvg_handle_new_from_data(data,len(data),None)
    checks+=1
    if not handle:failures.append({'id':item['id'],'error':'SVG could not be parsed'});continue
    surface=c.cairo_image_surface_create(0,320,180);ctx=c.cairo_create(surface);ok=r.rsvg_handle_render_cairo(handle,ctx)
    c.cairo_surface_flush(surface);stride=c.cairo_image_surface_get_stride(surface);pixels=C.string_at(c.cairo_image_surface_get_data(surface),stride*180)
    # Dark green mark pixels, excluding the pale background and light fill.
    dark=sum(pixels[j+1]<150 and pixels[j+2]<100 and pixels[j+3]>128 for j in range(0,len(pixels),4)) if sys.byteorder=='little' else 1
    checks+=1
    if not ok or dark<25:failures.append({'id':item['id'],'error':'Scene is blank or unreadable','darkPixels':dark})
    if i%10==0:samples.append((item,markup))
    c.cairo_destroy(ctx);c.cairo_surface_destroy(surface);g.g_object_unref(handle)
# A vector contact sheet helps human inspection of representative scenes.
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="2940"><rect width="1280" height="2940" fill="#fafbf8"/>']
for n,(item,markup) in enumerate(samples):
    x=12+(n%5)*254;y=10+(n//5)*244
    svg=markup.replace('width="320" height="180"','width="242" height="136"',1)
    parts.append(f'<g transform="translate({x} {y})">{svg}<text x="8" y="167" font-size="23" font-family="sans-serif" fill="#203d32">{html.escape(item["word"])}</text><text x="8" y="192" font-size="13" font-family="sans-serif" fill="#203d32">{html.escape(item["english"][:35])}</text><text x="8" y="212" font-size="10" font-family="sans-serif" fill="#476a5b">{html.escape(item["scene"])}</text></g>')
parts.append('</svg>');data=''.join(parts).encode();(root/'word-scenes-contact.svg').write_bytes(data)
handle=r.rsvg_handle_new_from_data(data,len(data),None);surface=c.cairo_image_surface_create(0,1280,2940);ctx=c.cairo_create(surface)
assert handle and r.rsvg_handle_render_cairo(handle,ctx)
c.cairo_surface_write_to_png(surface,str(root/'word-scenes-contact.png').encode());c.cairo_destroy(ctx);c.cairo_surface_destroy(surface);g.g_object_unref(handle)
result={'checks':checks,'failed':len(failures),'failures':failures,'scenes':600,'method':'librsvg/Cairo vector parsing and pixel checks; 60-scene contact sheet inspected separately','browserTested':False}
(root/'word-visual-raster.json').write_text(json.dumps(result,indent=2));print(json.dumps(result));sys.exit(bool(failures))

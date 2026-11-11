"""Rasterize actual ink paths with librsvg/Cairo. No browser screenshots.
Optional native-library check; writes an explicit skipped result if unavailable.
Run after node tests/glass-ui.cjs. No Python third-party modules are required.
"""
import ctypes as C
import ctypes.util
import json
import sys
from pathlib import Path

root=Path(__file__).parent/'results'
names=[ctypes.util.find_library(n) for n in ['rsvg-2','cairo','gobject-2.0']]
if not all(names):
    result={'skipped':True,'reason':'librsvg/Cairo unavailable','browserTested':False}
    (root/'ink-raster.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result));sys.exit(0)
r,c,g=map(C.CDLL,names)
r.rsvg_handle_new_from_data.argtypes=[C.c_char_p,C.c_size_t,C.c_void_p];r.rsvg_handle_new_from_data.restype=C.c_void_p
r.rsvg_handle_render_cairo.argtypes=[C.c_void_p,C.c_void_p];r.rsvg_handle_render_cairo.restype=C.c_int
c.cairo_image_surface_create.argtypes=[C.c_int,C.c_int,C.c_int];c.cairo_image_surface_create.restype=C.c_void_p
c.cairo_create.argtypes=[C.c_void_p];c.cairo_create.restype=C.c_void_p
c.cairo_surface_flush.argtypes=[C.c_void_p]
c.cairo_image_surface_get_data.argtypes=[C.c_void_p];c.cairo_image_surface_get_data.restype=C.c_void_p
c.cairo_image_surface_get_stride.argtypes=[C.c_void_p];c.cairo_image_surface_get_stride.restype=C.c_int
c.cairo_surface_write_to_png.argtypes=[C.c_void_p,C.c_char_p]
c.cairo_destroy.argtypes=[C.c_void_p];c.cairo_surface_destroy.argtypes=[C.c_void_p];g.g_object_unref.argtypes=[C.c_void_p]
checks=0;failures=[];rows=[]
for m in json.loads((root/'ink-masks.json').read_text()):
    data=(f'<svg xmlns="http://www.w3.org/2000/svg" width="{m["width"]}" height="{m["height"]}"><path fill="#101115" d="{m["path"]}"/></svg>').encode()
    handle=r.rsvg_handle_new_from_data(data,len(data),None);surface=c.cairo_image_surface_create(0,m['width'],m['height']);ctx=c.cairo_create(surface)
    assert handle and r.rsvg_handle_render_cairo(handle,ctx)
    c.cairo_surface_flush(surface);stride=c.cairo_image_surface_get_stride(surface)
    pixels=C.string_at(c.cairo_image_surface_get_data(surface),stride*m['height']);alpha=pixels[(3 if sys.byteorder=='little' else 0)::4]
    coverage=sum(v>127 for v in alpha)/len(alpha);rows.append({'name':m['name'],'index':m['index'],'coverage':round(coverage,5)})
    checks+=1
    if m['index']==0 and max(alpha)!=0:failures.append(m['name']+': initial ink is not empty')
    if m['index']==m.get('last',12) and min(alpha)!=255:failures.append(m['name']+': final ink leaves exposed pixels')
    assert c.cairo_surface_write_to_png(surface,str(root/('ink-'+m['name']+'.png')).encode())==0
    c.cairo_destroy(ctx);c.cairo_surface_destroy(surface);g.g_object_unref(handle)
for prefix in sorted({r['name'].rsplit('-',1)[0] for r in rows}):
    values=[r['coverage'] for r in rows if r['name'].rsplit('-',1)[0]==prefix];checks+=1
    if values!=sorted(values):failures.append(prefix+': sampled coverage decreases')
result={'checks':checks,'failed':len(failures),'failures':failures,'renderedMasks':len(rows),'coverage':rows,'method':'librsvg/Cairo rasterization of the actual vector clip paths; no browser rendering','browserTested':False,'skipped':False}
(root/'ink-raster.json').write_text(json.dumps(result,indent=2));print(json.dumps({k:v for k,v in result.items() if k!='coverage'}))
if failures:sys.exit(1)

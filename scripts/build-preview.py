"""Content-address the ordered assets and reconstruct one standalone review file.

Run from any directory: python3 scripts/build-preview.py /absolute/output.html
The deployment consists of index.html, .nojekyll, and referenced assets/ files.
No network requests or publishing are performed.
"""
import hashlib,re,sys,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
index=(ROOT/'index.html').read_text()
for kind,suffix in [('script','js'),('style','css')]:
 ident='app-startup-script' if kind=='script' else 'app-startup-css'
 source=(ROOT/'scripts'/('startup.'+suffix)).read_text()
 index=re.sub(r'<'+kind+r' id="'+ident+r'">[\s\S]*?</'+kind+r'>',lambda m:'<'+kind+' id="'+ident+'">'+source+'</'+kind+'>',index)
refs=list(dict.fromkeys(re.findall(r'(?:src|href)="(assets/[^"]+)"',index)))
manifest=[]
for ref in refs:
 p=ROOT/ref;data=p.read_bytes();digest=hashlib.sha256(data).hexdigest()
 stem=re.sub(r'-[a-f0-9]{12}$','',p.stem)
 new=p.with_name(stem+'-'+digest[:12]+p.suffix)
 if new!=p:new.write_bytes(data)
 newref=new.relative_to(ROOT).as_posix();index=index.replace('"'+ref+'"','"'+newref+'"')
 manifest.append(dict(path=newref,sha256=digest,bytes=len(data)))
(ROOT/'index.html').write_text(index)
def inline_script(m):
 attrs=m.group(1);match=re.search(r'\bsrc="([^"]+)"',attrs)
 if not match:return m.group()
 ref=match.group(1)
 if not ref.startswith('assets/'):return m.group()
 body=(ROOT/ref).read_text();assert '</script' not in body.lower(),ref
 return '<script'+re.sub(r'\s*src="[^"]+"','',attrs)+'>'+body+'</script>'
def inline_style(m):
 attrs=m.group(1)
 if 'rel="stylesheet"' not in attrs:return m.group()
 match=re.search(r'href="(assets/[^"]+)"',attrs)
 if not match:return m.group()
 ident=re.search(r'\bid="([^"]+)"',attrs)
 return '<style'+(' id="'+ident.group(1)+'"' if ident else '')+'>'+(ROOT/match.group(1)).read_text()+'</style>'
standalone=re.sub(r'<script\b([^>]*)></script>',inline_script,index)
standalone=re.sub(r'<link\b([^>]*)>',inline_style,standalone)
assert not re.search(r'(?:src|href)="assets/',standalone)
out=Path(sys.argv[1]).resolve();out.parent.mkdir(parents=True,exist_ok=True);out.write_text(standalone)
result=dict(baseCommit='10f94c0ab51452ab2fa9a3cf483cfb868f2f4e38',assets=manifest,standaloneSha256=hashlib.sha256(out.read_bytes()).hexdigest(),standaloneBytes=out.stat().st_size)
(ROOT/'tests/results/package.json').write_text(json.dumps(result,indent=2))
print(json.dumps(dict(output=str(out),assets=len(manifest),bytes=out.stat().st_size,sha256=result['standaloneSha256'])))

import json,re,sys
from pathlib import Path
from html.parser import HTMLParser
class Check(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.stack=[];self.ids=set();self.errors=[];self.handlers=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='button' and 'button' in self.stack:self.errors.append('nested button')
  if 'id' in attrs:
   if attrs['id'] in self.ids:self.errors.append('duplicate id '+attrs['id'])
   self.ids.add(attrs['id'])
  for k,v in attrs.items():
   if k.startswith('on') and v:self.handlers.append(v)
  if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(tag)
 def handle_endtag(self,tag):
  if tag not in self.stack:self.errors.append('unmatched closing '+tag);return
  if self.stack[-1]!=tag:self.errors.append('misnested '+tag+' inside '+self.stack[-1])
  del self.stack[self.stack.index(tag) if self.stack.count(tag)==1 else len(self.stack)-1-self.stack[::-1].index(tag):]
 def handle_startendtag(self,tag,attrs):
  self.handle_starttag(tag,attrs)
  if self.stack and self.stack[-1]==tag:self.stack.pop()
root=Path(__file__).parent/'results';views=json.loads((root/'views.json').read_text());failures=[];handlers=set()
for view in views:
 p=Check();p.feed(view['html']);handlers.update(p.handlers)
 if p.stack:p.errors.append('unclosed '+','.join(p.stack))
 if re.search(r'\b(?:undefined|NaN)\b',re.sub('<[^>]*>','',view['html'])):p.errors.append('undefined/NaN text')
 if re.search(r'(?:Chapter|Lesson|Ch\.) c2-',view['html']):p.errors.append('internal lesson ID in label')
 if p.errors:failures.append({'name':view['name'],'errors':p.errors})
(root/'handlers.json').write_text(json.dumps(sorted(handlers)))
(root/'structure.json').write_text(json.dumps({'views':len(views),'handlers':len(handlers),'failed':len(failures),'failures':failures},indent=2))
print(json.dumps({'views':len(views),'handlers':len(handlers),'failed':len(failures)}))
if failures:print(json.dumps(failures[:12],ensure_ascii=False,indent=2));sys.exit(1)

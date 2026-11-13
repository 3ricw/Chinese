/* Original geometric candidate search for Eric's Chinese.
 * Uses general Ramer-Douglas-Peucker simplification and weighted edit distance.
 * No HanziLookup algorithm code is incorporated. DRAW_MODEL is separately
 * attributed Arphic Public License stroke-descriptor data. Suggestions are
 * approximate character candidates, never handwriting grades or proof of recall.
 */
var DrawRecognizer=(function(){
 'use strict';
 var modelRef=null,models=[],SQRT2=Math.sqrt(2),TAU=Math.PI*2;
 function difference(a,b){var d=Math.abs(a-b)%TAU;return Math.min(d,TAU-d)/Math.PI}
 function distanceToSegment(p,a,b){var x=b[0]-a[0],y=b[1]-a[1],d=x*x+y*y,t=d?((p[0]-a[0])*x+(p[1]-a[1])*y)/d:0;t=Math.max(0,Math.min(1,t));return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y)}
 function simplify(points,epsilon){
  var keep=new Set([0,points.length-1]),stack=[[0,points.length-1]];
  while(stack.length){var pair=stack.pop(),start=pair[0],end=pair[1],at=-1,best=epsilon;
   for(var i=start+1;i<end;i++){var d=distanceToSegment(points[i],points[start],points[end]);if(d>best){best=d;at=i}}
   if(at>=0){keep.add(at);stack.push([start,at],[at,end])}
  }
  return Array.from(keep).sort(function(a,b){return a-b}).map(function(i){return points[i]});
 }
 function normalized(features){
  if(!features.length)return null;
  var left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(var i=0;i<features.length;i++){var f=features[i],dx=Math.cos(f[0])*f[1]/2,dy=-Math.sin(f[0])*f[1]/2;left=Math.min(left,f[2]-Math.abs(dx));right=Math.max(right,f[2]+Math.abs(dx));top=Math.min(top,f[3]-Math.abs(dy));bottom=Math.max(bottom,f[3]+Math.abs(dy))}
  var scale=Math.max(right-left,bottom-top);if(!Number.isFinite(scale)||scale<1e-6)return null;
  var x=(left+right)/2,y=(top+bottom)/2,out=new Float32Array(features.length*4),weight=0;
  for(var j=0;j<features.length;j++){var v=features[j],n=j*4;out[n]=v[0];out[n+1]=v[1]/scale;out[n+2]=(v[2]-x)/scale;out[n+3]=(v[3]-y)/scale;weight+=.12+out[n+1]}
  return {values:out,length:features.length,weight:weight};
 }
 function extract(strokes){
  if(!Array.isArray(strokes)||!strokes.length||strokes.length>64)return null;
  var safe=[],count=0,left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(var i=0;i<strokes.length;i++){
   var raw=strokes[i];if(!Array.isArray(raw)||raw.length>512)return null;var points=[];
   for(var j=0;j<raw.length;j++){var p=raw[j];if(!Array.isArray(p)||p.length!==2||p.some(function(n){return !Number.isFinite(n)||n<0||n>1}))return null;if(++count>8192)return null;
    var last=points[points.length-1];if(!last||Math.hypot(p[0]-last[0],p[1]-last[1])>1e-5){points.push([p[0],p[1]]);left=Math.min(left,p[0]);right=Math.max(right,p[0]);top=Math.min(top,p[1]);bottom=Math.max(bottom,p[1])}
   }
   if(points.length>=2)safe.push(points);
  }
  var size=Math.max(right-left,bottom-top);if(!safe.length||!Number.isFinite(size)||size<.001)return null;
  var features=[];
  for(var s=0;s<safe.length;s++){
   var line=simplify(safe[s],size*.025),coarse=[line[0]];
   for(var q=1;q<line.length;q++){
    if(q<line.length-1){var before=coarse[coarse.length-1],here=line[q],after=line[q+1],a1=Math.atan2(before[1]-here[1],here[0]-before[0]),a2=Math.atan2(here[1]-after[1],after[0]-here[0]);if(difference(a1,a2)<.17)continue}
    coarse.push(line[q]);
   }
   line=coarse;
   for(var k=1;k<line.length;k++){
    var a=line[k-1],b=line[k],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<size*.008)continue;
    features.push([(Math.atan2(-dy,dx)+TAU)%TAU,length,(a[0]+b[0])/2,(a[1]+b[1])/2]);
    if(features.length>128)return null;
   }
  }
  var result=normalized(features);if(result)result.strokes=safe.length;return result;
 }
 function readModel(){
  var source=typeof DRAW_MODEL==='object'&&DRAW_MODEL;if(source===modelRef)return models;
  modelRef=source;models=[];if(!source||!Array.isArray(source.chars)||typeof source.substrokes!=='string')return models;
  var binary;try{binary=atob(source.substrokes)}catch(_){return models}
  for(var i=0;i<source.chars.length&&i<16000;i++){
   var row=source.chars[i];if(!Array.isArray(row)||typeof row[0]!=='string'||Array.from(row[0]).length!==1||!Number.isInteger(row[1])||row[1]<1||row[1]>64||!Number.isInteger(row[2])||row[2]<1||row[2]>128||!Number.isInteger(row[3])||row[3]<0||row[3]+row[2]*3>binary.length)continue;
   var features=[];for(var j=0;j<row[2];j++){var off=row[3]+j*3,center=binary.charCodeAt(off+2);features.push([binary.charCodeAt(off)/255*TAU,binary.charCodeAt(off+1)/255*SQRT2,(center>>4)/15,(center&15)/15])}
   var entry=normalized(features);if(entry){entry.character=row[0];entry.strokes=row[1];models.push(entry)}
  }
  return models;
 }
 function alignment(a,b){
  var av=a.values,bv=b.values,previous=new Float64Array(b.length+1),next=new Float64Array(b.length+1),i,j;
  for(j=1;j<=b.length;j++)previous[j]=previous[j-1]+.78*(.12+bv[(j-1)*4+1]);
  for(i=1;i<=a.length;i++){
   var ai=(i-1)*4,alen=av[ai+1],deletion=.78*(.12+alen);next[0]=previous[0]+deletion;
   for(j=1;j<=b.length;j++){
    var bi=(j-1)*4,blen=bv[bi+1],insertion=.78*(.12+blen),angle=difference(av[ai],bv[bi]),position=Math.hypot(av[ai+2]-bv[bi+2],av[ai+3]-bv[bi+3]),length=Math.min(2,Math.abs(Math.log(Math.max(.015,alen)/Math.max(.015,blen)))),weight=.12+Math.sqrt(alen*blen);
    var match=(angle*.95+position*.85+length*.20)*weight;
    next[j]=Math.min(previous[j-1]+match,previous[j]+deletion,next[j-1]+insertion);
   }
   var swap=previous;previous=next;next=swap;
  }
  var base=previous[b.length]/Math.max(.1,(a.weight+b.weight)/2),strokePenalty=Math.abs(a.strokes-b.strokes)/Math.max(a.strokes,b.strokes),segments=Math.abs(a.length-b.length)/Math.max(a.length,b.length);
  return base+strokePenalty*.38+segments*.06;
 }
 function prepare(strokes,limit){
  var input=extract(strokes);if(!input)return null;
  var data=readModel(),threshold=Math.max(2,Math.ceil(input.strokes*.35));
  return {input:input,limit:Number.isFinite(limit)?Math.max(1,Math.min(16,Math.floor(limit))):8,pool:data.filter(function(m){return Math.abs(m.strokes-input.strokes)<=threshold&&m.length<=Math.max(8,input.length*2.5)&&m.length>=input.length*.4})};
 }
 function finish(rows,limit){
  var seen=new Set();rows.sort(function(a,b){return a.score-b.score||a.character.localeCompare(b.character)});
  return rows.filter(function(r){if(seen.has(r.character))return false;seen.add(r.character);return true}).slice(0,limit);
 }
 function match(strokes,limit){
  var task=prepare(strokes,limit);if(!task)return [];
  return finish(task.pool.map(function(m){return {character:m.character,score:alignment(task.input,m)}}),task.limit);
 }
 // The same scoring pass in bounded chunks keeps slow displays responsive.
 // A true shouldCancel() result resolves an abandoned lookup with no candidates.
 function matchAsync(strokes,limit,shouldCancel){
  return new Promise(function(resolve,reject){
   var cancelled=function(){return typeof shouldCancel==='function'&&shouldCancel()};
   if(cancelled()){resolve([]);return}
   var task;try{task=prepare(strokes,limit)}catch(error){reject(error);return}
   if(!task||cancelled()){resolve([]);return}
   var at=0,rows=[];
   function step(){
    try{
     if(cancelled()){resolve([]);return}
     var started=Date.now(),end=Math.min(task.pool.length,at+48);
     for(;at<end;at++){
      var m=task.pool[at];rows.push({character:m.character,score:alignment(task.input,m)});
      if(Date.now()-started>=10){at++;break}
     }
     if(at>=task.pool.length)resolve(finish(rows,task.limit));else setTimeout(step,0);
    }catch(error){reject(error)}
   }
   setTimeout(step,0);
  });
 }
 return {match:match,matchAsync:matchAsync};
})();

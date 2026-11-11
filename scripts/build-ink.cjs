/* Original procedural ink geometry compiler. Run after changing this shape model.
   Produces normalized, quantized control vertices for 29 interpolated frames.
   Building ahead of time keeps expensive noise sampling off the theme-button path. */
const fs=require('node:fs'),path=require('node:path');
function axInkNoise(x,y){
 const hash=(i,j)=>{let h=Math.imul(i,374761393)^Math.imul(j,668265263);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/2147483647.5-1};
 const i=Math.floor(x),j=Math.floor(y),tx=x-i,ty=y-j,u=tx*tx*tx*(tx*(tx*6-15)+10),v=ty*ty*ty*(ty*(ty*6-15)+10);
 const a=hash(i,j),b=hash(i+1,j),c=hash(i,j+1),d=hash(i+1,j+1);
 return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;
}
function axInkFbm(x,y){
 let value=0,weight=.56;
 for(let i=0;i<3;i++){value+=axInkNoise(x,y)*weight;const next=x*1.73-y*1.17+11.8;y=x*1.17+y*1.73-7.3;x=next;weight*=.48}
 return value;
}
function axInkPath(x,y,radius,progress,phase=0){
 const p=Math.min(1,Math.max(0,progress)),r=radius*p,drift=p*.55,fade=(1-p)**.9;
 const point=(a,offset=0)=>{
  const u=Math.cos(a),v=Math.sin(a),qx=u*(1.4+p*2.1)+phase*7,qy=v*(1.4+p*2.1)-phase*3;
  const wx=axInkFbm(qx+drift,qy),wy=axInkFbm(qx+4.7,qy-drift);
  const broad=axInkFbm(qx+wx*1.8,qy+wy*1.8),lobe=axInkNoise(u*2.2+phase,v*2.2-phase);
  // Ridges create uneven fingers; warping curves their direction as they grow.
  const ridge=Math.max(0,1-Math.abs(axInkFbm(u*8+p*3+wx,v*8-p*2+wy))*6)**2;
  const gate=Math.max(0,axInkNoise(u*4-phase,v*4+phase)+.35);
  const fibre=axInkNoise(u*66+phase,v*66-phase)*.025+axInkNoise(u*151,v*151)*.014+axInkNoise(u*277+phase,v*277)*.008;
  const reach=1+fade*(.4*broad+.23*lobe+.2*ridge*gate+fibre);
  const angle=a+fade*(.09*wx+.04*wy*ridge+.016*Math.sin(a*73+phase+wx*4)+.009*Math.sin(a*149-phase+wy*3)),rr=r*reach+offset;
  return [x+Math.cos(angle)*rr,y+Math.sin(angle)*rr];
 };
 let d=axInkContour(Array.from({length:720},(_,i)=>point(i*Math.PI/360)));
 const envelope=Math.sin(Math.PI*p)**1.5;
 for(let i=0;i<32;i++){
  const vein=i>=20,a=i*2.399963+phase*.2,offset=(vein?-1:1)*radius*.012*envelope;
  const rx=radius*(vein?.0028:.004+(i%3)*.002)*envelope,ry=radius*(vein?.032:.012+(i%4)*.005)*envelope;
  const points=Array.from({length:12},(_,j)=>{const t=j*Math.PI/6,w=1+.18*Math.sin(t*3+i+drift),u=Math.cos(t)*rx*w,v=Math.sin(t)*ry*w;return point(a+v/Math.max(1,r),offset+u)});
  if(vein)points.reverse();d+=axInkContour(points);
 }
 return 'path("'+d+'")';
}
function axInkFrames(x,y,radius,phase=0){return Array.from({length:29},(_,i)=>axInkPath(x,y,radius,i/28,phase))}

const frames=[];let capture=[];
function axInkContour(points){capture.push(points);return ''}
for(let i=0;i<29;i++){capture=[];axInkPath(0,0,1,i/28,.7);frames.push(capture.flat())}
const bytes=Buffer.alloc(frames.length*1104*4);let pos=0;
for(const frame of frames)for(const point of frame)for(const n of point){const v=Math.round(n*20000);if(Math.abs(v)>32767)throw Error('Ink shape out of bounds');bytes.writeInt16LE(v,pos);pos+=2}
const output=JSON.stringify(bytes.toString('base64'));
if(process.argv[2])fs.writeFileSync(path.resolve(process.argv[2]),output);else process.stdout.write(output);

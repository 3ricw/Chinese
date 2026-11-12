/* Root-link routing with Watch-sized CSS viewports, not a watchOS device test. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{boot}=require('./runtime.cjs');
const root=path.resolve(__dirname,'..'),index=fs.readFileSync(path.join(root,'index.html'),'utf8'),source=fs.readFileSync(path.join(root,'scripts/startup.js'),'utf8');
const inline=index.match(/<script id="app-startup-script">([\s\S]*?)<\/script>/)[1],checks=[],failures=[];
function check(name,fn){checks.push(name);try{fn()}catch(e){failures.push({name,error:e.message})}}
function route(o={}){
 const redirects=[],writes=[],attrs={},record='{"memoryNotes":{"你":"My existing note"},"commonWords":{"saved":["cw-01-01"]},"courses":{"selected":"chinese-2"}}';
 const c={document:{documentElement:{setAttribute:(k,v)=>attrs[k]=v,removeAttribute:k=>delete attrs[k],style:{setProperty(){},removeProperty(){}}},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}},location:new URL(o.url||'https://3ricw.github.io/Chinese/'),innerWidth:o.width===undefined?390:o.width,innerHeight:o.height===undefined?844:o.height,screen:o.screen,navigator:{userAgent:o.ua||'Generic browser'},localStorage:{getItem:()=>record,setItem:(...v)=>writes.push(v)},URL,URLSearchParams,Date,setTimeout:()=>1,clearTimeout(){},addEventListener(){}};
 if(!o.noMedia)c.matchMedia=()=>({matches:!!o.coarse});c.window=c;c.location.replace=url=>redirects.push(new URL(url));vm.createContext(c);vm.runInContext(inline,c);
 return {redirects,writes,record,c,attrs};
}
check('published inline routing matches the maintained startup source',()=>assert.equal(inline,source));
for(const name of ['index.html','watch/index.html','watch/browse.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8'),meta='<meta name="disabled-adaptations" content="watch">';
 check(name+' requests native Watch dimensions before any script',()=>{assert.equal(html.split(meta).length,2);assert(html.indexOf(meta)<html.indexOf('</head>'));assert(html.indexOf('<script')<0||html.indexOf(meta)<html.indexOf('<script'));assert(html.includes('width=device-width,initial-scale=1'))});
}
const cases=[
 ['156×195 viewport',{width:156,height:195},true],
 ['162×197 viewport',{width:162,height:197},true],
 ['176×215 viewport',{width:176,height:215},true],
 ['184×224 viewport',{width:184,height:224},true],
 ['198×242 viewport',{width:198,height:242},true],
 ['205×251 viewport',{width:205,height:251},true],
 ['208×248 viewport',{width:208,height:248},true],
 ['260×520 upper boundary',{width:260,height:520},true],
 ['no media-query API',{width:198,height:242,noMedia:true},true],
 ['touch pointer unavailable',{width:198,height:242,coarse:false},true],
 ['inflated layout with small physical CSS screen',{width:320,height:357,screen:{width:198,height:242}},true],
 ['Watch user agent',{ua:'Apple Watch'},true],
 ['explicit Watch request',{url:'https://3ricw.github.io/Chinese/?watch=1&q=hello'},true],
 ['desktop',{},false],
 ['phone',{width:390,height:844,coarse:true,screen:{width:390,height:844}},false],
 ['small phone',{width:320,height:568,coarse:true,screen:{width:320,height:568}},false],
 ['phone with keyboard',{width:320,height:357,coarse:true,screen:{width:320,height:568}},false],
 ['narrow tall phone',{width:250,height:700},false],
 ['landscape phone',{width:844,height:390},false],
 ['width above boundary',{width:261,height:250},false],
 ['height above boundary',{width:198,height:521},false],
 ['unknown dimensions',{width:0,height:0,screen:{width:0,height:0}},false],
 ['missing dimensions',{width:NaN,height:undefined},false],
 ['full-app override',{width:198,height:242,ua:'Watch',url:'https://3ricw.github.io/Chinese/?full=1&watch=1'},false],
 ['local HTML preview',{width:198,height:242,url:'file:///tmp/preview.html?watch=1'},false]
];
for(const [label,options,expected]of cases)check(label+' opens the appropriate surface without progress writes',()=>{const t=route(options);assert.equal(t.redirects.length,expected?1:0);if(expected){assert.equal(t.redirects[0].origin,'https://3ricw.github.io');assert.equal(t.redirects[0].pathname,'/Chinese/watch/');assert(!t.redirects[0].searchParams.has('saved'));assert(!t.redirects[0].searchParams.has('browse'));assert(!t.redirects[0].searchParams.has('word'))}assert.deepEqual(t.writes,[]);assert.equal(t.c.localStorage.getItem('hanzi-reading-room-v2'),t.record)});
for(const query of ['你好','lü4 se4','&<hello>','a'.repeat(100)])check('automatic routing preserves a bounded search query '+query.slice(0,12),()=>{const t=route({width:198,height:242,url:'https://3ricw.github.io/Chinese/index.html?q='+encodeURIComponent(query)+'&saved=1&word=old'});assert.equal(t.redirects[0].pathname,'/Chinese/watch/');assert.equal(t.redirects[0].searchParams.get('q'),query.slice(0,80));assert(!t.redirects[0].searchParams.has('word'));assert(!t.redirects[0].searchParams.has('saved'))});
const watch=boot({'erics-chinese-watch-browser-v1':JSON.stringify({version:1,saved:['cw-01-01'],script:'simplified'})},root,'watch/index.html');
check('the Watch page opens on Search even with existing saved words',()=>{assert.equal(watch.run('WatchWords.state.view'),'search');assert(!watch.nodes.get('watch-search').hidden);assert.equal(watch.nodes.get('watch-query-label').textContent,'Chinese, pinyin, or English');assert.deepEqual(watch.errors,[])});
const result={checks:checks.length,failed:failures.length,failures,method:'Node VM routing and DOM/Storage fixtures plus generated metadata checks',browserTested:false,watchDeviceTested:false};
fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});fs.writeFileSync(path.join(__dirname,'results/watch-auto-route.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;

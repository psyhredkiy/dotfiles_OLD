'use strict';Registry.require(["promise","helper","cloud","tools"],()=>{const m=Registry.log,c=Registry.get("promise"),B=Registry.get("helper"),C=Registry.get("cloud"),D=Registry.get("tools");let e=0;const k={ePASTEBIN:1,eCHROMESYNC:2,eSYNCFS:3,eGDRIVE:4,eDROPBOX:5,eWEBDAV:6,eYANDEX:7,eONEDRIVE:8};let v=[],r=!1;const f=(()=>{var b=b=>{const f=b.type,y=b.id;let h;const k=(a,g)=>{if(g==e){var z=a.name;g=/.user.js$/;m.log("si: cloud file changed",z,a);(z.match(/.meta.json$/)||z.match(g))&&v.forEach(a=>
{a(z)})}};let n={},t;return{init:function(a){h=C[f](B.assign(a,{path:"sync"}));return c.Pledge().then(()=>{if(!h.credentials&&!a.basic_auth)return h.list()}).then(()=>{t||(t=h.changes.listen(),t.progress(a=>{k(a,y)}));return!0})},list:a=>h.list(a).then(a=>{n={};const g={},b={};let w,x;const l=Date.now();a.forEach(d=>{n[d.name]=d;var a=/.meta.json$/;const c=/.user.js$/;if(d.modified>l)m.log("si: ignore future list item",l,d);else if((w=d.name.match(a))||(x=d.name.match(c)))w?(d.uuid=a=d.name.replace(a,
""),d.lastModified=d.modified,d.precision=d.precision,g[a]=d):x&&(a=d.name.replace(c,""),b[a]=d)});return Object.keys(g).map(d=>{let a;if(a=g[d])return a.source=b[d],a.options=a.options||{},a}).filter(d=>d)}),setSource:(a,g)=>{const b=a+".user.js",p=n[b];let w;return c.Pledge(!1).then(()=>{if(p&&h.compare)return h.compare(p,g)}).then(a=>{if(a)return m.log("si: remote source data matches, skip upload of",b),c.Pledge();w=new Blob([g],{type:"text/plain"});return h.put(p||b,w)})},getSource:(a,g)=>{const b=
a+".user.js",p=n[b];if(p)return c.Pledge(!1).then(()=>{if(g&&h.compare)return h.compare(p,g)}).then(a=>a?(m.log("si: remote source data matches, skip download of",b),c.Pledge(g)):h.get(p).then(D.readAsText));m.warn("si: list cache does not contain this UUID",a);return c.Breach()},getMeta:a=>{let b;return(b=n[a+".meta.json"])?h.get(b).then(D.readAsText).then(g=>{let c;{let a=null;try{a=JSON.parse(g)}catch(x){}a&&a.uuid?g=a:(m.log("si: unable to parse extended info of undefined"),g=null)}if((c=g)&&
(c.uuid=a))return c.lastModified=b.modified||c.lastModified,c.precision=b.precision,c.options=c.options||{},c}):c.Breach()},setMeta:(a,b)=>{const c=new Blob([JSON.stringify(a)],{type:"text/plain"});a=a.uuid+".meta.json";return h.put(n[a]||a,c,b)},remove:a=>{a.options.removed=!0;const b=new Blob([JSON.stringify(a)],{type:"text/plain"});return h.put(a.uuid+".meta.json",b).then(()=>{let b;if(b=n[a.uuid+".user.js"])return h.delete(b)})},reset:()=>h.list(!0).then(a=>a=a.filter(a=>{const b=/.user.js$/;
return a.name.match(/.meta.json$/)||a.name.match(b)})).then(a=>{const b=[];a.forEach(a=>{b.push((()=>{const b=c();h.delete(a).always(()=>{b.resolve()});return b.promise()})())});return c.when(b).always(()=>{n={}})}),getRemoteUrl:function(a){if(h.getRemoteUrl)return h.getRemoteUrl(a.uuid+".user.js")},getRemoteDomains:function(){if(h.getRemoteDomains)return h.getRemoteDomains()}}};const f=b({type:"drive",id:k.eGDRIVE}),y=b({type:"dropbox",id:k.eDROPBOX}),A=b({type:"onedrive",id:k.eONEDRIVE}),u=b({type:"webdav",
id:k.eWEBDAV});b=b({type:"yandex",id:k.eYANDEX});const r=(()=>{let b=!1,f;const y=(a,b)=>{e==k.eCHROMESYNC&&"sync"==b&&c.Pledge().then(()=>{const l=new RegExp(f+"$");a&&Object.keys(a).forEach(d=>{const c=a[d];m.log('si: storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".',d,b,c.oldValue,c.newValue);if(-1!=d.search(l))for(let a=0;a<v.length;a++)if(!g[d]){const b=n(c.newValue,d);if(b)v[a](d,b)}})})},h=a=>{const b=c();let l=[];a?t().done(d=>{l=B.select(d,b=>b.item&&b.item.uuis==
a);b.resolve(l)}).fail(a=>{b.reject(a)}):b.resolve(l);return b.promise()};var t=()=>E(()=>{const a=c(),b=new RegExp(f+"$");rea.storage.sync.get(null,c=>{const d=[];c&&Object.keys(c).forEach(a=>{-1!=a.search(b)&&d.push({key:a,item:n(c[a],a)})});a.resolve(d)});return a.promise()}),n=(a,b)=>{let c=null;try{c=JSON.parse(a)}catch(d){}return c&&(c.url||c.options)?c:(m.log("si: unable to parse extended info of "+b),null)};const A=a=>a.then(a=>{const b={};a=B.select(a,(a,c)=>{if(!b[a.key])return b[a.key]=
!0});if(1<a.length){const b=c(),l=[],g=a.pop();a.forEach(a=>{l.push(u(a.key))});c.when(l).done(()=>{b.resolve(g)});return b.promise()}return c.Pledge(a[0])});let a=null;var g={},u=(a,b)=>{const l=c();rea.storage.sync.remove(a,a=>{(a=rea.runtime.lastError)?l.reject(a):l.resolve()});return l.promise()},p=a=>{const b=c();rea.storage.sync.set(g,a=>{(a=rea.runtime.lastError)?b.reject(a):(g={},b.resolve())});return b.promise()};return{init:function(){let a=!0;if(!b)try{rea.storage.onChanged.addListener(y),
b=!0}catch(x){m.warn("si: error registering sync callback: "+x.message),a=!1}f="@v2";return c.Pledge(a)},list:()=>c.Pledge().then(()=>t()).then(a=>{const b=new RegExp(f+"$"),l=[];a.forEach(a=>{var c=a.key,d=a.item;a=c.replace(b,"");if(c=g[c]?n(g[c],c):d){d=c.options||{};var f=!!d.removed;l.push({id:a,uuid:f?a:c.uuid,lastModified:f?d.removed:c.lastModified,url:c.url,options:d})}});return c.Pledge(l)}),setMeta:(b,e)=>{const l=c();A(h(b.uuid)).done(c=>{let d;c?(d=c.key,c=c.item):(d=b.uuid+f,c={});c.url=
b.url;c.options=b.options||{};c.uuid=b.uuid;e.lastModified&&(c.lastModified=e.lastModified);g[d]=JSON.stringify(c);a&&window.clearTimeout(a);a=window.setTimeout(p,3E3);l.resolve()});return l.promise()},remove:b=>{const e=c();A(h(b.uuid)).done(c=>{let d;c?(d=c.key,c=c.item):(d=b.uuid+f,c={});c.options=c.options||{};c.options.removed=!0;g[d]=JSON.stringify(c);a&&window.clearTimeout(a);a=window.setTimeout(p,3E3);e.resolve()});return e.promise()},reset:()=>E(()=>{const a=c();rea.storage.sync.clear(()=>
{g={};a.resolve()});return a.promise()})}})(),q={};rea.storage.sync.supported&&(q[k.eCHROMESYNC]=r);q[k.eGDRIVE]=f;q[k.eDROPBOX]=y;q[k.eONEDRIVE]=A;q[k.eWEBDAV]=u;q[k.eYANDEX]=b;return q})();var E=(b,f)=>{const e=c();void 0===f&&(f=3);const k=()=>{if(r)window.setTimeout(k,500);else{r=!0;try{b().always(()=>{r=!1}).done(function(){e.resolve.apply(this,arguments)}).fail(()=>{0<--f?(m.log("si: some retries left, wait for",6E4,"ms"),window.setTimeout(k,6E4)):(m.warn("si: no retries left, skipping this sync request!"),
e.reject("no retries left"))})}catch(u){m.warn(u),r=!1,e.reject(u)}}};k();return e.promise()};const F={init:(b,k)=>{v=[];e=b;return f[e]?f[e].init(k).done(b=>{}):c.Breach()},debug:function(b){},addChangeListener:function(b){v.push(b)},getRemoteUrl:function(b){if(f[e]&&f[e].getRemoteUrl)return f[e].getRemoteUrl(b)},getRemoteDomains:function(){if(f[e]&&f[e].getRemoteDomains)return f[e].getRemoteDomains()},caps:(()=>{const b={};Object.defineProperties(b,{specialMeta:{get:function(){return f[e]&&!!f[e].getMeta},
enumerable:!0},syncsSource:{get:function(){return f[e]&&!!f[e].getSource},enumerable:!0}});return b})(),types:k};"list setMeta getMeta setSource getSource reset remove".split(" ").forEach(b=>{F[b]=function(){return f[e]&&f[e][b]?f[e][b].apply(this,arguments):c.Pledge()}});Registry.register("syncinfo","289e8b91",b=>{C.init(f=>{let e=c();const k=b.openAndWatch({url:f.url},b=>{b?e&&e.notify(b):e&&(e.resolve("tab closed"),e=null)});return{promise:e.promise(),close:function(){k.cancel()}}});return F})});

const googleLoadEvent=new Event("googleLoad");function loadGoogle(){gapi.load("auth2",function(){gapi.auth2.init(),window.dispatchEvent(googleLoadEvent)})}(()=>{const e=e=>document.querySelector(e),t=e("meta[name=dynamicUrl]").getAttribute("content"),n=e=>document.createElement(e),o=e=>{e=new Date(e);const t=new Date,n=Math.ceil((e.getTime()-t.getTime())/864e5);let o="";return{integer:n,text:o=0===n?"today":1===n?"tomorrow":-1===n?"yesterday":Math.abs(n)<365?e.toLocaleString("default",{month:"short",day:"numeric"}):e.toLocaleString("default",{month:"short",day:"numeric",year:"2-digit"})}};function s(e){return this.request=new XMLHttpRequest,this.url=e,this}HTMLElement.prototype.c=function(e){this.addEventListener("click",e)},HTMLElement.prototype.hasParent=function(e){if(this.parentElement)return this.parentElement===e||this.parentElement.hasParent(e)},s.prototype.post=function(e){return this.request.open("POST",this.url,!0),"string"==typeof e&&this.request.setRequestHeader("Content-type","application/x-www-form-urlencoded"),this.request.send(e),this},s.prototype.get=function(){return this.request.open("GET",this.url,!0),this.request.send(),this},s.prototype.then=function(e){this.request.onloadend=function(){e.apply(this,[this.response,this.status])}};const a={shown:1,element:e("#loadingCover"),show:()=>{a.shown++,a.element.style.opacity=1,a.element.style.display="flex"},hide:()=>{--a.shown||(window.setTimeout(()=>void(a.element.style.display="none"),500),a.element.style.opacity=0)}},r=()=>{a.show();let n=0;const o=()=>{++n<2||(a.hide(),e("#logoutNotice").style.display="flex")},r=()=>{const e=gapi.auth2.getAuthInstance();e.isSignedIn.Ab?e.signOut().then(o):o()};new s(t+"/logout.php").get().then((e,t)=>{200===t?o():(document.cookie="heyo=null; expires=Thu, 01 Jan 1970 00:00:00 UTC",o())}),window.gapi&&gapi.auth2?r():window.addEventListener("googleLoad",r)},i=new Event("jobsLoad"),l=e("#jobList form"),p=e("#existingJobs"),d=e=>{const t=document.querySelectorAll("select[name=jobId]");for(const o of t){const t=n("option");t.value=e.jobId,t.textContent=e.title,o.append(t)}const o=n("input"),s=n("label"),a=n("input"),r=n("label"),i=n("input");o.setAttribute("hidden","hidden"),o.value=e.jobId,o.name="jobId[]",s.innerHTML="<span>title: </span>",a.value=e.title,a.name="title[]",s.append(a),r.innerHTML="<span>hourly rate:</span>",i.setAttribute("type","number"),i.value=e.hourlyRate,i.name="hourlyRate[]",r.append(i),p.append(o),p.append(s),p.append(r)},c=e=>{(()=>{const e=document.querySelectorAll("select[name=jobId]");for(const t of e){const e=t.querySelectorAll("option[value]");for(let n of e)t.removeChild(n)}p.innerHTML=""})();for(const t of e)d(t)};e("#editJobs").c(e=>{e.preventDefault(),l.parentElement.style.display="flex"}),(()=>(a.show(),new Promise(e=>{new s(t+"/getJobs.php").get().then((t,n)=>{if(a.hide(),401===n)return r();i.data=JSON.parse(t),window.dispatchEvent(i),e(JSON.parse(t))})})))().then(c),l.addEventListener("submit",e=>{e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),l.parentElement.style.display="none",(()=>(a.show(),window.dispatchEvent(i),l.parentElement.style.display="",new Promise(e=>{new s(t+"/editJobs.php").post(new FormData(l)).then((t,n)=>{if(a.hide(),401===n)return r();i.data=JSON.parse(t),window.dispatchEvent(i),e(JSON.parse(t))})})))().then(c)}),l.querySelector("#jobPopupClose").c(()=>{l.parentElement.style.display="none"}),e("#logoutLink").c(e=>(r(),e.preventDefault(),!1)),(()=>{const i=e("#items"),l=e("#checklistMenu");let p=[];const d=e=>{const t=n("li"),s=n("p"),a=n("span"),r=n("span"),d=n("p"),c=n("span"),u=n("span"),m=n("p");if(a.textContent=e.title,a.style.color=w(e.priority),r.textContent=p[e.priority],s.append(a),s.append(r),t.append(s),m.textContent=e.description,t.append(m),e.due){const t=o(e.due);c.textContent=t.text,t.integer<0?c.classList.add("red"):t.integer?c.classList.add("green"):c.classList.add("orange")}u.textContent=e.job,d.append(c),d.append(u),t.append(d),t.data=e,t.classList.add("status"+e.status),t.c(function(e){l.style.top=e.clientY+window.scrollY+"px",l.style.left=e.clientX+"px",l.classList.add("show"),l.targetItem=this.data}),i.append(t)},c=e=>{for(const t of e)d(t)},u=()=>void(i.innerHTML=""),m=e=>{let t=0;if(e.due){const n=o(e.due).integer;n<0?t+=100-n:n<1?t+=50-n:t-=n}1===e.status&&(t+=20),2===e.status&&(t-=100),t+=16*e.priority,e.dynamicPriority=t},h=e=>{e=e.filter(e=>e.status<3);for(const t of e)m(t);return e.sort((e,t)=>t.dynamicPriority-e.dynamicPriority),e},w=e=>"#"+Math.floor(150*(e+1)/9).toString(16).padStart(2,"0")+Math.floor(150*(9-e)/9).toString(16).padStart(2,"0")+"00",y=(e,t)=>{let n=t.filter(t=>t.itemId!==e.itemId);return n.push(e),n},g=t=>{const n=document.querySelectorAll("#newItem form input, #newItem form select"),o=e("#newItem form");o.reset();for(const e of n){const n=t[e.getAttribute("name")];n&&(e.value=n)}o.parentElement.style.display="flex",e("#newItem h1").textContent="edit item"};let f=document.querySelectorAll("select[name=priority] option");for(let e=0;e<f.length;e++)p.push(f[e].textContent),f[e].style.color=w(e);let I=[];(()=>(a.show(),new Promise(e=>{new s(t+"/getIncompleteItems.php").get().then((t,n)=>{if(a.hide(),401===n)return r();e(JSON.parse(t))})})))().then(e=>{I=h(e),c(I)}),e("#addItem").c(()=>{e("#newItem [name=itemId]").value="",e("#newItem form").reset(),e("#newItem").style.display="flex",e("#newItem h1").textContent="new item"}),e("#newItem form").addEventListener("submit",function(e){e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),this.parentElement.style.display="none",a.show();const n=new URLSearchParams(new FormData(this)).toString();return new s(t+"/editItem.php").post(n).then((e,t)=>{if(a.hide(),401===t)return r();e=JSON.parse(e);for(const t of e)I=y(t,I);u(),I=h(I),c(I)}),!1}),e("#newItem form").addEventListener("reset",function(){this.parentElement.style.display="none"}),document.body.c(e=>{e.target.hasParent(i)||l.classList.remove("show")});for(const e of l.querySelectorAll("li"))"edit"!==e.getAttribute("name")?e.c(function(){a.show(),new s(t+"/editItem.php").post("itemId="+l.targetItem.itemId+"&status="+this.value).then((e,t)=>{if(a.hide(),401===t)return r();e=JSON.parse(e);for(const t of e)I=y(t,I);u(),I=h(I),c(I),l.classList.remove("show")})}):e.c(()=>{g(l.targetItem),l.classList.remove("show")})})(),(()=>{const i=[],l=e("#countdown"),p=e("#toggleStopwatch"),d=e("#newEntry form"),c=()=>{const e=i[C];if(!e)return;const t=u(e);l.innerHTML=`<span>${t.hours.toString().padStart(2,"0").split("").join("</span><span>")}</span>:<span>${t.minutes.toString().padStart(2,"0").split("").join("</span><span>")}</span>:<span>${t.seconds.toString().padStart(2,"0").split("").join("</span><span>")}</span>`,e.running&&window.requestAnimationFrame(c)},u=e=>{let t=0;for(let n=0;n<e.started.length;n++)t+=(e.paused[n]&&e.paused[n].getTime()||(new Date).getTime())-e.started[n].getTime();return m(t)},m=e=>{const t=e,n=(e=Math.floor(e/1e3))%60,o=(e=Math.floor(e/60))%60;return{length:t,hours:e=Math.floor(e/60),minutes:o,seconds:n}},h=()=>{if(!i[C])return l.innerHTML="<span>0</span><span>0</span>:<span>0</span><span>0</span>:<span>0</span><span>0</span>",p.innerHTML='<i class="fas fa-play"></i>',void(e("#logEntry").style.display="none");e("#logEntry").style.display="",i[C].running?p.innerHTML='<i class="fas fa-pause"></i>':p.innerHTML='<i class="fas fa-play"></i>'},w=()=>{window.localStorage.removeItem("timer."+C),document.title="Todo Plus",i[C]=!1,h()},y=e=>(a.show(),new Promise(n=>{a.hide(),new s(t+"/getEntries.php?jobId="+e).get().then((e,t)=>{if(401===t)return r();200===t&&n(JSON.parse(e))})})),g=e=>{P=e.concat(P);for(const t of e)f(t)},f=t=>{const s=n("li"),a=n("p"),r=n("span"),i=n("span"),l=n("p"),p=n("span"),d=n("span");r.textContent=o(t.clockedIn).text;const c=m(t.length);i.textContent=c.hours+":"+c.minutes.toString().padStart(2,"0"),a.append(r),a.append(i),s.append(a),p.textContent=t.description,d.textContent="$"+(15*(c.hours+c.minutes/60)).toFixed(2),l.append(p),l.append(d),s.append(l),s.c(()=>void x(t)),e("#entries").prepend(s)},I=e=>{if(!window.localStorage.getItem("timer."+e))return void h();const t=window.localStorage.getItem("timer."+e).split("_");i[e]={started:[],paused:[],running:1},i[e].started.push(new Date(parseInt(t[0]))),3===t.length&&(i[e].paused.push(new Date(parseInt(t[2]))),i[e].running=0),e===C&&(h(),window.requestAnimationFrame(c))},S=()=>{e("#entries").innerHTML=""},v=()=>{if(i[C]){const e=u(i[C]);document.title="TodoPl.us ("+e.hours.toString().padStart(2,"0")+":"+e.minutes.toString().padStart(2,"0")+":"+e.seconds.toString().padStart(2,"0")+")"}else document.title="TodoPl.us"},E=(e,t)=>((t=t.filter(t=>t.entryId!==e.entryId)).push(e),L(t)),L=e=>(e.sort((e,t)=>new Date(e.clockedIn)-new Date(t.clockedIn)),e);let b=0;window.addEventListener("blur",()=>{i[C]&&(b=window.setInterval(v,1e3),v())}),window.addEventListener("focus",()=>{window.clearInterval(b),document.title="TodoPl.us"});const x=t=>{const n=d.querySelectorAll("input, select");d.reset();for(const e of n){let n=t[e.getAttribute("name")];n&&("date"===e.type&&(n=new Date(n).toLocaleDateString("en-CA")),"length"===e.name&&(n/=6e4),e.value=n)}d.parentElement.style.display="flex",e("#newEntry h1").textContent="edit entry"},T=t=>{let n=t.findIndex(e=>e.jobId===C),o=e("#lastJob"),s=e("#nextJob");n<0&&(n=0),o.style.opacity=s.style.opacity=1,n?n===t.length-1&&(s.style.opacity=0):o.style.opacity=0,e("#jobTitle").textContent=t[n].title,o.onclick=(()=>q(t,n-1)),s.onclick=(()=>q(t,n+1))},q=(e,t)=>{i[C]&&i[C].running?C=e[t].jobId:(C=e[t].jobId,c()),T(e),S(),y(C).then(g),localStorage.setItem("currentJob",C),i[C]||I(C),h()};let C=window.localStorage.getItem("currentJob")||"none";window.addEventListener("jobsLoad",e=>{e.data.splice(0,0,{jobId:"none",title:"(none)",hourlyRate:0}),T(e.data)}),I(C),p.c(()=>(i[C]||(i[C]={started:[],paused:[],running:0}),i[C].running=!i[C].running,i[C].running?(i[C].started.push(new Date),window.localStorage.setItem("timer."+C,(new Date).getTime()-u(i[C]).length),window.requestAnimationFrame(c)):(i[C].paused.push(new Date),window.localStorage.setItem("timer."+C,(new Date).getTime()-u(i[C]).length+"_paused_"+(new Date).getTime())),h(),i[C].running)),e("#logEntry").c(()=>{a.show();const n=e("#entryNote").textContent;new s(t+"/editEntry.php").post("clockedIn="+i[C].started[0].toGMTString()+"&jobId="+C+"&length="+u(i[C]).length+"&description="+n).then((t,n)=>{if(a.hide(),401===n)return r();200===n&&(e("#entryNote").textContent="",w(),g(JSON.parse(t)))})}),e("#clearStopwatch").c(w);let P=[];y(C).then(e=>{g(e)}),e("#addEntry").c(()=>{e("#newEntry h1").textContent="new entry",d.reset(),d.querySelector("[name=jobId]").value=C,d.querySelector("[name=clockedIn]").value=(new Date).toLocaleDateString("en-CA"),d.parentElement.style.display="flex"}),d.addEventListener("reset",()=>{d.parentElement.style.display=""}),d.addEventListener("submit",e=>{e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),d.parentElement.style.display="none";const n=d.querySelector("[name=length]");n.value=60*n.value*1e3,a.show();const o=new URLSearchParams(new FormData(d)).toString();return new s(t+"/editEntry.php").post(o).then((e,t)=>{if(a.hide(),401===t)return r();e=JSON.parse(e);for(const t of e)P=E(t,P);S(),g(P)}),!1}),e("#archiveButton").c(()=>{d.parentElement.style.display="",((e,n)=>(a.show(),new Promise(o=>{e?new s(t+"/editEntry.php").post("entryId="+e+"&archived=1").then((t,s)=>{if(a.hide(),401===s)return r();o(n.filter(t=>t.entryId!==e))}):o(n)})))(d.querySelector("[name=entryId]").value,P).then(e=>{P=e,S(),g(P)})})})(),a.hide(),window.loader=a})();
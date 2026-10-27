const SCRIPT_URL="https://script.google.com/macros/s/AKfycbyDixAE2WoKJFFcDj_b6JYcUeacqTZgLBB_41U4gBjrk1hw0EYkZ0qx3Jc-2F_j3mLJqg/exec";
let curField="",curUser="Admin",curMoveType="INCOMING",moveRows=[{date:"",whom:"",office:""}];

function go(id,btn){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');if(btn){document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');}window.scrollTo(0,0);if(id=='home'||id=='incoming')loadAll();}
function hideModals(){document.querySelectorAll('.modal').forEach(m=>m.style.display='none');}
function api(a,p=""){if(SCRIPT_URL.includes("YOUR_ID")){alert("ERROR: Set your Apps Script URL in script.js line 1");return Promise.reject();}return fetch(`${SCRIPT_URL}?action=${a}&${p}`).then(r=>r.json());}
function esc(s){return String(s||"").replace(/&/g,"&amp;");}
function loadAll(){api("stats").then(j=>{document.getElementById('sMail').innerText=j.mails;document.getElementById('sFile').innerText=j.files;document.getElementById('sMove').innerText=j.moves;document.getElementById('sDeep').innerText=j.deep;});loadMails(true);loadFiles(true);}

// INCOMING MAIL
function saveMail(){
  let ref=document.getElementById('mRef').value.trim(),name=document.getElementById('mName').value.trim(),ag=document.getElementById('mAgency').value.trim(),d=document.getElementById('mDate').value,t=document.getElementById('mTime').value;
  if(!ref||!name||!ag) return alert("Fill Reference, Mail Name, Agency");
  api("addMail",`refNo=${encodeURIComponent(ref)}&mailName=${encodeURIComponent(name)}&agency=${encodeURIComponent(ag)}&date=${d}&time=${t}`).then(()=>{alert("SUCCESSFUL! Mail Saved");['mRef','mName','mAgency','mDate','mTime'].forEach(id=>document.getElementById(id).value='');loadMails();});
}
function loadMails(home=false){
  let q=home?"":document.getElementById('mailSearch').value;
  api("getMails",`q=${encodeURIComponent(q)}`).then(j=>{
    let h=`<table><tr><th>REF NO</th><th>MAIL NAME</th><th>AGENCY</th><th>DATE / TIME</th></tr>`;j.data.forEach(x=>h+=`<tr><td><b>${esc(x[0])}</b></td><td>${esc(x[1])}</td><td>${esc(x[2])}</td><td>${esc(x[3])} ${esc(x[4])}</td></tr>`);h+=`</table>`;if(j.data.length==0)h="No mails found";
    if(home)document.getElementById('homeMails').innerHTML=h;else document.getElementById('mailList').innerHTML=h;
  });
}

// FIELD LOGIN - CREAT FILE / FILE MOVEMENT
function openFieldLogin(field){curField=field;document.getElementById('loginTitle').innerText=field=="CREAT_FILE"?"CREAT FILE - Login":"FILE MOVEMENT - Login";document.getElementById('loginSub').innerText="Enter your name + password. Default Admin password: admin123. Officer password is issued by ADMIN.";document.getElementById('loginModal').style.display='flex';}
function doFieldLogin(){
  let name=document.getElementById('loginName').value.trim(),pass=document.getElementById('loginPass').value.trim();
  if(!name||!pass) return alert("Enter Name and Password");
  api("checkFieldLogin",`field=${curField}&name=${encodeURIComponent(name)}&pass=${encodeURIComponent(pass)}`).then(j=>{
    if(!j.valid) return alert("Invalid Password - Contact ADMIN");
    curUser=j.name;document.getElementById('topUser').innerText="Welcome, "+curUser;hideModals();
    if(curField=="CREAT_FILE"){document.getElementById('welcomeCreate').innerText="Welcome, "+curUser;go('createFile',document.querySelectorAll('nav button')[2]);loadFiles();}
    else{document.getElementById('welcomeMove').innerText="Welcome, "+curUser;go('movement',document.querySelectorAll('nav button')[3]);showMoveTab('INCOMING');}
  });
}
function logoutField(){curUser="Guest";document.getElementById('topUser').innerText="Guest";go('home',document.querySelectorAll('nav button')[0]);}

// CREAT FILE
function saveFile(){
  let no=document.getElementById('fNo').value.trim(),fn=document.getElementById('fName').value.trim(),mr=document.getElementById('fMailRef').value.trim(),mn=document.getElementById('fMailName').value.trim(),d=document.getElementById('fDate').value,off=document.getElementById('fOfficer').value.trim();
  if(!no||!fn||!mr) return alert("Fill File Number, File Name, Mail Ref");
  api("addFile",`fileNo=${encodeURIComponent(no)}&fileName=${encodeURIComponent(fn)}&mailRef=${encodeURIComponent(mr)}&mailName=${encodeURIComponent(mn)}&dateCreated=${d}&officer=${encodeURIComponent(off)}`).then(()=>{alert("SUCCESSFUL! File Created");['fNo','fName','fMailRef','fMailName','fDate','fOfficer'].forEach(id=>document.getElementById(id).value='');loadFiles();});
}
function loadFiles(home=false){
  api("getFiles").then(j=>{
    let h="";j.data.forEach(x=>h+=`<div class="fileItem" onclick="viewFile('${esc(x[0])}')"><b>${esc(x[0])}</b> - ${esc(x[1])}<br><small>Mail: ${esc(x[2])} | ${esc(x[3])} | Officer: ${esc(x[5])} | ${esc(x[4])}</small><br><span style="color:#2563eb;font-size:12px">Click to view all mails on this file →</span></div>`);
    if(j.data.length==0)h="No files yet";
    if(home)document.getElementById('homeFiles').innerHTML=h;else document.getElementById('fileList').innerHTML=h;
  });
}
function viewFile(no){api("getFileMails",`fileNo=${encodeURIComponent(no)}`).then(j=>{let h=`<div style="background:#fffbeb;padding:12px;border-radius:10px;margin-top:10px"><h4>All Mails on File: ${esc(no)}</h4><table><tr><th>Mail Ref</th><th>Mail Name</th><th>Date</th><th>Officer</th></tr>`;j.data.forEach(x=>h+=`<tr><td>${esc(x[2])}</td><td>${esc(x[3])}</td><td>${esc(x[4])}</td><td>${esc(x[5])}</td></tr>`);h+=`</table></div>`;document.getElementById('fileDetail').innerHTML=h;});}

// FILE MOVEMENT
function showMoveTab(t){
  curMoveType=t;moveRows=[{date:"",whom:"",office:""}];
  if(t=="DEEP"){document.getElementById('moveBox').innerHTML=`<div class="card"><h3>DEEP FILES</h3><input id="dNo" placeholder="FILE NUMBER *"><input id="dName" placeholder="FILE NAME *"><label>Date</label><input id="dDate" type="date"><button class="btn-gold full" onclick="saveDeep()">SAVE DEEP FILE</button></div>`;}
  else{
    let label=t=="INCOMING"?"WHOM FROM":"WHOM TO";
    document.getElementById('moveBox').innerHTML=`<div class="card"><h3>${t} FILE</h3><input id="mvNo" placeholder="FILE NUMBER *"><input id="mvName" placeholder="FILE NAME *"><div id="moveRows"></div><button class="btn-light" onclick="addMoveRow()">+ ADD MOVEMENT</button> <button class="btn-light" onclick="delMoveRow()">- Delete MOVEMENT</button><button class="btn-gold full" onclick="saveMovement('${t}')">SAVE MOVEMENT</button><p style="font-size:11px;color:#64748b;margin-top:6px">You can add many movements at once - each row is one movement.</p></div>`;
    renderMoveRows(label);
  }
  loadMoveList(t);
}
function renderMoveRows(label){let h="";moveRows.forEach((r,i)=>{h+=`<div style="border:1px solid #eef2ff;padding:10px;border-radius:10px;margin:6px 0"><b>Movement ${i+1}</b><label>Date</label><input type="date" class="mrDate" value="${r.date}"><input class="mrWhom" placeholder="${label} *" value="${r.whom}"><input class="mrOffice" placeholder="OFFICE *" value="${r.office}"></div>`;});document.getElementById('moveRows').innerHTML=h;}
function addMoveRow(){let ds=document.querySelectorAll('.mrDate'),ws=document.querySelectorAll('.mrWhom'),os=document.querySelectorAll('.mrOffice');moveRows=[];ds.forEach((d,i)=>moveRows.push({date:d.value,whom:ws[i].value,office:os[i].value}));moveRows.push({date:"",whom:"",office:""});renderMoveRows(curMoveType=="INCOMING"?"WHOM FROM":"WHOM TO");}
function delMoveRow(){if(moveRows.length>1)moveRows.pop();renderMoveRows(curMoveType=="INCOMING"?"WHOM FROM":"WHOM TO");}
function saveMovement(type){
  let no=document.getElementById('mvNo').value.trim(),fn=document.getElementById('mvName').value.trim();
  if(!no||!fn) return alert("Fill File Number and File Name");
  let ds=document.querySelectorAll('.mrDate'),ws=document.querySelectorAll('.mrWhom'),os=document.querySelectorAll('.mrOffice');
  let promises=[];
  ds.forEach((d,i)=>{if(!ws[i].value) return;promises.push(api("addMovement",`type=${type}&fileNo=${encodeURIComponent(no)}&fileName=${encodeURIComponent(fn)}&date=${d.value}&whom=${encodeURIComponent(ws[i].value)}&office=${encodeURIComponent(os[i].value)}`));});
  Promise.all(promises).then(()=>{alert("SUCCESSFUL! Movement Saved");loadMoveList(type);loadAll();});
}
function saveDeep(){let no=document.getElementById('dNo').value.trim(),fn=document.getElementById('dName').value.trim(),d=document.getElementById('dDate').value;if(!no||!fn) return alert("Fill File Number and File Name");api("addDeep",`fileNo=${encodeURIComponent(no)}&fileName=${encodeURIComponent(fn)}&date=${d}`).then(()=>{alert("SUCCESSFUL! Deep File Saved");loadMoveList('DEEP');});}
function loadMoveList(t){
  if(t=="DEEP"){api("getDeep").then(j=>{let h=`<table><tr><th>FILE NO</th><th>FILE NAME</th><th>DATE</th></tr>`;j.data.forEach(x=>h+=`<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td><td>${esc(x[2])}</td></tr>`);h+=`</table>`;document.getElementById('moveList').innerHTML=j.data.length?h:"No deep files yet";});}
  else{api("getMovements",`type=${t}`).then(j=>{let h=`<table><tr><th>FILE NO</th><th>FILE NAME</th><th>DATE</th><th>${t=="INCOMING"?"WHOM FROM":"WHOM TO"}</th><th>OFFICE</th></tr>`;j.data.forEach(x=>h+=`<tr><td>${esc(x[1])}</td><td>${esc(x[2])}</td><td>${esc(x[3])}</td><td>${esc(x[4])}</td><td>${esc(x[5])}</td></tr>`);h+=`</table>`;document.getElementById('moveList').innerHTML=j.data.length?h:"No movements yet";});}
}

// SEARCH - READ ONLY
function doSearch(){
  let no=document.getElementById('sFileNo').value.trim(),type=document.getElementById('sFilter').value;
  if(!no) return alert("Enter FILE NUMBER");
  api("search",`fileNo=${encodeURIComponent(no)}&type=${encodeURIComponent(type)}`).then(j=>{
    if(j.data.length==0) return document.getElementById('searchResult').innerHTML=`<p style="margin-top:10px">No record found for ${esc(no)} - ${esc(type)}</p>`;
    let h=`<div style="background:#f0fdf4;padding:10px;border-radius:10px;margin-top:10px"><b>Result for ${esc(no)} - ${esc(type)} (Read Only - Cannot Edit)</b><table>`;
    if(type=="Deep Files"){h+=`<tr><th>FILE NO</th><th>FILE NAME</th><th>DATE</th></tr>`;j.data.forEach(x=>h+=`<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td><td>${esc(x[2])}</td></tr>`);}
    else{h+=`<tr><th>FILE NO</th><th>FILE NAME</th><th>DATE</th><th>${type=="Incoming File"?"WHOM FROM":"WHOM TO"}</th><th>OFFICE</th></tr>`;j.data.forEach(x=>h+=`<tr><td>${esc(x[1])}</td><td>${esc(x[2])}</td><td>${esc(x[3])}</td><td>${esc(x[4])}</td><td>${esc(x[5])}</td></tr>`);}
    h+=`</table><p style="font-size:11px;color:#16a34a;margin-top:6px">This is history as entered in FILE MOVEMENT. Read Only.</p></div>`;
    document.getElementById('searchResult').innerHTML=h;
  });
}

// ADMIN
function openAdminLogin(){document.getElementById('adminModal').style.display='flex';}
function doAdminLogin(){
  let name=document.getElementById('adminName').value.trim(),pass=document.getElementById('adminPass').value.trim();
  if(!name||!pass) return alert("Enter Name and Password");
  api("checkAdmin",`pass=${encodeURIComponent(pass)}`).then(j=>{if(!j.valid) return alert("Wrong Admin Password");curUser=name;document.getElementById('topUser').innerText="Welcome, "+curUser;document.getElementById('welcomeAdmin').innerText="Welcome, "+curUser;hideModals();go('adminPage',document.querySelectorAll('nav button')[5]);showAdminTab('ISSUE');});
}
function showAdminTab(t){
  if(t=="ISSUE")document.getElementById('adminBox').innerHTML=`<div class="card"><h3>ISSUE ACCESS</h3><input id="oName" placeholder="Officer Name *"><input id="oNis" placeholder="NIS Number *"><select id="oField"><option value="CREAT_FILE">CREAT FILE</option><option value="FILE_MOVEMENT">FILE MOVEMENT</option></select><input id="oPass" placeholder="Create Password for Officer *"><button class="btn-gold full" onclick="issueAccess()">ACTIVATE</button><p style="font-size:11px;color:#64748b;margin-top:6px">This password is tied to the selected field only. Officer cannot use it for other field.</p></div>`;
  if(t=="SHOW")loadLogins();
  if(t=="RESET")document.getElementById('adminBox').innerHTML=`<div class="card"><h3>RESET PASSWORD - ADMIN</h3><input id="oldP" type="password" placeholder="OLD Password"><input id="newP" type="password" placeholder="NEW Password"><button class="btn-gold full" onclick="doReset()">SAVE</button></div>`;
}
function issueAccess(){
  let n=document.getElementById('oName').value.trim(),nis=document.getElementById('oNis').value.trim(),f=document.getElementById('oField').value,p=document.getElementById('oPass').value.trim();
  if(!n||!nis||!p) return alert("Fill all fields");
  api("issueAccess",`name=${encodeURIComponent(n)}&nis=${encodeURIComponent(nis)}&field=${f}&pass=${encodeURIComponent(p)}`).then(()=>{alert("SUCCESSFUL! Access Activated for "+n);showAdminTab('SHOW');});
}
function loadLogins(){api("getLogins").then(j=>{let h=`<div class="card"><h3>SHOW LOGINS - All Officers</h3><table><tr><th>OFFICER</th><th>NIS</th><th>FIELD</th><th>PASSWORD</th><th>STATUS</th><th></th></tr>`;j.data.forEach(x=>h+=`<tr><td>${esc(x.name)}</td><td>${esc(x.nis)}</td><td><span class="badge2">${esc(x.field)}</span></td><td>${esc(x.pass)}</td><td><span class="badge">${esc(x.status)}</span></td><td><button class="btn-light" style="padding:5px 8px" onclick="api('toggleLogin','nis=${esc(x.nis)}').then(()=>loadLogins())">Block / Unblock</button></td></tr>`);h+=`</table></div>`;document.getElementById('adminBox').innerHTML=h;});}
function doReset(){api("resetAdminPass",`oldPass=${encodeURIComponent(document.getElementById('oldP').value)}&newPass=${encodeURIComponent(document.getElementById('newP').value)}`).then(j=>alert(j.status=="ok"?"SUCCESSFUL! Password Changed":"Wrong Old Password"));}
if(!SCRIPT_URL.includes("YOUR_ID")) loadAll();
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
let W,H,dpr,player,enemies=[],fireballs=[],particles=[],keys={},mouse={x:0,y:0};
let hp=100,mana=100,xp=0,level=1,gameOver=false,spawnTimer=0,last=performance.now();

function resize(){dpr=devicePixelRatio||1;W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0);if(!mouse.x){mouse.x=W/2;mouse.y=H/2}}addEventListener("resize",resize);resize();
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(gameOver&&e.key.toLowerCase()==="r")reset()});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
addEventListener("mousemove",e=>{mouse.x=e.clientX;mouse.y=e.clientY});
addEventListener("mousedown",e=>{if(e.button===0)cast()});

function reset(){hp=100;mana=100;xp=0;level=1;enemies=[];fireballs=[];particles=[];gameOver=false;message("");player={x:W/2,y:H/2,r:18,speed:210};for(let i=0;i<5;i++)spawnEnemy()}
function message(t){document.getElementById("message").innerHTML=t}
function spawnEnemy(){let side=Math.floor(Math.random()*4),x,y;if(side===0){x=-30;y=Math.random()*H}else if(side===1){x=W+30;y=Math.random()*H}else if(side===2){x=Math.random()*W;y=-30}else{x=Math.random()*W;y=H+30}enemies.push({x,y,r:20,hp:70,max:70,speed:48+Math.random()*22,attack:0})}
function burst(x,y,n=12){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,s=30+Math.random()*130;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5+Math.random()*.5})}}
function cast(){if(gameOver||mana<15)return;mana-=15;let a=Math.atan2(mouse.y-player.y,mouse.x-player.x);fireballs.push({x:player.x+Math.cos(a)*25,y:player.y+Math.sin(a)*25,vx:Math.cos(a)*520,vy:Math.sin(a)*520,r:8,life:2.2})}
function update(dt){if(gameOver)return;
let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0),len=Math.hypot(dx,dy)||1;
let sp=keys.shift?player.speed*1.45:player.speed;player.x+=dx/len*sp*dt;player.y+=dy/len*sp*dt;player.x=Math.max(25,Math.min(W-25,player.x));player.y=Math.max(25,Math.min(H-25,player.y));
mana=Math.min(100,mana+12*dt);
for(let f of fireballs){f.x+=f.vx*dt;f.y+=f.vy*dt;f.life-=dt}
for(let e of enemies){let a=Math.atan2(player.y-e.y,player.x-e.x),d=Math.hypot(player.x-e.x,player.y-e.y);if(d>43){e.x+=Math.cos(a)*e.speed*dt;e.y+=Math.sin(a)*e.speed*dt}e.attack-=dt;if(d<48&&e.attack<=0){hp-=10;e.attack=1;burst(player.x,player.y,5)}}
for(let f of fireballs){for(let e of enemies){if(e.hp>0&&Math.hypot(f.x-e.x,f.y-e.y)<e.r+f.r){e.hp-=30;f.life=0;burst(f.x,f.y,15);break}}}
let dead=enemies.filter(e=>e.hp<=0);if(dead.length){for(let e of dead){xp+=25;burst(e.x,e.y,20)}enemies=enemies.filter(e=>e.hp>0);while(xp>=100){xp-=100;level++;hp=100;mana=100;message("✨ LEVEL UP!<br>Level "+level);setTimeout(()=>{if(!gameOver)message("")},1200)}}
spawnTimer-=dt;if(spawnTimer<=0&&enemies.length<9){spawnEnemy();spawnTimer=2.5}
fireballs=fireballs.filter(f=>f.life>0&&f.x>-50&&f.x<W+50&&f.y>-50&&f.y<H+50);
for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.vx*=.97;p.vy*=.97}particles=particles.filter(p=>p.life>0);
if(hp<=0){hp=0;gameOver=true;message("💀 YOU DIED<br><small>Press R to restart</small>")}
document.getElementById("hp").textContent=Math.ceil(hp);document.getElementById("mana").textContent=Math.floor(mana);document.getElementById("level").textContent=level;document.getElementById("xp").textContent=xp;document.getElementById("enemies").textContent=enemies.length;
}
function draw(){ctx.clearRect(0,0,W,H);
let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#142a22");g.addColorStop(1,"#07100b");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.strokeStyle="rgba(120,170,120,.13)";ctx.lineWidth=1;for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
for(let i=0;i<18;i++){let x=(i*137)%W,y=(i*83)%H;ctx.fillStyle="#1d3925";ctx.beginPath();ctx.arc(x,y,18,0,7);ctx.fill();ctx.fillStyle="#294a2d";ctx.beginPath();ctx.arc(x-8,y-7,11,0,7);ctx.fill()}
for(let e of enemies){ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.ellipse(e.x,e.y+18,23,8,0,0,7);ctx.fill();ctx.fillStyle="#7d2020";ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,7);ctx.fill();ctx.fillStyle="#d9b26b";ctx.beginPath();ctx.arc(e.x-7,e.y-4,3,0,7);ctx.arc(e.x+7,e.y-4,3,0,7);ctx.fill();ctx.fillStyle="#000";ctx.beginPath();ctx.arc(e.x-7,e.y-4,1.5,0,7);ctx.arc(e.x+7,e.y-4,1.5,0,7);ctx.fill();ctx.fillStyle="#222";ctx.fillRect(e.x-22,e.y-31,44,5);ctx.fillStyle="#c33";ctx.fillRect(e.x-22,e.y-31,44*Math.max(0,e.hp/e.max),5)}
for(let f of fireballs){ctx.shadowBlur=22;ctx.shadowColor="#ff5a00";ctx.fillStyle="#ff7b18";ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,7);ctx.fill();ctx.shadowBlur=0}
for(let p of particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle="#ffb52e";ctx.fillRect(p.x,p.y,4,4)}ctx.globalAlpha=1;
ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(player.x,player.y+20,22,8,0,0,7);ctx.fill();ctx.fillStyle="#263e83";ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,7);ctx.fill();ctx.fillStyle="#c6a56b";ctx.beginPath();ctx.arc(player.x,player.y-8,10,0,7);ctx.fill();ctx.fillStyle="#151b48";ctx.beginPath();ctx.moveTo(player.x-16,player.y-13);ctx.lineTo(player.x,player.y-35);ctx.lineTo(player.x+16,player.y-13);ctx.closePath();ctx.fill();
let a=Math.atan2(mouse.y-player.y,mouse.x-player.x);ctx.strokeStyle="#d8d8ff";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(player.x+Math.cos(a)*12,player.y+Math.sin(a)*12);ctx.lineTo(player.x+Math.cos(a)*34,player.y+Math.sin(a)*34);ctx.stroke();
}
function loop(t){let dt=Math.min(.033,(t-last)/1000);last=t;update(dt);draw();requestAnimationFrame(loop)}reset();requestAnimationFrame(loop);

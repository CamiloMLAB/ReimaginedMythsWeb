/*  Reimagined Myths – build 2025-06-04-c-patched-2
    · Flares más bajos
    · Cursor hiper-destello
    · Botones y títulos centrados
    · ⚠️ Ajuste: descripción del overlay baja para no superponerse al título
*/

let bgImage, logoImage, antiqueFont;
let wavSound, chapterSounds = [];
let legendImg = [];                       // 0 Hombre, 1 Llorona, 2 Madre
const mythNames = ["El Hombre Caimán","La Llorona","Madre Monte"];
const legendDesc = [
  `El Hombre Caimán is a legend from the Magdalena region ... mystical guardianship of natural spaces.`,
  `La Llorona is a widely known myth ... lifeless child in her arms.`,
  `Madre Monte is a towering woman ... nature as sacred and alive.`
];

let state="start", selectedMyth=-1, infoIdx=-1, currentChapter=-1;

/* partículas fondo */
const NP = 80;
let particles = [];

/* SUPER-destello */
let rings = [], sparks = [];

/* UI zonas */
let introBox={}, chooseBtn={}, backBtn={}, logoBtn={};
let mythCircles=[], chapterBtns=[], flares=[];

/* texto intro */
const introLines = [
  "Reimagined Myths is a trading-card set presenting abstract artistic visions of Colombian legends.",
  "Each card contains an AR trigger that unlocks extra digital content and tiered storytelling.",
  "Collect multiple cards to reveal hidden lore and experience immersive 3D narratives."
];

/*──────── preload ────────*/
function preload(){
  bgImage   = loadImage("images/background.png");
  logoImage = loadImage("images/Logo.png");
  antiqueFont = loadFont("fonts/Antiquarian.ttf");

  wavSound  = loadSound("sounds/wav1.mp3");
  for(let i=1;i<=6;i++) chapterSounds.push(loadSound(`sounds/Chapter${i}.mp3`));

  legendImg[0]=loadImage("images/Legend2.png");
  legendImg[1]=loadImage("images/Legend1.png");
  legendImg[2]=loadImage("images/Legend3.png");
}

/*──────── setup ─────────*/
function setup(){
  createCanvas(windowWidth,windowHeight);
  imageMode(CORNER); textAlign(CENTER,CENTER); noStroke();
  for(let i=0;i<NP;i++) particles.push(new Particle());
  noCursor();
  resizeUI();
}

/*──────── draw ─────────*/
function draw(){
  background(0); image(bgImage,0,0,width,height);
  particles.forEach(p=>{p.update();p.display();});
  updateCursorFX();

  if(state==="start")          drawStart();
  else if(state==="chooseMyth")   drawChoose();
  else if(state==="chooseChapter")drawChapters();
  else if(state==="info")         drawInfo();

  if(state!=="start") drawBack();
  drawLogo();
}

/*════════ SCREENS ═══════*/
function drawStart(){
  const base = min(width,height);

  /* Intro */
  textFont("Poppins"); fill(gold());
  const fs = base*0.028; textSize(fs); textLeading(fs*1.22); textAlign(CENTER,TOP);
  introLines.forEach((ln,i)=>text(ln,width/2,introBox.y+i*fs*1.35));

  /* Guía */
  fill(255,200); textSize(base*0.023);
  text("Click the glowing orbs to reveal each legend",width/2,chooseBtn.y-base*0.07);

  /* Botón “Choose the Myth” */
  const hov = inside(mouseX,mouseY,chooseBtn);
  fill(hov?color(153,51,255):color(0,170));
  rect(chooseBtn.x,chooseBtn.y,chooseBtn.w,chooseBtn.h,12);
  const chooseFS = base*0.035;
  textFont("Poppins"); textSize(chooseFS); fill(255); textAlign(CENTER,CENTER);
  text("Choose the Myth", chooseBtn.x + chooseBtn.w/2, chooseBtn.y + chooseBtn.h/2);
  cursor(hov?HAND:ARROW);

  /* Flares */
  flares.forEach(f=>{
    const pulse=f.base*(1+0.25*sin(frameCount*0.05+f.phase));
    fill(255,215,0,200); noStroke();
    ellipse(f.x,f.y,pulse,pulse);
  });
}

function drawChoose(){
  overlay(); drawLogo();
  const base=min(width,height);
  textFont("Poppins"); fill(255); textSize(base*0.04);
  text("Select a Myth",width/2,base*0.11);

  const order=[1,0,2];
  order.forEach((id,idx)=>{
    const c=mythCircles[idx];
    const over=dist(mouseX,mouseY,c.x,c.y)<c.r;
    const sc=over?1.1:1, d=c.r*2*sc;
    if(over){
      push();
      drawingContext.shadowBlur=28; drawingContext.shadowColor='rgba(255,215,0,0.9)';
      fill(0,0); ellipse(c.x,c.y,d+14); pop();
    }
    legendImg[id].mask(circleMask(d));
    image(legendImg[id],c.x-d/2,c.y-d/2,d,d);

    textFont(antiqueFont); fill(gold()); textSize(base*0.035);
    text(mythNames[id],c.x,c.y+c.r*sc+26);

    if(over) cursor(HAND);
  });
}

function drawChapters(){
  overlay(); drawLogo();
  const base=min(width,height);
  textFont(antiqueFont); fill(gold()); textSize(base*0.055);
  text(mythNames[selectedMyth],width/2,base*0.11);

  textFont("Poppins"); textAlign(CENTER,BOTTOM); fill(200); textSize(base*0.027);
  text("Tap a chapter card to hear its audio narrative",width/2,height-30);

  chapterBtns.forEach(btn=>{
    const over=inside(mouseX,mouseY,btn);
    const g=drawingContext.createLinearGradient(btn.x,btn.y,btn.x,btn.y+btn.h);
    g.addColorStop(0,over?"#9933ff":"#222"); g.addColorStop(1,over?"#5500ff":"#111");
    drawingContext.fillStyle=g; rect(btn.x,btn.y,btn.w,btn.h,8);

    const lines = btn.label.split("\n");
    const fs = base*0.026;
    textFont("Poppins"); textSize(fs); fill(255); textAlign(CENTER,TOP);
    const topY = btn.y + btn.h/2 - (lines.length*fs)/2 + fs*0.15;
    lines.forEach((ln,i)=>text(ln,btn.x+btn.w/2,topY+i*fs));

    if(over) cursor(HAND);
  });
}

function drawInfo(){
  overlay(); drawLogo();
  const base=min(width,height);
  textFont(antiqueFont); fill(gold()); textSize(base*0.055);
  text(mythNames[infoIdx],width/2,base*0.11);    // título

  /* ↓↓↓  Descripción comienza más abajo  ↓↓↓ */
  const boxW = min(width*0.9, 720);
  const descY = base * 0.22;                     // 22 % de la altura de ventana
  textFont("Poppins"); fill(255); textSize(base*0.03); textAlign(LEFT,TOP);
  text(legendDesc[infoIdx], width/2 - boxW/2, descY, boxW, height - descY - 70);

  textAlign(CENTER,BOTTOM); fill(200); textSize(base*0.026);
  text("Tap anywhere or Back to close",width/2,height-30);
}

/*════════ NAV, INPUT, FX, UTILS, RESIZE …  (SIN CAMBIOS)  */
/* …[todo el resto del archivo permanece idéntico]… */


/*════════ NAV ═══════*/
function drawBack(){
  const hov = inside(mouseX,mouseY,backBtn);
  const g = drawingContext.createLinearGradient(backBtn.x,backBtn.y,
                                                backBtn.x,backBtn.y+backBtn.h);
  g.addColorStop(0, hov?"#9933ff":"#222");
  g.addColorStop(1, hov?"#5500ff":"#111");
  drawingContext.fillStyle = g;
  rect(backBtn.x,backBtn.y,backBtn.w,backBtn.h,6);

  textFont("Poppins");
  const fs = min(width,height)*0.03;
  textSize(fs); fill(255); textAlign(CENTER,CENTER);
  text("Back", backBtn.x + backBtn.w/2, backBtn.y + backBtn.h/2);

  if(hov) cursor(HAND);
}
function drawLogo(){ image(logoImage,logoBtn.x,logoBtn.y,logoBtn.w,logoBtn.h); }

/*════════ INPUT ═════*/
function mousePressed(){
  spawnClickFX(mouseX,mouseY);

  if(inside(mouseX,mouseY,logoBtn)){ stopAll(); state="start"; return; }

  if(state!=="start" && inside(mouseX,mouseY,backBtn)){
    if(state==="info"){ state="start"; return; }
    if(state==="chooseChapter"){ stopChapter(); state="chooseMyth"; }
    else { stopAll(); state="start"; }
    return;
  }

  if(state==="start"){
    for(let i=0;i<flares.length;i++){
      if(dist(mouseX,mouseY,flares[i].x,flares[i].y)<flares[i].base*1.3){
        infoIdx=i; state="info"; return;
      }
    }
    if(inside(mouseX,mouseY,chooseBtn)){ state="chooseMyth"; wavSound.play(); }
    return;
  }

  if(state==="chooseMyth"){
    const order=[1,0,2];
    order.forEach((id,idx)=>{
      const c=mythCircles[idx];
      if(dist(mouseX,mouseY,c.x,c.y)<c.r){ selectedMyth=id; state="chooseChapter"; }
    });
  } else if(state==="chooseChapter"){
    chapterBtns.forEach(btn=>{ if(inside(mouseX,mouseY,btn)) playChapter(btn.idx); });
  }
}
function touchStarted(){ mousePressed(); return false; }

/*════════ CURSOR FX ═════*/
function updateCursorFX(){
  /* halo + punto */
  push(); noFill(); stroke(255,215,0,230); strokeWeight(2);
  ellipse(mouseX,mouseY,24); pop();
  fill(255,215,0); noStroke(); ellipse(mouseX,mouseY,5);

  /* anillos pulsantes */
  if(frameCount%10===0) rings.push({x:mouseX,y:mouseY,r:12,l:30});
  for(let i=rings.length-1;i>=0;i--){
    const r=rings[i];
    stroke(255,215,0,map(r.l,0,30,0,220)); noFill();
    ellipse(r.x,r.y,r.r); r.r+=3; r.l--;
    if(r.l<=0) rings.splice(i,1);
  }

  /* chispas persistentes */
  for(let i=sparks.length-1;i>=0;i--){
    const s=sparks[i];
    fill(255,215,0,map(s.l,0,45,0,255)); noStroke();
    ellipse(s.x,s.y,s.r);
    s.x+=s.vx; s.y+=s.vy; s.r*=0.96; s.l--;
    if(s.l<=0) sparks.splice(i,1);
  }
}
function spawnClickFX(x,y){
  rings.push({x,y,r:14,l:35});
  for(let i=0;i<30;i++){
    const a=random(TWO_PI), sp=random(4,8);
    sparks.push({x,y,vx:cos(a)*sp,vy:sin(a)*sp,r:random(6,10),l:45});
  }
}

/*════════ AUDIO ═════*/
function playChapter(i){ stopChapter(); chapterSounds[i]?.loop(); currentChapter=i; }
function stopChapter(){ chapterSounds.forEach(s=>s?.stop()); currentChapter=-1; }
function stopAll(){ wavSound.stop(); stopChapter(); }

/*════════ UTILS ═════*/
function inside(mx,my,o){ return mx>o.x&&mx<o.x+o.w&&my>o.y&&my<o.y+o.h; }
function overlay(){ fill(0,180); rect(0,0,width,height); }
function circleMask(d){ const g=createGraphics(d,d); g.fill(255); g.circle(d/2,d/2,d); return g; }
function gold(){ return color(255,215,0); }

/* partículas fondo */
class Particle{
  constructor(){ this.reset(); }
  reset(){ this.x=random(width); this.y=random(height);
           this.s=random(2,6); this.v=random(.15,.8);
           this.a=random(80,150); this.xo=random(-.4,.4);}
  update(){ this.y-=this.v; this.x+=this.xo;
           if(this.y<-10||this.x<-10||this.x>width+10){ this.reset(); this.y=height+10; }}
  display(){ fill(255,this.a); ellipse(this.x,this.y,this.s);}
}

/*════════ RESIZE ════*/
function windowResized(){ resizeCanvas(windowWidth,windowHeight); resizeUI(); }
function resizeUI(){
  const base=min(width,height);

  introBox={ w:width*0.88, h:base*0.22, x:width*0.06, y:height*0.28 };
  chooseBtn={ w:base*0.45, h:base*0.11, x:width/2-base*0.225, y:height*0.74 };

  const logoW=width*0.12;
  logoBtn={ x:20,y:20,w:logoW,h:(logoImage.height/logoImage.width)*logoW };
  backBtn={ w:base*0.25, h:base*0.08, x:width-base*0.25-20, y:logoBtn.y };

  const r=base*0.15, y0=height/2;
  mythCircles=[
    {x:width*0.25,y:y0,r},{x:width*0.50,y:y0,r},{x:width*0.75,y:y0,r}
  ];

  /* flares más bajos (+ base*0.11) */
  const offsetX=base*0.02, flareY=y0-r*1.2+base*0.11;
  flares=[
    {x:mythCircles[0].x+offsetX,y:flareY,base:base*0.03,phase:0},
    {x:mythCircles[1].x,        y:flareY,base:base*0.03,phase:2},
    {x:mythCircles[2].x-offsetX,y:flareY,base:base*0.03,phase:4}
  ];

  /* chapter buttons */
  const cols=3,rows=2,cw=base*0.25,ch=base*0.08,
        gx=(width-cols*cw)/(cols+1),
        gy=(height-base*0.45-rows*ch)/(rows+1);
  const caps=[
    "Chapter 1\nThe Setting","Chapter 2\nThe Human Story",
    "Chapter 3\nThe Trigger","Chapter 4\nThe Mythical Form",
    "Chapter 5\nThe Witness","Chapter 6\nThe Echo / Legacy"
  ];
  chapterBtns=[]; let k=0;
  for(let rIdx=0;rIdx<rows;rIdx++)
    for(let cIdx=0;cIdx<cols;cIdx++,k++)
      chapterBtns.push({x:gx*(cIdx+1)+cw*cIdx,
                        y:gy*(rIdx+1)+ch*rIdx+base*0.15,
                        w:cw,h:ch,label:caps[k],idx:k});
}

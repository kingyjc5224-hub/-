/* =========================
   0) 수정구슬 ‘문지르기’ 인트로
========================= */
const intro = document.getElementById("intro");
const scratch = document.getElementById("scratch");
const orb = document.getElementById("orb");

const siteHeader = document.getElementById("siteHeader");
const siteMain = document.getElementById("siteMain");

function showSite(){
  intro.classList.add("fadeOut");
  siteHeader.removeAttribute("aria-hidden");
  siteMain.classList.remove("siteHidden");
  siteMain.classList.add("siteShown");
  siteMain.removeAttribute("aria-hidden");
}

function setupScratch(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = orb.getBoundingClientRect();
  scratch.width = Math.floor(rect.width * dpr);
  scratch.height = Math.floor(rect.height * dpr);
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 안개 레이어를 캔버스에 깔기
  const w = rect.width, h = rect.height;
  const g = ctx.createRadialGradient(w*0.5, h*0.5, w*0.05, w*0.5, h*0.5, w*0.65);
  g.addColorStop(0, "rgba(255,255,255,0.08)");
  g.addColorStop(0.35, "rgba(255,255,255,0.11)");
  g.addColorStop(1, "rgba(255,255,255,0.18)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // 노이즈(먹/종이 느낌) 살짝
  for(let i=0;i<900;i++){
    const x = Math.random()*w;
    const y = Math.random()*h;
    const r = Math.random()*2.0;
    ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.06})`;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
  }

  // 문지를 때 지우기
  let isDown = false;
  let cleared = false;

  function toXY(e){
    const r = orb.getBoundingClientRect();
    const x = (e.clientX - r.left);
    const y = (e.clientY - r.top);
    return {x,y};
  }

  function rub(x,y){
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x,y,32,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function checkReveal(){
    // 너무 자주 검사하지 않기
    const img = ctx.getImageData(0,0,scratch.width,scratch.height).data;
    let transparent = 0;
    // 샘플링(성능) — 12바이트마다 한 번
    for(let i=3;i<img.length;i+=48){
      if(img[i] === 0) transparent++;
    }
    const ratio = transparent / (img.length/48);
    // 45% 이상 지워지면 공개
    if(ratio > 0.45 && !cleared){
      cleared = true;
      setTimeout(showSite, 120);
    }
  }

  // 마우스
  orb.addEventListener("mousedown", (e)=>{
    isDown = true;
    const {x,y} = toXY(e);
    rub(x,y);
    checkReveal();
  });
  window.addEventListener("mouseup", ()=> isDown = false);
  orb.addEventListener("mousemove", (e)=>{
    if(!isDown) return;
    const {x,y} = toXY(e);
    rub(x,y);
    // 가끔만 검사
    if(Math.random() < 0.08) checkReveal();
  });

  // 터치
  orb.addEventListener("touchstart", (e)=>{
    isDown = true;
    const t = e.touches[0];
    const {x,y} = toXY(t);
    rub(x,y);
    checkReveal();
  }, {passive:true});

  orb.addEventListener("touchmove", (e)=>{
    if(!isDown) return;
    const t = e.touches[0];
    const {x,y} = toXY(t);
    rub(x,y);
    if(Math.random() < 0.10) checkReveal();
  }, {passive:true});

  orb.addEventListener("touchend", ()=> { isDown = false; }, {passive:true});
}

setupScratch();
window.addEventListener("resize", setupScratch);


/* =========================
   1) 카드 렌더링 + 문/먹번짐 + 뒤집기
========================= */
const grid = document.getElementById("grid");

function cardHTML(c){
  const hasImg = c.img && c.img.trim() !== "";
  const imgStyle = hasImg ? `style="background-image:url('${c.img}')"` : "";
  const sil = hasImg ? "" : "sil";

  return `
  <div class="card ${c.id}">
    <div class="cardInner">

      <div class="gate" aria-hidden="true">
        <div class="door left"></div>
        <div class="door right"></div>
        <div class="seam"></div>
      </div>

      <div class="face front">
        <div class="portrait ${sil}" ${imgStyle}></div>
        <div class="meta">
          <h3>${c.name}</h3>
          <p>${c.job}</p>
        </div>
      </div>

      <div class="face back">
        <h3>${c.name}</h3>
        <p>${c.vibe}</p>
        <p>말투: ${c.speech}</p>
        <p>${(c.personality||[]).join(", ")}</p>
      </div>

    </div>
  </div>`;
}

grid.innerHTML = window.CHARACTERS.map(cardHTML).join("");

document.querySelectorAll(".card").forEach(card=>{
  card.addEventListener("click",()=>{
    card.classList.toggle("is-flipped");
  });
});

// 처음엔 사이트 숨김
siteMain.classList.add("siteHidden");
siteHeader.setAttribute("aria-hidden","true");
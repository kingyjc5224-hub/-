const grid = document.getElementById("grid");

function cardHTML(c){
  const hasImg = c.img && c.img.trim() !== "";
  const imgStyle = hasImg ? `style="background-image:url('${c.img}')"` : "";
  const sil = hasImg ? "" : "sil";

  return `
  <div class="card">
    <div class="cardInner">
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
        <p>${c.personality.join(", ")}</p>
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
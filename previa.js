/* =================================================================
   CARTÃO DIGITAL — Animações (GSAP) e links
   ================================================================= */

/* -----------------------------------------------------------------
   ✏️ CONFIGURAÇÃO — ALTERE AQUI OS LINKS E DADOS DE CONTATO
   ----------------------------------------------------------------- */
const CONFIG = {
  // WhatsApp: número com DDI + DDD, só dígitos (ex: 55 48 99999-9999 → "5548999999999")
  whatsapp: {
    phone: "5548999999999",
    message: "Olá, Heloisa! Vi seu cartão digital e gostaria de conhecer imóveis de alto padrão.",
  },
  // Página / site com o portfólio de imóveis
  imoveis: "https://www.seusite.com.br/imoveis",
  // Perfil do Instagram
  instagram: "https://www.instagram.com/seuperfil",
  // Dados usados no botão "Salvar contato" (arquivo .vcf para a agenda do celular)
  vcard: {
    name: "Heloisa",
    org: "Heloisa Imóveis de Alto Padrão",
    title: "Corretora de Imóveis · CRECI 00000-F",
    phone: "+5548999999999",
    email: "contato@seusite.com.br",
    url: "https://www.seusite.com.br",
  },
  // Abrir as portas sozinhas após X segundos (0 = só abrem ao clicar)
  autoOpenAfter: 5,
};

/* ----------------------------------------------------------------- */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ===== 1. Links dos botões ===== */
function setupLinks() {
  const wa = CONFIG.whatsapp;
  const links = {
    whatsapp: `https://wa.me/${wa.phone}?text=${encodeURIComponent(wa.message)}`,
    imoveis: CONFIG.imoveis,
    instagram: CONFIG.instagram,
  };
  $$(".btn[data-link]").forEach((btn) => {
    const key = btn.dataset.link;
    if (links[key]) btn.href = links[key];
  });

  // Depoimentos → abre a janela
  $('[data-link="depoimentos"]').addEventListener("click", (e) => {
    e.preventDefault();
    openRoom();
  });

  // Salvar contato → gera e baixa um vCard
  $('[data-link="vcard"]').addEventListener("click", (e) => {
    e.preventDefault();
    const v = CONFIG.vcard;
    const vcf = [
      "BEGIN:VCARD", "VERSION:3.0",
      `FN:${v.name}`, `N:;${v.name};;;`, `ORG:${v.org}`, `TITLE:${v.title}`,
      `TEL;TYPE=CELL:${v.phone}`, `EMAIL:${v.email}`, `URL:${v.url}`,
      "END:VCARD",
    ].join("\r\n");
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${v.name.toLowerCase().replace(/\s+/g, "-")}.vcf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
}

/* ===== 2. Cena 1 — portas de mármore ===== */
let doorOpened = false;

function introIn() {
  // Estado inicial do vídeo por trás das portas: aproximado e desfocado
  gsap.set(".balcony", { scale: 1.18, filter: "brightness(.45) blur(10px)" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".door--left", { xPercent: -6, duration: 1.8, ease: "power2.out" })
    .from(".door--right", { xPercent: 6, duration: 1.8, ease: "power2.out" }, 0)
    .from(".door", { filter: "brightness(0)", duration: 2.2, ease: "power1.out" }, 0)
    .from(".seam", { scaleY: 0, opacity: 0, duration: 1.6, ease: "power2.inOut" }, 0.6)
    .from(".door__handle", { autoAlpha: 0, y: 40, duration: 1.2, stagger: 0.1 }, 1)
    .from(".intro__eyebrow", { autoAlpha: 0, y: 12, duration: 1 }, 1.1)
    .from(".intro__title", { autoAlpha: 0, y: 26, duration: 1.3 }, 1.25)
    .from(".intro__enter", { autoAlpha: 0, scale: 0.7, duration: 1 }, 1.6);

  // Mármore com leve movimento (reflexo de pedra polida)
  gsap.to(".door__stone", { yPercent: -2, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
  // Fresta de luz "respirando"
  gsap.to(".seam", { boxShadow: "0 0 18px 3px rgba(255,215,120,.8), 0 0 70px 12px rgba(212,175,55,.35)", duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
  // Anel pulsante do botão Entrar
  gsap.fromTo(".intro__ring", { scale: 1, opacity: 0.9 }, { scale: 1.55, opacity: 0, duration: 1.8, repeat: -1, ease: "power2.out", delay: 2.4 });

  if (CONFIG.autoOpenAfter > 0) gsap.delayedCall(CONFIG.autoOpenAfter, openDoor);
}

function openDoor() {
  if (doorOpened) return;
  doorOpened = true;
  const intro = $("#intro");

  if ($("#balcony").dataset.variant === "video") playBalconyVideo();
  const tl = gsap.timeline({ onComplete: () => intro.remove() });

  tl.to(".intro__content", { autoAlpha: 0, y: -16, duration: 0.6, ease: "power2.in" })
    // puxadores "destravam"
    .to(".door__handle", { y: 6, duration: 0.25, ease: "power2.in", yoyo: true, repeat: 1 }, 0.2)
    // a fresta de luz se intensifica
    .to(".seam", { width: 10, duration: 0.5, ease: "power2.in" }, 0.45)
    .to(".burst", { opacity: 1, duration: 0.6, ease: "power2.in" }, 0.55)
    // portas de correr se abrem para os lados
    .to(".door--left", { xPercent: -102, duration: 2, ease: "expo.inOut" }, 0.7)
    .to(".door--right", { xPercent: 102, duration: 2, ease: "expo.inOut" }, 0.7)
    .to(".seam", { opacity: 0, duration: 0.5 }, 0.9)
    .to(".burst", { opacity: 0, scale: 2.2, duration: 1.4, ease: "power2.out" }, 1.15)
    // câmera "entra" na sala: vídeo desfoca → foca, aproxima → assenta
    .to(".balcony", { scale: 1, filter: "brightness(1) blur(0px)", duration: 2.8, ease: "power3.out", clearProps: "filter" }, 0.9)
    .add(revealCard, 2.1);
}

/* ===== 3. Revelação da interface (stagger dos botões) ===== */
function revealCard() {
  gsap.set("#card", { visibility: "visible" });
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".profile__avatar", { autoAlpha: 0, scale: 0.6, duration: 1 })
    .from([".profile__name", ".profile__role"], { autoAlpha: 0, y: 20, duration: 1, stagger: 0.12 }, 0.15)
    .from(".profile__divider", { scaleX: 0, duration: 1 }, 0.4)
    .from(".profile__place", { autoAlpha: 0, duration: 1 }, 0.5)
    // ⭐ Botões entram um por um, de baixo para cima
    .from(".btn", { autoAlpha: 0, y: 46, duration: 0.9, stagger: 0.12, ease: "back.out(1.4)", clearProps: "transform" }, 0.45)
    .from(".card__footer", { autoAlpha: 0, duration: 1 }, 1.1)
    // Brilho automático atravessando cada botão uma vez
    .add(() => $$(".btn").forEach((b, i) => gsap.delayedCall(i * 0.12, () => shine(b))), 1.3);

  // Nome com reflexo dourado em movimento contínuo
  gsap.fromTo(".profile__name", { backgroundPosition: "0% 50%" }, { backgroundPosition: "100% 50%", duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });
}

/* ===== 4. Interações dos botões ===== */
function shine(btn) {
  gsap.fromTo(btn.querySelector(".btn__shine"), { xPercent: -120 }, { xPercent: 330, duration: 0.9, ease: "power2.inOut" });
}

function setupButtons() {
  $$(".btn").forEach((btn) => {
    const s = document.createElement("span");
    s.className = "btn__shine";
    btn.appendChild(s);

    btn.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      gsap.to(btn, { scale: 1.05, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      shine(btn);
    });

    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      btn.style.setProperty("--mx", `${x}px`);
      btn.style.setProperty("--my", `${y}px`);
      // Efeito "magnético" sutil (só mouse)
      if (e.pointerType === "mouse") {
        gsap.to(btn, { x: (x / r.width - 0.5) * 8, y: (y / r.height - 0.5) * 6, duration: 0.4, ease: "power2.out" });
      }
    });

    btn.addEventListener("pointerleave", () => {
      gsap.to(btn, { scale: 1, x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.6)", overwrite: "auto" });
    });

    btn.addEventListener("pointerdown", (e) => {
      gsap.to(btn, { scale: 0.97, duration: 0.15, ease: "power2.out" });
      // Onda dourada no ponto do toque
      const r = btn.getBoundingClientRect();
      const rip = document.createElement("span");
      rip.className = "ripple";
      rip.style.left = `${e.clientX - r.left}px`;
      rip.style.top = `${e.clientY - r.top}px`;
      btn.appendChild(rip);
      gsap.fromTo(rip, { scale: 0, opacity: 1 }, { scale: 60, opacity: 0, duration: 0.9, ease: "power2.out", onComplete: () => rip.remove() });
    });

    const release = (e) => {
      const hovering = e.pointerType === "mouse" && btn.matches(":hover");
      gsap.to(btn, { scale: hovering ? 1.05 : 1, duration: 0.5, ease: "back.out(3)" });
    };
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointercancel", release);
  });
}

/* ===== 5. Cenário vivo: feixe de luz, pássaros, partículas, parallax ===== */

// Feixe de luz dourada atravessando o vidro a cada ~9s
function setupFlare() {
  if (reduceMotion) return;
  gsap.timeline({ repeat: -1, repeatDelay: 7, delay: 5 })
    .fromTo(".scene__flare", { x: "-40vw" }, { x: "130vw", duration: 3.2, ease: "power1.inOut" });
}

// Pássaros: silhuetas de gaivota que cruzam o céu em pequenos bandos
const BIRD_PATH = "M0 0 C-6 -5 -14 -7 -22 -3 C-15 -4 -8 -2 -2 3 L0 4 L2 3 C8 -2 15 -4 22 -3 C14 -7 6 -5 0 0 Z";
function spawnFlock() {
  const NS = "http://www.w3.org/2000/svg";
  const layer = $(".birds");
  const count = gsap.utils.random(1, 4, 1);
  const ltr = Math.random() > 0.4;
  const baseY = gsap.utils.random(320, 430);        // altura no céu (viewBox 1600x900)
  const duration = gsap.utils.random(14, 20);

  for (let i = 0; i < count; i++) {
    const bird = document.createElementNS(NS, "g");
    bird.setAttribute("class", "bird");
    const wings = document.createElementNS(NS, "g");
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", BIRD_PATH);
    wings.appendChild(path);
    bird.appendChild(wings);
    layer.appendChild(bird);

    const scale = gsap.utils.random(0.35, 0.8);     // pequenos = distantes (mais realista)
    const startX = ltr ? -40 - i * 50 : 1640 + i * 50;
    const endX = ltr ? 1700 : -100;
    gsap.set(bird, { x: startX, y: baseY + (i % 2 ? 1 : -1) * i * gsap.utils.random(10, 22), scale });
    // bater de asas intercalado com planar
    gsap.timeline({ repeat: -1, repeatDelay: gsap.utils.random(0.6, 1.6) })
      .to(wings, { scaleY: -0.6, transformOrigin: "50% 50%", duration: 0.18, repeat: 5, yoyo: true, ease: "sine.inOut" });
    gsap.to(bird, { x: endX, duration: duration + i * 0.6, ease: "none", delay: i * 0.3, onComplete: () => bird.remove() });
    gsap.to(bird, { y: `+=${gsap.utils.random(-40, 40)}`, duration: duration / 3, repeat: 3, yoyo: true, ease: "sine.inOut", delay: i * 0.3 });
  }
  gsap.delayedCall(gsap.utils.random(7, 13), spawnFlock);
}

// Partículas de poeira dourada flutuando na luz
function setupDust() {
  if (reduceMotion) return;
  const box = $(".dust");
  const n = window.innerWidth < 760 ? 12 : 22;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("span");
    box.appendChild(p);
    const float = () => {
      gsap.set(p, { left: `${gsap.utils.random(5, 95)}%`, top: `${gsap.utils.random(35, 100)}%`, scale: gsap.utils.random(0.5, 1.4), opacity: 0, x: 0, y: 0 });
      gsap.timeline({ onComplete: float })
        .to(p, { opacity: gsap.utils.random(0.25, 0.8), duration: 1.5 })
        .to(p, { y: `-=${gsap.utils.random(80, 220)}`, x: `+=${gsap.utils.random(-40, 40)}`, duration: gsap.utils.random(6, 11), ease: "sine.inOut" }, 0)
        .to(p, { opacity: 0, duration: 1.5 }, ">-1.5");
    };
    gsap.delayedCall(Math.random() * 6, float);
  }
}

// Parallax: o vídeo acompanha levemente o mouse (desktop) — sensação de profundidade
function setupParallax() {
  if (!finePointer || reduceMotion) return;
  window.addEventListener("pointermove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    gsap.to(".balcony__frame", { x: nx * -22, y: ny * -12, duration: 1.6, ease: "power3.out" });
    gsap.to(".birds", { x: nx * -34, y: ny * -16, duration: 1.8, ease: "power3.out" });
  });
}

/* ===== 6. Janela de depoimentos ===== */
function openModal() {
  const modal = $("#depoimentos");
  modal.hidden = false;
  gsap.timeline()
    .fromTo(".modal__backdrop", { opacity: 0 }, { opacity: 1, duration: 0.4 })
    .fromTo(".modal__box", { y: 40, scale: 0.96, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, 0.05)
    .fromTo(".testimonial", { x: -20, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }, 0.25);
  $(".modal__close").focus();
}

function closeModal() {
  const modal = $("#depoimentos");
  if (modal.hidden) return;
  gsap.timeline({ onComplete: () => (modal.hidden = true) })
    .to(".modal__box", { y: 20, autoAlpha: 0, duration: 0.3, ease: "power2.in" })
    .to(".modal__backdrop", { opacity: 0, duration: 0.3 }, 0.1);
}

function setupModal() {
  $$("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}

/* ===== INICIALIZAÇÃO ===== */
function init() {
  if (!window.gsap) {
    // Se o CDN do GSAP falhar, mostra o cartão sem animações
    document.getElementById("intro").remove();
    document.getElementById("card").style.visibility = "visible";
    return;
  }

  setupLinks();
  setupButtons();
  setupModal();
  setupFlare();
  setupWater();
  setupBalconyVideo();
  setupPreviewBar();
  setupRoom();
  setupDust();
  setupParallax();
  if (!reduceMotion) gsap.delayedCall(3, spawnFlock);

  if (reduceMotion) {
    // Sem animações de entrada: vai direto ao cartão
    $("#intro").remove();
    gsap.set("#card", { visibility: "visible" });
    return;
  }

  // Portas: abrem ao clicar em qualquer lugar da abertura, no botão "Entrar" ou automaticamente
  $("#intro").addEventListener("click", openDoor);
  introIn();
}


/* =================================================================
   PRÉVIA — água animada, troca de sacada e sala de depoimentos
   ================================================================= */

// Água: ondulação contínua variando a frequência do ruído do filtro SVG
function setupWater() {
  const noise = document.getElementById("aguaNoise");
  if (!noise || reduceMotion) return;
  const st = { fx: 0.006, fy: 0.09 };
  gsap.to(st, {
    fx: 0.0085, fy: 0.11, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut",
    onUpdate: () => noise.setAttribute("baseFrequency", `${st.fx.toFixed(5)} ${st.fy.toFixed(4)}`),
  });
  // leve "respiração" da câmera sobre a foto (sensação de vídeo)
  gsap.to(".balcony__img, .balcony__water", { scale: 1.035, duration: 14, repeat: -1, yoyo: true, ease: "sine.inOut", transformOrigin: "60% 60%" });
}


// ---- Vídeo da sacada: parte 1 (porta → piscina) toca 1x, depois parte 2 em loop ----
let videoReady = false;
function setupBalconyVideo() {
  const vi = $("#vIntro"), vl = $("#vLoop");
  // celular em pé → versão vertical; desktop/tablet deitado → versão horizontal
  const sufixo = matchMedia("(orientation: portrait)").matches ? "-m" : "";
  vi.src = `assets/previa/sacada-intro${sufixo}.mp4`;
  vl.src = `assets/previa/sacada-loop${sufixo}.mp4`;
  const fail = () => { vi.remove(); vl.remove(); };
  vi.addEventListener("error", fail, { once: true });
  vi.addEventListener("loadeddata", () => {
    videoReady = true;
    $("#pvVideo").hidden = false;
    // se o vídeo existe, ele vira a opção padrão
    $("#balcony").dataset.variant = "video";
    $$("#pvBar button").forEach((x) => x.classList.toggle("is-on", x.id === "pvVideo"));
    vi.classList.add("is-on");
  }, { once: true });
  vi.addEventListener("ended", () => {
    vl.currentTime = 0;
    vl.play().catch(() => {});
    vl.classList.add("is-on");
    vi.classList.remove("is-on");
  });
}
function playBalconyVideo() {
  if (!videoReady) return;
  const vi = $("#vIntro"), vl = $("#vLoop");
  vl.pause(); vl.classList.remove("is-on");
  vi.classList.add("is-on");
  vi.currentTime = 0;
  vi.play().catch(() => {});
}

// Barra da prévia: alterna Sacada A / B / Vídeo
function setupPreviewBar() {
  const srcs = { a: "assets/previa/sacada-a.jpg", b: "assets/previa/sacada-b.jpg" };
  $$("#pvBar button").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const v = b.dataset.variant;
    $$("#pvBar button").forEach((x) => x.classList.toggle("is-on", x === b));
    gsap.to(".balcony", { opacity: 0, duration: 0.35, onComplete: () => {
      $("#balcony").dataset.variant = v;
      if (v === "video") { playBalconyVideo(); gsap.to(".balcony", { opacity: 1, duration: 0.6 }); return; }
      $("#balconyImg").src = srcs[v];
      $("#balconyWater").src = srcs[v];
      gsap.to(".balcony", { opacity: 1, duration: 0.6 });
    }});
  }));
}

// ---- Sala com TV ----
const PHOTO = 2500;                              // tamanho da foto (px)
const TV = { x: 604, y: 869, w: 679, h: 385 };   // tela da TV na foto
let roomOpen = false;
let slideTimer = null;

// Enquadramento "câmera aberta" (sala inteira cobrindo a tela)
function camWide() {
  const vw = innerWidth, vh = innerHeight;
  const s = Math.max(vw, vh) / PHOTO * 1.02;
  const cx = TV.x + TV.w / 2, cy = TV.y + TV.h / 2;
  const x = gsap.utils.clamp(vw - PHOTO * s, 0, vw / 2 - cx * s);
  const y = gsap.utils.clamp(vh - PHOTO * s, 0, vh / 2 - cy * s);
  return { x, y, scale: s };
}
// Enquadramento "câmera na TV"
function camTV() {
  const vw = innerWidth, vh = innerHeight;
  // ✏️ quanto a TV ocupa da tela (desktop mostra mais da sala; celular foca na TV)
  const s = vw < 760 ? Math.min((vw * 0.92) / TV.w, (vh * 0.6) / TV.h)
                     : Math.min((vw * 0.62) / TV.w, (vh * 0.52) / TV.h);
  const cx = TV.x + TV.w / 2, cy = TV.y + TV.h / 2;
  return { x: vw / 2 - cx * s, y: vh * 0.44 - cy * s, scale: s };
}

function showSlide(i) {
  const slides = $$(".tv__slide"), dots = $$(".tv__dots span");
  slides.forEach((sl, k) => {
    if (k === i) gsap.fromTo(sl, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" });
    else gsap.to(sl, { autoAlpha: 0, y: -10, duration: 0.5 });
  });
  dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
}
function startSlides() {
  let i = 0;
  showSlide(i);
  slideTimer = setInterval(() => { i = (i + 1) % $$(".tv__slide").length; showSlide(i); }, 5500);
}

function openRoom() {
  if (roomOpen) return;
  roomOpen = true;
  const room = $("#room");
  room.hidden = false;
  gsap.set("#roomStage", camWide());
  gsap.set(".tv", { opacity: 0 });
  gsap.set(".tv__content", { opacity: 0 });
  gsap.set(".tv__line", { scaleX: 0, opacity: 1 });

  gsap.timeline()
    // sai da sacada (mais rápido)
    .to("#card", { autoAlpha: 0, y: 24, duration: 0.4, ease: "power2.in" })
    .to(".scene", { scale: 1.06, filter: "brightness(0)", duration: 0.55, ease: "power2.in" }, 0.05)
    // sala aparece no escuro (só as fitas de LED acesas)…
    .fromTo(room, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, 0.5)
    .set("#roomDark", { opacity: 1 }, 0.5)
    // …e as luzes ACENDEM rápido, com um leve "piscar" de interruptor
    .to("#roomDark", { opacity: 0.35, duration: 0.08, ease: "power4.out" }, 0.95)
    .to("#roomDark", { opacity: 0.75, duration: 0.07 }, 1.03)
    .to("#roomDark", { opacity: 0, duration: 0.4, ease: "power2.out" }, 1.1)
    // câmera foca direto na TV
    .to("#roomStage", { ...camTV(), duration: 1.5, ease: "power3.inOut" }, 1.0)
    // TV liga: linha de luz → tela acende → depoimentos
    .set(".tv", { opacity: 1 }, 2.2)
    .to(".tv__line", { scaleX: 1, duration: 0.25, ease: "power2.out" }, 2.2)
    .to(".tv__line", { scaleY: 190, opacity: 0, duration: 0.35, ease: "power2.in" }, 2.45)
    .to(".tv__content", { opacity: 1, duration: 0.4 }, 2.55)
    .from(".tv__brand", { autoAlpha: 0, y: -8, duration: 0.6 }, 2.7)
    .add(startSlides, 2.7)
    .from(".room__back", { autoAlpha: 0, y: 20, duration: 0.6 }, 3);
}

function closeRoom() {
  if (!roomOpen) return;
  clearInterval(slideTimer);
  gsap.timeline({ onComplete: () => { $("#room").hidden = true; roomOpen = false; } })
    .to(".room__back", { autoAlpha: 0, duration: 0.3 })
    .to(".tv__content", { scaleY: 0.01, duration: 0.3, ease: "power2.in" }, 0.1)
    .to(".tv", { opacity: 0, duration: 0.2 }, 0.4)
    .set(".tv__content", { scaleY: 1 })
    .to("#roomStage", { ...camWide(), duration: 1.4, ease: "power3.inOut" }, 0.4)
    .to("#room", { autoAlpha: 0, duration: 0.7 }, 1.3)
    .to(".scene", { scale: 1, filter: "brightness(1)", duration: 1.2, ease: "power2.out", clearProps: "filter,scale" }, 1.4)
    .to("#card", { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1.8)
    .set(".room__back", { autoAlpha: 1 });
}

function setupRoom() {
  $("#roomBack").addEventListener("click", closeRoom);
  addEventListener("resize", () => {
    if (roomOpen) gsap.set("#roomStage", camTV());
  });
}

document.addEventListener("DOMContentLoaded", init);

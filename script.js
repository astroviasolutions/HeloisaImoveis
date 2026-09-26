/* =================================================================
   CARTÃO DIGITAL — Heloisa · versão minimalista
   ================================================================= */

/* -----------------------------------------------------------------
   ✏️ CONFIGURAÇÃO — ALTERE AQUI LINKS E DADOS
   ----------------------------------------------------------------- */
const CONFIG = {
  // Endereço público do cartão (é o que o QR code abre).
  // Deixe "" para usar automaticamente o endereço da página atual.
  siteUrl: "",
  // WhatsApp: DDI + DDD + número, só dígitos
  whatsapp: {
    phone: "5548988710827",
    message: "Olá, Heloisa! Encontrei seu cartão digital e tenho interesse em conhecer os imóveis de alto padrão que você representa.",
  },
  instagram: "https://www.instagram.com/heloisasilveiraimoveis?stkn=ZHJvOTdpczZ6Y3Jr",
  // Dados do "Salvar contato" (arquivo .vcf para a agenda)
  vcard: {
    name: "Heloisa Silveira",
    org: "Heloisa Silveira Imóveis",
    title: "Corretora de Imóveis · CRECI/SC 45606",
    phone: "+5548988710827",
    email: "",
    url: "https://www.instagram.com/heloisasilveiraimoveis",
  },
  // Tempo (s) que as portas ficam fechadas antes de abrir sozinhas
  doorDelay: 1.4,
  // Intervalo (s) entre depoimentos
  quoteEvery: 6,
  // ✏️ FICHA DE ANÁLISE — perguntas rápidas (1 toque cada) que viram
  // um resumo pronto, enviado direto pro WhatsApp da Heloisa.
  ficha: [
    { q: "Que tipo de imóvel você procura?", options: ["Apartamento", "Casa", "Cobertura", "Terreno"] },
    { q: "Qual faixa de investimento?", options: ["Até R$ 1 milhão", "R$ 1 a 3 milhões", "R$ 3 a 5 milhões", "Acima de R$ 5 milhões"] },
    { q: "Para quando é a busca?", options: ["Imediato", "Em até 3 meses", "Sem pressa, só pesquisando"] },
  ],
};
/* ----------------------------------------------------------------- */

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof window.gsap !== "undefined";

/* ===== Links e "Salvar contato" ===== */
function setupLinks() {
  const wa = CONFIG.whatsapp;
  const links = {
    whatsapp: `https://wa.me/${wa.phone}?text=${encodeURIComponent(wa.message)}`,
    instagram: CONFIG.instagram,
  };
  $$("[data-link]").forEach((a) => { if (links[a.dataset.link]) a.href = links[a.dataset.link]; });

  $("#saveContact").addEventListener("click", () => {
    const v = CONFIG.vcard;
    const vcf = ["BEGIN:VCARD", "VERSION:3.0", `FN:${v.name}`, `N:;${v.name};;;`, `ORG:${v.org}`,
      `TITLE:${v.title}`, `TEL;TYPE=CELL:${v.phone}`, v.email && `EMAIL:${v.email}`, `URL:${v.url}`, "END:VCARD"]
      .filter(Boolean).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([vcf], { type: "text/vcard;charset=utf-8" }));
    a.download = `${v.name.toLowerCase().replace(/\s+/g, "-")}.vcf`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
}

/* ===== QR code (gerado no navegador, sem serviço externo) ===== */
function setupQr() {
  const url = CONFIG.siteUrl || location.href.split("#")[0];
  if (typeof window.qrcode === "function") {
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    const svg = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    $$("[data-qr]").forEach((el) => {
      el.innerHTML = svg;
      el.querySelector("path, rect:last-child")?.setAttribute("fill", "#0b0b0b");
    });
  } else {
    // sem internet para carregar a biblioteca: esconde o QR
    $$(".qr-dock, .mini__btn--qr").forEach((el) => (el.style.display = "none"));
  }
  const sheet = $("#qrSheet");
  $("#openQr").addEventListener("click", () => {
    sheet.hidden = false;
    if (hasGsap) gsap.fromTo(".qr-sheet__box", { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" });
  });
  const close = () => (sheet.hidden = true);
  $("#closeQr").addEventListener("click", close);
  sheet.addEventListener("click", (e) => { if (e.target === sheet) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ===== Ficha de análise: 1 toque por pergunta → resumo pronto no WhatsApp ===== */
function setupFicha() {
  const steps = CONFIG.ficha;
  if (!steps || !steps.length) return;
  const sheet = $("#fichaSheet"), stage = $("#fichaStage"), dots = $("#fichaDots");
  let i = 0;
  const answers = [];

  dots.innerHTML = steps.map(() => `<span></span>`).join("");
  const updateDots = () => $$(".ficha-sheet__dots span").forEach((d, idx) => d.classList.toggle("is-on", idx === i));

  function renderStep() {
    const step = steps[i];
    const card = document.createElement("div");
    card.className = "ficha-step";
    card.innerHTML = `<p class="ficha-step__q">${step.q}</p>` +
      `<div class="ficha-step__opts">${step.options.map((o) => `<button type="button" class="ficha-step__opt">${o}</button>`).join("")}</div>`;
    stage.innerHTML = "";
    stage.appendChild(card);
    updateDots();
    if (hasGsap) gsap.fromTo(card, { autoAlpha: 0, x: 18 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: "power2.out" });

    card.querySelectorAll(".ficha-step__opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        answers.push(btn.textContent);
        const advance = () => { i++; i < steps.length ? renderStep() : finish(); };
        if (hasGsap) gsap.to(card, { autoAlpha: 0, x: -18, duration: 0.3, ease: "power2.in", onComplete: advance });
        else advance();
      });
    });
  }

  function finish() {
    const wa = CONFIG.whatsapp;
    const resumo = steps.map((s, idx) => `• ${s.q} ${answers[idx]}`).join("\n");
    const msg = `Olá, Heloisa! Meu perfil de busca:\n${resumo}`;
    sheet.hidden = true;
    window.open(`https://wa.me/${wa.phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  $("#openFicha").addEventListener("click", () => {
    i = 0; answers.length = 0;
    sheet.hidden = false;
    renderStep();
    if (hasGsap) gsap.fromTo(".ficha-sheet__box", { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" });
  });
  const close = () => (sheet.hidden = true);
  $("#closeFicha").addEventListener("click", close);
  sheet.addEventListener("click", (e) => { if (e.target === sheet) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) close(); });
}

/* ===== Vídeo: parte 1 (sala → piscina) uma vez, depois parte 2 em loop ===== */
function setupVideo() {
  const vi = $("#vIntro"), vl = $("#vLoop");
  const s = matchMedia("(orientation: portrait)").matches ? "-m" : "";
  vi.src = `assets/sacada-intro${s}.mp4`;
  vl.src = `assets/sacada-loop${s}.mp4`;
  if (reduceMotion) {            // sem movimento: mostra direto o final (piscina), parado
    vi.classList.remove("is-on"); vl.classList.add("is-on"); vl.removeAttribute("loop");
    return;
  }
  vi.addEventListener("ended", () => {
    vl.currentTime = 0;
    vl.play().catch(() => {});
    vl.classList.add("is-on");
    vi.classList.remove("is-on");
  });
}
function playVideo() {
  if (reduceMotion) return;
  $("#vIntro").play().catch(() => {});
}

/* ===== Depoimentos girando sozinhos ===== */
function setupQuotes() {
  const q = $$(".quote");
  if (q.length < 2 || reduceMotion || !hasGsap) return;
  let i = 0;
  setInterval(() => {
    const cur = q[i];
    i = (i + 1) % q.length;
    gsap.to(cur, { autoAlpha: 0, y: -6, duration: 0.6, ease: "power2.in" });
    gsap.fromTo(q[i], { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.5 });
  }, CONFIG.quoteEvery * 1000);
}

/* ===== Abertura: portas se abrem sozinhas (toque só adianta) ===== */
function openDoors() {
  const intro = $("#intro");
  if (!intro || intro.dataset.open) return;
  intro.dataset.open = "1";
  playVideo();
  gsap.timeline({ onComplete: () => intro.remove() })
    .to(".intro__title", { autoAlpha: 0, duration: 0.5, ease: "power2.in" })
    .to(".door--left", { xPercent: -101, duration: 1.6, ease: "power3.inOut" }, 0.2)
    .to(".door--right", { xPercent: 101, duration: 1.6, ease: "power3.inOut" }, 0.2)
    .to(".seam", { autoAlpha: 0, duration: 0.3 }, 0.2)
    .from(".bg", { scale: 1.08, duration: 2.2, ease: "power3.out" }, 0.2)
    .add(revealCard, 1.1);
}

function revealCard() {
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".profile > *", { autoAlpha: 0, y: 14, duration: 0.9, stagger: 0.1 })
    // botões entram um por um, de baixo para cima
    .from([".quotes", ".btn", ".ficha-cta", ".mini", ".footer"], { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.08, clearProps: "transform" }, 0.25)
    .from(".qr-dock", { autoAlpha: 0, duration: 0.8 }, 0.6);
}

/* ===== Início ===== */
document.addEventListener("DOMContentLoaded", () => {
  setupLinks();
  setupQr();
  setupFicha();
  setupVideo();

  if (!hasGsap || reduceMotion) {   // sem animação: cartão direto
    $("#intro")?.remove();
    playVideo();
    return;
  }
  setupQuotes();
  gsap.from(".intro__title", { autoAlpha: 0, y: 10, duration: 0.9, ease: "power2.out" });
  gsap.delayedCall(CONFIG.doorDelay, openDoors);
  // um toque/clique opcional só adianta a abertura
  addEventListener("pointerdown", openDoors, { once: true });
});

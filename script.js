"use strict";

/* =========================
   Helpers
========================= */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/* =========================
   1) Mobile Menu Toggle
========================= */
function initMenuToggle() {
  const toggle = $("#menu-toggle");
  const nav = $("#navbar-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

/* =========================
   2) EmailJS Contact Form
========================= */
function initEmailForm() {
  const form = $("#contact-form");
  const status = $("#form-status");

  // Agar sahifada contact form bo‘lmasa — chiqib ketamiz
  if (!form || !status) return;

  // EmailJS bo‘lmasa — console’da ko‘rsatib qo‘yamiz (sayt crash bo‘lmasin)
  if (typeof emailjs === "undefined") {
    status.innerText = "Email service is not available right now.";
    status.style.color = "red";
    return;
  }

  // Init (sizniki bilan)
  emailjs.init("U2e8yJbGi5AOp2oxM");

  const SERVICE_ID = "service_au2kevt";
  const TEMPLATE_ID = "template_2xq40lp";

  const setStatus = (text, color) => {
    status.innerText = text;
    status.style.color = color;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Sending...", "#555");

    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
      setStatus("Message sent successfully!", "green");
      form.reset();
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("Failed to send message.", "red");
    }
  });
}

/* =========================
   3) About Carousel (Buttons + Dots + Swipe)
========================= */
function initAboutCarousel() {
  const carousel = $(".about-carousel");
  if (!carousel) return;

  const track = $(".carousel-track", carousel);
  const viewport = $(".carousel-viewport", carousel);
  const prevBtn = $(".carousel-btn.prev", carousel);
  const nextBtn = $(".carousel-btn.next", carousel);
  const dotsWrap = $(".carousel-dots", carousel);

  if (!track || !viewport || !prevBtn || !nextBtn || !dotsWrap) return;

  const slides = $$("img", track);
  if (slides.length === 0) return;

  let index = 0;
  let width = 0;

  // Drag state
  let isDragging = false;
  let startX = 0;
  let currentX = 0;

  const SWIPE_THRESHOLD = 50; // px

  // Build dots
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = $$(".carousel-dot", dotsWrap);

  const updateDots = () => {
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  };

  const snap = (animate = true) => {
    track.style.transition = animate ? "transform 350ms ease" : "none";
    track.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
  };

  const measure = () => {
    width = viewport.clientWidth;
    snap(false);
  };

  const goTo = (i) => {
    index = (i + slides.length) % slides.length;
    snap(true);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Buttons
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  // Pointer-based swipe (mouse + touch + pen)
  viewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    isDragging = true;
    startX = e.clientX;
    currentX = startX;

    viewport.setPointerCapture(e.pointerId);
    track.style.transition = "none";
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    currentX = e.clientX;
    const delta = currentX - startX;
    track.style.transform = `translateX(${(-index * width) + delta}px)`;
  });

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;

    const delta = currentX - startX;

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      delta < 0 ? next() : prev();
    } else {
      snap(true);
    }
  };

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", endDrag);

  // Prevent native image drag ghost
  slides.forEach((img) => {
    img.addEventListener("dragstart", (e) => e.preventDefault());
  });

  // Keyboard support
  carousel.tabIndex = 0;
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  // Init
  window.addEventListener("resize", measure);
  measure();
  snap(false);
}

/* =========================
   Boot
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initMenuToggle();
  initEmailForm();
  initAboutCarousel();
});

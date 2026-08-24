/**
 * Сварка • Монтаж — основной скрипт
 * Без backend: форма показывает локальное сообщение об успехе.
 */

(function () {
  "use strict";

  const header = document.getElementById("header");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const form = document.getElementById("request-form");
  const formSuccess = document.getElementById("form-success");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxMedia = document.getElementById("lightbox-media");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const portfolio = document.getElementById("portfolio");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const masterPhoto = document.getElementById("master-photo");

  /* ---------- Header scroll state ---------- */
  function updateHeader() {
    if (!header || header.classList.contains("header--static")) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  function setMenuOpen(isOpen) {
    if (!burger || !nav) return;
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    nav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      const open = burger.getAttribute("aria-expanded") === "true";
      setMenuOpen(!open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenuOpen(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ---------- Image helpers ---------- */
  function tryLoadImage(url) {
    return new Promise(function (resolve) {
      if (!url) {
        resolve(false);
        return;
      }
      const img = new Image();
      img.onload = function () {
        resolve(true);
      };
      img.onerror = function () {
        resolve(false);
      };
      img.src = url;
    });
  }

  /**
   * Подставляет реальные фото в портфолио, если файлы уже лежат в images/portfolio/.
   * data-src на кнопке — путь к будущему изображению.
   */
  async function hydratePortfolioImages() {
    if (!portfolio) return;
    const items = portfolio.querySelectorAll(".portfolio-item");

    for (const item of items) {
      const src = item.getAttribute("data-src");
      const media = item.querySelector(".portfolio-item__media");
      const img = item.querySelector(".portfolio-item__img");
      if (!src || !media || !img) continue;

      const exists = await tryLoadImage(src);
      if (!exists) continue;

      img.src = src;
      img.hidden = false;
      media.classList.add("has-image");
      media.classList.remove("placeholder");
    }
  }

  /**
   * Фото мастера: images/master/photo.jpg
   */
  async function hydrateMasterPhoto() {
    if (!masterPhoto) return;
    const src = "images/master/photo.jpg";
    const wrap = masterPhoto.closest(".about__photo");
    const exists = await tryLoadImage(src);
    if (!exists || !wrap) return;

    masterPhoto.src = src;
    masterPhoto.hidden = false;
    wrap.classList.add("has-image");
    wrap.classList.remove("placeholder");
  }

  hydratePortfolioImages();
  hydrateMasterPhoto();

  /* ---------- Portfolio filters ---------- */
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const filter = button.getAttribute("data-filter") || "all";

      filterButtons.forEach(function (btn) {
        btn.classList.toggle("is-active", btn === button);
      });

      if (!portfolio) return;
      portfolio.querySelectorAll(".portfolio-item").forEach(function (item) {
        const category = item.getAttribute("data-category");
        const show = filter === "all" || category === filter;
        item.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  let lastFocused = null;

  function openLightbox(title, src, hasImage) {
    if (!lightbox || !lightboxCaption || !lightboxMedia || !lightboxImg) return;

    lastFocused = document.activeElement;
    lightboxCaption.textContent = title;
    lightboxMedia.setAttribute("data-placeholder", title);

    if (hasImage && src) {
      lightboxImg.src = src;
      lightboxImg.alt = title;
      lightboxImg.hidden = false;
      lightboxMedia.classList.add("has-image");
      lightboxMedia.classList.remove("placeholder");
    } else {
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
      lightboxImg.hidden = true;
      lightboxMedia.classList.add("placeholder");
      lightboxMedia.classList.remove("has-image");
    }

    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const closeBtn = lightbox.querySelector(".lightbox__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;

    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lightboxImg) {
      lightboxImg.removeAttribute("src");
      lightboxImg.hidden = true;
    }

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  if (portfolio) {
    portfolio.addEventListener("click", async function (event) {
      const item = event.target.closest(".portfolio-item");
      if (!item) return;

      const title = item.getAttribute("data-title") || "";
      const src = item.getAttribute("data-src") || "";
      const img = item.querySelector(".portfolio-item__img");
      const alreadyLoaded = img && !img.hidden && img.getAttribute("src");

      if (alreadyLoaded) {
        openLightbox(title, img.getAttribute("src"), true);
        return;
      }

      const exists = await tryLoadImage(src);
      openLightbox(title, src, exists);
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target.closest("[data-close]")) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeLightbox();
  });

  /* ---------- Request form (no backend) ---------- */
  function setInvalid(field, invalid) {
    field.classList.toggle("is-invalid", invalid);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = form.querySelector("#name");
      const phone = form.querySelector("#phone");
      const task = form.querySelector("#task");
      const consent = form.querySelector("#consent");

      let valid = true;

      [name, phone, task].forEach(function (field) {
        const ok = field && field.value.trim().length > 0;
        setInvalid(field, !ok);
        if (!ok) valid = false;
      });

      if (consent && !consent.checked) {
        valid = false;
        consent.focus();
      }

      if (!valid) return;

      // Без отправки на сервер — только локальное подтверждение
      form.reset();
      [name, phone, task].forEach(function (field) {
        setInvalid(field, false);
      });

      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.focus();
      }
    });
  }
})();

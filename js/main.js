/**
 * Сварка • Монтаж — основной скрипт
 */

(function () {
  "use strict";

  const header = document.getElementById("header");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxMedia = document.getElementById("lightbox-media");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  const portfolio = document.getElementById("portfolio");
  const filterButtons = document.querySelectorAll(".filter-btn");

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

  /* ---------- Lightbox gallery ---------- */
  let lastFocused = null;
  let galleryImages = [];
  let galleryIndex = 0;
  let galleryTitle = "";

  function parseImages(attr) {
    if (!attr) return [];
    return attr
      .split("|")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function updateLightboxSlide() {
    if (!lightboxImg || !galleryImages.length) return;

    const src = galleryImages[galleryIndex];
    lightboxImg.src = src;
    lightboxImg.alt = galleryTitle + " — фото " + (galleryIndex + 1);
    lightboxImg.style.objectFit = "contain";
    lightboxImg.style.objectPosition = "center";

    if (lightboxCounter) {
      lightboxCounter.textContent = galleryIndex + 1 + " / " + galleryImages.length;
    }

    if (lightboxPrev) {
      lightboxPrev.disabled = galleryImages.length <= 1;
    }
    if (lightboxNext) {
      lightboxNext.disabled = galleryImages.length <= 1;
    }
  }

  function openGallery(title, images) {
    if (!lightbox || !images.length) return;

    lastFocused = document.activeElement;
    galleryTitle = title || "";
    galleryImages = images.slice();
    galleryIndex = 0;

    if (lightboxCaption) {
      lightboxCaption.textContent = galleryTitle;
    }

    if (lightboxMedia) {
      lightboxMedia.classList.add("has-image");
      lightboxMedia.classList.remove("placeholder");
    }

    updateLightboxSlide();

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

    galleryImages = [];
    galleryIndex = 0;
    galleryTitle = "";

    if (lightboxImg) {
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
    }

    if (lightboxCounter) {
      lightboxCounter.textContent = "";
    }

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function showPrev() {
    if (galleryImages.length <= 1) return;
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxSlide();
  }

  function showNext() {
    if (galleryImages.length <= 1) return;
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    updateLightboxSlide();
  }

  function openPortfolioItem(item) {
    const title = item.getAttribute("data-title") || "";
    const images = parseImages(item.getAttribute("data-images"));
    if (!images.length) return;
    openGallery(title, images);
  }

  if (portfolio) {
    portfolio.addEventListener("click", function (event) {
      const item = event.target.closest(".portfolio-item");
      if (!item || !portfolio.contains(item)) return;
      openPortfolioItem(item);
    });

    portfolio.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      const item = event.target.closest(".portfolio-item");
      if (!item || event.target !== item) return;
      event.preventDefault();
      openPortfolioItem(item);
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target.closest("[data-close]")) {
        closeLightbox();
      }
    });
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", function (event) {
      event.stopPropagation();
      showPrev();
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", function (event) {
      event.stopPropagation();
      showNext();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (!lightbox || lightbox.hidden) {
      if (event.key === "Escape") closeLightbox();
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrev();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  });
})();

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const heroSection = document.querySelector(".hero");
const heroCopy = document.querySelector(".hero__copy");
const heroTitleLines = [...document.querySelectorAll(".hero__title-line")];
const heroTypeParagraph = document.querySelector(".hero__type-paragraph");
const caseTabs = [...document.querySelectorAll(".case-tab")];
const casePanels = [...document.querySelectorAll(".case-panel")];
const showcase = document.querySelector(".showcase");
const showcaseTrack = showcase?.querySelector(".showcase__track");
const showcaseCards = showcase ? [...showcase.querySelectorAll(".showcase-card")] : [];
const prevShowcase = showcase?.querySelector(".showcase__arrow--prev");
const nextShowcase = showcase?.querySelector(".showcase__arrow--next");
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const contactForm = document.querySelector("#contact-form");
const contactFormNote = contactForm?.querySelector(".contact-form__note");
const contactFormSubmit = contactForm?.querySelector('button[type="submit"]');
const contactFormFrame = document.querySelector("#google-form-response");

let showcaseIndex = 0;
let showcaseTimer = null;
let dragStartX = 0;
let dragStartY = 0;
let dragDeltaX = 0;
let isDraggingShowcase = false;
let isContactFormSubmitting = false;
let contactFormResetTimer = null;
let contactFormFallbackTimer = null;

const contactFormDefaultNote = contactFormNote?.innerHTML || "";

const setHeaderState = () => {
  if (!header) {
    return;
  }

  const currentScrollY = window.scrollY;

  header.classList.toggle("is-scrolled", currentScrollY > 12);
  header.classList.remove("is-hidden");
};

const toggleNav = () => {
  const isOpen = navToggle?.getAttribute("aria-expanded") === "true";
  navToggle?.setAttribute("aria-expanded", String(!isOpen));
  header?.classList.toggle("is-open", !isOpen);
  header?.classList.remove("is-hidden");
};

const closeNav = () => {
  navToggle?.setAttribute("aria-expanded", "false");
  header?.classList.remove("is-open");
  header?.classList.remove("is-hidden");
};

const setActiveCase = (target) => {
  caseTabs.forEach((tab) => {
    const isActive = tab.dataset.caseTarget === target;
    tab.classList.toggle("is-active", isActive);
  });

  casePanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.casePanel === target);
  });
};

const setShowcaseState = (index) => {
  showcaseIndex = (index + showcaseCards.length) % showcaseCards.length;

  showcaseCards.forEach((card, cardIndex) => {
    card.classList.remove("is-active", "is-prev", "is-next");

    if (cardIndex === showcaseIndex) {
      card.classList.add("is-active");
      return;
    }

    if (cardIndex === (showcaseIndex - 1 + showcaseCards.length) % showcaseCards.length) {
      card.classList.add("is-prev");
      return;
    }

    if (cardIndex === (showcaseIndex + 1) % showcaseCards.length) {
      card.classList.add("is-next");
    }
  });
};

const updateShowcaseHeight = () => {
  if (!showcase || !showcaseCards.length) {
    return;
  }

  const topOffset = 82;
  const compactViewport = window.matchMedia("(max-width: 860px)").matches;
  const extraSpace = compactViewport ? 140 : 40;
  const tallestCard = showcaseCards.reduce((maxHeight, card) => {
    return Math.max(maxHeight, card.offsetHeight);
  }, 0);

  const targetHeight = Math.max(
    compactViewport ? 680 : 520,
    Math.ceil(topOffset + tallestCard + extraSpace)
  );

  showcase.style.minHeight = `${targetHeight}px`;
};

const restartShowcaseTimer = () => {
  if (!showcaseCards.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  window.clearInterval(showcaseTimer);
  showcaseTimer = window.setInterval(() => {
    setShowcaseState(showcaseIndex + 1);
  }, 4200);
};

const stopShowcaseTimer = () => {
  window.clearInterval(showcaseTimer);
};

const beginShowcaseDrag = (clientX, clientY) => {
  dragStartX = clientX;
  dragStartY = clientY;
  dragDeltaX = 0;
  isDraggingShowcase = true;
  showcase?.classList.add("is-dragging");
  stopShowcaseTimer();
};

const handleShowcasePointerDown = (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  if (event.target instanceof Element && event.target.closest(".showcase-card__body")) {
    return;
  }

  beginShowcaseDrag(event.clientX, event.clientY);
  showcaseTrack?.setPointerCapture?.(event.pointerId);
};

const handleShowcaseTouchStart = (event) => {
  const touch = event.touches?.[0];

  if (!touch) {
    return;
  }

  if (event.target instanceof Element && event.target.closest(".showcase-card__body")) {
    return;
  }

  beginShowcaseDrag(touch.clientX, touch.clientY);
};

const updateShowcaseDrag = (clientX) => {
  dragDeltaX = clientX - dragStartX;
};

const finishShowcaseDrag = (clientX, clientY) => {
  if (!isDraggingShowcase) {
    return;
  }

  const deltaX = clientX - dragStartX;
  const deltaY = clientY - dragStartY;

  if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX < 0) {
      setShowcaseState(showcaseIndex + 1);
    } else {
      setShowcaseState(showcaseIndex - 1);
    }
  }

  showcase?.classList.remove("is-dragging");
  isDraggingShowcase = false;
  restartShowcaseTimer();
};

const handleShowcasePointerMove = (event) => {
  if (!isDraggingShowcase) {
    return;
  }

  updateShowcaseDrag(event.clientX);
};

const handleShowcasePointerUp = (event) => {
  finishShowcaseDrag(event.clientX, event.clientY);
};

const handleShowcasePointerCancel = () => {
  if (!isDraggingShowcase) {
    return;
  }

  showcase?.classList.remove("is-dragging");
  isDraggingShowcase = false;
  restartShowcaseTimer();
};

const handleShowcaseTouchMove = (event) => {
  const touch = event.touches?.[0];

  if (!touch || !isDraggingShowcase) {
    return;
  }

  updateShowcaseDrag(touch.clientX);
};

const handleShowcaseTouchEnd = (event) => {
  const touch = event.changedTouches?.[0];

  if (!touch) {
    return;
  }

  finishShowcaseDrag(touch.clientX, touch.clientY);
};

const sleep = (ms) => new Promise((resolve) => {
  window.setTimeout(resolve, ms);
});

const reserveHeroTypingSpace = () => {
  const heroTypingElements = [...heroTitleLines, heroTypeParagraph].filter(Boolean);

  heroTypingElements.forEach((element) => {
    const finalText = element.dataset.text || element.textContent || "";
    const previousText = element.textContent;

    element.textContent = finalText;

    const measuredHeight = Math.ceil(element.getBoundingClientRect().height);

    if (measuredHeight > 0) {
      element.style.minHeight = `${measuredHeight}px`;
    }

    element.textContent = previousText;
  });
};

const typeIntoElement = async (element, text, delay = 34) => {
  if (!element) {
    return;
  }

  element.textContent = "";
  element.classList.add("is-typing");

  for (let index = 0; index <= text.length; index += 1) {
    element.textContent = text.slice(0, index);
    await sleep(index === 0 ? 160 : delay);
  }

  element.classList.remove("is-typing");
};

const setupHeroTyping = async () => {
  if (!heroTitleLines.length) {
    return;
  }

  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (_error) {
      // Continue with typing even if font readiness cannot be resolved.
    }
  }

  reserveHeroTypingSpace();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroCopy?.classList.add("is-typing-ready");
    heroTitleLines.forEach((line) => {
      line.textContent = line.dataset.text || line.textContent;
    });
    if (heroTypeParagraph) {
      heroTypeParagraph.textContent = heroTypeParagraph.dataset.text || heroTypeParagraph.textContent;
    }
    return;
  }

  heroCopy?.classList.add("is-typing-ready");

  for (const line of heroTitleLines) {
    const text = line.dataset.text || "";
    await typeIntoElement(line, text, 30);
    await sleep(120);
  }

  if (heroTypeParagraph) {
    const paragraphText = heroTypeParagraph.dataset.text || heroTypeParagraph.textContent;
    await typeIntoElement(heroTypeParagraph, paragraphText, 18);
  }
};

const setupRevealAnimations = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const item = entry.target;
        const isVisible = item.classList.contains("is-visible");
        const ratio = entry.intersectionRatio;

        if (!isVisible && entry.isIntersecting && ratio > 0.18) {
          item.classList.add("is-visible");
          return;
        }

        if (isVisible && (!entry.isIntersecting || ratio < 0.04)) {
          item.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: [0, 0.04, 0.18, 0.32, 0.5],
      rootMargin: "0px 0px -6% 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
};

const updateContactFormNote = (state, markup) => {
  if (!contactFormNote) {
    return;
  }

  contactFormNote.classList.remove("is-pending", "is-success", "is-error");

  if (state) {
    contactFormNote.classList.add(`is-${state}`);
  }

  contactFormNote.innerHTML = markup;
};

const resetContactFormNote = () => {
  window.clearTimeout(contactFormResetTimer);
  updateContactFormNote("", contactFormDefaultNote);
};

const finishContactFormSubmission = () => {
  if (!contactForm || !isContactFormSubmitting) {
    return;
  }

  isContactFormSubmitting = false;
  window.clearTimeout(contactFormFallbackTimer);

  contactForm.classList.remove("is-submitting");

  if (contactFormSubmit) {
    contactFormSubmit.disabled = false;
  }

  contactForm.reset();
  updateContactFormNote(
    "success",
    'Thanks. Your details were saved to our Google Form responses. <a href="https://docs.google.com/forms/d/e/1FAIpQLSe0sI3rWC5Ps2SN5pcJh52KucSnubSz2Xy3E0TEglMyw4T5xg/viewform?usp=publish-editor" target="_blank" rel="noreferrer">View the published form</a>.'
  );

  contactFormResetTimer = window.setTimeout(resetContactFormNote, 5200);
};

const setupContactForm = () => {
  if (!contactForm) {
    return;
  }

  contactForm.addEventListener("submit", () => {
    resetContactFormNote();
    isContactFormSubmitting = true;
    contactForm.classList.add("is-submitting");

    if (contactFormSubmit) {
      contactFormSubmit.disabled = true;
    }

    updateContactFormNote("pending", "Saving your details to our Google Form responses...");

    window.clearTimeout(contactFormFallbackTimer);
    contactFormFallbackTimer = window.setTimeout(() => {
      finishContactFormSubmission();
    }, 4500);
  });

  contactFormFrame?.addEventListener("load", () => {
    finishContactFormSubmission();
  });
};

const init = () => {
  heroSection?.classList.add("is-visible");
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  navToggle?.addEventListener("click", toggleNav);

  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeNav();
    }
  });

  caseTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveCase(tab.dataset.caseTarget);
    });
  });

  if (showcaseCards.length) {
    setShowcaseState(0);
    updateShowcaseHeight();
    restartShowcaseTimer();

    prevShowcase?.addEventListener("click", () => {
      setShowcaseState(showcaseIndex - 1);
      updateShowcaseHeight();
      restartShowcaseTimer();
    });

    nextShowcase?.addEventListener("click", () => {
      setShowcaseState(showcaseIndex + 1);
      updateShowcaseHeight();
      restartShowcaseTimer();
    });

    showcase?.addEventListener("mouseenter", stopShowcaseTimer);
    showcase?.addEventListener("mouseleave", restartShowcaseTimer);
    showcaseTrack?.addEventListener("pointerdown", handleShowcasePointerDown);
    showcaseTrack?.addEventListener("pointermove", handleShowcasePointerMove);
    showcaseTrack?.addEventListener("pointerup", handleShowcasePointerUp);
    showcaseTrack?.addEventListener("pointercancel", handleShowcasePointerCancel);
    showcaseTrack?.addEventListener("touchstart", handleShowcaseTouchStart, { passive: true });
    showcaseTrack?.addEventListener("touchmove", handleShowcaseTouchMove, { passive: true });
    showcaseTrack?.addEventListener("touchend", handleShowcaseTouchEnd, { passive: true });

    showcaseCards.forEach((card) => {
      card.querySelectorAll("img").forEach((image) => {
        if (!image.complete) {
          image.addEventListener("load", updateShowcaseHeight, { once: true });
        }
      });
    });

    window.addEventListener("resize", updateShowcaseHeight, { passive: true });
    window.addEventListener("load", updateShowcaseHeight, { once: true });
  }

  setupRevealAnimations();
  setupHeroTyping();
  setupContactForm();
};

init();

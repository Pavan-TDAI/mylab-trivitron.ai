const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const heroSection = document.querySelector(".hero");
const heroCopy = document.querySelector(".hero__copy");
const heroTitleLines = [...document.querySelectorAll(".hero__title-line")];
const heroTypeParagraph = document.querySelector(".hero__type-paragraph");
const caseTabs = [...document.querySelectorAll(".case-tab")];
const casePanels = [...document.querySelectorAll(".case-panel")];
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const leadershipCarousel = document.querySelector("[data-leadership-carousel]");
const contactForm = document.querySelector("#contact-form");
const contactFormNote = contactForm?.querySelector(".contact-form__note");
const contactFormSubmit = contactForm?.querySelector('button[type="submit"]');
const contactFormFrame = document.querySelector("#google-form-response");

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

const setupLeadershipCarousel = () => {
  if (!leadershipCarousel) {
    return;
  }

  const track = leadershipCarousel.querySelector("[data-carousel-track]");
  const prevButton = leadershipCarousel.querySelector("[data-carousel-prev]");
  const nextButton = leadershipCarousel.querySelector("[data-carousel-next]");
  const originalCards = [...(track?.children || [])].map((card) => card.cloneNode(true));

  if (!track || originalCards.length < 2) {
    prevButton?.setAttribute("hidden", "");
    nextButton?.setAttribute("hidden", "");
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let currentIndex = 0;
  let visibleCards = 4;
  let stepSize = 0;
  let isAnimating = false;
  let autoplayTimer = null;

  const getVisibleCards = () => {
    if (window.innerWidth <= 640) {
      return 1;
    }

    if (window.innerWidth <= 860) {
      return 2;
    }

    if (window.innerWidth <= 980) {
      return 3;
    }

    return 4;
  };

  const getStepSize = () => {
    const firstCard = track.children[0];

    if (!firstCard) {
      return 0;
    }

    const cardWidth = firstCard.getBoundingClientRect().width;
    const computed = window.getComputedStyle(track);
    const gap = parseFloat(computed.columnGap || computed.gap || "0") || 0;

    return cardWidth + gap;
  };

  const applyTrackTransform = (index) => {
    track.style.transform = `translate3d(${-index * stepSize}px, 0, 0)`;
  };

  const setTrackPosition = (index, animated) => {
    if (animated) {
      track.classList.remove("is-jump-reset");
      applyTrackTransform(index);
      return;
    }

    track.classList.add("is-jump-reset");
    applyTrackTransform(index);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        track.classList.remove("is-jump-reset");
      });
    });
  };

  const updateButtons = () => {
    const disableArrows = originalCards.length <= visibleCards;

    if (prevButton) {
      prevButton.disabled = disableArrows;
    }

    if (nextButton) {
      nextButton.disabled = disableArrows;
    }
  };

  const rebuildTrack = () => {
    visibleCards = Math.min(getVisibleCards(), originalCards.length);
    track.innerHTML = "";

    if (originalCards.length <= visibleCards) {
      originalCards.forEach((card) => {
        track.appendChild(card.cloneNode(true));
      });
      currentIndex = 0;
      stepSize = getStepSize();
      setTrackPosition(currentIndex, false);
      updateButtons();
      return;
    }

    const prefix = originalCards.slice(-visibleCards).map((card) => card.cloneNode(true));
    const suffix = originalCards.slice(0, visibleCards).map((card) => card.cloneNode(true));

    [...prefix, ...originalCards.map((card) => card.cloneNode(true)), ...suffix].forEach((card) => {
      track.appendChild(card);
    });

    currentIndex = visibleCards;
    stepSize = getStepSize();
    setTrackPosition(currentIndex, false);
    updateButtons();
  };

  const goToNext = () => {
    if (isAnimating || originalCards.length <= visibleCards) {
      return;
    }

    isAnimating = true;
    currentIndex += 1;
    setTrackPosition(currentIndex, true);
  };

  const goToPrevious = () => {
    if (isAnimating || originalCards.length <= visibleCards) {
      return;
    }

    isAnimating = true;
    currentIndex -= 1;
    setTrackPosition(currentIndex, true);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();

    if (prefersReducedMotion || originalCards.length <= visibleCards) {
      return;
    }

    autoplayTimer = window.setInterval(() => {
      goToNext();
    }, 3200);
  };

  prevButton?.addEventListener("click", () => {
    goToPrevious();
    startAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    goToNext();
    startAutoplay();
  });

  track.addEventListener("transitionend", (event) => {
    if (event.propertyName !== "transform") {
      return;
    }

    if (originalCards.length <= visibleCards) {
      isAnimating = false;
      return;
    }

    const firstRealIndex = visibleCards;
    const lastRealIndex = visibleCards + originalCards.length - 1;
    const afterLastCloneIndex = visibleCards + originalCards.length;

    if (currentIndex >= afterLastCloneIndex) {
      currentIndex = firstRealIndex;
      setTrackPosition(currentIndex, false);
    } else if (currentIndex < firstRealIndex) {
      currentIndex = lastRealIndex;
      setTrackPosition(currentIndex, false);
    }

    isAnimating = false;
  });

  let touchStartX = 0;
  let touchDeltaX = 0;

  track.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
    touchDeltaX = 0;
    stopAutoplay();
  }, { passive: true });

  track.addEventListener("touchmove", (event) => {
    const currentX = event.touches[0]?.clientX || 0;
    touchDeltaX = currentX - touchStartX;
  }, { passive: true });

  track.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaX) > 34) {
      if (touchDeltaX < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    startAutoplay();
  });

  leadershipCarousel.addEventListener("mouseenter", stopAutoplay);
  leadershipCarousel.addEventListener("mouseleave", startAutoplay);
  leadershipCarousel.addEventListener("focusin", stopAutoplay);
  leadershipCarousel.addEventListener("focusout", () => {
    if (!leadershipCarousel.contains(document.activeElement)) {
      startAutoplay();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
      return;
    }

    startAutoplay();
  });

  window.addEventListener("resize", () => {
    stopAutoplay();
    isAnimating = false;
    rebuildTrack();
    startAutoplay();
  }, { passive: true });

  rebuildTrack();
  startAutoplay();
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

  setupRevealAnimations();
  setupHeroTyping();
  setupLeadershipCarousel();
  setupContactForm();
};

init();

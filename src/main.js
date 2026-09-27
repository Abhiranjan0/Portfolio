const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const menuToggle = document.querySelector("#menu-toggle");
const navigation = document.querySelector("#main-nav");
const navigationLinks = [...navigation.querySelectorAll("a")];
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

root.classList.add("js");

function syncThemeButton() {
  const dark = root.dataset.theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeToggle.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
  themeToggle.title = `Switch to ${dark ? "light" : "dark"} mode`;
  document.querySelector('meta[name="theme-color"]').content = dark ? "#10110f" : "#f6f5f0";
}

syncThemeButton();

themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  syncThemeButton();
  try {
    localStorage.setItem("ar-portfolio-theme", root.dataset.theme);
  } catch (error) {
    console.warn("The theme changed, but this browser could not save the preference.", error);
  }
});

function closeMenu({ restoreFocus = false } = {}) {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("is-open");
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  navigation.classList.toggle("is-open", open);
  if (open) navigationLinks[0].focus();
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".header-inner")) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeMenu({ restoreFocus: true });
  }
});

document.addEventListener("focusin", (event) => {
  if (!event.target.closest(".header-inner")) closeMenu();
});

window.matchMedia("(min-width: 1001px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const motionToggle = document.querySelector("#motion-toggle");
let motionPaused = false;

function syncMotion() {
  const paused = motionPaused || motionPreference.matches;
  root.dataset.motion = paused ? "paused" : "full";
  motionToggle.disabled = motionPreference.matches;
  motionToggle.setAttribute("aria-pressed", String(paused));
  motionToggle.setAttribute("aria-label", motionPreference.matches ? "Reduced motion is enabled in your system settings" : `${paused ? "Resume" : "Pause"} decorative motion`);
  motionToggle.querySelector("span").textContent = motionPreference.matches ? "Reduced motion" : `${paused ? "Resume" : "Pause"} motion`;
  motionToggle.querySelector("use").setAttribute("href", paused ? "#i-play" : "#i-pause");
  if (paused) {
    document.querySelectorAll("[data-pointer-active]").forEach((element) => {
      element.removeAttribute("data-pointer-active");
      element.style.removeProperty("--pointer-x");
      element.style.removeProperty("--pointer-y");
    });
  }
}

motionToggle.addEventListener("click", () => {
  motionPaused = !motionPaused;
  syncMotion();
});
syncMotion();

const systemVisual = document.querySelector(".system-visual");
const focusChoices = [...systemVisual.querySelectorAll("[data-focus]")];
const focusTitle = document.querySelector("#focus-title");
const focusDescription = document.querySelector("#focus-description");
const focusIndex = document.querySelector("#focus-index");
const focusCoreLabel = document.querySelector("#focus-core-label");

focusChoices.forEach((button) => {
  button.disabled = false;
  button.addEventListener("click", () => {
    focusChoices.forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
    systemVisual.dataset.focus = button.dataset.focus;
    focusTitle.textContent = button.dataset.focusTitle;
    focusDescription.textContent = button.dataset.focusDescription;
    focusIndex.textContent = button.dataset.focusIndex;
    focusCoreLabel.textContent = button.dataset.focusCore;
  });
});

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
document.querySelectorAll(".system-visual, .project-card, .toolkit-card, .credential-card").forEach((surface) => {
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  surface.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || event.pointerType !== "mouse" || root.dataset.motion === "paused") return;
    const bounds = surface.getBoundingClientRect();
    pointerX = event.clientX - bounds.left;
    pointerY = event.clientY - bounds.top;
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(() => {
      pointerFrame = 0;
      if (root.dataset.motion === "paused") return;
      surface.setAttribute("data-pointer-active", "");
      surface.style.setProperty("--pointer-x", `${pointerX}px`);
      surface.style.setProperty("--pointer-y", `${pointerY}px`);
    });
  });
  surface.addEventListener("pointerleave", () => {
    window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    surface.removeAttribute("data-pointer-active");
    surface.style.removeProperty("--pointer-x");
    surface.style.removeProperty("--pointer-y");
  });
});

const filters = [...document.querySelectorAll("[data-filter]")];
const projectCards = [...document.querySelectorAll(".project-card")];
const filterStatus = document.querySelector("#filter-status");

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    filters.forEach((filter) => filter.setAttribute("aria-pressed", String(filter === button)));
    let count = 0;
    projectCards.forEach((card) => {
      card.hidden = category !== "all" && card.dataset.category !== category;
      if (!card.hidden) {
        count += 1;
        card.classList.add("is-visible");
      }
    });
    filterStatus.textContent = `Showing ${count} ${count === 1 ? "project" : "projects"}`;
    syncScrollState();
  });
});

const dialog = document.querySelector("#project-dialog");
const dialogTitle = document.querySelector("#project-dialog-title");
const dialogContent = document.querySelector("#project-dialog-content");
let dialogOpener;

document.querySelectorAll(".project-open").forEach((button) => {
  button.addEventListener("click", () => {
    const template = document.getElementById(button.dataset.project);
    if (!(template instanceof HTMLTemplateElement)) {
      console.error("Project details are missing for:", button.dataset.project);
      filterStatus.textContent = "These project details could not be opened. Please use the contact link to get in touch.";
      return;
    }
    dialogOpener = button;
    dialogTitle.textContent = template.dataset.title;
    dialogContent.replaceChildren(template.content.cloneNode(true));
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add("dialog-open");
  });
});

dialog.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});

dialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const first = dialog.querySelector("[data-close-dialog]");
  const last = dialog.querySelector(".dialog-back");
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
    dialog.close();
  }
});

dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  dialogOpener?.focus({ preventScroll: true });
});

const copyEmail = document.querySelector("#copy-email");
const copyStatus = document.querySelector("#copy-status");
const email = document.querySelector(".contact-email").getAttribute("href").replace("mailto:", "");
let copyReset;

copyEmail.addEventListener("click", async () => {
  clearTimeout(copyReset);
  copyEmail.disabled = true;
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard access requires a supported browser and a secure context.");
    }
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = "Email copied. Let's make something good.";
    copyEmail.classList.add("is-copied");
    copyEmail.setAttribute("aria-label", "Email copied");
    copyReset = window.setTimeout(() => {
      copyStatus.textContent = "";
      copyEmail.classList.remove("is-copied");
      copyEmail.setAttribute("aria-label", "Copy email address");
    }, 4000);
  } catch (error) {
    console.warn("Could not copy the email address.", error);
    copyStatus.textContent = "Couldn't copy automatically. Select the email address to copy it, or click it to send a message.";
    copyEmail.classList.remove("is-copied");
    copyEmail.setAttribute("aria-label", "Copy email address");
  } finally {
    copyEmail.disabled = false;
  }
});

const revealElements = [...document.querySelectorAll("[data-reveal]")];
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

if (!motionPreference.matches) {
  revealElements.forEach((element) => {
    element.classList.add("will-reveal");
    revealObserver.observe(element);
  });
}

motionPreference.addEventListener("change", (event) => {
  syncMotion();
  if (event.matches) {
    revealObserver.disconnect();
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }
});

const sections = [...document.querySelectorAll("main section[id]")];
const backToTop = document.querySelector("#back-to-top");
const readingProgress = document.querySelector("#reading-progress");
let scrollQueued = false;

function syncScrollState() {
  let currentId = "";
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 180) currentId = section.id;
  }
  navigationLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${currentId}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  backToTop.hidden = window.scrollY < 700;
  const scrollableHeight = root.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0;
  readingProgress.style.transform = `scaleX(${progress})`;
  scrollQueued = false;
}

window.addEventListener("scroll", () => {
  if (!scrollQueued) {
    scrollQueued = true;
    window.requestAnimationFrame(syncScrollState);
  }
}, { passive: true });

window.addEventListener("resize", syncScrollState);
syncScrollState();
document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

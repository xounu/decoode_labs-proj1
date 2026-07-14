  /* ═══════════════════════════ CONFIG ═══════════════════════════ */

const API_BASE_URL = "http://localhost:3000";

/* ═══════════════════════════ MOBILE NAV TOGGLE ═══════════════════════════ */

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("show");
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.classList.toggle("open", isOpen);
  });

  // Close the mobile menu whenever a nav link is tapped
  navLinks.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.classList.remove("open");
    });
  });
}

/* ═══════════════════════════ NAVBAR SCROLL STATE ═══════════════════════════ */

const navbar = document.getElementById("navbar");

if (navbar) {
  const updateNavbarShadow = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
  };
  updateNavbarShadow();
  window.addEventListener("scroll", updateNavbarShadow, { passive: true });
}

/* ═══════════════════════════ ACTIVE LINK ON SCROLL ═══════════════════════════ */

const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-link");

if (sections.length && navAnchors.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navAnchors.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

/* ═══════════════════════════ CONTACT FORM SUBMISSION ═══════════════════════════ */

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

function setStatus(message, type) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.dataset.state = type; // "success" | "error" | "loading"
}

function validateContactForm(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Please enter your name.");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailPattern.test(data.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push("Message should be at least 10 characters.");
  }

  return errors;
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const payload = {
      name: formData.get("name")?.toString().trim(),
      email: formData.get("email")?.toString().trim(),
      message: formData.get("message")?.toString().trim(),
    };

    const errors = validateContactForm(payload);
    if (errors.length) {
      setStatus(errors[0], "error");
      return;
    }

    const submitBtn = contactForm.querySelector(".form-submit");
    submitBtn.disabled = true;
    setStatus("Sending your message…", "loading");

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong. Please try again.");
      }

      setStatus("Thanks! Your message has been sent — we'll be in touch soon.", "success");
      contactForm.reset();
    } catch (err) {
      setStatus(err.message || "Couldn't send your message. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}
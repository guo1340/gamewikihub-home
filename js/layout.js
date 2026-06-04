(() => {
  window.__gwhLayoutStarted = true;
  const root = document.documentElement;
  const section = document.body.dataset.section || "";

  const revealPage = () => {
    root.classList.remove("layout-loading");
    root.classList.add("layout-ready");
    const loader = document.querySelector(".site-loader");
    if (loader) loader.setAttribute("aria-hidden", "true");
  };

  const markActive = () => {
    document.querySelectorAll("[data-section-link]").forEach((link) => {
      link.classList.toggle("active", link.dataset.sectionLink === section);
    });
  };

  const loadInclude = async (placeholder) => {
    const url = placeholder.dataset.include;
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Failed to load include: ${url}`);
    const html = await response.text();
    const range = document.createRange();
    range.selectNode(placeholder);
    const fragment = range.createContextualFragment(html);
    placeholder.replaceWith(fragment);
  };

  const waitForWindowLoad = () => {
    if (document.readyState === "complete") return Promise.resolve();
    return new Promise((resolve) => {
      window.addEventListener("load", resolve, { once: true });
    });
  };

  const waitForFonts = () => {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();
    return document.fonts.ready.catch(() => {});
  };

  const waitForNextPaint = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

  const includes = [...document.querySelectorAll("[data-include]")];
  window.__gwhLayoutReady = Promise.all(includes.map(loadInclude))
    .then(() => Promise.all([waitForWindowLoad(), waitForFonts()]))
    .then(() => waitForNextPaint())
    .then(() => {
      markActive();
      revealPage();
    })
    .catch((error) => {
      console.error(error);
      root.classList.add("layout-include-error");
      revealPage();
    });
})();

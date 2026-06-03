(() => {
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

  const includes = [...document.querySelectorAll("[data-include]")];
  window.__gwhLayoutReady = Promise.all(includes.map(loadInclude))
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

(() => {
  const section = document.body.dataset.section || "";

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
    .then(() => markActive())
    .catch((error) => {
      console.error(error);
      document.documentElement.classList.add("layout-include-error");
    });
})();

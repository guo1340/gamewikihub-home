(() => {
  const productionHosts = new Set(["gamewikihub.com", "www.gamewikihub.com"]);
  const adsDisabled =
    !productionHosts.has(location.hostname) || location.search.includes("noads=1");

  if (adsDisabled) {
    document.documentElement.classList.add("ads-disabled");
    return;
  }

  const loadAdsense = () =>
    new Promise((resolve, reject) => {
      if (document.querySelector("script[data-adsense-loader]")) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.adsenseLoader = "true";
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1319817671788428";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

  const requestAd = (slot) => {
    if (slot.dataset.adsRequested === "true") return;
    slot.dataset.adsRequested = "true";
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setTimeout(() => {
        if (slot.dataset.adStatus === "unfilled") {
          slot.closest(".promo-frame")?.classList.add("promo-empty");
        }
      }, 2500);
    } catch {
      slot.dataset.adsRequested = "false";
    }
  };

  window.addEventListener("load", async () => {
    const slots = [...document.querySelectorAll("ins.adsbygoogle")];
    if (!slots.length) return;

    try {
      await loadAdsense();
    } catch {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      requestAd(slots[0]);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          requestAd(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "400px 0px" }
    );

    slots.forEach((slot) => observer.observe(slot));
  });
})();

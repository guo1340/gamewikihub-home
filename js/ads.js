(() => {
  // Idempotency guard — never initialize twice (script double-include,
  // bfcache restore, etc.). Re-running the loader is a common source of
  // duplicate ad requests and runaway memory growth.
  if (window.__gwhAdsInit) return;
  window.__gwhAdsInit = true;

  const productionHosts = new Set(["gamewikihub.com", "www.gamewikihub.com"]);
  const adsAllowedPath =
    location.pathname === "/" || location.pathname.endsWith("/index.html");
  const adsDisabled =
    !productionHosts.has(location.hostname) ||
    !adsAllowedPath ||
    location.search.includes("noads=1");

  if (adsDisabled) {
    document.documentElement.classList.add("ads-disabled");
    return;
  }

  const ADSENSE_SRC =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1319817671788428";

  // Load the AdSense library exactly once. The promise is memoized so
  // concurrent callers share a single <script> insertion.
  let scriptPromise = null;
  const loadAdsense = () => {
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve, reject) => {
      if (document.querySelector("script[data-adsense-loader]")) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.adsenseLoader = "true";
      script.src = ADSENSE_SRC;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("adsbygoogle.js failed to load"));
      document.head.appendChild(script);
    });
    return scriptPromise;
  };

  // A slot is only safe to fill once it is actually laid out with a
  // non-zero width. Pushing a hidden or zero-width <ins> makes AdSense
  // retry indefinitely ("availableWidth=0"), which is a known cause of
  // Chrome tabs growing until they run out of memory.
  const slotIsRenderable = (slot) => {
    if (slot.dataset.adsRequested === "true") return false;
    if (slot.offsetParent === null) return false; // display:none ancestor
    return slot.getBoundingClientRect().width > 0;
  };

  const requestAd = (slot) => {
    if (!slotIsRenderable(slot)) return false;
    slot.dataset.adsRequested = "true";
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      return true;
    } catch {
      // Allow a later retry if the push itself threw.
      slot.dataset.adsRequested = "false";
      return false;
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

    // Lazy-load: only request an ad slot as it nears the viewport, and
    // stop observing it immediately after so it is never requested twice.
    // A modest rootMargin keeps the number of ad iframes loading at once
    // low, reducing peak memory use.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          requestAd(entry.target);
        });
      },
      { rootMargin: "200px 0px" }
    );

    slots.forEach((slot) => observer.observe(slot));
  });
})();

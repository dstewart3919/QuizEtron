// ad.js - Quizetron Ad Manager (Stable Version)

(function () {
  // Load AdSense once
  if (!window.adsbygoogle) {
    const script = document.createElement("script");
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"; // Replace with real client ID after approval
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }

  // Insert ad after DOM is stable
  window.insertAd = function (containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Ad container '${containerId}' not found.`);
      return;
    }

    const ad = document.createElement("ins");
    ad.className = "adsbygoogle";
    ad.style.display = "block";
    ad.style.width = options.width || "300px";
    ad.style.height = options.height || "150px";
    ad.setAttribute("data-ad-client", "ca-pub-XXXXXXXXXXXXXXXX"); // TODO: Real ID
    ad.setAttribute("data-ad-slot", options.slot || "XXXXXXXXXX"); // TODO: Real slot
    //ad.setAttribute('data-ad-format', 'auto');
    ad.setAttribute("data-full-width-responsive", "true");

    container.innerHTML = ""; // clear placeholder
    container.appendChild(ad);

    setTimeout(() => {
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    }, 100); // Delay slightly to allow DOM settle
  };
})();

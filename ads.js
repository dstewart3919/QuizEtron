// ad.js - Quizetron Ad Manager (Stable Version)

(function() {
  // Load AdSense once
  if (!window.adsbygoogle) {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9207133906210344';
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }

  // Insert ad after DOM is stable
  window.insertAd = function(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Ad container '${containerId}' not found.`);
      return;
    }

    const ad = document.createElement('ins');
    ad.className = 'adsbygoogle';
    ad.style.display = 'block';
    ad.style.width = options.width || '300px';
    ad.style.height = options.height || '150px';
    ad.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX'); // TODO: Real ID
    ad.setAttribute('data-ad-slot', options.slot || 'XXXXXXXXXX'); // TODO: Real slot
    //ad.setAttribute('data-ad-format', 'auto');
    ad.setAttribute('data-full-width-responsive', 'true');

    container.innerHTML = ''; // clear placeholder
    container.appendChild(ad);

    setTimeout(() => {
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense push error:', e);
      }
    }, 100); // Delay slightly to allow DOM settle
  };

  // Fullscreen video ad support
  window.showFullscreenAd = function(videoOptions = {}) {
    if (document.getElementById('fullscreenAdOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'fullscreenAdOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    const video = document.createElement('video');
    video.src = videoOptions.src || 'your-default-ad-video.mp4'; // Replace
    video.style.maxWidth = '90%';
    video.style.maxHeight = '80%';
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    const closeBtn = document.createElement('button');
    closeBtn.innerText = videoOptions.closeText || 'Close Ad';
    closeBtn.style.marginTop = '20px';
    closeBtn.style.padding = '10px 20px';
    closeBtn.style.backgroundColor = '#444';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.cursor = 'pointer';

    closeBtn.onclick = function() {
      document.body.removeChild(overlay);
      if (typeof videoOptions.onClose === 'function') {
        videoOptions.onClose();
      }
    };

    overlay.appendChild(video);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
  };

})();

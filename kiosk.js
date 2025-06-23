document.addEventListener('DOMContentLoaded', () => {

  document.body.addEventListener('click', function (e) {
    const playButton = e.target.closest('button[data-plyr="play"]');
    if (!playButton) return;

    // Elterncontainer finden
    const videoWrapper = playButton.closest('.video__video-wrapper-inner');
    if (!videoWrapper) return;

    // iframe finden
    const iframe = videoWrapper.querySelector('iframe[src*="youtube.com/embed"]');
    if (!iframe) return;

    // Nur einmal anpassen
    if (iframe.dataset.patched === "true") return;

    const srcUrl = new URL(iframe.src, window.location.origin);
    const params = srcUrl.searchParams;

    // Parameter setzen
    params.set('modestbranding', '1');
    params.set('controls', '0');
    params.set('rel', '0');
    params.set('showinfo', '0');
    params.set('cc_load_policy', '1');

    // Neue src setzen
    iframe.src = srcUrl.origin + srcUrl.pathname + '?' + params.toString();

    // Fullscreen deaktivieren
    iframe.removeAttribute('allowfullscreen');

    // Markieren, dass das iframe bereits gepatcht wurde
    iframe.dataset.patched = "true";
  });

  function removeCHashFromLinks() {
    const links = document.querySelectorAll('a.btn--language');

    links.forEach(link => {
      const url = new URL(link.href, window.location.origin);
      url.searchParams.delete('cHash');
      link.href = url.pathname + url.search;
    });
  }

  function updateLinks(root = document) {
    root.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');

      try {
        const url = new URL(href, document.baseURI);

        if (!url.searchParams.has('kiosk')) {
          url.searchParams.set('kiosk', 'true');
          link.setAttribute('href', url.toString());
        }

        if (!link.dataset.kioskHandled) {
          link.addEventListener('click', event => {
            try {
              const targetUrl = new URL(link.getAttribute('href'), document.baseURI);

              if (!targetUrl.searchParams.has('kiosk')) {
                event.preventDefault();
                targetUrl.searchParams.set('kiosk', 'true');
                window.location.href = targetUrl.toString();
              }
            } catch (e) {
              console.warn('Ungültige URL im Link:', href);
            }
          });

          link.dataset.kioskHandled = 'true';
        }

      } catch (e) {
        // Ignoriere ungültige URLs
      }
    });
  }

  function makeRelatedContentItemsClickable(root = document) {
    const items = root.querySelectorAll('.related-content__item');

    items.forEach(item => {
      // Skip, wenn bereits behandelt
      if (item.dataset.clickHandled) return;

      const link = item.querySelector('a[href]');
      if (link) {
        const href = link.getAttribute('href');
        item.style.cursor = 'pointer';

        item.addEventListener('click', event => {
          // Verhindere doppelte Navigation, wenn direkt auf den Link geklickt wird
          if (event.target.closest('a')) return;
          window.location.href = href;
        });

        item.dataset.clickHandled = 'true';
      }
    });
  }

  function updatePageContent(root = document) {
    updateLinks(root);
    makeRelatedContentItemsClickable(root);
  }

  function updateLogoLinks() {
    const isEnglish = window.location.href.includes('/en/');
    const urlDe = 'https://www.helmholtz.de/ueber-uns/helmholtz-stories/?kiosk=true';
    const urlEn = 'https://www.helmholtz.de/en/about-us/helmholtz-stories/?kiosk=true';
    const newUrl = isEnglish ? urlEn : urlDe;

    const logoLinks = [
      document.querySelector('.header__logo a'),
      document.querySelector('.footer__logo')
    ];

    logoLinks.forEach(link => {
      if (link) {
        link.setAttribute('href', newUrl);
      }
    });
  }

  // Initial ausführen
  updateLogoLinks();
  updatePageContent();
  removeCHashFromLinks();

  // DOM-Änderungen beobachten (z. B. Lazy Loading)
  new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          updatePageContent(node);
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
});
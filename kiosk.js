document.addEventListener('DOMContentLoaded', () => {

  function updateYouTubeIframes(root = document) {
    root.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.getAttribute('src');
      if (!src || !src.includes('youtube.com')) return;

      try {
        const url = new URL(src);
        url.searchParams.set('cc_load_policy', '1');

        const lang = window.location.href.includes('/en/') ? 'en' : 'de';
        url.searchParams.set('cc_lang_pref', lang);

        const newSrc = url.toString();
        if (src !== newSrc) {
          iframe.setAttribute('src', newSrc);
        }
      } catch (e) {
        console.warn('Ungültige YouTube-URL:', src);
      }
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

    // Bestimmte Links deaktivieren
    root.querySelectorAll('.textmedia a, .hub-centers a').forEach(link => {
      link.addEventListener('click', e => e.preventDefault(), { once: true });
    });
  }

  function updatePageContent(root = document) {
    updateYouTubeIframes(root);
    updateLinks(root);
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
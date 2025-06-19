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
    updateYouTubeIframes(root);
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
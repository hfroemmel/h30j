document.addEventListener('DOMContentLoaded', function () {

  function updateYouTubeIframes(root = document) {
    const iframes = root.querySelectorAll('iframe');

    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src');

      if (src && src.includes('youtube.com')) {
        try {
          const url = new URL(src);
          url.searchParams.set('cc_load_policy', '1');

          const currentUrl = window.location.href;
          const lang = currentUrl.includes('/en/') ? 'en' : 'de';
          url.searchParams.set('cc_lang_pref', lang);

          const newSrc = url.toString();
          if (src !== newSrc) {
            iframe.setAttribute('src', newSrc);
          }
        } catch (e) {
          console.warn('Ungültige YouTube-URL:', src);
        }
      }
    });
  }

  function updateLinks(root = document) {
    const links = root.querySelectorAll('a[href]');

    links.forEach(link => {
      try {
        const href = link.getAttribute('href');
        const url = new URL(href, document.baseURI);

        if (!url.searchParams.has('kiosk')) {
          url.searchParams.set('kiosk', 'true');
          link.setAttribute('href', url.toString());
        }
      } catch (e) {
        // Ignoriere ungültige URLs
      }

      // Verhindere doppelte Event Listener
      if (!link.dataset.kioskHandled) {
        link.addEventListener('click', function (event) {
          const originalHref = link.getAttribute('href');

          try {
            const url = new URL(originalHref, document.baseURI);

            if (!url.searchParams.has('kiosk')) {
              event.preventDefault(); // Standardverhalten abbrechen

              url.searchParams.set('kiosk', 'true');

              // Benutzer weiterleiten mit aktualisierter URL
              window.location.href = url.toString();
            }
            // Wenn "kiosk" bereits da ist, Browser führt Navigation aus
          } catch (e) {
            console.warn('Ungültige URL im Link:', originalHref);
          }
        });

        // Markiere Link als verarbeitet
        link.dataset.kioskHandled = 'true';
      }
    });

    // Blockiere Klicks auf bestimmte Links
    const forbiddenLinks = root.querySelectorAll('.textmedia a, .hub-centers a');
    forbiddenLinks.forEach(link => {
      link.addEventListener('click', event => event.preventDefault(), { once: true });
    });
  }

  function updatePageContent(root = document) {
    updateYouTubeIframes(root);
    updateLinks(root);
  }

  // Initiale Anwendung
  updatePageContent();

  // Beobachte DOM-Veränderungen (z.B. durch Lazy Loading)
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          updatePageContent(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

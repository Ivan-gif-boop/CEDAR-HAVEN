/* ==========================================================================
   CEDAR HAVEN | GALLERY INTERACTION ENGINE (gallery.js)
   Powers category filtering, fullscreen lightbox with keyboard navigation,
   touch swipe gestures, and mobile drawer coordination.
   Compatible with: gallery.html
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     INIT — run everything on DOM ready
     -------------------------------------------------------------------------- */
  function init() {
    initGalleryFilters();
    initGalleryLightbox();
    initMobileSidebar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* --------------------------------------------------------------------------
     1. GALLERY CATEGORY FILTER SYSTEM
     -------------------------------------------------------------------------- */
  function initGalleryFilters() {
    var filterContainer = document.getElementById('gallery-filters');
    if (!filterContainer) return;

    var filterBtns = filterContainer.querySelectorAll('.filter-btn');
    var galleryItems = document.querySelectorAll('.gallery-item');

    if (!filterBtns.length || !galleryItems.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter') || 'all';

        /* Update active filter button styling */
        filterBtns.forEach(function (b) {
          b.classList.remove('bg-primary', 'text-white', 'shadow-sm');
          b.classList.add('text-on-surface-variant');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('bg-primary', 'text-white', 'shadow-sm');
        btn.classList.remove('text-on-surface-variant');
        btn.setAttribute('aria-pressed', 'true');

        /* Filter and animate gallery grid items */
        galleryItems.forEach(function (item) {
          var isMatch = filter === 'all' || item.classList.contains(filter);

          if (isMatch) {
            item.style.display = 'block';
            /* Force reflow so the transition replays */
            void item.offsetWidth;
            requestAnimationFrame(function () {
              setTimeout(function () {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
              }, 30);
            });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.96)';
            setTimeout(function () {
              item.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     2. FULLSCREEN INTERACTIVE LIGHTBOX & KEYBOARD / TOUCH CONTROLS
     -------------------------------------------------------------------------- */
  function initGalleryLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxTitle = document.getElementById('lightbox-title');
    var lightboxCat = document.getElementById('lightbox-cat');
    var lightboxDesc = document.getElementById('lightbox-desc');
    var lightboxClose = document.getElementById('lightbox-close');

    var galleryItems = Array.prototype.slice.call(
      document.querySelectorAll('.gallery-item')
    );
    if (!galleryItems.length) return;

    var currentIndex = -1;

    function getVisibleItems() {
      return galleryItems.filter(function (item) {
        return window.getComputedStyle(item).display !== 'none';
      });
    }

    function openLightbox(index, visibleList) {
      if (index < 0 || index >= visibleList.length) return;
      currentIndex = index;
      var item = visibleList[currentIndex];

      var src = item.getAttribute('data-src') || '';
      var title = item.getAttribute('data-title') || '';
      var cat = item.getAttribute('data-category') || '';
      var desc = item.getAttribute('data-desc') || '';

      if (lightboxImg) lightboxImg.src = src;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxCat) lightboxCat.textContent = cat;
      if (lightboxDesc) lightboxDesc.textContent = desc;

      lightbox.classList.remove('opacity-0', 'pointer-events-none');
      lightbox.classList.add('opacity-100', 'pointer-events-auto');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('opacity-100', 'pointer-events-auto');
      lightbox.classList.add('opacity-0', 'pointer-events-none');
      document.body.style.overflow = '';
      setTimeout(function () {
        if (lightboxImg) lightboxImg.removeAttribute('src');
      }, 300);
    }

    function showNext() {
      var visible = getVisibleItems();
      if (!visible.length) return;
      var nextIdx = (currentIndex + 1) % visible.length;
      openLightbox(nextIdx, visible);
    }

    function showPrev() {
      var visible = getVisibleItems();
      if (!visible.length) return;
      var prevIdx = (currentIndex - 1 + visible.length) % visible.length;
      openLightbox(prevIdx, visible);
    }

    /* Attach click events to gallery items */
    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var visible = getVisibleItems();
        var idx = visible.indexOf(item);
        if (idx !== -1) {
          openLightbox(idx, visible);
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    /* Keyboard navigation (Escape to close, Arrows to paginate) */
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('opacity-100')) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        showNext();
      } else if (e.key === 'ArrowLeft') {
        showPrev();
      }
    });

    /* Mobile touch swipe gestures */
    var touchStartX = 0;
    var touchEndX = 0;

    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diffX = touchEndX - touchStartX;
      if (Math.abs(diffX) > 50) {
        if (diffX < 0) {
          showNext(); // Swiped left
        } else {
          showPrev(); // Swiped right
        }
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     3. RESPONSIVE MOBILE SIDEBAR DRAWER
     -------------------------------------------------------------------------- */
  function initMobileSidebar() {
    var openBtn = document.getElementById('sidebar-open');
    var closeBtn = document.getElementById('sidebar-close');
    var sidebar = document.getElementById('mobile-sidebar');
    var overlay = document.getElementById('mobile-overlay');
    var body = document.body;

    if (!sidebar) return;

    function openSidebar() {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('open');
      body.classList.add('sidebar-open');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      body.classList.remove('sidebar-open');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    }

    if (openBtn) openBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    });

    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setTimeout(closeSidebar, 150);
      });
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth >= 768 && sidebar.classList.contains('open')) {
          closeSidebar();
        }
      }, 150);
    });
  }

})();
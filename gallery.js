/* ==========================================================================
   CEDAR HAVEN | SANCTUARY GALLERY SYSTEM (gallery.js)
   Loaded ONLY on gallery.html
   Handles:
   - Category filtering (All, Living Room, Bedroom, Kitchen, Bathroom, Surroundings)
   - Full-screen lightbox with next/prev navigation
   - Keyboard controls (Esc, ArrowLeft, ArrowRight)
   - Touch / Swipe support for mobile
   - Smooth image fade transitions
   - Mobile sidebar navigation (slide-in) with auto-close
   - Active nav link highlighting
   - Smooth scroll for in-page anchors
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     INIT — run everything on DOM ready
     -------------------------------------------------------------------------- */
  function init() {
    initMobileSidebar();
    initActiveNavLinks();
    initSmoothScroll();
    initGalleryFilter();
    initGalleryLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* --------------------------------------------------------------------------
     1. MOBILE SIDEBAR NAVIGATION (smooth slide-in from right)
     Works with #mobile-sidebar, #mobile-overlay, #sidebar-open, #sidebar-close
     -------------------------------------------------------------------------- */
  function initMobileSidebar() {
    var openBtn  = document.getElementById('sidebar-open');
    var closeBtn = document.getElementById('sidebar-close');
    var sidebar  = document.getElementById('mobile-sidebar');
    var overlay  = document.getElementById('mobile-overlay');
    var body     = document.body;

    if (!openBtn || !sidebar) return;

    function openSidebar() {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('open');
      body.classList.add('sidebar-open');
      openBtn.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      body.classList.remove('sidebar-open');
      openBtn.setAttribute('aria-expanded', 'false');
    }

    /* Toggle via hamburger */
    openBtn.addEventListener('click', openSidebar);

    /* Close via X button */
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

    /* Close via overlay click */
    if (overlay) overlay.addEventListener('click', closeSidebar);

    /* Close on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    });

    /* Auto-close when any sidebar link is tapped */
    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setTimeout(closeSidebar, 150);
      });
    });

    /* Auto-close when resized to desktop */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth >= 1024 && sidebar.classList.contains('open')) {
          closeSidebar();
        }
      }, 150);
    });
  }

  /* --------------------------------------------------------------------------
     2. ACTIVE NAV LINK HIGHLIGHTING
     Adds `.active` to the nav link matching the current page (gallery.html)
     -------------------------------------------------------------------------- */
  function initActiveNavLinks() {
    var currentPage = window.location.pathname.split('/').pop().toLowerCase();
    if (!currentPage) currentPage = 'index.html';

    var links = document.querySelectorAll('.desktop-nav a, .sidebar-link');

    links.forEach(function (link) {
      var href = (link.getAttribute('href') || '').split('#')[0].split('?')[0];
      var hrefPage = href.split('/').pop().toLowerCase();

      if (hrefPage && hrefPage === currentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. SMOOTH SCROLL FOR IN-PAGE ANCHORS
     Accounts for sticky header height
     -------------------------------------------------------------------------- */
  function initSmoothScroll() {
    var header = document.querySelector('.site-header');
    var offset = header ? header.offsetHeight + 8 : 80;

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (!targetId || targetId === '#' || targetId === '#!') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (history.pushState) history.pushState(null, '', targetId);
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. CATEGORY FILTERING SYSTEM
     Filters gallery items by data-category attribute with fade + scale
     -------------------------------------------------------------------------- */
  function initGalleryFilter() {
    var filterButtons = document.querySelectorAll('.filter-btn, .gallery-filter-btn, [data-filter]');
    var galleryItems = document.querySelectorAll('.gallery-item');

    if (!filterButtons.length || !galleryItems.length) return;

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();

        /* Active state styling for buttons */
        filterButtons.forEach(function (b) {
          b.classList.remove('bg-primary', 'text-white', 'shadow-sm');
          b.classList.add('text-on-surface-variant');
          b.setAttribute('aria-pressed', 'false');
        });

        btn.classList.add('bg-primary', 'text-white', 'shadow-sm');
        btn.classList.remove('text-on-surface-variant');
        btn.setAttribute('aria-pressed', 'true');

        var filterValue = (btn.getAttribute('data-filter') || 'all').toLowerCase();

        /* Animate gallery items */
        galleryItems.forEach(function (item) {
          var itemCategory = (item.getAttribute('data-category') || '').toLowerCase();

          /* Fallback: read from class names if data-category is missing */
          if (!itemCategory) {
            if (item.classList.contains('living')) itemCategory = 'living';
            else if (item.classList.contains('bedroom')) itemCategory = 'bedroom';
            else if (item.classList.contains('kitchen')) itemCategory = 'kitchen';
            else if (item.classList.contains('bathroom')) itemCategory = 'bathroom';
            else if (item.classList.contains('surroundings')) itemCategory = 'surroundings';
            else itemCategory = 'all';
          }

          var shouldShow = filterValue === 'all' || itemCategory === filterValue;

          if (shouldShow) {
            item.style.display = 'block';
            /* Force reflow so the transition plays */
            void item.offsetWidth;
            requestAnimationFrame(function () {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(function () {
              if (item.style.opacity === '0') {
                item.style.display = 'none';
              }
            }, 300);
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. FULLSCREEN LUXURY LIGHTBOX MODAL
     High-res previews, caption tracking, prev/next controls,
     keyboard shortcuts, and swipe gestures
     -------------------------------------------------------------------------- */
  function initGalleryLightbox() {
    var galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;

    /* Collect gallery image data */
    var images = [];
    galleryItems.forEach(function (item, index) {
      var img = item.querySelector('img');
      var titleEl = item.querySelector('.gallery-title, h3, h4');
      var descEl  = item.querySelector('.gallery-desc, p');

      var title = item.getAttribute('data-title')
                || (titleEl && titleEl.textContent)
                || (img && img.alt)
                || ('Sanctuary View ' + (index + 1));

      var desc = item.getAttribute('data-desc')
               || (descEl && descEl.textContent)
               || 'Cedar Haven Sanctuary • Kasarani, Nairobi';

      var cat = item.getAttribute('data-category') || '';
      var src = item.getAttribute('data-src') || (img ? img.getAttribute('src') : '');

      images.push({ src: src, title: title, desc: desc, category: cat });

      /* Open lightbox on click */
      item.addEventListener('click', function () {
        openLightbox(index);
      });
    });

    /* Ensure lightbox DOM exists; create if missing */
    var lightbox = document.getElementById('lightbox');

    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'lightbox';
      lightbox.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-[#01261f]/95 backdrop-blur-md opacity-0 pointer-events-none transition-opacity duration-300 font-sans';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.setAttribute('aria-label', 'Image preview');

      lightbox.innerHTML =
        '<button id="lightboxClose" aria-label="Close Lightbox" class="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all z-20 cursor-pointer">' +
          '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12"></path></svg>' +
        '</button>' +
        '<button id="lightboxPrev" aria-label="Previous Image" class="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all z-20 cursor-pointer">' +
          '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 19l-7-7 7-7"></path></svg>' +
        '</button>' +
        '<button id="lightboxNext" aria-label="Next Image" class="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all z-20 cursor-pointer">' +
          '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5l7 7-7 7"></path></svg>' +
        '</button>' +
        '<div class="relative max-w-5xl w-full mx-4 flex flex-col items-center justify-center">' +
          '<div class="relative max-h-[75vh] w-auto overflow-hidden rounded-xl shadow-2xl border border-white/15 bg-black/40">' +
            '<img id="lightboxImg" src="" alt="Cedar Haven Preview" class="max-h-[75vh] w-auto object-contain transition-all duration-300 opacity-0 transform scale-95">' +
          '</div>' +
          '<div class="mt-4 text-center text-[#fbf9f8] px-4 max-w-2xl">' +
            '<div class="flex items-center justify-center gap-2 mb-1">' +
              '<span class="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>' +
              '<h3 id="lightboxTitle" class="text-lg font-serif tracking-wider uppercase text-white m-0">Cedar Haven</h3>' +
              '<span class="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>' +
            '</div>' +
            '<p id="lightboxDesc" class="text-xs text-white/70 m-0 tracking-wide font-light"></p>' +
            '<div id="lightboxCounter" class="mt-2 text-[10px] tracking-widest uppercase text-[#c5a059] font-medium"></div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(lightbox);
    }

    var lightboxImg     = document.getElementById('lightboxImg');
    var lightboxTitle   = document.getElementById('lightboxTitle');
    var lightboxDesc    = document.getElementById('lightboxDesc');
    var lightboxCounter = document.getElementById('lightboxCounter');
    var closeBtn        = document.getElementById('lightboxClose');
    var prevBtn         = document.getElementById('lightboxPrev');
    var nextBtn         = document.getElementById('lightboxNext');

    var currentIndex = 0;

    function updateLightboxContent(index) {
      if (!images.length) return;
      if (index < 0) index = images.length - 1;
      if (index >= images.length) index = 0;
      currentIndex = index;

      var data = images[currentIndex];
      if (!data) return;

      /* Smooth switch effect */
      if (lightboxImg) {
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.97)';

        setTimeout(function () {
          lightboxImg.src = data.src;
          lightboxImg.alt = data.title;
          lightboxImg.onload = function () {
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
          };
        }, 150);
      }

      if (lightboxTitle) lightboxTitle.textContent = data.title;
      if (lightboxDesc) lightboxDesc.textContent = data.desc;
      if (lightboxCounter) {
        lightboxCounter.textContent = (currentIndex + 1) + ' / ' + images.length;
      }
    }

    function openLightbox(index) {
      updateLightboxContent(index);
      lightbox.classList.remove('opacity-0', 'pointer-events-none');
      lightbox.classList.add('opacity-100', 'pointer-events-auto');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.add('opacity-0', 'pointer-events-none');
      lightbox.classList.remove('opacity-100', 'pointer-events-auto');
      document.body.style.overflow = '';
    }

    function nextImage() {
      updateLightboxContent(currentIndex + 1);
    }

    function prevImage() {
      updateLightboxContent(currentIndex - 1);
    }

    /* Event listeners */
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);

    /* Click outside image box to dismiss */
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    /* Keyboard navigation */
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('opacity-100')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });

    /* Touch Swipe Support */
    var touchStartX = 0;
    var touchEndX = 0;

    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    }, { passive: true });

    function handleGesture() {
      var swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance < 0) {
          nextImage(); /* Swiped left -> Next */
        } else {
          prevImage(); /* Swiped right -> Prev */
        }
      }
    }
  }

})();
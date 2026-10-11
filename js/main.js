/* ==========================================================================
   CEDAR HAVEN | SANCTUARY INTERACTION ENGINE (main.js)
   High-performance, vanilla JavaScript for seamless luxury guest experience.
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     INIT — Run all initialisers on DOM ready
     -------------------------------------------------------------------------- */
  function init() {
    initBackgroundImages();
    initSmoothScroll();
    initGalleryLightbox();
    initReviewRatings();
    initMobileMenu();
    initActiveNavLinks();
    initReviewSubmission();
    initConciergeDesk();
    initHeaderScrollShadow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* --------------------------------------------------------------------------
     1. DYNAMIC BACKGROUND IMAGE LOADER
     -------------------------------------------------------------------------- */
  function initBackgroundImages() {
    document.querySelectorAll('[data-bg]').forEach(function (el) {
      if (!el.style.backgroundImage && el.dataset.bg) {
        el.style.backgroundImage = "url('" + el.dataset.bg + "')";
      }
    });
  }

  /* --------------------------------------------------------------------------
     2. FLUID SMOOTH SCROLLING FOR IN-PAGE ANCHORS
     -------------------------------------------------------------------------- */
  function initSmoothScroll() {
    var header = document.querySelector('.site-header');
    var headerOffset = header ? header.offsetHeight + 8 : 80;

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (event) {
        var targetId = this.getAttribute('href');

        if (!targetId || targetId === '#' || targetId === '#!') return;

        var targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        event.preventDefault();

        var targetTop =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          headerOffset;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });

        if (history.pushState) {
          history.pushState(null, '', targetId);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. IMMERSIVE GALLERY LIGHTBOX MODAL
     -------------------------------------------------------------------------- */
  function initGalleryLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var closeBtn = document.getElementById('lightbox-close');

    if (!lightbox || !lightboxImg || !closeBtn) return;

    var lightboxTitle = document.getElementById('lightbox-title');
    var lightboxCat = document.getElementById('lightbox-cat');
    var lightboxDesc = document.getElementById('lightbox-desc');

    document.querySelectorAll('.gallery-item[data-src]').forEach(function (item) {
      item.addEventListener('click', function () {
        var src = item.getAttribute('data-src');
        if (!src) return;

        lightboxImg.src = src;

        if (lightboxTitle) lightboxTitle.textContent = item.getAttribute('data-title') || '';
        if (lightboxCat) lightboxCat.textContent = item.getAttribute('data-category') || '';
        if (lightboxDesc) lightboxDesc.textContent = item.getAttribute('data-desc') || '';

        lightbox.classList.remove('opacity-0', 'pointer-events-none');
        lightbox.classList.add('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('opacity-100', 'pointer-events-auto');
      lightbox.classList.add('opacity-0', 'pointer-events-none');
      document.body.style.overflow = '';
      setTimeout(function () {
        lightboxImg.src = '';
      }, 400);
    }

    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && lightbox.classList.contains('opacity-100')) {
        closeLightbox();
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. INTERACTIVE 5-STAR RATING SYSTEM
     -------------------------------------------------------------------------- */
  function initReviewRatings() {
    var starsContainer = document.getElementById('rating-stars');
    if (!starsContainer) return;

    var stars = starsContainer.querySelectorAll('span, i');
    if (!stars.length) return;

    var selectedRating = parseInt(starsContainer.getAttribute('data-rating') || '5', 10);

    function updateStarsVisual(rating) {
      stars.forEach(function (item, idx) {
        if (idx < rating) {
          item.classList.add('text-secondary', 'text-gold');
          item.classList.remove('text-outline-variant');
          item.style.fontVariationSettings = "'FILL' 1";
        } else {
          item.classList.remove('text-secondary', 'text-gold');
          item.classList.add('text-outline-variant');
          item.style.fontVariationSettings = "'FILL' 0";
        }
      });
    }

    stars.forEach(function (star, index) {
      star.addEventListener('click', function () {
        selectedRating = index + 1;
        starsContainer.setAttribute('data-rating', selectedRating);
        updateStarsVisual(selectedRating);
      });

      star.addEventListener('mouseenter', function () {
        updateStarsVisual(index + 1);
      });
    });

    starsContainer.addEventListener('mouseleave', function () {
      var currentRating = parseInt(
        starsContainer.getAttribute('data-rating') || selectedRating,
        10
      );
      updateStarsVisual(currentRating);
    });

    updateStarsVisual(selectedRating);
  }

  /* --------------------------------------------------------------------------
     5. SMOOTH MOBILE NAVIGATION DRAWER
     -------------------------------------------------------------------------- */
  function initMobileMenu() {
    var toggleBtn = document.getElementById('mobile-menu-btn') ||
                    document.getElementById('mobile-menu-toggle');
    var menu = document.getElementById('mobile-menu') ||
               document.getElementById('mobile-nav');
    var icon = document.getElementById('mobile-menu-icon');

    if (!toggleBtn || !menu) return;

    // Ensure menu starts hidden if using the `.hidden` approach
    if (!menu.classList.contains('open') && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
    }

    function isMenuOpen() {
      return menu.classList.contains('open') || !menu.classList.contains('hidden');
    }

    function openMenu() {
      menu.classList.remove('hidden');
      menu.classList.add('open');
      if (icon) icon.textContent = 'close';
      toggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      menu.classList.remove('open');
      menu.classList.add('hidden');
      if (icon) icon.textContent = 'menu';
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Auto-close when any link is tapped
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close when clicking outside
    document.addEventListener('click', function (event) {
      if (!isMenuOpen()) return;
      var clickedInsideMenu = menu.contains(event.target);
      var clickedToggle = toggleBtn.contains(event.target);
      if (!clickedInsideMenu && !clickedToggle) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isMenuOpen()) {
        closeMenu();
      }
    });

    // Close if resized to desktop
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth >= 1024 && isMenuOpen()) {
          closeMenu();
        }
      }, 150);
    });
  }

  /* --------------------------------------------------------------------------
     6. AUTOMATIC ACTIVE NAV LINK HIGHLIGHTING
     -------------------------------------------------------------------------- */
  function initActiveNavLinks() {
    var currentPage = window.location.pathname.split('/').pop().toLowerCase();
    if (!currentPage) currentPage = 'index.html';

    var allNavLinks = document.querySelectorAll(
      '.desktop-nav a, .nav-links a, #mobile-menu a:not(.mobile-cta), #mobile-nav a:not(.mobile-cta)'
    );

    allNavLinks.forEach(function (link) {
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
     7. DYNAMIC GUEST REVIEW SUBMISSION
     -------------------------------------------------------------------------- */
  function initReviewSubmission() {
    var reviewForm = document.getElementById('review-form');
    var reviewsContainer = document.getElementById('reviews-stream') ||
                           document.getElementById('reviews-feed');

    if (!reviewForm) return;

    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput = document.getElementById('reviewer-name');
      var commentInput =
        document.getElementById('reviewer-comment') ||
        document.getElementById('reviewer-message');

      var starsContainer =
        document.getElementById('rating-stars') ||
        document.getElementById('star-picker');

      var rating = starsContainer
        ? parseInt(starsContainer.getAttribute('data-rating') || '5', 10)
        : 5;

      var name = nameInput && nameInput.value.trim()
        ? nameInput.value.trim()
        : 'Honored Guest';

      var comment = commentInput && commentInput.value.trim()
        ? commentInput.value.trim()
        : '';

      if (!comment) return;

      if (reviewsContainer) {
        var reviewCard = document.createElement('div');
        reviewCard.className =
          'card review-card bg-surface-lowest p-6 rounded-xl border border-border shadow-soft transition-smooth mb-4';

        var safeName = escapeHtml(name);
        var safeComment = escapeHtml(comment);

        reviewCard.innerHTML =
          '<div class="flex items-center justify-between mb-3">' +
            '<div class="flex items-center gap-3">' +
              '<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-serif text-primary font-bold">' +
                safeName.charAt(0).toUpperCase() +
              '</div>' +
              '<div>' +
                '<h4 class="font-serif text-primary text-base font-semibold m-0">' + safeName + '</h4>' +
                '<p class="text-xs text-muted m-0">Just now • Verified Stay</p>' +
              '</div>' +
            '</div>' +
            '<div class="flex text-gold text-sm">' +
              repeatChar('★', rating) + repeatChar('☆', 5 - rating) +
            '</div>' +
          '</div>' +
          '<p class="text-sm text-text-subtle font-sans m-0 leading-relaxed">' + safeComment + '</p>';

        reviewsContainer.prepend(reviewCard);
      }

      reviewForm.reset();
      if (starsContainer) {
        starsContainer.setAttribute('data-rating', '5');
      }

      var successNotice = document.getElementById('review-success');
      if (successNotice) {
        successNotice.classList.remove('hidden');
        setTimeout(function () {
          successNotice.classList.add('hidden');
        }, 4000);
      }
    });
  }

  /* --------------------------------------------------------------------------
     8. DIRECT CONCIERGE DESK / ANONYMOUS CHAT
     -------------------------------------------------------------------------- */
  function initConciergeDesk() {
    var deskForm = document.getElementById('desk-form') ||
                   document.getElementById('chat-form');
    var chatThread = document.getElementById('desk-thread') ||
                     document.getElementById('chatMessagesContainer');
    var anonCheckbox = document.getElementById('anon-toggle') ||
                       document.getElementById('anonymousToggle');
    var messageInput = document.getElementById('guest-message') ||
                       document.getElementById('chatInput');

    if (!deskForm || !chatThread || !messageInput) return;

    deskForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var message = messageInput.value.trim();
      if (!message) return;

      var isAnonymous = anonCheckbox ? anonCheckbox.checked : true;
      var sender = isAnonymous ? 'Guest (Anonymous)' : 'Guest';

      var msgBubble = document.createElement('div');
      msgBubble.className = 'flex justify-end mb-3';
      msgBubble.innerHTML =
        '<div class="bg-primary text-white p-3.5 rounded-2xl rounded-tr-none max-w-[80%] text-sm shadow-subtle">' +
          '<p class="font-semibold text-xs text-gold-light mb-1">' + sender + '</p>' +
          '<p class="m-0 leading-relaxed">' + escapeHtml(message) + '</p>' +
          '<span class="text-[10px] text-white/60 mt-1 block text-right">Sent</span>' +
        '</div>';

      chatThread.appendChild(msgBubble);
      messageInput.value = '';
      chatThread.scrollTop = chatThread.scrollHeight;

      setTimeout(function () {
        var hostReply = document.createElement('div');
        hostReply.className = 'flex justify-start mb-3';
        hostReply.innerHTML =
          '<div class="bg-surface-low border border-border text-primary p-3.5 rounded-2xl rounded-tl-none max-w-[80%] text-sm shadow-subtle">' +
            '<p class="font-semibold text-xs text-gold mb-1">Cedar Haven Concierge</p>' +
            '<p class="m-0 leading-relaxed">Thank you for reaching out. We have received your message and our team in Kasarani will get back to you shortly.</p>' +
            '<span class="text-[10px] text-muted mt-1 block text-left">Received</span>' +
          '</div>';

        chatThread.appendChild(hostReply);
        chatThread.scrollTop = chatThread.scrollHeight;
      }, 1200);
    });
  }

  /* --------------------------------------------------------------------------
     9. HEADER SHADOW ON SCROLL
     -------------------------------------------------------------------------- */
  function initHeaderScrollShadow() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;

    function updateHeader() {
      if (window.pageYOffset > 8) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateHeader();
  }

  /* --------------------------------------------------------------------------
     HELPERS
     -------------------------------------------------------------------------- */

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function repeatChar(char, count) {
    var out = '';
    for (var i = 0; i < count; i++) out += char;
    return out;
  }

})();
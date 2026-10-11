/* ==========================================================================
   CEDAR HAVEN | SANCTUARY REVIEWS & TESTIMONIAL SYSTEM (reviews.js)
   Loaded ONLY on reviews.html
   Handles:
   - Interactive 5-star rating selector (hover preview + click lock)
   - Dynamic review submission + live card rendering
   - LocalStorage persistence
   - Anonymous guest + verified stay badges
   - Review filtering (All, 5 Stars, 4+ Stars)
   - Toast notifications
   - Mobile sidebar navigation (slide-in) with auto-close
   - Active nav link highlighting
   - Smooth scroll for in-page anchors
   ========================================================================== */

(function () {
  'use strict';

  var REVIEWS_STORAGE_KEY = 'cedar_haven_guest_reviews';
  var selectedRating = 5;

  /* --------------------------------------------------------------------------
     DEFAULT INITIAL REVIEWS (used if localStorage is empty)
     -------------------------------------------------------------------------- */
  var DEFAULT_INITIAL_REVIEWS = [
    {
      id: 'rev-init-1',
      author: 'Amina & David K.',
      location: 'Nairobi, Kenya',
      stayDate: 'Guest • February 2026',
      rating: 5,
      title: 'An exquisite, serene oasis in Kasarani',
      comment: 'Cedar Haven exceeded every expectation. The modern finishes, peaceful compound, and thoughtful touches made our weekend stay completely restorative. The living room decor and cozy lighting are world-class.',
      verified: true,
      timestamp: Date.now() - 86400000 * 3
    },
    {
      id: 'rev-init-2',
      author: 'Marcus Vance',
      location: 'London, UK',
      stayDate: 'Guest • January 2026',
      rating: 5,
      title: 'Impeccable privacy and hospitality',
      comment: 'Spotlessly clean, fast Wi-Fi for remote work, and complete quiet. The host made check-in effortless via WhatsApp. Definitely my go-to residence whenever I visit Nairobi.',
      verified: true,
      timestamp: Date.now() - 86400000 * 12
    },
    {
      id: 'rev-init-3',
      author: 'Faith Muthoni',
      location: 'Mombasa, Kenya',
      stayDate: 'Guest • January 2026',
      rating: 5,
      title: 'True warmth and comfort',
      comment: 'The kitchen was equipped with everything we needed, and the bedroom mattress was heavenly. It truly feels like a tranquil sanctuary tucked away from the busy city.',
      verified: true,
      timestamp: Date.now() - 86400000 * 20
    }
  ];

  /* --------------------------------------------------------------------------
     INIT — run everything on DOM ready
     -------------------------------------------------------------------------- */
  function init() {
    initMobileSidebar();
    initActiveNavLinks();
    initSmoothScroll();
    initStarRating();
    initReviewFeed();
    initReviewForm();
    initReviewFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* --------------------------------------------------------------------------
     1. MOBILE SIDEBAR NAVIGATION (smooth slide-in from right)
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

    openBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay)  overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
    });

    // Auto-close when any nav link inside the sidebar is tapped
    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setTimeout(closeSidebar, 150);
      });
    });

    // Close if resized to desktop
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
     4. INTERACTIVE STAR RATING SELECTOR
     -------------------------------------------------------------------------- */
  function initStarRating() {
    var starContainer =
      document.getElementById('star-picker') ||
      document.getElementById('starRatingContainer') ||
      document.querySelector('.star-rating-select');

    var ratingInput =
      document.getElementById('selected-rating') ||
      document.getElementById('ratingValue') ||
      document.querySelector('input[name="rating"]');

    var ratingLabel =
      document.getElementById('rating-label') ||
      document.getElementById('ratingLabel') ||
      document.querySelector('.rating-label-feedback');

    if (!starContainer) return;

    var stars = starContainer.querySelectorAll('i, [data-star], .star-btn');
    if (!stars.length) return;

    var ratingDescriptions = {
      1: 'Disappointing Experience',
      2: 'Fair • Needs Attention',
      3: 'Average Sanctuary Stay',
      4: 'Delightful & Comfortable',
      5: 'Exceptional Kasarani Sanctuary'
    };

    function highlightStars(rating) {
      stars.forEach(function (star, index) {
        var starIndex = index + 1;
        var isFilled = starIndex <= rating;

        if (isFilled) {
          star.classList.remove('fa-regular');
          star.classList.add('fa-solid');
          star.style.color = '#c5a059';
          star.style.fontVariationSettings = "'FILL' 1";
        } else {
          star.classList.remove('fa-solid');
          star.classList.add('fa-regular');
          star.style.color = '#d4c5a9';
          star.style.fontVariationSettings = "'FILL' 0";
        }
      });

      if (ratingLabel) {
        ratingLabel.textContent = ratingDescriptions[rating] || (rating + ' Stars');
      }
      if (ratingInput) {
        ratingInput.value = rating;
      }
    }

    // Initial render
    highlightStars(selectedRating);

    stars.forEach(function (star, index) {
      var starValue = parseInt(
        star.getAttribute('data-star') ||
        star.getAttribute('data-rating'),
        10
      ) || (index + 1);

      star.addEventListener('mouseenter', function () {
        highlightStars(starValue);
      });

      star.addEventListener('click', function (e) {
        e.preventDefault();
        selectedRating = starValue;
        highlightStars(selectedRating);
        star.classList.add('scale-125');
        setTimeout(function () { star.classList.remove('scale-125'); }, 200);
      });
    });

    starContainer.addEventListener('mouseleave', function () {
      highlightStars(selectedRating);
    });
  }

  /* --------------------------------------------------------------------------
     5. STORAGE HELPERS
     -------------------------------------------------------------------------- */
  function getStoredReviews() {
    try {
      var raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_REVIEWS));
        return DEFAULT_INITIAL_REVIEWS.slice();
      }
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : DEFAULT_INITIAL_REVIEWS.slice();
    } catch (err) {
      return DEFAULT_INITIAL_REVIEWS.slice();
    }
  }

  function saveReviewToStorage(review) {
    try {
      var existing = getStoredReviews();
      existing.unshift(review);
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(existing));
    } catch (err) {
      /* silent */
    }
  }

  /* --------------------------------------------------------------------------
     6. REVIEWS FEED RENDERER
     -------------------------------------------------------------------------- */
  function initReviewFeed() {
    var container =
      document.getElementById('reviews-feed') ||
      document.getElementById('reviewsContainer') ||
      document.querySelector('.reviews-feed');

    if (!container) return;

    var reviews = getStoredReviews();
    container.innerHTML = '';

    if (!reviews.length) {
      container.innerHTML =
        '<div class="col-span-full py-16 text-center text-[#4a5d58]">' +
          '<span class="material-symbols-outlined text-4xl text-[#c5a059] mb-3 block">spa</span>' +
          '<h4 class="font-serif text-xl text-[#1a3c34] mb-1">Be the First to Leave a Review</h4>' +
          '<p class="text-sm max-w-md mx-auto text-[#4a5d58]">Share your thoughts from your stay at Cedar Haven Kasarani.</p>' +
        '</div>';
      return;
    }

    reviews.forEach(function (review) {
      appendReviewCard(review, false);
    });

    updateReviewCounters(reviews);
  }

  /* --------------------------------------------------------------------------
     7. REVIEW CARD RENDERING
     -------------------------------------------------------------------------- */
  function appendReviewCard(review, isNew) {
    var container =
      document.getElementById('reviews-feed') ||
      document.getElementById('reviewsContainer') ||
      document.querySelector('.reviews-feed');

    if (!container) return;

    // Build stars
    var starsHtml = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= review.rating) {
        starsHtml += '<span class="material-symbols-outlined text-[#c5a059] text-base" style="font-variation-settings:\'FILL\' 1;">star</span>';
      } else {
        starsHtml += '<span class="material-symbols-outlined text-[#c1c8c4] text-base" style="font-variation-settings:\'FILL\' 0;">star</span>';
      }
    }

    var card = document.createElement('div');
    card.className =
      'review-card bg-white p-6 sm:p-7 rounded-2xl border border-[#1a3c34]/5 shadow-sm space-y-3 transition-all duration-300 hover:shadow-md fade-in-card' +
      (isNew ? ' ring-2 ring-[#c5a059]/40' : '');
    card.setAttribute('data-rating', review.rating);

    card.innerHTML =
      '<div class="flex items-center justify-between gap-3">' +
        '<div class="flex items-center gap-3">' +
          '<div class="w-10 h-10 rounded-full bg-[#1a3c34]/10 text-[#1a3c34] font-serif-title font-bold flex items-center justify-center text-sm border border-[#c5a059]/30">' +
            escapeHtml(getInitials(review.author)) +
          '</div>' +
          '<div>' +
            '<h4 class="font-semibold text-sm text-[#1a3c34] leading-tight">' + escapeHtml(review.author) + '</h4>' +
            '<p class="text-xs text-[#1a3c34]/60">' + escapeHtml(review.location || 'Verified Sanctuary Guest') + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="flex items-center gap-1">' + starsHtml + '</div>' +
      '</div>' +
      (review.title ? '<h3 class="font-serif-title text-base text-[#1a3c34] font-medium leading-snug pt-1 border-t border-[#1a3c34]/5">"' + escapeHtml(review.title) + '"</h3>' : '') +
      '<p class="text-xs sm:text-sm text-[#1a3c34]/80 leading-relaxed font-normal">' +
        escapeHtml(review.comment) +
      '</p>' +
      '<div class="flex items-center justify-between text-[11px] text-[#1a3c34]/50 pt-1">' +
        '<span class="flex items-center gap-1">' +
          '<span class="material-symbols-outlined text-[13px] text-emerald-600">verified</span>' +
          'Stayed at Cedar Haven' +
        '</span>' +
        '<span>' + escapeHtml(review.stayDate || 'Just now') + '</span>' +
      '</div>';

    if (isNew && container.firstChild) {
      container.insertBefore(card, container.firstChild);
    } else {
      container.appendChild(card);
    }
  }

  /* --------------------------------------------------------------------------
     8. REVIEW SUBMISSION
     -------------------------------------------------------------------------- */
  function initReviewForm() {
    var reviewForm =
      document.getElementById('review-form') ||
      document.getElementById('reviewForm') ||
      document.querySelector('form.review-submission-form');

    if (!reviewForm) return;

    var picker = document.getElementById('star-picker') || document.getElementById('starRatingContainer');
    var input = document.getElementById('selected-rating') || document.getElementById('ratingValue');

    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput     = reviewForm.querySelector('#reviewer-name, #guestName, input[name="name"], input[name="author"]');
      var locInput      = reviewForm.querySelector('#reviewer-location, #guestLocation, input[name="location"]');
      var titleInput    = reviewForm.querySelector('#review-title, #reviewTitle, input[name="title"]');
      var commentInput  = reviewForm.querySelector('#reviewer-message, #reviewComment, textarea[name="comment"], textarea[name="message"]');
      var anonymousChk  = reviewForm.querySelector('#anonymousCheck, input[name="anonymous"]');
      var submitBtn     = reviewForm.querySelector('button[type="submit"]');

      var comment = commentInput ? commentInput.value.trim() : '';
      if (!comment) {
        showToast('Please share a few words about your stay before submitting.');
        if (commentInput) commentInput.focus();
        return;
      }

      var isAnon = anonymousChk ? anonymousChk.checked : false;
      var authorName = isAnon
        ? 'Honored Guest (Anonymous)'
        : (nameInput && nameInput.value.trim()) || 'Honored Guest';

      var location = (locInput && !isAnon && locInput.value.trim()) || 'Verified Stay';
      var title = (titleInput && titleInput.value.trim()) || 'A Peaceful Experience at Cedar Haven';

      var now = new Date();
      var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      var stayDate = 'Guest • ' + months[now.getMonth()] + ' ' + now.getFullYear();

      var newReview = {
        id: 'rev-' + Date.now(),
        author: authorName,
        location: location,
        stayDate: stayDate,
        rating: selectedRating,
        title: title,
        comment: comment,
        verified: true,
        timestamp: Date.now()
      };

      if (submitBtn) {
        var originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<span class="inline-flex items-center gap-2">' +
            '<svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">' +
              '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
              '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>' +
            '</svg>' +
            '<span>Publishing to Sanctuary...</span>' +
          '</span>';

        setTimeout(function () {
          saveReviewToStorage(newReview);
          appendReviewCard(newReview, true);

          // Reset form
          reviewForm.reset();
          selectedRating = 5;

          if (picker) {
            var stars = picker.querySelectorAll('i, [data-star]');
            stars.forEach(function (s) {
              s.classList.remove('fa-regular');
              s.classList.add('fa-solid');
              s.style.color = '#c5a059';
              s.style.fontVariationSettings = "'FILL' 1";
            });
          }

          if (input) input.value = 5;

          showToast('Warm gratitude. Your review has been published to Cedar Haven.');

          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;

          var feed = document.getElementById('reviews-feed') || document.getElementById('reviewsContainer');
          if (feed) {
            feed.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 900);
      }
    });
  }

  /* --------------------------------------------------------------------------
     9. REVIEW FILTERS (All / 5 Stars / 4+ Stars)
     -------------------------------------------------------------------------- */
  function initReviewFilters() {
    var filterBtns = document.querySelectorAll('.review-filter-btn, [data-review-filter]');
    if (!filterBtns.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();

        filterBtns.forEach(function (b) {
          b.classList.remove('active', 'bg-primary', 'text-white');
          b.classList.add('text-on-surface-variant');
        });

        btn.classList.add('active', 'bg-primary', 'text-white');
        btn.classList.remove('text-on-surface-variant');

        var filterVal = btn.getAttribute('data-review-filter') || 'all';
        var cards = document.querySelectorAll('.review-card');

        cards.forEach(function (card) {
          var rating = parseInt(card.getAttribute('data-rating'), 10) || 5;
          var show = true;

          if (filterVal === '5') show = (rating === 5);
          else if (filterVal === '4') show = (rating >= 4);

          if (show) {
            card.style.display = 'block';
            card.style.opacity = '1';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     10. COUNTERS (avg rating, total)
     -------------------------------------------------------------------------- */
  function updateReviewCounters(reviews) {
    var totalCountEl = document.getElementById('totalReviewCount') || document.getElementById('review-count-badge');
    var avgRatingEl  = document.getElementById('avgRatingScore');

    if (totalCountEl) {
      totalCountEl.textContent = reviews.length + ' ' + (reviews.length === 1 ? 'Review' : 'Reviews');
    }

    if (avgRatingEl && reviews.length > 0) {
      var sum = reviews.reduce(function (acc, curr) { return acc + (curr.rating || 5); }, 0);
      avgRatingEl.textContent = (sum / reviews.length).toFixed(1);
    }
  }

  /* --------------------------------------------------------------------------
     11. TOAST NOTIFICATION
     -------------------------------------------------------------------------- */
  function showToast(message) {
    var toast = document.getElementById('sanctuaryToast');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sanctuaryToast';
      toast.className =
        'fixed bottom-6 right-6 max-w-md bg-[#1a3c34] text-[#fbf9f8] px-6 py-4 rounded-xl ' +
        'shadow-2xl border border-[#c5a059]/50 z-50 transition-all duration-500 ' +
        'transform translate-y-12 opacity-0 font-sans text-sm flex items-center gap-3';
      document.body.appendChild(toast);
    }

    toast.innerHTML =
      '<span class="material-symbols-outlined text-[#c5a059] text-xl" style="font-variation-settings:\'FILL\' 1;">spa</span>' +
      '<p class="m-0 leading-normal">' + escapeHtml(message) + '</p>';

    requestAnimationFrame(function () {
      toast.classList.remove('translate-y-12', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(function () {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-12', 'opacity-0');
    }, 4500);
  }

  /* --------------------------------------------------------------------------
     HELPERS
     -------------------------------------------------------------------------- */
  function getInitials(name) {
    if (!name) return 'CH';
    var parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function escapeHtml(string) {
    if (!string) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(string)));
    return div.innerHTML;
  }

})();
/* ==========================================================================
   CEDAR HAVEN | SANCTUARY CONCIERGE & CONTACT SYSTEM (contact.js)
   Loaded ONLY on contact.html
   Handles:
   - Direct concierge messaging (chat thread)
   - Anonymous chat toggle
   - Traditional contact form with status feedback
   - Notification toast
   - Mobile sidebar navigation (slide-in)
   - Auto-close nav on link tap
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
    initConciergeChat();
    initContactForm();
    initAnonymousToggle();
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
     Adds `.active` to the nav link matching the current page (contact.html)
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
     4. ANONYMOUS TOGGLE (hides/shows the name field in concierge desk)
     -------------------------------------------------------------------------- */
  function initAnonymousToggle() {
    var toggle = document.getElementById('anonymousToggle');
    var wrapper = document.getElementById('aliasWrapper');
    if (!toggle || !wrapper) return;

    /* Set initial state to match the checkbox */
    wrapper.style.display = toggle.checked ? 'none' : 'flex';

    toggle.addEventListener('change', function () {
      wrapper.style.display = toggle.checked ? 'none' : 'flex';
    });
  }

  /* --------------------------------------------------------------------------
     5. DIRECT CONCIERGE CHAT THREAD
     Handles message send, auto-reply, timestamping, and scroll-to-bottom
     -------------------------------------------------------------------------- */
  function initConciergeChat() {
    var chatMessages =
      document.getElementById('chatMessagesContainer') ||
      document.getElementById('chatMessages') ||
      document.querySelector('.chat-messages-container');

    var chatInput =
      document.getElementById('chatInput') ||
      document.querySelector('.chat-input-field');

    var sendBtn =
      document.getElementById('sendChatBtn') ||
      document.querySelector('.chat-send-btn');

    var anonymousToggle = document.getElementById('anonymousToggle');
    var aliasInput = document.getElementById('senderAlias');

    if (!chatMessages || !chatInput || !sendBtn) return;

    /* Time formatter */
    function getCurrentTime() {
      var now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    /* Append a message bubble */
    function appendMessage(text, sender) {
      var isUser = sender === 'user';
      var isAnonymous = anonymousToggle ? anonymousToggle.checked : false;
      var alias = isAnonymous
        ? 'Guest (Anonymous)'
        : (aliasInput && aliasInput.value.trim()) || 'Guest';
      var senderLabel = isUser ? alias : 'Cedar Haven Concierge';

      var row = document.createElement('div');
      row.className = 'flex flex-col ' + (isUser ? 'items-end' : 'items-start') + ' gap-1 mb-4 fade-in-card';

      var bubbleClass = isUser
        ? 'bg-[#1a3c34] text-white rounded-br-none'
        : 'bg-[#f5f3f0] text-[#1a3c34] border border-[#c1c8c4]/40 rounded-bl-none';

      row.innerHTML =
        '<span class="text-[10px] uppercase tracking-wider text-[#4a5d58] font-medium">' +
          escapeHtml(senderLabel) + ' • ' + getCurrentTime() +
        '</span>' +
        '<div class="max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ' + bubbleClass + ' font-sans">' +
          '<p class="m-0 leading-relaxed">' + escapeHtml(text) + '</p>' +
        '</div>';

      chatMessages.appendChild(row);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /* Send handler */
    function sendMessage() {
      var message = chatInput.value.trim();
      if (!message) return;

      appendMessage(message, 'user');
      chatInput.value = '';
      chatInput.focus();

      setTimeout(function () {
        var responses = [
          "Warm greetings from Cedar Haven. We've received your note and our desk in Kasarani is attending to your inquiry right away.",
          "Thank you for contacting Cedar Haven sanctuary. A member of our team is ready to assist you. If your stay requires immediate reservation, you can also reach us directly via WhatsApp (+254 142 202 815).",
          "We are honored by your interest in Cedar Haven. We ensure complete privacy for all our guests. How may we curate your peaceful stay today?",
          "Thank you for reaching out. We will provide full availability details and coordinate your arrival seamlessly."
        ];
        var reply = responses[Math.floor(Math.random() * responses.length)];
        appendMessage(reply, 'concierge');
      }, 1000);
    }

    sendBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  /* --------------------------------------------------------------------------
     6. TRADITIONAL CONTACT FORM
     Validates, shows spinner, and returns a friendly toast on submit
     -------------------------------------------------------------------------- */
  function initContactForm() {
    var contactForm =
      document.getElementById('contactForm') ||
      document.querySelector('form.contact-form');

    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput =
        contactForm.querySelector('input[name="name"]') ||
        contactForm.querySelector('#name');

      var messageInput =
        contactForm.querySelector('textarea[name="message"]') ||
        contactForm.querySelector('#message');

      var submitBtn = contactForm.querySelector('button[type="submit"]');

      var name = nameInput ? nameInput.value.trim() : 'Guest';
      var message = messageInput ? messageInput.value.trim() : '';

      if (!message) {
        showNotification('Please enter your message or inquiry before submitting.');
        if (messageInput) messageInput.focus();
        return;
      }

      if (submitBtn) {
        var originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<span class="inline-flex items-center gap-2">' +
            '<svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">' +
              '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
              '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>' +
            '</svg>' +
            '<span>Transmitting to Sanctuary...</span>' +
          '</span>';

        setTimeout(function () {
          submitBtn.innerHTML =
            '<span class="inline-flex items-center gap-2 text-white font-medium">' +
              '<span class="material-symbols-outlined text-base">check_circle</span>' +
              '<span>Inquiry Sent Successfully</span>' +
            '</span>';

          showNotification(
            'Thank you, ' + (name || 'Guest') +
            '. Your message has been routed to our Kasarani host. We will reply promptly.'
          );

          contactForm.reset();

          setTimeout(function () {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, 4000);
        }, 1200);
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. NOTIFICATION TOAST
     -------------------------------------------------------------------------- */
  function showNotification(message) {
    var toast = document.getElementById('sanctuaryToast');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sanctuaryToast';
      toast.className =
        'fixed bottom-6 right-6 max-w-md bg-[#1a3c34] text-[#fbf9f8] px-6 py-4 rounded-xl ' +
        'shadow-2xl border border-[#c5a059]/40 z-50 transition-all duration-500 ' +
        'transform translate-y-12 opacity-0 font-sans text-sm flex items-center gap-3';
      document.body.appendChild(toast);
    }

    toast.innerHTML =
      '<span class="material-symbols-outlined text-[#c5a059]">spa</span>' +
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
  function escapeHtml(string) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(string)));
    return div.innerHTML;
  }

})();
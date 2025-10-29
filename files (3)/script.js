// script.js — enhanced interactive widgets for the Bootstrap-converted site
// Features:
// - dynamic year injection
// - nav active highlighting (works across files)
// - demo contact & login with Bootstrap validation
// - gallery modal lightbox (Bootstrap modal)
// - client-side search for posts/projects (simple filter)
// - theme toggle (dark / light) persisted in localStorage

(function () {
  // Utilities
  const q = (s, el = document) => el.querySelector(s);
  const qa = (s, el = document) => Array.from(el.querySelectorAll(s));

  // 1) Year injection
  qa('[id^="year"]').forEach(el => el.textContent = new Date().getFullYear());

  // 2) Nav highlighting based on current path
  (function highlightNav() {
    const navLinks = qa('.nav-link');
    const current = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href === current || (href === 'index.html' && current === '')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      }
    });
  })();

  // 3) Theme toggle (persist to localStorage)
  const themeKeys = ['themeToggle', 'themeToggleDesktop', 'themeToggleAbout'];
  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('siteTheme', theme);
  }
  function toggleTheme() {
    const cur = document.body.getAttribute('data-theme') || 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  }
  // initialize
  const saved = localStorage.getItem('siteTheme');
  if (saved) applyTheme(saved);
  themeKeys.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', toggleTheme);
  });
  const headerToggle = document.getElementById('themeToggle');
  if (headerToggle) headerToggle.addEventListener('click', toggleTheme);

  // 4) Bootstrap form validation + demo submit for Contact
  (function contactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const status = document.getElementById('contact-status');
      status.textContent = 'Sending...';
      setTimeout(() => {
        status.textContent = 'Thanks — your message was sent (demo).';
        form.reset();
        form.classList.remove('was-validated');
      }, 900);
    });
  })();

  // 5) Login demo with validation
  (function loginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const fd = new FormData(form);
      const username = (fd.get('username') || '').trim();
      const password = (fd.get('password') || '').trim();
      const status = document.getElementById('login-status');
      if (username === 'demo' && password === 'demo123') {
        status.textContent = 'Login successful (demo). Redirecting...';
        sessionStorage.setItem('loggedInUser', username);
        setTimeout(() => window.location.href = 'index.html', 700);
      } else {
        status.textContent = 'Invalid credentials (demo). Try demo / demo123';
      }
    });
  })();

  // 6) Gallery lightbox using Bootstrap modal
  (function galleryLightbox() {
    const thumbs = qa('.gallery-thumb');
    if (!thumbs.length) return;
    const modalEl = q('#galleryModal');
    const modalImg = q('#galleryModalImg');
    const bsModal = modalEl ? new bootstrap.Modal(modalEl, {}) : null;

    thumbs.forEach(img => {
      img.addEventListener('click', () => {
        const large = img.dataset.large || img.src;
        modalImg.src = large;
        modalImg.alt = img.alt || '';
        bsModal.show();
      });
    });

    // clear image on hide
    if (modalEl) modalEl.addEventListener('hidden.bs.modal', () => {
      modalImg.src = '';
      modalImg.alt = '';
    });
  })();

  // 7) Client-side search (global + specific lists)
  (function clientSearch() {
    // generic filter helper
    function filterList(listSelector, itemSelector, query) {
      const list = q(listSelector);
      if (!list) return;
      const items = Array.from(list.querySelectorAll(itemSelector));
      const qnorm = (query || '').trim().toLowerCase();
      items.forEach(it => {
        const text = (it.textContent || it.innerText || '').toLowerCase();
        const tags = (it.dataset.tags || '').toLowerCase();
        const show = !qnorm || text.includes(qnorm) || tags.includes(qnorm);
        it.style.display = show ? '' : 'none';
      });
    }

    // Projects page
    const pSearch = q('#projectsSearch') || q('#projectsSearchTop');
    if (pSearch) {
      pSearch.addEventListener('input', (e) => {
        filterList('#projectsList', '.project-item', e.target.value);
      });
    }

    // Blog page
    const bSearch = q('#blogSearchTop') || q('#blogSearchOffcanvas');
    if (bSearch) {
      bSearch.addEventListener('input', (e) => {
        filterList('#postsList', '.post-item', e.target.value);
      });
    }

    // Global search from navbar (desktop and offcanvas)
    const globalSearch = q('#globalSearch') || null;
    const globalSearchDesktop = q('#globalSearchDesktop') || null;
    const globalInputs = [globalSearch, globalSearchDesktop].filter(Boolean);
    globalInputs.forEach(inp => {
      inp.addEventListener('keypress', (ev) => {
        if (ev.key === 'Enter') {
          const qv = inp.value.trim();
          // If on blog/projects pages, filter locally; otherwise go to blog or projects with query param
          const path = window.location.pathname.split('/').pop() || 'index.html';
          if (path === 'blog.html') {
            q('#blogSearchTop') && (q('#blogSearchTop').value = qv, q('#blogSearchTop').dispatchEvent(new Event('input')));
          } else if (path === 'projects.html') {
            q('#projectsSearchTop') && (q('#projectsSearchTop').value = qv, q('#projectsSearchTop').dispatchEvent(new Event('input')));
          } else {
            // redirect to blog with query in hash so user can search there
            window.location.href = 'blog.html#q=' + encodeURIComponent(qv);
          }
        }
      });
    });

    // On blog/projects load, if hash contains q=..., prefill search
    (function preloadQueryFromHash() {
      const m = window.location.hash.match(/q=([^&]+)/);
      if (m) {
        const val = decodeURIComponent(m[1]);
        if (q('#blogSearchTop')) {
          q('#blogSearchTop').value = val;
          q('#blogSearchTop').dispatchEvent(new Event('input'));
        }
        if (q('#projectsSearchTop')) {
          q('#projectsSearchTop').value = val;
          q('#projectsSearchTop').dispatchEvent(new Event('input'));
        }
        // also set the offcanvas inputs if present
        if (q('#globalSearch')) q('#globalSearch').value = val;
        if (q('#globalSearchDesktop')) q('#globalSearchDesktop').value = val;
      }
    })();
  })();

  // 8) Accessibility: close offcanvas after clicking a link (mobile)
  (function closeOffcanvasOnNavClick() {
    qa('.offcanvas .nav-link').forEach(a => {
      a.addEventListener('click', () => {
        const offEl = a.closest('.offcanvas');
        if (offEl) {
          const bsOff = bootstrap.Offcanvas.getInstance(offEl);
          if (bsOff) bsOff.hide();
        }
      });
    });
  })();

})();
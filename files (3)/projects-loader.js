// projects-loader.js — loads projects.json and renders project cards into #projectsGrid
// also wires search input #projectsSearchTop and #projectsSearch

(async function () {
  const grid = document.getElementById('projectsGrid');
  const searchTop = document.getElementById('projectsSearchTop');
  const searchOff = document.getElementById('projectsSearch');

  // Fetch projects.json
  async function loadProjects() {
    try {
      const res = await fetch('projects.json', {cache: "no-store"});
      if (!res.ok) throw new Error('Failed to load projects.json: ' + res.status);
      const projects = await res.json();
      renderProjects(projects);
      return projects;
    } catch (err) {
      console.error(err);
      grid.innerHTML = '<div class="col-12"><p class="text-danger">Unable to load projects. Check projects.json in your site folder.</p></div>';
      return [];
    }
  }

  // Render projects into the grid
  function renderProjects(projects) {
    grid.innerHTML = projects.map(p => projectCardHTML(p)).join('');
    wireImageClicks();
  }

  // Build card HTML for a project
  function projectCardHTML(p) {
    const tagsHtml = (p.tags || []).map(t => `<span class="badge bg-secondary me-1">${escapeHtml(t)}</span>`).join('');
    // owner avatar overlay uses assets/owner.jpg
    return `
      <div class="col-sm-6 col-lg-4">
        <div class="card project-card h-100 shadow-sm">
          <div class="position-relative">
            <img src="${escapeAttr(p.cover)}" class="card-img-top project-cover" alt="${escapeAttr(p.title)} cover" loading="lazy" />
            <img src="assets/owner.jpg" class="owner-badge" alt="Owner avatar" />
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${escapeHtml(p.title)}</h5>
            <p class="card-text">${escapeHtml(p.description)}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <div>
                ${p.demoUrl ? `<a href="${escapeAttr(p.demoUrl)}" class="link-accent me-3" target="_blank" rel="noopener">Demo</a>` : ''}
                ${p.repoUrl ? `<a href="${escapeAttr(p.repoUrl)}" class="link-accent" target="_blank" rel="noopener">Source</a>` : ''}
              </div>
              <div class="text-muted small">${tagsHtml}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Wire up clicking on cover images to open the modal
  function wireImageClicks() {
    const modalEl = document.getElementById('projectModal');
    const modalImg = document.getElementById('projectModalImg');
    const bsModal = modalEl ? new bootstrap.Modal(modalEl, {}) : null;
    grid.querySelectorAll('.project-cover').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        const src = img.getAttribute('src') || img.dataset.large || '';
        if (bsModal && modalImg) {
          modalImg.src = src;
          modalImg.alt = img.alt || '';
          bsModal.show();
        } else {
          // fallback: open in new tab
          window.open(src, '_blank', 'noopener');
        }
      });
      // fallback placeholder on error
      img.addEventListener('error', () => {
        img.src = 'https://placehold.co/1200x800?text=No+image';
      });
    });

    // clear modal image when hidden
    if (modalEl) modalEl.addEventListener('hidden.bs.modal', () => {
      modalImg.src = '';
      modalImg.alt = '';
    });
  }

  // Simple search - matches title, description, tags
  function setupSearch(projects) {
    function filter(value) {
      const q = (value || '').trim().toLowerCase();
      const items = grid.querySelectorAll('.col-sm-6');
      if (!q) {
        items.forEach(it => it.style.display = '');
        return;
      }
      projects.forEach(p => {
        const text = ((p.title || '') + ' ' + (p.description || '') + ' ' + (p.tags || []).join(' ')).toLowerCase();
        const show = text.includes(q);
        const el = grid.querySelector(`.project-card:has(img[alt="${CSS.escape(p.title)} cover"])`);
        // If :has not supported, fallback by searching by title text content
        let matchedEl = null;
        if (el) matchedEl = el.closest('.col-sm-6');
        if (!matchedEl) {
          // find by inner text
          matchedEl = Array.from(items).find(col => col.innerText && col.innerText.toLowerCase().includes((p.title||'').toLowerCase()));
        }
        if (matchedEl) matchedEl.style.display = show ? '' : 'none';
      });
    }

    const inpList = [searchTop, searchOff].filter(Boolean);
    inpList.forEach(inp => inp.addEventListener('input', (e) => filter(e.target.value)));
    // also handle initial query from hash like #q=...
    const m = window.location.hash.match(/q=([^&]+)/);
    if (m) {
      const val = decodeURIComponent(m[1]);
      inpList.forEach(i => i.value = val);
      filter(val);
    }
  }

  // Small helpers to avoid XSS when injecting HTML
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  // load, render, and wire search
  const projects = await loadProjects();
  setupSearch(projects);

})();
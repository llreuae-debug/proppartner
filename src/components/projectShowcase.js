// Interactive Featured Projects Showcase with 3D Card Tilt and Detail Modals

import { initialProjects, formatCurrency, formatCompactCurrency } from '../data/projectsData.js';

export function initProjectShowcase(containerElement, openModalCallback, currency = 'PKR') {
  if (!containerElement) return null;

  let currentCategory = 'all';
  let projectsList = [...initialProjects];

  const categories = [
    { id: 'all', label: 'All Developments' },
    { id: 'residential', label: 'Luxury Towers' },
    { id: 'villas', label: 'Waterfront & Villas' },
    { id: 'commercial', label: 'Commercial Hubs' }
  ];

  function getFilteredProjects() {
    if (currentCategory === 'residential') {
      return projectsList.filter(p => p.type.includes('Residential') || p.type.includes('Townhomes'));
    }
    if (currentCategory === 'villas') {
      return projectsList.filter(p => p.type.includes('Villas') || p.type.includes('Eco'));
    }
    if (currentCategory === 'commercial') {
      return projectsList.filter(p => p.type.includes('Commercial') || p.type.includes('Retail'));
    }
    return projectsList;
  }

  function render() {
    const filtered = getFilteredProjects();

    containerElement.innerHTML = `
      <div class="projects-showcase-wrapper">
        <!-- Category Filter Tabs -->
        <div class="projects-filter-bar">
          ${categories.map(cat => `
            <button type="button" class="filter-chip ${currentCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <!-- Projects Grid -->
        <div class="projects-grid">
          ${filtered.map(project => {
            const estimatedComm = (project.startingPrice * project.commissionRate) / 100;
            return `
              <div class="project-card glass-card tilt-target-3d" data-id="${project.id}">
                <!-- Card Media -->
                <div class="project-media">
                  <img src="${project.image}" alt="${project.name}" class="project-thumb" loading="lazy">
                  <div class="project-badge-pill">${project.badge}</div>
                  <div class="project-status-tag ${project.status.toLowerCase().replace(/\s+/g, '-')}">
                    <span class="status-dot"></span>
                    ${project.status}
                  </div>
                </div>

                <!-- Card Content -->
                <div class="project-body">
                  <div class="project-meta-top">
                    <span class="project-type-tag"><i data-lucide="building-2"></i> ${project.type}</span>
                    <span class="project-loc"><i data-lucide="map-pin"></i> ${project.location}</span>
                  </div>

                  <h3 class="project-title">${project.name}</h3>
                  <p class="project-tagline">${project.tagline}</p>

                  <!-- Financial Matrix -->
                  <div class="project-financials-grid">
                    <div class="fin-box">
                      <span class="fin-lbl">Starting Price</span>
                      <strong class="fin-val">${formatCompactCurrency(project.startingPrice, currency)}</strong>
                    </div>
                    <div class="fin-box highlight-gold">
                      <span class="fin-lbl">Commission Rate</span>
                      <strong class="fin-val gold">${project.commissionRate}%</strong>
                    </div>
                    <div class="fin-box">
                      <span class="fin-lbl">Est. Earning / Unit</span>
                      <strong class="fin-val cyan">${formatCompactCurrency(estimatedComm, currency)}</strong>
                    </div>
                    <div class="fin-box">
                      <span class="fin-lbl">Available Units</span>
                      <strong class="fin-val">${project.availableUnits} of ${project.totalUnits}</strong>
                    </div>
                  </div>

                  <!-- Eligibility -->
                  <div class="project-eligibility">
                    <i data-lucide="shield-check" class="accent-gold"></i>
                    <span>${project.affiliateEligibility}</span>
                  </div>

                  <!-- Actions -->
                  <div class="project-card-actions">
                    <button type="button" class="btn btn-secondary btn-sm view-project-btn" data-id="${project.id}">
                      <i data-lucide="eye"></i>
                      <span>VIEW PROJECT</span>
                    </button>
                    <button type="button" class="btn btn-gold btn-sm promote-project-btn" data-id="${project.id}">
                      <i data-lucide="share-2"></i>
                      <span>PROMOTE</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Filter Listeners
    containerElement.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-category');
        render();
      });
    });

    // View Project Button Listeners
    containerElement.querySelectorAll('.view-project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const project = projectsList.find(p => p.id === id);
        if (project && openModalCallback) {
          openModalCallback('project-detail', project);
        }
      });
    });

    // Promote Project Button Listeners
    containerElement.querySelectorAll('.promote-project-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const project = projectsList.find(p => p.id === id);
        if (project && openModalCallback) {
          openModalCallback('promote-project', project);
        }
      });
    });

    // Apply 3D Tilt Effect on Cards
    attach3DTilt(containerElement);
  }

  render();

  return {
    setCurrency: (newCurrency) => {
      currency = newCurrency;
      render();
    },
    updateProjects: (newProjects) => {
      projectsList = [...newProjects];
      render();
    }
  };
}

// 2026 Minimalist Anti-Gravity 3D Card Controller
function attach3DTilt(container) {
  const cards = container.querySelectorAll('.tilt-target-3d');
  cards.forEach(card => {
    let rafId = null;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let targetFloatY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    let currentFloatY = 0;
    let isHovered = false;

    // Enable 3D perspective & preserve-3d
    card.style.transformStyle = 'preserve-3d';
    card.style.perspective = '1200px';
    card.style.willChange = 'transform';

    // Apply spatial z-depth to children
    const media = card.querySelector('.project-media');
    if (media) {
      media.style.transform = 'translateZ(30px)';
      media.style.transformStyle = 'preserve-3d';
    }
    const badge = card.querySelector('.project-badge-pill');
    if (badge) badge.style.transform = 'translateZ(45px)';
    const body = card.querySelector('.project-body');
    if (body) {
      body.style.transform = 'translateZ(20px)';
      body.style.transformStyle = 'preserve-3d';
    }

    function updatePhysics() {
      if (isHovered) {
        currentRotateX += (targetRotateX - currentRotateX) * 0.15;
        currentRotateY += (targetRotateY - currentRotateY) * 0.15;
        currentFloatY += (targetFloatY - currentFloatY) * 0.15;

        card.style.transform = `perspective(1200px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translateY(${currentFloatY.toFixed(2)}px) translateZ(10px)`;
        rafId = requestAnimationFrame(updatePhysics);
      } else {
        currentRotateX += (0 - currentRotateX) * 0.12;
        currentRotateY += (0 - currentRotateY) * 0.12;
        currentFloatY += (0 - currentFloatY) * 0.12;

        if (Math.abs(currentRotateX) > 0.01 || Math.abs(currentRotateY) > 0.01 || Math.abs(currentFloatY) > 0.01) {
          card.style.transform = `perspective(1200px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translateY(${currentFloatY.toFixed(2)}px) translateZ(0px)`;
          rafId = requestAnimationFrame(updatePhysics);
        } else {
          card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px)';
          cancelAnimationFrame(rafId);
        }
      }
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

      targetRotateX = mouseY * -14;
      targetRotateY = mouseX * 14;
      targetFloatY = mouseY * -8;

      if (!isHovered) {
        isHovered = true;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(updatePhysics);
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetRotateX = 0;
      targetRotateY = 0;
      targetFloatY = 0;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePhysics);
    });
  });
}

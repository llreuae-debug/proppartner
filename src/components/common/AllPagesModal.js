// All Pages & Modules Directory Modal - PropPartner
// Provides a unified, ultra-modern glassmorphic sitemap and 1-click page switcher

import { evaluateRouting } from '../../main.js';

export function openAllPagesModal() {
  let modal = document.getElementById('all-pages-directory-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'all-pages-directory-modal';
    modal.className = 'auth-modal-backdrop active';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'all-pages-title');
    document.body.appendChild(modal);
  } else {
    modal.classList.add('active');
  }

  const pageGroups = [
    {
      category: '🌟 Public Experience & Overview',
      color: '#D4AF37',
      pages: [
        { title: 'Home Landing Page', desc: '3D Interactive Skyscraper Hero, Stats & Live Ecosystem', hash: '#home', icon: 'globe', badge: 'Main Home' },
        { title: 'Affiliate Program', desc: 'Partner structure, qualification tiers & institutional perks', hash: '#affiliate-program', icon: 'users', badge: 'Overview' },
        { title: 'How It Works', desc: '6-step blueprint from referral introduction to direct bank payout', hash: '#how-it-works', icon: 'zap', badge: 'Process' },
        { title: 'Commission Calculator', desc: 'Interactive earning simulator & tier-based matrix', hash: '#commission', icon: 'calculator', badge: 'Calculator' },
        { title: 'Resources & Marketing Hub', desc: 'Brochures, 4K renders, pitch decks & WhatsApp scripts', hash: '#resources', icon: 'book-open', badge: 'Toolkit' },
        { title: 'About PropPartner', desc: 'Leadership vision, Dubai trade corridors & commercial ecosystem', hash: '#about', icon: 'building', badge: 'Company' },
        { title: 'Contact & Support Desk', desc: '24/7 Affiliate WhatsApp Desk, Phone & Office Locations', hash: '#contact', icon: 'phone-call', badge: '24/7 Desk' },
        { title: 'Partner Registration', desc: '60-second onboard application & VIP partner invite', hash: '#register', icon: 'user-plus', badge: 'Apply' }
      ]
    },
    {
      category: '🏢 Commercial Real Estate Projects',
      color: '#00F2FE',
      pages: [
        { title: 'All Projects Directory', desc: 'Curated commercial hubs, trade plazas & luxury residences', hash: '#projects', icon: 'layout-grid', badge: 'All Projects' },
        { title: 'Gatwala Commercial Hub', desc: 'Flagship retail complex, brand shops & food court on Canal Exp.', hash: '#projects/gatwala-commercial-hub', icon: 'shopping-bag', badge: 'Flagship 4.0%' },
        { title: 'Dragon Souk Commercial Market', desc: 'Grand wholesale & import mega market (Dubai Dragon Mart model)', hash: '#projects/dragon-souk-plaza', icon: 'layers', badge: 'High Yield 4.5%' },
        { title: 'The Luminary Sky Residences', desc: '45-story luxury residential tower, smart homes & sky penthouses', hash: '#projects/the-luminary-towers', icon: 'tower-control', badge: 'Luxury 3.5%' },
        { title: 'Elysium Waterfront Villas', desc: 'Exclusive private island beachfront villas & marina docks', hash: '#projects/elysium-waterfront', icon: 'compass', badge: 'Top Tier 4.5%' }
      ]
    },
    {
      category: '⚖️ Legal, Escrow & Compliance Vault',
      color: '#94A3B8',
      pages: [
        { title: 'Terms & Conditions', desc: 'Binding platform operating rules and legal covenants', hash: '#terms-and-conditions', icon: 'file-text', badge: 'Legal' },
        { title: 'Affiliate Agreement', desc: 'Formal commission entitlement and representation contract', hash: '#affiliate-agreement', icon: 'file-check', badge: 'Contract' },
        { title: 'Privacy Policy', desc: 'Data protection, GDPR & 256-bit encryption protocols', hash: '#privacy-policy', icon: 'shield', badge: 'Privacy' },
        { title: 'Commission Policy', desc: 'Milestone token clearance and escrow wire disbursement schedules', hash: '#commission-policy', icon: 'badge-dollar-sign', badge: 'Payouts' },
        { title: 'Referral & Lead Lock Policy', desc: '90-day CRM lock, duplicate resolution & attribution rules', hash: '#referral-policy', icon: 'user-check', badge: '90-Day Lock' },
        { title: 'Regulatory Disclaimer', desc: 'Non-speculative disclosure & investment regulatory notices', hash: '#disclaimer', icon: 'alert-triangle', badge: 'Notice' }
      ]
    },
    {
      category: '🔐 Workspaces & Authenticated Portals',
      color: '#10B981',
      pages: [
        { title: 'Super Admin Commercial ERP', desc: 'Executive BI Dashboard, inventory, partner CRM, ledgers & audit', hash: '#admin', icon: 'shield-check', badge: 'Admin Suite' },
        { title: 'Partner Earnings Portal', desc: 'My deals, QR generator, referral links, statement & bank payouts', hash: '#partner', icon: 'briefcase', badge: 'Partner Suite' },
        { title: 'Private ERP Login Gateway', desc: 'Authorized single sign-on & crypto-hashed access portal', hash: '#login', icon: 'log-in', badge: 'Auth Gateway' }
      ]
    }
  ];

  modal.innerHTML = `
    <div class="auth-modal-dialog glass-card all-pages-modal-dialog" style="max-width: 960px; width: 95%; max-height: 88vh; display: flex; flex-direction: column; padding: 28px; border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.3); box-shadow: 0 30px 80px rgba(0,0,0,0.85); background: rgba(10, 14, 23, 0.96); backdrop-filter: blur(25px); position: relative; animation: modalFadeIn 0.2s ease-out;">
      
      <!-- Modal Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 18px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.3); display: flex; align-items: center; justify-content: center;">
            <i data-lucide="layout-grid" style="width: 22px; height: 22px; color: #D4AF37;"></i>
          </div>
          <div>
            <h2 id="all-pages-title" style="font-size: 1.35rem; font-weight: 700; color: #FFFFFF; margin: 0 0 2px 0; letter-spacing: -0.01em;">
              PropPartner <span class="gradient-text-gold">All Pages & Modules</span> Directory
            </h2>
            <p style="font-size: 0.82rem; color: #94A3B8; margin: 0;">
              Instant 1-click navigation to every public page, project detail, legal document, and private portal
            </p>
          </div>
        </div>

        <button type="button" class="auth-modal-close" id="btn-close-all-pages-modal" aria-label="Close Directory" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94A3B8; cursor: pointer; padding: 8px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease;">
          <i data-lucide="x" style="width: 20px; height: 20px;"></i>
        </button>
      </div>

      <!-- Quick Search Filter -->
      <div style="margin-bottom: 20px; position: relative;">
        <i data-lucide="search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #64748B;"></i>
        <input type="text" id="all-pages-search" placeholder="Type to filter pages (e.g. Gatwala, Commission, Partner, Privacy, Agreement, Admin)..." style="width: 100%; padding: 12px 16px 12px 46px; background: rgba(255,255,255,0.04); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; color: #FFFFFF; font-size: 0.9rem; outline: none; transition: border-color 0.2s ease;">
      </div>

      <!-- Scrollable Pages Directory Body -->
      <div class="all-pages-body-scroll" style="flex: 1; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 24px;">
        ${pageGroups.map(group => `
          <div class="page-group-section" data-group-name="${group.category.toLowerCase()}">
            <div style="font-size: 0.82rem; font-weight: 700; color: ${group.color}; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>${group.category}</span>
              <span style="flex: 1; height: 1px; background: rgba(255,255,255,0.06);"></span>
            </div>

            <div class="pages-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
              ${group.pages.map(page => `
                <a href="${page.hash}" class="page-directory-card page-item-link" data-search-text="${(page.title + ' ' + page.desc + ' ' + page.hash + ' ' + page.badge).toLowerCase()}" style="display: flex; flex-direction: column; justify-content: space-between; padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; text-decoration: none; color: #FFFFFF; transition: all 0.2s ease; position: relative;">
                  <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="${page.icon}" style="width: 16px; height: 16px; color: ${group.color};"></i>
                        <span style="font-weight: 600; font-size: 0.9rem; color: #FFFFFF;">${page.title}</span>
                      </div>
                      <span style="font-size: 0.68rem; font-weight: 700; padding: 2px 7px; border-radius: 6px; background: rgba(255,255,255,0.06); color: ${group.color}; border: 1px solid rgba(255,255,255,0.1);">
                        ${page.badge}
                      </span>
                    </div>
                    <p style="font-size: 0.78rem; color: #94A3B8; margin: 0 0 8px 0; line-height: 1.4;">
                      ${page.desc}
                    </p>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; color: #64748B; font-family: monospace;">
                    <span>${page.hash}</span>
                    <i data-lucide="arrow-right" style="width: 13px; height: 13px; color: #D4AF37;"></i>
                  </div>
                </a>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Modal Footer -->
      <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: #64748B;">
        <span>PropPartner 2026 Minimalist Real Estate Platform · All 20+ Routes Live</span>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-close-all-pages-footer" style="padding: 6px 14px; font-size: 0.8rem;">
          Close Directory
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const closeBtn = modal.querySelector('#btn-close-all-pages-modal');
  const closeFooterBtn = modal.querySelector('#btn-close-all-pages-footer');
  const searchInput = modal.querySelector('#all-pages-search');
  const pageLinks = modal.querySelectorAll('.page-item-link');

  function closeModal() {
    modal.classList.remove('active');
  }

  if (closeBtn) closeBtn.onclick = closeModal;
  if (closeFooterBtn) closeFooterBtn.onclick = closeModal;

  // Search filtering
  if (searchInput) {
    searchInput.focus();
    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      pageLinks.forEach(link => {
        const text = link.getAttribute('data-search-text') || '';
        if (!q || text.includes(q)) {
          link.style.display = 'flex';
        } else {
          link.style.display = 'none';
        }
      });
    };
  }

  // Handle clicking on any page link
  pageLinks.forEach(link => {
    link.onclick = (e) => {
      const href = link.getAttribute('href');
      closeModal();
      if (href) {
        window.location.hash = href;
        if (typeof evaluateRouting === 'function') {
          evaluateRouting();
        }
      }
    };
  });

  // Close on backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

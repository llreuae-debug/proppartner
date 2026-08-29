// Interactive 3D Affiliate Dashboard Preview

import { dashboardMockData } from '../data/affiliateData.js';
import { formatCurrency, formatCompactCurrency } from '../data/projectsData.js';

export function initDashboardPreview(containerElement, currency = 'PKR') {
  if (!containerElement) return null;

  let activeTab = 'earnings'; // 'earnings' | 'referrals' | 'funnel'

  function renderChartSVG() {
    const data = dashboardMockData.monthlyData;
    const width = 600;
    const height = 180;
    const padding = 30;

    if (activeTab === 'earnings') {
      const maxVal = Math.max(...data.map(d => d.commission)) * 1.2;
      const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - (d.commission / maxVal) * (height - padding * 2);
        return { x, y, val: d.commission, label: d.month };
      });

      const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
      const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

      return `
        <svg viewBox="0 0 ${width} ${height}" class="dashboard-chart-svg">
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.45" />
              <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.0" />
            </linearGradient>
          </defs>
          <!-- Grid Lines -->
          <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="4"/>
          
          <!-- Area & Line -->
          <path d="${areaD}" fill="url(#goldGradient)" />
          <path d="${pathD}" fill="none" stroke="#D4AF37" stroke-width="3" stroke-linecap="round" />
          
          <!-- Points -->
          ${points.map(p => `
            <circle cx="${p.x}" cy="${p.y}" r="5" fill="#080B11" stroke="#00F2FE" stroke-width="2.5" />
            <text x="${p.x}" y="${height - 10}" text-anchor="middle" fill="#94A3B8" font-size="11" font-family="Plus Jakarta Sans">${p.label}</text>
            <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" fill="#E2E8F0" font-size="10" font-weight="600">${formatCompactCurrency(p.val, currency)}</text>
          `).join('')}
        </svg>
      `;
    } else if (activeTab === 'referrals') {
      const maxVal = Math.max(...data.map(d => d.referrals)) * 1.3;
      const barWidth = 36;
      return `
        <svg viewBox="0 0 ${width} ${height}" class="dashboard-chart-svg">
          ${data.map((d, i) => {
            const x = padding + 40 + i * ((width - padding * 2) / data.length);
            const barH = (d.referrals / maxVal) * (height - padding * 2);
            const y = height - padding - barH;
            return `
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="6" fill="#00F2FE" opacity="0.85" />
              <text x="${x + barWidth / 2}" y="${height - 10}" text-anchor="middle" fill="#94A3B8" font-size="11">${d.month}</text>
              <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700">${d.referrals}</text>
            `;
          }).join('')}
        </svg>
      `;
    } else {
      // Funnel view
      return `
        <div class="funnel-simulation">
          <div class="funnel-step-bar" style="width: 100%;">
            <span>Total Clicks & Inquiries: 128 (100%)</span>
          </div>
          <div class="funnel-step-bar" style="width: 65%;">
            <span>Qualified Consultations: 74 (57.8%)</span>
          </div>
          <div class="funnel-step-bar" style="width: 32%;">
            <span>VIP Site Inspections: 38 (29.6%)</span>
          </div>
          <div class="funnel-step-bar active" style="width: 16%;">
            <span>Sales Completed & Paid: 19 (14.8%)</span>
          </div>
        </div>
      `;
    }
  }

  function render() {
    const stats = dashboardMockData.stats;

    containerElement.innerHTML = `
      <div class="dash-mockup-window glass-card tilt-target-3d">
        <!-- Mockup Top Bar -->
        <div class="dash-top-bar">
          <div class="dash-window-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="dash-window-title">
            <img src="/assets/proppartner-icon.jpg" alt="PropPartner" style="width:20px; height:20px; border-radius:5px; object-fit:cover; vertical-align:middle; margin-right:6px; border:1px solid rgba(26,155,107,0.5);">
            <i data-lucide="shield-check" style="width:14px; height:14px; color:#10B981"></i>
            <span>PROPPARTNER 3D — LIVE PARTNER SESSION</span>
          </div>
          <div class="dash-user-pill">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Partner Avatar" class="dash-avatar">
            <span>Kamran Z. (VIP Tier)</span>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="dash-kpi-grid">
          <div class="dash-kpi-card">
            <div class="kpi-icon-wrap"><i data-lucide="users"></i></div>
            <div class="kpi-meta">
              <span class="kpi-label">TOTAL REFERRALS</span>
              <span class="kpi-value">${stats.totalReferrals}</span>
              <span class="kpi-sub green">+22% this month</span>
            </div>
          </div>

          <div class="dash-kpi-card">
            <div class="kpi-icon-wrap cyan"><i data-lucide="user-check"></i></div>
            <div class="kpi-meta">
              <span class="kpi-label">QUALIFIED LEADS</span>
              <span class="kpi-value">${stats.qualifiedLeads}</span>
              <span class="kpi-sub">57.8% ratio</span>
            </div>
          </div>

          <div class="dash-kpi-card">
            <div class="kpi-icon-wrap gold"><i data-lucide="award"></i></div>
            <div class="kpi-meta">
              <span class="kpi-label">CONVERTED SALES</span>
              <span class="kpi-value">${stats.convertedSales}</span>
              <span class="kpi-sub gold">${stats.conversionRate} Conversion</span>
            </div>
          </div>

          <div class="dash-kpi-card">
            <div class="kpi-icon-wrap emerald"><i data-lucide="banknote"></i></div>
            <div class="kpi-meta">
              <span class="kpi-label">PAID COMMISSION</span>
              <span class="kpi-value accent-gold">${formatCurrency(stats.paidCommission, currency)}</span>
              <span class="kpi-sub green">Verified & Disbursed</span>
            </div>
          </div>
        </div>

        <!-- Middle Row: Interactive Chart + Lead Activity Feed -->
        <div class="dash-content-split">
          <!-- Chart Section -->
          <div class="dash-chart-box">
            <div class="dash-chart-header">
              <div>
                <h4 class="chart-box-title">Commission & Growth Trajectory</h4>
                <p class="chart-box-sub">Real-time revenue attribution & deal analytics</p>
              </div>
              <div class="dash-chart-tabs">
                <button type="button" class="chart-tab-btn ${activeTab === 'earnings' ? 'active' : ''}" data-tab="earnings">Earnings</button>
                <button type="button" class="chart-tab-btn ${activeTab === 'referrals' ? 'active' : ''}" data-tab="referrals">Referrals</button>
                <button type="button" class="chart-tab-btn ${activeTab === 'funnel' ? 'active' : ''}" data-tab="funnel">Funnel</button>
              </div>
            </div>
            <div class="dash-chart-viewport" id="chart-viewport-area">
              ${renderChartSVG()}
            </div>
          </div>

          <!-- Live Activity Feed -->
          <div class="dash-feed-box">
            <div class="feed-header">
              <span class="live-pulse"></span>
              <h4>Live Lead Tracker Feed</h4>
            </div>
            <div class="dash-feed-list">
              ${dashboardMockData.recentLeads.map(lead => `
                <div class="dash-feed-item">
                  <div class="feed-item-top">
                    <strong>${lead.name}</strong>
                    <span class="feed-badge ${lead.badge}">${lead.status}</span>
                  </div>
                  <div class="feed-item-project">${lead.project}</div>
                  <div class="feed-item-bottom">
                    <span class="feed-comm">${lead.commission}</span>
                    <span class="feed-date">${lead.date}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Dashboard Footer CTA -->
        <div class="dash-footer-cta-row">
          <div class="dash-footer-info">
            <i data-lucide="sparkles" class="accent-gold"></i>
            <span>Ready to activate your own automated referral portal and track live commissions?</span>
          </div>
          <a href="#register" class="btn btn-gold btn-sm">
            <span>CREATE YOUR AFFILIATE ACCOUNT</span>
            <i data-lucide="arrow-right"></i>
          </a>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Chart Tab Listeners
    containerElement.querySelectorAll('.chart-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      });
    });
  }

  render();

  return {
    setCurrency: (newCurrency) => {
      currency = newCurrency;
      render();
    }
  };
}

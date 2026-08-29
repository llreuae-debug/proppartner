// Interactive 3D Real Estate Commission Calculator

import { formatCurrency, formatCompactCurrency } from '../data/projectsData.js';
import confetti from 'canvas-confetti';

export function initCommissionCalculator(containerElement, currentCurrencyState = 'PKR') {
  if (!containerElement) return null;

  let state = {
    price: 38500000, // PKR 38.5M
    rate: 3.5, // 3.5%
    sales: 3, // 3 sales
    currency: currentCurrencyState
  };

  const projectPresets = [
    { name: "The Luminary Towers", price: 38500000, rate: 3.5 },
    { name: "Elysium Waterfront", price: 65000000, rate: 4.5 },
    { name: "Nexus Horizon Hub", price: 24500000, rate: 3.0 },
    { name: "Solaria Penthouses", price: 92000000, rate: 5.0 }
  ];

  function getTier(totalComm) {
    if (totalComm >= 8000000) return { name: "Diamond Syndicate", badge: "VIP Elite", color: "#00F2FE", perk: "Priority Off-Market Allocations + Private Concierge" };
    if (totalComm >= 4000000) return { name: "Platinum Partner", badge: "Tier 1", color: "#D4AF37", perk: "+0.5% Commission Bonus + Dedicated Closing Director" };
    if (totalComm >= 1500000) return { name: "Gold Ambassador", badge: "Tier 2", color: "#E5C07B", perk: "Custom White-Label Decks + Lead Acceleration Desk" };
    return { name: "Silver Associate", badge: "Standard", color: "#94A3B8", perk: "Full Marketing Kit + 90-Day Lead CRM Lock" };
  }

  function render() {
    const commissionPerSale = (state.price * state.rate) / 100;
    const totalPotentialCommission = commissionPerSale * state.sales;
    const totalVolume = state.price * state.sales;
    const tier = getTier(totalPotentialCommission);

    containerElement.innerHTML = `
      <div class="calc-wrapper glass-card tilt-target-3d">
        <div class="calc-header">
          <div class="calc-badge"><i data-lucide="calculator"></i> REAL-TIME EARNING SIMULATOR</div>
          <h3 class="calc-title">Calculate Your Referral Earning Potential</h3>
          <p class="calc-desc">Select a project preset or adjust custom sliders to visualize transparent transaction rewards.</p>
          
          <!-- Presets -->
          <div class="calc-presets">
            <span class="preset-label">Quick Presets:</span>
            ${projectPresets.map(p => `
              <button type="button" class="preset-btn ${state.price === p.price && state.rate === p.rate ? 'active' : ''}" data-price="${p.price}" data-rate="${p.rate}">
                ${p.name}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="calc-grid">
          <!-- Controls Column -->
          <div class="calc-controls">
            <!-- Project Price Slider -->
            <div class="slider-group">
              <div class="slider-label-row">
                <label for="calc-price-slider">Average Project Price</label>
                <span class="slider-val-display" id="calc-price-val">${formatCurrency(state.price, state.currency)}</span>
              </div>
              <input type="range" id="calc-price-slider" min="5000000" max="120000000" step="500000" value="${state.price}" class="custom-slider">
              <div class="slider-scale">
                <span>PKR 5M</span>
                <span>PKR 60M</span>
                <span>PKR 120M+</span>
              </div>
            </div>

            <!-- Commission Rate Slider -->
            <div class="slider-group">
              <div class="slider-label-row">
                <label for="calc-rate-slider">Affiliate Commission Rate</label>
                <span class="slider-val-display accent-gold" id="calc-rate-val">${state.rate.toFixed(1)}%</span>
              </div>
              <input type="range" id="calc-rate-slider" min="1.5" max="6.0" step="0.1" value="${state.rate}" class="custom-slider">
              <div class="slider-scale">
                <span>1.5%</span>
                <span>3.5% (Standard)</span>
                <span>6.0%</span>
              </div>
            </div>

            <!-- Number of Closed Referrals -->
            <div class="slider-group">
              <div class="slider-label-row">
                <label for="calc-sales-slider">Number of Closed Referrals</label>
                <span class="slider-val-display" id="calc-sales-val">${state.sales} ${state.sales === 1 ? 'Sale' : 'Sales'}</span>
              </div>
              <input type="range" id="calc-sales-slider" min="1" max="15" step="1" value="${state.sales}" class="custom-slider">
              <div class="slider-scale">
                <span>1 Deal</span>
                <span>5 Deals</span>
                <span>15 Deals</span>
              </div>
            </div>
          </div>

          <!-- Output Display Column -->
          <div class="calc-output-panel">
            <div class="output-header-tag">
              <span class="pulse-indicator"></span> ESTIMATED EARNING POTENTIAL
            </div>

            <div class="output-main-stat">
              <div class="output-sublabel">Total Potential Commission</div>
              <div class="output-number odometer-val" id="calc-total-payout" style="color: #D4AF37">
                ${formatCurrency(totalPotentialCommission, state.currency)}
              </div>
              <div class="output-per-deal">
                Approx. <strong>${formatCurrency(commissionPerSale, state.currency)}</strong> per successful sale
              </div>
            </div>

            <!-- Breakdown Matrix -->
            <div class="output-breakdown-grid">
              <div class="breakdown-item">
                <span class="b-label">Total Volume Generated</span>
                <span class="b-val">${formatCompactCurrency(totalVolume, state.currency)}</span>
              </div>
              <div class="breakdown-item">
                <span class="b-label">Partner Tier</span>
                <span class="b-val" style="color: ${tier.color}; font-weight: 700;">${tier.name}</span>
              </div>
            </div>

            <!-- Tier Perks Box -->
            <div class="tier-perk-box" style="border-left: 3px solid ${tier.color}">
              <div class="tier-perk-title"><i data-lucide="sparkles"></i> Unlocked Partner Benefits</div>
              <p class="tier-perk-desc">${tier.perk}</p>
            </div>

            <!-- Action CTA -->
            <div class="calc-cta-row">
              <a href="#register" class="btn btn-gold w-full">
                <i data-lucide="arrow-right-circle"></i>
                <span>CLAIM THIS EARNING POTENTIAL</span>
              </a>
            </div>

            <!-- Mandatory Legal Disclaimer -->
            <p class="calc-disclaimer">
              <i data-lucide="info"></i>
              <strong>Illustrative calculation only.</strong> Actual commissions depend on project-specific terms, eligibility, transaction completion, and the official affiliate agreement. No income or commission is guaranteed.
            </p>
          </div>
        </div>
      </div>
    `;

    // Re-initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Attach Event Listeners
    const priceSlider = containerElement.querySelector('#calc-price-slider');
    const rateSlider = containerElement.querySelector('#calc-rate-slider');
    const salesSlider = containerElement.querySelector('#calc-sales-slider');

    const updateCalculations = () => {
      state.price = parseFloat(priceSlider.value);
      state.rate = parseFloat(rateSlider.value);
      state.sales = parseInt(salesSlider.value, 10);
      render();
    };

    priceSlider?.addEventListener('input', updateCalculations);
    rateSlider?.addEventListener('input', updateCalculations);
    salesSlider?.addEventListener('input', updateCalculations);

    // Preset Buttons
    containerElement.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.price = parseFloat(btn.getAttribute('data-price'));
        state.rate = parseFloat(btn.getAttribute('data-rate'));
        render();
        // Trigger celebratory confetti if high tier
        if (state.price * state.rate * state.sales / 100 > 3000000) {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#D4AF37', '#00F2FE', '#FFFFFF']
          });
        }
      });
    });
  }

  render();

  return {
    setCurrency: (newCurrency) => {
      state.currency = newCurrency;
      render();
    },
    updateState: (newState) => {
      state = { ...state, ...newState };
      render();
    }
  };
}

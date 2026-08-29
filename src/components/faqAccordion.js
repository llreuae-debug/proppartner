// Interactive Searchable FAQ Accordion

import { faqs } from '../data/affiliateData.js';

export function initFAQ(containerElement) {
  if (!containerElement) return;

  let searchQuery = '';
  let activeIndex = 0; // first FAQ open by default

  function render() {
    const filtered = faqs.filter(item => {
      const q = searchQuery.toLowerCase();
      return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    });

    containerElement.innerHTML = `
      <div class="faq-inner-container">
        <!-- Search input -->
        <div class="faq-search-bar">
          <i data-lucide="search" class="faq-search-icon"></i>
          <input type="text" id="faq-search-input" placeholder="Search questions (e.g. commission payout, tracking, requirements)..." value="${searchQuery}" class="faq-search-field">
          ${searchQuery ? `<button type="button" id="clear-faq-search" class="faq-clear-btn"><i data-lucide="x"></i></button>` : ''}
        </div>

        <!-- Accordion List -->
        <div class="faq-accordion-list">
          ${filtered.length === 0 ? `
            <div class="faq-no-results">
              <i data-lucide="help-circle"></i>
              <p>No matching questions found. Have a specific question? Contact our partner team directly.</p>
            </div>
          ` : filtered.map((item, idx) => {
            const isOpen = activeIndex === idx;
            return `
              <div class="faq-item glass-card ${isOpen ? 'active' : ''}" data-index="${idx}">
                <button type="button" class="faq-question-btn" aria-expanded="${isOpen}">
                  <span class="faq-q-text">${item.question}</span>
                  <span class="faq-cat-tag">${item.category}</span>
                  <span class="faq-icon-wrapper">
                    <i data-lucide="${isOpen ? 'chevron-up' : 'chevron-down'}"></i>
                  </span>
                </button>
                <div class="faq-answer-collapse" style="${isOpen ? 'max-height: 500px; opacity: 1; padding: 0 24px 20px 24px;' : 'max-height: 0; opacity: 0; padding: 0 24px;'}">
                  <p class="faq-answer-text">${item.answer}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Accordion Toggle
    containerElement.querySelectorAll('.faq-question-btn').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        activeIndex = activeIndex === idx ? -1 : idx;
        render();
      });
    });

    // Search Listener
    const searchInput = containerElement.querySelector('#faq-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      activeIndex = 0;
      render();
      // Keep focus in input
      const newField = containerElement.querySelector('#faq-search-input');
      newField.focus();
      newField.setSelectionRange(newField.value.length, newField.value.length);
    });

    containerElement.querySelector('#clear-faq-search')?.addEventListener('click', () => {
      searchQuery = '';
      activeIndex = 0;
      render();
    });
  }

  render();
}

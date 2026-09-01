/**
 * FlyingScissor - VIP Booking Wizard Engine
 * 5-Step interactive booking experience with live price calculation and digital pass generation
 */

import { BARBERSHOP_DATA } from './data.js';
import { soundscape } from './audio.js';

export class BookingWizard {
  constructor() {
    this.modal = document.getElementById('bookingModal');
    this.currentStep = 1;
    this.totalSteps = 5;

    this.bookingState = {
      selectedServices: [],
      selectedAddons: [],
      selectedBarber: null,
      selectedDate: null,
      selectedTime: null,
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      specialNotes: '',
      beverageChoice: 'Fresh Italian Espresso',
      totalPrice: 0,
      totalDuration: 0,
      referenceCode: ''
    };

    this.init();
  }

  init() {
    if (!this.modal) return;

    this.bindGlobalTriggers();
    this.bindModalEvents();
    this.renderServicesStep();
    this.renderBarbersStep();
    this.renderDateTimesStep();
    this.renderAddons();
  }

  bindGlobalTriggers() {
    // Open modal buttons
    document.querySelectorAll('.open-booking-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const serviceId = btn.dataset.serviceId;
        const barberId = btn.dataset.barberId;
        this.open(serviceId, barberId);
      });
    });

    // Custom event from style studio or cards
    window.addEventListener('open-booking-flow', (e) => {
      const { serviceId, barberId, styleNote } = e.detail || {};
      if (styleNote) {
        this.bookingState.specialNotes = `Client requested style: ${styleNote}`;
      }
      this.open(serviceId, barberId);
    });
  }

  bindModalEvents() {
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    const backdrop = this.modal.querySelector('.modal-backdrop');

    closeBtn?.addEventListener('click', () => this.close());
    backdrop?.addEventListener('click', () => this.close());

    // Navigation buttons
    this.modal.querySelector('#btnNextStep')?.addEventListener('click', () => this.nextStep());
    this.modal.querySelector('#btnPrevStep')?.addEventListener('click', () => this.prevStep());

    // Keyboard ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }

  open(preselectedServiceId = null, preselectedBarberId = null) {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    soundscape.playScissorSnip();

    if (preselectedServiceId) {
      const srv = BARBERSHOP_DATA.services.find(s => s.id === preselectedServiceId);
      if (srv && !this.bookingState.selectedServices.some(s => s.id === srv.id)) {
        this.bookingState.selectedServices = [srv];
      }
    } else if (this.bookingState.selectedServices.length === 0) {
      this.bookingState.selectedServices = [BARBERSHOP_DATA.services[0]];
    }

    if (preselectedBarberId) {
      this.bookingState.selectedBarber = BARBERSHOP_DATA.barbers.find(b => b.id === preselectedBarberId) || null;
    }

    this.currentStep = 1;
    this.updateStepView();
    this.recalculateTotals();
  }

  close() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  renderServicesStep() {
    const container = this.modal.querySelector('#servicesSelectionGrid');
    if (!container) return;

    container.innerHTML = BARBERSHOP_DATA.services.map(s => `
      <div class="service-select-card ${this.bookingState.selectedServices.some(item => item.id === s.id) ? 'selected' : ''}" data-service-id="${s.id}">
        <div class="card-radio-mark"></div>
        <div class="card-info">
          <div class="card-top">
            <span class="card-badge">${s.badge}</span>
            <span class="card-price">Rs. ${s.price.toLocaleString()}</span>
          </div>
          <h4 class="card-title">${s.title}</h4>
          <p class="card-desc">${s.description}</p>
          <div class="card-meta">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${s.duration}</span>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.service-select-card').forEach(card => {
      card.addEventListener('click', () => {
        soundscape.playHoverBlade();
        const sId = card.dataset.serviceId;
        const srv = BARBERSHOP_DATA.services.find(s => s.id === sId);
        
        const existsIndex = this.bookingState.selectedServices.findIndex(s => s.id === sId);
        if (existsIndex > -1) {
          if (this.bookingState.selectedServices.length > 1) {
            this.bookingState.selectedServices.splice(existsIndex, 1);
            card.classList.remove('selected');
          }
        } else {
          this.bookingState.selectedServices.push(srv);
          card.classList.add('selected');
        }

        this.recalculateTotals();
      });
    });
  }

  renderAddons() {
    const container = this.modal.querySelector('#addonsSelectionGrid');
    if (!container) return;

    container.innerHTML = BARBERSHOP_DATA.vipAddons.map(a => `
      <div class="addon-chip ${this.bookingState.selectedAddons.some(item => item.id === a.id) ? 'selected' : ''}" data-addon-id="${a.id}">
        <div class="addon-check"></div>
        <div class="addon-details">
          <div class="addon-name">${a.name}</div>
          <div class="addon-desc">${a.desc}</div>
        </div>
        <div class="addon-price">${a.free ? 'COMPLIMENTARY' : '+Rs. ' + a.price.toLocaleString()}</div>
      </div>
    `).join('');

    container.querySelectorAll('.addon-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        soundscape.playHoverBlade();
        const aId = chip.dataset.addonId;
        const addon = BARBERSHOP_DATA.vipAddons.find(a => a.id === aId);
        const idx = this.bookingState.selectedAddons.findIndex(a => a.id === aId);
        if (idx > -1) {
          this.bookingState.selectedAddons.splice(idx, 1);
          chip.classList.remove('selected');
        } else {
          this.bookingState.selectedAddons.push(addon);
          chip.classList.add('selected');
        }
        this.recalculateTotals();
      });
    });
  }

  renderBarbersStep() {
    const container = this.modal.querySelector('#barberSelectionGrid');
    if (!container) return;

    const anyBarber = {
      id: "any",
      name: "First Available Master Stylist",
      title: "Fastest Availability",
      experience: "FlyingScissor Certified",
      specialty: "Instant Chair Allocation",
      bio: "Our concierge will assign the highest rated master stylist available on your arrival.",
      image: "assets/images/hero-lounge.jpg"
    };

    const allBarbers = [anyBarber, ...BARBERSHOP_DATA.barbers];

    container.innerHTML = allBarbers.map(b => `
      <div class="barber-select-card ${this.bookingState.selectedBarber?.id === b.id || (!this.bookingState.selectedBarber && b.id === 'any') ? 'selected' : ''}" data-barber-id="${b.id}">
        <img src="${b.image}" alt="${b.name}" class="barber-thumb">
        <div class="barber-select-info">
          <span class="barber-role">${b.title}</span>
          <h4 class="barber-name">${b.name}</h4>
          <p class="barber-spec">${b.specialty}</p>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.barber-select-card').forEach(card => {
      card.addEventListener('click', () => {
        soundscape.playHoverBlade();
        container.querySelectorAll('.barber-select-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const bId = card.dataset.barberId;
        this.bookingState.selectedBarber = allBarbers.find(b => b.id === bId) || null;
        this.updateSummaryBar();
      });
    });
  }

  renderDateTimesStep() {
    const daysContainer = this.modal.querySelector('#dateSelectionChips');
    const slotsContainer = this.modal.querySelector('#timeSlotsGrid');
    if (!daysContainer || !slotsContainer) return;

    // Generate upcoming 6 days
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }

    daysContainer.innerHTML = dates.map((d, index) => {
      const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      return `
        <button type="button" class="date-chip ${index === 0 ? 'selected' : ''}" data-full-date="${fullDateStr}">
          <span class="date-chip-day">${dayName}</span>
          <span class="date-chip-date">${monthDay}</span>
        </button>
      `;
    }).join('');

    this.bookingState.selectedDate = dates[0].toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    daysContainer.querySelectorAll('.date-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        soundscape.playHoverBlade();
        daysContainer.querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        this.bookingState.selectedDate = chip.dataset.fullDate;
        this.updateSummaryBar();
      });
    });

    const timeSlots = [
      { time: "11:00 AM", period: "Morning" },
      { time: "12:15 PM", period: "Morning" },
      { time: "01:30 PM", period: "Afternoon" },
      { time: "03:00 PM", period: "Afternoon" },
      { time: "04:30 PM", period: "Afternoon" },
      { time: "06:00 PM", period: "Evening" },
      { time: "07:30 PM", period: "Evening" },
      { time: "09:00 PM", period: "Night" },
      { time: "10:15 PM", period: "Night" }
    ];

    slotsContainer.innerHTML = timeSlots.map((slot, idx) => `
      <button type="button" class="time-slot-btn ${idx === 2 ? 'selected' : ''}" data-time="${slot.time}">
        <span class="slot-time">${slot.time}</span>
        <span class="slot-badge">${slot.period}</span>
      </button>
    `).join('');

    this.bookingState.selectedTime = timeSlots[2].time;

    slotsContainer.querySelectorAll('.time-slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        soundscape.playHoverBlade();
        slotsContainer.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.bookingState.selectedTime = btn.dataset.time;
        this.updateSummaryBar();
      });
    });
  }

  recalculateTotals() {
    let price = this.bookingState.selectedServices.reduce((sum, s) => sum + s.price, 0);
    let duration = this.bookingState.selectedServices.reduce((sum, s) => sum + s.durationMins, 0);

    price += this.bookingState.selectedAddons.reduce((sum, a) => sum + a.price, 0);

    this.bookingState.totalPrice = price;
    this.bookingState.totalDuration = duration;

    this.updateSummaryBar();
  }

  updateSummaryBar() {
    const summaryCount = this.modal.querySelector('#summaryServicesCount');
    const summaryPrice = this.modal.querySelector('#summaryTotalPrice');
    const summaryDuration = this.modal.querySelector('#summaryTotalDuration');
    const summaryBarber = this.modal.querySelector('#summarySelectedBarber');

    if (summaryCount) {
      const titles = this.bookingState.selectedServices.map(s => s.title).join(', ');
      summaryCount.textContent = titles || 'No service selected';
    }
    if (summaryPrice) {
      summaryPrice.textContent = `Rs. ${this.bookingState.totalPrice.toLocaleString()}`;
    }
    if (summaryDuration) {
      summaryDuration.textContent = `${this.bookingState.totalDuration} Mins`;
    }
    if (summaryBarber) {
      summaryBarber.textContent = this.bookingState.selectedBarber?.name || 'Shahzad / First Available';
    }
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (this.bookingState.selectedServices.length === 0) {
        alert('Please choose at least one signature service.');
        return;
      }
    } else if (this.currentStep === 4) {
      // Validate details
      const nameInput = this.modal.querySelector('#clientNameInput');
      const emailInput = this.modal.querySelector('#clientEmailInput');
      const phoneInput = this.modal.querySelector('#clientPhoneInput');
      const notesInput = this.modal.querySelector('#clientNotesInput');
      const beverageSelect = this.modal.querySelector('#clientWhiskeySelect');

      if (!nameInput?.value.trim()) {
        nameInput.focus();
        nameInput.classList.add('input-error');
        return;
      }
      if (!emailInput?.value.trim() || !emailInput.value.includes('@')) {
        emailInput.focus();
        emailInput.classList.add('input-error');
        return;
      }

      this.bookingState.clientName = nameInput.value.trim();
      this.bookingState.clientEmail = emailInput.value.trim();
      this.bookingState.clientPhone = phoneInput?.value.trim() || '+92 300 1234567';
      this.bookingState.specialNotes = notesInput?.value.trim() || this.bookingState.specialNotes;
      this.bookingState.beverageChoice = beverageSelect?.value || 'Fresh Italian Espresso';
      
      // Generate confirmation code
      const randomId = Math.floor(10000 + Math.random() * 90000);
      this.bookingState.referenceCode = `FS-${randomId}`;

      this.renderVipTicketPass();
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      soundscape.playScissorSnip();
      this.updateStepView();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      soundscape.playHoverBlade();
      this.updateStepView();
    }
  }

  updateStepView() {
    // Update step visibility
    this.modal.querySelectorAll('.wizard-step-pane').forEach((pane, idx) => {
      pane.classList.toggle('active', idx + 1 === this.currentStep);
    });

    // Update progress indicator
    this.modal.querySelectorAll('.step-indicator-item').forEach((item, idx) => {
      const stepNum = idx + 1;
      item.classList.toggle('active', stepNum === this.currentStep);
      item.classList.toggle('completed', stepNum < this.currentStep);
    });

    // Update navigation button states
    const btnPrev = this.modal.querySelector('#btnPrevStep');
    const btnNext = this.modal.querySelector('#btnNextStep');
    const modalFooter = this.modal.querySelector('.wizard-footer');

    if (btnPrev) {
      btnPrev.style.visibility = this.currentStep === 1 || this.currentStep === 5 ? 'hidden' : 'visible';
    }

    if (btnNext) {
      if (this.currentStep === 4) {
        btnNext.innerHTML = `<span>Confirm & Issue VIP Pass</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
      } else if (this.currentStep === 5) {
        modalFooter.style.display = 'none';
      } else {
        modalFooter.style.display = 'flex';
        btnNext.innerHTML = `<span>Next Step</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
      }
    }
  }

  renderVipTicketPass() {
    const ticketContainer = this.modal.querySelector('#vipTicketContainer');
    if (!ticketContainer) return;

    const barberName = this.bookingState.selectedBarber?.name || 'Shahzad (Founder & Master Stylist)';
    const srvNames = this.bookingState.selectedServices.map(s => s.title).join(' + ');

    ticketContainer.innerHTML = `
      <div class="vip-pass-card animate-pass-entry">
        <div class="pass-header">
          <div class="pass-brand">
            <svg class="pass-crown-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="6" cy="18" r="3"/>
              <path d="M8.5 15.5L20 4"/>
              <circle cx="18" cy="18" r="3"/>
              <path d="M15.5 15.5L4 4"/>
            </svg>
            <div>
              <h3 class="pass-title">FLYINGSCISSOR</h3>
              <p class="pass-subtitle">VIP SALOON APPOINTMENT PASS • FAISALABAD</p>
            </div>
          </div>
          <div class="pass-ref">
            <span class="ref-label">PASS REF</span>
            <span class="ref-code">#${this.bookingState.referenceCode}</span>
          </div>
        </div>

        <div class="pass-divider">
          <span class="cutout-left"></span>
          <span class="dashed-line"></span>
          <span class="cutout-right"></span>
        </div>

        <div class="pass-body">
          <div class="pass-grid">
            <div class="pass-col">
              <span class="pass-label">CLIENT NAME</span>
              <span class="pass-val">${this.bookingState.clientName}</span>
            </div>
            <div class="pass-col">
              <span class="pass-label">MASTER STYLIST</span>
              <span class="pass-val">${barberName}</span>
            </div>
            <div class="pass-col">
              <span class="pass-label">APPOINTMENT DATE</span>
              <span class="pass-val">${this.bookingState.selectedDate}</span>
            </div>
            <div class="pass-col">
              <span class="pass-label">CHAIR TIME</span>
              <span class="pass-val highlight-gold">${this.bookingState.selectedTime}</span>
            </div>
            <div class="pass-col full-width">
              <span class="pass-label">RITUALS & SERVICES</span>
              <span class="pass-val">${srvNames}</span>
            </div>
            <div class="pass-col">
              <span class="pass-label">COMPLIMENTARY BEVERAGE</span>
              <span class="pass-val">${this.bookingState.beverageChoice}</span>
            </div>
            <div class="pass-col">
              <span class="pass-label">TOTAL DURATION / ESTIMATE</span>
              <span class="pass-val">${this.bookingState.totalDuration} Mins / Rs. ${this.bookingState.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div class="pass-qr-section">
            <div class="qr-box">
              <canvas id="vipQrCanvas" width="90" height="90"></canvas>
            </div>
            <div class="pass-notes">
              <span class="gold-seal-badge">✂️ RESERVED VIP SALON CHAIR</span>
              <p class="concierge-note">Please show this digital pass upon arrival at FlyingScissor, D-Ground / Kohinoor City, Faisalabad. Dedicated parking is reserved for your slot.</p>
            </div>
          </div>
        </div>

        <div class="pass-actions">
          <button type="button" class="btn-pass-action" id="btnDownloadCalendar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Add to Google/Apple Calendar</span>
          </button>
          <button type="button" class="btn-pass-action" id="btnPrintPass">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>Save / Print Ticket</span>
          </button>
          <button type="button" class="btn-gold-subtle" id="btnDoneBooking">
            <span>Back to Salon Home</span>
          </button>
        </div>
      </div>
    `;

    this.drawMockQrCode();

    // Bind pass actions
    this.modal.querySelector('#btnDoneBooking')?.addEventListener('click', () => {
      this.close();
    });

    this.modal.querySelector('#btnPrintPass')?.addEventListener('click', () => {
      window.print();
    });

    this.modal.querySelector('#btnDownloadCalendar')?.addEventListener('click', () => {
      this.downloadIcsCalendar();
    });
  }

  drawMockQrCode() {
    const canvas = this.modal.querySelector('#vipQrCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#0c0d10";
    const blockSize = 6;
    const count = Math.floor(size / blockSize);

    // Deterministic pattern using ref code
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        // Corner markers
        const isCorner1 = (r < 4 && c < 4);
        const isCorner2 = (r < 4 && c >= count - 4);
        const isCorner3 = (r >= count - 4 && c < 4);

        if (isCorner1 || isCorner2 || isCorner3) {
          const isEdge = (r === 0 || r === 3 || c === 0 || c === 3) ||
                         (r === 0 || r === 3 || c === count - 1 || c === count - 4) ||
                         (r === count - 1 || r === count - 4 || c === 0 || c === 3);
          const isCenter = (r === 1 || r === 2) && (c === 1 || c === 2) ||
                           (r === 1 || r === 2) && (c === count - 2 || c === count - 3) ||
                           (r === count - 2 || r === count - 3) && (c === 1 || c === 2);
          if (isEdge || isCenter) {
            ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
          }
        } else if (Math.random() > 0.45) {
          ctx.fillRect(c * blockSize, r * blockSize, blockSize - 0.5, blockSize - 0.5);
        }
      }
    }
  }

  downloadIcsCalendar() {
    const srvTitles = this.bookingState.selectedServices.map(s => s.title).join(' & ');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FlyingScissor//VIP Booking//EN',
      'BEGIN:VEVENT',
      `SUMMARY:FlyingScissor Appointment: ${srvTitles}`,
      `DESCRIPTION:Appointment with ${this.bookingState.selectedBarber?.name || 'Master Stylist'}. Pass Ref: #${this.bookingState.referenceCode}. The Best Hair Cutting Saloon in Faisalabad.`,
      `LOCATION:${BARBERSHOP_DATA.brand.address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FlyingScissor_${this.bookingState.referenceCode}.ics`;
    link.click();
  }
}

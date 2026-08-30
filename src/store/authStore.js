// Auth Store - PropPartner Authentication & Session Management

const AUTH_STORAGE_KEY = 'proppartner_auth_session';

export const DEMO_USERS = {
  admin: {
    id: 'USR-ADMIN-01',
    name: 'Dilnawaz (Super Admin)',
    email: 'admin@proppartner.network',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    title: 'Managing Director & Platform Owner',
    phone: '+92 300 8899770',
    affiliateId: null,
    status: 'ACTIVE',
    permissions: ['ALL']
  },
  partnerPlatinum: {
    id: 'USR-AFF-101',
    name: 'Tariq Mansoor',
    email: 'tariq.mansoor@apexwealth.com',
    role: 'AFFILIATE_PARTNER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    title: 'Managing Partner, Apex Private Clients',
    phone: '+92 300 1234567',
    affiliateId: 'AFF-000101',
    tier: 'Platinum',
    status: 'Approved',
    permissions: ['VIEW_PROJECTS', 'SUBMIT_LEADS', 'VIEW_COMMISSIONS', 'REQUEST_PAYOUT']
  },
  partnerGold: {
    id: 'USR-AFF-102',
    name: 'Sarah Al-Maktoum Jenkins',
    email: 'sarah.j@dubaiinvest.ae',
    role: 'AFFILIATE_PARTNER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    title: 'Senior Wealth Consultant, Gulf Capital',
    phone: '+971 50 882 1902',
    affiliateId: 'AFF-000102',
    tier: 'Gold',
    status: 'Approved',
    permissions: ['VIEW_PROJECTS', 'SUBMIT_LEADS', 'VIEW_COMMISSIONS', 'REQUEST_PAYOUT']
  }
};

class AuthStore {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        // Default to Super Admin for immediate testing convenience
        this.currentUser = DEMO_USERS.admin;
        this.save();
      }
    } catch (e) {
      console.warn('AuthStore init error:', e);
      this.currentUser = DEMO_USERS.admin;
    }
  }

  save() {
    try {
      if (this.currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save auth state:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.currentUser));
  }

  getUser() {
    return this.currentUser;
  }

  isSuperAdmin() {
    return this.currentUser && this.currentUser.role === 'SUPER_ADMIN';
  }

  isAffiliate() {
    return this.currentUser && this.currentUser.role === 'AFFILIATE_PARTNER';
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  loginAs(userKey) {
    if (DEMO_USERS[userKey]) {
      this.currentUser = { ...DEMO_USERS[userKey] };
      this.save();
      return { success: true, user: this.currentUser };
    }
    return { success: false, message: 'Invalid demo account' };
  }

  loginWithGoogle(email = 'tariq.mansoor@apexwealth.com') {
    if (email === 'admin@proppartner.network' || email.includes('admin')) {
      this.currentUser = { ...DEMO_USERS.admin };
    } else {
      this.currentUser = { ...DEMO_USERS.partnerPlatinum, email };
    }
    this.save();
    return { success: true, user: this.currentUser };
  }

  loginWithEmail(email, password) {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail.includes('admin')) {
      this.currentUser = { ...DEMO_USERS.admin, email: cleanEmail };
    } else if (cleanEmail.includes('sarah') || cleanEmail.includes('dubai')) {
      this.currentUser = { ...DEMO_USERS.partnerGold, email: cleanEmail };
    } else {
      this.currentUser = { ...DEMO_USERS.partnerPlatinum, email: cleanEmail };
    }
    this.save();
    return { success: true, user: this.currentUser };
  }

  registerPartner(formData) {
    const affiliateId = `AFF-${Math.floor(100000 + Math.random() * 900000)}`;
    const newUser = {
      id: `USR-${affiliateId}`,
      name: formData.fullName || 'New Affiliate Partner',
      email: formData.email,
      phone: formData.phone || '',
      role: 'AFFILIATE_PARTNER',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullName || 'User')}`,
      title: formData.profession || 'Real Estate Affiliate',
      company: formData.company || '',
      affiliateId: affiliateId,
      tier: 'Silver',
      status: 'Pending', // Pending admin approval
      permissions: ['VIEW_PROJECTS', 'SUBMIT_LEADS']
    };
    this.currentUser = newUser;
    this.save();
    return { success: true, user: newUser, affiliateId };
  }

  logout() {
    this.currentUser = null;
    this.save();
  }
}

export const authStore = new AuthStore();

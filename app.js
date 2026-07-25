/* ==========================================================================
   MESS MEAL TRACKER - COMPLETE FRONTEND APPLICATION LOGIC
   ========================================================================== */

(function () {
  'use strict';

  /* ==========================================================================
     1. CONSTANTS & TRANSLATIONS DICTIONARY
     ========================================================================== */
  const STORAGE_KEYS = {
    MESSES: 'mess_messes',
    SELECTED_MESS_ID: 'mess_selected_mess_id',
    USERS: 'mess_users',
    MEALS: 'mess_meals',
    EXPENSES: 'mess_expenses',
    PAYMENTS: 'mess_payments',
    SETTINGS: 'mess_settings',
    MEAL_SETTINGS: 'mess_meal_settings',
    USER_MEAL_SETTINGS: 'mess_user_meal_settings',
    CURRENT_USER: 'mess_current_user',
    INITIALIZED: 'mess_app_initialized',
    THEME: 'mess_theme',
    MANAGER_TERMS: 'mess_manager_terms',
    LANGUAGE: 'mess_language',
    COOK_BILLS: 'mess_cook_bills'
  };

  const DEFAULT_MESS = {
    id: 'mess_default',
    name: 'Main Mess',
    code: 'MAIN-01',
    createdAt: '2026-07-01T00:00:00.000Z'
  };

  const EXPENSE_CATEGORIES = [
    'Grocery', 'Rice', 'Fish', 'Meat', 'Vegetable',
    'Gas', 'Electricity', 'Cook', 'Rent', 'Water', 'Internet', 'Other'
  ];

  const ROLES = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    MEMBER: 'member'
  };

  const CURRENCY_SYMBOL = '৳';

  const TRANSLATIONS = {
    en: {
      app_name: "Mess Meal Tracker",
      nav_main: "Navigation",
      nav_dashboard: "Dashboard",
      nav_meals: "Meals",
      nav_expenses: "Expenses",
      nav_payments: "Payments",
      nav_summary: "Monthly Summary",
      nav_admin: "Administration",
      nav_members: "Members",
      nav_settings: "Backup & Settings",
      nav_account: "Account",
      nav_profile: "My Profile",
      month: "Month",
      total_members: "Total Members",
      total_meals: "Total Meals",
      total_expenses: "Total Expenses",
      meal_rate: "Meal Rate",
      total_payments: "Total Payments",
      total_receivable: "Total Receivable",
      total_payable: "Total Payable",
      my_total_meals: "My Total Meals",
      my_meal_bill: "My Meal Bill",
      my_paid_amount: "My Paid Amount",
      my_balance: "My Balance",
      current_meal_rate: "Current Meal Rate",
      recent_activity: "Recent Activity Log",
      expense_overview: "Expenses Category Overview",
      member_balances: "Member Balances",
      quick_actions: "Quick Actions",
      add_meal_entry: "Record Meal Entry",
      add_expense: "Add Mess Expense",
      record_payment: "Record Member Payment",
      elect_manager: "Elect Meal Manager",
      add_member: "Add New Member",
      receivable: "Receivable",
      payable: "Payable",
      settled: "Settled",
      active: "Active",
      inactive: "Inactive",
      admin: "Admin",
      superadmin: "Superadmin",
      manager: "Meal Manager",
      member: "Member",
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      full_day: "Full Day",
      clear_all: "Clear All",
      date: "Date",
      note: "Note",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      logout: "Logout",
      login: "Login",
      register: "Register",
      daily_meal_chart: "Daily Meal Chart",
      meal_history_log: "Meal History Log",
      select_date: "Select Date",
      meal_settings: "Meal Settings",
      on_daily: "ON (Continuous)",
      off_daily: "OFF (Continuous)",
      on_once: "ON (Once)",
      off_once: "OFF (Once)",
      manager_report: "Manager-wise Report",
      nav_reports: "Reports & Downloads",
      export_full_csv: "Export Full Mess CSV",
      print_full_report: "Print Full Report (PDF)",
      nav_superadmin: "Super Admin Panel",
      superadmin_mess_console: "Super Admin Mess Console",
      create_new_mess: "Create New Mess"
    },
    bn: {
      app_name: "মেস মিল ট্র্যাকার",
      nav_main: "ন্যাভিগেশন",
      nav_dashboard: "ড্যাশবোর্ড",
      nav_meals: "মিল সমুহ",
      nav_expenses: "মেস খরচ",
      nav_payments: "পেমেন্ট/জমা",
      nav_summary: "মাসিক সামারি",
      nav_admin: "এডমিন সেকশন",
      nav_members: "মেম্বার ব্যবস্থাপনা",
      nav_settings: "ব্যাকআপ ও সেটিংস",
      nav_account: "একাউন্ট",
      nav_profile: "মাই প্রোফাইল",
      month: "মাস",
      total_members: "মোট মেম্বার",
      total_meals: "মোট মিল",
      total_expenses: "মোট খরচ",
      meal_rate: "মিল রেট",
      total_payments: "মোট জমা",
      total_receivable: "মোট পাওনা",
      total_payable: "মোট বাকি/দেনা",
      my_total_meals: "আমার মোট মিল",
      my_meal_bill: "আমার মিল বিল",
      my_paid_amount: "আমার মোট জমা",
      my_balance: "আমার ব্যালেন্স",
      current_meal_rate: "বর্তমান মিল রেট",
      recent_activity: "সাম্প্রতিক কার্যক্রম",
      expense_overview: "খরচের ক্যাটাগরি ওভারভিউ",
      member_balances: "মেম্বার ব্যালেন্স সামারি",
      quick_actions: "দ্রুত অ্যাকশন",
      add_meal_entry: "মিল এন্ট্রি দিন",
      add_expense: "মেস খরচ যোগ করুন",
      record_payment: "পেমেন্ট/টাকা জমা নিন",
      elect_manager: "মিল ম্যানেজার নির্বাচন",
      add_member: "নতুন মেম্বার যোগ করুন",
      receivable: "পাওনাদার",
      payable: "দেনাদার",
      settled: "হিসাব সমান",
      active: "সক্রিয়",
      inactive: "নিষ্ক্রিয়",
      admin: "এডমিন",
      superadmin: "সুপারএডমিন",
      manager: "মিল ম্যানেজার",
      member: "মেম্বার",
      breakfast: "সকালের নাস্তা",
      lunch: "দুপুরের খাবার",
      dinner: "রাতের খাবার",
      full_day: "ফুল ডে (২.৫)",
      clear_all: "ক্লিয়ার করুন",
      date: "তারিখ",
      note: "নোট",
      actions: "অ্যাকশন",
      save: "সংরক্ষণ করুন",
      cancel: "বাতিল",
      edit: "এডিট",
      delete: "মুছে ফেলুন",
      logout: "লগআউট",
      login: "লগইন",
      register: "রেজিস্ট্রেশন",
      daily_meal_chart: "আজকের মিল চার্ট",
      meal_history_log: "মিল রেকর্ডস",
      select_date: "তারিখ নির্বাচন করুন",
      meal_settings: "মিল সেটিংস",
      on_daily: "Continuous ON",
      off_daily: "Continuous OFF",
      on_once: "ON Once",
      off_once: "OFF Once",
      manager_report: "ম্যানেজার অনুযায়ী রিপোর্ট",
      nav_reports: "রিপোর্টস ও ডাউনলোড",
      export_full_csv: "ফুল মেস CSV ডাউনলোড",
      print_full_report: "ফুল মেস রিপোর্ট প্রিন্ট/PDF",
      nav_superadmin: "সুপার এডমিন প্যানেল",
      superadmin_mess_console: "মেস প্যানেল",
      create_new_mess: "নতুন মেস তৈরি করুন"
    }
  };

  /* ==========================================================================
     2. APP STATE
     ========================================================================== */
  const state = {
    currentUser: null,
    selectedMessId: DEFAULT_MESS.id,
    selectedMonth: getCurrentMonthString(), // Format: YYYY-MM
    selectedManagerId: 'all', // For Superadmin filtering
    activeView: 'dashboard',
    mealsViewMode: 'excel', // 'excel', 'chart', or 'log'
    selectedChartDate: getCurrentDateString(),
    confirmCallback: null,
    language: 'en'
  };

  /* ==========================================================================
     3. BACKEND API MODULE & STORAGE
     ========================================================================== */
  const BackendAPI = {
    baseUrl: '/api',
    pull: async function() {
      try {
        const res = await fetch(this.baseUrl + '/sync');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== null) {
            localStorage.setItem(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
          }
        }
      } catch (err) {
        console.error('Backend sync pull failed:', err);
        throw err;
      }
    },
    push: function(key, data) {
      fetch(this.baseUrl + '/sync/' + key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => {
        if (!res.ok) throw new Error('Network error');
      }).catch(err => {
        console.error('Backend sync push failed:', err);
        if (typeof showToast !== 'undefined') {
          showToast('Sync Failed: Internet issue. Data saved locally only.', 'error');
        }
      });
    }
  };

  const Storage = {
    getMesses: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSES)) || [DEFAULT_MESS];
    },
    saveMesses: function (messes) {
      localStorage.setItem(STORAGE_KEYS.MESSES, JSON.stringify(messes));
      BackendAPI.push(STORAGE_KEYS.MESSES, messes);
    },
    getSelectedMessId: function () {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_MESS_ID) || DEFAULT_MESS.id;
    },
    setSelectedMessId: function (messId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MESS_ID, messId);
    },
    getUsers: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    },
    saveUsers: function (users) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      BackendAPI.push(STORAGE_KEYS.USERS, users);
    },
    getMeals: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEALS)) || [];
    },
    saveMeals: function (meals) {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
      BackendAPI.push(STORAGE_KEYS.MEALS, meals);
    },
    getExpenses: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES)) || [];
    },
    saveExpenses: function (expenses) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      BackendAPI.push(STORAGE_KEYS.EXPENSES, expenses);
    },
    getPayments: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS)) || [];
    },
    savePayments: function (payments) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
      BackendAPI.push(STORAGE_KEYS.PAYMENTS, payments);
    },
    getManagerTerms: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MANAGER_TERMS)) || [];
    },
    saveManagerTerms: function (terms) {
      localStorage.setItem(STORAGE_KEYS.MANAGER_TERMS, JSON.stringify(terms));
      BackendAPI.push(STORAGE_KEYS.MANAGER_TERMS, terms);
    },
    getCookBills: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COOK_BILLS)) || [];
    },
    saveCookBills: function (bills) {
      localStorage.setItem(STORAGE_KEYS.COOK_BILLS, JSON.stringify(bills));
      BackendAPI.push(STORAGE_KEYS.COOK_BILLS, bills);
    },
    getSettings: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || { messName: 'My Mess' };
    },
    saveSettings: function (settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      BackendAPI.push(STORAGE_KEYS.SETTINGS, settings);
    },
    getMealSettings: function (messId) {
      const targetId = messId || (state.currentUser ? (state.currentUser.messId || state.selectedMessId) : null) || 'mess_default';
      const raw = localStorage.getItem(STORAGE_KEYS.MEAL_SETTINGS);
      if (!raw) {
        return { breakfastWeight: 0.5, lunchWeight: 1.0, dinnerWeight: 1.0 };
      }
      try {
        const parsed = JSON.parse(raw);
        if (parsed.breakfastWeight !== undefined) {
          // Backward compatibility migration from global setting to per-mess map
          return {
            breakfastWeight: parseFloat(parsed.breakfastWeight) || 0.5,
            lunchWeight: parseFloat(parsed.lunchWeight) || 1.0,
            dinnerWeight: parseFloat(parsed.dinnerWeight) || 1.0
          };
        }
        return parsed[targetId] || { breakfastWeight: 0.5, lunchWeight: 1.0, dinnerWeight: 1.0 };
      } catch (e) {
        return { breakfastWeight: 0.5, lunchWeight: 1.0, dinnerWeight: 1.0 };
      }
    },
    saveMealSettings: function (mealSettings, messId) {
      const targetId = messId || (state.currentUser ? (state.currentUser.messId || state.selectedMessId) : null) || 'mess_default';
      const raw = localStorage.getItem(STORAGE_KEYS.MEAL_SETTINGS);
      let allSettings = {};
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.breakfastWeight === undefined) {
            allSettings = parsed;
          }
        } catch (e) {}
      }
      allSettings[targetId] = mealSettings;
      localStorage.setItem(STORAGE_KEYS.MEAL_SETTINGS, JSON.stringify(allSettings));
      BackendAPI.push(STORAGE_KEYS.MEAL_SETTINGS, allSettings);
    },
    getUserMealSettings: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_MEAL_SETTINGS)) || {};
    },
    saveUserMealSettings: function (userMealSettings) {
      localStorage.setItem(STORAGE_KEYS.USER_MEAL_SETTINGS, JSON.stringify(userMealSettings));
      BackendAPI.push(STORAGE_KEYS.USER_MEAL_SETTINGS, userMealSettings);
    },
    getCurrentUser: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
    },
    setCurrentUser: function (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      BackendAPI.push(STORAGE_KEYS.CURRENT_USER, user);
    },
    clearCurrentUser: function () {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },
    isInitialized: function () {
      return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
    },
    setInitialized: function (val) {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, val ? 'true' : 'false');
    },
    getTheme: function () {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    },
    saveTheme: function (theme) {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    },
    getLanguage: function () {
      return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
    },
    saveLanguage: function (lang) {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    },
    getActiveView: function () {
      return localStorage.getItem('mess_active_view') || null;
    },
    saveActiveView: function (view) {
      localStorage.setItem('mess_active_view', view);
    },
    clearAll: function () {
      localStorage.clear();
    }
  };

  /* ==========================================================================
     4. UTILITY & TRANSLATION HELPERS
     ========================================================================== */
  function t(key) {
    const lang = state.language || 'en';
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS['en'][key]) || key;
  }

  function setLanguage(lang) {
    state.language = lang;
    Storage.saveLanguage(lang);

    const labelEl = document.getElementById('lang-toggle-label');
    if (labelEl) {
      labelEl.textContent = lang === 'en' ? 'BN' : 'EN';
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });

    if (state.currentUser) {
      renderCurrentView();
    }
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function getCurrentMonthString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  function getCurrentDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function validateBDPhone(phone) {
    if (!phone || phone.trim().length < 3) return false;
    return true;
  }

  function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return `${CURRENCY_SYMBOL}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function isUserAdmin(user) {
    if (!user) return false;
    return user.role === ROLES.SUPERADMIN || user.role === ROLES.ADMIN;
  }

  function isUserSuperAdmin(user) {
    if (!user) return false;
    return user.role === ROLES.SUPERADMIN;
  }

  function isUserMealManagerForDate(user, targetDate = getCurrentDateString()) {
    if (!user) return false;
    const terms = Storage.getManagerTerms();
    return terms.some(tItem => tItem.userId === user.id && tItem.startDate <= targetDate && tItem.endDate >= targetDate);
  }

  function getActiveManagerForDate(targetDate = getCurrentDateString()) {
    const terms = Storage.getManagerTerms();
    const activeTerm = terms.find(tItem => tItem.startDate <= targetDate && tItem.endDate >= targetDate);
    if (activeTerm) {
      const users = Storage.getUsers();
      const managerUser = users.find(u => u.id === activeTerm.userId);
      if (managerUser) return { user: managerUser, term: activeTerm };
    }
    const users = Storage.getUsers();
    const managerUser = users.find(u => u.role === ROLES.MANAGER || u.isMealManager === true);
    if (managerUser) return { user: managerUser, term: null };
    return null;
  }

  function hasElectedManagerForDate(targetDate = getCurrentDateString()) {
    return !!getActiveManagerForDate(targetDate);
  }

  function canManageMess(user, targetDate = getCurrentDateString()) {
    if (!user) return false;
    if (user.role === ROLES.SUPERADMIN || user.role === ROLES.ADMIN) return true;
    if (user.role === ROLES.MANAGER || user.isMealManager === true) return true;
    return isUserMealManagerForDate(user, targetDate);
  }

  /* ==========================================================================
     5. MANAGER-WISE DATA ISOLATION HELPERS
     ========================================================================== */
  function getVisibleMembers() {
    const user = state.currentUser;
    if (!user) return [];

    const allUsers = Storage.getUsers().filter(u => u.role !== ROLES.SUPERADMIN);

    if (user.role === ROLES.SUPERADMIN) {
      if (state.selectedMessId) {
        return allUsers.filter(u => u.messId === state.selectedMessId);
      }
      if (state.selectedManagerId && state.selectedManagerId !== 'all') {
        return allUsers.filter(u => u.managerId === state.selectedManagerId || u.id === state.selectedManagerId);
      }
      return allUsers;
    }

    if (user.role === ROLES.ADMIN || user.role === ROLES.MANAGER || user.isMealManager) {
      const currentMessId = user.messId || state.selectedMessId;
      if (currentMessId) {
        return allUsers.filter(u => u.messId === currentMessId);
      }
      return allUsers.filter(u => u.managerId === user.id || u.id === user.id);
    }

    // Standard Member
    const currentMessId = user.messId;
    if (currentMessId) {
      return allUsers.filter(u => u.messId === currentMessId);
    }
    const mgrId = user.managerId || user.id;
    return allUsers.filter(u => u.managerId === mgrId || u.id === mgrId);
  }

  /* ==========================================================================
     6. MEAL WEIGHT CALCULATION ENGINE
     ========================================================================== */
  function calculateWeightedMealTotal(bCount, lCount, dCount, messId) {
    const weights = Storage.getMealSettings(messId);
    const b = parseFloat(bCount) || 0;
    const l = parseFloat(lCount) || 0;
    const d = parseFloat(dCount) || 0;

    const total = (b * weights.breakfastWeight) + (l * weights.lunchWeight) + (d * weights.dinnerWeight);
    return total;
  }

  function calculateTotalMeals(month) {
    const today = getCurrentDateString();
    const visibleMemberIds = getVisibleMembers().map(m => m.id);
    const meals = Storage.getMeals().filter(m => m.date.startsWith(month) && m.date <= today && visibleMemberIds.includes(m.userId));
    return meals.reduce((sum, m) => sum + (parseFloat(m.total) || 0), 0);
  }

  function calculateTotalExpenses(month) {
    const visibleMemberIds = getVisibleMembers().map(m => m.id);
    const expenses = Storage.getExpenses().filter(e => e.date.startsWith(month) && (visibleMemberIds.includes(e.spentBy) || visibleMemberIds.includes(e.addedBy)));
    return expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }

  function calculateTotalPayments(month) {
    const visibleMemberIds = getVisibleMembers().map(m => m.id);
    const payments = Storage.getPayments().filter(p => p.date.startsWith(month) && visibleMemberIds.includes(p.userId));
    return payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  }

  function calculateMealRate(month) {
    const totalExpenses = calculateTotalExpenses(month);
    const totalMeals = calculateTotalMeals(month);
    if (totalMeals <= 0) return 0;
    return totalExpenses / totalMeals;
  }

  function calculateMemberMeals(userId, month) {
    const today = getCurrentDateString();
    const meals = Storage.getMeals().filter(m => m.userId === userId && m.date.startsWith(month) && m.date <= today);
    let breakfast = 0, lunch = 0, dinner = 0, total = 0;
    meals.forEach(m => {
      breakfast += parseFloat(m.breakfast) || 0;
      lunch += parseFloat(m.lunch) || 0;
      dinner += parseFloat(m.dinner) || 0;
      total += parseFloat(m.total) || 0;
    });
    return { breakfast, lunch, dinner, total };
  }

  function calculateMemberCookBill(userId, month) {
    const cookBills = Storage.getCookBills();
    const monthBills = cookBills.filter(cb => cb.month === month);
    let total = 0;
    monthBills.forEach(cb => {
      if (cb.memberBills && cb.memberBills[userId] !== undefined) {
        total += parseFloat(cb.memberBills[userId]) || 0;
      }
    });
    return total;
  }

  function calculateMemberBill(userId, month) {
    const memberTotalMeals = calculateMemberMeals(userId, month).total;
    const rate = calculateMealRate(month);
    const mealBill = memberTotalMeals * rate;
    const cookBill = calculateMemberCookBill(userId, month);
    return mealBill + cookBill;
  }

  function calculateMemberMealOnlyBill(userId, month) {
    const memberTotalMeals = calculateMemberMeals(userId, month).total;
    const rate = calculateMealRate(month);
    return memberTotalMeals * rate;
  }

  function calculateMemberPaid(userId, month) {
    const payments = Storage.getPayments().filter(p => p.userId === userId && p.date.startsWith(month));
    return payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  }

  function calculateMemberBalance(userId, month) {
    const paid = calculateMemberPaid(userId, month);
    const bill = calculateMemberBill(userId, month);
    return paid - bill;
  }

  function getBalanceStatus(balance) {
    if (balance > 0.01) return { label: t('receivable'), class: 'badge-success' };
    if (balance < -0.01) return { label: t('payable'), class: 'badge-danger' };
    return { label: t('settled'), class: 'badge-neutral' };
  }

  /* ==========================================================================
     7. INITIAL DATA GENERATOR
     ========================================================================== */
  function seedCleanData() {
    const users = [
      {
        id: 'usr_superadmin',
        name: 'Super Admin',
        phone: 'admin',
        password: 'superadmin@123',
        role: ROLES.SUPERADMIN,
        active: true,
        createdAt: getCurrentDateString()
      }
    ];

    Storage.saveUsers(users);
    Storage.saveMeals([]);
    Storage.saveExpenses([]);
    Storage.savePayments([]);
    Storage.saveManagerTerms([]);
    Storage.saveMealSettings({ breakfastWeight: 0.5, lunchWeight: 1.0, dinnerWeight: 1.0 });
    Storage.setInitialized(true);
  }

  /* ==========================================================================
     8. TOAST & MODAL CONTROLLERS
     ========================================================================== */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'ri-information-line';
    if (type === 'success') iconClass = 'ri-checkbox-circle-line';
    if (type === 'error') iconClass = 'ri-error-warning-line';
    if (type === 'warning') iconClass = 'ri-alert-line';

    toast.innerHTML = `
      <i class="${iconClass} toast-icon"></i>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-message').textContent = message;
    state.confirmCallback = onConfirm;
    openModal('confirm-modal');
  }

  /* ==========================================================================
     9. AUTHENTICATION & AUTHORIZATION
     ========================================================================== */
  function registerUser(name, phone, password, confirmPassword) {
    if (!name || !phone || !password) {
      showToast('Please fill out all required fields.', 'error');
      return false;
    }

    if (!validateBDPhone(phone)) {
      showToast('Invalid Bangladeshi phone number (e.g. 017XXXXXXXX).', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return false;
    }

    const users = Storage.getUsers();
    if (users.some(u => u.phone.trim() === phone.trim())) {
      showToast('Phone number is already registered.', 'error');
      return false;
    }

    const isFirstUser = users.length === 0;
    const role = isFirstUser ? ROLES.SUPERADMIN : ROLES.MEMBER;

    const newUser = {
      id: generateId(),
      name: name.trim(),
      phone: phone.trim(),
      password: password,
      role: role,
      active: true,
      createdAt: getCurrentDateString()
    };

    users.push(newUser);
    Storage.saveUsers(users);

    showToast(`Account created successfully! ${role === ROLES.SUPERADMIN ? 'You are the Mess Superadmin.' : ''}`, 'success');
    loginUserDirect(newUser);
    return true;
  }

  function loginUser(phone, password) {
    if (!phone || !password) {
      showToast('Please enter both username/phone and password.', 'error');
      return false;
    }

    const inputClean = phone.trim().toLowerCase();
    const users = Storage.getUsers();
    const user = users.find(u => u.phone.trim().toLowerCase() === inputClean || (u.username && u.username.trim().toLowerCase() === inputClean));

    if (!user) {
      showToast('User not found with this username or phone number.', 'error');
      return false;
    }

    if (user.password !== password) {
      showToast('Incorrect password.', 'error');
      return false;
    }

    if (user.active === false) {
      showToast('Your account has been deactivated. Please contact Mess Admin.', 'error');
      return false;
    }

    loginUserDirect(user);
    showToast(`Welcome back, ${user.name}!`, 'success');
    return true;
  }

  let inactivityTimer = null;
  const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes Inactivity Timeout

  function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (!state.currentUser) return;

    inactivityTimer = setTimeout(() => {
      if (state.currentUser) {
        logoutUser('Session expired due to inactivity. Please log in again.');
      }
    }, INACTIVITY_TIMEOUT_MS);
  }

  function initInactivityListeners() {
    ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(evt => {
      document.addEventListener(evt, resetInactivityTimer, { passive: true });
    });
  }

  function clearLoginFormInputs() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.reset();

    const phoneInput = document.getElementById('login-phone');
    if (phoneInput) {
      phoneInput.value = '';
      phoneInput.removeAttribute('value');
    }

    const pwdInput = document.getElementById('login-password');
    if (pwdInput) {
      pwdInput.value = '';
      pwdInput.type = 'password';
      pwdInput.removeAttribute('value');
    }

    document.querySelectorAll('.password-toggle-icon').forEach(icon => {
      icon.classList.remove('ri-eye-off-line');
      icon.classList.add('ri-eye-line');
    });
  }

  function loginUserDirect(user) {
    state.currentUser = user;
    Storage.setCurrentUser(user);
    clearLoginFormInputs();
    renderAppLayout();
    resetInactivityTimer();
  }

  function logoutUser(message = 'Logged out successfully.') {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    state.currentUser = null;
    Storage.clearCurrentUser();

    clearLoginFormInputs();

    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
    showToast(message, message.includes('expired') ? 'warning' : 'info');
  }

  /* ==========================================================================
     10. UI ROUTER & NAVIGATION
     ========================================================================== */
  function navigateTo(viewName) {
    const user = state.currentUser;
    if (!user) return;

    // Strict Superadmin isolation: Superadmin only accesses master panel & profile
    if (isUserSuperAdmin(user)) {
      if (viewName !== 'superadmin' && viewName !== 'profile') {
        viewName = 'superadmin';
      }
    } else {
      if (viewName === 'superadmin') {
        showToast('Permission denied. Superadmin access required.', 'error');
        return;
      }
      if ((viewName === 'members' || viewName === 'settings') && !canManageMess(user)) {
        showToast('Permission denied. Manager or Admin access required.', 'error');
        return;
      }
    }

    state.activeView = viewName;
    Storage.saveActiveView(viewName);

    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.add('hidden');
    });
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) targetSection.classList.remove('hidden');

    const titleMap = {
      dashboard: t('nav_dashboard'),
      meals: t('nav_meals'),
      expenses: t('nav_expenses'),
      payments: t('nav_payments'),
      summary: t('nav_summary'),
      reports: t('nav_reports'),
      superadmin: t('nav_superadmin'),
      members: t('nav_members'),
      profile: t('nav_profile'),
      settings: t('nav_settings')
    };
    document.getElementById('page-title').textContent = titleMap[viewName] || t('nav_dashboard');

    document.getElementById('sidebar').classList.remove('show');
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.remove('show');

    renderCurrentView();
  }

  function renderCurrentView() {
    if (!state.currentUser) return;
    populateDropdownFilters();
    switch (state.activeView) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'meals':
        renderMealsView();
        break;
      case 'expenses':
        renderExpensesView();
        break;
      case 'payments':
        renderPaymentsView();
        break;
      case 'summary':
        renderSummaryView();
        break;
      case 'reports':
        renderReportsView();
        break;
      case 'superadmin':
        renderSuperAdminView();
        break;
      case 'members':
        renderMembersView();
        break;
      case 'profile':
        renderProfileView();
        break;
      case 'settings':
        renderSettingsView();
        break;
    }
  }

  function renderAppLayout() {
    const user = state.currentUser;
    if (!user) return;

    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');

    document.getElementById('sidebar-user-name').textContent = user.name;
    document.getElementById('sidebar-avatar').textContent = user.name.charAt(0).toUpperCase();

    const isCurrentManager = isUserMealManagerForDate(user) || user.isMealManager;
    const roleBadge = document.getElementById('sidebar-user-role');
    const displayRole = isCurrentManager ? 'manager' : user.role;
    roleBadge.textContent = displayRole === 'manager' ? t('manager') : t(displayRole);
    roleBadge.className = `user-role-badge role-${displayRole}`;

    // Superadmin vs Mess User Navigation Isolation
    if (isUserSuperAdmin(user)) {
      document.querySelectorAll('.mess-user-only').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.superadmin-only').forEach(el => el.classList.remove('hidden'));
      navigateTo('superadmin');
    } else {
      document.querySelectorAll('.mess-user-only').forEach(el => el.classList.remove('hidden'));
      document.querySelectorAll('.superadmin-only').forEach(el => el.classList.add('hidden'));

      // Show Admin/Manager controls
      document.querySelectorAll('.admin-only').forEach(el => {
        if (canManageMess(user)) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });

      const savedView = Storage.getActiveView();
      let initialView = 'dashboard';
      if (savedView && savedView !== 'superadmin' && savedView !== 'login') {
        if ((savedView === 'members' || savedView === 'settings') && !canManageMess(user)) {
          initialView = 'dashboard';
        } else {
          initialView = savedView;
        }
      }
      navigateTo(initialView);
    }
  }

  function populateDropdownFilters() {
    const members = getVisibleMembers().filter(u => u.active !== false);
    const allUsers = Storage.getUsers();
    const managers = allUsers.filter(u => u.role === ROLES.MANAGER || u.role === ROLES.SUPERADMIN);

    // Global Manager Filter for Superadmin
    const mgrPicker = document.getElementById('global-manager-picker');
    if (mgrPicker && isUserSuperAdmin(state.currentUser)) {
      mgrPicker.innerHTML = '<option value="all">All Messes (All Managers)</option>' +
        managers.map(m => `<option value="${m.id}" ${state.selectedManagerId === m.id ? 'selected' : ''}>${m.name}'s Mess</option>`).join('');
    }

    const mealFilter = document.getElementById('meal-member-filter');
    if (mealFilter) {
      mealFilter.innerHTML = '<option value="all">All Members</option>' +
        members.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    }

    const paymentFilter = document.getElementById('payment-member-filter');
    if (paymentFilter) {
      paymentFilter.innerHTML = '<option value="all">All Members</option>' +
        members.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    }

    const mealUserSelect = document.getElementById('meal-user-id');
    if (mealUserSelect) {
      if (state.currentUser && canManageMess(state.currentUser)) {
        mealUserSelect.disabled = false;
        mealUserSelect.innerHTML = members.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
      } else if (state.currentUser) {
        mealUserSelect.innerHTML = `<option value="${state.currentUser.id}">${state.currentUser.name}</option>`;
        mealUserSelect.disabled = true;
      }
    }

    const expenseUserSelect = document.getElementById('expense-user-id');
    if (expenseUserSelect) {
      expenseUserSelect.innerHTML = members.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    }

    const paymentUserSelect = document.getElementById('payment-user-id');
    if (paymentUserSelect) {
      paymentUserSelect.innerHTML = members.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    }

    const electUserSelect = document.getElementById('elect-user-id');
    if (electUserSelect) {
      electUserSelect.innerHTML = members.map(u => `<option value="${u.id}">${u.name} (${u.phone})</option>`).join('');
    }

    const memberManagerSelect = document.getElementById('member-manager-id');
    if (memberManagerSelect) {
      memberManagerSelect.innerHTML = managers.map(m => `<option value="${m.id}">${m.name}'s Mess</option>`).join('');
    }

    const expenseCatSelect = document.getElementById('expense-category');
    const expenseCatFilter = document.getElementById('expense-category-filter');
    if (expenseCatSelect) {
      expenseCatSelect.innerHTML = EXPENSE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    if (expenseCatFilter) {
      expenseCatFilter.innerHTML = '<option value="all">All Categories</option>' +
        EXPENSE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    const memberRoleSelect = document.getElementById('member-role');
    if (memberRoleSelect) {
      if (state.currentUser && isUserSuperAdmin(state.currentUser)) {
        memberRoleSelect.innerHTML = `
          <option value="member">${t('member')}</option>
          <option value="manager">${t('manager')}</option>
          <option value="admin">${t('admin')}</option>
          <option value="superadmin">${t('superadmin')}</option>
        `;
      } else {
        memberRoleSelect.innerHTML = `
          <option value="member">${t('member')}</option>
          <option value="manager">${t('manager')}</option>
          <option value="admin">${t('admin')}</option>
        `;
      }
    }
  }

  /* ==========================================================================
     11. DATE-BASED MEAL MANAGER ELECTION LOGIC
     ========================================================================== */
  function electMealManager(userId, startDate, endDate, note, cookBillOptions) {
    if (!userId || !startDate || !endDate) {
      showToast('Please specify member and date range.', 'error');
      return;
    }

    if (startDate > endDate) {
      showToast('Start date cannot be after end date.', 'error');
      return;
    }

    const users = Storage.getUsers();
    const targetUser = users.find(u => u.id === userId);

    if (!targetUser) {
      showToast('Selected member not found.', 'error');
      return;
    }

    const terms = Storage.getManagerTerms();
    const newTermId = generateId();
    const newTerm = {
      id: newTermId,
      userId: targetUser.id,
      userName: targetUser.name,
      startDate: startDate,
      endDate: endDate,
      note: note || `Meal Manager (${formatDate(startDate)} to ${formatDate(endDate)})`,
      createdAt: new Date().toISOString()
    };

    terms.push(newTerm);
    Storage.saveManagerTerms(terms);

    // Cook Bill: auto-create if requested
    if (cookBillOptions && cookBillOptions.enabled && cookBillOptions.amount > 0) {
      const month = startDate.substring(0, 7); // YYYY-MM
      const activeMembers = getVisibleMembers().filter(u => u.active !== false);
      const memberBills = {};
      activeMembers.forEach(u => {
        memberBills[u.id] = cookBillOptions.amount;
      });

      const cookBills = Storage.getCookBills();
      cookBills.push({
        id: generateId(),
        termId: newTermId,
        month: month,
        messId: targetUser.messId || state.selectedMessId || 'mess_default',
        defaultAmount: cookBillOptions.amount,
        memberBills: memberBills,
        note: cookBillOptions.note || 'Cook Bill',
        createdAt: new Date().toISOString(),
        createdBy: state.currentUser ? state.currentUser.id : ''
      });
      Storage.saveCookBills(cookBills);
      showToast(`Cook Bill of ${formatCurrency(cookBillOptions.amount)}/member has been added for this term.`, 'info');
    }

    targetUser.isMealManager = true;
    if (targetUser.role === ROLES.MEMBER) {
      targetUser.role = ROLES.MANAGER;
    }
    Storage.saveUsers(users);

    showToast(`${targetUser.name} has been elected as Meal Manager (${formatDate(startDate)} - ${formatDate(endDate)})!`, 'success');
    closeModal('elect-manager-modal');
    renderCurrentView();
  }


  function deleteManagerTerm(termId) {
    showConfirmModal(
      'Remove Manager Duty Schedule',
      'Are you sure you want to revoke this Manager duty term?',
      function () {
        const terms = Storage.getManagerTerms().filter(t => t.id !== termId);
        Storage.saveManagerTerms(terms);
        showToast('Manager duty term removed.', 'info');
        renderCurrentView();
      }
    );
  }

  function renderManagerSchedule() {
    const container = document.getElementById('manager-terms-container');
    if (!container) return;

    let terms = Storage.getManagerTerms().filter(t => t.startDate.startsWith(state.selectedMonth) || t.endDate.startsWith(state.selectedMonth));
    const today = getCurrentDateString();

    if (terms.length === 0) {
      container.innerHTML = `
        <div style="padding: 0.85rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md); text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No Manager Duty Schedule recorded for ${state.selectedMonth}. Click "${t('elect_manager')}" to assign duty.
        </div>
      `;
      return;
    }

    terms.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    container.innerHTML = terms.map(tItem => {
      const isActiveNow = tItem.startDate <= today && tItem.endDate >= today;
      // Check if a cook bill is linked to this term
      const linkedCookBill = Storage.getCookBills().find(cb => cb.termId === tItem.id);
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; margin-bottom: 0.5rem; background: var(--bg-primary); border: 1px solid ${isActiveNow ? 'var(--accent-primary)' : 'var(--border-color)'}; border-radius: var(--radius-md); flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1;">
            <div class="kpi-icon-box ${isActiveNow ? 'icon-emerald' : 'icon-indigo'}" style="width: 36px; height: 36px; font-size: 1rem; flex-shrink: 0;">
              <i class="${isActiveNow ? 'ri-star-fill' : 'ri-calendar-check-line'}"></i>
            </div>
            <div style="min-width: 0;">
              <div style="font-size: 0.875rem; font-weight: 700;">
                ${tItem.userName}
                ${isActiveNow ? '<span class="badge badge-success" style="margin-left: 0.35rem;">Active Duty Today</span>' : ''}
                ${linkedCookBill ? `<span class="badge badge-warning" style="margin-left: 0.35rem; background: rgba(245,158,11,0.15); color: var(--warning); border: 1px solid var(--warning);"><i class="ri-restaurant-line"></i> Cook Bill: ${formatCurrency(linkedCookBill.defaultAmount)}</span>` : ''}
              </div>
              <div style="font-size: 0.775rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <i class="ri-time-line"></i> ${formatDate(tItem.startDate)} &mdash; ${formatDate(tItem.endDate)} &bull; <em>${tItem.note}</em>
              </div>
            </div>
          </div>
          ${isUserAdmin(state.currentUser) ? `
            <div style="display: flex; gap: 0.35rem; flex-shrink: 0;">
              <button class="icon-btn btn-sm btn-secondary edit-term-btn" data-id="${tItem.id}" title="Edit Term">
                <i class="ri-edit-line"></i>
              </button>
              <button class="icon-btn btn-sm btn-danger delete-term-btn" data-id="${tItem.id}" title="Remove Duty Term">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Bind edit buttons
    container.querySelectorAll('.edit-term-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditManagerTermModal(btn.dataset.id));
    });
  }

  /* ==========================================================================
     MANAGER TERM EDIT
     ========================================================================== */
  function openEditManagerTermModal(termId) {
    const terms = Storage.getManagerTerms();
    const term = terms.find(t => t.id === termId);
    if (!term) return;

    document.getElementById('edit-term-id').value = termId;
    document.getElementById('edit-term-manager-name').textContent = term.userName;
    document.getElementById('edit-term-start-date').value = term.startDate;
    document.getElementById('edit-term-end-date').value = term.endDate;
    document.getElementById('edit-term-note').value = term.note || '';

    // Cook Bill section
    const cookBillSection = document.getElementById('edit-term-cook-bill-section');
    const linkedCookBill = Storage.getCookBills().find(cb => cb.termId === termId);

    if (linkedCookBill) {
      const totalCollected = Object.values(linkedCookBill.memberBills || {}).reduce((s, v) => s + (parseFloat(v) || 0), 0);
      cookBillSection.innerHTML = `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-left: 3px solid var(--warning); border-radius: var(--radius-md); padding: 0.75rem 1rem; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <div style="font-size: 0.85rem; font-weight: 600;">${linkedCookBill.note || 'Cook Bill'}</div>
            <span style="font-size: 0.8rem; color: var(--warning); font-weight: 700;">${formatCurrency(totalCollected)} total</span>
          </div>
          <div class="quick-meal-grid" style="grid-template-columns: 1fr 1fr; gap: 0.65rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label for="edit-cook-bill-amount" style="font-size: 0.78rem;">Default Amount/Member (৳)</label>
              <input type="number" id="edit-cook-bill-amount" class="form-control" value="${linkedCookBill.defaultAmount}" min="0" step="1" data-cookbill-id="${linkedCookBill.id}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label for="edit-cook-bill-note-field" style="font-size: 0.78rem;">Note</label>
              <input type="text" id="edit-cook-bill-note-field" class="form-control" value="${linkedCookBill.note || ''}">
            </div>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.5rem 0 0 0;">
            <i class="ri-information-line"></i> Changing the default amount will reset all member amounts. Use "Adjust" from Cook Bill Report for individual changes.
          </p>
        </div>
      `;
    } else {
      cookBillSection.innerHTML = `
        <div style="padding: 0.65rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md); margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.5rem;">
            <input type="checkbox" id="edit-add-cook-bill-chk" style="width: 15px; height: 15px; accent-color: var(--accent-primary);">
            <label for="edit-add-cook-bill-chk" style="font-size: 0.875rem; cursor: pointer; margin: 0;">Add Cook Bill to this term</label>
          </div>
          <div id="edit-new-cook-bill-fields" style="display: none;">
            <div class="quick-meal-grid" style="grid-template-columns: 1fr 1fr; gap: 0.65rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label for="edit-cook-bill-amount" style="font-size: 0.78rem;">Amount/Member (৳)</label>
                <input type="number" id="edit-cook-bill-amount" class="form-control" placeholder="e.g. 500" min="0" step="1">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label for="edit-cook-bill-note-field" style="font-size: 0.78rem;">Note</label>
                <input type="text" id="edit-cook-bill-note-field" class="form-control" placeholder="Cook Bill">
              </div>
            </div>
          </div>
        </div>
      `;

      // bind checkbox toggle
      const chk = document.getElementById('edit-add-cook-bill-chk');
      if (chk) {
        chk.addEventListener('change', function () {
          const f = document.getElementById('edit-new-cook-bill-fields');
          if (f) f.style.display = this.checked ? 'block' : 'none';
        });
      }
    }

    openModal('edit-manager-term-modal');
  }

  /* ==========================================================================
     12. VIEW RENDERERS
     ========================================================================== */

  // DASHBOARD VIEW
  function renderDashboard() {
    if (!state.currentUser) return;
    const month = state.selectedMonth;
    const user = state.currentUser;
    const isAdmin = canManageMess(user);

    const members = getVisibleMembers().filter(u => u.active !== false);
    const totalMembers = members.length;
    const totalMeals = calculateTotalMeals(month);
    const totalExpenses = calculateTotalExpenses(month);
    const mealRate = calculateMealRate(month);
    const totalPayments = calculateTotalPayments(month);

    const kpiContainer = document.getElementById('dashboard-kpi-container');

    if (isAdmin) {
      let totalReceivable = 0, totalPayable = 0;
      members.forEach(u => {
        const bal = calculateMemberBalance(u.id, month);
        if (bal > 0) totalReceivable += bal;
        if (bal < 0) totalPayable += Math.abs(bal);
      });

      kpiContainer.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-icon-box icon-blue"><i class="ri-group-line"></i></div>
          <div class="kpi-info">
            <h4>${t('total_members')}</h4>
            <div class="kpi-value">${totalMembers}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-indigo"><i class="ri-bowl-line"></i></div>
          <div class="kpi-info">
            <h4>${t('total_meals')}</h4>
            <div class="kpi-value">${totalMeals.toFixed(1)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-amber"><i class="ri-money-dollar-circle-line"></i></div>
          <div class="kpi-info">
            <h4>${t('total_expenses')}</h4>
            <div class="kpi-value">${formatCurrency(totalExpenses)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-emerald"><i class="ri-pulse-line"></i></div>
          <div class="kpi-info">
            <h4>${t('meal_rate')}</h4>
            <div class="kpi-value">${formatCurrency(mealRate)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-blue"><i class="ri-wallet-3-line"></i></div>
          <div class="kpi-info">
            <h4>${t('total_payments')}</h4>
            <div class="kpi-value">${formatCurrency(totalPayments)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-emerald"><i class="ri-arrow-up-circle-line"></i></div>
          <div class="kpi-info">
            <h4>${t('total_receivable')}</h4>
            <div class="kpi-value">${formatCurrency(totalReceivable)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-rose"><i class="ri-arrow-down-circle-line"></i></div>
          <div class="kpi-info">
            <h4>${t('total_payable')}</h4>
            <div class="kpi-value">${formatCurrency(totalPayable)}</div>
          </div>
        </div>
      `;
    } else {
      const myMeals = calculateMemberMeals(user.id, month).total;
      const myBill = calculateMemberBill(user.id, month);
      const myPaid = calculateMemberPaid(user.id, month);
      const myBalance = calculateMemberBalance(user.id, month);
      const statusInfo = getBalanceStatus(myBalance);

      kpiContainer.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-icon-box icon-indigo"><i class="ri-bowl-line"></i></div>
          <div class="kpi-info">
            <h4>${t('my_total_meals')}</h4>
            <div class="kpi-value">${myMeals.toFixed(1)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-amber"><i class="ri-receipt-line"></i></div>
          <div class="kpi-info">
            <h4>${t('my_meal_bill')}</h4>
            <div class="kpi-value">${formatCurrency(myBill)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-emerald"><i class="ri-wallet-3-line"></i></div>
          <div class="kpi-info">
            <h4>${t('my_paid_amount')}</h4>
            <div class="kpi-value">${formatCurrency(myPaid)}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box ${myBalance >= 0 ? 'icon-emerald' : 'icon-rose'}"><i class="ri-scales-3-line"></i></div>
          <div class="kpi-info">
            <h4>${t('my_balance')}</h4>
            <div class="kpi-value">${formatCurrency(myBalance)}</div>
            <span class="badge ${statusInfo.class}" style="margin-top: 0.2rem;">${statusInfo.label}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-blue"><i class="ri-pulse-line"></i></div>
          <div class="kpi-info">
            <h4>${t('current_meal_rate')}</h4>
            <div class="kpi-value">${formatCurrency(mealRate)}</div>
          </div>
        </div>
      `;
    }

    if (canManageMess(user)) {
      renderDashboardTodayMealBreakdown();
      renderRecentActivities();
      renderExpenseCategoryOverview();
      renderMemberBalancesList();
    } else {
      // Member: show only own today's meal summary
      renderMemberOwnTodayMeal();
      renderRecentActivities();
      // Hide group panels
      const todayCardPanel = document.querySelector('#view-dashboard .panel-card');
      if (todayCardPanel) todayCardPanel.style.display = 'none';
      const balancesEl = document.getElementById('dashboard-member-balances-list');
      if (balancesEl) {
        const balCard = balancesEl.closest('.panel-card');
        if (balCard) balCard.style.display = 'none';
      }
      const catEl = document.getElementById('dashboard-expense-categories');
      if (catEl) {
        const catCard = catEl.closest('.panel-card');
        if (catCard) catCard.style.display = 'none';
      }
    }
  }

  function renderDashboardTodayMealBreakdown() {
    const today = getCurrentDateString();
    const members = getVisibleMembers().filter(u => u.active !== false);
    const weights = Storage.getMealSettings();

    const cardsContainer = document.getElementById('dashboard-today-meal-cards');
    const tbody = document.getElementById('dashboard-today-meal-tbody');
    if (!cardsContainer || !tbody) return;

    if (members.length === 0) {
      cardsContainer.innerHTML = '';
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No active members found.</td></tr>`;
      return;
    }

    const allMeals = Storage.getMeals();
    let totalB = 0, totalL = 0, totalD = 0, totalWeightedDay = 0;

    const memberRowsHtml = members.map(u => {
      let mRecord = allMeals.find(m => m.userId === u.id && m.date === today);
      const settings = getUserEffectiveMealSettings(u.id, today);

      const bVal = mRecord ? (parseInt(mRecord.breakfast) || 0) : (settings.breakfast.isOn ? settings.breakfast.qty : 0);
      const lVal = mRecord ? (parseInt(mRecord.lunch) || 0) : (settings.lunch.isOn ? settings.lunch.qty : 0);
      const dVal = mRecord ? (parseInt(mRecord.dinner) || 0) : (settings.dinner.isOn ? settings.dinner.qty : 0);
      const total = calculateWeightedMealTotal(bVal, lVal, dVal);

      totalB += bVal;
      totalL += lVal;
      totalD += dVal;
      totalWeightedDay += total;

      return `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td>${bVal} <small style="color: var(--text-muted);">(${settings.breakfast.statusText})</small></td>
          <td>${lVal} <small style="color: var(--text-muted);">(${settings.lunch.statusText})</small></td>
          <td>${dVal} <small style="color: var(--text-muted);">(${settings.dinner.statusText})</small></td>
          <td><strong style="color: var(--accent-primary);">${total.toFixed(1)}</strong></td>
        </tr>
      `;
    }).join('');

    const weightedB = (totalB * weights.breakfastWeight).toFixed(1);
    const weightedL = (totalL * weights.lunchWeight).toFixed(1);
    const weightedD = (totalD * weights.dinnerWeight).toFixed(1);

    cardsContainer.innerHTML = `
      <div class="kpi-card" style="padding: 0.85rem 1rem;">
        <div class="kpi-icon-box icon-amber" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-sun-fill"></i></div>
        <div class="kpi-info">
          <h4>${t('breakfast')} (${weights.breakfastWeight})</h4>
          <div class="kpi-value" style="font-size: 1.25rem;">${totalB} <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">(${weightedB} meal)</span></div>
        </div>
      </div>
      <div class="kpi-card" style="padding: 0.85rem 1rem;">
        <div class="kpi-icon-box icon-blue" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-sun-cloudy-fill"></i></div>
        <div class="kpi-info">
          <h4>${t('lunch')} (${weights.lunchWeight})</h4>
          <div class="kpi-value" style="font-size: 1.25rem;">${totalL} <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">(${weightedL} meal)</span></div>
        </div>
      </div>
      <div class="kpi-card" style="padding: 0.85rem 1rem;">
        <div class="kpi-icon-box icon-indigo" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-moon-fill"></i></div>
        <div class="kpi-info">
          <h4>${t('dinner')} (${weights.dinnerWeight})</h4>
          <div class="kpi-value" style="font-size: 1.25rem;">${totalD} <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">(${weightedD} meal)</span></div>
        </div>
      </div>
      <div class="kpi-card" style="padding: 0.85rem 1rem;">
        <div class="kpi-icon-box icon-emerald" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-restaurant-2-line"></i></div>
        <div class="kpi-info">
          <h4>Today's Total</h4>
          <div class="kpi-value" style="font-size: 1.25rem; color: var(--success);">${totalWeightedDay.toFixed(1)} <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">meals</span></div>
        </div>
      </div>
    `;

    tbody.innerHTML = memberRowsHtml;
  }

  function renderRecentActivities() {
    const container = document.getElementById('dashboard-recent-activities');
    const memberIds = getVisibleMembers().map(m => m.id);
    const meals = Storage.getMeals().filter(m => memberIds.includes(m.userId)).slice(-3).reverse();
    const expenses = Storage.getExpenses().filter(e => memberIds.includes(e.spentBy) || memberIds.includes(e.addedBy)).slice(-3).reverse();
    const users = Storage.getUsers();

    let activities = [];

    meals.forEach(m => {
      const u = users.find(x => x.id === m.userId);
      activities.push({
        icon: 'ri-bowl-line',
        title: `${u ? u.name : 'Member'} meal entry (${m.total} meals)`,
        date: m.date,
        type: 'meal'
      });
    });

    expenses.forEach(e => {
      const spentUser = users.find(x => x.id === (e.spentBy || e.userId || e.addedBy));
      activities.push({
        icon: 'ri-money-dollar-circle-line',
        title: `Expense by ${spentUser ? spentUser.name : 'Member'}: ${e.description} (${formatCurrency(e.amount)})`,
        date: e.date,
        type: 'expense'
      });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (activities.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="ri-inbox-line empty-state-icon"></i>
          <div class="empty-state-title">No Recent Activity</div>
          <p class="empty-state-text">Start adding meals or expenses to see real-time updates.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = activities.slice(0, 5).map(act => `
      <div style="display: flex; align-items: center; gap: 0.65rem; padding: 0.65rem 0; border-bottom: 1px solid var(--border-color); min-width: 0; width: 100%;">
        <div class="kpi-icon-box icon-indigo" style="width: 34px; height: 34px; min-width: 34px; font-size: 1rem; flex-shrink: 0;">
          <i class="${act.icon}"></i>
        </div>
        <div style="flex: 1; min-width: 0; overflow: hidden;">
          <div style="font-size: 0.825rem; font-weight: 600; word-break: break-word; line-height: 1.25;">${act.title}</div>
          <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 0.15rem;">${formatDate(act.date)}</div>
        </div>
      </div>
    `).join('');
  }

  function renderExpenseCategoryOverview() {
    const container = document.getElementById('dashboard-expense-categories');
    const memberIds = getVisibleMembers().map(m => m.id);
    const expenses = Storage.getExpenses().filter(e => e.date.startsWith(state.selectedMonth) && (memberIds.includes(e.spentBy) || memberIds.includes(e.addedBy)));

    if (expenses.length === 0) {
      container.innerHTML = `<p style="font-size: 0.875rem; color: var(--text-muted);">No expenses recorded for ${state.selectedMonth}.</p>`;
      return;
    }

    const catTotals = {};
    expenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + parseFloat(e.amount);
    });

    const total = Object.values(catTotals).reduce((a, b) => a + b, 0);

    container.innerHTML = Object.keys(catTotals).map(cat => {
      const amt = catTotals[cat];
      const pct = total > 0 ? ((amt / total) * 100).toFixed(0) : 0;
      return `
        <div style="margin-bottom: 0.85rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">
            <span>${cat}</span>
            <span>${formatCurrency(amt)} (${pct}%)</span>
          </div>
          <div style="height: 6px; background: var(--bg-secondary); border-radius: var(--radius-full); overflow: hidden;">
            <div style="height: 100%; width: ${pct}%; background: var(--accent-primary); border-radius: var(--radius-full);"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderMemberBalancesList() {
    const container = document.getElementById('dashboard-member-balances-list');
    const users = getVisibleMembers().filter(u => u.active !== false);
    const month = state.selectedMonth;

    if (users.length === 0) {
      container.innerHTML = `<p style="font-size: 0.875rem; color: var(--text-muted);">No active members.</p>`;
      return;
    }

    container.innerHTML = users.map(u => {
      const bal = calculateMemberBalance(u.id, month);
      const status = getBalanceStatus(bal);
      const isManagerNow = isUserMealManagerForDate(u) || u.isMealManager;

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0; border-bottom: 1px solid var(--border-color); gap: 0.5rem; min-width: 0; width: 100%;">
          <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0; flex: 1;">
            <div class="user-avatar" style="width: 32px; height: 32px; min-width: 32px; font-size: 0.9rem; flex-shrink: 0;">${u.name.charAt(0)}</div>
            <div style="min-width: 0; flex: 1; overflow: hidden;">
              <div style="font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${u.name}
                ${isManagerNow ? `<span class="user-role-badge role-manager" style="font-size: 0.625rem; padding: 0.1rem 0.25rem; margin-left: 0.2rem;">${t('manager')}</span>` : ''}
              </div>
              <div style="font-size: 0.725rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${u.phone}</div>
            </div>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-size: 0.85rem; font-weight: 700; color: ${bal >= 0 ? 'var(--success)' : 'var(--danger)'};">  
              ${formatCurrency(bal)}
            </div>
            <span class="badge ${status.class}" style="font-size: 0.65rem; padding: 0.1rem 0.35rem;">${status.label}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderMemberOwnTodayMeal() {
    const user = state.currentUser;
    const today = getCurrentDateString();
    const allMeals = Storage.getMeals();
    const weights = Storage.getMealSettings();

    const mRecord = allMeals.find(m => m.userId === user.id && m.date === today);
    const settings = getUserEffectiveMealSettings(user.id, today);

    const bVal = mRecord ? (parseInt(mRecord.breakfast) || 0) : (settings.breakfast.isOn ? settings.breakfast.qty : 0);
    const lVal = mRecord ? (parseInt(mRecord.lunch) || 0) : (settings.lunch.isOn ? settings.lunch.qty : 0);
    const dVal = mRecord ? (parseInt(mRecord.dinner) || 0) : (settings.dinner.isOn ? settings.dinner.qty : 0);
    const total = calculateWeightedMealTotal(bVal, lVal, dVal);

    const cardsContainer = document.getElementById('dashboard-today-meal-cards');
    const tbody = document.getElementById('dashboard-today-meal-tbody');

    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div class="kpi-card" style="padding: 0.85rem 1rem;">
          <div class="kpi-icon-box icon-amber" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-sun-fill"></i></div>
          <div class="kpi-info">
            <h4>${t('breakfast')} (${weights.breakfastWeight})</h4>
            <div class="kpi-value" style="font-size: 1.25rem;">${bVal}</div>
          </div>
        </div>
        <div class="kpi-card" style="padding: 0.85rem 1rem;">
          <div class="kpi-icon-box icon-blue" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-sun-cloudy-fill"></i></div>
          <div class="kpi-info">
            <h4>${t('lunch')} (${weights.lunchWeight})</h4>
            <div class="kpi-value" style="font-size: 1.25rem;">${lVal}</div>
          </div>
        </div>
        <div class="kpi-card" style="padding: 0.85rem 1rem;">
          <div class="kpi-icon-box icon-indigo" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-moon-fill"></i></div>
          <div class="kpi-info">
            <h4>${t('dinner')} (${weights.dinnerWeight})</h4>
            <div class="kpi-value" style="font-size: 1.25rem;">${dVal}</div>
          </div>
        </div>
        <div class="kpi-card" style="padding: 0.85rem 1rem;">
          <div class="kpi-icon-box icon-emerald" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-restaurant-2-line"></i></div>
          <div class="kpi-info">
            <h4>My Total Today</h4>
            <div class="kpi-value" style="font-size: 1.25rem; color: var(--success);">${total.toFixed(1)} <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">meals</span></div>
          </div>
        </div>
      `;
    }
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td><strong>${user.name}</strong></td>
          <td>${bVal}</td>
          <td>${lVal}</td>
          <td>${dVal}</td>
          <td><strong style="color: var(--accent-primary);">${total.toFixed(1)}</strong></td>
        </tr>
      `;
    }
    if (users.length === 0) {
      container.innerHTML = `<p style="font-size: 0.875rem; color: var(--text-muted);">No active members.</p>`;
      return;
    }

    container.innerHTML = users.map(u => {
      const bal = calculateMemberBalance(u.id, month);
      const status = getBalanceStatus(bal);
      const isManagerNow = isUserMealManagerForDate(u) || u.isMealManager;

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.9rem;">${u.name.charAt(0)}</div>
            <div>
              <div style="font-size: 0.85rem; font-weight: 600;">
                ${u.name}
                ${isManagerNow ? `<span class="user-role-badge role-manager" style="font-size: 0.65rem; margin-left: 0.35rem;">${t('manager')}</span>` : ''}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${u.phone}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.875rem; font-weight: 700; color: ${bal >= 0 ? 'var(--success)' : 'var(--danger)'};">
              ${formatCurrency(bal)}
            </div>
            <span class="badge ${status.class}">${status.label}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ==========================================================================
     11.5 DAILY MEAL CHART & PER-MEMBER SETTINGS ENGINE
     ========================================================================== */
  function getUserEffectiveMealSettings(userId, targetDate) {
    const allSettings = Storage.getUserMealSettings();
    const userSettings = allSettings[userId] || {
      breakfast: { status: 'on_daily', qty: 1 },
      lunch: { status: 'on_daily', qty: 1 },
      dinner: { status: 'on_daily', qty: 1 }
    };

    const dateSettings = userSettings.dates?.[targetDate] || {};

    const result = {};
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      const mealSetting = dateSettings[meal] || userSettings[meal] || { status: 'on_daily', qty: 1 };
      const status = mealSetting.status || 'on_daily';

      let isOn = false;
      let statusText = '';
      let badgeClass = '';

      if (status === 'on_daily') {
        isOn = true;
        statusText = t('on_daily');
        badgeClass = 'status-tag-on';
      } else if (status === 'on_once') {
        isOn = dateSettings[meal]?.status === 'on_once';
        statusText = isOn ? t('on_once') : t('off_daily');
        badgeClass = isOn ? 'status-tag-once' : 'status-tag-off';
      } else if (status === 'off_daily') {
        isOn = false;
        statusText = t('off_daily');
        badgeClass = 'status-tag-off';
      } else if (status === 'off_once') {
        isOn = dateSettings[meal]?.status !== 'off_once';
        statusText = dateSettings[meal]?.status === 'off_once' ? t('off_once') : t('on_daily');
        badgeClass = dateSettings[meal]?.status === 'off_once' ? 'status-tag-once' : 'status-tag-on';
      }

      result[meal] = {
        isOn,
        status,
        statusText,
        badgeClass,
        qty: mealSetting.qty !== undefined ? parseInt(mealSetting.qty) : 1
      };
    });

    return result;
  }

  function renderDailyMealChart(targetDate = state.selectedChartDate) {
    if (!state.currentUser) return;
    state.selectedChartDate = targetDate;

    const datePicker = document.getElementById('meal-chart-date');
    if (datePicker && datePicker.value !== targetDate) {
      datePicker.value = targetDate;
    }

    // Update Weights Legend Callout
    const weights = Storage.getMealSettings();
    const wB = document.getElementById('chart-weight-breakfast');
    const wL = document.getElementById('chart-weight-lunch');
    const wD = document.getElementById('chart-weight-dinner');
    if (wB) wB.textContent = weights.breakfastWeight;
    if (wL) wL.textContent = weights.lunchWeight;
    if (wD) wD.textContent = weights.dinnerWeight;

    // Update Duty Manager Badge & Warning Notice
    const activeManagerObj = getActiveManagerForDate(targetDate);
    const mgrNameEl = document.getElementById('meal-chart-manager-name');
    if (mgrNameEl) {
      mgrNameEl.textContent = activeManagerObj ? `${activeManagerObj.user.name} (${t('manager')})` : 'No Manager Elected';
    }

    const noticeBanner = document.getElementById('daily-meal-notice-banner');
    if (noticeBanner) {
      if (!activeManagerObj) {
        noticeBanner.innerHTML = `
          <div class="no-manager-alert" style="background: rgba(239, 68, 68, 0.12); border: 1.5px solid var(--danger); border-radius: var(--radius-md); padding: 0.85rem 1.1rem; margin-bottom: 1.25rem; color: var(--danger); display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;">
            <div>
              <strong style="font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;"><i class="ri-error-warning-fill" style="font-size: 1.2rem;"></i> No Manager Elected!</strong>
              <div style="font-size: 0.825rem; margin-top: 0.25rem; color: var(--text-secondary);">
                Meal counting is disabled until a manager is elected. Use the Admin panel to assign a manager.
              </div>
            </div>
            ${(state.currentUser.role === ROLES.SUPERADMIN || state.currentUser.role === ROLES.ADMIN) ? `
              <button class="btn btn-sm btn-danger" id="btn-quick-elect-mgr" style="white-space: nowrap;">
                <i class="ri-user-star-line"></i> Elect Manager Now
              </button>
            ` : ''}
          </div>
        `;
        const quickElectBtn = document.getElementById('btn-quick-elect-mgr');
        if (quickElectBtn) {
          quickElectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('btn-open-elect-modal').click();
          });
        }
      } else {
        noticeBanner.innerHTML = '';
      }
    }

    let members = getVisibleMembers().filter(u => u.active !== false);
    // Members only see their own row in the daily meal chart
    if (!canManageMess(state.currentUser)) {
      members = members.filter(u => u.id === state.currentUser.id);
    }
    const tbody = document.getElementById('daily-meal-grid-tbody');
    if (!tbody) return;

    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No active members found.</td></tr>`;
      document.getElementById('daily-chart-day-total').textContent = '0.0';
      return;
    }

    let allMeals = Storage.getMeals();
    let dayMealsMap = {};
    let mealsUpdated = false;
    const isManagerElected = !!activeManagerObj;

    members.forEach(u => {
      let mRecord = allMeals.find(m => m.userId === u.id && m.date === targetDate);
      const settings = getUserEffectiveMealSettings(u.id, targetDate);

      if (!mRecord) {
        // If manager is elected, auto-initialize from meal settings; if no manager, default to 0
        const bVal = isManagerElected && settings.breakfast.isOn ? settings.breakfast.qty : 0;
        const lVal = isManagerElected && settings.lunch.isOn ? settings.lunch.qty : 0;
        const dVal = isManagerElected && settings.dinner.isOn ? settings.dinner.qty : 0;
        const total = calculateWeightedMealTotal(bVal, lVal, dVal);

        mRecord = {
          id: generateId(),
          userId: u.id,
          date: targetDate,
          breakfast: bVal,
          lunch: lVal,
          dinner: dVal,
          total: total,
          mode: 'onetime',
          note: '',
          createdAt: new Date().toISOString()
        };

        allMeals.push(mRecord);
        mealsUpdated = true;
      }

      dayMealsMap[u.id] = mRecord;
    });

    if (mealsUpdated) {
      Storage.saveMeals(allMeals);
    }

    let dayTotal = 0;

    tbody.innerHTML = members.map(u => {
      const mRecord = dayMealsMap[u.id] || { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
      const settings = getUserEffectiveMealSettings(u.id, targetDate);
      const rowTotal = isManagerElected ? (parseFloat(mRecord.total) || 0) : 0;
      dayTotal += rowTotal;

      const canEdit = isManagerElected && canManageMess(state.currentUser, targetDate);

      return `
        <tr style="${!isManagerElected ? 'opacity: 0.65;' : ''}">
          <td>
            <div style="font-weight: 600; color: var(--text-primary);">${u.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${u.phone}</div>
          </td>
          <td>
            <div class="grid-meal-cell">
              <input type="number" min="0" max="10" class="grid-meal-input" data-userid="${u.id}" data-meal="breakfast" value="${isManagerElected ? mRecord.breakfast : 0}" ${canEdit ? '' : 'disabled'} title="${!isManagerElected ? 'Manager election required to enable meal counting' : ''}">
              <span class="meal-status-tag ${settings.breakfast.badgeClass}">${settings.breakfast.statusText}</span>
            </div>
          </td>
          <td>
            <div class="grid-meal-cell">
              <input type="number" min="0" max="10" class="grid-meal-input" data-userid="${u.id}" data-meal="lunch" value="${isManagerElected ? mRecord.lunch : 0}" ${canEdit ? '' : 'disabled'} title="${!isManagerElected ? 'Manager election required to enable meal counting' : ''}">
              <span class="meal-status-tag ${settings.lunch.badgeClass}">${settings.lunch.statusText}</span>
            </div>
          </td>
          <td>
            <div class="grid-meal-cell">
              <input type="number" min="0" max="10" class="grid-meal-input" data-userid="${u.id}" data-meal="dinner" value="${isManagerElected ? mRecord.dinner : 0}" ${canEdit ? '' : 'disabled'} title="${!isManagerElected ? 'Manager election required to enable meal counting' : ''}">
              <span class="meal-status-tag ${settings.dinner.badgeClass}">${settings.dinner.statusText}</span>
            </div>
          </td>
          <td>
            <strong id="grid-user-total-${u.id}" style="color: var(--accent-primary); font-size: 1.05rem;">${rowTotal.toFixed(1)}</strong>
          </td>
          <td style="text-align: center;">
            <button type="button" class="icon-btn btn-sm btn-open-meal-settings" data-userid="${u.id}" data-username="${u.name}" title="${!isManagerElected ? 'Manager election required' : t('meal_settings')}" ${!isManagerElected ? 'disabled style="opacity: 0.5; margin: 0 auto;"' : 'style="margin: 0 auto;"'}>
              <i class="ri-settings-4-line settings-btn-spin"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    const dayTotalEl = document.getElementById('daily-chart-day-total');
    if (dayTotalEl) {
      dayTotalEl.textContent = dayTotal.toFixed(1);
    }
  }

  function updateDailyMealInput(userId, mealType, value, date = state.selectedChartDate) {
    if (!hasElectedManagerForDate(date)) {
      showToast('Meal count/entry is disabled until a manager is elected.', 'error');
      renderDailyMealChart(date);
      return;
    }
    let allMeals = Storage.getMeals();
    let mRecord = allMeals.find(m => m.userId === userId && m.date === date);

    const valNum = parseInt(value) || 0;

    if (!mRecord) {
      mRecord = {
        id: generateId(),
        userId: userId,
        date: date,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        total: 0,
        mode: 'onetime',
        note: '',
        createdAt: new Date().toISOString()
      };
      allMeals.push(mRecord);
    }

    mRecord[mealType] = valNum;
    mRecord.total = calculateWeightedMealTotal(mRecord.breakfast, mRecord.lunch, mRecord.dinner);
    mRecord.updatedAt = new Date().toISOString();

    Storage.saveMeals(allMeals);

    // Update row total UI
    const rowTotalEl = document.getElementById(`grid-user-total-${userId}`);
    if (rowTotalEl) {
      rowTotalEl.textContent = mRecord.total.toFixed(1);
    }

    // Update Day total UI
    const members = getVisibleMembers().filter(u => u.active !== false);
    let dayTotal = 0;
    members.forEach(u => {
      const rec = allMeals.find(m => m.userId === u.id && m.date === date);
      if (rec) dayTotal += parseFloat(rec.total) || 0;
    });

    const dayTotalEl = document.getElementById('daily-chart-day-total');
    if (dayTotalEl) {
      dayTotalEl.textContent = dayTotal.toFixed(1);
    }
  }

  function openMealSettingsModal(userId, date = state.selectedChartDate) {
    const users = Storage.getUsers();
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    document.getElementById('settings-member-id').value = targetUser.id;
    document.getElementById('settings-member-name').textContent = targetUser.name;
    document.getElementById('settings-date').textContent = `${t('date')}: ${formatDate(date)} (${date})`;

    const allSettings = Storage.getUserMealSettings();
    const userSettings = allSettings[userId] || {};
    const dateSettings = userSettings.dates?.[date] || {};

    ['bf', 'lunch', 'dinner'].forEach(mKey => {
      const mealFullKey = mKey === 'bf' ? 'breakfast' : mKey;
      const mealSetting = dateSettings[mealFullKey] || userSettings[mealFullKey] || { status: 'on_daily', qty: 1 };

      const qtyInput = document.getElementById(`settings-${mKey}-qty`);
      if (qtyInput) qtyInput.value = mealSetting.qty !== undefined ? mealSetting.qty : 1;

      const statusVal = mealSetting.status || 'on_daily';
      const radio = document.querySelector(`input[name="settings-${mKey}-status"][value="${statusVal}"]`);
      if (radio) radio.checked = true;
    });

    openModal('meal-settings-modal');
  }

  function saveMealSettingsForm() {
    const userId = document.getElementById('settings-member-id').value;
    const date = state.selectedChartDate;
    if (!userId) return;

    const allSettings = Storage.getUserMealSettings();
    if (!allSettings[userId]) {
      allSettings[userId] = { dates: {} };
    }
    if (!allSettings[userId].dates) {
      allSettings[userId].dates = {};
    }
    if (!allSettings[userId].dates[date]) {
      allSettings[userId].dates[date] = {};
    }

    const mealsMap = {
      bf: 'breakfast',
      lunch: 'lunch',
      dinner: 'dinner'
    };

    ['bf', 'lunch', 'dinner'].forEach(mKey => {
      const mealFullKey = mealsMap[mKey];
      const qty = parseInt(document.getElementById(`settings-${mKey}-qty`).value) || 1;
      const statusRadio = document.querySelector(`input[name="settings-${mKey}-status"]:checked`);
      const status = statusRadio ? statusRadio.value : 'on_daily';

      // Save date-specific setting
      allSettings[userId].dates[date][mealFullKey] = { status, qty };

      // If continuous, update default setting too
      if (status === 'on_daily' || status === 'off_daily') {
        allSettings[userId][mealFullKey] = { status, qty };
      }
    });

    Storage.saveUserMealSettings(allSettings);

    // Apply effective settings to actual meals for this date
    const effective = getUserEffectiveMealSettings(userId, date);
    let allMeals = Storage.getMeals();
    let mRecord = allMeals.find(m => m.userId === userId && m.date === date);

    const bVal = effective.breakfast.isOn ? effective.breakfast.qty : 0;
    const lVal = effective.lunch.isOn ? effective.lunch.qty : 0;
    const dVal = effective.dinner.isOn ? effective.dinner.qty : 0;
    const total = calculateWeightedMealTotal(bVal, lVal, dVal);

    if (!mRecord) {
      mRecord = {
        id: generateId(),
        userId: userId,
        date: date,
        breakfast: bVal,
        lunch: lVal,
        dinner: dVal,
        total: total,
        mode: 'onetime',
        note: '',
        createdAt: new Date().toISOString()
      };
      allMeals.push(mRecord);
    } else {
      mRecord.breakfast = bVal;
      mRecord.lunch = lVal;
      mRecord.dinner = dVal;
      mRecord.total = total;
      mRecord.updatedAt = new Date().toISOString();
    }

    Storage.saveMeals(allMeals);

    closeModal('meal-settings-modal');
    showToast('Meal settings saved successfully!', 'success');

    // Instantly re-render current view & meal views (Excel Sheet / Chart / Summary) without page refresh
    if (state.activeView === 'meals') {
      renderMealsView();
    } else {
      renderCurrentView();
    }
  }

  // MEALS VIEW ROUTER
  function renderMealsView() {
    if (!state.currentUser) return;

    const excelBtn = document.getElementById('meal-tab-excel');
    const chartBtn = document.getElementById('meal-tab-chart');
    const logBtn = document.getElementById('meal-tab-log');

    const excelContainer = document.getElementById('meal-excel-container');
    const chartContainer = document.getElementById('meal-chart-container');
    const logContainer = document.getElementById('meal-log-container');

    const mode = state.mealsViewMode || 'excel';

    // Reset container visibility
    if (excelContainer) excelContainer.classList.add('hidden');
    if (chartContainer) chartContainer.classList.add('hidden');
    if (logContainer) logContainer.classList.add('hidden');

    // Reset tab button states
    [excelBtn, chartBtn, logBtn].forEach(btn => {
      if (btn) {
        btn.classList.remove('active', 'btn-primary');
        btn.classList.add('btn-secondary');
      }
    });

    if (mode === 'excel') {
      if (excelContainer) excelContainer.classList.remove('hidden');
      if (excelBtn) {
        excelBtn.classList.add('active', 'btn-primary');
        excelBtn.classList.remove('btn-secondary');
      }
      renderMonthlyExcelSheet();
    } else if (mode === 'chart') {
      if (chartContainer) chartContainer.classList.remove('hidden');
      if (chartBtn) {
        chartBtn.classList.add('active', 'btn-primary');
        chartBtn.classList.remove('btn-secondary');
      }
      renderDailyMealChart(state.selectedChartDate);
    } else {
      if (logContainer) logContainer.classList.remove('hidden');
      if (logBtn) {
        logBtn.classList.add('active', 'btn-primary');
        logBtn.classList.remove('btn-secondary');
      }
      renderMealHistoryLog();
    }
  }

  function renderMonthlyExcelSheet() {
    if (!state.currentUser) return;
    const month = state.selectedMonth; // format: YYYY-MM
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthIdx = parseInt(monthStr, 10) - 1;

    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthDisplayName = `${monthNames[monthIdx]} ${year}`;
    const displayMonthEl = document.getElementById('excel-month-display');
    if (displayMonthEl) displayMonthEl.textContent = monthDisplayName;

    const weights = Storage.getMealSettings();
    const wB = document.getElementById('excel-weight-bf');
    const wL = document.getElementById('excel-weight-lunch');
    const wD = document.getElementById('excel-weight-dinner');
    if (wB) wB.textContent = weights.breakfastWeight;
    if (wL) wL.textContent = weights.lunchWeight;
    if (wD) wD.textContent = weights.dinnerWeight;

    let members = getVisibleMembers().filter(u => u.active !== false);
    if (!canManageMess(state.currentUser)) {
      members = members.filter(u => u.id === state.currentUser.id);
    }

    const thead = document.getElementById('monthly-excel-thead');
    const tbody = document.getElementById('monthly-excel-tbody');
    const tfoot = document.getElementById('monthly-excel-tfoot');
    if (!thead || !tbody || !tfoot) return;

    let headHtml = `
      <tr>
        <th style="width: 36px; text-align: center;">#</th>
        <th class="excel-sticky-col" style="min-width: 150px; text-align: left;">Member Name</th>
    `;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPad = String(day).padStart(2, '0');
      const dateStr = `${month}-${dayPad}`;
      const dObj = new Date(`${dateStr}T00:00:00`);
      const dayOfWeekStr = dObj.toLocaleDateString('en-US', { weekday: 'short' });
      headHtml += `<th style="min-width: 42px; text-align: center; padding: 0.35rem 0.2rem; vertical-align: middle;" title="${dateStr} (${dayOfWeekStr})"><div style="font-size: 0.85rem; font-weight: 700; line-height: 1.1;">${dayPad}</div><div style="font-size: 0.625rem; font-weight: 600; opacity: 0.85; line-height: 1.1; margin-top: 2px;">${dayOfWeekStr}</div></th>`;
    }
    headHtml += `
        <th style="min-width: 50px; background-color: #0d6334 !important;">BF</th>
        <th style="min-width: 50px; background-color: #0d6334 !important;">LUNCH</th>
        <th style="min-width: 50px; background-color: #0d6334 !important;">DINNER</th>
        <th style="min-width: 75px; background-color: #0d6334 !important;">TOTAL</th>
      </tr>
    `;
    thead.innerHTML = headHtml;

    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${daysInMonth + 6}" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No active members found for ${monthDisplayName}.</td></tr>`;
      tfoot.innerHTML = '';
      return;
    }

    const allMeals = Storage.getMeals();
    const dailyTotalsMap = Array(daysInMonth + 1).fill(0);
    const todayStr = getCurrentDateString();

    let grandBf = 0, grandLunch = 0, grandDinner = 0, grandTotal = 0;

    let bodyHtml = '';
    members.forEach((mUser, idx) => {
      let memberBf = 0, memberLunch = 0, memberDinner = 0, memberTotal = 0;

      bodyHtml += `
        <tr>
          <td style="text-align: center; color: var(--text-muted); font-size: 0.75rem;">${idx + 1}</td>
          <td class="excel-sticky-col">
            <strong>${mUser.name}</strong>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${mUser.phone}</div>
          </td>
      `;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayPad = String(day).padStart(2, '0');
        const targetDate = `${month}-${dayPad}`;

        const mRecord = allMeals.find(m => m.userId === mUser.id && m.date === targetDate);
        const settings = getUserEffectiveMealSettings(mUser.id, targetDate);

        const bVal = mRecord ? (parseInt(mRecord.breakfast) || 0) : (settings.breakfast.isOn ? settings.breakfast.qty : 0);
        const lVal = mRecord ? (parseInt(mRecord.lunch) || 0) : (settings.lunch.isOn ? settings.lunch.qty : 0);
        const dVal = mRecord ? (parseInt(mRecord.dinner) || 0) : (settings.dinner.isOn ? settings.dinner.qty : 0);
        const dayWeightedTotal = calculateWeightedMealTotal(bVal, lVal, dVal);

        const isFutureDate = targetDate > todayStr;

        if (!isFutureDate) {
          memberBf += bVal;
          memberLunch += lVal;
          memberDinner += dVal;
          memberTotal += dayWeightedTotal;

          dailyTotalsMap[day] += dayWeightedTotal;
        }

        let cellClass = dayWeightedTotal > 0 ? 'excel-cell-active' : 'excel-cell-zero';
        let cellText = dayWeightedTotal > 0 ? dayWeightedTotal.toFixed(1) : '-';
        if (isFutureDate) {
          cellClass = 'excel-cell-future';
          cellText = `<span style="opacity: 0.55;" title="Scheduled future preference (activates on ${targetDate})">${dayWeightedTotal > 0 ? dayWeightedTotal.toFixed(1) : '-'}</span>`;
        }
        const titleText = `${mUser.name} (${targetDate}): B:${bVal}, L:${lVal}, D:${dVal} = ${dayWeightedTotal.toFixed(1)} meals ${isFutureDate ? '(Scheduled future date - not yet counted)' : ''}`;

        bodyHtml += `
          <td class="excel-cell-val ${cellClass} excel-cell-clickable" 
              data-userid="${mUser.id}" 
              data-date="${targetDate}" 
              title="${titleText}">
            ${cellText}
          </td>
        `;
      }

      grandBf += memberBf;
      grandLunch += memberLunch;
      grandDinner += memberDinner;
      grandTotal += memberTotal;

      bodyHtml += `
          <td class="excel-cell-val" style="font-weight: 600;">${memberBf}</td>
          <td class="excel-cell-val" style="font-weight: 600;">${memberLunch}</td>
          <td class="excel-cell-val" style="font-weight: 600;">${memberDinner}</td>
          <td class="excel-cell-val" style="font-weight: 700; color: #107c41; font-size: 0.95rem;">${memberTotal.toFixed(1)}</td>
        </tr>
      `;
    });

    tbody.innerHTML = bodyHtml;

    let footHtml = `
      <tr>
        <td style="text-align: center;">&Sigma;</td>
        <td class="excel-sticky-col" style="font-weight: 700; color: #107c41;">DAILY MESS TOTAL</td>
    `;

    for (let day = 1; day <= daysInMonth; day++) {
      const dTotal = dailyTotalsMap[day];
      const dClass = dTotal > 0 ? 'excel-cell-active' : 'excel-cell-zero';
      footHtml += `<td class="excel-cell-val ${dClass}">${dTotal > 0 ? dTotal.toFixed(1) : '-'}</td>`;
    }

    footHtml += `
        <td class="excel-cell-val">${grandBf}</td>
        <td class="excel-cell-val">${grandLunch}</td>
        <td class="excel-cell-val">${grandDinner}</td>
        <td class="excel-cell-val" style="font-size: 1rem; color: #107c41; font-weight: 800;">${grandTotal.toFixed(1)}</td>
      </tr>
    `;

    tfoot.innerHTML = footHtml;
  }

  function exportExcelSheetCSV(month = state.selectedMonth) {
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthIdx = parseInt(monthStr, 10) - 1;
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

    let members = getVisibleMembers().filter(u => u.active !== false);
    if (!canManageMess(state.currentUser)) {
      members = members.filter(u => u.id === state.currentUser.id);
    }
    const allMeals = Storage.getMeals();

    let csvContent = `data:text/csv;charset=utf-8,`;
    csvContent += `MESS MEAL TRACKER - MONTHLY EXCEL SHEET (${month})\n\n`;

    let headerRow = `#,Member Name,Phone`;
    for (let day = 1; day <= daysInMonth; day++) {
      headerRow += `,Day ${String(day).padStart(2, '0')}`;
    }
    headerRow += `,Total BF,Total Lunch,Total Dinner,Grand Total Meals\n`;
    csvContent += headerRow;

    const dailyTotalsMap = Array(daysInMonth + 1).fill(0);
    let grandBf = 0, grandLunch = 0, grandDinner = 0, grandTotal = 0;

    members.forEach((mUser, idx) => {
      let memberBf = 0, memberLunch = 0, memberDinner = 0, memberTotal = 0;
      let rowStr = `${idx + 1},"${mUser.name}",${mUser.phone}`;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayPad = String(day).padStart(2, '0');
        const targetDate = `${month}-${dayPad}`;

        const mRecord = allMeals.find(m => m.userId === mUser.id && m.date === targetDate);
        const settings = getUserEffectiveMealSettings(mUser.id, targetDate);

        const bVal = mRecord ? (parseInt(mRecord.breakfast) || 0) : (settings.breakfast.isOn ? settings.breakfast.qty : 0);
        const lVal = mRecord ? (parseInt(mRecord.lunch) || 0) : (settings.lunch.isOn ? settings.lunch.qty : 0);
        const dVal = mRecord ? (parseInt(mRecord.dinner) || 0) : (settings.dinner.isOn ? settings.dinner.qty : 0);
        const dayWeightedTotal = calculateWeightedMealTotal(bVal, lVal, dVal);

        memberBf += bVal;
        memberLunch += lVal;
        memberDinner += dVal;
        memberTotal += dayWeightedTotal;

        dailyTotalsMap[day] += dayWeightedTotal;

        rowStr += `,${dayWeightedTotal.toFixed(1)}`;
      }

      grandBf += memberBf;
      grandLunch += memberLunch;
      grandDinner += memberDinner;
      grandTotal += memberTotal;

      rowStr += `,${memberBf},${memberLunch},${memberDinner},${memberTotal.toFixed(1)}\n`;
      csvContent += rowStr;
    });

    let footStr = `Total,DAILY MESS TOTAL,-`;
    for (let day = 1; day <= daysInMonth; day++) {
      footStr += `,${dailyTotalsMap[day].toFixed(1)}`;
    }
    footStr += `,${grandBf},${grandLunch},${grandDinner},${grandTotal.toFixed(1)}\n`;
    csvContent += footStr;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `monthly_excel_meal_sheet_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported Monthly Excel Sheet for ${month}!`, 'success');
  }

  function renderMealHistoryLog() {
    if (!state.currentUser) return;
    const tbody = document.getElementById('meals-table-body');
    const searchVal = document.getElementById('meal-search-input').value.toLowerCase();
    const memberVal = document.getElementById('meal-member-filter').value;
    const dateVal = document.getElementById('meal-date-filter').value;

    const visibleMembers = getVisibleMembers();
    const visibleMemberIds = visibleMembers.map(m => m.id);
    const users = Storage.getUsers();
    let meals = Storage.getMeals().filter(m => visibleMemberIds.includes(m.userId));

    if (!canManageMess(state.currentUser)) {
      meals = meals.filter(m => m.userId === state.currentUser.id);
    }

    meals = meals.filter(m => m.date.startsWith(state.selectedMonth));

    if (memberVal && memberVal !== 'all') {
      meals = meals.filter(m => m.userId === memberVal);
    }
    if (dateVal) {
      meals = meals.filter(m => m.date === dateVal);
    }
    if (searchVal) {
      meals = meals.filter(m => {
        const u = users.find(x => x.id === m.userId);
        const nameMatch = u && u.name.toLowerCase().includes(searchVal);
        const phoneMatch = u && u.phone.includes(searchVal);
        const noteMatch = m.note && m.note.toLowerCase().includes(searchVal);
        return nameMatch || phoneMatch || noteMatch;
      });
    }

    meals.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (meals.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <i class="ri-bowl-line empty-state-icon"></i>
              <div class="empty-state-title">No Meal Records Found</div>
              <p class="empty-state-text">There are no meal entries recorded matching your current filters.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = meals.map(m => {
      const u = users.find(x => x.id === m.userId);
      const isAuthorizedManager = canManageMess(state.currentUser, m.date);

      return `
        <tr>
          <td><strong>${formatDate(m.date)}</strong></td>
          <td>
            <div style="font-weight: 600;">${u ? u.name : 'Unknown Member'}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${u ? u.phone : ''}</div>
          </td>
          <td>${m.breakfast}</td>
          <td>${m.lunch}</td>
          <td>${m.dinner}</td>
          <td>
            <strong style="color: var(--accent-primary);">${m.total}</strong>
            ${m.mode === 'recurring' ? '<span class="badge badge-success" style="font-size: 0.65rem; margin-left: 0.25rem;">Recurring</span>' : ''}
          </td>
          <td>${m.note || '-'}</td>
          <td>
            ${isAuthorizedManager ? `
              <button class="icon-btn btn-sm edit-meal-btn" data-id="${m.id}" title="${t('edit')}"><i class="ri-edit-line"></i></button>
              <button class="icon-btn btn-sm btn-danger delete-meal-btn" data-id="${m.id}" title="${t('delete')}"><i class="ri-delete-bin-line"></i></button>
            ` : '<span style="color: var(--text-muted); font-size: 0.8rem;">Read Only</span>'}
          </td>
        </tr>
      `;
    }).join('');
  }

  // EXPENSES VIEW
  function renderExpensesView() {
    if (!state.currentUser) return;
    const tbody = document.getElementById('expenses-table-body');
    const searchVal = document.getElementById('expense-search-input').value.toLowerCase();
    const catVal = document.getElementById('expense-category-filter').value;
    const dateVal = document.getElementById('expense-date-filter').value;

    const visibleMemberIds = getVisibleMembers().map(m => m.id);
    const users = Storage.getUsers();
    let expenses = Storage.getExpenses().filter(e => e.date.startsWith(state.selectedMonth) && (visibleMemberIds.includes(e.spentBy) || visibleMemberIds.includes(e.addedBy)));

    if (catVal && catVal !== 'all') {
      expenses = expenses.filter(e => e.category === catVal);
    }
    if (dateVal) {
      expenses = expenses.filter(e => e.date === dateVal);
    }
    if (searchVal) {
      expenses = expenses.filter(e => e.description.toLowerCase().includes(searchVal) || e.category.toLowerCase().includes(searchVal));
    }

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (expenses.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <i class="ri-money-dollar-circle-line empty-state-icon"></i>
              <div class="empty-state-title">No Expenses Found</div>
              <p class="empty-state-text">No expense entries recorded for this month.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = expenses.map(e => {
      const spentUser = users.find(x => x.id === (e.spentBy || e.userId || e.addedBy));
      return `
        <tr>
          <td><strong>${formatDate(e.date)}</strong></td>
          <td><span class="category-tag">${e.category}</span></td>
          <td>${e.description}</td>
          <td><strong style="color: var(--accent-primary);">${formatCurrency(e.amount)}</strong></td>
          <td><strong>${spentUser ? spentUser.name : 'Member'}</strong></td>
          ${canManageMess(state.currentUser, e.date) ? `
            <td>
              <button class="icon-btn btn-sm edit-expense-btn" data-id="${e.id}"><i class="ri-edit-line"></i></button>
              <button class="icon-btn btn-sm btn-danger delete-expense-btn" data-id="${e.id}"><i class="ri-delete-bin-line"></i></button>
            </td>
          ` : ''}
        </tr>
      `;
    }).join('');
  }

  // PAYMENTS VIEW
  function renderPaymentsView() {
    if (!state.currentUser) return;
    const tbody = document.getElementById('payments-table-body');
    const memberVal = document.getElementById('payment-member-filter').value;
    const dateVal = document.getElementById('payment-date-filter').value;

    const visibleMemberIds = getVisibleMembers().map(m => m.id);
    const users = Storage.getUsers();
    let payments = Storage.getPayments().filter(p => visibleMemberIds.includes(p.userId));

    if (!canManageMess(state.currentUser)) {
      payments = payments.filter(p => p.userId === state.currentUser.id);
    }

    payments = payments.filter(p => p.date.startsWith(state.selectedMonth));

    if (memberVal && memberVal !== 'all') {
      payments = payments.filter(p => p.userId === memberVal);
    }
    if (dateVal) {
      payments = payments.filter(p => p.date === dateVal);
    }

    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (payments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <i class="ri-wallet-3-line empty-state-icon"></i>
              <div class="empty-state-title">No Payments Recorded</div>
              <p class="empty-state-text">No payment records found for the selected month.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = payments.map(p => {
      const u = users.find(x => x.id === p.userId);
      const adder = users.find(x => x.id === p.addedBy);
      return `
        <tr>
          <td><strong>${formatDate(p.date)}</strong></td>
          <td><strong>${u ? u.name : 'Unknown Member'}</strong></td>
          <td><strong style="color: var(--success);">${formatCurrency(p.amount)}</strong></td>
          <td>${p.note || '-'}</td>
          <td>${adder ? adder.name : t('manager')}</td>
          ${canManageMess(state.currentUser, p.date) ? `
            <td>
              <button class="icon-btn btn-sm edit-payment-btn" data-id="${p.id}"><i class="ri-edit-line"></i></button>
              <button class="icon-btn btn-sm btn-danger delete-payment-btn" data-id="${p.id}"><i class="ri-delete-bin-line"></i></button>
            </td>
          ` : ''}
        </tr>
      `;
    }).join('');
  }

  // MONTHLY SUMMARY VIEW
  function renderSummaryView() {
    if (!state.currentUser) return;
    const month = state.selectedMonth;
    const isManager = canManageMess(state.currentUser);
    let users = getVisibleMembers().filter(u => u.active !== false);
    // Regular members: only show their own row
    if (!isManager) {
      users = users.filter(u => u.id === state.currentUser.id);
    }

    const totalMembers = users.length;
    const totalMeals = calculateTotalMeals(month);
    const totalExpenses = calculateTotalExpenses(month);
    const mealRate = calculateMealRate(month);
    const totalPayments = calculateTotalPayments(month);

    let totalReceivable = 0, totalPayable = 0;
    users.forEach(u => {
      const bal = calculateMemberBalance(u.id, month);
      if (bal > 0) totalReceivable += bal;
      if (bal < 0) totalPayable += Math.abs(bal);
    });

    document.getElementById('summary-kpi-container').innerHTML = `
      <div class="kpi-card">
        <div class="kpi-icon-box icon-blue"><i class="ri-group-line"></i></div>
        <div class="kpi-info">
          <h4>Total Members</h4>
          <div class="kpi-value">${totalMembers}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-box icon-indigo"><i class="ri-bowl-line"></i></div>
        <div class="kpi-info">
          <h4>Total Meals</h4>
          <div class="kpi-value">${totalMeals.toFixed(1)}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-box icon-amber"><i class="ri-money-dollar-circle-line"></i></div>
        <div class="kpi-info">
          <h4>Total Expenses</h4>
          <div class="kpi-value">${formatCurrency(totalExpenses)}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-box icon-emerald"><i class="ri-pulse-line"></i></div>
        <div class="kpi-info">
          <h4>Meal Rate</h4>
          <div class="kpi-value">${formatCurrency(mealRate)}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-box icon-blue"><i class="ri-wallet-3-line"></i></div>
        <div class="kpi-info">
          <h4>Total Payments</h4>
          <div class="kpi-value">${formatCurrency(totalPayments)}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-box icon-emerald"><i class="ri-arrow-up-circle-line"></i></div>
        <div class="kpi-info">
          <h4>Total Receivable</h4>
          <div class="kpi-value">${formatCurrency(totalReceivable)}</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-box icon-rose"><i class="ri-arrow-down-circle-line"></i></div>
        <div class="kpi-info">
          <h4>Total Payable</h4>
          <div class="kpi-value">${formatCurrency(totalPayable)}</div>
        </div>
      </div>
    `;

    const tbody = document.getElementById('summary-table-body');
    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" class="text-center">No active members found.</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => {
      const mealInfo = calculateMemberMeals(u.id, month);
      const mealOnlyBill = calculateMemberMealOnlyBill(u.id, month);
      const cookBill = calculateMemberCookBill(u.id, month);
      const totalBill = mealOnlyBill + cookBill;
      const paid = calculateMemberPaid(u.id, month);
      const balance = paid - totalBill;
      const status = getBalanceStatus(balance);
      const isCurrentManager = isUserMealManagerForDate(u) || u.isMealManager;

      return `
        <tr>
          <td>
            <strong>${u.name}</strong>
            ${isCurrentManager ? `<span class="user-role-badge role-manager" style="font-size: 0.65rem; margin-left: 0.25rem;">${t('manager')}</span>` : ''}
            <div style="font-size: 0.75rem; color: var(--text-muted);">${u.phone}</div>
          </td>
          <td>${mealInfo.breakfast}</td>
          <td>${mealInfo.lunch}</td>
          <td>${mealInfo.dinner}</td>
          <td><strong style="color: var(--accent-primary);">${mealInfo.total.toFixed ? mealInfo.total.toFixed(1) : mealInfo.total}</strong></td>
          <td>${formatCurrency(mealOnlyBill)}</td>
          <td>${cookBill > 0 ? `<strong style="color: var(--warning);">${formatCurrency(cookBill)}</strong>` : `<span style="color: var(--text-muted);">—</span>`}</td>
          <td><strong>${formatCurrency(totalBill)}</strong></td>
          <td>${formatCurrency(paid)}</td>
          <td><strong style="color: ${balance >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatCurrency(balance)}</strong></td>
          <td><span class="badge ${status.class}">${status.label}</span></td>
        </tr>
      `;
    }).join('');

    renderManagerReport();
    renderCookBillReport();
  }

  function renderManagerReport() {
    const tbody = document.getElementById('manager-report-table-body');
    const filterSelect = document.getElementById('summary-manager-filter');
    if (!tbody) return;

    const selectedManagerId = filterSelect ? filterSelect.value : 'all';
    let terms = Storage.getManagerTerms();
    const users = Storage.getUsers();
    const allMeals = Storage.getMeals();
    const allExpenses = Storage.getExpenses();
    const today = getCurrentDateString();

    if (selectedManagerId && selectedManagerId !== 'all') {
      terms = terms.filter(tItem => tItem.userId === selectedManagerId);
    }

    if (terms.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.25rem;">
            No manager duty terms found for the selected filter.
          </td>
        </tr>
      `;
      return;
    }

    terms.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    tbody.innerHTML = terms.map(tItem => {
      const u = users.find(x => x.id === tItem.userId);
      const mgrName = u ? u.name : tItem.userName;
      const mgrPhone = u ? u.phone : '';

      const start = new Date(tItem.startDate);
      const end = new Date(tItem.endDate);
      const diffTime = Math.abs(end - start);
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Calculate total meals in term
      const termMeals = allMeals
        .filter(m => m.date >= tItem.startDate && m.date <= tItem.endDate)
        .reduce((sum, m) => sum + (parseFloat(m.total) || 0), 0);

      // Calculate total expenses in term
      const termExpenses = allExpenses
        .filter(e => e.date >= tItem.startDate && e.date <= tItem.endDate)
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

      const mealRate = termMeals > 0 ? (termExpenses / termMeals) : 0;

      let statusBadge = '';
      if (today >= tItem.startDate && today <= tItem.endDate) {
        statusBadge = '<span class="badge badge-success">Active Duty</span>';
      } else if (today < tItem.startDate) {
        statusBadge = '<span class="badge badge-info">Upcoming</span>';
      } else {
        statusBadge = '<span class="badge badge-neutral">Completed</span>';
      }

      return `
        <tr>
          <td>
            <strong>${mgrName}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${mgrPhone}</div>
          </td>
          <td>
            <strong>${formatDate(tItem.startDate)} &mdash; ${formatDate(tItem.endDate)}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${tItem.note || ''}</div>
          </td>
          <td><strong>${totalDays} days</strong></td>
          <td><strong style="color: var(--accent-primary);">${termMeals.toFixed(1)}</strong></td>
          <td><strong>${formatCurrency(termExpenses)}</strong></td>
          <td><strong style="color: var(--success);">${formatCurrency(mealRate)}</strong></td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  function renderCookBillReport() {
    const container = document.getElementById('cook-bill-report-container');
    if (!container) return;

    const month = state.selectedMonth;
    const cookBills = Storage.getCookBills().filter(cb => cb.month === month);
    const terms = Storage.getManagerTerms();
    const users = Storage.getUsers();
    const activeMembers = getVisibleMembers().filter(u => u.active !== false);

    if (cookBills.length === 0) {
      container.innerHTML = `
        <div style="padding: 0.85rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md); text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No cook bill recorded for ${month}. Click "Add Cook Bill" to add one.
        </div>
      `;
      return;
    }

    container.innerHTML = cookBills.map(cb => {
      const linkedTerm = terms.find(t => t.id === cb.termId);
      const totalCollected = Object.values(cb.memberBills || {}).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
      const termLabel = linkedTerm ? `${linkedTerm.userName} (${formatDate(linkedTerm.startDate)} — ${formatDate(linkedTerm.endDate)})` : '— Not linked to any term —';

      const memberRows = activeMembers.map(u => {
        const amt = cb.memberBills && cb.memberBills[u.id] !== undefined ? parseFloat(cb.memberBills[u.id]) : '—';
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div class="user-avatar" style="width: 26px; height: 26px; font-size: 0.75rem;">${u.name.charAt(0)}</div>
              <span style="font-size: 0.85rem; font-weight: 500;">${u.name}</span>
            </div>
            <strong style="color: ${typeof amt === 'number' && amt > 0 ? 'var(--warning)' : 'var(--text-muted)'}; font-size: 0.875rem;">${typeof amt === 'number' ? formatCurrency(amt) : amt}</strong>
          </div>
        `;
      }).join('');

      const isAdmin = canManageMess(state.currentUser);

      return `
        <div style="margin-bottom: 1rem; padding: 0.85rem 1rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-left: 3px solid var(--warning); border-radius: var(--radius-md);">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <div style="font-size: 0.875rem; font-weight: 700;">
                <i class="ri-restaurant-line" style="color: var(--warning);"></i>
                ${cb.note || 'Cook Bill'}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem;">
                Default: ${formatCurrency(cb.defaultAmount)}/member &bull; Total: ${formatCurrency(totalCollected)}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.1rem;">
                <i class="ri-link"></i> ${termLabel}
              </div>
            </div>
            ${isAdmin ? `
              <div style="display: flex; gap: 0.35rem;">
                <button class="btn btn-sm btn-secondary adjust-cook-bill-btn" data-id="${cb.id}" title="Adjust individual member amounts">
                  <i class="ri-edit-line"></i> Adjust
                </button>
                <button class="btn btn-sm btn-danger delete-cook-bill-btn" data-id="${cb.id}" title="Delete this cook bill">
                  <i class="ri-delete-bin-line"></i>
                </button>
              </div>
            ` : ''}
          </div>
          <div style="max-height: 200px; overflow-y: auto;">${memberRows}</div>
        </div>
      `;
    }).join('');

    // Bind adjust and delete buttons
    container.querySelectorAll('.adjust-cook-bill-btn').forEach(btn => {
      btn.addEventListener('click', () => openAdjustCookBillModal(btn.dataset.id));
    });
    container.querySelectorAll('.delete-cook-bill-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteCookBill(btn.dataset.id));
    });
  }

  /* ==========================================================================
     COOK BILL ACTIONS
     ========================================================================== */
  function openAdjustCookBillModal(cookBillId) {
    const cookBills = Storage.getCookBills();
    const cb = cookBills.find(x => x.id === cookBillId);
    if (!cb) return;

    document.getElementById('adjust-cook-bill-id').value = cookBillId;
    document.getElementById('adjust-cook-bill-info').textContent =
      `${cb.note || 'Cook Bill'} \u2014 Default: ${formatCurrency(cb.defaultAmount)}/member \u2014 Month: ${cb.month}`;

    const activeMembers = getVisibleMembers().filter(u => u.active !== false);
    const listContainer = document.getElementById('adjust-cook-bill-member-list');

    listContainer.innerHTML = activeMembers.map(u => {
      const currentAmt = cb.memberBills && cb.memberBills[u.id] !== undefined ? parseFloat(cb.memberBills[u.id]) : cb.defaultAmount;
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 0; flex: 1;">
            <div class="user-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; flex-shrink: 0;">${u.name.charAt(0)}</div>
            <span style="font-size: 0.875rem; font-weight: 600;">${u.name}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">\u09f3</span>
            <input type="number" class="form-control cook-bill-member-amount-input"
              data-userid="${u.id}"
              value="${currentAmt}"
              min="0" step="1"
              style="width: 90px; font-size: 0.875rem; padding: 0.35rem 0.5rem; text-align: right;">
          </div>
        </div>
      `;
    }).join('');

    openModal('adjust-cook-bill-modal');
  }

  function deleteCookBill(cookBillId) {
    showConfirmModal(
      'Delete Cook Bill',
      'Are you sure you want to delete this cook bill? This will remove it from all member bills.',
      function () {
        const cookBills = Storage.getCookBills().filter(cb => cb.id !== cookBillId);
        Storage.saveCookBills(cookBills);
        showToast('Cook Bill deleted successfully.', 'info');
        renderCurrentView();
      }
    );
  }

  /* ==========================================================================
     13. REPORTS & DOWNLOADS CONTROLLER
     ========================================================================== */
  function renderReportsView() {
    if (!state.currentUser) return;
    const month = state.selectedMonth;
    const isManager = canManageMess(state.currentUser);
    let members = getVisibleMembers().filter(u => u.active !== false);

    // Regular member: only see their own report, hide all-members table
    if (!isManager) {
      const allMembersCard = document.getElementById('all-members-report-card');
      if (allMembersCard) allMembersCard.style.display = 'none';

      // Auto-select and show only this member's own report
      const selectEl = document.getElementById('reports-member-select');
      if (selectEl) {
        selectEl.innerHTML = `<option value="${state.currentUser.id}">${state.currentUser.name}</option>`;
        selectEl.value = state.currentUser.id;
        selectEl.closest('.form-group') && (selectEl.closest('.form-group').style.display = 'none');
      }

      const prMonth = document.getElementById('print-report-month');
      const prDate = document.getElementById('print-current-date');
      const prUser = document.getElementById('print-user-name');
      if (prMonth) prMonth.textContent = month;
      if (prDate) prDate.textContent = formatDate(getCurrentDateString());
      if (prUser) prUser.textContent = state.currentUser.name;

      const singleCard = document.getElementById('single-member-report-card');
      if (singleCard) singleCard.classList.remove('hidden');
      renderSingleMemberReport(state.currentUser.id, month);
      return;
    }

    // Manager / Admin: restore all-members table visibility
    const allMembersCard = document.getElementById('all-members-report-card');
    if (allMembersCard) allMembersCard.style.display = '';

    // Populate Reports Member Select Dropdown
    const selectEl = document.getElementById('reports-member-select');
    if (selectEl) {
      const currentVal = selectEl.value;
      selectEl.innerHTML = '<option value="all">All Members</option>' +
        members.map(u => `<option value="${u.id}" ${currentVal === u.id ? 'selected' : ''}>${u.name}</option>`).join('');
      const fg = selectEl.closest('.form-group');
      if (fg) fg.style.display = '';
    }

    // Populate Print Header Banner Metadata
    const prMonth = document.getElementById('print-report-month');
    const prDate = document.getElementById('print-current-date');
    const prUser = document.getElementById('print-user-name');
    if (prMonth) prMonth.textContent = month;
    if (prDate) prDate.textContent = formatDate(getCurrentDateString());
    if (prUser) prUser.textContent = state.currentUser ? state.currentUser.name : 'Admin';

    const selectedUserId = selectEl ? selectEl.value : 'all';
    const singleCard = document.getElementById('single-member-report-card');

    if (selectedUserId && selectedUserId !== 'all') {
      if (singleCard) singleCard.classList.remove('hidden');
      renderSingleMemberReport(selectedUserId, month);
    } else {
      if (singleCard) singleCard.classList.add('hidden');
    }

    // Render All Members Table
    const tbody = document.getElementById('reports-members-table-body');
    if (!tbody) return;

    if (members.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No active members.</td></tr>`;
      return;
    }

    tbody.innerHTML = members.map(u => {
      const mealInfo = calculateMemberMeals(u.id, month);
      const bill = calculateMemberBill(u.id, month);
      const paid = calculateMemberPaid(u.id, month);
      const balance = calculateMemberBalance(u.id, month);
      const status = getBalanceStatus(balance);

      return `
        <tr>
          <td>
            <strong>${u.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${u.phone}</div>
          </td>
          <td><strong style="color: var(--accent-primary);">${mealInfo.total.toFixed(1)}</strong></td>
          <td>${formatCurrency(bill)}</td>
          <td>${formatCurrency(paid)}</td>
          <td><strong style="color: ${balance >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatCurrency(balance)}</strong></td>
          <td><span class="badge ${status.class}">${status.label}</span></td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 0.35rem; justify-content: center;">
              <button class="btn btn-sm btn-secondary export-member-csv-btn" data-userid="${u.id}" title="Download CSV Statement">
                <i class="ri-file-excel-line text-emerald"></i> CSV
              </button>
              <button class="btn btn-sm btn-primary print-member-pdf-btn" data-userid="${u.id}" title="Print / Save PDF Statement">
                <i class="ri-printer-line"></i> Statement / PDF
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderSingleMemberReport(userId, month) {
    const users = Storage.getUsers();
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    document.getElementById('single-member-report-name').textContent = `${targetUser.name} — Monthly Statement (${month})`;
    document.getElementById('single-member-report-phone').textContent = `Phone: ${targetUser.phone} | Role: ${targetUser.role}`;

    const mealInfo = calculateMemberMeals(userId, month);
    const mealOnlyBill = calculateMemberMealOnlyBill(userId, month);
    const cookBill = calculateMemberCookBill(userId, month);
    const totalBill = mealOnlyBill + cookBill;
    const paid = calculateMemberPaid(userId, month);
    const balance = paid - totalBill;
    const status = getBalanceStatus(balance);

    const kpiContainer = document.getElementById('single-member-kpi-container');
    if (kpiContainer) {
      kpiContainer.innerHTML = `
        <div class="kpi-card" style="padding: 0.85rem 1rem;">
          <div class="kpi-icon-box icon-indigo" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-bowl-line"></i></div>
          <div class="kpi-info">
            <h4>Total Meals</h4>
            <div class="kpi-value" style="font-size: 1.25rem;">${mealInfo.total.toFixed(1)}</div>
          </div>
        </div>
        <div class="kpi-card" style="padding: 0.85rem 1rem;">
          <div class="kpi-icon-box icon-amber" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-receipt-line"></i></div>
          <div class="kpi-info">
            <h4>Meal Bill</h4>
            <div class="kpi-value" style="font-size: 1.25rem;">${formatCurrency(mealOnlyBill)}</div>
          </div>
        </div>
        ${cookBill > 0 ? `
        <div class="kpi-card" style="padding: 0.85rem 1rem; border-left: 3px solid var(--warning);">
          <div class="kpi-icon-box icon-amber" style="width: 38px; height: 38px; font-size: 1.1rem; background: rgba(245,158,11,0.12);"><i class="ri-restaurant-line"></i></div>
          <div class="kpi-info">
            <h4>Cook Bill</h4>
            <div class="kpi-value" style="font-size: 1.25rem; color: var(--warning);">${formatCurrency(cookBill)}</div>
          </div>
        </div>
        ` : ''}
        <div class="kpi-card" style="padding: 0.85rem 1rem;">
          <div class="kpi-icon-box icon-emerald" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-wallet-3-line"></i></div>
          <div class="kpi-info">
            <h4>Total Paid</h4>
            <div class="kpi-value" style="font-size: 1.25rem;">${formatCurrency(paid)}</div>
          </div>
        </div>
        <div class="kpi-card" style="padding: 0.85rem 1rem;">
          <div class="kpi-icon-box ${balance >= 0 ? 'icon-emerald' : 'icon-rose'}" style="width: 38px; height: 38px; font-size: 1.1rem;"><i class="ri-scales-3-line"></i></div>
          <div class="kpi-info">
            <h4>Net Balance</h4>
            <div class="kpi-value" style="font-size: 1.25rem;">${formatCurrency(balance)}</div>
            <span class="badge ${status.class}">${status.label}</span>
          </div>
        </div>
      `;
    }

    const tbody = document.getElementById('single-member-meals-tbody');
    if (!tbody) return;

    const meals = Storage.getMeals().filter(m => m.userId === userId && m.date.startsWith(month));
    meals.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (meals.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No meal records for ${month}.</td></tr>`;
      return;
    }

    tbody.innerHTML = meals.map(m => `
      <tr>
        <td><strong>${formatDate(m.date)}</strong></td>
        <td>${m.breakfast}</td>
        <td>${m.lunch}</td>
        <td>${m.dinner}</td>
        <td><strong style="color: var(--accent-primary);">${m.total}</strong></td>
        <td>${m.note || '-'}</td>
      </tr>
    `).join('');
  }

  function exportMemberCSV(userId, month = state.selectedMonth) {
    const users = Storage.getUsers();
    const u = users.find(x => x.id === userId);
    if (!u) return;

    const mealInfo = calculateMemberMeals(userId, month);
    const bill = calculateMemberBill(userId, month);
    const paid = calculateMemberPaid(userId, month);
    const balance = calculateMemberBalance(userId, month);
    const meals = Storage.getMeals().filter(m => m.userId === userId && m.date.startsWith(month));

    let csvContent = `data:text/csv;charset=utf-8,`;
    csvContent += `MESS MEAL TRACKER - MEMBER STATEMENT\n`;
    csvContent += `Member Name,${u.name}\n`;
    csvContent += `Phone Number,${u.phone}\n`;
    csvContent += `Month,${month}\n`;
    csvContent += `Total Meals,${mealInfo.total.toFixed(1)}\n`;
    csvContent += `Meal Bill (BDT),${bill.toFixed(2)}\n`;
    csvContent += `Total Paid (BDT),${paid.toFixed(2)}\n`;
    csvContent += `Net Balance (BDT),${balance.toFixed(2)}\n\n`;

    csvContent += `Date,Breakfast,Lunch,Dinner,Total Meals,Note\n`;
    meals.forEach(m => {
      csvContent += `${m.date},${m.breakfast},${m.lunch},${m.dinner},${m.total},"${m.note || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statement_${u.name.replace(/\s+/g, '_')}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported CSV statement for ${u.name}!`, 'success');
  }

  function exportAllMembersCSV(month = state.selectedMonth) {
    const members = getVisibleMembers().filter(u => u.active !== false);
    const mealRate = calculateMealRate(month);
    const totalExpenses = calculateTotalExpenses(month);

    let csvContent = `data:text/csv;charset=utf-8,`;
    csvContent += `MESS MEAL TRACKER - FULL MONTHLY REPORT (${month})\n`;
    csvContent += `Total Expenses (BDT),${totalExpenses.toFixed(2)}\n`;
    csvContent += `Meal Rate (BDT),${mealRate.toFixed(2)}\n\n`;

    csvContent += `Member Name,Phone,Breakfast Total,Lunch Total,Dinner Total,Total Meals,Meal Bill (BDT),Paid Amount (BDT),Net Balance (BDT),Status\n`;

    members.forEach(u => {
      const mealInfo = calculateMemberMeals(u.id, month);
      const bill = calculateMemberBill(u.id, month);
      const paid = calculateMemberPaid(u.id, month);
      const balance = calculateMemberBalance(u.id, month);
      const status = balance >= 0 ? 'Receivable' : 'Payable';

      csvContent += `"${u.name}",${u.phone},${mealInfo.breakfast},${mealInfo.lunch},${mealInfo.dinner},${mealInfo.total.toFixed(1)},${bill.toFixed(2)},${paid.toFixed(2)},${balance.toFixed(2)},${status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mess_monthly_report_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported Full Mess Monthly CSV for ${month}!`, 'success');
  }

  function printMemberStatement(userId, month = state.selectedMonth) {
    const selectEl = document.getElementById('reports-member-select');
    if (selectEl) {
      selectEl.value = userId;
    }
    renderReportsView();
    setTimeout(() => {
      window.print();
    }, 200);
  }

  /* ==========================================================================
     14. SUPER ADMIN CONTROLLER
     ========================================================================== */
  function renderSuperAdminView() {
    if (!state.currentUser || !isUserSuperAdmin(state.currentUser)) return;

    const messes = Storage.getMesses();
    const allUsers = Storage.getUsers();
    const allExpenses = Storage.getExpenses();

    const totalMesses = messes.length;
    const totalMembers = allUsers.filter(u => u.role !== ROLES.SUPERADMIN).length;
    const totalSystemExpenses = allExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const kpiContainer = document.getElementById('superadmin-kpi-container');
    if (kpiContainer) {
      kpiContainer.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-icon-box icon-indigo"><i class="ri-store-3-line"></i></div>
          <div class="kpi-info">
            <h4>Total Messes</h4>
            <div class="kpi-value">${totalMesses}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-blue"><i class="ri-group-line"></i></div>
          <div class="kpi-info">
            <h4>Total Mess Members</h4>
            <div class="kpi-value">${totalMembers}</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon-box icon-emerald"><i class="ri-money-dollar-circle-line"></i></div>
          <div class="kpi-info">
            <h4>Total System Expenses</h4>
            <div class="kpi-value">${formatCurrency(totalSystemExpenses)}</div>
          </div>
        </div>
      `;
    }

    const tbody = document.getElementById('superadmin-messes-table-body');
    if (!tbody) return;

    if (messes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No messes created yet. Click "Create New Mess" to get started.</td></tr>`;
      return;
    }

    tbody.innerHTML = messes.map(m => {
      const adminUser = allUsers.find(u => u.messId === m.id && u.role === ROLES.ADMIN);
      const memberCount = allUsers.filter(u => u.messId === m.id).length;

      return `
        <tr>
          <td>
            <strong>${m.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Code: ${m.code || m.id}</div>
          </td>
          <td><strong>${adminUser ? adminUser.name : 'Unassigned'}</strong></td>
          <td>${adminUser ? adminUser.phone : '-'}</td>
          <td><span class="badge badge-info">${memberCount} members</span></td>
          <td>${formatDate(m.createdAt ? m.createdAt.split('T')[0] : getCurrentDateString())}</td>
          <td>
            <span class="badge badge-success">Active Mess</span>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 0.35rem; justify-content: center;">
              <button class="btn btn-sm btn-secondary edit-mess-btn" data-messid="${m.id}">
                <i class="ri-edit-line"></i> Edit Details
              </button>
              <button class="btn btn-sm btn-danger delete-mess-btn" data-messid="${m.id}">
                <i class="ri-delete-bin-line"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function openCreateMessModal() {
    document.getElementById('create-mess-form').reset();
    document.getElementById('mess-id-input').value = '';
    document.getElementById('create-mess-modal-title').innerHTML = '<i class="ri-store-add-line text-indigo"></i> Create New Mess';
    document.getElementById('btn-submit-create-mess').innerHTML = '<i class="ri-check-line"></i> Create Mess & Admin';
    openModal('create-mess-modal');
  }

  function openEditMessModal(messId) {
    const messes = Storage.getMesses();
    const targetMess = messes.find(m => m.id === messId);
    if (!targetMess) return;

    const allUsers = Storage.getUsers();
    const adminUser = allUsers.find(u => u.messId === messId && u.role === ROLES.ADMIN);

    document.getElementById('mess-id-input').value = targetMess.id;
    document.getElementById('mess-form-name').value = targetMess.name;
    document.getElementById('mess-form-code').value = targetMess.code || targetMess.id;
    document.getElementById('mess-form-address').value = targetMess.address || '';

    document.getElementById('mess-admin-name').value = adminUser ? adminUser.name : '';
    document.getElementById('mess-admin-phone').value = adminUser ? adminUser.phone : '';
    document.getElementById('mess-admin-password').value = adminUser ? adminUser.password : '123456';

    document.getElementById('create-mess-modal-title').innerHTML = '<i class="ri-edit-line text-indigo"></i> Edit Mess Details';
    document.getElementById('btn-submit-create-mess').innerHTML = '<i class="ri-save-line"></i> Save Mess Changes';

    openModal('create-mess-modal');
  }

  function handleSaveMessSubmit(e) {
    e.preventDefault();
    const editMessId = document.getElementById('mess-id-input').value;
    const name = document.getElementById('mess-form-name').value.trim();
    const code = document.getElementById('mess-form-code').value.trim();
    const address = document.getElementById('mess-form-address').value.trim();
    const adminName = document.getElementById('mess-admin-name').value.trim();
    const adminPhone = document.getElementById('mess-admin-phone').value.trim();
    const adminPassword = document.getElementById('mess-admin-password').value.trim();

    if (!name || !code || !adminName || !adminPhone || !adminPassword) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const messes = Storage.getMesses();
    const allUsers = Storage.getUsers();

    if (editMessId) {
      // EDIT EXISTING MESS
      const messIndex = messes.findIndex(m => m.id === editMessId);
      if (messIndex !== -1) {
        messes[messIndex].name = name;
        messes[messIndex].code = code;
        messes[messIndex].address = address;
        Storage.saveMesses(messes);
      }

      let adminUser = allUsers.find(u => u.messId === editMessId && u.role === ROLES.ADMIN);
      if (adminUser) {
        adminUser.name = adminName;
        adminUser.phone = adminPhone;
        adminUser.password = adminPassword;
      } else {
        allUsers.push({
          id: `usr_${Date.now()}`,
          messId: editMessId,
          name: adminName,
          phone: adminPhone,
          password: adminPassword,
          role: ROLES.ADMIN,
          active: true,
          createdAt: getCurrentDateString()
        });
      }
      Storage.saveUsers(allUsers);
      showToast(`Mess "${name}" updated successfully!`, 'success');
    } else {
      // CREATE NEW MESS
      if (allUsers.some(u => u.phone === adminPhone)) {
        showToast('A user with this phone number already exists!', 'error');
        return;
      }

      const newMessId = `mess_${Date.now()}`;
      const newMess = {
        id: newMessId,
        name: name,
        code: code,
        address: address,
        createdAt: new Date().toISOString()
      };

      const newAdmin = {
        id: `usr_${Date.now()}`,
        messId: newMessId,
        name: adminName,
        phone: adminPhone,
        password: adminPassword,
        role: ROLES.ADMIN,
        active: true,
        createdAt: getCurrentDateString()
      };

      messes.push(newMess);
      Storage.saveMesses(messes);

      allUsers.push(newAdmin);
      Storage.saveUsers(allUsers);

      state.selectedMessId = newMessId;
      Storage.setSelectedMessId(newMessId);

      showToast(`Mess "${name}" & Admin "${adminName}" created successfully!`, 'success');
    }

    closeModal('create-mess-modal');
    renderSuperAdminView();
    populateDropdownFilters();
  }

  function handleDeleteMess(messId) {
    const messes = Storage.getMesses();
    const targetMess = messes.find(m => m.id === messId);
    if (!targetMess) return;

    showConfirmModal(
      'Delete Mess Account',
      `Are you sure you want to permanently delete mess "${targetMess.name}"? All associated members, meals, expenses, and payment records for this mess will be permanently deleted.`,
      function () {
        const updatedMesses = Storage.getMesses().filter(m => m.id !== messId);
        Storage.saveMesses(updatedMesses);

        const updatedUsers = Storage.getUsers().filter(u => u.messId !== messId);
        Storage.saveUsers(updatedUsers);

        const updatedMeals = Storage.getMeals().filter(m => m.messId !== messId);
        Storage.saveMeals(updatedMeals);

        const updatedExpenses = Storage.getExpenses().filter(e => e.messId !== messId);
        Storage.saveExpenses(updatedExpenses);

        const updatedPayments = Storage.getPayments().filter(p => p.messId !== messId);
        Storage.savePayments(updatedPayments);

        if (state.selectedMessId === messId) {
          state.selectedMessId = DEFAULT_MESS.id;
          Storage.setSelectedMessId(DEFAULT_MESS.id);
        }

        showToast(`Mess "${targetMess.name}" deleted successfully!`, 'info');
        renderSuperAdminView();
        populateDropdownFilters();
      }
    );
  }

  // MEMBERS VIEW (ADMIN / MANAGER ONLY)
  function renderMembersView() {
    if (!state.currentUser) return;
    renderManagerSchedule();

    const tbody = document.getElementById('members-table-body');
    const searchVal = document.getElementById('member-search-input').value.toLowerCase().trim();
    const month = state.selectedMonth;

    let users = getVisibleMembers();

    if (searchVal) {
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(searchVal)) || 
        (u.phone && u.phone.toLowerCase().includes(searchVal))
      );
    }

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center">No members found.</td></tr>`;
      return;
    }

    const allUsers = Storage.getUsers();

    tbody.innerHTML = users.map(u => {
      const mealInfo = calculateMemberMeals(u.id, month);
      const bill = calculateMemberBill(u.id, month);
      const paid = calculateMemberPaid(u.id, month);
      const balance = calculateMemberBalance(u.id, month);
      const isActive = u.active !== false;

      const canManageThisUser = isUserSuperAdmin(state.currentUser) || (isUserAdmin(state.currentUser) && u.role !== ROLES.SUPERADMIN);
      const isCurrentManager = isUserMealManagerForDate(u) || u.isMealManager;
      const displayRole = isCurrentManager ? 'manager' : u.role;
      const mgr = allUsers.find(x => x.id === u.managerId);

      return `
        <tr style="${!isActive ? 'opacity: 0.6; background-color: var(--bg-primary);' : ''}">
          <td>
            <strong>${u.name}</strong>
            ${isCurrentManager ? '<i class="ri-star-fill" style="color: var(--warning); margin-left: 0.25rem;" title="Elected Meal Manager"></i>' : ''}
            ${mgr && isUserSuperAdmin(state.currentUser) ? `<div style="font-size: 0.725rem; color: var(--text-secondary);">Mess: ${mgr.name}</div>` : ''}
          </td>
          <td>${u.phone}</td>
          <td><span class="user-role-badge role-${displayRole}">${displayRole === 'manager' ? t('manager') : t(displayRole)}</span></td>
          <td>
            <span class="badge ${isActive ? 'badge-success' : 'badge-danger'}">
              ${isActive ? t('active') : t('inactive')}
            </span>
          </td>
          <td>${formatDate(u.createdAt)}</td>
          <td>${mealInfo.total}</td>
          <td>${formatCurrency(bill)}</td>
          <td>${formatCurrency(paid)}</td>
          <td><strong style="color: ${balance >= 0 ? 'var(--success)' : 'var(--danger)'}">${formatCurrency(balance)}</strong></td>
          <td>
            ${canManageThisUser ? `
              <div class="flex gap-1">
                <button class="icon-btn btn-sm edit-member-btn" data-id="${u.id}" title="${t('edit')}"><i class="ri-edit-line"></i></button>
                <button class="icon-btn btn-sm ${isActive ? 'btn-danger' : 'btn-success'} toggle-member-active-btn" data-id="${u.id}" title="${isActive ? 'Deactivate' : 'Activate'}">
                  <i class="${isActive ? 'ri-user-unfollow-line' : 'ri-user-follow-line'}"></i>
                </button>
                <button class="icon-btn btn-sm btn-secondary reset-pwd-btn" data-id="${u.id}" title="Reset Password"><i class="ri-key-2-line"></i></button>
                <button class="icon-btn btn-sm btn-danger delete-member-btn" data-id="${u.id}" title="${t('delete')}"><i class="ri-delete-bin-line"></i></button>
              </div>
            ` : '<span style="font-size: 0.75rem; color: var(--text-muted);">Protected (Superadmin)</span>'}
          </td>
        </tr>
      `;
    }).join('');
  }

  // PROFILE VIEW
  function renderProfileView() {
    if (!state.currentUser) return;
    const user = state.currentUser;
    document.getElementById('profile-name').value = user.name;
    document.getElementById('profile-phone').value = user.phone;
  }

  // SETTINGS VIEW (ADMIN ONLY)
  function renderSettingsView() {
    if (!state.currentUser) return;
    const mealSettings = Storage.getMealSettings();
    document.getElementById('weight-breakfast').value = mealSettings.breakfastWeight;
    document.getElementById('weight-lunch').value = mealSettings.lunchWeight;
    document.getElementById('weight-dinner').value = mealSettings.dinnerWeight;
  }

  /* ==========================================================================
     13. FORM HANDLERS & ACTION CRUD OPERATIONS
     ========================================================================== */

  // Save Meal Record
  function saveMealRecord(e) {
    e.preventDefault();
    if (!canManageMess(state.currentUser)) {
      showToast('Permission denied. Only active Meal Manager or Admin can record meals.', 'error');
      return;
    }
    const id = document.getElementById('meal-id').value;
    const userId = document.getElementById('meal-user-id').value;
    const date = document.getElementById('meal-date').value;
    const b = parseInt(document.getElementById('meal-breakfast').value, 10) || 0;
    const l = parseInt(document.getElementById('meal-lunch').value, 10) || 0;
    const d = parseInt(document.getElementById('meal-dinner').value, 10) || 0;
    const note = document.getElementById('meal-note').value;
    const mode = document.querySelector('input[name="meal-mode"]:checked').value || 'onetime';

    if (!userId || !date) {
      showToast('Please select member and date.', 'error');
      return;
    }

    const weightedTotal = calculateWeightedMealTotal(b, l, d);
    const meals = Storage.getMeals();

    if (id) {
      const idx = meals.findIndex(m => m.id === id);
      if (idx !== -1) {
        meals[idx].userId = userId;
        meals[idx].date = date;
        meals[idx].breakfast = b;
        meals[idx].lunch = l;
        meals[idx].dinner = d;
        meals[idx].total = weightedTotal;
        meals[idx].mode = mode;
        meals[idx].note = note;
        meals[idx].updatedAt = new Date().toISOString();
        showToast('Meal record updated successfully.', 'success');
      }
    } else {
      const existing = meals.find(m => m.userId === userId && m.date === date);
      if (existing) {
        showToast('Meal entry for this member on this date already exists. Edit existing record.', 'warning');
        return;
      }

      meals.push({
        id: generateId(),
        userId,
        date,
        breakfast: b,
        lunch: l,
        dinner: d,
        total: weightedTotal,
        mode: mode,
        note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      showToast(`Meal entry saved (${mode === 'recurring' ? 'Continuous / Recurring' : 'One-time only'}). Total: ${weightedTotal} meals.`, 'success');
    }

    Storage.saveMeals(meals);
    closeModal('meal-modal');
    renderCurrentView();
  }

  // Save Expense Record
  function saveExpenseRecord(e) {
    e.preventDefault();
    const id = document.getElementById('expense-id').value;
    const spentBy = document.getElementById('expense-user-id').value;
    const date = document.getElementById('expense-date').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-description').value;

    if (!spentBy || !date || isNaN(amount) || amount <= 0 || !description) {
      showToast('Please provide valid expense details.', 'error');
      return;
    }

    const expenses = Storage.getExpenses();

    if (id) {
      const idx = expenses.findIndex(ex => ex.id === id);
      if (idx !== -1) {
        expenses[idx].spentBy = spentBy;
        expenses[idx].date = date;
        expenses[idx].amount = amount;
        expenses[idx].category = category;
        expenses[idx].description = description;
        showToast('Expense updated successfully.', 'success');
      }
    } else {
      expenses.push({
        id: generateId(),
        spentBy,
        date,
        amount,
        category,
        description,
        addedBy: state.currentUser ? state.currentUser.id : 'system',
        createdAt: new Date().toISOString()
      });
      showToast('Expense recorded successfully.', 'success');
    }

    Storage.saveExpenses(expenses);
    closeModal('expense-modal');
    renderCurrentView();
  }

  // Save Payment Record
  function savePaymentRecord(e) {
    e.preventDefault();
    const id = document.getElementById('payment-id').value;
    const userId = document.getElementById('payment-user-id').value;
    const date = document.getElementById('payment-date').value;
    const amount = parseFloat(document.getElementById('payment-amount').value);
    const note = document.getElementById('payment-note').value;

    if (!userId || !date || isNaN(amount) || amount <= 0) {
      showToast('Please provide valid payment details.', 'error');
      return;
    }

    const payments = Storage.getPayments();

    if (id) {
      const idx = payments.findIndex(p => p.id === id);
      if (idx !== -1) {
        payments[idx].userId = userId;
        payments[idx].date = date;
        payments[idx].amount = amount;
        payments[idx].note = note;
        showToast('Payment record updated successfully.', 'success');
      }
    } else {
      payments.push({
        id: generateId(),
        userId,
        date,
        amount,
        note,
        addedBy: state.currentUser ? state.currentUser.id : 'system',
        createdAt: new Date().toISOString()
      });
      showToast('Payment recorded successfully.', 'success');
    }

    Storage.savePayments(payments);
    closeModal('payment-modal');
    renderCurrentView();
  }

  // Save Member Record (Admin/Superadmin)
  function saveMemberRecord(e) {
    e.preventDefault();
    const id = document.getElementById('member-id').value;
    const name = document.getElementById('member-name').value.trim();
    const phone = document.getElementById('member-phone').value.trim();
    const password = document.getElementById('member-password').value;
    const role = document.getElementById('member-role').value;
    const managerIdSelect = document.getElementById('member-manager-id');
    const assignedManagerId = (isUserSuperAdmin(state.currentUser) && managerIdSelect && managerIdSelect.value)
      ? managerIdSelect.value
      : (state.currentUser.role !== ROLES.SUPERADMIN ? state.currentUser.id : null);

    if (!name || !phone) {
      showToast('Please enter name and phone number.', 'error');
      return;
    }

    const users = Storage.getUsers();

    if (role === ROLES.SUPERADMIN && !isUserSuperAdmin(state.currentUser)) {
      showToast('Only a Superadmin can assign the Superadmin role.', 'error');
      return;
    }

    if (id) {
      const idx = users.findIndex(u => u.id === id);
      if (idx !== -1) {
        const targetUser = users[idx];

        if (targetUser.role === ROLES.SUPERADMIN && !isUserSuperAdmin(state.currentUser)) {
          showToast('Permission denied. Standard Admins cannot modify Superadmins.', 'error');
          return;
        }

        if (targetUser.role === ROLES.SUPERADMIN && role !== ROLES.SUPERADMIN) {
          const superAdminCount = users.filter(u => u.role === ROLES.SUPERADMIN && u.active !== false).length;
          if (superAdminCount <= 1) {
            showToast('Permission denied. Cannot demote the last remaining Superadmin.', 'error');
            return;
          }
        }

        users[idx].name = name;
        users[idx].phone = phone;
        users[idx].role = role;
        if (assignedManagerId) users[idx].managerId = assignedManagerId;
        if (role === ROLES.MANAGER) {
          users[idx].isMealManager = true;
        }
        if (password) users[idx].password = password;
        showToast('Member profile updated successfully.', 'success');
      }
    } else {
      if (users.some(u => u.phone.trim().toLowerCase() === phone.toLowerCase())) {
        showToast('Phone number is already registered.', 'error');
        return;
      }
      if (!password) {
        showToast('Please set an initial password for new member.', 'error');
        return;
      }

      // Determine messId from the managing admin's context
      let messId = null;
      if (assignedManagerId) {
        const mgr = users.find(u => u.id === assignedManagerId);
        messId = mgr ? (mgr.messId || null) : null;
      } else if (state.currentUser.messId) {
        messId = state.currentUser.messId;
      }

      users.push({
        id: generateId(),
        name,
        phone,
        password,
        role,
        managerId: assignedManagerId,
        messId,
        isMealManager: role === ROLES.MANAGER,
        active: true,
        createdAt: getCurrentDateString()
      });
      showToast(`New member "${name}" added successfully.`, 'success');
    }

    Storage.saveUsers(users);
    closeModal('member-modal');
    renderCurrentView();
  }

  // Save Meal Count Weights Form
  function saveMealSettingsRecord(e) {
    e.preventDefault();
    const bWeight = parseFloat(document.getElementById('weight-breakfast').value) || 0.5;
    const lWeight = parseFloat(document.getElementById('weight-lunch').value) || 1.0;
    const dWeight = parseFloat(document.getElementById('weight-dinner').value) || 1.0;

    const messId = state.currentUser ? (state.currentUser.messId || state.selectedMessId) : 'mess_default';

    Storage.saveMealSettings({
      breakfastWeight: bWeight,
      lunchWeight: lWeight,
      dinnerWeight: dWeight
    }, messId);

    // Re-calculate weighted total for all recorded meals in THIS mess
    let meals = Storage.getMeals();
    const visibleMemberIds = getVisibleMembers().map(m => m.id);
    meals.forEach(m => {
      if (visibleMemberIds.includes(m.userId) || m.messId === messId) {
        m.total = ( (parseFloat(m.breakfast) || 0) * bWeight ) + ( (parseFloat(m.lunch) || 0) * lWeight ) + ( (parseFloat(m.dinner) || 0) * dWeight );
      }
    });
    Storage.saveMeals(meals);

    showToast('Meal count weight multipliers updated for your mess!', 'success');
    renderCurrentView();
  }

  /* ==========================================================================
     14. BACKUP & RESTORE
     ========================================================================== */
  function exportBackup() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      users: Storage.getUsers(),
      meals: Storage.getMeals(),
      expenses: Storage.getExpenses(),
      payments: Storage.getPayments(),
      managerTerms: Storage.getManagerTerms(),
      cookBills: Storage.getCookBills(),
      mealSettings: Storage.getMealSettings(),
      settings: Storage.getSettings()
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `mess-backup-${getCurrentDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Backup exported successfully.', 'success');
  }

  function restoreBackup() {
    const fileInput = document.getElementById('restore-file-input');
    const file = fileInput.files[0];

    if (!file) {
      showToast('Please select a JSON backup file first.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const backup = JSON.parse(e.target.result);

        if (!backup.users || !Array.isArray(backup.users) || !backup.meals || !Array.isArray(backup.meals)) {
          showToast('Invalid backup file structure. Import aborted.', 'error');
          return;
        }

        Storage.saveUsers(backup.users);
        Storage.saveMeals(backup.meals);
        Storage.saveExpenses(backup.expenses || []);
        Storage.savePayments(backup.payments || []);
        if (backup.managerTerms) Storage.saveManagerTerms(backup.managerTerms);
        if (backup.cookBills) Storage.saveCookBills(backup.cookBills);
        if (backup.mealSettings) Storage.saveMealSettings(backup.mealSettings);
        if (backup.settings) Storage.saveSettings(backup.settings);
        Storage.setInitialized(true);

        showToast('Backup restored successfully! Refreshing view...', 'success');
        setTimeout(() => window.location.reload(), 1200);

      } catch (err) {
        showToast('Failed to parse backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  function resetApplicationData() {
    showConfirmModal(
      'Reset All Application Data',
      'WARNING: This will permanently erase all members, meals, expenses, and payments. Are you sure you want to start clean?',
      function () {
        Storage.clearAll();
        showToast('Application reset complete.', 'info');
        setTimeout(() => window.location.reload(), 1000);
      }
    );
  }

  /* ==========================================================================
     15. EVENT LISTENERS & INITIALIZATION
     ========================================================================== */
  function bindEvents() {
    // Language Toggle
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const newLang = state.language === 'en' ? 'bn' : 'en';
        setLanguage(newLang);
        showToast(newLang === 'bn' ? 'ভাষা বাংলায় পরিবর্তন করা হয়েছে' : 'Language switched to English', 'info');
      });
    }

    // Theme Toggle
    document.getElementById('theme-toggle-btn').addEventListener('click', (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      Storage.saveTheme(newTheme);
      document.getElementById('theme-toggle-icon').className = newTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    });

    // Global Manager Picker for Superadmin
    const mgrPicker = document.getElementById('global-manager-picker');
    if (mgrPicker) {
      mgrPicker.addEventListener('change', function () {
        state.selectedManagerId = this.value;
        renderCurrentView();
      });
    }

    // Mobile Sidebar & Overlay Toggle
    const toggleSidebar = (show) => {
      const sb = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (show === undefined) {
        sb.classList.toggle('show');
        if (overlay) overlay.classList.toggle('show');
      } else if (show) {
        sb.classList.add('show');
        if (overlay) overlay.classList.add('show');
      } else {
        sb.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
      }
    };

    document.getElementById('menu-toggle-btn').addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar();
    });
    document.getElementById('sidebar-close-btn').addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar(false);
    });
    const overlayEl = document.getElementById('sidebar-overlay');
    if (overlayEl) overlayEl.addEventListener('click', () => toggleSidebar(false));

    // Navigation Links
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const view = this.getAttribute('data-view');
        if (view) navigateTo(view);
      });
    });

    // Global Month Picker Change
    document.getElementById('global-month-picker').addEventListener('change', function () {
      state.selectedMonth = this.value;
      renderCurrentView();
    });

    // Auth Form Submit
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = document.getElementById('login-phone').value;
      const pwd = document.getElementById('login-password').value;
      loginUser(phone, pwd);
    });

    // Logout Buttons
    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
    });

    // Dashboard Quick Actions & Shortcuts
    document.getElementById('dash-btn-add-meal').addEventListener('click', (e) => {
      e.preventDefault();
      openMealModal();
    });
    document.getElementById('dash-btn-add-expense').addEventListener('click', (e) => {
      e.preventDefault();
      openExpenseModal();
    });
    document.getElementById('dash-btn-add-payment').addEventListener('click', (e) => {
      e.preventDefault();
      openPaymentModal();
    });
    document.getElementById('dash-view-all-summary').addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('summary');
    });
    const goMealChartBtn = document.getElementById('dash-btn-go-meal-chart');
    if (goMealChartBtn) {
      goMealChartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        state.mealsViewMode = 'chart';
        navigateTo('meals');
      });
    }

    const summaryManagerFilter = document.getElementById('summary-manager-filter');
    if (summaryManagerFilter) {
      summaryManagerFilter.addEventListener('change', renderManagerReport);
    }

    // Reports View Event Handlers
    const reportsMemberSelect = document.getElementById('reports-member-select');
    if (reportsMemberSelect) {
      reportsMemberSelect.addEventListener('change', renderReportsView);
    }

    const btnExportFullCSV = document.getElementById('btn-export-full-csv');
    if (btnExportFullCSV) {
      btnExportFullCSV.addEventListener('click', (e) => {
        e.preventDefault();
        exportAllMembersCSV();
      });
    }

    const btnPrintFullStatement = document.getElementById('btn-print-full-statement');
    if (btnPrintFullStatement) {
      btnPrintFullStatement.addEventListener('click', (e) => {
        e.preventDefault();
        window.print();
      });
    }

    const btnExportSingleCSV = document.getElementById('btn-export-single-csv');
    if (btnExportSingleCSV) {
      btnExportSingleCSV.addEventListener('click', (e) => {
        e.preventDefault();
        const userId = document.getElementById('reports-member-select').value;
        if (userId && userId !== 'all') exportMemberCSV(userId);
      });
    }

    const btnPrintSinglePDF = document.getElementById('btn-print-single-pdf');
    if (btnPrintSinglePDF) {
      btnPrintSinglePDF.addEventListener('click', (e) => {
        e.preventDefault();
        window.print();
      });
    }

    const reportsTbody = document.getElementById('reports-members-table-body');
    if (reportsTbody) {
      reportsTbody.addEventListener('click', function (e) {
        const csvBtn = e.target.closest('.export-member-csv-btn');
        const printBtn = e.target.closest('.print-member-pdf-btn');

        if (csvBtn) {
          e.preventDefault();
          const userId = csvBtn.getAttribute('data-userid');
          exportMemberCSV(userId);
        }

        if (printBtn) {
          e.preventDefault();
          const userId = printBtn.getAttribute('data-userid');
          printMemberStatement(userId);
        }
      });
    }

    // Super Admin Modal & Action Listeners
    const btnOpenCreateMess = document.getElementById('btn-open-create-mess-modal');
    if (btnOpenCreateMess) {
      btnOpenCreateMess.addEventListener('click', (e) => {
        e.preventDefault();
        openCreateMessModal();
      });
    }

    const closeCreateMess = document.getElementById('close-create-mess-modal');
    const cancelCreateMess = document.getElementById('btn-cancel-create-mess');
    [closeCreateMess, cancelCreateMess].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          closeModal('create-mess-modal');
        });
      }
    });

    const createMessForm = document.getElementById('create-mess-form');
    if (createMessForm) {
      createMessForm.addEventListener('submit', handleSaveMessSubmit);
    }

    const saMessesTbody = document.getElementById('superadmin-messes-table-body');
    if (saMessesTbody) {
      saMessesTbody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-mess-btn');
        const deleteBtn = e.target.closest('.delete-mess-btn');

        if (editBtn) {
          e.preventDefault();
          const messId = editBtn.getAttribute('data-messid');
          openEditMessModal(messId);
        }

        if (deleteBtn) {
          e.preventDefault();
          const messId = deleteBtn.getAttribute('data-messid');
          handleDeleteMess(messId);
        }
      });
    }

    // Filter Listeners
    ['meal-search-input', 'meal-member-filter', 'meal-date-filter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', renderMealsView);
    });
    document.getElementById('meal-filter-reset').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('meal-search-input').value = '';
      document.getElementById('meal-member-filter').value = 'all';
      document.getElementById('meal-date-filter').value = '';
      renderMealsView();
    });

    // Meal View Mode Switcher
    const excelTab = document.getElementById('meal-tab-excel');
    const chartTab = document.getElementById('meal-tab-chart');
    const logTab = document.getElementById('meal-tab-log');

    if (excelTab) {
      excelTab.addEventListener('click', function () {
        state.mealsViewMode = 'excel';
        renderMealsView();
      });
    }
    if (chartTab) {
      chartTab.addEventListener('click', function () {
        state.mealsViewMode = 'chart';
        renderMealsView();
      });
    }
    if (logTab) {
      logTab.addEventListener('click', function () {
        state.mealsViewMode = 'log';
        renderMealsView();
      });
    }

    // Monthly Excel Sheet Cell Click & Buttons
    const excelTbody = document.getElementById('monthly-excel-tbody');
    if (excelTbody) {
      excelTbody.addEventListener('click', function (e) {
        const cell = e.target.closest('.excel-cell-clickable');
        if (cell) {
          const userId = cell.getAttribute('data-userid');
          const targetDate = cell.getAttribute('data-date');
          if (userId && targetDate) {
            state.selectedChartDate = targetDate;
            openMealSettingsModal(userId, targetDate);
          }
        }
      });
    }

    const btnToggleCompact = document.getElementById('btn-toggle-excel-compact');
    if (btnToggleCompact) {
      btnToggleCompact.addEventListener('click', function (e) {
        e.preventDefault();
        const matrixTable = document.getElementById('monthly-excel-matrix-table');
        if (matrixTable) {
          const isCompact = matrixTable.classList.toggle('compact-excel-mode');
          const labelEl = document.getElementById('excel-compact-label');
          if (labelEl) {
            labelEl.textContent = isCompact ? 'Normal View' : 'Fit Screen / Compact';
          }
          showToast(isCompact ? 'Switched to Compact Screen View.' : 'Switched to Normal View.', 'info');
        }
      });
    }

    const btnExportExcel = document.getElementById('btn-export-excel-sheet');
    if (btnExportExcel) {
      btnExportExcel.addEventListener('click', function (e) {
        e.preventDefault();
        exportExcelSheetCSV();
      });
    }

    const btnPrintExcel = document.getElementById('btn-print-excel-sheet');
    if (btnPrintExcel) {
      btnPrintExcel.addEventListener('click', function (e) {
        e.preventDefault();
        window.print();
      });
    }

    // Daily Meal Chart Date Picker
    const chartDateInput = document.getElementById('meal-chart-date');
    if (chartDateInput) {
      chartDateInput.addEventListener('change', function (e) {
        state.selectedChartDate = e.target.value;
        renderDailyMealChart(state.selectedChartDate);
      });
    }

    // Grid Input Changes & Settings Modal Clicks
    const gridTbody = document.getElementById('daily-meal-grid-tbody');
    if (gridTbody) {
      gridTbody.addEventListener('input', function (e) {
        if (e.target.classList.contains('grid-meal-input')) {
          const userId = e.target.getAttribute('data-userid');
          const mealType = e.target.getAttribute('data-meal');
          const value = e.target.value;
          updateDailyMealInput(userId, mealType, value);
        }
      });

      gridTbody.addEventListener('click', function (e) {
        const settingsBtn = e.target.closest('.btn-open-meal-settings');
        if (settingsBtn) {
          e.preventDefault();
          const userId = settingsBtn.getAttribute('data-userid');
          openMealSettingsModal(userId);
        }
      });
    }

    // Meal Settings Form Submit
    const mealSettingsForm = document.getElementById('meal-settings-form');
    if (mealSettingsForm) {
      mealSettingsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveMealSettingsForm();
      });
    }

    const btnOpenMealModalChart = document.getElementById('btn-open-meal-modal-chart');
    if (btnOpenMealModalChart) {
      btnOpenMealModalChart.addEventListener('click', function (e) {
        e.preventDefault();
        openMealModal();
      });
    }

    ['expense-search-input', 'expense-category-filter', 'expense-date-filter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', renderExpensesView);
    });

    ['payment-member-filter', 'payment-date-filter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', renderPaymentsView);
    });

    const memberSearch = document.getElementById('member-search-input');
    if (memberSearch) memberSearch.addEventListener('input', renderMembersView);

    // Modal Open Buttons
    document.getElementById('btn-open-meal-modal').addEventListener('click', (e) => {
      e.preventDefault();
      openMealModal();
    });
    document.getElementById('btn-open-expense-modal').addEventListener('click', (e) => {
      e.preventDefault();
      openExpenseModal();
    });
    document.getElementById('btn-open-payment-modal').addEventListener('click', (e) => {
      e.preventDefault();
      openPaymentModal();
    });
    document.getElementById('btn-open-member-modal').addEventListener('click', (e) => {
      e.preventDefault();
      openMemberModal();
    });
    
    // Elect Manager Modal Trigger & Presets
    document.getElementById('btn-open-elect-modal').addEventListener('click', (e) => {
      e.preventDefault();
      populateDropdownFilters();
      const month = state.selectedMonth;
      document.getElementById('elect-start-date').value = `${month}-01`;
      document.getElementById('elect-end-date').value = `${month}-15`;
      document.getElementById('elect-note').value = `1st Half Meal Manager (${month})`;
      // Reset cook bill fields
      const chk = document.getElementById('elect-include-cook-bill');
      if (chk) { chk.checked = false; }
      const fields = document.getElementById('cook-bill-fields');
      if (fields) fields.style.display = 'none';
      const amtInput = document.getElementById('elect-cook-bill-amount');
      if (amtInput) amtInput.value = '';
      const noteInput = document.getElementById('elect-cook-bill-note');
      if (noteInput) noteInput.value = '';
      openModal('elect-manager-modal');
    });

    document.getElementById('preset-term-first-half').addEventListener('click', (e) => {
      e.preventDefault();
      const month = state.selectedMonth;
      document.getElementById('elect-start-date').value = `${month}-01`;
      document.getElementById('elect-end-date').value = `${month}-15`;
      document.getElementById('elect-note').value = `1st Half Meal Manager (${month})`;
    });

    document.getElementById('preset-term-second-half').addEventListener('click', (e) => {
      e.preventDefault();
      const month = state.selectedMonth;
      const parts = month.split('-');
      const lastDay = new Date(parts[0], parts[1], 0).getDate();
      document.getElementById('elect-start-date').value = `${month}-16`;
      document.getElementById('elect-end-date').value = `${month}-${lastDay}`;
      document.getElementById('elect-note').value = `2nd Half Meal Manager (${month})`;
    });

    document.getElementById('preset-term-full-month').addEventListener('click', (e) => {
      e.preventDefault();
      const month = state.selectedMonth;
      const parts = month.split('-');
      const lastDay = new Date(parts[0], parts[1], 0).getDate();
      document.getElementById('elect-start-date').value = `${month}-01`;
      document.getElementById('elect-end-date').value = `${month}-${lastDay}`;
      document.getElementById('elect-note').value = `Full Month Meal Manager (${month})`;
    });

    // Modal Form Submits
    document.getElementById('meal-form').addEventListener('submit', saveMealRecord);
    document.getElementById('expense-form').addEventListener('submit', saveExpenseRecord);
    document.getElementById('payment-form').addEventListener('submit', savePaymentRecord);
    document.getElementById('member-form').addEventListener('submit', saveMemberRecord);
    document.getElementById('meal-weights-form').addEventListener('submit', saveMealSettingsRecord);

    // Edit Manager Term Form
    const editManagerTermForm = document.getElementById('edit-manager-term-form');
    if (editManagerTermForm) {
      editManagerTermForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const termId = document.getElementById('edit-term-id').value;
        const startDate = document.getElementById('edit-term-start-date').value;
        const endDate = document.getElementById('edit-term-end-date').value;
        const note = document.getElementById('edit-term-note').value.trim();

        if (!termId || !startDate || !endDate) {
          showToast('Please fill in all required fields.', 'error');
          return;
        }
        if (startDate > endDate) {
          showToast('Start date cannot be after end date.', 'error');
          return;
        }

        // Save term edits
        const terms = Storage.getManagerTerms();
        const idx = terms.findIndex(t => t.id === termId);
        if (idx !== -1) {
          terms[idx].startDate = startDate;
          terms[idx].endDate = endDate;
          terms[idx].note = note || terms[idx].note;
          Storage.saveManagerTerms(terms);
        }

        // Handle cook bill changes
        const cookBills = Storage.getCookBills();
        const existingCbIdx = cookBills.findIndex(cb => cb.termId === termId);
        const amtInput = document.getElementById('edit-cook-bill-amount');
        const noteInput = document.getElementById('edit-cook-bill-note-field');

        if (amtInput && amtInput.value !== '') {
          const newAmount = parseFloat(amtInput.value) || 0;
          const newNote = noteInput ? noteInput.value.trim() || 'Cook Bill' : 'Cook Bill';
          const newMonth = startDate.substring(0, 7);

          if (existingCbIdx !== -1) {
            // Update existing cook bill - reset all member amounts to new default
            cookBills[existingCbIdx].defaultAmount = newAmount;
            cookBills[existingCbIdx].note = newNote;
            cookBills[existingCbIdx].month = newMonth;
            // Reset all member amounts to new default
            Object.keys(cookBills[existingCbIdx].memberBills).forEach(uid => {
              cookBills[existingCbIdx].memberBills[uid] = newAmount;
            });
            showToast('Cook Bill updated and member amounts reset to new default.', 'info');
          } else {
            // No existing cook bill — check if add checkbox is checked
            const addChk = document.getElementById('edit-add-cook-bill-chk');
            if (addChk && addChk.checked && newAmount > 0) {
              const activeMembers = getVisibleMembers().filter(u => u.active !== false);
              const memberBills = {};
              activeMembers.forEach(u => { memberBills[u.id] = newAmount; });
              cookBills.push({
                id: generateId(),
                termId: termId,
                month: newMonth,
                messId: state.currentUser ? (state.currentUser.messId || state.selectedMessId || 'mess_default') : 'mess_default',
                defaultAmount: newAmount,
                memberBills: memberBills,
                note: newNote,
                createdAt: new Date().toISOString(),
                createdBy: state.currentUser ? state.currentUser.id : ''
              });
              showToast(`Cook Bill of ${formatCurrency(newAmount)}/member added to this term.`, 'success');
            }
          }
          Storage.saveCookBills(cookBills);
        }

        showToast('Manager term updated successfully!', 'success');
        closeModal('edit-manager-term-modal');
        renderCurrentView();
      });
    }

    document.getElementById('elect-manager-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const userId = document.getElementById('elect-user-id').value;
      const startDate = document.getElementById('elect-start-date').value;
      const endDate = document.getElementById('elect-end-date').value;
      const note = document.getElementById('elect-note').value;
      const includeCookBill = document.getElementById('elect-include-cook-bill').checked;
      const cookBillAmount = parseFloat(document.getElementById('elect-cook-bill-amount').value) || 0;
      const cookBillNote = document.getElementById('elect-cook-bill-note').value.trim() || 'Cook Bill';

      const cookBillOptions = includeCookBill ? {
        enabled: true,
        amount: cookBillAmount,
        note: cookBillNote
      } : { enabled: false };

      electMealManager(userId, startDate, endDate, note, cookBillOptions);
    });

    // Cook Bill checkbox toggle
    const includeCookBillChk = document.getElementById('elect-include-cook-bill');
    if (includeCookBillChk) {
      includeCookBillChk.addEventListener('change', function () {
        const fields = document.getElementById('cook-bill-fields');
        if (fields) fields.style.display = this.checked ? 'block' : 'none';
      });
    }

    // Add Cook Bill Modal (standalone) — open
    const btnOpenAddCookBill = document.getElementById('btn-open-add-cook-bill-modal');
    if (btnOpenAddCookBill) {
      btnOpenAddCookBill.addEventListener('click', () => {
        // Populate month and term options
        const monthInput = document.getElementById('add-cook-bill-month');
        if (monthInput) monthInput.value = state.selectedMonth;

        const termSelect = document.getElementById('add-cook-bill-term');
        if (termSelect) {
          const terms = Storage.getManagerTerms().filter(t => t.startDate.startsWith(state.selectedMonth) || t.endDate.startsWith(state.selectedMonth));
          termSelect.innerHTML = '<option value="">— Not linked to any term —</option>' +
            terms.map(t => `<option value="${t.id}">${t.userName}: ${formatDate(t.startDate)} — ${formatDate(t.endDate)}</option>`).join('');
        }
        openModal('add-cook-bill-modal');
      });
    }

    // Add Cook Bill Modal — form submit
    const addCookBillForm = document.getElementById('add-cook-bill-form');
    if (addCookBillForm) {
      addCookBillForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('add-cook-bill-amount').value) || 0;
        const month = document.getElementById('add-cook-bill-month').value;
        const note = document.getElementById('add-cook-bill-note').value.trim() || 'Cook Bill';
        const termId = document.getElementById('add-cook-bill-term').value || null;

        if (!amount || amount <= 0) {
          showToast('Please enter a valid cook bill amount.', 'error');
          return;
        }
        if (!month) {
          showToast('Please select a month.', 'error');
          return;
        }

        const activeMembers = getVisibleMembers().filter(u => u.active !== false);
        const memberBills = {};
        activeMembers.forEach(u => { memberBills[u.id] = amount; });

        const cookBills = Storage.getCookBills();
        cookBills.push({
          id: generateId(),
          termId: termId,
          month: month,
          messId: state.currentUser ? (state.currentUser.messId || state.selectedMessId || 'mess_default') : 'mess_default',
          defaultAmount: amount,
          memberBills: memberBills,
          note: note,
          createdAt: new Date().toISOString(),
          createdBy: state.currentUser ? state.currentUser.id : ''
        });
        Storage.saveCookBills(cookBills);

        showToast(`Cook Bill of ${formatCurrency(amount)}/member added for ${month}.`, 'success');
        closeModal('add-cook-bill-modal');
        renderCurrentView();
      });
    }

    // Save Cook Bill Adjustments
    const btnSaveAdjustments = document.getElementById('btn-save-cook-bill-adjustments');
    if (btnSaveAdjustments) {
      btnSaveAdjustments.addEventListener('click', () => {
        const cookBillId = document.getElementById('adjust-cook-bill-id').value;
        if (!cookBillId) return;

        const cookBills = Storage.getCookBills();
        const idx = cookBills.findIndex(cb => cb.id === cookBillId);
        if (idx === -1) return;

        const inputs = document.querySelectorAll('.cook-bill-member-amount-input');
        inputs.forEach(input => {
          const uid = input.dataset.userid;
          const val = parseFloat(input.value);
          if (!isNaN(val)) cookBills[idx].memberBills[uid] = val;
        });

        Storage.saveCookBills(cookBills);
        showToast('Cook bill amounts updated successfully!', 'success');
        closeModal('adjust-cook-bill-modal');
        renderCurrentView();
      });
    }

    // Quick Meal Preset Buttons
    document.getElementById('preset-breakfast').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('meal-breakfast').value = "1";
      calculateMealModalTotal();
    });
    document.getElementById('preset-lunch').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('meal-lunch').value = "1";
      calculateMealModalTotal();
    });
    document.getElementById('preset-dinner').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('meal-dinner').value = "1";
      calculateMealModalTotal();
    });
    document.getElementById('preset-full').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('meal-breakfast').value = "1";
      document.getElementById('meal-lunch').value = "1";
      document.getElementById('meal-dinner').value = "1";
      calculateMealModalTotal();
    });
    document.getElementById('preset-clear').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('meal-breakfast').value = "0";
      document.getElementById('meal-lunch').value = "0";
      document.getElementById('meal-dinner').value = "0";
      calculateMealModalTotal();
    });

    ['meal-breakfast', 'meal-lunch', 'meal-dinner'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', calculateMealModalTotal);
    });

    // Close Modals
    document.querySelectorAll('.close-modal, .cancel-modal, .modal-close-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const modal = this.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    document.addEventListener('click', function (e) {
      const closeBtn = e.target.closest('.close-modal, .cancel-modal, .modal-close-btn');
      if (closeBtn) {
        e.preventDefault();
        const modal = closeBtn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      }
    });

    // Confirmation Modal Action
    document.getElementById('confirm-btn-cancel').addEventListener('click', (e) => {
      e.preventDefault();
      closeModal('confirm-modal');
    });
    document.getElementById('confirm-btn-ok').addEventListener('click', (e) => {
      e.preventDefault();
      closeModal('confirm-modal');
      if (typeof state.confirmCallback === 'function') state.confirmCallback();
    });

    // Profile Form Submits
    document.getElementById('profile-details-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('profile-name').value.trim();
      const phone = document.getElementById('profile-phone').value.trim();

      if (!name || !phone) return;
      if (!validateBDPhone(phone)) {
        showToast('Invalid Bangladeshi phone number.', 'error');
        return;
      }

      const users = Storage.getUsers();
      const idx = users.findIndex(u => u.id === state.currentUser.id);
      if (idx !== -1) {
        users[idx].name = name;
        users[idx].phone = phone;
        Storage.saveUsers(users);
        state.currentUser = users[idx];
        Storage.setCurrentUser(users[idx]);
        document.getElementById('sidebar-user-name').textContent = name;
        showToast('Profile details updated.', 'success');
      }
    });

    document.getElementById('profile-password-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const current = document.getElementById('pwd-current').value;
      const newPwd = document.getElementById('pwd-new').value;
      const confirm = document.getElementById('pwd-confirm').value;

      if (current !== state.currentUser.password) {
        showToast('Current password is incorrect.', 'error');
        return;
      }
      if (newPwd !== confirm) {
        showToast('New passwords do not match.', 'error');
        return;
      }

      const users = Storage.getUsers();
      const idx = users.findIndex(u => u.id === state.currentUser.id);
      if (idx !== -1) {
        users[idx].password = newPwd;
        Storage.saveUsers(users);
        state.currentUser.password = newPwd;
        Storage.setCurrentUser(state.currentUser);
        this.reset();
        showToast('Password updated successfully.', 'success');
      }
    });

    // Backup & Settings
    document.getElementById('btn-backup-export').addEventListener('click', (e) => {
      e.preventDefault();
      exportBackup();
    });
    document.getElementById('btn-backup-restore').addEventListener('click', (e) => {
      e.preventDefault();
      restoreBackup();
    });
    // Global Password Show/Hide Toggle Listener
    document.addEventListener('click', function (e) {
      const toggleBtn = e.target.closest('.password-toggle-icon, .password-toggle-btn');
      if (toggleBtn) {
        e.preventDefault();
        const targetId = toggleBtn.getAttribute('data-target');
        let inputEl = null;
        if (targetId) {
          inputEl = document.getElementById(targetId);
        } else {
          const wrapper = toggleBtn.closest('.password-input-wrapper');
          if (wrapper) inputEl = wrapper.querySelector('input');
        }

        if (inputEl) {
          if (inputEl.type === 'password') {
            inputEl.type = 'text';
            toggleBtn.classList.remove('ri-eye-line');
            toggleBtn.classList.add('ri-eye-off-line');
            toggleBtn.setAttribute('title', 'Hide password');
          } else {
            inputEl.type = 'password';
            toggleBtn.classList.remove('ri-eye-off-line');
            toggleBtn.classList.add('ri-eye-line');
            toggleBtn.setAttribute('title', 'Show password');
          }
        }
      }
    });

    bindTableActions();
  }

  function calculateMealModalTotal() {
    const b = parseInt(document.getElementById('meal-breakfast').value, 10) || 0;
    const l = parseInt(document.getElementById('meal-lunch').value, 10) || 0;
    const d = parseInt(document.getElementById('meal-dinner').value, 10) || 0;

    const weights = Storage.getMealSettings();
    const total = calculateWeightedMealTotal(b, l, d);

    document.getElementById('meal-total').value = total.toFixed(2);
    
    const previewEl = document.getElementById('meal-weight-preview-text');
    if (previewEl) {
      previewEl.innerHTML = `* Calculation: (${b}×${weights.breakfastWeight}) + (${l}×${weights.lunchWeight}) + (${d}×${weights.dinnerWeight}) = <strong>${total.toFixed(2)} meals</strong>`;
    }
  }

  function openMealModal(mealData = null) {
    if (!state.currentUser) return;
    const targetDate = mealData ? mealData.date : state.selectedChartDate;
    if (!hasElectedManagerForDate(targetDate)) {
      showToast('ম্যানেজার নির্বাচন না করা পর্যন্ত মিল কাউন্ট বা এন্ট্রি দেওয়া সম্ভব নয়। প্রথমে মিল ম্যানেজার নির্বাচন করুন।', 'error');
      return;
    }
    if (!canManageMess(state.currentUser)) {
      showToast('Permission denied. Only active Meal Manager or Admin can record meals.', 'error');
      return;
    }
    document.getElementById('meal-form').reset();
    populateDropdownFilters();

    if (mealData) {
      document.getElementById('meal-modal-title').textContent = 'Edit Meal Record';
      document.getElementById('meal-id').value = mealData.id;
      document.getElementById('meal-user-id').value = mealData.userId;
      document.getElementById('meal-date').value = mealData.date;
      document.getElementById('meal-breakfast').value = mealData.breakfast;
      document.getElementById('meal-lunch').value = mealData.lunch;
      document.getElementById('meal-dinner').value = mealData.dinner;
      document.getElementById('meal-note').value = mealData.note || '';

      const modeRadio = document.querySelector(`input[name="meal-mode"][value="${mealData.mode || 'onetime'}"]`);
      if (modeRadio) modeRadio.checked = true;
    } else {
      document.getElementById('meal-modal-title').textContent = 'Record Meal Entry';
      document.getElementById('meal-id').value = '';
      document.getElementById('meal-date').value = getCurrentDateString();
      document.getElementById('mode-onetime').checked = true;
    }
    calculateMealModalTotal();
    openModal('meal-modal');
  }

  function openExpenseModal(expenseData = null) {
    if (!state.currentUser) return;
    document.getElementById('expense-form').reset();
    populateDropdownFilters();

    if (expenseData) {
      document.getElementById('expense-modal-title').textContent = 'Edit Mess Expense';
      document.getElementById('expense-id').value = expenseData.id;
      document.getElementById('expense-user-id').value = expenseData.spentBy || expenseData.userId || expenseData.addedBy || state.currentUser.id;
      document.getElementById('expense-date').value = expenseData.date;
      document.getElementById('expense-amount').value = expenseData.amount;
      document.getElementById('expense-category').value = expenseData.category;
      document.getElementById('expense-description').value = expenseData.description;
    } else {
      document.getElementById('expense-modal-title').textContent = 'Record Mess Expense';
      document.getElementById('expense-id').value = '';
      document.getElementById('expense-user-id').value = state.currentUser.id;
      document.getElementById('expense-date').value = getCurrentDateString();
    }
    openModal('expense-modal');
  }

  function openPaymentModal(paymentData = null) {
    if (!state.currentUser) return;
    document.getElementById('payment-form').reset();
    populateDropdownFilters();

    if (paymentData) {
      document.getElementById('payment-modal-title').textContent = 'Edit Member Payment';
      document.getElementById('payment-id').value = paymentData.id;
      document.getElementById('payment-user-id').value = paymentData.userId;
      document.getElementById('payment-date').value = paymentData.date;
      document.getElementById('payment-amount').value = paymentData.amount;
      document.getElementById('payment-note').value = paymentData.note || '';
    } else {
      document.getElementById('payment-modal-title').textContent = 'Record Member Payment';
      document.getElementById('payment-id').value = '';
      document.getElementById('payment-date').value = getCurrentDateString();
    }
    openModal('payment-modal');
  }

  function openMemberModal(memberData = null) {
    if (!state.currentUser) return;
    document.getElementById('member-form').reset();
    populateDropdownFilters();

    if (memberData) {
      document.getElementById('member-modal-title').textContent = 'Edit Member Profile';
      document.getElementById('member-id').value = memberData.id;
      document.getElementById('member-name').value = memberData.name;
      document.getElementById('member-phone').value = memberData.phone;
      document.getElementById('member-role').value = memberData.role;
      if (memberData.managerId && document.getElementById('member-manager-id')) {
        document.getElementById('member-manager-id').value = memberData.managerId;
      }
      document.getElementById('member-password-group').style.display = 'none';
    } else {
      document.getElementById('member-modal-title').textContent = 'Add New Mess Member';
      document.getElementById('member-id').value = '';
      document.getElementById('member-password-group').style.display = 'flex';
    }
    openModal('member-modal');
  }

  function bindTableActions() {
    const termsContainer = document.getElementById('manager-terms-container');
    if (termsContainer) {
      termsContainer.addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('.delete-term-btn');
        if (deleteBtn) {
          e.preventDefault();
          const id = deleteBtn.getAttribute('data-id');
          deleteManagerTerm(id);
        }
      });
    }

    document.getElementById('meals-table-body').addEventListener('click', function (e) {
      const editBtn = e.target.closest('.edit-meal-btn');
      const deleteBtn = e.target.closest('.delete-meal-btn');

      if (editBtn) {
        e.preventDefault();
        const id = editBtn.getAttribute('data-id');
        const meal = Storage.getMeals().find(m => m.id === id);
        if (meal) openMealModal(meal);
      }

      if (deleteBtn) {
        e.preventDefault();
        const id = deleteBtn.getAttribute('data-id');
        showConfirmModal('Delete Meal Record', 'Are you sure you want to delete this meal entry?', function () {
          const meals = Storage.getMeals().filter(m => m.id !== id);
          Storage.saveMeals(meals);
          showToast('Meal record deleted.', 'info');
          renderMealsView();
        });
      }
    });

    document.getElementById('expenses-table-body').addEventListener('click', function (e) {
      const editBtn = e.target.closest('.edit-expense-btn');
      const deleteBtn = e.target.closest('.delete-expense-btn');

      if (editBtn) {
        e.preventDefault();
        const id = editBtn.getAttribute('data-id');
        const expense = Storage.getExpenses().find(ex => ex.id === id);
        if (expense) openExpenseModal(expense);
      }

      if (deleteBtn) {
        e.preventDefault();
        const id = deleteBtn.getAttribute('data-id');
        showConfirmModal('Delete Expense', 'Are you sure you want to delete this expense receipt?', function () {
          const expenses = Storage.getExpenses().filter(ex => ex.id !== id);
          Storage.saveExpenses(expenses);
          showToast('Expense receipt deleted.', 'info');
          renderExpensesView();
        });
      }
    });

    document.getElementById('payments-table-body').addEventListener('click', function (e) {
      const editBtn = e.target.closest('.edit-payment-btn');
      const deleteBtn = e.target.closest('.delete-payment-btn');

      if (editBtn) {
        e.preventDefault();
        const id = editBtn.getAttribute('data-id');
        const payment = Storage.getPayments().find(p => p.id === id);
        if (payment) openPaymentModal(payment);
      }

      if (deleteBtn) {
        e.preventDefault();
        const id = deleteBtn.getAttribute('data-id');
        showConfirmModal('Delete Payment', 'Are you sure you want to delete this payment record?', function () {
          const payments = Storage.getPayments().filter(p => p.id !== id);
          Storage.savePayments(payments);
          showToast('Payment record deleted.', 'info');
          renderPaymentsView();
        });
      }
    });

    document.getElementById('members-table-body').addEventListener('click', function (e) {
      const editBtn = e.target.closest('.edit-member-btn');
      const toggleBtn = e.target.closest('.toggle-member-active-btn');
      const resetBtn = e.target.closest('.reset-pwd-btn');
      const deleteBtn = e.target.closest('.delete-member-btn');

      if (editBtn) {
        e.preventDefault();
        const id = editBtn.getAttribute('data-id');
        const u = Storage.getUsers().find(x => x.id === id);
        if (u) {
          if (u.role === ROLES.SUPERADMIN && !isUserSuperAdmin(state.currentUser)) {
            showToast('Permission denied. Standard Admins cannot edit Superadmins.', 'error');
            return;
          }
          openMemberModal(u);
        }
      }

      if (toggleBtn) {
        e.preventDefault();
        const id = toggleBtn.getAttribute('data-id');
        const users = Storage.getUsers();
        const u = users.find(x => x.id === id);
        if (u) {
          if (u.role === ROLES.SUPERADMIN && !isUserSuperAdmin(state.currentUser)) {
            showToast('Permission denied. Cannot deactivate a Superadmin.', 'error');
            return;
          }
          if (u.role === ROLES.SUPERADMIN && u.active !== false) {
            const activeSuperAdmins = users.filter(x => x.role === ROLES.SUPERADMIN && x.active !== false).length;
            if (activeSuperAdmins <= 1) {
              showToast('Cannot deactivate the last remaining active Superadmin.', 'error');
              return;
            }
          }
          u.active = !(u.active !== false);
          Storage.saveUsers(users);
          showToast(`Member ${u.name} is now ${u.active ? 'Active' : 'Inactive'}.`, 'info');
          renderMembersView();
        }
      }

      if (resetBtn) {
        e.preventDefault();
        const id = resetBtn.getAttribute('data-id');
        const users = Storage.getUsers();
        const u = users.find(x => x.id === id);
        if (u) {
          if (u.role === ROLES.SUPERADMIN && !isUserSuperAdmin(state.currentUser)) {
            showToast('Permission denied. Cannot reset Superadmin password.', 'error');
            return;
          }
          const newPassword = prompt(`Enter new password for ${u.name}:`, '123456');
          if (newPassword && newPassword.trim()) {
            u.password = newPassword.trim();
            Storage.saveUsers(users);
            showToast(`Password for ${u.name} updated successfully.`, 'success');
          }
        }
      }

      if (deleteBtn) {
        e.preventDefault();
        const id = deleteBtn.getAttribute('data-id');
        const users = Storage.getUsers();
        const u = users.find(x => x.id === id);

        if (u) {
          if (u.role === ROLES.SUPERADMIN) {
            if (!isUserSuperAdmin(state.currentUser)) {
              showToast('Permission denied. Standard Admins cannot delete a Superadmin.', 'error');
              return;
            }
            const superAdminCount = users.filter(x => x.role === ROLES.SUPERADMIN).length;
            if (superAdminCount <= 1) {
              showToast('Permission denied. Cannot delete the last remaining Superadmin.', 'error');
              return;
            }
          }

          showConfirmModal(
            'Delete Member Account & Purge Data',
            `Are you sure you want to permanently delete ${u.name}? All associated meals, expenses, payments, manager schedules, and personal settings will be completely purged from system cache.`,
            function () {
              deleteUserCompletely(id);
              showToast(`Member ${u.name} and all associated data completely purged from cache.`, 'info');
              renderMembersView();
            }
          );
        }
      }
    });
  }

  function deleteUserCompletely(userId) {
    if (!userId) return;

    // 1. Purge User Account
    const users = Storage.getUsers().filter(u => u.id !== userId);
    Storage.saveUsers(users);

    // 2. Purge Meal Records
    const meals = Storage.getMeals().filter(m => m.userId !== userId);
    Storage.saveMeals(meals);

    // 3. Purge Expense Records (spent by or added by userId)
    const expenses = Storage.getExpenses().filter(e => e.spentBy !== userId && e.addedBy !== userId);
    Storage.saveExpenses(expenses);

    // 4. Purge Payment Records
    const payments = Storage.getPayments().filter(p => p.userId !== userId);
    Storage.savePayments(payments);

    // 5. Purge Manager Schedule Terms
    const managerTerms = Storage.getManagerTerms().filter(t => t.userId !== userId);
    Storage.saveManagerTerms(managerTerms);

    // 6. Purge Per-User Meal Settings
    const userMealSettings = Storage.getUserMealSettings();
    if (userMealSettings[userId]) {
      delete userMealSettings[userId];
      Storage.saveUserMealSettings(userMealSettings);
    }

    // 7. Remove from Cook Bill memberBills maps
    const cookBills = Storage.getCookBills();
    cookBills.forEach(cb => {
      if (cb.memberBills && cb.memberBills[userId] !== undefined) {
        delete cb.memberBills[userId];
      }
    });
    Storage.saveCookBills(cookBills);
  }

  function ensureSuperAdminExists() {
    let users = Storage.getUsers();
    let superAdmin = users.find(u => u.role === ROLES.SUPERADMIN || u.phone === 'admin' || u.phone === '01700000000');
    if (!superAdmin) {
      superAdmin = {
        id: 'usr_superadmin',
        name: 'Super Admin',
        phone: 'admin',
        password: 'superadmin@123',
        role: ROLES.SUPERADMIN,
        active: true,
        createdAt: getCurrentDateString()
      };
      users.unshift(superAdmin);
    } else {
      superAdmin.name = 'Super Admin';
      superAdmin.phone = 'admin';
      superAdmin.password = 'superadmin@123';
      superAdmin.role = ROLES.SUPERADMIN;
      superAdmin.active = true;
    }

    // Purge old demo users if present
    const demoUserIds = ['usr_tanvir', 'usr_rafiq', 'usr_shakib', 'usr_mahfuz'];
    users = users.filter(u => !demoUserIds.includes(u.id));

    Storage.saveUsers(users);
  }

  /* ==========================================================================
     16. APP INITIALIZATION
     ========================================================================== */
  async function init() {
    const loadingScreen = document.createElement('div');
    loadingScreen.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1.5rem;color:#4f46e5;"><i class="ri-loader-4-line ri-spin" style="font-size:3rem;margin-bottom:1rem;"></i><div>Syncing with Server...</div></div>';
    document.body.appendChild(loadingScreen);

    try {
      await BackendAPI.pull();
    } catch (e) {
      console.error("Backend pull failed", e);
      if (typeof showToast !== 'undefined') {
        showToast('Offline Mode: Using local data.', 'warning');
      }
    }
    
    if(loadingScreen.parentNode) {
      loadingScreen.parentNode.removeChild(loadingScreen);
    }

    const savedTheme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle-icon').className = savedTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';

    if (!Storage.isInitialized()) {
      seedCleanData();
    }

    ensureSuperAdminExists();
    bindEvents();
    initInactivityListeners();

    const savedUser = Storage.getCurrentUser();
    if (savedUser) {
      const freshUser = Storage.getUsers().find(u => u.id === savedUser.id);
      if (freshUser && freshUser.active !== false) {
        state.currentUser = freshUser;
      }
    }

    const savedLang = Storage.getLanguage();
    setLanguage(savedLang);

    if (state.currentUser) {
      renderAppLayout();
      resetInactivityTimer();
    } else {
      document.getElementById('auth-section').classList.remove('hidden');
      document.getElementById('app-section').classList.add('hidden');
      clearLoginFormInputs();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

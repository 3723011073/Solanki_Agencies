// Auth helpers

const COUNTRY_PHONE_OPTIONS = [
  { name: 'Afghanistan', dialCode: '+93', currency: 'AFN' },
  { name: 'Albania', dialCode: '+355', currency: 'ALL' },
  { name: 'Algeria', dialCode: '+213', currency: 'DZD' },
  { name: 'Argentina', dialCode: '+54', currency: 'ARS' },
  { name: 'Australia', dialCode: '+61', currency: 'AUD' },
  { name: 'Austria', dialCode: '+43', currency: 'EUR' },
  { name: 'Bahrain', dialCode: '+973', currency: 'BHD' },
  { name: 'Bangladesh', dialCode: '+880', currency: 'BDT' },
  { name: 'Belgium', dialCode: '+32', currency: 'EUR' },
  { name: 'Brazil', dialCode: '+55', currency: 'BRL' },
  { name: 'Bulgaria', dialCode: '+359', currency: 'BGN' },
  { name: 'Cambodia', dialCode: '+855', currency: 'KHR' },
  { name: 'Canada', dialCode: '+1', currency: 'CAD' },
  { name: 'China', dialCode: '+86', currency: 'CNY' },
  { name: 'Colombia', dialCode: '+57', currency: 'COP' },
  { name: 'Croatia', dialCode: '+385', currency: 'EUR' },
  { name: 'Czech Republic', dialCode: '+420', currency: 'CZK' },
  { name: 'Denmark', dialCode: '+45', currency: 'DKK' },
  { name: 'Egypt', dialCode: '+20', currency: 'EGP' },
  { name: 'Finland', dialCode: '+358', currency: 'EUR' },
  { name: 'France', dialCode: '+33', currency: 'EUR' },
  { name: 'Germany', dialCode: '+49', currency: 'EUR' },
  { name: 'Greece', dialCode: '+30', currency: 'EUR' },
  { name: 'Hong Kong', dialCode: '+852', currency: 'HKD' },
  { name: 'Hungary', dialCode: '+36', currency: 'HUF' },
  { name: 'India', dialCode: '+91', currency: 'INR' },
  { name: 'Indonesia', dialCode: '+62', currency: 'IDR' },
  { name: 'Ireland', dialCode: '+353', currency: 'EUR' },
  { name: 'Israel', dialCode: '+972', currency: 'ILS' },
  { name: 'Italy', dialCode: '+39', currency: 'EUR' },
  { name: 'Japan', dialCode: '+81', currency: 'JPY' },
  { name: 'Jordan', dialCode: '+962', currency: 'JOD' },
  { name: 'Kenya', dialCode: '+254', currency: 'KES' },
  { name: 'Kuwait', dialCode: '+965', currency: 'KWD' },
  { name: 'Lebanon', dialCode: '+961', currency: 'LBP' },
  { name: 'Malaysia', dialCode: '+60', currency: 'MYR' },
  { name: 'Mexico', dialCode: '+52', currency: 'MXN' },
  { name: 'Morocco', dialCode: '+212', currency: 'MAD' },
  { name: 'Nepal', dialCode: '+977', currency: 'NPR' },
  { name: 'Netherlands', dialCode: '+31', currency: 'EUR' },
  { name: 'New Zealand', dialCode: '+64', currency: 'NZD' },
  { name: 'Nigeria', dialCode: '+234', currency: 'NGN' },
  { name: 'Norway', dialCode: '+47', currency: 'NOK' },
  { name: 'Oman', dialCode: '+968', currency: 'OMR' },
  { name: 'Pakistan', dialCode: '+92', currency: 'PKR' },
  { name: 'Philippines', dialCode: '+63', currency: 'PHP' },
  { name: 'Poland', dialCode: '+48', currency: 'PLN' },
  { name: 'Portugal', dialCode: '+351', currency: 'EUR' },
  { name: 'Qatar', dialCode: '+974', currency: 'QAR' },
  { name: 'Romania', dialCode: '+40', currency: 'RON' },
  { name: 'Russia', dialCode: '+7', currency: 'RUB' },
  { name: 'Saudi Arabia', dialCode: '+966', currency: 'SAR' },
  { name: 'Singapore', dialCode: '+65', currency: 'SGD' },
  { name: 'South Africa', dialCode: '+27', currency: 'ZAR' },
  { name: 'South Korea', dialCode: '+82', currency: 'KRW' },
  { name: 'Spain', dialCode: '+34', currency: 'EUR' },
  { name: 'Sri Lanka', dialCode: '+94', currency: 'LKR' },
  { name: 'Sweden', dialCode: '+46', currency: 'SEK' },
  { name: 'Switzerland', dialCode: '+41', currency: 'CHF' },
  { name: 'Thailand', dialCode: '+66', currency: 'THB' },
  { name: 'Turkey', dialCode: '+90', currency: 'TRY' },
  { name: 'UAE', dialCode: '+971', currency: 'AED' },
  { name: 'UK', dialCode: '+44', currency: 'GBP' },
  { name: 'USA', dialCode: '+1', currency: 'USD' },
  { name: 'Vietnam', dialCode: '+84', currency: 'VND' }
];

const INR_TO_CURRENCY = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  AUD: 0.018,
  CAD: 0.016,
  SGD: 0.016,
  NZD: 0.019,
  CHF: 0.011,
  JPY: 1.8,
  CNY: 0.087,
  HKD: 0.094,
  KRW: 16.2,
  THB: 0.43,
  MYR: 0.056,
  IDR: 194,
  PHP: 0.68,
  VND: 305,
  SAR: 0.045,
  QAR: 0.044,
  OMR: 0.0046,
  KWD: 0.0037,
  BHD: 0.0045,
  JOD: 0.0085,
  ILS: 0.044,
  TRY: 0.39,
  RUB: 1.07,
  PLN: 0.044,
  CZK: 0.28,
  HUF: 4.4,
  RON: 0.053,
  BGN: 0.022,
  DKK: 0.082,
  NOK: 0.13,
  SEK: 0.13,
  HRK: 0.083,
  ZAR: 0.22,
  NGN: 18.5,
  KES: 1.55,
  EGP: 0.58,
  MAD: 0.12,
  DZD: 1.6,
  PKR: 3.3,
  NPR: 1.6,
  LKR: 3.6,
  BDT: 1.4,
  AFN: 0.83,
  ALL: 1.1,
  ARS: 10.5,
  BRL: 0.064,
  COP: 48,
  KHR: 49,
  MXN: 0.2,
  LBP: 1070
};

const DEFAULT_CURRENCY = 'INR';

function normalizeAuthUser(user) {
  if (!user) return null;
  return {
    ...user,
    phoneCode: String(user.phoneCode || '').trim(),
    phoneNumber: String(user.phoneNumber || '').trim(),
    preferredLanguage: String(user.preferredLanguage || 'English').trim()
  };
}

function getUserCurrencyCode() {
  const { user } = getAuth();
  const phoneCode = String(user?.phoneCode || '').trim();
  if (!phoneCode) return DEFAULT_CURRENCY;

  const reversed = [...COUNTRY_PHONE_OPTIONS].reverse();
  const match = reversed.find(option => option.dialCode === phoneCode);
  return match ? match.currency : DEFAULT_CURRENCY;
}

function convertInrAmount(amountInInr) {
  const amount = Number(amountInInr || 0);
  const currency = getUserCurrencyCode();
  const rate = Number(INR_TO_CURRENCY[currency] || 1);
  return {
    amount: amount * rate,
    currency
  };
}

function formatAmountFromInr(amountInInr) {
  const converted = convertInrAmount(amountInInr);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: converted.currency,
      maximumFractionDigits: converted.currency === 'JPY' || converted.currency === 'KRW' || converted.currency === 'VND' || converted.currency === 'IDR' ? 0 : 2
    }).format(converted.amount);
  } catch (error) {
    return `${converted.currency} ${converted.amount.toFixed(2)}`;
  }
}

function populateCountryCodeSelect() {
  const select = document.getElementById('countryCodePreset');
  const manualInput = document.getElementById('countryCode');
  if (!select || !manualInput) return;

  select.innerHTML = '';
  COUNTRY_PHONE_OPTIONS.forEach((option) => {
    const el = document.createElement('option');
    el.value = option.dialCode;
    el.textContent = `${option.name} (${option.dialCode})`;
    if (option.dialCode === '+91') {
      el.selected = true;
    }
    select.appendChild(el);
  });

  if (!manualInput.value) {
    manualInput.value = select.value || '+91';
  }

  select.addEventListener('change', function () {
    if (select.value) manualInput.value = select.value;
  });
}

function getAuth() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('authUser');
  return { token, user: user ? normalizeAuthUser(JSON.parse(user)) : null };
}

function setAuth(token, user) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', JSON.stringify(normalizeAuthUser(user)));
  updateNavForAuth();
}

function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  updateNavForAuth();
}

function logoutUser(event) {
  if (event) event.preventDefault();
  clearAuth();
  window.location.href = 'index.html';
}

function updateNavForAuth() {
  const { token, user } = getAuth();
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  const logoutLink = document.getElementById('logoutLink');
  const adminLink = document.getElementById('adminLink');
  const userName = document.getElementById('userNameDisplay');

  if (loginLink) loginLink.style.display = token ? 'none' : 'inline-block';
  if (signupLink) signupLink.style.display = token ? 'none' : 'inline-block';
  if (logoutLink) logoutLink.style.display = token ? 'inline-block' : 'none';
  if (userName) userName.textContent = user ? `Hi, ${user.name || user.email}` : '';

  const authOnlyLinks = document.querySelectorAll(
    '.main-nav a[href="booking.html"], .main-nav a[href="history.html"]'
  );
  authOnlyLinks.forEach(link => {
    link.style.display = token ? 'inline-block' : 'none';
  });

  const cartLinks = document.querySelectorAll('.main-nav .cart-link, .main-nav .cart-icon');
  cartLinks.forEach(link => {
    link.style.display = token ? 'inline-flex' : 'none';
  });

  const isAdmin = Boolean(user && user.isAdmin);
  if (adminLink) {
    adminLink.style.display = isAdmin ? 'inline-block' : 'none';
    adminLink.href = 'admin-dashboard.html';
    adminLink.textContent = 'Add Product';
  }
}

function enforceAuthForPages() {
  const { token } = getAuth();
  const currentPage = window.location.pathname.split('/').pop();
  const protectedPages = ['booking.html', 'history.html'];

  if (!token && protectedPages.includes(currentPage)) {
    alert('Please sign up or login to access Booking and My Bookings.');
    window.location.href = 'login.html';
  }
}

// Initialize nav state early
window.addEventListener('DOMContentLoaded', updateNavForAuth);

// Cart Management
function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  saveCart(cart);
  alert(product.name + " added to cart!");
}

function updateQuantity(productId, newQuantity) {
  let cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    if (newQuantity <= 0) {
      cart = cart.filter(item => item.id !== productId);
    } else {
      item.quantity = newQuantity;
    }
    saveCart(cart);
    displayBooking();
  }
}

function removeFromCart(productId) {
  const cart = getCart();
  const filtered = cart.filter(item => item.id !== productId);
  saveCart(filtered);
  displayBooking();
}

function displayBooking() {
  const bookingList = document.getElementById("booking-list");
  const bookingSummary = document.getElementById("booking-summary");
  
  if (!bookingList || !bookingSummary) return;
  
  const cart = getCart();
  bookingList.innerHTML = "";
  
  let total = 0;
  
  if (cart.length === 0) {
    bookingList.innerHTML = "<li style='padding:10px 0; color:#6b7280;'>No items in cart</li>";
    bookingSummary.innerHTML = `Total: ${formatAmountFromInr(0)}`;
    return;
  }
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const li = document.createElement("li");
    li.className = "booking-item";
    li.innerHTML = `
      <div class="booking-item-info">
        <div class="booking-item-name">${item.name}</div>
        <div class="booking-item-price">${formatAmountFromInr(item.price)}</div>
      </div>
      <div class="booking-item-controls">
        <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
        <input type="number" class="qty-input" value="${item.quantity}" onchange="updateQuantity(${item.id}, parseInt(this.value))">
        <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
      </div>
      <div class="booking-item-total">${formatAmountFromInr(itemTotal)}</div>
      <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
    `;
    bookingList.appendChild(li);
  });
  
  bookingSummary.innerHTML = `<div style="font-size:1.3rem; color:var(--accent);">Total: ${formatAmountFromInr(total)}</div>`;
}

function clearBooking() {
  localStorage.removeItem("cart");
  displayBooking();
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) bookingForm.reset();
}

function submitBooking(event) {
  event.preventDefault();
  const cart = getCart();
  
  if (cart.length === 0) {
    alert("Please add items to cart before booking");
    return;
  }
  
  const formData = new FormData(document.getElementById("booking-form"));
  const email = formData.get("email");
  const booking = {
    items: cart,
    businessName: formData.get("businessName"),
    contactName: formData.get("contactName"),
    phone: formData.get("phone"),
    email: email,
    gst: formData.get("gst"),
    address: formData.get("address"),
    payment: formData.get("payment"),
    date: new Date().toISOString()
  };
  
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));
  
  // Store the email for easy reference in history
  if (email) {
    localStorage.setItem("lastBookingEmail", email);
  }
  
  localStorage.removeItem("cart");
  alert("Booking confirmed! Thank you for your order. You can view your history at My Bookings page.");
  window.location.href = "products.html";
}

async function submitLogin(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  if (!emailRegex.test(email)) {
    alert('Please enter a valid email with @ and domain (example: name@email.com).');
    return;
  }

  if (!passwordRegex.test(password)) {
    alert('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
    return;
  }

  const response = await fetch('/api/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.error || 'Login failed');
    return;
  }

  setAuth(data.token, data.user);
  if (data.user.isAdmin) {
    window.location.href = 'admin-dashboard.html';
  } else {
    window.location.href = 'products.html';
  }
}

async function submitSignup(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const confirm = form.confirmPassword.value.trim();
  const phoneCode = String(form.countryCode?.value || '').trim();
  const phoneNumber = String(form.phoneNumber?.value || '').trim();
  const preferredLanguage = String(form.preferredLanguage?.value || 'English').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const phoneRegex = /^\d{6,15}$/;

  if (!email || !password || !confirm || !phoneCode || !phoneNumber) {
    alert('Please complete all required fields.');
    return;
  }

  if (!phoneRegex.test(phoneNumber)) {
    alert('Please enter a valid phone number (6 to 15 digits).');
    return;
  }

  if (!emailRegex.test(email)) {
    alert('Please enter a valid email with @ and domain (example: name@email.com).');
    return;
  }

  if (!passwordRegex.test(password)) {
    alert('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
    return;
  }

  if (password !== confirm) {
    alert('Password and confirm password do not match.');
    return;
  }

  const response = await fetch('/api/user/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phoneCode, phoneNumber, preferredLanguage })
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.error || 'Signup failed');
    return;
  }

  setAuth(data.token, data.user);
  if (data.user.isAdmin) {
    window.location.href = 'admin-dashboard.html';
  } else {
    window.location.href = 'products.html';
  }
}

async function submitForgotPassword(event) {
  event.preventDefault();
  const form = event.target;
  const messageEl = document.getElementById('forgotPasswordMessage');
  const email = form.email.value.trim();

  if (!email) {
    if (messageEl) messageEl.textContent = 'Please enter your registered email.';
    return;
  }

  try {
    const response = await fetch('/api/user/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (!response.ok) {
      if (messageEl) messageEl.textContent = data.error || 'Could not process request.';
      return;
    }

    if (messageEl) {
      messageEl.textContent = data.devResetLink
        ? `Reset link (dev): ${data.devResetLink}`
        : (data.message || 'If this email is registered, a reset link has been sent.');
    }
  } catch (error) {
    if (messageEl) messageEl.textContent = 'Network error. Please try again.';
  }
}

async function submitResetPassword(event) {
  event.preventDefault();
  const form = event.target;
  const messageEl = document.getElementById('resetPasswordMessage');
  const email = form.email.value.trim();
  const token = form.token.value.trim();
  const password = form.password.value.trim();
  const confirmPassword = form.confirmPassword.value.trim();

  if (!email || !token || !password || !confirmPassword) {
    if (messageEl) messageEl.textContent = 'Please complete all fields.';
    return;
  }

  if (password !== confirmPassword) {
    if (messageEl) messageEl.textContent = 'New password and confirm password do not match.';
    return;
  }

  try {
    const response = await fetch('/api/user/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password })
    });

    const data = await response.json();
    if (!response.ok) {
      if (messageEl) messageEl.textContent = data.error || 'Password reset failed.';
      return;
    }

    if (messageEl) messageEl.textContent = data.message || 'Password reset successful. You can log in now.';
    form.reset();
  } catch (error) {
    if (messageEl) messageEl.textContent = 'Network error. Please try again.';
  }
}

function attachAuthForms() {
  const loginPanel = document.getElementById('loginPanel');
  const signupPanel = document.getElementById('signupPanel');
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showSignupBtn = document.getElementById('showSignupBtn');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordPanel = document.getElementById('forgotPasswordPanel');
  const resetPasswordPanel = document.getElementById('resetPasswordPanel');

  populateCountryCodeSelect();

  function setAuthMode(mode) {
    if (!loginPanel || !signupPanel || !showLoginBtn || !showSignupBtn) return;
    const isSignup = mode === 'signup';
    loginPanel.classList.toggle('active', !isSignup);
    signupPanel.classList.toggle('active', isSignup);
    showLoginBtn.classList.toggle('active', !isSignup);
    showSignupBtn.classList.toggle('active', isSignup);
  }

  if (showLoginBtn && showSignupBtn) {
    showLoginBtn.addEventListener('click', function () {
      setAuthMode('login');
      window.location.hash = 'login';
    });
    showSignupBtn.addEventListener('click', function () {
      setAuthMode('signup');
      window.location.hash = 'signup';
    });

    setAuthMode(window.location.hash === '#signup' ? 'signup' : 'login');
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', submitLogin);
  }
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', submitSignup);
  }

  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', submitForgotPassword);
  }

  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', submitResetPassword);
  }

  if (forgotPasswordLink && forgotPasswordPanel) {
    forgotPasswordLink.addEventListener('click', function (event) {
      event.preventDefault();
      const isVisible = forgotPasswordPanel.style.display === 'block';
      forgotPasswordPanel.style.display = isVisible ? 'none' : 'block';
    });
  }

  if (resetPasswordPanel) {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    const email = params.get('email');
    if (token) {
      resetPasswordPanel.style.display = 'block';
      const emailInput = document.getElementById('resetEmail');
      const tokenInput = document.getElementById('resetToken');
      if (emailInput && email) emailInput.value = email;
      if (tokenInput) tokenInput.value = token;
    }
  }

  const toggleButtons = document.querySelectorAll('[data-toggle-password]');
  toggleButtons.forEach(button => {
    button.addEventListener('click', function () {
      const targetId = button.getAttribute('data-toggle-password');
      const input = document.getElementById(targetId);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.textContent = show ? 'Hide' : 'Show';
    });
  });
}

function initUiEnhancements() {
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealTargets = document.querySelectorAll(
    'main section, .page-content, .auth-card, .booking-summary, #booking-form'
  );
  if (!revealTargets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((el) => {
    if (!el.classList.contains('visible')) {
      el.classList.add('section-reveal');
      observer.observe(el);
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  enforceAuthForPages();
  attachAuthForms();
  initUiEnhancements();
  // Display booking if on booking page
  if (document.getElementById("booking-list")) {
    displayBooking();
  }

  const container = document.getElementById("products-container");
  if (container) {
    let allProducts = [];
    let currentCategory = "all";

    const filterContainer = document.getElementById("categories-filter");
    const searchInput = document.getElementById("product-search");
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");
    const sortSelect = document.getElementById("sort-products");
    const inStockOnlyInput = document.getElementById("in-stock-only");
    const clearFiltersBtn = document.getElementById("clear-filters");
    const productsCount = document.getElementById("products-count");

    function normalizeText(value) {
      return String(value || "").trim().toLowerCase();
    }

    function updateProductsCount(count) {
      if (!productsCount) return;
      productsCount.textContent = `${count} product${count === 1 ? "" : "s"} found`;
    }

    function setActiveCategory(category) {
      currentCategory = category;
      document.querySelectorAll(".category-btn[data-category]").forEach(button => {
        button.classList.toggle("active", button.getAttribute("data-category") === category);
      });
    }

    fetch("/api/products")
      .then(response => {
        if (!response.ok) {
          throw new Error("HTTP error! status: " + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log("Products loaded:", data.length);
        allProducts = data;

        if (!data || data.length === 0) {
          container.innerHTML = "<p>No products available</p>";
          return;
        }

        const categories = [...new Set(data.map(p => p.category))].sort((a, b) => a.localeCompare(b));

        if (filterContainer) {
          filterContainer.innerHTML = '<li><button class="category-btn active" data-category="all">All Products</button></li>';
          categories.forEach(category => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.className = "category-btn";
            btn.textContent = category;
            btn.setAttribute("data-category", category);
            li.appendChild(btn);
            filterContainer.appendChild(li);
          });

          filterContainer.addEventListener("click", function(event) {
            const button = event.target.closest(".category-btn[data-category]");
            if (!button) return;
            setActiveCategory(button.getAttribute("data-category"));
            applyFilters();
          });
        }

        if (searchInput) searchInput.addEventListener("input", applyFilters);
        if (minPriceInput) minPriceInput.addEventListener("input", applyFilters);
        if (maxPriceInput) maxPriceInput.addEventListener("input", applyFilters);
        if (sortSelect) sortSelect.addEventListener("change", applyFilters);
        if (inStockOnlyInput) inStockOnlyInput.addEventListener("change", applyFilters);
        if (clearFiltersBtn) {
          clearFiltersBtn.addEventListener("click", function() {
            if (searchInput) searchInput.value = "";
            if (minPriceInput) minPriceInput.value = "";
            if (maxPriceInput) maxPriceInput.value = "";
            if (sortSelect) sortSelect.value = "default";
            if (inStockOnlyInput) inStockOnlyInput.checked = false;
            setActiveCategory("all");
            applyFilters();
          });
        }

        applyFilters();
      })
      .catch(error => {
        console.error("Product loading error:", error);
        container.innerHTML = "<p>Error loading products. Please try again.</p>";
      });

    function displayProducts(productsToDisplay) {
      container.innerHTML = "";

      if (!productsToDisplay.length) {
        container.innerHTML = "<p class='no-results'>No products match these filters.</p>";
        updateProductsCount(0);
        return;
      }

      updateProductsCount(productsToDisplay.length);

      productsToDisplay.forEach((product) => {
        const card = document.createElement("article");
        card.classList.add("product-card");

        // Create image container wrapper
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("product-image-box", "catalog-image-box");
        const img = document.createElement("img");
        img.src = product.image;
        img.alt = product.name;
        img.loading = "lazy";
        img.decoding = "async";
        img.onerror = function() {
          this.src = "/images/01_plate.svg";
        };
        imgWrapper.appendChild(img);
        card.appendChild(imgWrapper);

        const title = document.createElement("h3");
        title.textContent = product.name;
        card.appendChild(title);

        const price = document.createElement("p");
        price.classList.add("price");
        price.textContent = formatAmountFromInr(product.price);
        card.appendChild(price);

        const desc = document.createElement("p");
        desc.classList.add("desc");
        desc.textContent = product.desc;
        card.appendChild(desc);

        const button = document.createElement("button");
        button.className = "btn primary";
        button.style.margin = "0 12px 12px 12px";
        button.textContent = "Add to Cart";
        button.addEventListener("click", function() {
          addToCart(product);
        });
        card.appendChild(button);

        container.appendChild(card);
      });
    }

    function applyFilters() {
      const searchTerm = normalizeText(searchInput ? searchInput.value : "");
      const minPrice = minPriceInput && minPriceInput.value !== "" ? Number(minPriceInput.value) : null;
      const maxPrice = maxPriceInput && maxPriceInput.value !== "" ? Number(maxPriceInput.value) : null;
      const sortBy = sortSelect ? sortSelect.value : "default";
      const inStockOnly = Boolean(inStockOnlyInput && inStockOnlyInput.checked);

      let filtered = allProducts.filter(product => {
        const categoryMatch = currentCategory === "all" || product.category === currentCategory;
        if (!categoryMatch) return false;

        if (searchTerm) {
          const searchable = `${product.name} ${product.desc || ""} ${product.category || ""}`.toLowerCase();
          if (!searchable.includes(searchTerm)) return false;
        }

        const price = Number(product.price || 0);
        if (minPrice !== null && !Number.isNaN(minPrice) && price < minPrice) return false;
        if (maxPrice !== null && !Number.isNaN(maxPrice) && price > maxPrice) return false;

        if (inStockOnly) {
          const stock = Number(product.stock || 0);
          if (stock <= 0) return false;
        }

        return true;
      });

      if (sortBy === "price-low") filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      if (sortBy === "price-high") filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      if (sortBy === "name-asc") filtered.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      if (sortBy === "name-desc") filtered.sort((a, b) => String(b.name || "").localeCompare(String(a.name || "")));

      displayProducts(filtered);
    }
  }
});

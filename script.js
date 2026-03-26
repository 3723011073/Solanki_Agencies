// Auth helpers

function getAuth() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('authUser');
  return { token, user: user ? JSON.parse(user) : null };
}

function setAuth(token, user) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', JSON.stringify(user));
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
  const cart = getCart();
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
    bookingSummary.innerHTML = "Total: ₹0";
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
        <div class="booking-item-price">₹${item.price.toLocaleString()}</div>
      </div>
      <div class="booking-item-controls">
        <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
        <input type="number" class="qty-input" value="${item.quantity}" onchange="updateQuantity(${item.id}, parseInt(this.value))">
        <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
      </div>
      <div class="booking-item-total">₹${itemTotal.toLocaleString()}</div>
      <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
    `;
    bookingList.appendChild(li);
  });
  
  bookingSummary.innerHTML = `<div style="font-size:1.3rem; color:var(--accent);">Total: ₹${total.toLocaleString()}</div>`;
}

function clearBooking() {
  localStorage.removeItem("cart");
  displayBooking();
  document.getElementById("booking-form").reset();
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

  if (!email || !password) {
    alert('Please enter both email and password.');
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

  if (!email || !password || !confirm) {
    alert('Please complete all required fields.');
    return;
  }
  if (password !== confirm) {
    alert('Password and confirm password do not match.');
    return;
  }

  const response = await fetch('/api/user/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
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

function attachAuthForms() {
  const loginPanel = document.getElementById('loginPanel');
  const signupPanel = document.getElementById('signupPanel');
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showSignupBtn = document.getElementById('showSignupBtn');

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

        const categories = [...new Set(data.map(p => p.category))];
        const filterContainer = document.getElementById("categories-filter");

        categories.forEach(category => {
          const li = document.createElement("li");
          const btn = document.createElement("button");
          btn.className = "category-btn";
          btn.textContent = category;
          btn.setAttribute("data-category", category);
          btn.addEventListener("click", function() {
            filterProducts(this.getAttribute("data-category"));
            document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
          });
          li.appendChild(btn);
          if (filterContainer) {
            filterContainer.appendChild(li);
          }
        });

        displayProducts(data);
      })
      .catch(error => {
        console.error("Product loading error:", error);
        container.innerHTML = "<p>Error loading products. Please try again.</p>";
      });

    function displayProducts(productsToDisplay) {
      container.innerHTML = "";

      productsToDisplay.forEach((product) => {
        const card = document.createElement("article");
        card.classList.add("product-card");

        // Create image container wrapper
        const imgWrapper = document.createElement("div");
        imgWrapper.classList.add("product-image-box");
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
        price.textContent = "₹" + product.price;
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

    function filterProducts(category) {
      if (category === "all") {
        displayProducts(allProducts);
      } else {
        const filtered = allProducts.filter(p => p.category === category);
        displayProducts(filtered);
      }
    }
  }
});

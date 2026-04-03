// ========================================
// ========================================
// AUTOMATION LEARN - Main JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initSmoothScroll();
  checkAuthStateAndUpdateNav();
});

const NAV_REQUESTS_SYNC_KEY = 'automatelearn:learn-request-sync';
const NAV_PENDING_COUNT_KEY = 'automatelearn:pending-request-count';
const STAFF_BADGE_REFRESH_MS = 10000;
let staffBadgeRefreshId = null;

// ---- Theme Toggle ----
function initThemeToggle() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Update all toggle buttons on the page
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = savedTheme === 'light' ? '' : '';
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      document.querySelectorAll('.theme-toggle').forEach(b => {
        b.textContent = next === 'light' ? '' : '';
      });
    });
  });
}

// ---- Header Scroll Effect ----
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });
}

// ---- Mobile Menu ----
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
      menuBtn.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });
}

// ---- Scroll Animations ----
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

// ---- Smooth Scroll ----
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ---- Active Nav Link ----
function setActiveNav() {
  const currentPath = window.location.pathname.toLowerCase();
  const standalonePracticePaths = new Set(['/checkbox', '/fileupload']);

  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    const isHome = currentPath === '/' && href === '/';
    const isLearn = currentPath === '/learn' && href === '/learn';
    const isStaff = currentPath === '/staff' && href === '/staff';
    const isAdmin = currentPath === '/admin' && href === '/admin';
    const isLogin = currentPath === '/login' && href === '/login';
    const isProfile = currentPath === '/profile' && href === '/login';
    const isPracticeSection = (
      currentPath === '/practice' ||
      currentPath.startsWith('/practice-') ||
      standalonePracticePaths.has(currentPath)
    ) && href === '/practice';

    if (isHome || isLearn || isStaff || isAdmin || isLogin || isProfile || isPracticeSection) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Run active nav on load
setActiveNav();

// ---- Auth State Nav Update ----
async function checkAuthStateAndUpdateNav() {
  const loginBtn = document.getElementById('navLoginBtn');
  const staffBtn = document.getElementById('navStaffBtn');
  const adminBtn = document.getElementById('navAdminBtn');
  if (!loginBtn) return;

  applyCachedAuthState(loginBtn, adminBtn, staffBtn);

  try {
    const res = await fetch('/api/auth/session', {
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();

      if (data.authenticated) {
        if (data.user) {
          localStorage.setItem('authUser', JSON.stringify(data.user));
        }
        applyAuthenticatedNav(loginBtn, adminBtn, staffBtn, data.user || {});
        initStaffBadgeLiveSync(data.user || {});
      } else {
        clearCachedAuthState();
        applyLoggedOutNav(loginBtn, adminBtn, staffBtn);
      }
      return;
    }

    clearCachedAuthState();
    applyLoggedOutNav(loginBtn, adminBtn, staffBtn);
  } catch (error) {
    console.error('Error checking auth session:', error);
  }
}

function applyCachedAuthState(loginBtn, adminBtn, staffBtn) {
  try {
    const cachedUser = JSON.parse(localStorage.getItem('authUser') || 'null');
    if (!cachedUser || !cachedUser.email) {
      applyLoggedOutNav(loginBtn, adminBtn, staffBtn);
      return;
    }

    applyAuthenticatedNav(loginBtn, adminBtn, staffBtn, cachedUser);
  } catch (error) {
    applyLoggedOutNav(loginBtn, adminBtn, staffBtn);
  }
}

function applyAuthenticatedNav(loginBtn, adminBtn, staffBtn, user) {
  loginBtn.textContent = 'Profile';
  loginBtn.href = '/profile';

  if (staffBtn) {
    const canViewStaff = ['admin', 'staff'].includes(user.role);
    staffBtn.hidden = !canViewStaff;
    staffBtn.style.display = canViewStaff ? 'inline-flex' : 'none';
  }

  if (adminBtn) {
    const canViewAdmin = user.role === 'admin';
    adminBtn.hidden = !canViewAdmin;
    adminBtn.style.display = canViewAdmin ? 'inline-flex' : 'none';
  }
}

function applyLoggedOutNav(loginBtn, adminBtn, staffBtn) {
  loginBtn.textContent = 'Login';
  loginBtn.href = '/login';

  if (staffBtn) {
    staffBtn.hidden = true;
    staffBtn.style.display = 'none';
  }

  if (adminBtn) {
    adminBtn.hidden = true;
    adminBtn.style.display = 'none';
  }

  updateStaffPendingBadge(0, false);
}

function fetchNoStoreJson(url, options = {}) {
  return fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      'Cache-Control': 'no-cache',
      ...(options.headers || {}),
    },
  });
}

function initStaffBadgeLiveSync(user) {
  if (!user || !['admin', 'staff'].includes(user.role)) {
    updateStaffPendingBadge(0, false);
    return;
  }

  const cachedCount = Number(localStorage.getItem(NAV_PENDING_COUNT_KEY) || '0');
  if (cachedCount > 0) {
    updateStaffPendingBadge(cachedCount, true);
  }

  refreshStaffPendingBadge();

  if (!staffBadgeRefreshId) {
    staffBadgeRefreshId = window.setInterval(() => {
      if (!document.hidden) {
        refreshStaffPendingBadge();
      }
    }, STAFF_BADGE_REFRESH_MS);
  }

  if (!window.__staffBadgeSyncBound) {
    window.__staffBadgeSyncBound = true;

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        refreshStaffPendingBadge();
      }
    });

    window.addEventListener('focus', () => {
      refreshStaffPendingBadge();
    });

    window.addEventListener('storage', (event) => {
      if (event.key === NAV_REQUESTS_SYNC_KEY) {
        refreshStaffPendingBadge();
      }
      if (event.key === NAV_PENDING_COUNT_KEY) {
        const nextCount = Number(event.newValue || '0');
        updateStaffPendingBadge(nextCount, nextCount > 0);
      }
    });

    window.addEventListener('learn-request-sync', () => {
      refreshStaffPendingBadge();
    });
  }
}

async function refreshStaffPendingBadge() {
  const user = getCachedAuthUser();
  if (!user || !['admin', 'staff'].includes(user.role)) {
    updateStaffPendingBadge(0, false);
    return;
  }

  try {
    const response = await fetchNoStoreJson('/api/staff/learn/requests', {
      credentials: 'include',
    });
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const requests = Array.isArray(data.requests) ? data.requests : [];
    const pendingCount = requests.filter((item) => String(item.status || '').toLowerCase() === 'pending').length;
    localStorage.setItem(NAV_PENDING_COUNT_KEY, String(pendingCount));
    updateStaffPendingBadge(pendingCount, pendingCount > 0);
  } catch (error) {
    console.error('Could not refresh pending staff badge.', error);
  }
}

function updateStaffPendingBadge(count, show) {
  const staffBtn = document.getElementById('navStaffBtn');
  if (!staffBtn) {
    return;
  }

  let badge = document.getElementById('navStaffRequestBadge');
  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'navStaffRequestBadge';
    badge.className = 'nav-count-badge';
    badge.hidden = true;
    staffBtn.appendChild(badge);
  }

  if (!show || count <= 0) {
    badge.hidden = true;
    badge.style.display = 'none';
    badge.textContent = '0';
    return;
  }

  badge.hidden = false;
  badge.removeAttribute('hidden');
  badge.style.display = 'inline-flex';
  badge.textContent = count > 99 ? '99+' : String(count);
}

window.refreshStaffPendingBadge = refreshStaffPendingBadge;
window.updateStaffPendingBadge = updateStaffPendingBadge;

function clearCachedAuthState() {
  localStorage.removeItem('authUser');
  localStorage.removeItem('authSession');
}

// 🔐 Check login
async function isLoggedIn() {
    const cachedUser = getCachedAuthUser();
    if (cachedUser) {
        return true;
    }

    try {
        const res = await fetch('/api/auth/session', {
            credentials: 'include'
        });

        if (!res.ok) {
            clearCachedAuthState();
            return false;
        }

        const data = await res.json();
        if (data.authenticated && data.user) {
            localStorage.setItem('authUser', JSON.stringify(data.user));
            return true;
        }

        clearCachedAuthState();
        return false;
    } catch {
        return false;
    }
}

// 🔥 Handle button click
async function handleSampleClick(el) {
    if (getCachedAuthUser()) {
        toggleSampleCode(el); // your existing function
        return;
    }

    const loggedIn = await isLoggedIn();

    if (loggedIn) {
        toggleSampleCode(el); // your existing function
    } else {
        showLoginPopup();
    }
}

// 🎯 Attach event to ALL buttons
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".sample-code-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", function () {
            handleSampleClick(this);
        });
    });

    createLoginPopup(); // create popup once
});


// 🔥 CREATE POPUP DYNAMICALLY
function createLoginPopup() {
    if (document.getElementById("loginPopup")) return;

    const popup = document.createElement("div");
    popup.id = "loginPopup";
    popup.className = "login-popup";

    popup.innerHTML = `
        <div class="popup-box">
            <span class="popup-close" onclick="closePopup()">✖</span>
            <h3>Login Required</h3>
            <p>You must login to view this content.</p>
            <button class="practice-btn practice-btn-blue" onclick="goToLogin()">Login</button>
        </div>
    `;

    document.body.appendChild(popup);
}


// 🔥 SHOW POPUP
function showLoginPopup() {
    const popup = document.getElementById("loginPopup");
    popup.style.display = "flex";

    setTimeout(() => {
        popup.style.display = "none";
    }, 5000);
}


// ❌ CLOSE
function closePopup() {
    document.getElementById("loginPopup").style.display = "none";
}


// 🔗 REDIRECT
function goToLogin() {
    window.location.href = "/login";
}


// 🖱 OUTSIDE CLICK CLOSE
window.addEventListener("click", function(e) {
    const popup = document.getElementById("loginPopup");
    if (popup && e.target === popup) {
        popup.style.display = "none";
    }
});

async function redirectLoggedInUser() {
    const currentPath = window.location.pathname.toLowerCase();
    const allowedRedirectPaths = new Set([
        '/login',
        '/login.html',
        '/register',
        '/register.html'
    ]);

    if (!allowedRedirectPaths.has(currentPath)) {
        return;
    }

    if (getCachedAuthUser()) {
        window.location.replace('/profile');
        return;
    }

    const loggedIn = await isLoggedIn();
    if (loggedIn) {
        window.location.replace('/profile');
    }
}

function getCachedAuthUser() {
    try {
        const cachedUser = JSON.parse(localStorage.getItem('authUser') || 'null');
        if (!cachedUser || !cachedUser.email) {
            return null;
        }

        return cachedUser;
    } catch {
        return null;
    }
}

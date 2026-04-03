// Shared site layout for pages that use the common header and footer.
(function renderSharedLayout() {
  const currentPage = getCurrentPage(window.location.pathname);
  const activeSection = getActiveSection(currentPage);

  const headerMount = document.getElementById('siteHeader');
  const footerMount = document.getElementById('siteFooter');
  const practiceNavMount = document.getElementById('practiceNav');
  const learnSidebarMount = document.getElementById('learnSidebarMount');

  if (headerMount) {
    headerMount.outerHTML = buildHeader(activeSection);
  }

  if (footerMount) {
    footerMount.outerHTML = buildFooter();
  }

  if (practiceNavMount) {
    practiceNavMount.outerHTML = buildPracticeNav(currentPage);
  }

  if (learnSidebarMount) {
    learnSidebarMount.outerHTML = buildLearnSidebar();
  }

  function getCurrentPage(pathname) {
    const page = (pathname.split('/').pop() || '').toLowerCase();

    if (!page) {
      return 'index.html';
    }

    return page.endsWith('.html') ? page : `${page}.html`;
  }

  function getActiveSection(page) {
    if (!page || page === 'index.html') {
      return 'home';
    }

    if (page === 'learn.html') {
      return 'learn';
    }

    if (page === 'admin.html') {
      return 'admin';
    }

    if (page === 'staff.html') {
      return 'staff';
    }

    if (page === 'login.html') {
      return 'login';
    }

    if (page === 'register.html') {
      return 'register';
    }

    if (
      page === 'practice.html' ||
      page.startsWith('practice-') ||
      page === 'checkbox.html' ||
      page === 'fileupload.html'
    ) {
      return 'practice';
    }

    if (page === 'profile.html') {
      return 'profile';
    }

    return '';
  }

  function buildHeader(active) {
    return `
      <header class="header" id="header">
        <div class="header-inner">
          <a href="/" class="logo">
            <div class="logo-icon"></div>
            <span>AutomateLearn</span>
          </a>
          <nav class="nav-links" id="navLinks">
            <a href="/" class="${active === 'home' ? 'active' : ''}">Home</a>
            <a href="/learn" class="${active === 'learn' ? 'active' : ''}">Learn</a>
            <a href="/practice" class="${active === 'practice' ? 'active' : ''}">Practice Lab</a>
            <a href="/staff" class="${active === 'staff' ? 'active' : ''}" id="navStaffBtn" hidden>
              <span>Staff</span>
              <span class="nav-count-badge" id="navStaffRequestBadge" hidden>0</span>
            </a>
            <a href="/admin" class="${active === 'admin' ? 'active' : ''}" id="navAdminBtn" hidden>Admin</a>
            <a href="/login" class="${active === 'login' || active === 'profile' ? 'active' : ''}" id="navLoginBtn">Login</a>
          </nav>
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme"></button>
          <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
    `;
  }

  function buildFooter() {
    return `
      <footer class="footer">
        <div class="footer-inner">
          <p>&copy; 2026 AutomateLearn Built for Selenium learners</p>
          <div class="footer-links">
            <a href="/">Home</a>
            <a href="/learn">Learn</a>
            <a href="/practice">Practice</a>
          </div>
        </div>
      </footer>
    `;
  }

  function buildPracticeNav(page) {
    const links = [
      ['/practice', 'practice.html', 'All'],
      ['/checkbox', 'checkbox.html', 'Checkbox'],
      ['/practice-forms', 'practice-forms.html', 'Forms'],
      ['/fileupload', 'fileupload.html', 'File Upload'],
      ['/practice-dropdown', 'practice-dropdown.html', '&#9662; Dropdown'],
      ['/practice-suggestion', 'practice-suggestion.html', '&#128161; Suggestion Box'],
      ['/practice-alerts', 'practice-alerts.html', 'Alerts'],
      ['/practice-popup', 'practice-popup.html', 'Popup'],
      ['/practice-radio-button', 'practice-radio-button.html', 'Radio Buttons'],
      ['/practice-scroll', 'practice-scroll.html', 'Scroll'],
      ['/practice-windows', 'practice-windows.html', 'Windows'],
      ['/practice-waits', 'practice-waits.html', 'Waits'],
      ['/practice-text', 'practice-text.html', 'Get Text'],
      ['/practice-clicks', 'practice-clicks.html', 'Clicks'],
      ['/practice-dragdrop', 'practice-dragdrop.html', 'Drag & Drop'],
      ['/practice-iframe', 'practice-iframe.html', 'iFrame'],
      ['/practice-screenshot', 'practice-screenshot.html', 'Screenshot'],
      ['/practice-calendar', 'practice-calendar.html', 'Calendar'],
      ['/practice-table', 'practice-table.html', 'Table'],
      ['/practice-advanced', 'practice-advanced.html', 'Advanced']

    ];

    const navItems = links.map(([href, fileName, label]) => `
      <a class="practice-nav-btn ${page === fileName ? 'active' : ''}" href="${href}">${label}</a>
    `).join('');

    return `
      <div class="practice-nav">
        ${navItems}
      </div>
    `;
  }

  function buildLearnSidebar() {
    return `
      <aside class="learn-sidebar" id="learnSidebar">
        <div class="sidebar-title"><span class="sidebar-link-icon">&#128218;</span> Learning Path</div>
        <nav class="sidebar-nav">
          <div class="sidebar-link active" data-topic="java" onclick="switchTopic('java')">
            <span class="sidebar-link-icon">&#9749;</span>
            Java Basics
            <span class="sidebar-link-number">01</span>
          </div>
          <div class="sidebar-link" data-topic="selenium" onclick="switchTopic('selenium')">
            <span class="sidebar-link-icon">&#127760;</span>
            Selenium WebDriver
            <span class="sidebar-link-number">02</span>
          </div>
          <div class="sidebar-link" data-topic="testng" onclick="switchTopic('testng')">
            <span class="sidebar-link-icon">&#129514;</span>
            TestNG Framework
            <span class="sidebar-link-number">03</span>
          </div>
          <div class="sidebar-link" data-topic="maven" onclick="switchTopic('maven')">
            <span class="sidebar-link-icon">&#128230;</span>
            Maven
            <span class="sidebar-link-number">04</span>
          </div>
          <div class="sidebar-link" data-topic="extent" onclick="switchTopic('extent')">
            <span class="sidebar-link-icon">&#128202;</span>
            Extent Reports
            <span class="sidebar-link-number">05</span>
          </div>
          <div class="sidebar-link" data-topic="eclipse" onclick="switchTopic('eclipse')">
            <span class="sidebar-link-icon"><svg width="20" height="20" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="60" cy="50" r="35"></circle>
              <rect x="25" y="42" width="70" height="4" fill="white"></rect>
              <rect x="25" y="50" width="70" height="4" fill="white"></rect>
              <rect x="25" y="58" width="70" height="4" fill="white"></rect>
              <path d="M25 10 A40 40 0 0 0 25 90 A35 35 0 0 1 25 10Z"></path>
            </svg></span>
            Eclipse IDE
            <span class="sidebar-link-number">06</span>
          </div>
          <div class="sidebar-link" data-topic="pom" onclick="switchTopic('pom')">
            <span class="sidebar-link-icon">&#127959;&#65039;</span>
            POM Design Pattern
            <span class="sidebar-link-number">07</span>
          </div>
        </nav>
      </aside>
    `;
  }
})();

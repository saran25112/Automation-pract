// ========================================
// AUTOMATION LEARN - Practice Lab JS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initPracticeNav();
  initDropdownPractice();
  initSuggestionPractice();
  initDummyLoginPractice();
  initCalendarWidgets();
  initCompactCalendarPage();
  loadImplicitWaitElement();
  updateScreenshotTimestamp();
  initDragAndDrop();
  resetPracticeFrame();
});

// ---- Practice Nav Tabs ----
function initPracticeNav() {
  const navBtns = document.querySelectorAll('.practice-nav-btn');
  navBtns.forEach(btn => {
    if (btn.hasAttribute('href')) return;

    btn.addEventListener('click', () => {
      const target = btn.dataset.section;

      // Update active button
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide sections
      document.querySelectorAll('.practice-section').forEach(sec => {
        if (target === 'all' || sec.dataset.category === target) {
          sec.style.display = 'block';
          sec.style.animation = 'fadeInUp 0.4s ease';
        } else {
          sec.style.display = 'none';
        }
      });
    });
  });
}

// ========================================
// DROPDOWN
// ========================================
function initDropdownPractice() {
  const singleSelect = document.getElementById('singleSelectDropdown');
  const multiSelect = document.getElementById('multiSelectDropdown');
  const singleResult = document.getElementById('singleDropdownResult');
  const multiResult = document.getElementById('multiDropdownResult');

  if (singleSelect && singleResult) {
    singleSelect.addEventListener('change', () => {
      const label = singleSelect.options[singleSelect.selectedIndex].text;
      if (!singleSelect.value) {
        singleResult.textContent = 'No option selected yet.';
        singleResult.classList.remove('show');
        return;
      }

      singleResult.textContent = `Selected: ${label}`;
      singleResult.classList.add('show');
      addLog(`Single dropdown changed to ${label}`);
    });
  }

  if (multiSelect && multiResult) {
    multiSelect.addEventListener('change', () => {
      const selected = Array.from(multiSelect.selectedOptions).map((option) => option.text);
      if (!selected.length) {
        multiResult.textContent = 'No items selected yet.';
        multiResult.classList.remove('show');
        return;
      }

      multiResult.textContent = `Selected items: ${selected.join(', ')}`;
      multiResult.classList.add('show');
      addLog(`Multi-select updated with ${selected.length} item(s)`);
    });
  }
}

// ========================================
// SUGGESTION BOX
// ========================================
function initSuggestionPractice() {
  const input = document.getElementById('suggestionInput');
  const results = document.getElementById('suggestionResults');
  const selected = document.getElementById('suggestionSelected');

  if (!input || !results || !selected) return;

  const suggestions = [
    'Selenium WebDriver',
    'Selenium Grid',
    'Selenium IDE',
    'Java',
    'JavaScript',
    'TestNG',
    'Maven',
    'Extent Reports',
    'Page Object Model',
    'ChromeDriver',
    'XPath',
    'CSS Selector',
    'JUnit',
'Cucumber',
'BDD',
'TDD',
'REST API',
'SOAP API',
'Postman',
'RestAssured',
'JSON',
'XML',
'Git',
'GitHub',
'GitLab',
'Bitbucket',
'Jenkins',
'CI/CD',
'Docker',
'Kubernetes',
'Agile',
'Scrum',
'Kanban',
'Jira',
'Bugzilla',
'TestRail',
'Test Case Design',
'Test Plan',
'Test Strategy',
'Regression Testing',
'Smoke Testing',
'Sanity Testing',
'Functional Testing',
'Non-Functional Testing',
'Performance Testing',
'Load Testing',
'Stress Testing',
'Security Testing',
'Accessibility Testing',
'Cross Browser Testing',
'Mobile Testing',
'Appium',
'Android Testing',
'iOS Testing',
'Espresso',
'XCUITest',
'Hybrid Testing',
'Cloud Testing',
'Sauce Labs',
'BrowserStack',
'LambdaTest',
'Playwright',
'Cypress',
'Protractor',
'Nightwatch',
'WebdriverIO',
'Puppeteer',
'Robot Framework',
'Serenity BDD',
'Gauge Framework',
'Karate Framework',
'Selenide',
'FluentWait',
'Implicit Wait',
'Explicit Wait',
'Synchronization',
'Test Data Management',
'Data Driven Testing',
'Keyword Driven Testing',
'Hybrid Framework',
'Framework Design',
'Logging',
'Log4j',
'SLF4J',
'Allure Reports',
'Extent Spark Reports',
'HTML Reports',
'TestNG Annotations',
'JUnit Annotations',
'Assertions',
'Soft Assertions',
'Hard Assertions',
'Parallel Testing',
'ThreadLocal',
'Grid Execution',
'RemoteWebDriver',
'DesiredCapabilities',
'Options Class',
'Headless Testing',
'Chrome Options',
'Firefox Options',
'Edge Driver',
'Safari Driver',
'Locators',
'ID Locator',
'Name Locator',
'ClassName Locator',
'TagName Locator',
'LinkText',
'PartialLinkText',
'Dynamic XPath',
'Relative XPath',
'Absolute XPath',
'CSS Selectors Advanced',
'DOM Structure',
'Shadow DOM',
'iFrame Handling',
'Window Handling',
'Alert Handling',
'Actions Class',
'Robot Class',
'Keyboard Actions',
'Mouse Actions',
'Drag and Drop',
'Double Click',
'Right Click',
'Hover Action',
'Scrolling',
'Java Streams',
'Collections Framework',
'Exception Handling',
'Try Catch',
'Throws Keyword',
'File Handling',
'Properties File',
'Config Reader',
'Environment Variables',
'Build Tools',
'Gradle',
'Ant',
'Dependency Management',
'Version Control',
'Branching Strategy',
'Merge Conflict',
'Pull Request',
'Code Review',
'Static Code Analysis',
'SonarQube',
'Code Coverage',
'JaCoCo',
'Test Execution',
'Test Suites',
'TestNG XML',
'Retry Analyzer',
'Listeners',
'Annotations',
'Hooks',
'BeforeClass',
'AfterClass',
'BeforeMethod',
'AfterMethod',
'BeforeSuite',
'AfterSuite',
'BeforeTest',
'AfterTest',
'Cucumber Hooks',
'Step Definitions',
'Feature Files',
'Gherkin Language',
'Scenarios',
'Scenario Outline',
'Data Tables',
'Tags',
'Reports Integration',
'CI Pipeline',
'CD Pipeline',
'Artifact Management',
'Nexus',
'Artifactory',
'Cloud Grid',
'Virtual Machines',
'Containers',
'Microservices Testing',
'API Automation',
'Contract Testing',
'Mocking',
'Stubbing',
'WireMock',
'Test Doubles',
'Unit Testing',
'Integration Testing',
'System Testing',
'End to End Testing',
'Exploratory Testing',
'Boundary Value Analysis',
'Equivalence Partitioning',
'Decision Table Testing',
'State Transition Testing',
'Error Handling',
'Logging Framework',
'Debugging',
'IDE Tools',
'Eclipse',
'IntelliJ IDEA',
'VS Code',
'Command Line',
'Terminal Usage',
'Shell Scripting',
'Batch Scripting',
'PowerShell',
'Linux Basics',
'Unix Commands',
'Networking Basics',
'HTTP Protocol',
'HTTPS',
'Status Codes',
'Authentication',
'Authorization',
'OAuth',
'JWT',
'Cookies',
'Sessions',
'Caching',
'Performance Monitoring',
'New Relic',
'Grafana',
'Prometheus'
  ];

  function renderSuggestions(items) {
    results.innerHTML = '';

    if (!items.length) {
      results.innerHTML = '<div class="text-element">No matching suggestion found.</div>';
      return;
    }

    items.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'practice-btn practice-btn-blue';
      button.style.margin = '0 0 10px 0';
      button.style.width = '100%';
      button.style.justifyContent = 'flex-start';
      button.textContent = item;
      button.addEventListener('click', () => {
        input.value = item;
        results.innerHTML = '';
        selected.textContent = `Selected suggestion: ${item}`;
        selected.classList.add('show');
        addLog(`Suggestion selected: ${item}`);
      });
      results.appendChild(button);
    });
  }

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();

    if (!query) {
      results.innerHTML = '';
      selected.textContent = 'Start typing to view suggestions.';
      selected.classList.remove('show');
      return;
    }

    const filtered = suggestions.filter((item) => item.toLowerCase().includes(query));
    renderSuggestions(filtered);
    addLog(`Suggestion search updated for "${input.value.trim()}"`);
  });
}

// ========================================
// FORMS
// ========================================
function submitRegistrationForm() {
  const form = document.getElementById('registrationForm');
  const result = document.getElementById('formResult');

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const gender = document.querySelector('input[name="gender"]:checked');
  const country = document.getElementById('country').value;
  const hobbies = document.querySelectorAll('input[name="hobby"]:checked');
  const message = document.getElementById('registrationMessage').value;

  // Simple validation
  if (!firstName || !lastName || !email) {
    result.textContent = 'Error: Please fill in all required fields (First Name, Last Name, Email).';
    result.style.borderColor = 'rgba(251, 146, 60, 0.3)';
    result.style.background = 'rgba(251, 146, 60, 0.05)';
    result.style.color = '#fb923c';
    result.classList.add('show');
    addLog('Form validation failed - missing required fields');
    return;
  }

  const hobbyList = Array.from(hobbies).map(h => h.value).join(', ') || 'None';
  const genderVal = gender ? gender.value : 'Not specified';

  result.innerHTML = `
    Success: <strong>Form Submitted Successfully!</strong><br>
    <br>
    <strong>Name:</strong> ${firstName} ${lastName}<br>
    <strong>Email:</strong> ${email}<br>
    <strong>Phone:</strong> ${phone || 'N/A'}<br>
    <strong>Gender:</strong> ${genderVal}<br>
    <strong>Country:</strong> ${country || 'Not selected'}<br>
    <strong>Hobbies:</strong> ${hobbyList}<br>
    <strong>Message:</strong> ${message || 'N/A'}
  `;
  result.style.borderColor = 'rgba(0, 255, 136, 0.3)';
  result.style.background = 'rgba(0, 255, 136, 0.05)';
  result.style.color = '#00ff88';
  result.classList.add('show');
  addLog('Registration form submitted successfully');
}

function resetRegistrationForm() {
  document.getElementById('registrationForm').reset();
  const result = document.getElementById('formResult');
  result.classList.remove('show');
  addLog('Registration form reset');
}

function initDummyLoginPractice() {
  const form = document.getElementById('practiceDummyLoginForm');
  const usernameInput = document.getElementById('dummyUsername');
  const passwordInput = document.getElementById('dummyPassword');
  const result = document.getElementById('dummyLoginResult');
  const submitBtn = document.getElementById('dummyLoginSubmitBtn');
  const resetBtn = document.getElementById('dummyLoginResetBtn');
  const toggleBtn = document.getElementById('dummyPasswordToggle');

  if (!form || !usernameInput || !passwordInput || !result || !submitBtn || !resetBtn || !toggleBtn) {
    return;
  }

  const validUsername = 'admin';
  const validPassword = 'Admin@123';
  const developerUsername = 'saran2511';
  const developerPassword = 'Developer2020';

  function setDummyLoginResult(message, type) {
    result.innerHTML = message;
    result.classList.add('show');

    if (type === 'success') {
      result.style.borderColor = 'rgba(0, 255, 136, 0.3)';
      result.style.background = 'rgba(0, 255, 136, 0.05)';
      result.style.color = '#00ff88';
      return;
    }

    result.style.borderColor = 'rgba(251, 146, 60, 0.3)';
    result.style.background = 'rgba(251, 146, 60, 0.05)';
    result.style.color = '#fb923c';
  }

  function clearDummyLoginResult() {
    result.textContent = '';
    result.classList.remove('show');
    result.removeAttribute('style');
  }

  function handleDummyLoginSubmit() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      setDummyLoginResult('Error: Enter both username and password for this practice login.', 'error');
      addLog('Dummy login validation failed');
      return;
    }

    if (username === developerUsername && password === developerPassword) {
      fetch('/api/practice/developer-access', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Login to your account first, then use the secret practice login.');
            }

            throw new Error(data.detail || 'Developer access check failed.');
          }

          if (data.user) {
            localStorage.setItem('authUser', JSON.stringify(data.user));
          }

          setDummyLoginResult(
            'Success: <strong>Developer access granted.</strong><br><br>Opening developer page...',
            'success'
          );
          addLog('Dummy login secret developer access granted');

          window.setTimeout(() => {
            window.location.href = data.redirect_url || '/developer';
          }, 500);
        })
        .catch((error) => {
          setDummyLoginResult(`Error: ${error.message}`, 'error');
          addLog('Dummy login developer access request failed');
        });
      return;
    }

    if (username === validUsername && password === validPassword) {
      fetch('/api/practice/developer-access', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (data.user) {
            localStorage.setItem('authUser', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // The practice login can still succeed visually even if the access-reset request fails.
        })
        .finally(() => {
          setDummyLoginResult(
            'Success: <strong>Login successful.</strong><br><br><strong>Practice note:</strong> This is a dummy widget inside the forms page only.',
            'success'
          );
          addLog('Dummy login practice passed');
        });
      return;
    }

    fetch('/api/practice/developer-access', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (data.user) {
          localStorage.setItem('authUser', JSON.stringify(data.user));
        }

        if (response.status === 401) {
          throw new Error('Login to your account first, then use the secret practice login.');
        }
      })
      .catch(() => {
        // Keep the normal dummy-login failure message even if the access-reset request is unavailable.
      })
      .finally(() => {
        setDummyLoginResult(
          'Error: Invalid practice credentials. Try <strong>admin</strong> / <strong>Admin@123</strong>.',
          'error'
        );
        addLog('Dummy login practice failed');
      });
  }

  function handleDummyLoginReset() {
    form.reset();
    passwordInput.type = 'password';
    toggleBtn.textContent = 'Show';
    clearDummyLoginResult();
    addLog('Dummy login practice reset');
  }

  submitBtn.addEventListener('click', handleDummyLoginSubmit);
  form.addEventListener('submit', handleDummyLoginSubmit);
  resetBtn.addEventListener('click', handleDummyLoginReset);

  toggleBtn.addEventListener('click', () => {
    const shouldShowPassword = passwordInput.type === 'password';
    passwordInput.type = shouldShowPassword ? 'text' : 'password';
    toggleBtn.textContent = shouldShowPassword ? 'Hide' : 'Show';
    addLog(`Dummy login password ${shouldShowPassword ? 'revealed' : 'hidden'}`);
  });

  usernameInput.addEventListener('input', clearDummyLoginResult);
  passwordInput.addEventListener('input', clearDummyLoginResult);
}

// ========================================
// ALERTS
// ========================================
function triggerSimpleAlert() {
  addLog('Simple alert triggered');
  alert('This is a simple JavaScript alert!\n\nUse driver.switchTo().alert().accept() to handle this.');
}

function triggerConfirmAlert() {
  addLog('Confirm dialog triggered');
  const result = confirm('Do you want to continue?\n\nUse alert.accept() or alert.dismiss()');
  const resultEl = document.getElementById('alertResult');
  resultEl.textContent = result
    ? 'Success: You clicked OK (accept)'
    : 'Cancelled: You clicked Cancel (dismiss)';
  resultEl.classList.add('show');
}

function triggerPromptAlert() {
  addLog('Prompt dialog triggered');
  const result = prompt('Enter your name:', 'Selenium Learner');
  const resultEl = document.getElementById('alertResult');
  if (result !== null) {
    resultEl.textContent = `Success: You entered "${result}"`;
  } else {
    resultEl.textContent = 'Cancelled: Prompt was cancelled';
  }
  resultEl.classList.add('show');
}

// ========================================
// POPUP MODAL
// ========================================
let popupTimerId = null;

function openModal() {
  const modal = document.getElementById('practiceModal');
  const status = document.getElementById('popupStatus');
  const triggerBtn = document.getElementById('openRandomPopupBtn');

  if (!modal) return;

  clearTimeout(popupTimerId);
  modal.classList.add('show');

  if (status) {
    status.textContent = 'Popup opened. Read the popup text and close it.';
    status.classList.add('show');
  }

  if (triggerBtn) {
    triggerBtn.disabled = false;
  }

  addLog('Modal popup opened');
}

function triggerRandomPopup() {
  const triggerBtn = document.getElementById('openRandomPopupBtn');
  const result = document.getElementById('modalResult');
  const status = document.getElementById('popupStatus');
  const modal = document.getElementById('practiceModal');

  if (!triggerBtn || !status || !modal) return;

  clearTimeout(popupTimerId);
  modal.classList.remove('show');

  if (result) {
    result.textContent = '';
    result.classList.remove('show');
  }

  status.textContent = 'Checking whether the popup will appear...';
  status.classList.add('show');
  triggerBtn.disabled = true;
  addLog('Random popup trigger started');

  popupTimerId = setTimeout(() => {
    const shouldOpenPopup = Math.random() >= 0.5;

    if (shouldOpenPopup) {
      openModal();
      addLog('Random result: popup appeared');
    } else {
      status.textContent = 'Popup did not appear this time. Try the button again.';
      addLog('Random result: popup did not appear');
    }

    triggerBtn.disabled = false;
  }, 1200);
}

function closeModal() {
  const modal = document.getElementById('practiceModal');
  const status = document.getElementById('popupStatus');

  if (!modal) return;

  modal.classList.remove('show');

  if (status) {
    status.textContent = 'Popup closed. You can trigger the random flow again.';
    status.classList.add('show');
  }

  addLog('Modal popup closed');
}

function confirmModal() {
  const result = document.getElementById('modalResult');
  const message = document.getElementById('modalMessage');
  const status = document.getElementById('popupStatus');

  if (result) {
    result.textContent = `Success: Popup confirmed with text "${message ? message.textContent : ''}"`;
    result.classList.add('show');
  }

  if (status) {
    status.textContent = 'Popup text captured successfully.';
    status.classList.add('show');
  }

  closeModal();
  addLog('Modal confirmed');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal();
  }
});

// ========================================
// WINDOW HANDLING
// ========================================
function openNewWindow() {
  const newWin = window.open('', '_blank', 'width=1000,height=1500'); // ✅ store it

  newWin.document.write(`
    <html>
      <head>
        <title>New Window</title>
        <style>
          body {
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #020617;
            color: #e5e7eb;
            font-family: 'Segoe UI', sans-serif;
          }
          .box {
            padding: 20px 30px;
            border-radius: 12px;
            background: #0f172a;
            border-left: 4px solid #22c55e;
            box-shadow: 0 0 20px rgba(34,197,94,0.3);
            text-align: center;
          }
          h2 {
            color: #22c55e;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h2 id="newWindowText">✅ New Window Opened</h2>
          <p>This window is opened successfully.</p>
        </div>
      </body>
    </html>
  `);

  newWin.document.close();

  addLog('New window opened');
}

function openNewTab() {
  const newTab = window.open('', '_blank');
  newTab.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>AutomateLearn - New Tab</title>
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background: #0a0a1a;
          color: #e8e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
        }
        .card {
          background: rgba(15, 15, 46, 0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          max-width: 400px;
        }
        h1 { font-size: 1.5rem; margin-bottom: 10px; }
        p { color: #a0a0c0; font-size: 0.95rem; }
        .id { color: #00d4ff; font-family: monospace; margin-top: 16px; padding: 10px; background: #0d0d28; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>New Tab Opened!</h1>
        <p>Practice switching between windows using:</p>
        <div class="id">driver.getWindowHandles()<br>driver.switchTo().window(handle)</div>
        <p style="margin-top: 16px; font-size: 0.85rem; color: #6a6a90;">Window Title: "AutomateLearn - New Tab"</p>
      </div>
    </body>
    </html>
  `);
  addLog('New tab opened');
}

// ========================================
// DYNAMIC LOADING (WAITS)
// ========================================
function loadImplicitWaitElement() {
  const container = document.getElementById('implicitWaitContainer');
  if (!container) return;

  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div> Loading implicit wait demo...</div>';
  addLog('Implicit wait demo started (2 second delay)...');

  setTimeout(() => {
    container.innerHTML = `
      <div class="dynamic-element" id="implicitWaitResult">
        Success: <strong>Implicit wait demo loaded!</strong> - This result appeared after a 2-second delay.<br>
        <span style="color: var(--text-muted); font-size: 0.85rem;">
          Use driver.manage().timeouts().implicitlyWait(...) before locating this element.
        </span>
      </div>
    `;
    addLog('Implicit wait demo element loaded after 2 seconds');
  }, 2000);
}

function loadDynamicElement() {
  const container = document.getElementById('dynamicContainer');
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div> Loading element...</div>';
  addLog('Dynamic loading started (3 second delay)...');

  setTimeout(() => {
    container.innerHTML = `
      <div class="dynamic-element" id="dynamicResult">
        Success: <strong>Element loaded!</strong> - This element appeared after a 3-second delay.<br>
        <span style="color: var(--text-muted); font-size: 0.85rem;">
          Use WebDriverWait with ExpectedConditions.visibilityOfElementLocated() to handle this.
        </span>
      </div>
    `;
    addLog('Dynamic element loaded after 3 seconds');
  }, 3000);
}

function loadDelayedButton() {
  const container = document.getElementById('delayedBtnContainer');
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div> Button loading in 5 seconds...</div>';
  addLog('Delayed button loading started (5 second delay)...');

  setTimeout(() => {
    container.innerHTML = `
      <button class="practice-btn practice-btn-green" id="delayedButton" onclick="clickDelayedButton()">
        Click Me! (I appeared after 5s)
      </button>
    `;
    addLog('Delayed button appeared after 5 seconds');
  }, 5000);
}

function clickDelayedButton() {
  document.getElementById('delayedBtnResult').textContent = 'Success: Delayed button was clicked successfully!';
  document.getElementById('delayedBtnResult').classList.add('show');
  addLog('Delayed button clicked');
}

// ========================================
// GET TEXT
// ========================================
function revealHiddenText() {
  const el = document.getElementById('hiddenText');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  addLog('Hidden text toggled');
}

// ========================================
// CLICK ACTIONS
// ========================================
let clickCount = 0;

function singleClick() {
  clickCount++;
  document.getElementById('clickResult').textContent = `Single clicked! (Count: ${clickCount})`;
  document.getElementById('clickResult').classList.add('show');
  addLog('Single click performed');
}

function doubleClickAction() {
  document.getElementById('doubleClickResult').textContent = 'Double click detected!';
  document.getElementById('doubleClickResult').classList.add('show');
  addLog('Double click detected');
}

function rightClickAction(e) {
  e.preventDefault();
  document.getElementById('rightClickResult').textContent = 'Right-click (context menu) detected!';
  document.getElementById('rightClickResult').classList.add('show');
  addLog('Right-click detected');
}

function hoverDetected() {
  document.getElementById('hoverResult').textContent = 'Hover detected! Use Actions.moveToElement()';
  document.getElementById('hoverResult').classList.add('show');
}

// ========================================
// DRAG AND DROP
// ========================================
const dragDropItems = [
  { id: 'java', name: 'Java', elementId: 'dragItemJava' },
  { id: 'selenium', name: 'Selenium', elementId: 'dragItemSelenium' },
  { id: 'testng', name: 'TestNG', elementId: 'dragItemTestNG' },
  { id: 'maven', name: 'Maven', elementId: 'dragItemMaven' },
  { id: 'pom', name: 'POM', elementId: 'dragItemPOM' }
];

function initDragAndDrop() {
  const dragCards = document.querySelectorAll('.drag-card');
  const dropTargets = document.querySelectorAll('.match-target');
  const intro = document.getElementById('dragDropIntro');
  const board = document.getElementById('dragDropBoard');
  const advanceBtn = document.getElementById('advanceDragDropBtn');

  if (!dragCards.length || !dropTargets.length) return;

  if (intro && board) {
    intro.classList.remove('hidden');
    board.classList.add('hidden');
  }

  if (advanceBtn) {
    advanceBtn.disabled = false;
    advanceBtn.textContent = 'Advance';
  }

  dragCards.forEach((card) => {
    card.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', card.dataset.itemId || '');
      card.classList.add('dragging');
      addLog(`Drag started on ${card.dataset.itemName}`);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });

  dropTargets.forEach((target) => {
    target.addEventListener('dragover', (event) => {
      event.preventDefault();
      target.classList.add('drag-over');
    });

    target.addEventListener('dragleave', () => {
      target.classList.remove('drag-over');
    });

    target.addEventListener('drop', (event) => {
      event.preventDefault();
      target.classList.remove('drag-over');
      handleDragDropAttempt(event.dataTransfer.getData('text/plain'), target);
    });
  });

  resetDragDrop();
}

// ========================================
// CALENDAR
// ========================================
function initCalendarWidgets() {
  const widgets = document.querySelectorAll('[data-calendar-widget]');
  if (!widgets.length) return;

  widgets.forEach((widget) => setupCalendarWidget(widget));
}

function setupCalendarWidget(widget) {
  if (widget.dataset.ready === 'true') return;
  widget.dataset.ready = 'true';

  const valueInput = widget.querySelector('#departureDateValue');
  const display = widget.querySelector('#departureDateDisplay');
  const monthLabel = widget.querySelector('#calendarMonthLabel');
  const daysGrid = widget.querySelector('#calendarDaysGrid');
  const prevBtn = widget.querySelector('#calendarPrevBtn');
  const nextBtn = widget.querySelector('#calendarNextBtn');
  const triggerBtn = widget.querySelector('#departureDateTrigger');
  const todayBtn = widget.querySelector('#todayQuickBtn');
  const tomorrowBtn = widget.querySelector('#tomorrowQuickBtn');
  const panel = widget.querySelector('#departureCalendarPanel');

  if (!valueInput || !display || !monthLabel || !daysGrid) return;

  let selectedDate = parseCalendarDate(valueInput.value) || stripCalendarTime(new Date());
  let viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

  function setActiveShortcut(mode) {
    [triggerBtn, todayBtn, tomorrowBtn].forEach((btn) => {
      if (btn) btn.classList.remove('active');
    });

    if (mode === 'today' && todayBtn) todayBtn.classList.add('active');
    if (mode === 'tomorrow' && tomorrowBtn) tomorrowBtn.classList.add('active');
    if (mode === 'custom' && triggerBtn) triggerBtn.classList.add('active');
  }

  function updateSelectedDate(date) {
    selectedDate = stripCalendarTime(date);
    viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    valueInput.value = formatCalendarIso(selectedDate);
    display.textContent = formatCalendarDisplay(selectedDate);
    renderCalendar();
  }

  function renderCalendar() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const startDay = firstDay.getDay();
    const today = stripCalendarTime(new Date());

    monthLabel.textContent = `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
    daysGrid.innerHTML = '';

    for (let i = 0; i < startDay; i++) {
      const placeholder = document.createElement('div');
      placeholder.className = 'calendar-day-placeholder';
      daysGrid.appendChild(placeholder);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'calendar-day';
      button.textContent = String(day);
      button.dataset.date = formatCalendarIso(dayDate);

      if (isSameCalendarDay(dayDate, today)) {
        button.classList.add('today');
      }

      if (isSameCalendarDay(dayDate, selectedDate)) {
        button.classList.add('selected');
      }

      button.addEventListener('click', () => {
        updateSelectedDate(dayDate);
        setActiveShortcut('custom');
        addLog(`Calendar date selected: ${formatCalendarDisplay(dayDate)}`);
      });

      daysGrid.appendChild(button);
    }

  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
      renderCalendar();
    });
  }

  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      if (panel) {
        panel.classList.toggle('open');
      }
      setActiveShortcut('custom');
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      updateSelectedDate(new Date());
      setActiveShortcut('today');
      if (panel) panel.classList.add('open');
      addLog('Calendar quick action selected: Today');
    });
  }

  if (tomorrowBtn) {
    tomorrowBtn.addEventListener('click', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updateSelectedDate(tomorrow);
      setActiveShortcut('tomorrow');
      if (panel) panel.classList.add('open');
      addLog('Calendar quick action selected: Tomorrow');
    });
  }

  setActiveShortcut('custom');
  updateSelectedDate(selectedDate);
}

function initCompactCalendarPage() {
  const pageRoot = document.querySelector('[data-compact-calendar-page]');
  if (!pageRoot) return;

  const popup = document.getElementById('compactCalendarPopup');
  const daysRoot = document.getElementById('compactCalendarDays');
  const monthSelect = document.getElementById('compactCalendarMonthSelect');
  const yearSelect = document.getElementById('compactCalendarYearSelect');
  const prevBtn = document.getElementById('compactCalendarPrevBtn');
  const nextBtn = document.getElementById('compactCalendarNextBtn');
  const dobTrigger = document.getElementById('dobDateTrigger');
  const planningTrigger = document.getElementById('planningDateTrigger');
  const dobValue = document.getElementById('dobDateValue');
  const planningValue = document.getElementById('planningDateValue');
  const dobDisplay = document.getElementById('dobDateDisplay');
  const planningDisplay = document.getElementById('planningDateDisplay');

  if (!popup || !daysRoot || !monthSelect || !yearSelect || !dobTrigger || !planningTrigger || !dobValue || !planningValue || !dobDisplay || !planningDisplay) {
    return;
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const today = stripCalendarTime(new Date());
  const fields = {
    dob: {
      trigger: dobTrigger,
      value: dobValue,
      display: dobDisplay,
      emptyText: 'Select your date of birth'
    },
    planning: {
      trigger: planningTrigger,
      value: planningValue,
      display: planningDisplay,
      emptyText: 'Select planning date'
    }
  };

  let activeField = null;
  let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);

  function isDateDisabled(fieldKey, date) {
    if (fieldKey === 'planning') {
      return date < today;
    }

    if (fieldKey === 'dob') {
      return date > today;
    }

    return false;
  }

  monthNames.forEach((name, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = name;
    monthSelect.appendChild(option);
  });

  for (let year = today.getFullYear() - 100; year <= today.getFullYear() + 20; year++) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.appendChild(option);
  }

  planningValue.value = formatCalendarIso(today);

  function syncFieldDisplay(field) {
    const hasValue = Boolean(field.value.value);
    field.display.textContent = hasValue ? formatCalendarDisplay(parseCalendarDate(field.value.value)) : field.emptyText;
    field.display.classList.toggle('is-empty', !hasValue);
  }

  function syncAllDisplays() {
    syncFieldDisplay(fields.dob);
    syncFieldDisplay(fields.planning);
  }

  function openCalendar(fieldKey) {
    activeField = fieldKey;
    const selectedDate = parseCalendarDate(fields[fieldKey].value.value) || today;
    viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);

    popup.hidden = false;
    fields.dob.trigger.classList.toggle('is-open', fieldKey === 'dob');
    fields.planning.trigger.classList.toggle('is-open', fieldKey === 'planning');

    const targetGroup = fields[fieldKey].trigger.closest('.compact-calendar-field-group');
    if (targetGroup) {
      targetGroup.appendChild(popup);
    }

    renderCompactCalendar();
  }

  function closeCalendar() {
    activeField = null;
    popup.hidden = true;
    fields.dob.trigger.classList.remove('is-open');
    fields.planning.trigger.classList.remove('is-open');
  }

  function renderCompactCalendar() {
    if (!activeField) return;

    monthSelect.value = String(viewDate.getMonth());
    yearSelect.value = String(viewDate.getFullYear());
    daysRoot.innerHTML = '';

    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const selected = parseCalendarDate(fields[activeField].value.value);

    for (let i = 0; i < firstDay.getDay(); i++) {
      const placeholder = document.createElement('div');
      placeholder.className = 'compact-calendar-day-placeholder';
      daysRoot.appendChild(placeholder);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'compact-calendar-day';
      button.dataset.date = formatCalendarIso(cellDate);
      button.textContent = String(day);
      const disabled = isDateDisabled(activeField, cellDate);

      if (isSameCalendarDay(cellDate, today)) {
        button.classList.add('is-today');
      }

      if (selected && isSameCalendarDay(cellDate, selected)) {
        button.classList.add('is-selected');
      }

      if (disabled) {
        button.classList.add('is-disabled');
        button.disabled = true;
      }

      button.addEventListener('click', () => {
        fields[activeField].value.value = formatCalendarIso(cellDate);
        syncFieldDisplay(fields[activeField]);
        addLog(`Compact calendar selected for ${activeField}: ${formatCalendarDisplay(cellDate)}`);
        closeCalendar();
      });

      daysRoot.appendChild(button);
    }
  }

  monthSelect.addEventListener('change', () => {
    viewDate = new Date(Number(yearSelect.value), Number(monthSelect.value), 1);
    renderCompactCalendar();
  });

  yearSelect.addEventListener('change', () => {
    viewDate = new Date(Number(yearSelect.value), Number(monthSelect.value), 1);
    renderCompactCalendar();
  });

  prevBtn.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCompactCalendar();
  });

  nextBtn.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCompactCalendar();
  });

  dobTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    if (activeField === 'dob' && !popup.hidden) {
      closeCalendar();
      return;
    }
    openCalendar('dob');
  });

  planningTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    if (activeField === 'planning' && !popup.hidden) {
      closeCalendar();
      return;
    }
    openCalendar('planning');
  });

  popup.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  document.addEventListener('click', (event) => {
    if (!pageRoot.contains(event.target)) {
      closeCalendar();
    }
  });

  syncAllDisplays();
}

function stripCalendarTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatCalendarIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatCalendarDisplay(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseCalendarDate(value) {
  if (!value) return null;
  const parts = value.split('-');
  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  return new Date(year, month, day);
}

function isSameCalendarDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function advanceDragDrop() {
  const intro = document.getElementById('dragDropIntro');
  const board = document.getElementById('dragDropBoard');
  const advanceBtn = document.getElementById('advanceDragDropBtn');

  if (intro) {
    intro.classList.add('hidden');
  }

  if (board) {
    board.classList.remove('hidden');
  }

  if (advanceBtn) {
    advanceBtn.textContent = 'Board Open';
    advanceBtn.disabled = true;
  }

  addLog('Drag and drop board opened');
}

function handleDragDropAttempt(itemId, target) {
  const result = document.getElementById('dragDropResult');
  const draggedCard = document.querySelector(`[data-item-id="${itemId}"]`);
  const expectedId = target ? target.dataset.matchId : '';

  if (!target || !result || !draggedCard) return;

  if (target.classList.contains('matched-target')) {
    result.textContent = 'This text box is already matched.';
    result.style.borderColor = 'rgba(251, 146, 60, 0.3)';
    result.style.background = 'rgba(251, 146, 60, 0.05)';
    result.style.color = '#fb923c';
    result.classList.add('show');
    return;
  }

  if (itemId === expectedId) {
    target.classList.remove('wrong-drop');
    target.classList.add('dropped', 'matched-target');
    target.innerHTML = draggedCard.innerHTML;
    draggedCard.classList.add('matched');
    draggedCard.setAttribute('draggable', 'false');
    result.textContent = `Correct match: ${draggedCard.dataset.itemName}.`;
    result.style.borderColor = 'rgba(0, 255, 136, 0.3)';
    result.style.background = 'rgba(0, 255, 136, 0.05)';
    result.style.color = '#00ff88';
    addLog(`${draggedCard.dataset.itemName} matched correctly`);
  } else {
    target.classList.remove('dropped');
    target.classList.add('wrong-drop');
    result.textContent = `Wrong match: ${draggedCard.dataset.itemName} does not belong here.`;
    result.style.borderColor = 'rgba(251, 146, 60, 0.3)';
    result.style.background = 'rgba(251, 146, 60, 0.05)';
    result.style.color = '#fb923c';
    addLog(`Wrong match for ${target.dataset.matchId}: received ${draggedCard.dataset.itemName}`);
  }

  result.classList.add('show');

  if (document.querySelectorAll('.drag-card.matched').length === dragDropItems.length) {
    result.textContent = 'All drag and drop matches are completed.';
    result.style.borderColor = 'rgba(0, 255, 136, 0.3)';
    result.style.background = 'rgba(0, 255, 136, 0.05)';
    result.style.color = '#00ff88';
    addLog('Drag and drop exercise completed');
  }
}

function resetDragDrop() {
  const result = document.getElementById('dragDropResult');
  const dragCards = document.querySelectorAll('.drag-card');
  const dropTargets = document.querySelectorAll('.match-target');
  const intro = document.getElementById('dragDropIntro');
  const board = document.getElementById('dragDropBoard');
  const advanceBtn = document.getElementById('advanceDragDropBtn');

  dragCards.forEach((card) => {
    card.classList.remove('dragging', 'matched');
    card.setAttribute('draggable', 'true');
  });

  dropTargets.forEach((target) => {
    const item = dragDropItems.find(entry => entry.id === target.dataset.matchId);
    target.classList.remove('drag-over', 'dropped', 'wrong-drop', 'matched-target');
    target.innerHTML = `<span class="match-target-text">${item ? item.name : 'Text'}</span>`;
  });

  if (result) {
    result.textContent = '';
    result.classList.remove('show');
    result.removeAttribute('style');
  }

  if (intro && board) {
    intro.classList.remove('hidden');
    board.classList.add('hidden');
  }

  if (advanceBtn) {
    advanceBtn.disabled = false;
    advanceBtn.textContent = 'Advance';
  }

  addLog('Drag and drop lab reset');
}

// ========================================
// IFRAME
// ========================================
function resetPracticeFrame() {
  const frame = document.getElementById('practiceFrame');
  if (!frame) return;

  frame.srcdoc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Practice Frame</title>
      <style>
        body {
          margin: 0;
          padding: 24px;
          font-family: Arial, sans-serif;
          background: #0f172a;
          color: #e2e8f0;
        }

        .frame-card {
          max-width: 520px;
          margin: 0 auto;
          padding: 24px;
          background: #111827;
          border: 1px solid #334155;
          border-radius: 16px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
        }

        h2 {
          margin: 0 0 10px;
          font-size: 1.4rem;
        }

        p {
          color: #cbd5e1;
          line-height: 1.5;
        }

        label {
          display: block;
          margin: 18px 0 8px;
          font-weight: 600;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #475569;
          background: #020617;
          color: #f8fafc;
        }

        button {
          margin-top: 16px;
          padding: 12px 18px;
          border: 0;
          border-radius: 10px;
          background: #0ea5e9;
          color: #082f49;
          font-weight: 700;
          cursor: pointer;
        }

        .result {
          margin-top: 18px;
          padding: 14px;
          border-radius: 10px;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.35);
          color: #86efac;
        }
      </style>
    </head>
    <body>
      <div class="frame-card">
        <h2>Practice iFrame Area</h2>
        <p>Switch into this frame before using Selenium locators on the elements below.</p>

        <label for="frameNameInput">Your Name</label>
        <input type="text" id="frameNameInput" placeholder="Enter your name">

        <button id="frameSubmitBtn" type="button">Submit Inside iFrame</button>

        <div class="result" id="frameResult">Waiting for input...</div>
      </div>

      <script>
        document.getElementById('frameSubmitBtn').addEventListener('click', function () {
          var input = document.getElementById('frameNameInput');
          var result = document.getElementById('frameResult');
          var value = input.value.trim() || 'Selenium Learner';
          result.textContent = 'Hello, ' + value + '! You interacted inside the iframe successfully.';
        });
      </script>
    </body>
    </html>
  `;

  addLog('iFrame practice area reset');
}

// ========================================
// SCREENSHOT
// ========================================
function updateScreenshotTimestamp() {
  const el = document.getElementById('screenshotTimestamp');
  if (el) {
    const now = new Date();
    el.textContent = `Timestamp: ${now.toLocaleString()}`;
  }
}

// ========================================
// SAMPLE CODE TOGGLES
// ========================================
function toggleSampleCode(btn) {
  const content = btn.nextElementSibling;
  const originalLabel = btn.dataset.originalLabel || btn.textContent.trim();

  if (!btn.dataset.originalLabel) {
    btn.dataset.originalLabel = originalLabel;
  }

  if (content.classList.contains('show')) {
    content.classList.remove('show');
    btn.classList.remove('open');
    btn.classList.remove('is-loading');
    btn.innerHTML = `<span class="arrow"></span> ${btn.dataset.originalLabel}`;
    btn.style.pointerEvents = '';
    } else {
    btn.classList.add('is-loading');
    btn.style.pointerEvents = 'none';
    btn.innerHTML = '<span class="sample-code-btn-loading"></span> Loading Selenium Code...';

    setTimeout(() => {
      content.classList.add('show');
      btn.classList.remove('is-loading');
      btn.classList.add('open');
      btn.innerHTML = `<span class="arrow"></span> ${btn.dataset.originalLabel}`;
      btn.style.pointerEvents = '';
    }, 120);
  }
}

// ========================================
// ACTION LOG
// ========================================
function addLog(message) {
  const log = document.getElementById('actionLog');
  if (!log) return;

  const time = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-msg">${message}</span>`;
  log.prepend(entry);
}

// ========================================
// SCROLL
// ========================================
function scrollToTarget(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = 'fadeInUp 0.6s ease';
    addLog(`Scrolled to ${id}`);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  redirectLoggedInUser();

  const state = {
    step: 'login',
    resetEmail: '',
    otpExpiresAt: 0,
    otpResendAt: 0,
    timerId: null,
    successRedirectId: null,
    successCountdown: 10,
  };

  const elements = {
    loginForm: document.getElementById('loginForm'),
    forgotForm: document.getElementById('forgotPasswordForm'),
    resetForm: document.getElementById('resetPasswordForm'),
    result: document.getElementById('loginResult'),
    loginSubmitBtn: document.getElementById('loginSubmitBtn'),
    forgotProcessBtn: document.getElementById('forgotProcessBtn'),
    verifyForgotOtpBtn: document.getElementById('verifyForgotOtpBtn'),
    resendForgotOtpBtn: document.getElementById('resendForgotOtpBtn'),
    resetPasswordDoneBtn: document.getElementById('resetPasswordDoneBtn'),
    showForgotPasswordBtn: document.getElementById('showForgotPasswordBtn'),
    backToLoginBtn: document.getElementById('backToLoginBtn'),
    backToForgotFormBtn: document.getElementById('backToForgotFormBtn'),
    successBackToLoginBtn: document.getElementById('successBackToLoginBtn'),
    successRedirectTimer: document.getElementById('successRedirectTimer'),
    forgotOtpEmail: document.getElementById('forgotOtpEmail'),
    otpExpiryTimer: document.getElementById('otpExpiryTimer'),
    otpResendTimer: document.getElementById('otpResendTimer'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    forgotEmail: document.getElementById('forgotEmail'),
    resetNewPassword: document.getElementById('resetNewPassword'),
    resetConfirmPassword: document.getElementById('resetConfirmPassword'),
    otpInputs: Array.from(document.querySelectorAll('.login-otp-input')),
    panels: Array.from(document.querySelectorAll('.login-panel')),
    indicators: Array.from(document.querySelectorAll('[data-step-indicator]')),
    loginFlowShell: document.getElementById('loginFlowShell'),
  };

  if (!elements.loginForm || !elements.result) {
    return;
  }

  bindEvents();
  showStep('login');

  function bindEvents() {
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.forgotForm?.addEventListener('submit', handleForgotPasswordRequest);
    elements.resetForm?.addEventListener('submit', handlePasswordReset);
    elements.showForgotPasswordBtn?.addEventListener('click', () => {
      elements.forgotEmail.value = elements.loginEmail.value.trim();
      showStep('request');
      setRecoveryLayout(true);
      clearStatus();
    });
    elements.backToLoginBtn?.addEventListener('click', returnToLogin);
    elements.backToForgotFormBtn?.addEventListener('click', () => {
      stopTimers();
      showStep('request');
      setRecoveryLayout(true);
      showInfo('You can change the email and request a new OTP.');
    });
    elements.verifyForgotOtpBtn?.addEventListener('click', handleForgotOtpVerify);
    elements.resendForgotOtpBtn?.addEventListener('click', handleForgotOtpResend);
    elements.successBackToLoginBtn?.addEventListener('click', returnToLogin);

    elements.otpInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 1);
        if (input.value && index < elements.otpInputs.length - 1) {
          elements.otpInputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && !input.value && index > 0) {
          elements.otpInputs[index - 1].focus();
        }
      });

      input.addEventListener('paste', (event) => {
        event.preventDefault();
        const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (!pasted) {
          return;
        }
        pasted.split('').forEach((char, pasteIndex) => {
          if (elements.otpInputs[pasteIndex]) {
            elements.otpInputs[pasteIndex].value = char;
          }
        });
        const targetIndex = Math.min(pasted.length, elements.otpInputs.length - 1);
        elements.otpInputs[targetIndex].focus();
      });
    });
  }

  async function handleLogin(event) {
    event.preventDefault();

    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    const apiBaseUrl = window.APP_API_BASE_URL || window.location.origin;

    setButtonState(elements.loginSubmitBtn, true, 'Signing In...');
    elements.showForgotPasswordBtn.hidden = true;
    showInfo('Checking your account...');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type') || '';
      const rawBody = await response.text();
      const data = contentType.includes('application/json')
        ? JSON.parse(rawBody)
        : { detail: rawBody.slice(0, 200) || 'Unexpected server response' };

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem('authUser', JSON.stringify(data.user));
      localStorage.setItem('authSession', JSON.stringify(data.session));
      showSuccess('Login successful. Redirecting to Profile...');

      setTimeout(() => {
        window.location.href = '/profile';
      }, 1500);
    } catch (error) {
      elements.showForgotPasswordBtn.hidden = false;
      showError(`Error: ${error.message}`);
    } finally {
      setButtonState(elements.loginSubmitBtn, false, 'Login');
    }
  }

  async function handleForgotPasswordRequest(event) {
    event.preventDefault();

    const email = elements.forgotEmail.value.trim().toLowerCase();
    if (!email) {
      showError('Enter your email first.');
      return;
    }

    setButtonState(elements.forgotProcessBtn, true, 'Processing...');
    showInfo('Checking email and sending OTP...');

    try {
      const data = await requestJson('/api/auth/forgot-password', { email });
      state.resetEmail = data.email;
      syncOtpMeta(data);
      elements.forgotOtpEmail.textContent = data.email;
      clearOtpInputs();
      showStep('otp');
      startTimers();
      showSuccess(data.message || 'OTP sent successfully.');
      elements.otpInputs[0]?.focus();
    } catch (error) {
      showError(error.message);
    } finally {
      setButtonState(elements.forgotProcessBtn, false, 'Process');
    }
  }

  async function handleForgotOtpVerify() {
    const otp = getOtpValue();
    if (otp.length !== 6) {
      showError('Enter the full 6-digit OTP.');
      return;
    }

    setButtonState(elements.verifyForgotOtpBtn, true, 'Verifying...');
    showInfo('Checking OTP...');

    try {
      const data = await requestJson('/api/auth/verify-forgot-password-otp', {
        email: state.resetEmail,
        otp,
      });
      stopTimers();
      showStep('reset');
      showSuccess(data.message || 'OTP verified successfully.');
      elements.resetNewPassword.focus();
    } catch (error) {
      showError(error.message);
    } finally {
      setButtonState(elements.verifyForgotOtpBtn, false, 'Verify OTP');
    }
  }

  async function handleForgotOtpResend() {
    if (!state.resetEmail) {
      showError('Start the reset process again.');
      return;
    }

    setButtonState(elements.resendForgotOtpBtn, true, 'Sending...');
    showInfo('Sending a new OTP...');

    try {
      const data = await requestJson('/api/auth/resend-forgot-password-otp', {
        email: state.resetEmail,
      });
      syncOtpMeta(data);
      clearOtpInputs();
      startTimers();
      showSuccess(data.message || 'OTP resent successfully.');
      elements.otpInputs[0]?.focus();
    } catch (error) {
      showError(error.message);
    } finally {
      setButtonState(elements.resendForgotOtpBtn, false, 'Re-send OTP');
      updateTimers();
    }
  }

  async function handlePasswordReset(event) {
    event.preventDefault();

    const password = elements.resetNewPassword.value;
    const confirmPassword = elements.resetConfirmPassword.value;

    if (password.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    setButtonState(elements.resetPasswordDoneBtn, true, 'Saving...');
    showInfo('Updating your password...');

    try {
      const data = await requestJson('/api/auth/reset-password', {
        email: state.resetEmail,
        password,
        confirm_password: confirmPassword,
      });
      showStep('success');
      showSuccess(data.message || 'Password changed successfully.');
      startSuccessRedirect();
      elements.resetForm.reset();
    } catch (error) {
      showError(error.message);
    } finally {
      setButtonState(elements.resetPasswordDoneBtn, false, 'Done');
    }
  }

  function returnToLogin() {
    stopTimers();
    stopSuccessRedirect();
    clearOtpInputs();
    elements.loginForm.reset();
    elements.forgotForm?.reset();
    elements.resetForm?.reset();
    state.resetEmail = '';
    elements.showForgotPasswordBtn.hidden = true;
    showStep('login');
    setRecoveryLayout(false);
    clearStatus();
  }

  function showStep(step) {
    state.step = step;
    if (step !== 'success') {
      stopSuccessRedirect();
    }
    elements.panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.step === step);
    });

    const order = ['request', 'otp', 'reset'];
    const effectiveStep = step === 'success' ? 'reset' : step;
    const activeIndex = order.indexOf(effectiveStep);
    elements.indicators.forEach((indicator) => {
      const indicatorIndex = order.indexOf(indicator.dataset.stepIndicator);
      indicator.classList.toggle('active', indicatorIndex === activeIndex);
    });
  }

  function setRecoveryLayout(showRecovery) {
    elements.loginFlowShell?.classList.toggle('is-login-only', !showRecovery);
  }

  function syncOtpMeta(data) {
    state.otpExpiresAt = Number(data.expires_at || 0) * 1000;
    state.otpResendAt = Number(data.resend_available_at || 0) * 1000;
  }

  function startTimers() {
    stopTimers();
    updateTimers();
    state.timerId = window.setInterval(updateTimers, 1000);
  }

  function stopTimers() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startSuccessRedirect() {
    stopSuccessRedirect();
    state.successCountdown = 10;
    updateSuccessRedirectLabel();
    state.successRedirectId = window.setInterval(() => {
      state.successCountdown -= 1;
      updateSuccessRedirectLabel();
      if (state.successCountdown <= 0) {
        stopSuccessRedirect();
        returnToLogin();
      }
    }, 1000);
  }

  function stopSuccessRedirect() {
    if (state.successRedirectId) {
      window.clearInterval(state.successRedirectId);
      state.successRedirectId = null;
    }
  }

  function updateSuccessRedirectLabel() {
    if (elements.successRedirectTimer) {
      elements.successRedirectTimer.textContent = String(Math.max(0, state.successCountdown));
    }
  }

  function updateTimers() {
    const now = Date.now();
    const expiryMs = Math.max(0, state.otpExpiresAt - now);
    const resendMs = Math.max(0, state.otpResendAt - now);

    elements.otpExpiryTimer.textContent = formatClock(expiryMs);
    elements.otpResendTimer.textContent = resendMs > 0 ? formatClock(resendMs) : 'Now';

    const otpExpired = expiryMs <= 0;
    const canResend = resendMs <= 0;
    elements.verifyForgotOtpBtn.disabled = otpExpired;
    elements.resendForgotOtpBtn.disabled = !canResend;

    if (otpExpired) {
      stopTimers();
      showError('OTP expired. Please re-send a new OTP.');
    }
  }

  function getOtpValue() {
    return elements.otpInputs.map((input) => input.value).join('');
  }

  function clearOtpInputs() {
    elements.otpInputs.forEach((input) => {
      input.value = '';
    });
  }

  function formatClock(milliseconds) {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  async function requestJson(endpoint, body) {
    const apiBaseUrl = window.APP_API_BASE_URL || window.location.origin;
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';
    const rawBody = await response.text();
    const data = contentType.includes('application/json')
      ? JSON.parse(rawBody)
      : { detail: rawBody.slice(0, 200) || 'Unexpected server response' };

    if (!response.ok) {
      throw new Error(data.detail || 'Request failed');
    }

    return data;
  }

  function setButtonState(button, disabled, text) {
    if (!button) {
      return;
    }

    button.disabled = disabled;
    button.textContent = text;
  }

  function clearStatus() {
    elements.result.textContent = '';
    elements.result.classList.remove('show');
    elements.result.style.borderColor = 'rgba(0, 255, 136, 0.2)';
    elements.result.style.background = 'rgba(0, 255, 136, 0.05)';
    elements.result.style.color = '#00ff88';
  }

  function showInfo(message) {
    showStatus(message, '#38bdf8', 'rgba(14, 165, 233, 0.08)', 'rgba(14, 165, 233, 0.3)');
  }

  function showError(message) {
    showStatus(message, '#fb923c', 'rgba(251, 146, 60, 0.05)', 'rgba(251, 146, 60, 0.3)');
  }

  function showSuccess(message) {
    showStatus(message, '#00ff88', 'rgba(0, 255, 136, 0.05)', 'rgba(0, 255, 136, 0.3)');
  }

  function showStatus(message, color, background, borderColor) {
    elements.result.textContent = message;
    elements.result.classList.add('show');
    elements.result.style.color = color;
    elements.result.style.background = background;
    elements.result.style.borderColor = borderColor;
  }
});

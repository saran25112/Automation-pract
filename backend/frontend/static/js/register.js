import auth from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const result = document.getElementById('registerResult');
  const otpResult = document.getElementById('otpResult');
  const submitBtn = document.getElementById('registerSubmitBtn');

  const otpSection = document.getElementById('otpSection');
  const otpEmail = document.getElementById('otpEmail');
  const otpInputs = document.querySelectorAll('.otp-input');
  const otpTimerText = document.getElementById('otpTimerText');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const backToRegisterBtn = document.getElementById('backToRegisterBtn');

  let currentEmail = null;
  let otpExpiryTime = 0;
  let resendAvailableAt = 0;
  let otpCountdownTimer = null;
  let otpBusy = false;

  if (!form || !result || !submitBtn) return;

  // 🔹 REGISTER
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim().replace(/\D/g, '');
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
      showError('Password and confirm password do not match.');
      return;
    }

    if (phone.length !== 10) {
      showError('Mobile number must be exactly 10 digits.');
      return;
    }

    setLoading(true, 'Creating Account...');

    try {
      // 🔥 CALL YOUR AUTH MODULE (instead of fetch)
      const data = await auth.register(name, email, password, phone);

      currentEmail = data.email;

      // ✅ SHOW OTP UI
      form.style.display = 'none';
      otpSection.style.display = 'block';
      otpEmail.textContent = email;

      showInfo('OTP sent to your email', 'otp');
      startOtpCountdown();
      startResendTimer();

    } catch (error) {
      showError(error.error || error.message || 'Registration failed', 'register');
    } finally {
      setLoading(false);
    }
  });

  // 🔹 GET OTP VALUE
  function getOtp() {
    return Array.from(otpInputs).map(i => i.value).join('');
  }

  // 🔹 VERIFY OTP
  verifyOtpBtn?.addEventListener('click', async () => {
    const otp = getOtp();

    if (otp.length !== 6) {
      showError('Enter valid 6-digit OTP', 'otp');
      return;
    }

    setOtpLoading(true, 'Verifying OTP...');

    try {
      await auth.verifyRegistrationOtp(currentEmail, otp);

      showSuccess('Account created successfully 🎉', 'otp');

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (err) {
      showError(err.error || 'Invalid OTP', 'otp');
    } finally {
      setOtpLoading(false);
    }
  });

  let resendTimer = null;
  const resendBtn = document.getElementById('resendOtpBtn');

  function formatCountdown(msRemaining) {
    const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function updateOtpTimerText() {
    if (!otpTimerText) return;

    const now = Date.now();
    const otpRemainingText = formatCountdown(otpExpiryTime - now);
    const resendRemainingMs = resendAvailableAt - now;

    if (resendRemainingMs > 0) {
      otpTimerText.textContent = `OTP can be used for ${otpRemainingText}. You can request a new OTP after ${formatCountdown(resendRemainingMs)}.`;
      return;
    }

    otpTimerText.textContent = `OTP can be used for ${otpRemainingText}. You can request a new OTP now.`;
  }

  function startOtpCountdown() {
    otpExpiryTime = Date.now() + 5 * 60 * 1000;

    if (otpCountdownTimer) {
      clearInterval(otpCountdownTimer);
    }

    updateOtpTimerText();
    otpCountdownTimer = setInterval(() => {
      updateOtpTimerText();

      if (Date.now() >= otpExpiryTime) {
        clearInterval(otpCountdownTimer);
        otpCountdownTimer = null;
      }
    }, 1000);
  }

  function startResendTimer() {
    if (!resendBtn) return;
    resendAvailableAt = Date.now() + 2 * 60 * 1000;
    
    // Hide initially and reset state
    resendBtn.style.display = 'none';
    resendBtn.textContent = 'Re-send OTP';
    resendBtn.disabled = false;
    resendBtn.style.backgroundColor = 'rgba(255,255,255,0.05)';
    resendBtn.style.borderColor = 'rgba(255,255,255,0.1)';
    
    // Clear any existing timer
    if (resendTimer) clearTimeout(resendTimer);
    updateOtpTimerText();
    
    // Show after 2 minutes (120,000 ms)
    resendTimer = setTimeout(() => {
      resendBtn.style.display = 'block';
      updateOtpTimerText();
    }, 120000);
  }

  // 🔹 RESEND OTP
  resendBtn?.addEventListener('click', async () => {
    if (otpBusy) return;

    // Show loading state
    resendBtn.disabled = true;
    const originalText = resendBtn.textContent;
    resendBtn.textContent = 'Sending...';

    try {
      await auth.resendRegistrationOtp(currentEmail);
      
      // Success feedback
      resendBtn.textContent = 'OTP Sent! ✅';
      resendBtn.style.backgroundColor = 'rgba(0, 255, 136, 0.2)';
      resendBtn.style.borderColor = 'rgba(0, 255, 136, 0.5)';
      startOtpCountdown();
      
      // Wait 5 seconds, then hide and restart 2-min timer
      setTimeout(() => {
        startResendTimer();
      }, 5000);

    } catch (err) {
      showError(err.error || 'Failed to resend OTP', 'otp');
      resendBtn.disabled = false;
      resendBtn.textContent = originalText;
    }
  });

  // 🔹 BACK TO REGISTER
  document.getElementById('backToRegisterBtn')?.addEventListener('click', () => {
    if (otpBusy) return;

    otpSection.style.display = 'none';
    form.style.display = 'block';
    clearMessage('otp');
    if (otpCountdownTimer) {
      clearInterval(otpCountdownTimer);
      otpCountdownTimer = null;
    }
    // Clear OTP inputs
    otpInputs.forEach(input => input.value = '');
  });

  // 🔹 AUTO MOVE OTP INPUT
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);

      if (input.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  const phoneInput = document.getElementById('registerPhone');
  phoneInput?.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
  });

  // 🔹 UI HELPERS

  function setLoading(state, text = 'Register') {
    submitBtn.disabled = state;
    submitBtn.textContent = state ? text : 'Register';
  }

  function setOtpLoading(state, text = 'Verify OTP') {
    otpBusy = state;

    otpInputs.forEach((input) => {
      input.disabled = state;
    });

    if (verifyOtpBtn) {
      verifyOtpBtn.disabled = state;
      verifyOtpBtn.textContent = state ? text : 'Verify OTP';
      verifyOtpBtn.style.opacity = state ? '0.75' : '1';
      verifyOtpBtn.style.cursor = state ? 'not-allowed' : 'pointer';
      verifyOtpBtn.classList.toggle('otp-loading-button', state);
    }

    if (resendBtn) {
      resendBtn.disabled = state;
      resendBtn.style.opacity = state ? '0.6' : '1';
      resendBtn.style.cursor = state ? 'not-allowed' : 'pointer';
    }

    if (backToRegisterBtn) {
      backToRegisterBtn.disabled = state;
      backToRegisterBtn.style.opacity = state ? '0.6' : '1';
      backToRegisterBtn.style.cursor = state ? 'not-allowed' : 'pointer';
    }
  }

  function getMessageTarget(target = 'register') {
    return target === 'otp' ? otpResult : result;
  }

  function clearMessage(target = 'register') {
    const element = getMessageTarget(target);
    if (!element) return;
    element.textContent = '';
    element.classList.remove('show');
  }

  function showError(msg, target = 'register') {
    const element = getMessageTarget(target);
    if (!element) return;
    element.textContent = `Error: ${msg}`;
    element.classList.add('show');
    element.style.borderColor = 'rgba(251, 146, 60, 0.3)';
    element.style.background = 'rgba(251, 146, 60, 0.05)';
    element.style.color = '#fb923c';
  }

  function showSuccess(msg, target = 'register') {
    const element = getMessageTarget(target);
    if (!element) return;
    element.textContent = msg;
    element.classList.add('show');
    element.style.borderColor = 'rgba(0, 255, 136, 0.3)';
    element.style.background = 'rgba(0, 255, 136, 0.05)';
    element.style.color = '#00ff88';
  }

  function showInfo(msg, target = 'register') {
    const element = getMessageTarget(target);
    if (!element) return;
    element.textContent = msg;
    element.classList.add('show');
    element.style.borderColor = 'rgba(14, 165, 233, 0.3)';
    element.style.background = 'rgba(14, 165, 233, 0.08)';
    element.style.color = '#38bdf8';
  }
});

const apiBaseUrl = window.APP_API_BASE_URL || window.location.origin;

async function request(endpoint, method = 'POST', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${apiBaseUrl}${endpoint}`, options);
  const contentType = response.headers.get('content-type') || '';
  const rawBody = await response.text();
  const data = contentType.includes('application/json')
    ? JSON.parse(rawBody)
    : { detail: rawBody.slice(0, 200) || 'Unexpected server response' };

  if (!response.ok) {
    throw { error: data.detail || 'Request failed', ...data };
  }
  return data;
}

const auth = {
  async register(name, email, password, phone) {
    return request('/api/auth/register', 'POST', { name, email, password, phone });
  },

  async verifyRegistrationOtp(email, otp) {
    return request('/api/auth/verify-registration', 'POST', { email, otp });
  },

  async resendRegistrationOtp(email) {
    return request('/api/auth/resend-registration-otp', 'POST', { email });
  }
};

export default auth;

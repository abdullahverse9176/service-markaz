export async function signIn({ email, password }) {
  const res = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Sign in failed");
  }

  // json.data = { user: {...}, token: "..." }
  return json.data;
}

export async function signUp({ firstName, lastName, email, phone, whatsapp, password, referralCode }) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, email, phone, whatsapp, password, referralCode }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Sign up failed");
  }

  // Return both user data and token so the caller can auto-login
  return { user: json.data, token: json.token };
}

export async function forgotPassword({ email }) {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to send OTP");
  }

  return json;
}

export async function verifyForgotPasswordOtp({ email, otp }) {
  const res = await fetch("/api/auth/forgot-password/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "OTP verification failed");
  }

  return json;
}

export async function resetPassword({ resetToken, newPassword }) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetToken, newPassword }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Password reset failed");
  }

  return json;
}

export async function sendOtp(token) {
  const res = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Failed to send OTP");
  }

  return json;
}

export async function verifyOtp({ otp, token }) {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ otp }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "OTP verification failed");
  }

  return json;
}

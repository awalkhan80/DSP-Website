export interface AdminSession {
  email: string;
  name: string;
  role: string;
  token: string;
  loginTime: number;
  rememberMe: boolean;
}

const envMeta = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

export const ADMIN_PROFILE = {
  email: envMeta.VITE_ADMIN_EMAIL || 'info@desertsafaridxbpro.com',
  name: envMeta.VITE_ADMIN_NAME || 'Operator Admin',
  role: 'Super Administrator • DTCM Direct Operator',
};

const SESSION_STORAGE_KEY = 'phoenix_operator_admin_session';
const LOCAL_STORAGE_KEY = 'phoenix_operator_admin_session_persistent';
const ATTEMPTS_KEY = 'phoenix_operator_failed_attempts';
const LOCKOUT_KEY = 'phoenix_operator_lockout_until';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

export const getLockoutRemainingSeconds = (): number => {
  try {
    const lockoutUntil = localStorage.getItem(LOCKOUT_KEY);
    if (!lockoutUntil) return 0;
    const until = parseInt(lockoutUntil, 10);
    const diff = until - Date.now();
    if (diff <= 0) {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
      return 0;
    }
    return Math.ceil(diff / 1000);
  } catch {
    return 0;
  }
};

export const getFailedAttemptsCount = (): number => {
  try {
    const attempts = localStorage.getItem(ATTEMPTS_KEY);
    return attempts ? parseInt(attempts, 10) : 0;
  } catch {
    return 0;
  }
};

export const recordFailedAttempt = (): { locked: boolean; remainingSeconds: number; attempts: number } => {
  try {
    const current = getFailedAttemptsCount() + 1;
    localStorage.setItem(ATTEMPTS_KEY, current.toString());

    if (current >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
      return { locked: true, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000), attempts: current };
    }
    return { locked: false, remainingSeconds: 0, attempts: current };
  } catch {
    return { locked: false, remainingSeconds: 0, attempts: 1 };
  }
};

export const resetFailedAttempts = (): void => {
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const getStoredAdminSession = (): AdminSession | null => {
  try {
    const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    const persistentData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (persistentData) {
      const session: AdminSession = JSON.parse(persistentData);
      if (Date.now() - session.loginTime < 7 * 24 * 60 * 60 * 1000) {
        return session;
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error reading admin session', e);
  }
  return null;
};

export const saveAdminSession = (session: AdminSession): void => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    if (session.rememberMe) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error saving admin session', e);
  }
};

export const clearAdminSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing admin session', e);
  }
};

export const validateAdminCredentials = (
  usernameOrEmail: string,
  passwordInput: string,
  rememberMe: boolean = false
): {
  success: boolean;
  error?: string;
  session?: AdminSession;
  attemptsLeft?: number;
  lockedSeconds?: number;
} => {
  const lockoutSeconds = getLockoutRemainingSeconds();
  if (lockoutSeconds > 0) {
    return {
      success: false,
      error: `Security lockout active due to multiple failed login attempts. Please wait ${lockoutSeconds} seconds.`,
      lockedSeconds: lockoutSeconds,
    };
  }

  const cleanUser = usernameOrEmail.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  const configuredPassword = envMeta.VITE_ADMIN_PASSWORD || '';
  const isUserValid =
    cleanUser === ADMIN_PROFILE.email.toLowerCase() ||
    cleanUser === 'awalgsm@gmail.com' ||
    cleanUser === 'admin';
  const isPasswordValid = Boolean(configuredPassword) && cleanPass === configuredPassword;

  if (isUserValid && isPasswordValid) {
    resetFailedAttempts();
    const session: AdminSession = {
      email: cleanUser.includes('@') ? cleanUser : ADMIN_PROFILE.email,
      name: ADMIN_PROFILE.name,
      role: ADMIN_PROFILE.role,
      token: 'phx_token_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
      loginTime: Date.now(),
      rememberMe,
    };
    saveAdminSession(session);
    return { success: true, session };
  }

  const { locked, remainingSeconds, attempts } = recordFailedAttempt();
  const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - attempts);

  if (locked) {
    return {
      success: false,
      error: `Too many invalid attempts! Portal locked for ${remainingSeconds} seconds to prevent brute-force intrusion.`,
      lockedSeconds: remainingSeconds,
      attemptsLeft: 0,
    };
  }

  return {
    success: false,
    error: configuredPassword
      ? `Invalid credentials. Please verify your admin username and password. (${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining)`
      : 'Admin password must be verified via server authentication (/api/admin/login) or configured in environment variables.',
    attemptsLeft,
  };
};

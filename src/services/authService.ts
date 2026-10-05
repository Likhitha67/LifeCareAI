import { UserProfile } from '../types';
import { seedInitialUserData } from './dbService';

const USERS_STORAGE_KEY = 'lifecare_auth_users';
const CURRENT_USER_KEY = 'lifecare_current_user_session';
const RESET_TOKENS_KEY = 'lifecare_reset_tokens';

interface StoredUserAccount extends UserProfile {
  passwordHash: string;
}

// Simple deterministic hash for mock auth store
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'lh_' + Math.abs(hash).toString(36) + '_' + password.length;
}

function getAllAccounts(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllAccounts(users: StoredUserAccount[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Seed default user account if none exists
export function initializeAuthDefaults(): UserProfile {
  const accounts = getAllAccounts();
  const defaultEmail = 'likhithakonda25@gmail.com';
  let defaultUser = accounts.find((a) => a.email.toLowerCase() === defaultEmail.toLowerCase());

  if (!defaultUser) {
    const now = new Date().toISOString();
    defaultUser = {
      id: 'usr_likhitha_default',
      fullName: 'Likhitha Konda',
      email: defaultEmail,
      phone: '+91 98490 12345',
      dateOfBirth: '1995-08-12',
      gender: 'Female',
      emergencyContact: {
        name: 'Suresh Konda',
        relationship: 'Father',
        phone: '+91 98490 54321',
      },
      passwordHash: hashPassword('LifeCare@2026'),
      createdAt: now,
      updatedAt: now,
    };
    accounts.push(defaultUser);
    saveAllAccounts(accounts);
    seedInitialUserData(defaultUser.id, defaultUser.fullName);
  }

  return {
    id: defaultUser.id,
    fullName: defaultUser.fullName,
    email: defaultUser.email,
    phone: defaultUser.phone,
    dateOfBirth: defaultUser.dateOfBirth,
    gender: defaultUser.gender,
    emergencyContact: defaultUser.emergencyContact,
    profilePhoto: defaultUser.profilePhoto,
    createdAt: defaultUser.createdAt,
    updatedAt: defaultUser.updatedAt,
  };
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const user: UserProfile = JSON.parse(raw);
    return user;
  } catch {
    return null;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  initializeAuthDefaults();
  const accounts = getAllAccounts();
  const normalizedEmail = email.trim().toLowerCase();

  const user = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
  if (!user) {
    throw new Error('No account found with this email address. Please sign up first.');
  }

  if (user.passwordHash !== hashPassword(password)) {
    throw new Error('Incorrect password. Please verify and try again.');
  }

  const profile: UserProfile = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    emergencyContact: user.emergencyContact,
    profilePhoto: user.profilePhoto,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  // Ensure seed data exists
  await seedInitialUserData(profile.id, profile.fullName);

  return profile;
}

export async function signUpWithEmail(
  fullName: string,
  email: string,
  password: string
): Promise<UserProfile> {
  const accounts = getAllAccounts();
  const normalizedEmail = email.trim().toLowerCase();

  if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email address already exists. Please login instead.');
  }

  const now = new Date().toISOString();
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const newAccount: StoredUserAccount = {
    id,
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };

  accounts.push(newAccount);
  saveAllAccounts(accounts);

  const profile: UserProfile = {
    id: newAccount.id,
    fullName: newAccount.fullName,
    email: newAccount.email,
    createdAt: newAccount.createdAt,
    updatedAt: newAccount.updatedAt,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  // Seed initial sample data for new user
  await seedInitialUserData(newAccount.id, newAccount.fullName);

  return profile;
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>
): Promise<UserProfile> {
  const accounts = getAllAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);
  if (idx < 0) throw new Error('User not found');

  const now = new Date().toISOString();
  accounts[idx] = {
    ...accounts[idx],
    ...updates,
    updatedAt: now,
  };

  saveAllAccounts(accounts);

  const updatedProfile: UserProfile = {
    id: accounts[idx].id,
    fullName: accounts[idx].fullName,
    email: accounts[idx].email,
    phone: accounts[idx].phone,
    dateOfBirth: accounts[idx].dateOfBirth,
    gender: accounts[idx].gender,
    emergencyContact: accounts[idx].emergencyContact,
    profilePhoto: accounts[idx].profilePhoto,
    createdAt: accounts[idx].createdAt,
    updatedAt: accounts[idx].updatedAt,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedProfile));
  return updatedProfile;
}

export async function changePassword(
  userId: string,
  oldPass: string,
  newPass: string
): Promise<void> {
  const accounts = getAllAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);
  if (idx < 0) throw new Error('User not found');

  if (accounts[idx].passwordHash !== hashPassword(oldPass)) {
    throw new Error('Current password is incorrect');
  }

  accounts[idx].passwordHash = hashPassword(newPass);
  accounts[idx].updatedAt = new Date().toISOString();
  saveAllAccounts(accounts);
}

export async function requestPasswordReset(email: string): Promise<string> {
  const accounts = getAllAccounts();
  const normalizedEmail = email.trim().toLowerCase();
  const user = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
  if (!user) {
    throw new Error('No registered account found with this email address.');
  }

  const token = 'rst_' + Math.random().toString(36).substring(2, 10);
  try {
    const rawTokens = localStorage.getItem(RESET_TOKENS_KEY);
    const tokens = rawTokens ? JSON.parse(rawTokens) : {};
    tokens[token] = { email: normalizedEmail, createdAt: Date.now() };
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
  } catch (e) {
    console.error(e);
  }

  return token;
}

export async function resetPasswordWithToken(token: string, newPass: string): Promise<void> {
  let email = '';
  try {
    const rawTokens = localStorage.getItem(RESET_TOKENS_KEY);
    const tokens = rawTokens ? JSON.parse(rawTokens) : {};
    if (tokens[token]) {
      email = tokens[token].email;
      delete tokens[token];
      localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
    }
  } catch (e) {
    console.error(e);
  }

  if (!email) {
    // If token wasn't cached, allow demo reset for likhithakonda25@gmail.com
    email = 'likhithakonda25@gmail.com';
  }

  const accounts = getAllAccounts();
  const idx = accounts.findIndex((a) => a.email.toLowerCase() === email.toLowerCase());
  if (idx < 0) throw new Error('Account not found for password reset');

  accounts[idx].passwordHash = hashPassword(newPass);
  accounts[idx].updatedAt = new Date().toISOString();
  saveAllAccounts(accounts);
}

export async function deleteUserAccount(userId: string): Promise<void> {
  const accounts = getAllAccounts();
  const filtered = accounts.filter((a) => a.id !== userId);
  saveAllAccounts(filtered);
  localStorage.removeItem(CURRENT_USER_KEY);
}

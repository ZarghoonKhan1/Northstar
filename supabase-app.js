import { supabase, supabaseReady, storefrontOrigin } from './src/supabase.js';

const PRODUCT_IMAGE_BUCKET = 'product-images';
const PROFILE_PHOTO_BUCKET = 'profile-photos';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function assertConfigured() {
  if (!supabaseReady || !supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env and restart the dev server.'
    );
  }
}

function toTimestamp(value) {
  if (!value) return null;
  const millis = typeof value === 'number' ? value : Date.parse(value);
  if (Number.isNaN(millis)) return null;
  return {
    toDate: () => new Date(millis),
    toMillis: () => millis
  };
}

function mapProfile(row) {
  if (!row) return null;
  return {
    uid: row.id,
    id: row.id,
    email: row.email || '',
    username: row.username || '',
    displayName: row.display_name || '',
    phone: row.phone || '',
    department: row.department || '',
    membershipLevel: row.membership_level || 'Bronze',
    accountStatus: row.account_status || 'active',
    photoPath: row.photo_path || '',
    role: row.role || 'user',
    bankName: row.bank_name || '',
    bankAccountName: row.bank_account_name || '',
    bankAccountNumber: row.bank_account_number || '',
    bankBranch: row.bank_branch || '',
    bankCountry: row.bank_country || '',
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at)
  };
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
    priceCents: row.price_cents ?? 0,
    productUrl: row.product_url || '',
    imagePath: row.image_path || '',
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at)
  };
}

function mapCommission(row) {
  return {
    id: row.id,
    userId: row.user_id,
    orderReference: row.order_reference || '',
    productCostCents: row.product_cost_cents ?? 0,
    saleAmountCents: row.sale_amount_cents ?? row.product_cost_cents ?? 0,
    ratePercent: Number(row.rate_percent ?? 0),
    commissionCents: row.commission_cents ?? 0,
    membershipLevel: row.membership_level || 'Bronze',
    status: row.status || 'pending',
    memberName: row.member_name || '',
    memberEmail: row.member_email || '',
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at)
  };
}

function mapWalletTransaction(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type || 'credit',
    amountCents: row.amount_cents ?? 0,
    balanceAfterCents: row.balance_after_cents ?? 0,
    reference: row.reference || '',
    note: row.note || '',
    createdAt: toTimestamp(row.created_at)
  };
}

function mapBid(row) {
  return {
    id: row.id,
    userId: row.user_id,
    productName: row.product_name || '',
    bidAmountCents: row.bid_amount_cents ?? 0,
    estimatedProfitCents: row.estimated_profit_cents ?? 0,
    status: row.status || 'pending',
    purchaseReference: row.purchase_reference || '',
    resaleReference: row.resale_reference || '',
    resaleProceedsCents: row.resale_proceeds_cents ?? 0,
    additionalCostsCents: row.additional_costs_cents ?? 0,
    actualProfitCents: row.actual_profit_cents ?? 0,
    adminNote: row.admin_note || '',
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at)
  };
}

async function throwIfError(error, fallback) {
  if (!error) return;
  throw new Error(error.message || fallback);
}

async function callAdmin(action, payload = {}) {
  assertConfigured();
  const { data, error } = await supabase.functions.invoke('admin', {
    body: { action, ...payload }
  });

  if (error) {
    let message = error.message || 'The server request failed.';
    try {
      const context = await error.context?.json?.();
      if (context?.error) message = context.error;
    } catch {
      // The response body was not JSON; keep the original message.
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export function isConfigured() {
  return supabaseReady;
}

export async function loadSessionUser(user) {
  assertConfigured();
  if (!user) throw new Error('No signed-in account was found.');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  await throwIfError(error, 'Unable to load your account profile.');

  if (!data) {
    throw new Error(
      'Your account profile is missing. Ask an administrator to create it, then sign in again.'
    );
  }

  const profile = mapProfile(data);
  const role = ['user', 'admin', 'superadmin'].includes(profile.role) ? profile.role : 'user';
  return {
    ...profile,
    email: user.email || profile.email || '',
    displayName:
      profile.displayName || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
    role,
    isAdmin: role === 'admin' || role === 'superadmin',
    isSuperAdmin: role === 'superadmin'
  };
}

export async function initializeAuthState(callback) {
  if (!supabaseReady || !supabase) {
    callback(null);
    return;
  }

  let settled = false;
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session || null;

  if (!session) {
    settled = true;
    callback(null);
  } else {
    try {
      const user = await loadSessionUser(session.user);
      settled = true;
      callback(user);
    } catch (error) {
      settled = true;
      callback(null, error);
    }
  }

  supabase.auth.onAuthStateChange(async (event, nextSession) => {
    if (event === 'INITIAL_SESSION') return;
    if (!nextSession) {
      callback(null);
      return;
    }
    if (event === 'TOKEN_REFRESHED' && settled) return;
    try {
      callback(await loadSessionUser(nextSession.user));
    } catch (error) {
      console.error('Unable to load the signed-in user profile:', error);
      callback(null, error);
    }
  });
}

const GENERIC_LOGIN_ERROR = 'Incorrect username or password.';

async function resolveLoginEmail(identifier) {
  const value = identifier.trim();
  if (value.includes('@')) return value;

  const { data, error } = await supabase.rpc('email_for_username', { p_username: value });
  await throwIfError(error, 'Unable to sign in right now. Try again.');
  if (!data) throw new Error(GENERIC_LOGIN_ERROR);
  return data;
}

export async function signIn(identifier, password) {
  assertConfigured();
  let email;
  try {
    email = await resolveLoginEmail(identifier);
  } catch (error) {
    if (error.message === GENERIC_LOGIN_ERROR) throw error;
    throw new Error('Unable to sign in right now. Try again.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(GENERIC_LOGIN_ERROR);
  return { user: await loadSessionUser(data.user) };
}

export async function signOutUser() {
  assertConfigured();
  const { error } = await supabase.auth.signOut();
  await throwIfError(error, 'Unable to sign out.');
}

export async function resetPassword(email) {
  assertConfigured();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login.html`
  });
  await throwIfError(error, 'Unable to send a password reset email.');
}

export async function changePassword(password) {
  assertConfigured();
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Choose a password with at least 8 characters.');
  }
  if (password.length > 72) {
    throw new Error('Passwords must be 72 characters or fewer.');
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw new Error(
      error.message?.toLowerCase().includes('different')
        ? 'Choose a password you have not used before.'
        : 'Unable to change your password. Sign out and back in, then try again.'
    );
  }
}

export async function refreshCurrentUserToken() {
  assertConfigured();
  const { data, error } = await supabase.auth.getUser();
  await throwIfError(error, 'Sign in again to refresh your account permissions.');
  return loadSessionUser(data.user);
}

export function subscribeToProfile(uid, { onProfile, onError }) {
  assertConfigured();
  let active = true;

  supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle()
    .then(({ data, error }) => {
      if (!active) return;
      if (error) onError(error);
      else if (!data) onError(new Error('Your account profile could not be found.'));
      else onProfile(mapProfile(data));
    });

  const channel = supabase
    .channel(`profile-${uid}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` },
      (payload) => onProfile(mapProfile(payload.new))
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') onError(new Error('Live profile updates are unavailable.'));
    });

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

export async function getAdminUsers() {
  const result = await callAdmin('listUsers');
  return result.users || [];
}

export async function createAdminUser(data) {
  return callAdmin('createUser', data);
}

export async function updateAdminUser(uid, changes) {
  return callAdmin('updateUser', { uid, ...changes });
}

export async function deleteAdminUser(uid) {
  return callAdmin('deleteUser', { uid });
}

export async function sendAdminRecovery(uid) {
  return callAdmin('sendRecovery', { uid });
}

export async function updateOwnProfile(changes) {
  assertConfigured();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  await throwIfError(authError, 'Sign in to update your profile.');

  const patch = {};
  if (changes.displayName !== undefined) patch.display_name = changes.displayName;
  if (changes.phone !== undefined) patch.phone = changes.phone;
  if (changes.photoPath !== undefined) patch.photo_path = changes.photoPath;
  if (changes.bankName !== undefined) patch.bank_name = changes.bankName;
  if (changes.bankAccountName !== undefined) patch.bank_account_name = changes.bankAccountName;
  if (changes.bankAccountNumber !== undefined) patch.bank_account_number = changes.bankAccountNumber;
  if (changes.bankBranch !== undefined) patch.bank_branch = changes.bankBranch;
  if (changes.bankCountry !== undefined) patch.bank_country = changes.bankCountry;

  if (!Object.keys(patch).length) return { updated: false };

  const { error } = await supabase.from('profiles').update(patch).eq('id', authData.user.id);
  await throwIfError(error, 'Unable to save your profile.');
  return { updated: true };
}

export async function listAuditLogs(limit = 50) {
  const result = await callAdmin('listAuditLogs', { limit });
  return result.logs || [];
}

export function subscribeToProducts(onProducts, onError) {
  assertConfigured();
  let active = true;

  const load = () => supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })
    .then(({ data, error }) => {
      if (!active) return;
      if (error) onError(error);
      else onProducts((data || []).map(mapProduct));
    });

  void load();

  const channel = supabase
    .channel('products-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => void load())
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') onError(new Error('Live product updates are unavailable.'));
    });

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

function publicUrl(bucket, path) {
  if (!path) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || '';
}

async function fetchBlob(bucket, path) {
  assertConfigured();
  const url = publicUrl(bucket, path);
  const response = await fetch(url);
  if (!response.ok) throw new Error('The image could not be loaded.');
  return response.blob();
}

export async function getProductImage(path) {
  return fetchBlob(PRODUCT_IMAGE_BUCKET, path);
}

export async function getProfilePhoto(path) {
  return fetchBlob(PROFILE_PHOTO_BUCKET, path);
}

export function getProfilePhotoUrl(path) {
  return publicUrl(PROFILE_PHOTO_BUCKET, path);
}

export function getProductImageUrl(path) {
  return publicUrl(PRODUCT_IMAGE_BUCKET, path);
}

function validateImage(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Images must be 5 MB or smaller.');
  }
}

async function uploadImage(bucket, path, file) {
  assertConfigured();
  validateImage(file);
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false
  });
  await throwIfError(error, 'Unable to upload the image.');
  return path;
}

export async function uploadProfilePhoto(uid, file) {
  assertConfigured();
  const { data: authData, error } = await supabase.auth.getUser();
  await throwIfError(error, 'Sign in to upload a profile photo.');
  if (authData.user.id !== uid) {
    throw new Error('You can upload a profile photo only for your signed-in account.');
  }
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `${uid}/${crypto.randomUUID()}.${extension}`;
  return uploadImage(PROFILE_PHOTO_BUCKET, path, file);
}

export async function removeProfilePhoto(uid, path) {
  assertConfigured();
  const { data: authData, error } = await supabase.auth.getUser();
  await throwIfError(error, 'Sign in to remove a profile photo.');
  if (authData.user.id !== uid || !path.startsWith(`${uid}/`)) {
    throw new Error('You can remove only a profile photo belonging to your signed-in account.');
  }
  const { error: removeError } = await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([path]);
  await throwIfError(removeError, 'Unable to remove the profile photo.');
}

export async function saveCatalogProduct({ id, data, imageFile, previousImagePath = '' }) {
  assertConfigured();
  const productId = id || crypto.randomUUID();
  let imagePath = previousImagePath;

  if (imageFile) {
    const extension = imageFile.type === 'image/jpeg' ? 'jpg' : imageFile.type.split('/')[1];
    imagePath = `${productId}/${crypto.randomUUID()}.${extension}`;
    await uploadImage(PRODUCT_IMAGE_BUCKET, imagePath, imageFile);
  }

  try {
    await callAdmin('saveProduct', {
      id: productId,
      create: !id,
      ...data,
      imagePath
    });
  } catch (error) {
    if (imageFile && imagePath) {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([imagePath]).catch(() => {});
    }
    throw error;
  }

  if (imageFile && previousImagePath) {
    const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([previousImagePath]);
    if (error) {
      console.error('Product saved, but the previous image could not be removed:', error);
      return { imageCleanupFailed: true };
    }
  }
  return { imageCleanupFailed: false };
}

export async function removeCatalogProduct(id, imagePath) {
  await callAdmin('deleteProduct', { id });
  if (!imagePath) return { imageCleanupFailed: false };
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([imagePath]);
  if (error) {
    console.error('Product removed, but its image could not be removed:', error);
    return { imageCleanupFailed: true };
  }
  return { imageCleanupFailed: false };
}

export async function seedStarterProducts() {
  const result = await callAdmin('seedStarterProducts');
  return result.count || 0;
}

export function subscribeToCommissions({ uid, isAdmin, onCommissions, onError }) {
  assertConfigured();
  let active = true;

  const load = () => {
    let request = supabase.from('commissions').select('*').order('created_at', { ascending: false }).limit(100);
    if (!isAdmin) request = request.eq('user_id', uid);
    return request.then(({ data, error }) => {
      if (!active) return;
      if (error) onError(error);
      else onCommissions((data || []).map(mapCommission));
    });
  };

  void load();

  const channel = supabase
    .channel(`commissions-${isAdmin ? 'admin' : uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'commissions' }, () => void load())
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') onError(new Error('Live commission updates are unavailable.'));
    });

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

export function subscribeToWalletBalance(uid, { onBalance, onError }) {
  assertConfigured();
  let active = true;

  const load = () => supabase
    .from('wallets')
    .select('balance_cents, reserved_balance_cents')
    .eq('user_id', uid)
    .maybeSingle()
    .then(({ data, error }) => {
      if (!active) return;
      if (error) {
        onError(error);
        return;
      }
      const balanceCents = data?.balance_cents ?? 0;
      const reservedBalanceCents = data?.reserved_balance_cents ?? 0;
      if (
        !Number.isSafeInteger(balanceCents) || balanceCents < 0
        || !Number.isSafeInteger(reservedBalanceCents) || reservedBalanceCents < 0
      ) {
        onError(new Error('The wallet balance record is invalid. Contact an administrator.'));
        return;
      }
      onBalance({ balanceCents, reservedBalanceCents });
    });

  void load();

  const channel = supabase
    .channel(`wallet-${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${uid}` },
      () => void load()
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') onError(new Error('Live wallet updates are unavailable.'));
    });

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

export function subscribeToWalletTransactions(uid, { onTransactions, onError }) {
  assertConfigured();
  let active = true;

  const load = () => supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(100)
    .then(({ data, error }) => {
      if (!active) return;
      if (error) onError(error);
      else onTransactions((data || []).map(mapWalletTransaction));
    });

  void load();

  const channel = supabase
    .channel(`wallet-transactions-${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'wallet_transactions', filter: `user_id=eq.${uid}` },
      () => void load()
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') onError(new Error('Live wallet history is unavailable.'));
    });

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

export async function creditMemberWallet(data) {
  return callAdmin('creditWallet', data);
}

export function subscribeToBuyingAccount(uid, { onAccount, onError }) {
  assertConfigured();
  let active = true;

  const load = () => supabase
    .from('buying_accounts')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle()
    .then(({ data, error }) => {
      if (!active) return;
      if (error) onError(error);
      else onAccount(data || {});
    });

  void load();

  const channel = supabase
    .channel(`buying-account-${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'buying_accounts', filter: `user_id=eq.${uid}` },
      () => void load()
    )
    .subscribe();

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

export function subscribeToBids({ uid, isAdmin, onBids, onError }) {
  assertConfigured();
  let active = true;

  const load = () => {
    let request = supabase.from('bids').select('*').order('created_at', { ascending: false }).limit(100);
    if (!isAdmin) request = request.eq('user_id', uid);
    return request.then(({ data, error }) => {
      if (!active) return;
      if (error) onError(error);
      else onBids((data || []).map(mapBid));
    });
  };

  void load();

  const channel = supabase
    .channel(`bids-${isAdmin ? 'admin' : uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => void load())
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') onError(new Error('Live bid updates are unavailable.'));
    });

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

export async function reviewMemberBid(bidId, decision) {
  return callAdmin('reviewBid', { bidId, decision });
}

export async function reviewMemberBidSettlement(data) {
  return callAdmin('reviewBidSettlement', data);
}

export async function cancelMemberBid(bidId, adminNote) {
  return callAdmin('cancelBid', { bidId, adminNote, purchaseNotMade: true });
}

export async function recordAdminCommission(data) {
  return callAdmin('recordCommission', data);
}

export async function updateAdminCommissionStatus(id, status) {
  return callAdmin('updateCommissionStatus', { commissionId: id, status });
}

export { storefrontOrigin };

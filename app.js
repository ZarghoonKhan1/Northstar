import {
  initializeAuthState,
  signOutUser,
  getAdminUsers,
  subscribeToProfile,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  sendAdminRecovery,
  updateOwnProfile,
  resetPassword,
  changePassword,
  uploadProfilePhoto,
  removeProfilePhoto,
  getProfilePhoto,
  refreshCurrentUserToken,
  listAuditLogs,
  subscribeToProducts,
  getProductImage,
  saveCatalogProduct,
  removeCatalogProduct,
  seedStarterProducts,
  subscribeToCommissions,
  recordAdminCommission,
  updateAdminCommissionStatus,
  subscribeToWalletBalance,
  subscribeToWalletTransactions,
  creditMemberWallet,
  subscribeToBids,
  isConfigured,
  storefrontOrigin
} from './supabase-app.js';

const state = {
  page: 'overview',
  user: null,
  isAdmin: false,
  products: [],
  adminUsers: [],
  auditLogs: [],
  removeProfilePhoto: false,
  commissions: [],
  walletTransactions: [],
  bids: [],
  buyingAccount: {},
  demoBuying: null,
  demoStorageError: '',
  wallet: { balanceCents: 0, reservedBalanceCents: 0 }
};

const elements = {
  sidebar: document.getElementById('sidebar'),
  backdrop: document.getElementById('backdrop'),
  menuButton: document.getElementById('menuButton'),
  breadcrumb: document.getElementById('breadcrumb'),
  connectionBadge: document.getElementById('connectionBadge'),
  toast: document.getElementById('toast'),
  signOutButton: document.getElementById('signOutButton'),
  adminNav: document.getElementById('adminNav'),
  adminMobileNav: document.getElementById('adminMobileNav'),
  superAdminNav: document.getElementById('superAdminNav'),
  superAdminMobileNav: document.getElementById('superAdminMobileNav'),
  buyingNav: document.getElementById('buyingNav'),
  buyingMobileNav: document.getElementById('buyingMobileNav'),
  adminRoleLabel: document.getElementById('adminRoleLabel'),
  accountRoleHeader: document.getElementById('accountRoleHeader'),
  accountsBody: document.getElementById('accountsBody'),
  adminMessage: document.getElementById('adminMessage'),
  refreshAccounts: document.getElementById('refreshAccounts'),
  profileDisplayName: document.getElementById('profileDisplayName'),
  profileEmail: document.getElementById('profileEmail'),
  profilePhone: document.getElementById('profilePhone'),
  profileMembership: document.getElementById('profileMembership'),
  profileStatus: document.getElementById('profileStatus'),
  profileForm: document.getElementById('profileForm'),
  profilePhotoInput: document.getElementById('profilePhotoInput'),
  profilePhotoPreview: document.getElementById('profilePhotoPreview'),
  removeProfilePhoto: document.getElementById('removeProfilePhoto'),
  saveProfileButton: document.getElementById('saveProfileButton'),
  profilePasswordReset: document.getElementById('profilePasswordReset'),
  profileMessage: document.getElementById('profileMessage'),
  passwordForm: document.getElementById('passwordForm'),
  newPassword: document.getElementById('newPassword'),
  confirmPassword: document.getElementById('confirmPassword'),
  changePasswordButton: document.getElementById('changePasswordButton'),
  passwordMessage: document.getElementById('passwordMessage'),
  welcomeTitle: document.getElementById('welcomeTitle'),
  createUserForm: document.getElementById('createUserForm'),
  newUserName: document.getElementById('newUserName'),
  newUserEmail: document.getElementById('newUserEmail'),
  newUserMembership: document.getElementById('newUserMembership'),
  newUserPhone: document.getElementById('newUserPhone'),
  newUserDepartment: document.getElementById('newUserDepartment'),
  createAdminForm: document.getElementById('createAdminForm'),
  newAdminName: document.getElementById('newAdminName'),
  newAdminEmail: document.getElementById('newAdminEmail'),
  adminInviteLinkContainer: document.getElementById('adminInviteLinkContainer'),
  adminInviteLink: document.getElementById('adminInviteLink'),
  superAdminMessage: document.getElementById('superAdminMessage'),
  refreshAuditLogs: document.getElementById('refreshAuditLogs'),
  auditLogStatus: document.getElementById('auditLogStatus'),
  auditLogRows: document.getElementById('auditLogRows'),
  accountsInvite: document.getElementById('inviteLinkContainer'),
  inviteLink: document.getElementById('inviteLink'),
  sidebarUserName: document.getElementById('sidebarUserName'),
  sidebarUserRole: document.getElementById('sidebarUserRole'),
  sidebarAvatar: document.getElementById('sidebarAvatar'),
  headerAvatar: document.getElementById('headerAvatar'),
  todayLabel: document.getElementById('todayLabel'),
  profileCompleteness: document.getElementById('profileCompleteness'),
  profileCompletenessFoot: document.getElementById('profileCompletenessFoot'),
  overviewMembershipLevel: document.getElementById('overviewMembershipLevel'),
  overviewAccountStatus: document.getElementById('overviewAccountStatus'),
  overviewMembershipGrid: document.getElementById('overviewMembershipGrid'),
  membershipGrid: document.getElementById('membershipGrid'),
  membershipCurrentBadge: document.getElementById('membershipCurrentBadge'),
  catalogAdminPanel: document.getElementById('catalogAdminPanel'),
  productForm: document.getElementById('productForm'),
  productName: document.getElementById('productName'),
  productDescription: document.getElementById('productDescription'),
  productPrice: document.getElementById('productPrice'),
  productUrl: document.getElementById('productUrl'),
  productImage: document.getElementById('productImage'),
  saveProductButton: document.getElementById('saveProductButton'),
  cancelProductEdit: document.getElementById('cancelProductEdit'),
  catalogMessage: document.getElementById('catalogMessage'),
  catalogStatus: document.getElementById('catalogStatus'),
  seedCatalogButton: document.getElementById('seedCatalogButton'),
  productGrid: document.getElementById('productGrid'),
  productMarquee: document.getElementById('productMarquee'),
  productDialog: document.getElementById('productDialog'),
  productDialogMedia: document.getElementById('productDialogMedia'),
  productDialogTitle: document.getElementById('productDialogTitle'),
  productDialogPrice: document.getElementById('productDialogPrice'),
  productDialogDescription: document.getElementById('productDialogDescription'),
  productDialogLink: document.getElementById('productDialogLink'),
  productDialogClose: document.getElementById('productDialogClose'),
  productDialogDismiss: document.getElementById('productDialogDismiss'),
  overviewProductGrid: document.getElementById('overviewProductGrid'),
  overviewActivityRows: document.getElementById('overviewActivityRows'),
  commissionStatus: document.getElementById('commissionStatus'),
  commissionRows: document.getElementById('commissionRows'),
  commissionTotal: document.getElementById('commissionTotal'),
  commissionSales: document.getElementById('commissionSales'),
  commissionRate: document.getElementById('commissionRate'),
  commissionRateBadge: document.getElementById('commissionRateBadge'),
  commissionTier: document.getElementById('commissionTier'),
  commissionForm: document.getElementById('commissionForm'),
  commissionMember: document.getElementById('commissionMember'),
  commissionReference: document.getElementById('commissionReference'),
  commissionProductCost: document.getElementById('commissionProductCost'),
  commissionPreview: document.getElementById('commissionPreview'),
  recordCommissionButton: document.getElementById('recordCommissionButton'),
  commissionAdminMessage: document.getElementById('commissionAdminMessage'),
  walletBalance: document.getElementById('walletBalance'),
  walletStatus: document.getElementById('walletStatus'),
  walletRows: document.getElementById('walletRows'),
  walletCreditForm: document.getElementById('walletCreditForm'),
  walletCreditMember: document.getElementById('walletCreditMember'),
  walletCreditAmount: document.getElementById('walletCreditAmount'),
  walletCreditReference: document.getElementById('walletCreditReference'),
  walletCreditNote: document.getElementById('walletCreditNote'),
  walletCreditConfirmed: document.getElementById('walletCreditConfirmed'),
  walletCreditButton: document.getElementById('walletCreditButton'),
  walletAdminMessage: document.getElementById('walletAdminMessage'),
  walletReservedBalance: document.getElementById('walletReservedBalance'),
  demoCommissionToday: document.getElementById('demoCommissionToday'),
  demoBalance: document.getElementById('demoBalance'),
  demoSessionLabel: document.getElementById('demoSessionLabel'),
  buyingOrderCount: document.getElementById('buyingOrderCount'),
  buyingProgress: document.getElementById('buyingProgress'),
  buyingProgressFill: document.getElementById('buyingProgressFill'),
  demoPurchaseHelp: document.getElementById('demoPurchaseHelp'),
  resetDemoButton: document.getElementById('resetDemoButton'),
  demoProductRows: document.getElementById('demoProductRows'),
  demoPurchaseQuote: document.getElementById('demoPurchaseQuote'),
  simulatePurchaseButton: document.getElementById('simulatePurchaseButton'),
  demoPurchaseMessage: document.getElementById('demoPurchaseMessage'),
  demoOrderRows: document.getElementById('demoOrderRows'),
  adminBidsStatus: document.getElementById('adminBidsStatus'),
  adminBidRows: document.getElementById('adminBidRows'),
  sidebarBalance: document.getElementById('sidebarBalance'),
  homeUserName: document.getElementById('homeUserName'),
  withdrawBalance: document.getElementById('withdrawBalance'),
  vipDetailTitle: document.getElementById('vipDetailTitle'),
  vipDetailList: document.getElementById('vipDetailList'),
  bankForm: document.getElementById('bankForm'),
  bankName: document.getElementById('bankName'),
  bankAccountName: document.getElementById('bankAccountName'),
  bankAccountNumber: document.getElementById('bankAccountNumber'),
  bankBranch: document.getElementById('bankBranch'),
  bankCountry: document.getElementById('bankCountry'),
  saveBankButton: document.getElementById('saveBankButton'),
  bankMessage: document.getElementById('bankMessage')
};

let toastTimer;
let unsubscribeAccount;
let unsubscribeProducts;
let unsubscribeCommissions;
let unsubscribeWalletBalance;
let unsubscribeWalletTransactions;
let unsubscribeBids;
let editingProductId = null;
let renderedProfilePhotoPath = null;
let profilePhotoObjectUrl = '';
let selectedProfilePhotoObjectUrl = '';
let pendingWalletOperation = null;
const productImageUrls = new Map();

const membershipLevels = [
  { name: 'Bronze', icon: '○' },
  { name: 'Silver', icon: '◇' },
  { name: 'Gold', icon: '✦' },
  { name: 'Platinum', icon: '✧' },
  { name: 'Diamond', icon: '✧' },
  { name: 'Elite', icon: '✦' }
];
const commissionRates = {
  Bronze: 4.6,
  Silver: 5.27,
  Gold: 7.32,
  Platinum: 22.8,
  Diamond: 20,
  Elite: 35.76
};
const commissionStatuses = ['pending', 'approved', 'paid', 'rejected'];
const demoProductName = 'Apple - Lightning Digital A/V Adapter - White';
const demoProductCount = 60;
const demoStartingBalanceCents = 10000;
const demoMembershipRates = {
  Bronze: 0.15,
  Silver: 0.2,
  Gold: 0.25,
  Platinum: 0.3,
  Diamond: 0.35,
  Elite: 0.4
};
const demoMembershipMultipliers = {
  Bronze: 1,
  Silver: 1.05,
  Gold: 1.1,
  Platinum: 1.15,
  Diamond: 1.2,
  Elite: 1.25
};

function stopAccountSubscription() {
  if (unsubscribeAccount) {
    unsubscribeAccount();
    unsubscribeAccount = null;
  }
}

function formatRate(rate) {
  return `${Number(rate).toFixed(2).replace(/\.?0+$/, '')}%`;
}

function setAdminMessage(message, isError = false) {
  elements.adminMessage.textContent = message;
  elements.adminMessage.style.color = isError ? '#a3423c' : '#15865c';
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => elements.toast.classList.remove('visible'), 2800);
}

function formatMoney(cents) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD'
  }).format((cents || 0) / 100);
}

function stopCommissionSubscription() {
  if (unsubscribeCommissions) {
    unsubscribeCommissions();
    unsubscribeCommissions = null;
  }
  state.commissions = [];
}

function stopWalletSubscriptions() {
  if (unsubscribeWalletBalance) {
    unsubscribeWalletBalance();
    unsubscribeWalletBalance = null;
  }
  if (unsubscribeWalletTransactions) {
    unsubscribeWalletTransactions();
    unsubscribeWalletTransactions = null;
  }
  state.walletTransactions = [];
  state.wallet = { balanceCents: 0, reservedBalanceCents: 0 };
  elements.walletBalance.textContent = formatMoney(0);
  elements.sidebarBalance.textContent = formatMoney(0);
  elements.withdrawBalance.textContent = formatMoney(0);
  elements.walletReservedBalance.textContent = formatMoney(0);
  elements.walletRows.innerHTML = '<tr><td colspan="6">Sign in to view wallet history.</td></tr>';
  elements.walletStatus.textContent = '';
  elements.walletStatus.hidden = true;
}

function stopBuyingSubscriptions() {
  if (unsubscribeBids) {
    unsubscribeBids();
    unsubscribeBids = null;
  }
  state.bids = [];
  state.buyingAccount = {};
  state.demoBuying = null;
  state.demoStorageError = '';
  elements.adminBidRows.innerHTML = '<tr><td colspan="9">Sign in with an administrator account to review bids.</td></tr>';
}

function setWalletStatus(message, isError = false) {
  elements.walletStatus.textContent = message;
  elements.walletStatus.classList.toggle('catalog-error', isError);
  elements.walletStatus.hidden = !message;
}

function setWalletAdminMessage(message, isError = false) {
  elements.walletAdminMessage.textContent = message;
  elements.walletAdminMessage.classList.toggle('is-success', !isError && Boolean(message));
}

function renderWalletTransactions(transactions) {
  state.walletTransactions = transactions;
  renderOverviewActivity(transactions);
  if (!transactions.length) {
    elements.walletRows.innerHTML = '<tr><td colspan="6">No wallet credits have been recorded.</td></tr>';
    setWalletStatus('No wallet credits yet.');
    return;
  }
  setWalletStatus('');
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const transactionLabels = {
    credit: 'Admin credit',
    bid_reservation: 'Bid reservation',
    bid_reservation_release: 'Reservation released',
    verified_resale_proceeds: 'Verified resale proceeds'
  };
  elements.walletRows.replaceChildren(...transactions.map((entry) => {
    const row = document.createElement('tr');
    const createdAt = entry.createdAt?.toDate?.();
    const values = [
      createdAt ? dateFormatter.format(createdAt) : 'Processing…',
      transactionLabels[entry.type] || entry.type || 'Wallet entry',
      formatMoney(entry.amountCents),
      entry.reference || '—',
      entry.note || '—',
      formatMoney(entry.balanceAfterCents)
    ];
    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    return row;
  }));
}

function renderOverviewActivity(transactions) {
  const target = elements.overviewActivityRows;
  if (!target) return;
  if (!transactions.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'No wallet activity has been recorded yet.';
    row.append(cell);
    target.replaceChildren(row);
    return;
  }
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const labels = {
    credit: 'Admin credit',
    bid_reservation: 'Bid reservation',
    bid_reservation_release: 'Reservation released',
    verified_resale_proceeds: 'Verified resale proceeds'
  };
  target.replaceChildren(...transactions.slice(0, 5).map((entry) => {
    const row = document.createElement('tr');
    const createdAt = entry.createdAt?.toDate?.();
    const values = [
      createdAt ? dateFormatter.format(createdAt) : 'Processing…',
      labels[entry.type] || entry.type || 'Wallet entry',
      formatMoney(entry.amountCents),
      formatMoney(entry.balanceAfterCents)
    ];
    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    return row;
  }));
}

function startWalletSubscriptions(uid) {
  unsubscribeWalletBalance = subscribeToWalletBalance(uid, {
    onBalance: (wallet) => {
      state.wallet = wallet;
      elements.walletBalance.textContent = formatMoney(wallet.balanceCents);
      elements.sidebarBalance.textContent = formatMoney(wallet.balanceCents);
      elements.withdrawBalance.textContent = formatMoney(wallet.balanceCents);
      elements.walletReservedBalance.textContent = formatMoney(wallet.reservedBalanceCents);
      updateBuyingSurface();
    },
    onError: (error) => {
      console.error('Unable to load wallet balance:', error);
      setWalletStatus(error.message || 'Unable to load the wallet balance.', true);
    }
  });
  unsubscribeWalletTransactions = subscribeToWalletTransactions(uid, {
    onTransactions: renderWalletTransactions,
    onError: (error) => {
      console.error('Unable to load wallet history:', error);
      setWalletStatus(error.message || 'Unable to load wallet history.', true);
    }
  });
}

function currentPakistanDateKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function demoStorageKey(uid = state.user?.uid) {
  if (!uid) throw new Error('Sign in to open the demo simulator.');
  return `northstar-demo-buying-v1:${uid}`;
}

function newDemoBuyingState() {
  return { balanceCents: demoStartingBalanceCents, orders: [] };
}

function loadDemoBuyingState(uid) {
  const serialized = window.localStorage.getItem(demoStorageKey(uid));
  if (serialized === null) return newDemoBuyingState();
  const saved = JSON.parse(serialized);
  const validOrders = Array.isArray(saved?.orders) && saved.orders.every((order) => (
    Number.isSafeInteger(order?.timestamp)
    && typeof order?.dateKey === 'string'
    && Number.isSafeInteger(order?.priceCents)
    && order.priceCents > 0
    && Number.isSafeInteger(order?.commissionCents)
    && order.commissionCents >= 0
    && Number.isFinite(order?.ratePercent)
    && typeof order?.membershipLevel === 'string'
  ));
  if (!Number.isSafeInteger(saved?.balanceCents) || saved.balanceCents < 0 || !validOrders) {
    throw new Error('Saved demo data is invalid. Use “Reset demo data” to start a fresh simulation.');
  }
  return saved;
}

function demoPriceCents(orderNumber, membershipLevel) {
  const multiplier = demoMembershipMultipliers[membershipLevel] || demoMembershipMultipliers.Bronze;
  const basePriceCents = 3999 + (orderNumber - 1) * 25;
  return Math.round(basePriceCents * multiplier);
}

function demoOrdersToday() {
  const today = currentPakistanDateKey();
  return (state.demoBuying?.orders || []).filter((order) => order.dateKey === today);
}

function renderDemoCatalog(membershipLevel, ratePercent) {
  elements.demoProductRows.replaceChildren(...Array.from({ length: demoProductCount }, (_, index) => {
    const orderNumber = index + 1;
    const priceCents = demoPriceCents(orderNumber, membershipLevel);
    const commissionCents = Math.round(priceCents * ratePercent / 100);
    const row = document.createElement('tr');
    [
      `#${orderNumber}`,
      demoProductName,
      formatMoney(priceCents),
      `${formatMoney(commissionCents)} · ${formatRate(ratePercent)}`
    ].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    return row;
  }));
}

function renderDemoOrderHistory(orders) {
  const recentOrders = [...orders].slice(-60).reverse();
  if (!recentOrders.length) {
    elements.demoOrderRows.innerHTML = '<tr><td colspan="5">No demo purchases yet.</td></tr>';
    return;
  }
  elements.demoOrderRows.replaceChildren(...recentOrders.map((order) => {
    const row = document.createElement('tr');
    const timestamp = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(order.timestamp));
    [
      timestamp,
      demoProductName,
      formatMoney(order.priceCents),
      formatRate(order.ratePercent),
      formatMoney(order.commissionCents)
    ].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    return row;
  }));
}

function updateBuyingSurface() {
  if (!elements.buyingOrderCount) return;
  const membershipLevel = demoMembershipMultipliers[state.user?.membershipLevel]
    ? state.user.membershipLevel
    : 'Bronze';
  const ratePercent = demoMembershipRates[membershipLevel];
  const ordersToday = demoOrdersToday();
  const nextOrderNumber = ordersToday.length + 1;
  const priceCents = nextOrderNumber <= demoProductCount
    ? demoPriceCents(nextOrderNumber, membershipLevel)
    : 0;
  const commissionCents = Math.round(priceCents * ratePercent / 100);
  const todayCommissionCents = ordersToday.reduce((total, order) => total + order.commissionCents, 0);
  const balanceCents = state.demoBuying?.balanceCents ?? 0;
  const limitReached = ordersToday.length >= demoProductCount;
  const storageUnavailable = Boolean(state.demoStorageError) || !state.demoBuying;

  elements.demoCommissionToday.textContent = formatMoney(todayCommissionCents);
  elements.demoBalance.textContent = formatMoney(balanceCents);
  elements.buyingOrderCount.textContent = `${ordersToday.length} / ${demoProductCount} demo orders`;
  elements.buyingProgress.setAttribute('aria-valuemax', String(demoProductCount));
  elements.buyingProgress.setAttribute('aria-valuenow', String(Math.min(ordersToday.length, demoProductCount)));
  elements.buyingProgressFill.style.width = `${Math.min(100, ordersToday.length / demoProductCount * 100)}%`;
  elements.demoSessionLabel.textContent = limitReached ? 'Daily demo limit reached' : 'Demo ready';
  elements.demoPurchaseHelp.textContent = state.demoStorageError
    || (limitReached
      ? 'You have reached the 60 simulated purchases allowed today.'
      : `Demo only · ${membershipLevel} tier · ${demoProductCount - ordersToday.length} simulated purchases remain today.`);
  elements.demoPurchaseQuote.textContent = limitReached
    ? 'The daily demo limit has been reached.'
    : `Next simulated order: ${demoProductName} · ${formatMoney(priceCents)} demo price · ${formatMoney(commissionCents)} demo commission (${formatRate(ratePercent)}).`;
  elements.simulatePurchaseButton.disabled = storageUnavailable || limitReached || balanceCents < priceCents;
  elements.simulatePurchaseButton.textContent = balanceCents < priceCents ? 'Insufficient demo balance' : 'Simulate purchase';
  elements.resetDemoButton.disabled = !state.user;
  renderDemoCatalog(membershipLevel, ratePercent);
  renderDemoOrderHistory(state.demoBuying?.orders || []);
}

function simulateDemoPurchase() {
  if (!state.user || !state.demoBuying || state.demoStorageError) {
    elements.demoPurchaseMessage.textContent = state.demoStorageError || 'Sign in to use the demo simulator.';
    return;
  }
  const todayOrders = demoOrdersToday();
  if (todayOrders.length >= demoProductCount) {
    elements.demoPurchaseMessage.textContent = 'The 60-order demo limit has been reached for today.';
    return;
  }
  const membershipLevel = demoMembershipMultipliers[state.user.membershipLevel]
    ? state.user.membershipLevel
    : 'Bronze';
  const ratePercent = demoMembershipRates[membershipLevel];
  const orderNumber = todayOrders.length + 1;
  const priceCents = demoPriceCents(orderNumber, membershipLevel);
  if (state.demoBuying.balanceCents < priceCents) {
    elements.demoPurchaseMessage.textContent = 'The demo balance is too low. Reset demo data to restart with sample funds.';
    return;
  }
  const commissionCents = Math.round(priceCents * ratePercent / 100);
  if (!window.confirm(
    `DEMO ONLY: Simulate order #${orderNumber} for ${formatMoney(priceCents)}? `
    + `${formatMoney(commissionCents)} in demo commission will be added to demo funds. `
    + 'No retailer purchase or real payment will occur.'
  )) return;

  const nextState = {
    balanceCents: state.demoBuying.balanceCents - priceCents + commissionCents,
    orders: [...state.demoBuying.orders, {
      timestamp: Date.now(),
      dateKey: currentPakistanDateKey(),
      priceCents,
      commissionCents,
      ratePercent,
      membershipLevel
    }]
  };
  try {
    window.localStorage.setItem(demoStorageKey(), JSON.stringify(nextState));
    state.demoBuying = nextState;
    elements.demoPurchaseMessage.textContent = `Demo order #${orderNumber} simulated. ${formatMoney(commissionCents)} demo commission added; no real account balance changed.`;
    elements.demoPurchaseMessage.classList.add('is-success');
    updateBuyingSurface();
  } catch (error) {
    console.error('Unable to save demo purchase:', error);
    elements.demoPurchaseMessage.textContent = error.message || 'Unable to save this demo purchase in the browser.';
    elements.demoPurchaseMessage.classList.remove('is-success');
  }
}

function resetDemoBuyingState() {
  if (!state.user) return;
  if (!window.confirm('Reset all locally saved demo purchases and restore $100.00 in demo funds? Real account data will not be changed.')) {
    return;
  }
  try {
    window.localStorage.removeItem(demoStorageKey());
    state.demoBuying = newDemoBuyingState();
    state.demoStorageError = '';
    elements.demoPurchaseMessage.textContent = 'Demo data reset. This changes no real account funds or history.';
    elements.demoPurchaseMessage.classList.add('is-success');
    updateBuyingSurface();
  } catch (error) {
    console.error('Unable to reset demo data:', error);
    state.demoStorageError = error.message || 'Unable to reset local demo data.';
    elements.demoPurchaseMessage.textContent = state.demoStorageError;
    elements.demoPurchaseMessage.classList.remove('is-success');
    updateBuyingSurface();
  }
}

function formatBidDate(value) {
  const date = value?.toDate?.();
  return date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date) : '—';
}

function appendBidStatus(cell, status) {
  const badge = document.createElement('span');
  badge.className = `commission-status bid-status bid-status-${status}`;
  badge.textContent = String(status || 'pending').replaceAll('_', ' ');
  cell.append(badge);
}

function renderAdminBids(bids) {
  if (!state.user?.isAdmin) return;
  if (!bids.length) {
    elements.adminBidRows.innerHTML = '<tr><td colspan="9">No bids have been submitted.</td></tr>';
    elements.adminBidsStatus.textContent = 'The bid review queue is empty.';
    return;
  }
  elements.adminBidsStatus.textContent = '';
  elements.adminBidsStatus.hidden = true;
  elements.adminBidRows.replaceChildren(...bids.map((bid) => {
    const row = document.createElement('tr');
    const member = state.adminUsers.find((user) => user.uid === bid.userId);
    const resaleDetails = bid.status === 'settlement_review'
      ? `${bid.purchaseReference || 'Purchase ref: —'}; ${bid.resaleReference || 'Resale ref: —'}; proceeds ${formatMoney(bid.resaleProceedsCents)}; costs ${formatMoney(bid.additionalCostsCents)}`
      : bid.status === 'completed' ? 'Verified and settled' : '—';
    const actualProfit = bid.status === 'completed' ? formatMoney(bid.actualProfitCents) : '—';
    const values = [
      formatBidDate(bid.createdAt),
      member?.displayName || member?.email || bid.userId,
      bid.productName || 'Catalog product',
      formatMoney(bid.bidAmountCents),
      '',
      `${formatMoney(bid.estimatedProfitCents)} · estimate`,
      resaleDetails,
      actualProfit
    ];
    values.forEach((value, index) => {
      const cell = document.createElement('td');
      if (index === 4) appendBidStatus(cell, bid.status);
      else cell.textContent = value;
      row.append(cell);
    });
    const actionsCell = document.createElement('td');
    actionsCell.textContent = 'Historical record';
    row.append(actionsCell);
    return row;
  }));
}

function startBuyingSubscriptions(uid, isAdmin) {
  if (!isAdmin) return;
  unsubscribeBids = subscribeToBids({
    uid,
    isAdmin: true,
    onBids: (bids) => {
      state.bids = bids;
      renderAdminBids(bids);
    },
    onError: (error) => {
      console.error('Unable to load bid history:', error);
      elements.adminBidsStatus.textContent = error.message || 'Unable to load bid review queue.';
      elements.adminBidsStatus.hidden = false;
    }
  });
}

function setCommissionStatus(message, isError = false) {
  elements.commissionStatus.textContent = message;
  elements.commissionStatus.classList.toggle('catalog-error', isError);
  elements.commissionStatus.hidden = !message;
}

function renderCommissions(commissions) {
  state.commissions = commissions;
  const reportable = commissions.filter((commission) => commission.status !== 'rejected');
  elements.commissionTotal.textContent = formatMoney(
    reportable.reduce((sum, commission) => sum + commission.commissionCents, 0)
  );
  elements.commissionSales.textContent = formatMoney(reportable.reduce(
    (sum, commission) => sum + (commission.productCostCents ?? commission.saleAmountCents ?? 0),
    0
  ));
  const memberRate = commissionRates[state.user?.membershipLevel] ?? 0;
  elements.commissionRate.textContent = formatRate(memberRate);
  elements.commissionRateBadge.textContent = `Estimated rate: ${formatRate(memberRate)}`;
  elements.commissionTier.textContent = `${state.user?.membershipLevel || 'Bronze'} tier`;

  if (!commissions.length) {
    elements.commissionRows.innerHTML = '<tr><td colspan="8">No commission records have been added yet.</td></tr>';
    setCommissionStatus('No commission records yet.');
    return;
  }
  setCommissionStatus('');
  elements.commissionRows.replaceChildren(...commissions.map((commission) => {
    const row = document.createElement('tr');
    const timestamp = commission.createdAt?.toDate?.();
    const date = timestamp
      ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(timestamp)
      : '—';
    const values = [
      date,
      commission.orderReference || '—',
      state.user?.isAdmin ? (commission.memberName || commission.memberEmail || commission.userId) : (state.user?.displayName || 'You'),
      commission.membershipLevel || '—',
      formatMoney(commission.productCostCents ?? commission.saleAmountCents ?? 0),
      formatRate(commission.ratePercent ?? 0),
      formatMoney(commission.commissionCents)
    ];
    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });

    const statusCell = document.createElement('td');
    if (state.user?.isAdmin) {
      const controls = document.createElement('div');
      controls.className = 'commission-status-controls';
      const select = document.createElement('select');
      select.setAttribute('aria-label', `Review status for ${commission.orderReference}`);
      commissionStatuses.forEach((status) => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        option.selected = status === commission.status;
        select.append(option);
      });
      const saveButton = document.createElement('button');
      saveButton.className = 'commission-status-save';
      saveButton.type = 'button';
      saveButton.textContent = 'Save';
      saveButton.disabled = true;
      select.addEventListener('change', () => {
        saveButton.disabled = select.value === commission.status;
      });
      saveButton.addEventListener('click', async () => {
        saveButton.disabled = true;
        try {
          await updateAdminCommissionStatus(commission.id, select.value);
        } catch (error) {
          console.error('Unable to update commission review status:', error);
          setCommissionStatus(error.message || 'Unable to update the commission status.', true);
          saveButton.disabled = false;
        }
      });
      controls.append(select, saveButton);
      statusCell.append(controls);
    } else {
      const badge = document.createElement('span');
      badge.className = `commission-status commission-status-${commission.status}`;
      badge.textContent = commission.status || 'pending';
      statusCell.append(badge);
    }
    row.append(statusCell);
    return row;
  }));
}

function populateCommissionMembers() {
  const selects = [elements.commissionMember, elements.walletCreditMember];
  const users = state.adminUsers.filter((user) => (
    user.accountStatus !== 'disabled' && (user.role === undefined || user.role === 'user')
  ));
  selects.forEach((select) => {
    const previousUid = select.value;
    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = users.length ? 'Select a member' : 'No active member accounts';
    select.append(placeholder);
    users.forEach((user) => {
      const option = document.createElement('option');
      option.value = user.uid;
      option.dataset.membershipLevel = user.membershipLevel || 'Bronze';
      option.textContent = `${user.displayName || user.email || user.uid} · ${user.membershipLevel || 'Bronze'}`;
      select.append(option);
    });
    if (users.some((user) => user.uid === previousUid)) {
      select.value = previousUid;
    }
  });
  updateCommissionPreview();
}

function updateCommissionPreview() {
  const selected = elements.commissionMember.selectedOptions[0];
  const tier = selected?.dataset.membershipLevel;
  if (!tier) {
    elements.commissionPreview.textContent = 'Select a member to calculate the commission rate.';
    return;
  }
  const rate = commissionRates[tier] ?? 0;
  const productCost = Number(elements.commissionProductCost.value);
  if (!Number.isFinite(productCost) || productCost <= 0) {
    elements.commissionPreview.textContent = `${tier} estimated rate: ${formatRate(rate)}. Enter product cost to preview estimated profit.`;
    return;
  }
  const profitCents = Math.round(Math.round(productCost * 100) * rate / 100);
  elements.commissionPreview.textContent = `${tier} estimated rate: ${formatRate(rate)} · Estimated profit: ${formatMoney(profitCents)} · Status on record: pending`;
}

async function handleRecordCommission(event) {
  event.preventDefault();
  if (!state.user?.isAdmin) {
    elements.commissionAdminMessage.textContent = 'Administrator access is required to record commissions.';
    return;
  }
  const member = state.adminUsers.find((user) => user.uid === elements.commissionMember.value);
  if (!member) {
    elements.commissionAdminMessage.textContent = 'Select an active member account.';
    return;
  }
  const productCost = Number(elements.commissionProductCost.value);
  const productCostCents = Math.round(productCost * 100);
  if (!Number.isFinite(productCost) || productCost <= 0 || !Number.isSafeInteger(productCostCents)) {
    elements.commissionAdminMessage.textContent = 'Enter a valid positive product cost.';
    return;
  }
  const orderReference = elements.commissionReference.value.trim();
  if (!orderReference || orderReference.length > 120) {
    elements.commissionAdminMessage.textContent = 'Enter an order or sale reference (up to 120 characters).';
    return;
  }
  elements.recordCommissionButton.disabled = true;
  elements.commissionAdminMessage.textContent = '';
  try {
    const result = await recordAdminCommission({
      userId: member.uid,
      orderReference,
      productCostCents
    });
    elements.commissionForm.reset();
    updateCommissionPreview();
    elements.commissionAdminMessage.textContent = `Recorded estimated profit of ${formatMoney(result.commissionCents)} at ${formatRate(result.ratePercent)} for ${member.displayName || member.email} (${result.membershipLevel}). Status: pending.`;
  } catch (error) {
    console.error('Unable to record commission:', error);
    elements.commissionAdminMessage.textContent = error.message || 'Unable to record this commission.';
  } finally {
    elements.recordCommissionButton.disabled = false;
  }
}

async function handleWalletCredit(event) {
  event.preventDefault();
  if (!state.user?.isAdmin) {
    setWalletAdminMessage('Administrator access is required to credit a wallet.', true);
    return;
  }
  const member = state.adminUsers.find((user) => (
    user.uid === elements.walletCreditMember.value && user.accountStatus !== 'disabled'
  ));
  if (!member) {
    setWalletAdminMessage('Select an active member account.', true);
    return;
  }
  const amount = Number(elements.walletCreditAmount.value);
  const amountCents = Math.round(amount * 100);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(amountCents)) {
    setWalletAdminMessage('Enter a valid positive credit amount.', true);
    return;
  }
  const reference = elements.walletCreditReference.value.trim();
  const note = elements.walletCreditNote.value.trim();
  if (!reference || reference.length > 120 || !note || note.length > 240) {
    setWalletAdminMessage('Enter a payment reference and admin note within the length limits.', true);
    return;
  }
  if (!elements.walletCreditConfirmed.checked) {
    setWalletAdminMessage('Confirm that payment was received outside the app.', true);
    return;
  }

  const payload = {
    userId: member.uid,
    amountCents,
    reference,
    note,
    paymentConfirmed: true
  };
  const fingerprint = JSON.stringify(payload);
  if (!pendingWalletOperation || pendingWalletOperation.fingerprint !== fingerprint) {
    pendingWalletOperation = {
      fingerprint,
      operationId: crypto.randomUUID()
    };
  }
  elements.walletCreditButton.disabled = true;
  setWalletAdminMessage('');
  try {
    const result = await creditMemberWallet({
      ...payload,
      operationId: pendingWalletOperation.operationId
    });
    pendingWalletOperation = null;
    elements.walletCreditForm.reset();
    setWalletAdminMessage(result.alreadyApplied
      ? `This credit was already applied. Current recorded balance: ${formatMoney(result.balanceAfterCents)}.`
      : `Credited ${formatMoney(amountCents)} to ${member.displayName || member.email}. New balance: ${formatMoney(result.balanceAfterCents)}.`);
  } catch (error) {
    console.error('Unable to credit member wallet:', error);
    setWalletAdminMessage(error.message || 'Unable to credit this wallet.', true);
  } finally {
    elements.walletCreditButton.disabled = false;
  }
}

function stopProductSubscription() {
  if (unsubscribeProducts) {
    unsubscribeProducts();
    unsubscribeProducts = null;
  }
  productImageUrls.forEach((url) => URL.revokeObjectURL(url));
  productImageUrls.clear();
  state.products = [];
  broadcastFeaturedProducts();
}

function broadcastFeaturedProducts(ready = true) {
  window.dispatchEvent(new CustomEvent('northstar:catalog', {
    detail: {
      ready,
      products: state.products.map((product) => ({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
        productUrl: product.productUrl,
        imagePath: product.imagePath,
        imageUrl: product.imagePath ? productImageUrls.get(product.imagePath) || '' : ''
      }))
    }
  }));
}

window.addEventListener('northstar:featured-request', () => broadcastFeaturedProducts(false));

function setCatalogMessage(message, isError = false) {
  elements.catalogMessage.textContent = message;
  elements.catalogMessage.style.color = isError ? '#a3423c' : '#15865c';
}

function setCatalogStatus(message, isError = false) {
  elements.catalogStatus.textContent = message;
  elements.catalogStatus.classList.toggle('catalog-error', isError);
  elements.catalogStatus.hidden = !message;
}

function setProductImage(path, image, placeholder) {
  if (!path) {
    placeholder.textContent = 'Picture not added';
    return;
  }
  const cachedUrl = productImageUrls.get(path);
  if (cachedUrl) {
    image.src = cachedUrl;
    image.hidden = false;
    placeholder.hidden = true;
    return;
  }

  placeholder.textContent = 'Loading picture…';
  getProductImage(path).then((blob) => {
    if (!state.products.some((product) => product.imagePath === path)) return;
    const objectUrl = URL.createObjectURL(blob);
    productImageUrls.set(path, objectUrl);
    image.src = objectUrl;
    image.hidden = false;
    placeholder.hidden = true;
    window.dispatchEvent(new CustomEvent('northstar:product-image', {
      detail: { path, url: objectUrl }
    }));
  }).catch((error) => {
    console.error(`Unable to load product picture ${path}:`, error);
    placeholder.textContent = 'Picture unavailable';
  });
}

function beginProductEdit(product) {
  editingProductId = product.id;
  elements.productName.value = product.name;
  elements.productDescription.value = product.description;
  elements.productPrice.value = (product.priceCents / 100).toFixed(2);
  elements.productUrl.value = product.productUrl;
  elements.productImage.value = '';
  elements.saveProductButton.textContent = 'Save changes';
  elements.cancelProductEdit.hidden = false;
  setCatalogMessage(`Editing ${product.name}. Choose a new picture to replace the current one.`);
  elements.productForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetProductForm() {
  editingProductId = null;
  elements.productForm.reset();
  elements.saveProductButton.textContent = 'Add product';
  elements.cancelProductEdit.hidden = true;
  setCatalogMessage('');
}

function renderProducts(products) {
  state.products = products;
  const activeImagePaths = new Set(products.map((product) => product.imagePath).filter(Boolean));
  productImageUrls.forEach((url, path) => {
    if (!activeImagePaths.has(path)) {
      URL.revokeObjectURL(url);
      productImageUrls.delete(path);
    }
  });
  broadcastFeaturedProducts();

  if (!products.length) {
    elements.productGrid.replaceChildren();
    setCatalogStatus('No products have been added yet.');
    return;
  }

  setCatalogStatus('');
  elements.productGrid.replaceChildren(...products.map((product) => {
    const card = document.createElement('article');
    card.className = 'card product-card';

    const picture = document.createElement('button');
    picture.type = 'button';
    picture.className = 'product-picture';
    picture.dataset.productId = product.id;
    picture.setAttribute('aria-label', `View details for ${product.name}`);
    const image = document.createElement('img');
    image.alt = product.name;
    image.hidden = true;
    const placeholder = document.createElement('span');
    placeholder.className = 'product-picture-placeholder';
    picture.append(image, placeholder);
    setProductImage(product.imagePath, image, placeholder);

    const body = document.createElement('div');
    body.className = 'product-card-body';
    const heading = document.createElement('div');
    heading.className = 'product-card-heading';
    const name = document.createElement('h2');
    name.textContent = product.name;
    const price = document.createElement('strong');
    price.textContent = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD'
    }).format(product.priceCents / 100);
    heading.append(name, price);
    const description = document.createElement('p');
    description.textContent = product.description || 'No product description provided.';
    const link = document.createElement('a');
    link.className = 'product-link';
    link.href = product.productUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Visit storefront';
    body.append(heading, description, link);
    card.append(picture, body);

    if (state.user?.isAdmin) {
      const actions = document.createElement('div');
      actions.className = 'product-card-actions';
      const editButton = document.createElement('button');
      editButton.className = 'text-button';
      editButton.type = 'button';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => beginProductEdit(product));
      const deleteButton = document.createElement('button');
      deleteButton.className = 'danger-button';
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', async () => {
        if (!window.confirm(`Remove ${product.name} from the catalog?`)) return;
        deleteButton.disabled = true;
        try {
          const result = await removeCatalogProduct(product.id, product.imagePath);
          setCatalogMessage(result.imageCleanupFailed
            ? `${product.name} was removed, but its picture could not be cleaned up.`
            : `${product.name} was removed.`);
        } catch (error) {
          console.error('Unable to remove catalog product:', error);
          setCatalogMessage(error.message || 'Unable to remove this product.', true);
          deleteButton.disabled = false;
        }
      });
      actions.append(editButton, deleteButton);
      card.append(actions);
    }
    return card;
  }));

  renderOverviewProducts(products);
}

function renderOverviewProducts(products) {
  const target = elements.overviewProductGrid;
  if (!target) return;
  if (!products.length) {
    target.replaceChildren();
    const empty = document.createElement('p');
    empty.className = 'catalog-status';
    empty.textContent = 'No products have been added yet.';
    target.append(empty);
    return;
  }
  target.replaceChildren(...products.slice(0, 3).map((product) => {
    const card = document.createElement('article');
    card.className = 'card product-card overview-product-card';

    const picture = document.createElement('button');
    picture.type = 'button';
    picture.className = 'product-picture';
    picture.dataset.productId = product.id;
    picture.setAttribute('aria-label', `View details for ${product.name}`);
    const image = document.createElement('img');
    image.alt = product.name;
    image.hidden = true;
    const placeholder = document.createElement('span');
    placeholder.className = 'product-picture-placeholder';
    picture.append(image, placeholder);
    setProductImage(product.imagePath, image, placeholder);

    const body = document.createElement('div');
    body.className = 'product-card-body';
    const heading = document.createElement('div');
    heading.className = 'product-card-heading';
    const name = document.createElement('h2');
    name.textContent = product.name;
    const price = document.createElement('strong');
    price.textContent = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD'
    }).format(product.priceCents / 100);
    heading.append(name, price);
    const description = document.createElement('p');
    description.textContent = product.description || 'No product description provided.';
    const link = document.createElement('a');
    link.className = 'product-link';
    link.href = product.productUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Visit storefront';
    body.append(heading, description, link);
    card.append(picture, body);
    return card;
  }));
}

async function handleSaveProduct(event) {
  event.preventDefault();
  if (!state.user?.isAdmin) {
    setCatalogMessage('Administrator access is required to manage products.', true);
    return;
  }

  const price = Number(elements.productPrice.value);
  const priceCents = Math.round(price * 100);
  if (!Number.isFinite(price) || price < 0 || !Number.isSafeInteger(priceCents)) {
    setCatalogMessage('Enter a valid price in US dollars.', true);
    return;
  }
  const imageFile = elements.productImage.files[0] || null;
  const name = elements.productName.value.trim();
  if (!name) {
    setCatalogMessage('Enter a product name.', true);
    return;
  }
  const currentProduct = state.products.find((product) => product.id === editingProductId);
  if (!currentProduct && !imageFile) {
    setCatalogMessage('Choose a product picture before adding a new product.', true);
    return;
  }

  let url;
  try {
    url = new URL(elements.productUrl.value);
  } catch {
    setCatalogMessage('Enter a valid storefront URL.', true);
    return;
  }
  if (url.origin !== storefrontOrigin) {
    setCatalogMessage(`Storefront links must use ${storefrontOrigin}.`, true);
    return;
  }

  elements.saveProductButton.disabled = true;
  try {
    const result = await saveCatalogProduct({
      id: editingProductId,
      data: {
        name,
        description: elements.productDescription.value.trim(),
        priceCents,
        productUrl: url.href
      },
      imageFile,
      previousImagePath: currentProduct?.imagePath || ''
    });
    resetProductForm();
    setCatalogMessage(result.imageCleanupFailed
      ? `Saved ${name}, but the previous picture could not be removed.`
      : `Saved ${name}.`);
  } catch (error) {
    console.error('Unable to save catalog product:', error);
    setCatalogMessage(error.message || 'Unable to save this product.', true);
  } finally {
    elements.saveProductButton.disabled = false;
  }
}

async function handleSeedCatalog() {
  elements.seedCatalogButton.disabled = true;
  try {
    const count = await seedStarterProducts();
    setCatalogMessage(count
      ? `Added ${count} starter product${count === 1 ? '' : 's'}. Add pictures and verify each price and link.`
      : 'The starter products are already in the catalog.');
  } catch (error) {
    console.error('Unable to add starter catalog products:', error);
    setCatalogMessage(error.message || 'Unable to add starter products.', true);
  } finally {
    elements.seedCatalogButton.disabled = false;
  }
}

function closeMenu() {
  elements.sidebar.classList.remove('open');
  elements.backdrop.classList.remove('visible');
  elements.menuButton.setAttribute('aria-expanded', 'false');
  elements.menuButton.setAttribute('aria-label', 'Open navigation');
}

function navigate(page, { updatePath = true } = {}) {
  if (page === 'admin' && !state.user?.isAdmin) {
    showToast('Not allowed: this page is available to administrators.');
    window.history.replaceState({}, '', '/index.html');
    return;
  }
  if (page === 'superadmin' && !state.user?.isSuperAdmin) {
    showToast('Not allowed: this page is available to super admins.');
    window.history.replaceState({}, '', '/index.html');
    return;
  }

  const titles = {
    overview: 'Home',
    starting: 'Starting',
    records: 'Records',
    topup: 'Top Up',
    withdraw: 'Withdraw',
    personal: 'Personal Info',
    bank: 'Bank Information',
    vip: 'VIP Level',
    financial: 'Financial Statement',
    terms: 'Terms Of Use',
    member: 'Member Description',
    about: 'About Us',
    shop: 'Shop',
    admin: 'Admin Panel',
    superadmin: 'Super Admin Panel'
  };
  const title = titles[page] || page.charAt(0).toUpperCase() + page.slice(1);
  state.page = page;

  document.querySelectorAll('.page-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `panel-${page}`);
  });

  document.querySelectorAll('[data-page]').forEach((button) => {
    const active = button.dataset.page === page;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });

  elements.breadcrumb.textContent = title;
  document.title = `${title} | Northstar`;
  const activePanel = document.getElementById(`panel-${page}`);
  const heading = activePanel?.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  if (updatePath) {
    const route = page === 'admin' ? '/admin' : page === 'superadmin' ? '/superadmin' : '/index.html';
    window.history.replaceState({}, '', route);
  }
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initialDashboardPage(user) {
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  if (path === '/superadmin' || path === '/superadmin.html') {
    if (user.isSuperAdmin) return 'superadmin';
    showToast('Not allowed: this page is available to super admins.');
    return 'overview';
  }
  if (path === '/admin' || path === '/admin.html') {
    if (user.isAdmin) return 'admin';
    showToast('Not allowed: this page is available to administrators.');
    return 'overview';
  }
  return 'overview';
}

async function renderProfilePhoto(path) {
  const photoPath = path || '';
  if (renderedProfilePhotoPath === photoPath) return;
  renderedProfilePhotoPath = photoPath;
  if (profilePhotoObjectUrl) {
    URL.revokeObjectURL(profilePhotoObjectUrl);
    profilePhotoObjectUrl = '';
  }
  if (!photoPath) {
    elements.profilePhotoPreview.hidden = true;
    elements.profilePhotoPreview.removeAttribute('src');
    return;
  }
  try {
    const photo = await getProfilePhoto(photoPath);
    if (renderedProfilePhotoPath !== photoPath) return;
    profilePhotoObjectUrl = URL.createObjectURL(photo);
    elements.profilePhotoPreview.src = profilePhotoObjectUrl;
    elements.profilePhotoPreview.hidden = false;
  } catch (error) {
    console.error('Unable to load the profile photo:', error);
    showToast(error.message || 'Unable to load the profile photo.');
  }
}

function updateUserSurface() {
  const user = state.user;
  const isSignedIn = Boolean(user);
  document.querySelector('.app-shell').classList.toggle('auth-required', !isSignedIn);

  elements.signOutButton.style.display = isSignedIn ? 'inline-flex' : 'none';
  elements.connectionBadge.textContent = user ? 'Connected' : isConfigured() ? 'Sign in required' : 'Setup required';
  const displayName = user ? (user.displayName || user.email || 'User') : 'Signed out';
  elements.sidebarUserName.textContent = displayName;
  elements.homeUserName.textContent = displayName;
  elements.welcomeTitle.textContent = user ? `HI ${displayName}` : 'HI Login';
  elements.sidebarUserRole.textContent = user ? `VIP · ${user.membershipLevel || 'Bronze'}` : 'Sign in to continue';
  elements.sidebarAvatar.textContent = user ? getInitials(user.displayName || user.email || 'User') : '—';
  elements.headerAvatar.textContent = user ? getInitials(user.displayName || user.email || 'User') : '—';
  elements.headerAvatar.setAttribute('aria-label', user ? user.displayName || user.email || 'User' : 'Signed out');
  elements.profileDisplayName.value = user?.displayName || '';
  elements.profileEmail.value = user?.email || '';
  elements.profilePhone.value = user?.phone || '';
  elements.profileMembership.value = user?.membershipLevel || '';
  elements.profileStatus.value = user?.accountStatus || '';
  elements.bankName.value = user?.bankName || '';
  elements.bankAccountName.value = user?.bankAccountName || '';
  elements.bankAccountNumber.value = user?.bankAccountNumber || '';
  elements.bankBranch.value = user?.bankBranch || '';
  elements.bankCountry.value = user?.bankCountry || '';
  elements.withdrawBalance.textContent = formatMoney(state.wallet.balanceCents);
  elements.saveProfileButton.disabled = !isSignedIn;
  elements.profilePasswordReset.disabled = !isSignedIn;
  if (elements.changePasswordButton) elements.changePasswordButton.disabled = !isSignedIn;
  elements.saveBankButton.disabled = !isSignedIn;
  void renderProfilePhoto(user?.photoPath || '');
  const profileFields = [user?.displayName, user?.phone];
  const completedFields = profileFields.filter((value) => Boolean(value?.trim())).length;
  const completeness = Math.round((completedFields / profileFields.length) * 100);
  elements.profileCompleteness.textContent = `${completeness}%`;
  elements.profileCompletenessFoot.textContent = `${completedFields} of ${profileFields.length} profile details completed`;
  elements.overviewMembershipLevel.textContent = user?.membershipLevel || '—';
  elements.overviewAccountStatus.textContent = `Account status: ${user?.accountStatus || '—'}`;
  elements.membershipCurrentBadge.textContent = `Current level: ${user?.membershipLevel || '—'}`;
  renderMembershipCards(user?.membershipLevel);
  selectVipTier(user?.membershipLevel || 'Bronze');
  updateBuyingSurface();
  const currentRate = commissionRates[user?.membershipLevel] ?? 0;
  elements.commissionRate.textContent = formatRate(currentRate);
  elements.commissionRateBadge.textContent = `Recorded estimate rate: ${formatRate(currentRate)}`;
  elements.commissionTier.textContent = `${user?.membershipLevel || 'Bronze'} tier`;

  const canSeeAdmin = Boolean(user?.isAdmin);
  elements.adminNav.hidden = !canSeeAdmin;
  elements.adminMobileNav.hidden = !canSeeAdmin;
  elements.superAdminNav.hidden = !user?.isSuperAdmin;
  elements.superAdminMobileNav.hidden = !user?.isSuperAdmin;
  elements.buyingNav.hidden = false;
  elements.buyingMobileNav.hidden = false;
  elements.catalogAdminPanel.hidden = !canSeeAdmin;
  elements.adminRoleLabel.textContent = canSeeAdmin ? 'Admin tools' : 'Restricted';
  elements.accountRoleHeader.hidden = !user?.isSuperAdmin;

  if (canSeeAdmin) {
    elements.adminNav.disabled = false;
    elements.adminMobileNav.disabled = false;
  }

}

function renderMembershipCards(currentLevel) {
  const containers = [elements.overviewMembershipGrid, elements.membershipGrid];
  containers.forEach((container) => {
    container.replaceChildren(...membershipLevels.map((tier, index) => {
      const card = document.createElement('article');
      const isCurrent = tier.name === currentLevel;
      card.className = `membership-card${isCurrent ? ' current' : ''}`;

      const top = document.createElement('div');
      top.className = 'membership-top';
      const icon = document.createElement('span');
      icon.className = 'membership-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = tier.icon;
      const details = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'membership-name';
      name.textContent = tier.name;
      const level = document.createElement('div');
      level.className = 'membership-level';
      level.textContent = `VIP ${index + 1} · ${tier.name}`;
      details.append(name, level);
      top.append(icon, details);

      if (isCurrent) {
        const currentLabel = document.createElement('span');
        currentLabel.className = 'current-label';
        currentLabel.textContent = 'Assigned';
        top.append(currentLabel);
      }

      const facts = document.createElement('ul');
      facts.className = 'membership-facts';
      const multiplier = demoMembershipMultipliers[tier.name];
      [
        `${formatRate((multiplier - 1) * 100)} simulated price adjustment`,
        `${formatRate(demoMembershipRates[tier.name])} illustrative demo commission`,
        `${demoProductCount} simulated orders per day`
      ].forEach((fact) => {
        const item = document.createElement('li');
        item.textContent = fact;
        facts.append(item);
      });
      card.append(top, facts);
      return card;
    }));
  });
}

function getInitials(value) {
  return String(value)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';
}

async function refreshAccounts() {
  try {
    const users = await getAdminUsers();
    state.adminUsers = users;
    populateCommissionMembers();
    renderAdminBids(state.bids);
    if (!users.length) {
      elements.accountsBody.replaceChildren();
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = state.user?.isSuperAdmin ? 10 : 9;
      cell.textContent = 'No matching profiles were found.';
      row.append(cell);
      elements.accountsBody.append(row);
      return;
    }

    elements.accountsBody.replaceChildren(...users.map((user) => {
      const row = document.createElement('tr');
      const isSelf = user.uid === state.user?.uid;
      const isSuperAdmin = Boolean(state.user?.isSuperAdmin);
      const role = user.role || 'user';

      function addCell(content) {
        const cell = document.createElement('td');
        if (content instanceof Node) cell.append(content);
        else cell.textContent = content;
        row.append(cell);
      }

      function addInput(value, type = 'text') {
        const input = document.createElement('input');
        input.type = type;
        input.value = value || '';
        input.setAttribute('aria-label', `${type} for ${user.email || user.uid}`);
        return input;
      }

      function addSelect(values, value, label) {
        const select = document.createElement('select');
        select.setAttribute('aria-label', `${label} for ${user.email || user.uid}`);
        values.forEach((optionValue) => {
          const option = document.createElement('option');
          option.value = optionValue;
          option.textContent = optionValue;
          option.selected = optionValue === value;
          select.append(option);
        });
        return select;
      }

      const nameInput = addInput(user.displayName);
      const phoneInput = addInput(user.phone);
      const departmentInput = addInput(user.department);
      const membershipSelect = addSelect(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite'], user.membershipLevel || 'Bronze', 'Membership');
      const statusSelect = addSelect(['active', 'disabled'], user.accountStatus || 'active', 'Account status');
      const roleSelect = isSuperAdmin
        ? addSelect(role === 'superadmin' ? ['superadmin', 'admin'] : ['user', 'admin'], role, 'Role')
        : null;
      if (isSelf) {
        statusSelect.disabled = true;
        if (roleSelect) roleSelect.disabled = true;
      }
      addCell(nameInput);
      addCell(user.email || '');
      addCell(user.uid);
      addCell(phoneInput);
      addCell(departmentInput);
      addCell(membershipSelect);
      addCell(user.lastSignInAt
        ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(user.lastSignInAt))
        : 'Never');
      addCell(statusSelect);
      if (isSuperAdmin) addCell(roleSelect);

      const actions = document.createElement('div');
      actions.className = 'admin-row-actions';
      const saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.textContent = 'Save';
      saveButton.disabled = isSelf;
      saveButton.addEventListener('click', async () => {
        const nextRole = roleSelect?.value || role;
        const nextStatus = statusSelect.value;
        const changesRole = nextRole !== role;
        const disabling = nextStatus === 'disabled' && user.accountStatus !== 'disabled';
        if ((changesRole || disabling) && !window.confirm(
          `Confirm ${changesRole ? `changing ${user.email || user.uid}'s role to ${nextRole}` : `disabling ${user.email || user.uid}`}?`
        )) return;
        saveButton.disabled = true;
        try {
          const changes = {
            displayName: nameInput.value,
            phone: phoneInput.value,
            department: departmentInput.value,
            membershipLevel: membershipSelect.value,
            accountStatus: nextStatus
          };
          if (isSuperAdmin && changesRole) changes.role = nextRole;
          const result = await updateAdminUser(user.uid, changes);
          if (result.refreshRequired) {
            state.user = await refreshCurrentUserToken();
            state.isAdmin = state.user.isAdmin;
            updateUserSurface();
          }
          setAdminMessage(result.updated
            ? `Updated ${user.email || user.uid}.${result.refreshRequired ? ' The account must sign in again for its new access to apply.' : ''}`
            : `No changes for ${user.email || user.uid}.`);
          await refreshAccounts();
        } catch (error) {
          setAdminMessage(error.message || 'Unable to update this account.', true);
          saveButton.disabled = isSelf;
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger-button';
      deleteButton.textContent = 'Delete';
      const requiresAdminDisable = role !== 'user';
      deleteButton.disabled = isSelf || (requiresAdminDisable && user.accountStatus !== 'disabled');
      if (requiresAdminDisable && user.accountStatus !== 'disabled') {
        deleteButton.title = 'Disable this admin account before deleting it.';
      }
      deleteButton.addEventListener('click', async () => {
        if (isSelf || (requiresAdminDisable && user.accountStatus !== 'disabled')) return;
        if (!window.confirm(`Permanently delete ${user.email || user.uid}? This removes their sign-in account and profile.`)) return;
        deleteButton.disabled = true;
        try {
          await deleteAdminUser(user.uid);
          setAdminMessage(`Deleted ${user.email || user.uid}.`);
          await refreshAccounts();
        } catch (error) {
          setAdminMessage(error.message || 'Unable to delete this account.', true);
          deleteButton.disabled = false;
        }
      });

      const recoveryButton = document.createElement('button');
      recoveryButton.type = 'button';
      recoveryButton.textContent = 'Send recovery';
      recoveryButton.disabled = isSelf || !user.email;
      recoveryButton.addEventListener('click', async () => {
        if (isSelf || !user.email) return;
        recoveryButton.disabled = true;
        try {
          const result = await sendAdminRecovery(user.uid);
          if (result.recoveryLink) {
            elements.accountsInvite.hidden = false;
            elements.inviteLink.href = result.recoveryLink;
            elements.inviteLink.textContent = result.recoveryLink;
            setAdminMessage(`Recovery link created for ${user.email}. Share it privately; it signs that member in once.`);
          } else {
            setAdminMessage(`Recovery link created for ${user.email}.`, true);
          }
        } catch (error) {
          setAdminMessage(error.message || `Unable to create a recovery link for ${user.email}.`, true);
        } finally {
          recoveryButton.disabled = isSelf || !user.email;
        }
      });

      const resetButton = document.createElement('button');
      resetButton.type = 'button';
      resetButton.textContent = 'Reset password';
      resetButton.disabled = isSelf;
      resetButton.addEventListener('click', async () => {
        if (isSelf || !user.email) return;
        resetButton.disabled = true;
        try {
          await resetPassword(user.email);
          setAdminMessage(`Password reset email sent to ${user.email}.`);
        } catch (error) {
          setAdminMessage(error.message || `Unable to send a password reset email to ${user.email}.`, true);
        } finally {
          resetButton.disabled = false;
        }
      });

      if (!isSelf) actions.append(saveButton, recoveryButton, resetButton, deleteButton);
      else {
        const selfLabel = document.createElement('span');
        selfLabel.textContent = 'Use Account settings';
        actions.append(selfLabel);
      }
      addCell(actions);
      return row;
    }));

    setAdminMessage('Account directory refreshed.');
  } catch (error) {
    setAdminMessage(error.message || 'Unable to refresh the account directory.', true);
  }
}

async function handleCreateUser(event) {
  event.preventDefault();
  const submitButton = elements.createUserForm.querySelector('button[type="submit"]');
  if (!window.confirm(`Create a regular user account for ${elements.newUserEmail.value.trim()}?`)) return;
  submitButton.disabled = true;
  elements.accountsInvite.hidden = true;
  try {
    const result = await createAdminUser({
      displayName: elements.newUserName.value,
      email: elements.newUserEmail.value,
      membershipLevel: elements.newUserMembership.value,
      phone: elements.newUserPhone.value,
      department: elements.newUserDepartment.value,
      role: 'user'
    });
    elements.createUserForm.reset();
    elements.accountsInvite.hidden = false;
    elements.inviteLink.href = result.passwordResetLink;
    elements.inviteLink.textContent = result.passwordResetLink;
    setAdminMessage(`Created account ${result.email}. Share the password setup link securely.`);
    await refreshAccounts();
  } catch (error) {
    setAdminMessage(error.message || 'Unable to create the account.', true);
  } finally {
    submitButton.disabled = false;
  }
}

async function handleCreateAdmin(event) {
  event.preventDefault();
  const submitButton = elements.createAdminForm.querySelector('button[type="submit"]');
  if (!window.confirm(`Create an admin account for ${elements.newAdminEmail.value.trim()}?`)) return;
  submitButton.disabled = true;
  elements.adminInviteLinkContainer.hidden = true;
  try {
    const result = await createAdminUser({
      displayName: elements.newAdminName.value,
      email: elements.newAdminEmail.value,
      role: 'admin'
    });
    elements.createAdminForm.reset();
    elements.adminInviteLink.href = result.passwordResetLink;
    elements.adminInviteLink.textContent = result.passwordResetLink;
    elements.adminInviteLinkContainer.hidden = false;
    elements.superAdminMessage.textContent = `Created ${result.email}. Share the password setup link securely.`;
    await refreshAccounts();
    await refreshAuditLogs();
  } catch (error) {
    elements.superAdminMessage.textContent = error.message || 'Unable to create the admin account.';
  } finally {
    submitButton.disabled = false;
  }
}

async function refreshAuditLogs() {
  if (!state.user?.isSuperAdmin) {
    elements.auditLogStatus.textContent = 'Not allowed: super admin access is required.';
    return;
  }
  elements.auditLogStatus.textContent = 'Loading audit history…';
  try {
    const logs = await listAuditLogs();
    state.auditLogs = logs;
    if (!logs.length) {
      elements.auditLogRows.innerHTML = '<tr><td colspan="5">No audit events have been recorded.</td></tr>';
      elements.auditLogStatus.textContent = '';
      return;
    }
    elements.auditLogRows.replaceChildren(...logs.map((entry) => {
      const row = document.createElement('tr');
      const createdAt = entry.createdAt
        ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.createdAt))
        : '—';
      [createdAt, entry.actorUid, entry.action, entry.targetUid, JSON.stringify(entry.details || {})]
        .forEach((value) => {
          const cell = document.createElement('td');
          cell.textContent = value || '—';
          row.append(cell);
        });
      return row;
    }));
    elements.auditLogStatus.textContent = `${logs.length} recent events.`;
  } catch (error) {
    console.error('Unable to load audit history:', error);
    elements.auditLogStatus.textContent = error.message || 'Unable to load audit history.';
  }
}

function setProfileMessage(message, isError = false) {
  elements.profileMessage.textContent = message;
  elements.profileMessage.classList.toggle('is-success', !isError && Boolean(message));
  elements.profileMessage.style.color = isError ? '#a3423c' : '';
}

function handleProfilePhotoSelection() {
  const file = elements.profilePhotoInput.files?.[0];
  state.removeProfilePhoto = false;
  if (selectedProfilePhotoObjectUrl) {
    URL.revokeObjectURL(selectedProfilePhotoObjectUrl);
    selectedProfilePhotoObjectUrl = '';
  }
  if (!file) {
    void renderProfilePhoto(state.user?.photoPath || '');
    return;
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    elements.profilePhotoInput.value = '';
    setProfileMessage('Choose a JPEG, PNG, or WebP photo that is 5 MB or smaller.', true);
    return;
  }
  selectedProfilePhotoObjectUrl = URL.createObjectURL(file);
  elements.profilePhotoPreview.src = selectedProfilePhotoObjectUrl;
  elements.profilePhotoPreview.hidden = false;
  setProfileMessage('');
}

async function handleSaveProfile(event) {
  event.preventDefault();
  if (!state.user) {
    setProfileMessage('Sign in to update your profile.', true);
    return;
  }
  const submitButton = elements.saveProfileButton;
  const oldPhotoPath = state.user.photoPath || '';
  let uploadedPhotoPath = '';
  const file = elements.profilePhotoInput.files?.[0];
  const changes = {
    displayName: elements.profileDisplayName.value.trim(),
    phone: elements.profilePhone.value.trim()
  };
  if (file) {
    try {
      uploadedPhotoPath = await uploadProfilePhoto(state.user.uid, file);
      changes.photoPath = uploadedPhotoPath;
    } catch (error) {
      setProfileMessage(error.message || 'Unable to upload your profile photo.', true);
      return;
    }
  } else if (state.removeProfilePhoto) {
    changes.photoPath = '';
  }

  submitButton.disabled = true;
  setProfileMessage('');
  try {
    const result = await updateOwnProfile(changes);
    state.user = {
      ...state.user,
      displayName: changes.displayName,
      phone: changes.phone,
      photoPath: changes.photoPath === undefined ? oldPhotoPath : changes.photoPath
    };
    updateUserSurface();
    elements.profilePhotoInput.value = '';
    state.removeProfilePhoto = false;
    if (selectedProfilePhotoObjectUrl) {
      URL.revokeObjectURL(selectedProfilePhotoObjectUrl);
      selectedProfilePhotoObjectUrl = '';
    }
    if (oldPhotoPath && oldPhotoPath !== state.user.photoPath) {
      try {
        await removeProfilePhoto(state.user.uid, oldPhotoPath);
      } catch (error) {
        console.error('Profile saved, but the previous photo could not be removed:', error);
        setProfileMessage('Profile saved, but the previous photo could not be removed.', true);
        return;
      }
    }
    setProfileMessage(result.updated ? 'Profile saved.' : 'Your profile is up to date.');
  } catch (error) {
    if (uploadedPhotoPath) {
      try {
        await removeProfilePhoto(state.user.uid, uploadedPhotoPath);
      } catch (cleanupError) {
        console.error('Unable to remove the profile photo after a failed save:', cleanupError);
      }
    }
    setProfileMessage(error.message || 'Unable to save your profile.', true);
  } finally {
    submitButton.disabled = false;
  }
}

function setPasswordMessage(message, isError = false) {
  elements.passwordMessage.textContent = message;
  elements.passwordMessage.classList.toggle('is-success', !isError && Boolean(message));
  elements.passwordMessage.style.color = isError ? '#a3423c' : '';
}

async function handleChangePassword(event) {
  event.preventDefault();
  if (!state.user) {
    setPasswordMessage('Sign in to change your password.', true);
    return;
  }
  const next = elements.newPassword.value;
  const confirmation = elements.confirmPassword.value;
  if (next.length < 8) {
    setPasswordMessage('Choose a password with at least 8 characters.', true);
    return;
  }
  if (next !== confirmation) {
    setPasswordMessage('The two passwords do not match.', true);
    return;
  }

  elements.changePasswordButton.disabled = true;
  setPasswordMessage('');
  try {
    await changePassword(next);
    elements.passwordForm.reset();
    setPasswordMessage('Password changed. Use the new password the next time you sign in.');
  } catch (error) {
    setPasswordMessage(error.message || 'Unable to change your password.', true);
  } finally {
    elements.changePasswordButton.disabled = false;
  }
}

function formatProductPrice(cents) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
}

let productDialogTrigger = null;

function openProductDialog(product, trigger) {
  if (!product || !elements.productDialog || typeof elements.productDialog.showModal !== 'function') return;
  productDialogTrigger = trigger || null;

  elements.productDialogTitle.textContent = product.name;
  elements.productDialogPrice.textContent = formatProductPrice(product.priceCents);
  elements.productDialogDescription.textContent = product.description || 'No product description provided.';
  elements.productDialogLink.href = product.productUrl || 'https://buy.bestbuyer.org';

  const media = elements.productDialogMedia;
  media.replaceChildren();

  const fallback = document.createElement('span');
  fallback.className = 'featured-card-fallback';
  fallback.textContent = product.name.slice(0, 2).toUpperCase();
  fallback.hidden = true;

  const image = document.createElement('img');
  image.alt = product.name;
  image.hidden = true;

  const cached = product.imagePath ? productImageUrls.get(product.imagePath) : '';
  if (cached) {
    image.src = cached;
    image.hidden = false;
    fallback.hidden = true;
  } else if (product.imagePath) {
    image.hidden = false;
    getProductImage(product.imagePath)
      .then((blob) => {
        let url = productImageUrls.get(product.imagePath);
        if (!url) {
          url = URL.createObjectURL(blob);
          productImageUrls.set(product.imagePath, url);
        }
        image.src = url;
        fallback.hidden = true;
      })
      .catch(() => {
        image.hidden = true;
        fallback.hidden = false;
      });
  } else {
    fallback.hidden = false;
  }

  media.append(image, fallback);
  elements.productDialog.showModal();
}

function closeProductDialog() {
  if (!elements.productDialog?.open) return;
  elements.productDialog.close();
}

function handleProductDialogClick(event) {
  if (event.target === elements.productDialog) closeProductDialog();
}

function handleProductGridClick(event) {
  const target = event.target.closest('[data-product-id]');
  if (!target) return;
  const product = state.products.find((item) => item.id === target.dataset.productId);
  if (product) openProductDialog(product, target);
}

async function handleProfilePasswordReset() {
  if (!state.user?.email) {
    setProfileMessage('A verified account email is not available for password reset.', true);
    return;
  }
  elements.profilePasswordReset.disabled = true;
  try {
    await resetPassword(state.user.email);
    setProfileMessage('A password reset link has been sent to your account email.');
  } catch (error) {
    setProfileMessage(error.message || 'Unable to send a password reset link.', true);
  } finally {
    elements.profilePasswordReset.disabled = false;
  }
}

function setBankMessage(message, isError = false) {
  elements.bankMessage.textContent = message;
  elements.bankMessage.classList.toggle('is-success', !isError && Boolean(message));
  elements.bankMessage.style.color = isError ? '#a3423c' : '';
}

async function handleSaveBank(event) {
  event.preventDefault();
  if (!state.user) {
    setBankMessage('Sign in to update your bank information.', true);
    return;
  }
  const changes = {
    bankName: elements.bankName.value.trim(),
    bankAccountName: elements.bankAccountName.value.trim(),
    bankAccountNumber: elements.bankAccountNumber.value.trim(),
    bankBranch: elements.bankBranch.value.trim(),
    bankCountry: elements.bankCountry.value.trim()
  };
  elements.saveBankButton.disabled = true;
  setBankMessage('');
  try {
    const result = await updateOwnProfile(changes);
    state.user = { ...state.user, ...changes };
    setBankMessage(result.updated ? 'Bank information saved.' : 'Your bank information is up to date.');
  } catch (error) {
    console.error('Unable to save bank information:', error);
    setBankMessage(error.message || 'Unable to save your bank information.', true);
  } finally {
    elements.saveBankButton.disabled = false;
  }
}

function selectVipTier(tier) {
  const level = demoMembershipMultipliers[tier] ? tier : 'Bronze';
  document.querySelectorAll('[data-vip-tier]').forEach((button) => {
    button.classList.toggle('active', button.dataset.vipTier === level);
  });
  const index = membershipLevels.findIndex((entry) => entry.name === level);
  if (elements.vipDetailTitle) {
    elements.vipDetailTitle.textContent = `👑 VIP ${index + 1} · ${level}`;
  }
  if (elements.overviewMembershipLevel) {
    elements.overviewMembershipLevel.textContent = level;
  }
  if (!elements.vipDetailList) return;
  const multiplier = demoMembershipMultipliers[level];
  const facts = [
    `Up to ${demoProductCount} simulated orders per day`,
    `Illustrative commission rate of ${formatRate(demoMembershipRates[level])}`,
    `Simulated price adjustment of ${formatRate((multiplier - 1) * 100)}`,
    'Priority support from your account manager'
  ];
  elements.vipDetailList.replaceChildren(...facts.map((fact) => {
    const item = document.createElement('li');
    item.textContent = fact;
    return item;
  }));
}

async function initializeAuth() {
  await initializeAuthState((user, error) => {
    stopAccountSubscription();
    stopProductSubscription();
    stopCommissionSubscription();
    stopWalletSubscriptions();
    stopBuyingSubscriptions();
    if (!user) {
      state.user = null;
      state.isAdmin = false;
      state.adminUsers = [];
      if (error) {
        console.error('Unable to restore the signed-in account:', error);
        const errorType = ['auth/id-token-revoked', 'auth/user-token-expired', 'auth/user-disabled']
          .includes(error.code) ? 'reauth' : 'profile';
        window.location.replace(`/login.html?error=${errorType}`);
      } else {
        const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        const currentPath = window.location.pathname.replace(/\/+$/, '').toLowerCase();
        const returnTo = ['/admin', '/admin.html', '/superadmin', '/superadmin.html']
          .includes(currentPath) ? `?returnTo=${encodeURIComponent(path)}` : '';
        window.location.replace(`/login.html${returnTo}`);
      }
      return;
    }
    state.user = user;
    state.isAdmin = user.isAdmin;
    try {
      state.demoBuying = loadDemoBuyingState(user.uid);
      state.demoStorageError = '';
      elements.demoPurchaseMessage.textContent = '';
      elements.demoPurchaseMessage.classList.remove('is-success');
    } catch (error) {
      console.error('Unable to load local demo data:', error);
      state.demoBuying = null;
      state.demoStorageError = error.message || 'Unable to load local demo data.';
      elements.demoPurchaseMessage.textContent = state.demoStorageError;
      elements.demoPurchaseMessage.classList.remove('is-success');
    }
    navigate(initialDashboardPage(user));
    unsubscribeProducts = subscribeToProducts(renderProducts, (subscriptionError) => {
      console.error('Unable to load the product catalog:', subscriptionError);
      setCatalogStatus(subscriptionError.message || 'Unable to load the product catalog.', true);
    });
    unsubscribeCommissions = subscribeToCommissions({
      uid: user.uid,
      isAdmin: user.isAdmin,
      onCommissions: renderCommissions,
      onError: (subscriptionError) => {
        console.error('Unable to load commission history:', subscriptionError);
        setCommissionStatus(subscriptionError.message || 'Unable to load commission history.', true);
      }
    });
    startWalletSubscriptions(user.uid);
    startBuyingSubscriptions(user.uid, user.isAdmin);
    if (state.isAdmin) {
      void refreshAccounts();
    }
    if (user.isSuperAdmin) void refreshAuditLogs();
    const userId = user.uid;
    unsubscribeAccount = subscribeToProfile(userId, {
      onProfile: async (profile) => {
        if (state.user?.uid !== userId) return;
        if (profile.accountStatus === 'disabled') {
          try {
            await signOutUser();
          } catch (signOutError) {
            console.error('Unable to sign out after the account was disabled:', signOutError);
          }
          window.location.replace('/login.html?error=disabled');
          return;
        }
        if (profile.role && profile.role !== state.user.role) {
          try {
            const refreshedUser = await refreshCurrentUserToken();
            if (refreshedUser.role !== profile.role) {
              throw new Error('The refreshed account role did not match the server profile.');
            }
            window.location.replace('/index.html');
          } catch (error) {
            console.error('Unable to refresh account access after a role change:', error);
            try {
              await signOutUser();
            } catch (signOutError) {
              console.error('Unable to sign out after a role change:', signOutError);
            }
            window.location.replace('/login.html?error=reauth');
          }
          return;
        }
        state.user = {
          ...state.user,
          displayName: profile.displayName || state.user.displayName,
          email: profile.email || state.user.email,
          phone: profile.phone || '',
          department: profile.department || '',
          membershipLevel: profile.membershipLevel || 'Bronze',
          accountStatus: profile.accountStatus || 'active',
          photoPath: profile.photoPath || ''
        };
        updateUserSurface();
      },
      onError: (subscriptionError) => {
        console.error('Unable to sync account data:', subscriptionError);
        showToast('Your profile could not be refreshed. Try reloading the page.');
      }
    });
    updateUserSurface();
  });
}

function bindNavigationAndUi() {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.page));
  });

  document.querySelectorAll('[data-navigate]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.navigate));
  });

  elements.menuButton.addEventListener('click', () => {
    const isOpen = elements.sidebar.classList.toggle('open');
    elements.backdrop.classList.toggle('visible', isOpen);
    elements.menuButton.setAttribute('aria-expanded', String(isOpen));
    elements.menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  elements.backdrop.addEventListener('click', closeMenu);
  elements.createUserForm.addEventListener('submit', handleCreateUser);
  elements.createAdminForm.addEventListener('submit', handleCreateAdmin);
  elements.profileForm.addEventListener('submit', handleSaveProfile);
  elements.profilePhotoInput.addEventListener('change', handleProfilePhotoSelection);
  elements.removeProfilePhoto.addEventListener('click', () => {
    if (!state.user?.photoPath) {
      setProfileMessage('There is no saved profile photo to remove.');
      return;
    }
    state.removeProfilePhoto = true;
    elements.profilePhotoInput.value = '';
    elements.profilePhotoPreview.hidden = true;
    setProfileMessage('Photo removal will be saved with your profile.');
  });
  elements.profilePasswordReset.addEventListener('click', handleProfilePasswordReset);
  elements.passwordForm.addEventListener('submit', handleChangePassword);
  elements.bankForm.addEventListener('submit', handleSaveBank);
  document.querySelectorAll('[data-vip-tier]').forEach((button) => {
    button.addEventListener('click', () => selectVipTier(button.dataset.vipTier));
  });
  elements.commissionForm.addEventListener('submit', handleRecordCommission);
  elements.walletCreditForm.addEventListener('submit', handleWalletCredit);
  elements.simulatePurchaseButton.addEventListener('click', simulateDemoPurchase);
  elements.resetDemoButton.addEventListener('click', resetDemoBuyingState);
  elements.commissionMember.addEventListener('change', updateCommissionPreview);
  elements.commissionProductCost.addEventListener('input', updateCommissionPreview);
  elements.productForm.addEventListener('submit', handleSaveProduct);
  elements.cancelProductEdit.addEventListener('click', resetProductForm);
  elements.seedCatalogButton.addEventListener('click', handleSeedCatalog);
  elements.productGrid.addEventListener('click', handleProductGridClick);
  elements.productMarquee.addEventListener('click', handleProductGridClick);
  elements.overviewProductGrid?.addEventListener('click', handleProductGridClick);
  elements.productDialog.addEventListener('click', handleProductDialogClick);
  elements.productDialogClose.addEventListener('click', closeProductDialog);
  elements.productDialogDismiss.addEventListener('click', closeProductDialog);
  elements.productDialog.addEventListener('close', () => {
    if (productDialogTrigger && productDialogTrigger.isConnected) {
      productDialogTrigger.focus({ preventScroll: true });
    }
    productDialogTrigger = null;
    elements.productDialogMedia.replaceChildren();
  });

  elements.signOutButton.addEventListener('click', async () => {
    try {
      await signOutUser();
      stopAccountSubscription();
      stopProductSubscription();
      stopCommissionSubscription();
      stopWalletSubscriptions();
      stopBuyingSubscriptions();
      state.user = null;
      state.isAdmin = false;
      state.adminUsers = [];
      state.demoBuying = null;
      state.demoStorageError = '';
      updateUserSurface();
      window.location.replace('/login.html');
    } catch (error) {
      showToast(error.message || 'Sign out failed.');
    }
  });

  elements.refreshAccounts.addEventListener('click', refreshAccounts);
  elements.refreshAuditLogs.addEventListener('click', refreshAuditLogs);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

async function bootstrap() {
  bindNavigationAndUi();
  elements.todayLabel.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());
  updateUserSurface();

  if (isConfigured()) {
    elements.connectionBadge.textContent = 'Connecting…';
  } else {
    elements.connectionBadge.textContent = 'Setup required';
  }

  try {
    await initializeAuth();
  } catch (error) {
    console.error('Supabase authentication could not be initialized:', error);
    window.location.replace('/login.html?error=connection');
  }
}

bootstrap().catch((error) => {
  console.error('Northstar initialization failed:', error);
  window.location.replace('/login.html?error=connection');
});

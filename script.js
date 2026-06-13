const currentAmountInput = document.getElementById('currentAmount');
const monthlyDepositInput = document.getElementById('monthlyDeposit');
const annualRateInput = document.getElementById('annualRate');
const yearsInput = document.getElementById('years');
const frequencyInput = document.getElementById('frequency');
const calculateBtn = document.getElementById('calculateBtn');
const resultValue = document.getElementById('resultValue');
const resultSummary = document.getElementById('resultSummary');
const createProfileBtn = document.getElementById('createProfileBtn');
const profileStatus = document.getElementById('profileStatus');
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');
const userPhoneInput = document.getElementById('userPhone');
const depositBtn = document.getElementById('depositBtn');
const depositAmountInput = document.getElementById('depositAmount');
const depositPhoneInput = document.getElementById('depositPhone');
const depositStatus = document.getElementById('depositStatus');
const withdrawBtn = document.getElementById('withdrawBtn');
const withdrawAmountInput = document.getElementById('withdrawAmount');
const accountSummary = document.getElementById('accountSummary');
const mpesaModal = document.getElementById('mpesaModal');
const closeModal = document.getElementById('closeModal');
const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
const submitPinBtn = document.getElementById('submitPinBtn');
const mpesaPin = document.getElementById('mpesaPin');
const mpesaAmount = document.getElementById('mpesaAmount');
const mpesaMessage = document.getElementById('mpesaMessage');
const mpesaStep1 = document.getElementById('mpesaStep1');
const mpesaStep2 = document.getElementById('mpesaStep2');
const mpesaStep3 = document.getElementById('mpesaStep3');

let userProfile = null;
let pendingDepositAmount = 0;

function formatCurrency(value) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function setProfileStatus(message) {
  profileStatus.textContent = message;
}

function setDepositStatus(message) {
  depositStatus.textContent = message;
}

function updateAccountSummary() {
  if (!userProfile) {
    accountSummary.textContent = 'Create a profile to see your bonus and withdraw options.';
    return;
  }

  accountSummary.textContent = `Account for ${userProfile.name}: balance ${formatCurrency(userProfile.balance)}, bonus total ${formatCurrency(userProfile.bonusEarned)}, withdrawn ${formatCurrency(userProfile.withdrawn)}.`;
}

function createProfile() {
  const name = userNameInput.value.trim();
  const email = userEmailInput.value.trim();
  const phone = userPhoneInput.value.trim();

  if (!name || !email || !phone) {
    setProfileStatus('Please fill in all profile fields before creating your profile.');
    return;
  }

  const initialBalance = parseFloat(currentAmountInput.value) || 0;

  userProfile = {
    name,
    email,
    phone,
    balance: initialBalance,
    bonusEarned: 10,
    withdrawn: 0,
  };

  currentAmountInput.value = userProfile.balance.toFixed(0);
  setProfileStatus(`Profile created for ${name}. Welcome bonus of ${formatCurrency(10)} applied. Linked MPesa number: ${phone}.`);
  setDepositStatus('Ready for MPesa deposits. Use the same linked number to deposit funds.');
  userProfile.balance += 10;
  updateResults();
  updateAccountSummary();
}

function makeMpesaDeposit() {
  if (!userProfile) {
    setDepositStatus('Please create your profile first before making an MPesa deposit.');
    return;
  }

  const depositAmount = parseFloat(depositAmountInput.value) || 0;
  const phone = depositPhoneInput.value.trim();

  if (depositAmount <= 0) {
    setDepositStatus('Enter a valid deposit amount greater than zero.');
    return;
  }

  if (phone !== userProfile.phone) {
    setDepositStatus('Please use the linked MPesa phone number for this deposit.');
    return;
  }

  pendingDepositAmount = depositAmount;
  mpesaAmount.textContent = formatCurrency(depositAmount);
  showMpesaModal();
}

function showMpesaModal() {
  mpesaModal.classList.remove('hidden');
  mpesaStep1.classList.remove('hidden');
  mpesaStep2.classList.add('hidden');
  mpesaStep3.classList.add('hidden');
  mpesaPin.value = '';
}

function hideMpesaModal() {
  mpesaModal.classList.add('hidden');
}

function processMpesaPayment() {
  mpesaStep1.classList.add('hidden');
  mpesaStep2.classList.remove('hidden');
  mpesaPin.focus();
}

function submitMpesaPin() {
  const pin = mpesaPin.value;
  if (pin.length !== 4 || isNaN(pin)) {
    setDepositStatus('Please enter a valid 4-digit PIN.');
    return;
  }

  mpesaStep2.classList.add('hidden');
  mpesaStep3.classList.remove('hidden');
  mpesaMessage.textContent = 'Processing payment...';

  setTimeout(() => {
    completeMpesaTransaction();
  }, 2000);
}

function completeMpesaTransaction() {
  const depositAmount = pendingDepositAmount;
  let bonus = 0;
  if (depositAmount >= 100) {
    bonus = depositAmount * 0.02;
    userProfile.bonusEarned += bonus;
  }

  userProfile.balance += depositAmount + bonus;
  currentAmountInput.value = userProfile.balance.toFixed(0);
  updateResults();
  updateAccountSummary();

  mpesaMessage.textContent = `✓ Payment successful! KES ${depositAmount.toFixed(0)} + KES ${bonus.toFixed(0)} bonus added.`;

  setTimeout(() => {
    hideMpesaModal();
    setDepositStatus(`Deposit successful. ${formatCurrency(depositAmount)} added via MPesa. Bonus ${formatCurrency(bonus)} awarded. New balance: ${formatCurrency(userProfile.balance)}.`);
    depositAmountInput.value = '50';
  }, 1500);
}

function withdrawFunds() {
  if (!userProfile) {
    accountSummary.textContent = 'Create your profile first before withdrawing funds.';
    return;
  }

  const withdrawAmount = parseFloat(withdrawAmountInput.value) || 0;
  if (withdrawAmount <= 0) {
    accountSummary.textContent = 'Enter an amount greater than zero to withdraw.';
    return;
  }

  if (withdrawAmount > userProfile.balance) {
    accountSummary.textContent = 'Insufficient balance for that withdrawal amount.';
    return;
  }

  userProfile.balance -= withdrawAmount;
  userProfile.withdrawn += withdrawAmount;
  currentAmountInput.value = userProfile.balance.toFixed(0);
  updateResults();
  updateAccountSummary();

  accountSummary.textContent = `Withdrawal complete. ${formatCurrency(withdrawAmount)} withdrawn. Remaining balance: ${formatCurrency(userProfile.balance)}.`;
}

function calculateFutureValue(principal, monthlyDeposit, annualRate, years, compoundingPeriods) {
  const r = annualRate / 100;
  const n = compoundingPeriods;
  const t = years;
  const compoundFactor = Math.pow(1 + r / n, n * t);
  const futurePrincipal = principal * compoundFactor;
  const monthlyRate = r / n;
  const futureDeposits = monthlyDeposit * ((compoundFactor - 1) / (Math.pow(1 + monthlyRate, n / 12) - 1));
  return futurePrincipal + futureDeposits;
}

function updateResults() {
  const principal = parseFloat(currentAmountInput.value) || 0;
  const monthlyDeposit = parseFloat(monthlyDepositInput.value) || 0;
  const annualRate = parseFloat(annualRateInput.value) || 0;
  const years = parseInt(yearsInput.value, 10) || 0;
  const frequency = parseInt(frequencyInput.value, 10) || 12;

  if (years <= 0) {
    resultValue.textContent = '$0.00';
    resultSummary.textContent = 'Please enter a time horizon of at least 1 year.';
    return;
  }

  const projectedValue = calculateFutureValue(principal, monthlyDeposit, annualRate, years, frequency);
  const totalSaved = principal + monthlyDeposit * 12 * years;
  const totalEarned = projectedValue - totalSaved;

  resultValue.textContent = formatCurrency(projectedValue);
  resultSummary.textContent = `After ${years} years, your savings can grow to ${formatCurrency(projectedValue)} with total contributions of ${formatCurrency(totalSaved)} and earnings of ${formatCurrency(totalEarned)}.`;
}

calculateBtn.addEventListener('click', updateResults);
createProfileBtn.addEventListener('click', createProfile);
depositBtn.addEventListener('click', makeMpesaDeposit);
withdrawBtn.addEventListener('click', withdrawFunds);
closeModal.addEventListener('click', hideMpesaModal);
cancelPaymentBtn.addEventListener('click', hideMpesaModal);
confirmPaymentBtn.addEventListener('click', processMpesaPayment);
submitPinBtn.addEventListener('click', submitMpesaPin);
mpesaPin.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitMpesaPin();
});
window.addEventListener('load', () => {
  updateResults();
  updateAccountSummary();
});

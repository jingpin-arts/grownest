const currentAmountInput = document.getElementById('currentAmount');
const monthlyDepositInput = document.getElementById('monthlyDeposit');
const annualRateInput = document.getElementById('annualRate');
const yearsInput = document.getElementById('years');
const frequencyInput = document.getElementById('frequency');
const calculateBtn = document.getElementById('calculateBtn');
const resultValue = document.getElementById('resultValue');
const resultSummary = document.getElementById('resultSummary');

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
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
window.addEventListener('load', updateResults);

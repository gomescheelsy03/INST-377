const API = 'https://api.frankfurter.dev/v1';

// Select elements
const fromSel = document.getElementById('fromCurrency');
const toSel   = document.getElementById('toCurrency');
const amount  = document.getElementById('amount');
const form    = document.getElementById('convert-form');
const result  = document.getElementById('result');
const errorEl = document.getElementById('error');
const submit  = document.getElementById('submitBtn');


// Load currencies on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch list of currencies
    const res = await fetch(`${API}/currencies`);
    if (!res.ok) throw new Error('Failed to load currencies');
    const data = await res.json();

    // Sort alphabetically and create <option> elements
    const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
    fromSel.innerHTML = '<option value="" disabled selected>Select</option>';
    toSel.innerHTML   = '<option value="" disabled selected>Select</option>';

    for (const [code, name] of entries) {
      fromSel.add(new Option(`${code} — ${name}`, code));
      toSel.add(new Option(`${code} — ${name}`, code));
    }

  } catch (err) {
    console.error(err);
    alert('Could not load currencies. Please enable your CORS extension and try again.');
  }
});


// Handle conversion on submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.hidden = true;
  result.textContent = '';

  const from = fromSel.value;
  const to = toSel.value;
  const amt = parseFloat(amount.value);

  // Validate input
  if (!from || !to || isNaN(amt)) {
    showError('Please select both currencies and enter an amount.');
    return;
  }

  // Prevent same currency conversion
  if (from === to) {
    alert('You cannot convert to and from the same currency.');
    return;
  }

  try {
    submit.disabled = true;
    result.textContent = 'Converting...';

    // Fetch conversion rate
    const res = await fetch(`${API}/latest?base=${from}&symbols=${to}`);
    if (!res.ok) throw new Error('Conversion failed');
    const data = await res.json();

    // Calculate and display result (no date shown)
    const rate = data.rates[to];
    const converted = (amt * rate).toFixed(4);
    result.textContent = `${amt} ${from} = ${converted} ${to}`;
  } catch (err) {
    console.error(err);
    showError('Conversion error — check your internet connection or CORS extension.');
  } finally {
    submit.disabled = false;
  }
});


// Helper function
function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = !msg;
}

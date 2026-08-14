const priceFormatter = new Intl.NumberFormat('en-AE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAmount(value, options = null) {
  const amount = Number(value || 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  if (!options) return priceFormatter.format(safeAmount);

  return new Intl.NumberFormat('en-AE', options).format(safeAmount);
}

export function formatCurrency(value, currency = 'AED') {
  return `${currency} ${formatAmount(value)}`;
}

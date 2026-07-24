export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

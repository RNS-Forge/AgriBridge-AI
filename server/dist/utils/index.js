export function sanitizeString(input) {
    return input.trim().replace(/[<>]/g, '');
}
export function formatIndianCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
}

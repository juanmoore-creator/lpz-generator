export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

export const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(value);
};

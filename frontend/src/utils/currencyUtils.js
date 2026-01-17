export const countries = [
    { code: 'US', name: 'United States', currency: '$', locale: 'en-US' },
    { code: 'IN', name: 'India', currency: '₹', locale: 'en-IN' },
    { code: 'UK', name: 'United Kingdom', currency: '£', locale: 'en-GB' },
    { code: 'CA', name: 'Canada', currency: 'CA$', locale: 'en-CA' },
    { code: 'AU', name: 'Australia', currency: 'A$', locale: 'en-AU' },
    { code: 'AE', name: 'UAE', currency: 'AED', locale: 'en-AE' },
    { code: 'SG', name: 'Singapore', currency: 'S$', locale: 'en-SG' },
    { code: 'MY', name: 'Malaysia', currency: 'RM', locale: 'en-MY' },
    { code: 'DE', name: 'Germany', currency: '€', locale: 'de-DE' },
    { code: 'FR', name: 'France', currency: '€', locale: 'fr-FR' },
    { code: 'ES', name: 'Spain', currency: '€', locale: 'es-ES' },
    { code: 'IT', name: 'Italy', currency: '€', locale: 'it-IT' },
    { code: 'JP', name: 'Japan', currency: '¥', locale: 'ja-JP' },
    { code: 'BR', name: 'Brazil', currency: 'R$', locale: 'pt-BR' },
    { code: 'MX', name: 'Mexico', currency: 'MX$', locale: 'es-MX' }
];

export const getCountryConfig = (countryCode) => {
    const code = countryCode || 'US';
    return countries.find(c => c.code === code) || countries[0];
};

export const getCurrencySymbol = (countryCode) => {
    const config = getCountryConfig(countryCode);
    return config.currency;
};

export const formatCurrency = (amount, countryCode) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.00';

    const config = getCountryConfig(countryCode);

    // Format number according to locale
    const formattedNum = num.toLocaleString(config.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return `${config.currency}${formattedNum}`;
};

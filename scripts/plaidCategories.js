const categories = plaidCategories();
console.log(
  categories.map((x) => ({
    value: x,
    label: convertValue(x),
  }))
);
function convertValue(value) {
  // Replace underscores with spaces
  value = value.replace(/_/g, ' ');
  // Capitalize the first letter of each word
  value = value.toLowerCase().replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
  return value;
}
function plaidCategories() {
  return [
    'PRIMARY',
    'INCOME',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'LOAN_PAYMENTS',
    'BANK_FEES',
    'ENTERTAINMENT',
    'FOOD_AND_DRINK',
    'GENERAL_MERCHANDISE',
    'HOME_IMPROVEMENT',
    'MEDICAL',
    'PERSONAL_CARE',
    'GENERAL_SERVICES',
    'GOVERNMENT_AND_NON_PROFIT',
    'TRANSPORTATION',
    'TRAVEL',
    'RENT_AND_UTILITIES',
  ];
}

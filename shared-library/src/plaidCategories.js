"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plaidCategoriesDetail = exports.plaidCategories = void 0;
exports.discretionaryFilter = discretionaryFilter;
exports.plaidCategories = [
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'FOOD_AND_DRINK', label: 'Food And Drink' },
    { value: 'GENERAL_MERCHANDISE', label: 'General Merchandise' },
    { value: 'PERSONAL_CARE', label: 'Personal Care' },
    { value: 'GENERAL_SERVICES', label: 'General Services' },
    { value: 'TRANSPORTATION', label: 'Transportation' },
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'HOME_IMPROVEMENT', label: 'Home Improvement' },
    { value: 'MEDICAL', label: 'Medical' },
    {
        value: 'GOVERNMENT_AND_NON_PROFIT',
        label: 'Government And Non Profit',
    },
    { value: 'RENT_AND_UTILITIES', label: 'Rent And Utilities' },
    { value: 'INCOME', label: 'Income' },
    { value: 'TRANSFER_IN', label: 'Transfer In' },
    { value: 'TRANSFER_OUT', label: 'Transfer Out' },
    { value: 'LOAN_PAYMENTS', label: 'Loan Payments' },
    { value: 'BANK_FEES', label: 'Bank Fees' },
];
exports.plaidCategoriesDetail = [
    {
        primary: 'INCOME',
        detailed: 'INCOME_DIVIDENDS',
        discretionary: false,
    },
    {
        primary: 'INCOME',
        detailed: 'INCOME_INTEREST_EARNED',
        discretionary: false,
    },
    {
        primary: 'INCOME',
        detailed: 'INCOME_RETIREMENT_PENSION',
        discretionary: false,
    },
    {
        primary: 'INCOME',
        detailed: 'INCOME_TAX_REFUND',
        discretionary: false,
    },
    {
        primary: 'INCOME',
        detailed: 'INCOME_UNEMPLOYMENT',
        discretionary: false,
    },
    {
        primary: 'INCOME',
        detailed: 'INCOME_WAGES',
        discretionary: false,
    },
    {
        primary: 'INCOME',
        detailed: 'INCOME_OTHER_INCOME',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_IN',
        detailed: 'TRANSFER_IN_CASH_ADVANCES_AND_LOANS',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_IN',
        detailed: 'TRANSFER_IN_DEPOSIT',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_IN',
        detailed: 'TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_IN',
        detailed: 'TRANSFER_IN_SAVINGS',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_IN',
        detailed: 'TRANSFER_IN_ACCOUNT_TRANSFER',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_IN',
        detailed: 'TRANSFER_IN_OTHER_TRANSFER_IN',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_OUT',
        detailed: 'TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_OUT',
        detailed: 'TRANSFER_OUT_SAVINGS',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_OUT',
        detailed: 'TRANSFER_OUT_WITHDRAWAL',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_OUT',
        detailed: 'TRANSFER_OUT_ACCOUNT_TRANSFER',
        discretionary: false,
    },
    {
        primary: 'TRANSFER_OUT',
        detailed: 'TRANSFER_OUT_OTHER_TRANSFER_OUT',
        discretionary: false,
    },
    {
        primary: 'LOAN_PAYMENTS',
        detailed: 'LOAN_PAYMENTS_CAR_PAYMENT',
        discretionary: false,
    },
    {
        primary: 'LOAN_PAYMENTS',
        detailed: 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT',
        discretionary: false,
    },
    {
        primary: 'LOAN_PAYMENTS',
        detailed: 'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT',
        discretionary: false,
    },
    {
        primary: 'LOAN_PAYMENTS',
        detailed: 'LOAN_PAYMENTS_MORTGAGE_PAYMENT',
        discretionary: false,
    },
    {
        primary: 'LOAN_PAYMENTS',
        detailed: 'LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT',
        discretionary: false,
    },
    {
        primary: 'LOAN_PAYMENTS',
        detailed: 'LOAN_PAYMENTS_OTHER_PAYMENT',
        discretionary: false,
    },
    {
        primary: 'BANK_FEES',
        detailed: 'BANK_FEES_ATM_FEES',
        discretionary: false,
    },
    {
        primary: 'BANK_FEES',
        detailed: 'BANK_FEES_FOREIGN_TRANSACTION_FEES',
        discretionary: false,
    },
    {
        primary: 'BANK_FEES',
        detailed: 'BANK_FEES_INSUFFICIENT_FUNDS',
        discretionary: false,
    },
    {
        primary: 'BANK_FEES',
        detailed: 'BANK_FEES_INTEREST_CHARGE',
        discretionary: false,
    },
    {
        primary: 'BANK_FEES',
        detailed: 'BANK_FEES_OVERDRAFT_FEES',
        discretionary: false,
    },
    {
        primary: 'BANK_FEES',
        detailed: 'BANK_FEES_OTHER_BANK_FEES',
        discretionary: false,
    },
    {
        primary: 'ENTERTAINMENT',
        detailed: 'ENTERTAINMENT_CASINOS_AND_GAMBLING',
        discretionary: true,
    },
    {
        primary: 'ENTERTAINMENT',
        detailed: 'ENTERTAINMENT_MUSIC_AND_AUDIO',
        discretionary: true,
    },
    {
        primary: 'ENTERTAINMENT',
        detailed: 'ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS',
        discretionary: true,
    },
    {
        primary: 'ENTERTAINMENT',
        detailed: 'ENTERTAINMENT_TV_AND_MOVIES',
        discretionary: true,
    },
    {
        primary: 'ENTERTAINMENT',
        detailed: 'ENTERTAINMENT_VIDEO_GAMES',
        discretionary: true,
    },
    {
        primary: 'ENTERTAINMENT',
        detailed: 'ENTERTAINMENT_OTHER_ENTERTAINMENT',
        discretionary: true,
    },
    {
        primary: 'FOOD_AND_DRINK',
        detailed: 'FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR',
        discretionary: true,
    },
    {
        primary: 'FOOD_AND_DRINK',
        detailed: 'FOOD_AND_DRINK_COFFEE',
        discretionary: true,
    },
    {
        primary: 'FOOD_AND_DRINK',
        detailed: 'FOOD_AND_DRINK_FAST_FOOD',
        discretionary: true,
    },
    {
        primary: 'FOOD_AND_DRINK',
        detailed: 'FOOD_AND_DRINK_GROCERIES',
        discretionary: true,
    },
    {
        primary: 'FOOD_AND_DRINK',
        detailed: 'FOOD_AND_DRINK_RESTAURANT',
        discretionary: true,
    },
    {
        primary: 'FOOD_AND_DRINK',
        detailed: 'FOOD_AND_DRINK_VENDING_MACHINES',
        discretionary: true,
    },
    {
        primary: 'FOOD_AND_DRINK',
        detailed: 'FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_BOOKSTORES_AND_NEWSSTANDS',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_CONVENIENCE_STORES',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_DEPARTMENT_STORES',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_DISCOUNT_STORES',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_ELECTRONICS',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_OFFICE_SUPPLIES',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_ONLINE_MARKETPLACES',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_PET_SUPPLIES',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_SPORTING_GOODS',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_SUPERSTORES',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_TOBACCO_AND_VAPE',
        discretionary: true,
    },
    {
        primary: 'GENERAL_MERCHANDISE',
        detailed: 'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE',
        discretionary: true,
    },
    {
        primary: 'HOME_IMPROVEMENT',
        detailed: 'HOME_IMPROVEMENT_FURNITURE',
        discretionary: true,
    },
    {
        primary: 'HOME_IMPROVEMENT',
        detailed: 'HOME_IMPROVEMENT_HARDWARE',
        discretionary: true,
    },
    {
        primary: 'HOME_IMPROVEMENT',
        detailed: 'HOME_IMPROVEMENT_REPAIR_AND_MAINTENANCE',
        discretionary: true,
    },
    {
        primary: 'HOME_IMPROVEMENT',
        detailed: 'HOME_IMPROVEMENT_SECURITY',
        discretionary: true,
    },
    {
        primary: 'HOME_IMPROVEMENT',
        detailed: 'HOME_IMPROVEMENT_OTHER_HOME_IMPROVEMENT',
        discretionary: true,
    },
    {
        primary: 'MEDICAL',
        detailed: 'MEDICAL_DENTAL_CARE',
        discretionary: true,
    },
    {
        primary: 'MEDICAL',
        detailed: 'MEDICAL_EYE_CARE',
        discretionary: true,
    },
    {
        primary: 'MEDICAL',
        detailed: 'MEDICAL_NURSING_CARE',
        discretionary: true,
    },
    {
        primary: 'MEDICAL',
        detailed: 'MEDICAL_PHARMACIES_AND_SUPPLEMENTS',
        discretionary: true,
    },
    {
        primary: 'MEDICAL',
        detailed: 'MEDICAL_PRIMARY_CARE',
        discretionary: true,
    },
    {
        primary: 'MEDICAL',
        detailed: 'MEDICAL_VETERINARY_SERVICES',
        discretionary: true,
    },
    {
        primary: 'MEDICAL',
        detailed: 'MEDICAL_OTHER_MEDICAL',
        discretionary: true,
    },
    {
        primary: 'PERSONAL_CARE',
        detailed: 'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS',
        discretionary: true, //'excl. if ALSO recurring',
    },
    {
        primary: 'PERSONAL_CARE',
        detailed: 'PERSONAL_CARE_HAIR_AND_BEAUTY',
        discretionary: true,
    },
    {
        primary: 'PERSONAL_CARE',
        detailed: 'PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING',
        discretionary: true,
    },
    {
        primary: 'PERSONAL_CARE',
        detailed: 'PERSONAL_CARE_OTHER_PERSONAL_CARE',
        discretionary: true,
    },
    {
        primary: 'GENERAL_SERVICES',
        detailed: 'GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING',
        discretionary: true,
    },
    {
        primary: 'GENERAL_SERVICES',
        detailed: 'GENERAL_SERVICES_AUTOMOTIVE',
        discretionary: true,
    },
    {
        primary: 'GENERAL_SERVICES',
        detailed: 'GENERAL_SERVICES_CHILDCARE',
        discretionary: true, //'excl. if ALSO recurring',
    },
    {
        primary: 'GENERAL_SERVICES',
        detailed: 'GENERAL_SERVICES_CONSULTING_AND_LEGAL',
        discretionary: true,
    },
    {
        primary: 'GENERAL_SERVICES',
        detailed: 'GENERAL_SERVICES_EDUCATION',
        discretionary: true, // 'excl. if ALSO recurring',
    },
    {
        primary: 'GENERAL_SERVICES',
        detailed: 'GENERAL_SERVICES_INSURANCE',
        discretionary: false,
    },
    {
        primary: 'GENERAL_SERVICES',
        detailed: 'GENERAL_SERVICES_POSTAGE_AND_SHIPPING',
        discretionary: true,
    },
    {
        primary: 'GENERAL_SERVICES',
        detailed: 'GENERAL_SERVICES_STORAGE',
        discretionary: true,
    },
    {
        primary: 'GENERAL_SERVICES',
        detailed: 'GENERAL_SERVICES_OTHER_GENERAL_SERVICES',
        discretionary: true,
    },
    {
        primary: 'GOVERNMENT_AND_NON_PROFIT',
        detailed: 'GOVERNMENT_AND_NON_PROFIT_DONATIONS',
        discretionary: true,
    },
    {
        primary: 'GOVERNMENT_AND_NON_PROFIT',
        detailed: 'GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES',
        discretionary: true,
    },
    {
        primary: 'GOVERNMENT_AND_NON_PROFIT',
        detailed: 'GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT',
        discretionary: false,
    },
    {
        primary: 'GOVERNMENT_AND_NON_PROFIT',
        detailed: 'GOVERNMENT_AND_NON_PROFIT_OTHER_GOVERNMENT_AND_NON_PROFIT',
        discretionary: false,
    },
    {
        primary: 'TRANSPORTATION',
        detailed: 'TRANSPORTATION_BIKES_AND_SCOOTERS',
        discretionary: true,
    },
    {
        primary: 'TRANSPORTATION',
        detailed: 'TRANSPORTATION_GAS',
        discretionary: true,
    },
    {
        primary: 'TRANSPORTATION',
        detailed: 'TRANSPORTATION_PARKING',
        discretionary: true,
    },
    {
        primary: 'TRANSPORTATION',
        detailed: 'TRANSPORTATION_PUBLIC_TRANSIT',
        discretionary: true,
    },
    {
        primary: 'TRANSPORTATION',
        detailed: 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES',
        discretionary: true,
    },
    {
        primary: 'TRANSPORTATION',
        detailed: 'TRANSPORTATION_TOLLS',
        discretionary: true,
    },
    {
        primary: 'TRANSPORTATION',
        detailed: 'TRANSPORTATION_OTHER_TRANSPORTATION',
        discretionary: true,
    },
    {
        primary: 'TRAVEL',
        detailed: 'TRAVEL_FLIGHTS',
        discretionary: true,
    },
    {
        primary: 'TRAVEL',
        detailed: 'TRAVEL_LODGING',
        discretionary: true,
    },
    {
        primary: 'TRAVEL',
        detailed: 'TRAVEL_RENTAL_CARS',
        discretionary: true,
    },
    {
        primary: 'TRAVEL',
        detailed: 'TRAVEL_OTHER_TRAVEL',
        discretionary: true,
    },
    {
        primary: 'RENT_AND_UTILITIES',
        detailed: 'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY',
        discretionary: false,
    },
    {
        primary: 'RENT_AND_UTILITIES',
        detailed: 'RENT_AND_UTILITIES_INTERNET_AND_CABLE',
        discretionary: false,
    },
    {
        primary: 'RENT_AND_UTILITIES',
        detailed: 'RENT_AND_UTILITIES_RENT',
        discretionary: false,
    },
    {
        primary: 'RENT_AND_UTILITIES',
        detailed: 'RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT',
        discretionary: false,
    },
    {
        primary: 'RENT_AND_UTILITIES',
        detailed: 'RENT_AND_UTILITIES_TELEPHONE',
        discretionary: false,
    },
    {
        primary: 'RENT_AND_UTILITIES',
        detailed: 'RENT_AND_UTILITIES_WATER',
        discretionary: false,
    },
    {
        primary: 'RENT_AND_UTILITIES',
        detailed: 'RENT_AND_UTILITIES_OTHER_UTILITIES',
        discretionary: false,
    },
];
function discretionaryFilter(transaction) {
    const category = transaction.personalFinanceCategory;
    const categoryDetail = exports.plaidCategoriesDetail.find((x) => x.detailed === (category === null || category === void 0 ? void 0 : category.detailed));
    if (categoryDetail === null || categoryDetail === void 0 ? void 0 : categoryDetail.discretionary) {
        const exceptions = [
            'GENERAL_SERVICES_EDUCATION',
            'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS',
            'GENERAL_SERVICES_CHILDCARE',
        ];
        if (exceptions.includes(categoryDetail === null || categoryDetail === void 0 ? void 0 : categoryDetail.detailed) && transaction.recurring)
            return false;
        return true;
    }
    return false;
}

const fs = require('fs');

const plaidCategoriesCSV = fs.readFileSync('./plaidCategories.csv', 'utf8');
const categories = plaidCategoriesCSV
  .split('\r\n')
  .map((x) => x.split(','))
  .map((x) => ({
    primary: x[0],
    detailed: x[1],
    discretionary: x[2],
  }));
console.log(categories);

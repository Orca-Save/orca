const fs = require('fs');

const goalCategoriesCSV = fs.readFileSync('./goalCategories.csv', 'utf8');
const categories = goalCategoriesCSV
  .split('\n')
  .map((x) => x.split(','))
  .map((x) => ({
    id: x[0],
    name: x[1],
    createdAt: x[2],
    updatedAt: x[3],
  }));
console.log(categories);

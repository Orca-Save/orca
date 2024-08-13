function convertObjectsToArray(objects) {
  return objects.map((item) => `${item.name}=${item.value}`);
}
// Example usage
const inputArray = [
  {
    name: 'ADMIN_USERNAME',
    value: 'admin',
    slotSetting: false,
  },
];

const outputArray = convertObjectsToArray(inputArray);
console.log(outputArray.join('\n'));

let a = [
  "Bills and Utilities/Housing",
  "Bills and Utilities/Subscriptions",
  "Bills and Utilities/Utilities",
  "Auto and Transport",
  "Groceries/Home",
  "Groceries/Pets",
  "Medical",
  "Health and Wellness/Personal Care",
  "Health and Wellness/Family Care",
  "Loan Payment",
  "Dining and Drinks",
  "Recreation and Entertainment/Shopping",
  "Recreation and Entertainment/Travel and Vacation",
];

function create(name) {
  return `INSERT INTO public."GoalCategory"(id, name, "updatedAt")
	VALUES (gen_random_uuid(), '${name}', now());`;
}

console.log(a.map(create).join("\n"));

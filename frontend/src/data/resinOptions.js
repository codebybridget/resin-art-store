// frontend/src/data/resinOptions.js

export const resinColors = [
  "Blue",
  "White",
  "Black",
  "Gold",
  "Silver",
  "Pink",
  "Purple",
  "Red",
  "Green",
  "Brown",
  "Clear",
];

// Sizes only for Home Decor Resin
const homeDecorSizes = ["Small", "Medium", "Large"];

// Categories where we show custom text input
const customTextCategories = [
  "personalized resin art",
  "custom orders",
];

// Get sizes based on category
export const getSizesForCategory = (category) => {
  const cat = category?.trim().toLowerCase();

  if (cat === "home decor resin") return homeDecorSizes;

  return ["One Size"];
};

// Extra price for Home Decor Resin sizes
export const sizeExtra = (size) => {
  const s = String(size || "").trim().toLowerCase();

  if (s === "small") return 0;
  if (s === "medium") return 1000;
  if (s === "large") return 2000;

  return 0;
};

// Check if category supports custom text
export const isCustomizationCategory = (category) => {
  const cat = category?.trim().toLowerCase();
  return customTextCategories.includes(cat);
};

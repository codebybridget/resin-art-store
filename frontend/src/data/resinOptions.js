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
const customTextCategories = ["personalized resin art", "custom orders"];

// Get sizes based on category
export const getSizesForCategory = (category) => {
  const cat = category?.trim().toLowerCase();

  if (cat === "home decor resin") return homeDecorSizes;

  return ["One Size"];
};

/**
 * ✅ PRICE MULTIPLIER FOR HOME DECOR RESIN
 * Small  = base price × 1
 * Medium = base price × 2
 * Large  = base price × 3
 */
export const sizeMultiplier = (size) => {
  const s = String(size || "").trim().toLowerCase();

  if (s === "small") return 1;
  if (s === "medium") return 2;
  if (s === "large") return 3;

  return 1;
};

// Check if category supports custom text
export const isCustomizationCategory = (category) => {
  const cat = category?.trim().toLowerCase();
  return customTextCategories.includes(cat);
};

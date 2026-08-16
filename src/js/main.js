import {
  getAllCountries,
  filterRecipesByCountry,
  getAllCategories,
  getMealsByCategory,
  getMealById,
  analyzeNutrition,
  searchMeals,
  getRandomMeals,
} from "./api/mealdb.js";
import { initProductCategories } from "./products-ui.js";

const navLinks = document.querySelectorAll(".nav-link");

const sections = {
  "hero-section": document.getElementById("hero-section"),
  "products-section": document.getElementById("products-section"),
  "foodlog-section": document.getElementById("foodlog-section"),
  "meal-details-section": document.getElementById("meal-details-section"),
};


const SECTION_SLUGS = {
  "hero-section": "meals",
  "products-section": "products",
  "foodlog-section": "foodlog",
};
const SLUG_TO_SECTION = Object.fromEntries(
  Object.entries(SECTION_SLUGS).map(([sectionId, slug]) => [slug, sectionId])
);

const HEADER_CONTENT = {
  "hero-section": {
    title: "Meals & Recipes",
    subtitle: "Discover delicious and nutritious recipes tailored for you",
  },
  "products-section": {
    title: "Product Scanner",
    subtitle: "Search packaged foods and scan barcodes for nutrition info",
  },
  "foodlog-section": {
    title: "Food Log",
    subtitle: "Track and monitor your daily nutrition intake",
  },
  "meal-details-section": {
    title: "Recipe Details",
    subtitle: "Ingredients, instructions, and nutrition for this recipe",
  },
};

function updateHeader(sectionId) {
  const content = HEADER_CONTENT[sectionId] || HEADER_CONTENT["hero-section"];
  const titleEl = document.getElementById("header-title");
  const subtitleEl = document.getElementById("header-subtitle");
  if (titleEl) titleEl.textContent = content.title;
  if (subtitleEl) subtitleEl.textContent = content.subtitle;
}

function navigateToSection(sectionId, { updateHistory = true } = {}) {
 
  Object.values(sections).forEach((section) => {
    if (section) section.style.display = "none";
  });

  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.style.display = "block";
  }

  updateHeader(sectionId);


  navLinks.forEach((navLink) => {
    const isActive = navLink.dataset.section === sectionId;

    navLink.classList.toggle("bg-emerald-50", isActive);
    navLink.classList.toggle("text-emerald-700", isActive);
    navLink.classList.toggle("text-gray-600", !isActive);

    const span = navLink.querySelector("span");
    if (span) {
      span.classList.toggle("font-semibold", isActive);
      span.classList.toggle("font-medium", !isActive);
    }
  });

  if (updateHistory) {
    const slug = SECTION_SLUGS[sectionId];
    if (slug) {
      const newHash = `#${slug}`;
      if (window.location.hash !== newHash) {
        history.pushState({ sectionId }, "", newHash);
      }
    }
  }

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
}

navLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    navigateToSection(this.dataset.section);
  });
});

window.addEventListener("popstate", () => {
  const slug = window.location.hash.replace("#", "");
  const sectionId = SLUG_TO_SECTION[slug] || "hero-section";
  navigateToSection(sectionId, { updateHistory: false });
});

const initialSlug = window.location.hash.replace("#", "");
const initialSectionId = SLUG_TO_SECTION[initialSlug] || "hero-section";
navigateToSection(initialSectionId, { updateHistory: false });

const DAILY_GOALS = { calories: 2000, protein: 50, carbs: 250, fat: 65 };

function getTodayKey() {
  const d = new Date();
  return `foodlog-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getTodayLog() {
  return JSON.parse(localStorage.getItem(getTodayKey()) || "[]");
}

function saveTodayLog(entries) {
  localStorage.setItem(getTodayKey(), JSON.stringify(entries));
}

function addFoodLogEntry(entry) {
  const entries = getTodayLog();
  entries.push(entry);
  saveTodayLog(entries);
}

function removeFoodLogEntry(entryId) {
  const entries = getTodayLog().filter((e) => e.id !== entryId);
  saveTodayLog(entries);
}
const countriesContainer = document.getElementById("countries");
const categoriesGrid = document.getElementById("categories-grid");
const recipesGrid = document.getElementById("recipes-grid");
const recipesCount = document.getElementById("recipes-count");
const mealDetailsSection = document.getElementById("meal-details-section");
const backToMealsBtn = document.getElementById("back-to-meals-btn");

const categoryStyles = {
  Beef: {
    bg: "bg-red-50",
    border: "border-red-200",
    hover: "hover:border-red-300",
    iconBg: "bg-gradient-to-br from-red-400 to-rose-500",
    icon: "fa-drumstick-bite",
  },

  Chicken: {
    bg: "bg-orange-50",
    border: "border-amber-200",
    hover: "hover:border-amber-300",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    icon: "fa-drumstick-bite",
  },

  Dessert: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    hover: "hover:border-pink-300",
    iconBg: "bg-gradient-to-br from-pink-400 to-pink-500",
    icon: "fa-cake-candles",
  },

  Lamb: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    hover: "hover:border-orange-300",
    iconBg: "bg-gradient-to-br from-orange-400 to-orange-500",
    icon: "fa-drumstick-bite",
  },

  Miscellaneous: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    hover: "hover:border-slate-300",
    iconBg: "bg-gradient-to-br from-slate-400 to-slate-500",
    icon: "fa-bowl-food",
  },

  Pasta: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    hover: "hover:border-yellow-300",
    iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    icon: "fa-bowl-food",
  },

  Pork: {
    bg: "bg-red-50",
    border: "border-red-200",
    hover: "hover:border-red-300",
    iconBg: "bg-gradient-to-br from-red-400 to-rose-500",
    icon: "fa-bacon",
  },

  Seafood: {
    bg: "bg-red-50",
    border: "border-red-200",
    hover: "hover:border-sky-300",
    iconBg: "bg-gradient-to-br from-sky-400 to-blue-500",
    icon: "fa-fish",
  },

  Side: {
    bg: "bg-green-50",
    border: "border-green-200",
    hover: "hover:border-green-300",
    iconBg: "bg-gradient-to-br from-emerald-400 to-green-500",
    icon: "fa-bowl-food",
  },

  Starter: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    hover: "hover:border-cyan-300",
    iconBg: "bg-gradient-to-br from-cyan-400 to-cyan-500",
    icon: "fa-utensils",
  },

  Vegan: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    hover: "hover:border-emerald-300",
    iconBg: "bg-gradient-to-br from-emerald-400 to-green-500",
    icon: "fa-leaf",
  },

  Vegetarian: {
    bg: "bg-lime-50",
    border: "border-lime-200",
    hover: "hover:border-lime-300",
    iconBg: "bg-gradient-to-br from-lime-400 to-green-500",
    icon: "fa-seedling",
  },
};


async function displayAllCountries() {
  const countries = (await getAllCountries()).results;

  const allCuisinesBtn = document.getElementById("all-cuisnes-button");

  function setActiveCountryBtn(btn) {
    document.querySelectorAll(".country-btn, #all-cuisnes-button").forEach((b) => {
      b.classList.remove("bg-emerald-600", "text-white");
      b.classList.add("bg-gray-100", "text-gray-700");
    });
    btn.classList.remove("bg-gray-100", "text-gray-700");
    btn.classList.add("bg-emerald-600", "text-white");
  }

  allCuisinesBtn.addEventListener("click", async () => {
    setActiveCountryBtn(allCuisinesBtn);
    displayAllRecipes();
  });

  countries.forEach((country) => {
    const button = document.createElement("button");

    button.textContent = country.name;

    button.className =
      "country-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";

    button.addEventListener("click", async () => {
      setActiveCountryBtn(button);
      const data = await filterRecipesByCountry(country.name);
      displayRecipes(data.results);
    });

    countriesContainer.appendChild(button);
  });
}

let allCategoriesData = [];
let categoriesExpanded = false;
const CATEGORIES_PREVIEW_COUNT = 12;

async function displayCategories() {
  try {
    const categories = (await getAllCategories()).results;
    allCategoriesData = categories;
    renderCategoryCards();
  } catch (error) {
    console.error("Failed to display categories:", error);
  }
}

function renderCategoryCards() {
  const visibleCategories = categoriesExpanded
    ? allCategoriesData
    : allCategoriesData.slice(0, CATEGORIES_PREVIEW_COUNT);

  categoriesGrid.innerHTML = "";

  visibleCategories.forEach((category) => {
    const name = category.name;

    const style = categoryStyles[name] || {
      bg: "bg-gray-50",
      border: "border-gray-200",
      hover: "hover:border-gray-300",
      iconBg: "bg-gradient-to-br from-gray-400 to-gray-500",
      icon: "fa-bowl-food",
    };

    categoriesGrid.innerHTML += `
              <div 
                  class="
                      category-card
                      ${style.bg}
                      ${style.border}
                      ${style.hover}
                      rounded-2xl
                      p-4
                      border
                      hover:shadow-md
                      cursor-pointer
                      transition-all
                      group
                  "
                  data-category="${name}"
              >

                  <div class="flex items-center gap-3">

                      <div 
                          class="
                              text-white
                              w-9
                              h-9
                              ${style.iconBg}
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              group-hover:scale-110
                              transition-transform
                              shadow-sm
                          "
                      >
                          <i class="fa-solid ${style.icon} text-lg"></i>
                      </div>

                      <div>
                          <h3 class="text-base font-bold text-gray-900">
                              ${name}
                          </h3>
                      </div>

                  </div>

              </div>
          `;
  });

  
  const viewAllBtn = document.getElementById("view-all-categories-btn");
  viewAllBtn.style.display = allCategoriesData.length > CATEGORIES_PREVIEW_COUNT ? "flex" : "none";

  updateViewAllButtonLabel();

  // Add click event
  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach((card) => {
    card.addEventListener("click", async () => {
      const category = card.dataset.category;

      categoryCards.forEach((c) => {
        c.classList.remove("ring-2", "ring-offset-2", "ring-emerald-600", "shadow-md");
      });
      card.classList.add("ring-2", "ring-offset-2", "ring-emerald-600", "shadow-md");

      try {
        const data = await getMealsByCategory(category);
        displayRecipes(data.results);
      } catch (error) {
        console.error("Failed to load recipes:", error);
      }
    });
  });
}

function updateViewAllButtonLabel() {
  const label = document.getElementById("view-all-categories-label");
  const icon = document.getElementById("view-all-categories-icon");

  if (categoriesExpanded) {
    label.textContent = "Show Less";
    icon.classList.remove("fa-chevron-right");
    icon.classList.add("fa-chevron-up");
  } else {
    label.textContent = "View All";
    icon.classList.remove("fa-chevron-up");
    icon.classList.add("fa-chevron-right");
  }
}

document.getElementById("view-all-categories-btn").addEventListener("click", () => {
  categoriesExpanded = !categoriesExpanded;
  renderCategoryCards();
});
async function displayAllRecipes() {
  try {
    const recipes = (await searchMeals("chicken")).results;

    displayRecipes(recipes);
  } catch (error) {
    console.error("Search failed:", error);
  }
}

displayCategories();
displayAllCountries();
displayAllRecipes();

async function displayMealDetails(mealId) {
  try {
    mealDetailsSection.classList.remove("hidden");
    mealDetailsSection.scrollIntoView({ behavior: "smooth" });

    document.getElementById("meal-name").textContent = "Loading...";

    // Reset + show loading state on the log button immediately
    currentMeal = null;
    currentNutrition = null;
    setLogButtonLoading(true);

    const data = await getMealById(mealId);
    const meal = data.result;
    currentMeal = meal;

    document.getElementById("meal-image").src = meal.thumbnail;
    document.getElementById("meal-image").alt = meal.name;
    document.getElementById("meal-name").textContent = meal.name;

    displayMealTags(meal);
    document.getElementById("hero-time").textContent = "30 min";
    document.getElementById("hero-servings").textContent = "4 servings";
    document.getElementById("hero-calories").textContent = meal.calories
      ? `${meal.calories} cal/serving`
      : "N/A";

    logMealBtn.dataset.mealId = meal.id;
    displayIngredients(meal.ingredients);
    displayInstructions(meal.instructions);
    displayMealVideo(meal.youtube);

    const nutritionIngredients = meal.ingredients.map(
      (item) => `${item.measure} ${item.ingredient}`,
    );

    try {
      const nutrition = (
        await analyzeNutrition(meal.name, nutritionIngredients)
      ).data;
      currentNutrition = nutrition;
      displayNutrition(nutrition);
    } catch (error) {
      console.error("Could not load nutrition:", error);
    } finally {
      // Data has arrived (or failed) — button is no longer "loading"
      setLogButtonLoading(false);
    }
  } catch (error) {
    console.error("Failed to display meal details:", error);
    document.getElementById("meal-name").textContent = "Failed to load meal";
    setLogButtonLoading(false);
  }
}
function displayMealTags(meal) {
  const container = document.getElementById("meal-tags-container");

  container.innerHTML = "";
  if (meal.category) {
    container.innerHTML += `
            <span
                class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full"
            >
                ${meal.category}
            </span>
        `;
  }
  if (meal.area) {
    container.innerHTML += `
            <span
                class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full"
            >
                ${meal.area}
            </span>
        `;
  }
  if (meal.tags && meal.tags.length > 0) {
    meal.tags.forEach((tag) => {
      container.innerHTML += `
                <span
                    class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full"
                >
                    ${tag}
                </span>
            `;
    });
  }
}
function displayIngredients(ingredients) {
  const container = document.getElementById("ingredients-container");

  const count = document.getElementById("ingredients-count");

  container.innerHTML = "";

  if (!ingredients || ingredients.length === 0) {
    count.textContent = "0 items";

    container.innerHTML = `
            <p class="text-gray-500">
                No ingredients available.
            </p>
        `;

    return;
  }

  count.textContent = `${ingredients.length} items`;

  ingredients.forEach((ingredient) => {
    container.innerHTML += `
            <div
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"
            >

                <input
                    type="checkbox"
                    class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
                />

                <span class="text-gray-700">

                    <span class="font-medium text-gray-900">
                        ${ingredient.measure || ""}
                    </span>

                    ${ingredient.ingredient || ""}

                </span>

            </div>
        `;
  });
}
function displayInstructions(instructions) {
  const container = document.getElementById("instructions-container");

  container.innerHTML = "";

  if (!instructions || instructions.length === 0) {
    container.innerHTML = `
            <p class="text-gray-500">
                No instructions available.
            </p>
        `;

    return;
  }

  instructions.forEach((instruction, index) => {
    container.innerHTML += `
            <div
                class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
            >

                <div
                    class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0"
                >
                    ${index + 1}
                </div>

                <p class="text-gray-700 leading-relaxed pt-2">
                    ${instruction}
                </p>

            </div>
        `;
  });
}
function displayMealVideo(youtubeUrl) {
  const videoSection = document.getElementById("video-section");

  const iframe = document.getElementById("meal-video");

  if (!youtubeUrl) {
    videoSection.classList.add("hidden");

    return;
  }

  const videoId = getYoutubeVideoId(youtubeUrl);

  if (!videoId) {
    videoSection.classList.add("hidden");

    return;
  }

  videoSection.classList.remove("hidden");

  iframe.src = `https://www.youtube.com/embed/${videoId}`;
}
function getYoutubeVideoId(url) {
  try {
    const urlObject = new URL(url);

    return urlObject.searchParams.get("v");
  } catch (error) {
    console.error("Invalid YouTube URL:", url);

    return null;
  }
}
function displayRecipes(recipes) {
  lastRenderedRecipes = recipes;

  const recipesCount = document.getElementById("recipes-count");
  recipesCount.innerHTML = `Showing ${recipes.length} recipes`;

  // Swap grid column count depending on view
  recipesGrid.classList.remove("grid-cols-2", "grid-cols-4");
  recipesGrid.classList.add(currentView === "list" ? "grid-cols-2" : "grid-cols-4");

  recipesGrid.innerHTML = "";

  recipes.forEach((recipe) => {
    recipesGrid.innerHTML += currentView === "list"
      ? renderListCard(recipe)
      : renderGridCard(recipe);
  });

  addMealCardEvents();
}

function renderGridCard(recipe) {
  return `
            <div
                class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                data-meal-id="${recipe.id}"
            >

                <!-- Image -->
                <div class="relative h-48 overflow-hidden">

                    <img
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src="${recipe.thumbnail}"
                        alt="${recipe.name}"
                        loading="lazy"
                    />

                    <!-- Badges -->
                    <div class="absolute bottom-3 left-3 flex gap-2">

                        <span
                            class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700"
                        >
                        <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                        
                            ${recipe.category || "Recipe"}
                        </span>

                        <span
                            class="px-2 py-1 bg-white/90 text-xs font-semibold rounded-full text-gray-700"
                        >
                         <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                            ${recipe.area || "International"}
                        </span>

                    </div>
                </div>

                <!-- Content -->
                <div class="p-4">

                    <h3
                        class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1"
                    >
                        ${recipe.name}
                    </h3>

                    <p
                        class="text-xs text-gray-600 mb-3 line-clamp-2"
                    >
                         ${recipe.instructions}
                    </p>

                    <!-- Footer -->
                    <div class="flex items-center justify-between text-xs">

                        <span class="font-semibold text-gray-900">
                            <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                            ${recipe.category || "Recipe"}
                        </span>

                        <span class="font-semibold text-gray-500">
                            <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                            ${recipe.area || "International"}
                        </span>

                    </div>

                </div>

            </div>
        `;
}

function renderListCard(recipe) {
  return `
            <div
                class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex h-40"
                data-meal-id="${recipe.id}"
            >
                <!-- Image -->
                <div class="relative w-40 shrink-0 overflow-hidden">
                    <img
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src="${recipe.thumbnail}"
                        alt="${recipe.name}"
                        loading="lazy"
                    />
                </div>

                <!-- Content -->
                <div class="p-4 flex-1 min-w-0 flex flex-col justify-center">

                    <h3
                        class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1"
                    >
                        ${recipe.name}
                    </h3>

                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                        ${recipe.instructions}
                    </p>

                    <div class="flex items-center gap-6 text-xs">
                        <span class="font-semibold text-gray-900">
                            <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                            ${recipe.category || "Recipe"}
                        </span>

                        <span class="font-semibold text-gray-500">
                            <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                            ${recipe.area || "International"}
                        </span>
                    </div>

                </div>

            </div>
        `;
}
function addMealCardEvents() {
  const mealCards = document.querySelectorAll(".recipe-card");

  mealCards.forEach((card) => {
    card.addEventListener("click", async () => {
      const mealId = card.dataset.mealId;

      console.log("Clicked meal ID:", mealId);

      const recipesSection = document.getElementById("hero-section");

      const mealDetails = document.getElementById("meal-details-section");

      
      console.log(recipesSection);

      recipesSection.classList.add("hidden");
      recipesSection.style.display = "none";
      mealDetails.style.display = "block";

      mealDetails.classList.remove("hidden");
      updateHeader("meal-details-section");

      await displayMealDetails(mealId);
    });
  });
}

function displayNutrition(nutritionResponse) {
  const nutrition = nutritionResponse;

  const perServing = nutrition.perServing;
  const totals = nutrition.totals;

  document.getElementById("nutrition-calories").textContent = Math.round(
    perServing.calories,
  );

  document.getElementById("nutrition-total-calories").textContent =
    `Total: ${Math.round(totals.calories)} cal`;

  document.getElementById("hero-servings").textContent =
    `${nutrition.servings} servings`;

  document.getElementById("hero-calories").textContent =
    `${Math.round(perServing.calories)} cal/serving`;

  document.getElementById("nutrition-protein").textContent =
    `${Math.round(perServing.protein)}g`;

  document.getElementById("protein-bar").style.width =
    `${Math.min(perServing.protein, 100)}%`;

  document.getElementById("nutrition-carbs").textContent =
    `${Math.round(perServing.carbs)}g`;

  document.getElementById("carbs-bar").style.width =
    `${Math.min(perServing.carbs, 100)}%`;
  document.getElementById("nutrition-fat").textContent =
    `${Math.round(perServing.fat)}g`;

  document.getElementById("fat-bar").style.width =
    `${Math.min(perServing.fat, 100)}%`;

  document.getElementById("nutrition-fiber").textContent =
    `${Math.round(perServing.fiber)}g`;

  document.getElementById("fiber-bar").style.width =
    `${Math.min(perServing.fiber * 5, 100)}%`;

  document.getElementById("nutrition-sugar").textContent =
    `${Math.round(perServing.sugar)}g`;

  document.getElementById("sugar-bar").style.width =
    `${Math.min(perServing.sugar * 4, 100)}%`;
  const vitaminsContainer = document.getElementById("vitamins-container");

  vitaminsContainer.innerHTML = `
        <div class="flex justify-between">
            <span class="text-gray-600">Saturated Fat</span>
            <span class="font-medium">
                ${Math.round(perServing.saturatedFat)}g
            </span>
        </div>

        <div class="flex justify-between">
            <span class="text-gray-600">Cholesterol</span>
            <span class="font-medium">
                ${Math.round(perServing.cholesterol)}mg
            </span>
        </div>

        <div class="flex justify-between">
            <span class="text-gray-600">Sodium</span>
            <span class="font-medium">
                ${Math.round(perServing.sodium)}mg
            </span>
        </div>

        <div class="flex justify-between">
            <span class="text-gray-600">Total Weight</span>
            <span class="font-medium">
                ${Math.round(nutrition.totalWeight)}g
            </span>
        </div>
    `;
}

document.getElementById("back-to-meals-btn").addEventListener("click", () => {
  const recipesSection = document.getElementById("hero-section");

  const mealDetails = document.getElementById("meal-details-section");

  mealDetails.classList.add("hidden");
  mealDetails.style.display = "none";
  console.log(recipesSection);

  updateHeader("hero-section");

  recipesSection.classList.remove("hidden");
  recipesSection.style.display = "block";
});

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim();

  if (query === "") {
    return;
  }

  try {
    const recipes = (await searchMeals(query)).results;

    displayRecipes(recipes);
  } catch (error) {
    console.error("Search failed:", error);
  }
});

let currentMeal = null;
let currentNutrition = null;
let logServings = 1;

const logMealBtn = document.getElementById("log-meal-btn");
const logMealModal = document.getElementById("log-meal-modal");

function setLogButtonLoading(isLoading) {
  if (isLoading) {
    logMealBtn.disabled = true;
    logMealBtn.dataset.originalHtml = logMealBtn.innerHTML;
    logMealBtn.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      <span>Loading...</span>
    `;
    logMealBtn.classList.add("opacity-70", "cursor-not-allowed");
  } else {
    logMealBtn.disabled = false;
    logMealBtn.innerHTML =
      logMealBtn.dataset.originalHtml ||
      `<i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span>`;
    logMealBtn.classList.remove("opacity-70", "cursor-not-allowed");
  }
}
logMealBtn.addEventListener("click", () => {
  // Guard: button is disabled while loading, but double-check anyway
  if (!currentMeal || !currentNutrition) return;
  openLogMealModal();
});

function openLogMealModal() {
  logServings = 1;

  document.getElementById("log-modal-thumb").src = currentMeal.thumbnail;
  document.getElementById("log-modal-meal-name").textContent = currentMeal.name;
  document.getElementById("log-servings-input").value = logServings;

  updateLogModalNutrition();

  logMealModal.classList.remove("hidden");
  logMealModal.classList.add("flex");
}

function closeLogMealModal() {
  logMealModal.classList.add("hidden");
  logMealModal.classList.remove("flex");
}

function updateLogModalNutrition() {
  const perServing = currentNutrition.perServing;

  document.getElementById("log-modal-calories").textContent = Math.round(
    perServing.calories,
  );
  document.getElementById("log-modal-protein").textContent =
    `${Math.round(perServing.protein)}g`;
  document.getElementById("log-modal-carbs").textContent =
    `${Math.round(perServing.carbs)}g`;
  document.getElementById("log-modal-fat").textContent =
    `${Math.round(perServing.fat)}g`;
}

document.getElementById("log-servings-minus").addEventListener("click", () => {
  if (logServings > 1) {
    logServings--;
    document.getElementById("log-servings-input").value = logServings;
  }
});

document.getElementById("log-servings-plus").addEventListener("click", () => {
  logServings++;
  document.getElementById("log-servings-input").value = logServings;
});

document
  .getElementById("log-modal-cancel")
  .addEventListener("click", closeLogMealModal);

logMealModal.addEventListener("click", (e) => {
  if (e.target === logMealModal) closeLogMealModal(); // click outside closes it
});
document.getElementById("log-modal-confirm").addEventListener("click", () => {
  const confirmBtn = document.getElementById("log-modal-confirm");
  const originalHtml = confirmBtn.innerHTML;

  confirmBtn.disabled = true;
  confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Logging...</span>`;

  const perServing = currentNutrition.perServing;
  const entry = {
    id: Date.now(),
    mealId: currentMeal.id,
    name: currentMeal.name,
    thumbnail: currentMeal.thumbnail,
    servings: logServings,
    calories: Math.round(perServing.calories * logServings),
    protein: Math.round(perServing.protein * logServings),
    carbs: Math.round(perServing.carbs * logServings),
    fat: Math.round(perServing.fat * logServings),
    loggedAt: new Date().toISOString(),
  };

  addFoodLogEntry(entry);

  setTimeout(() => {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = originalHtml;
    closeLogMealModal();
    renderFoodLog();
    renderWeeklyOverview();

    Swal.fire({
      icon: "success",
      title: "Meal logged successfully!",
      text: `${entry.servings} serving(s) of ${entry.name} added to today's log.`,
      timer: 1800,
      showConfirmButton: false,
    });
  }, 400);
});
function renderFoodLog() {
  const entries = getTodayLog();

  // Update date header
  const dateEl = document.getElementById("foodlog-date");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  // Totals
  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  updateProgressBar("calories", totals.calories, DAILY_GOALS.calories, "kcal");
  updateProgressBar("protein", totals.protein, DAILY_GOALS.protein, "g");
  updateProgressBar("carbs", totals.carbs, DAILY_GOALS.carbs, "g");
  updateProgressBar("fat", totals.fat, DAILY_GOALS.fat, "g");

  
  const countHeader = document.querySelector(
    "#foodlog-today-section h4.text-sm.font-semibold",
  );
  if (countHeader) {
    countHeader.textContent = `Logged Items (${entries.length})`;
  }

  const clearBtn = document.getElementById("clear-foodlog");
  clearBtn.style.display = entries.length > 0 ? "inline-flex" : "none";

  
  const list = document.getElementById("logged-items-list");

  if (entries.length === 0) {
  list.innerHTML = `
    <div class="text-center py-12 text-gray-500">
      <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <i class="fa-solid fa-utensils text-3xl text-gray-300"></i>
      </div>
      <p class="font-semibold text-gray-700 text-lg mb-1">No food logged today</p>
      <p class="text-sm text-gray-400 mb-6">Start tracking your nutrition by logging meals or scanning products</p>
      <div class="flex items-center justify-center gap-3">
        <button
          id="empty-state-browse-recipes"
          class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all"
        >
          <i class="fa-solid fa-plus"></i>
          <span>Browse Recipes</span>
        </button>
        <button
          id="empty-state-scan-product"
          class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all"
        >
          <i class="fa-solid fa-barcode"></i>
          <span>Scan Product</span>
        </button>
      </div>
    </div>
  `;

  // Wire the two buttons to navigate, reusing the sidebar nav-link click logic
  document
    .getElementById("empty-state-browse-recipes")
    .addEventListener("click", () => {
      document.querySelector('[data-section="hero-section"]').click();
    });

  document
    .getElementById("empty-state-scan-product")
    .addEventListener("click", () => {
      document.querySelector('[data-section="products-section"]').click();
    });

  return;
}

  list.innerHTML = entries
    .map(
      (entry) => `
      <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl" data-entry-id="${entry.id}">
        <img
          src="${entry.thumbnail}"
          alt="${entry.name}"
          class="w-12 h-12 rounded-lg object-cover shrink-0"
        />
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 text-sm truncate">${entry.name}</p>
          <p class="text-xs text-gray-500">
            ${entry.servingLabel ? entry.servingLabel : `${entry.servings} serving${entry.servings > 1 ? "s" : ""}`} &middot;
            ${entry.calories} kcal &middot;
            P ${entry.protein}g &middot; C ${entry.carbs}g &middot; F ${entry.fat}g
          </p>
        </div>
        <button
          class="remove-log-entry-btn text-gray-400 hover:text-red-500 shrink-0"
          data-entry-id="${entry.id}"
          title="Remove"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `,
    )
    .join("");

  // Wire up per-item remove buttons
  document.querySelectorAll(".remove-log-entry-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.entryId);
      removeFoodLogEntry(id);
      renderFoodLog();
      renderWeeklyOverview(); 
    });
  });
}

function updateProgressBar(key, value, goal, unit) {
  const percent = Math.min(Math.round((value / goal) * 100), 100);
  const rawPercent = (value / goal) * 100; // uncapped, to detect "over goal"

  const bar = document.getElementById(`foodlog-${key}-bar`);
  const label = document.getElementById(`foodlog-${key}-label`);
  const card = bar?.closest("div.rounded-xl"); // the colored card wrapper

  if (bar) {
    bar.style.width = `${percent}%`;

    // Reset any previously-applied status classes
    bar.classList.remove(
      "bg-gray-400", "bg-sky-500", "bg-emerald-500",
      "bg-amber-500", "bg-red-500",
    );

    let statusColor;
    if (rawPercent < 75) {
      statusColor = "bg-green-500";       
    } else if (rawPercent <= 100) {
      statusColor = "bg-emerald-500";    
    } else if (rawPercent <= 120) {
      statusColor = "bg-amber-500";      
    } else {
      statusColor = "bg-red-500";        
    }

    bar.classList.add(statusColor);
  }

  if (label) {
    label.textContent = `${value} / ${goal} ${unit}`;

    label.classList.remove("text-gray-500", "text-emerald-600", "text-amber-600", "text-red-600");

    if (rawPercent > 120) {
      label.classList.add("text-red-600", "font-semibold");
      label.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1"></i>${value} / ${goal} ${unit}`;
    } else if (rawPercent > 100) {
      label.classList.add("text-amber-600");
    } else if (rawPercent >= 75) {
      label.classList.add("text-emerald-600");
    } else {
      label.classList.add("text-gray-500");
    }
  }
}
document.getElementById("clear-foodlog").addEventListener("click", () => {
  Swal.fire({
    icon: "warning",
    title: "Clear today's log?",
    text: "This will remove all logged meals for today.",
    showCancelButton: true,
    confirmButtonText: "Clear All",
    confirmButtonColor: "#ef4444",
  }).then((result) => {
    if (result.isConfirmed) {
      saveTodayLog([]);
      renderFoodLog();
      renderWeeklyOverview();
      Swal.fire({
        icon: "success",
        title: "Food log cleared",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  });
});
document.querySelectorAll(".quick-log-btn").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    if (index === 0) {
      document.querySelector('[data-section="hero-section"]').click();
    } else if (index === 1) {
      document.querySelector('[data-section="products-section"]').click();
    } else if (index === 2) {
      openCustomEntryPrompt();
    }
  });
});

function openCustomEntryPrompt() {
  Swal.fire({
    title: "Add Custom Food",
    html: `
      <input id="swal-food-name" class="swal2-input" placeholder="Food name">
      <input id="swal-food-cal" type="number" class="swal2-input" placeholder="Calories">
      <input id="swal-food-protein" type="number" class="swal2-input" placeholder="Protein (g)">
      <input id="swal-food-carbs" type="number" class="swal2-input" placeholder="Carbs (g)">
      <input id="swal-food-fat" type="number" class="swal2-input" placeholder="Fat (g)">
    `,
    confirmButtonText: "Add",
    showCancelButton: true,
    preConfirm: () => {
      const name = document.getElementById("swal-food-name").value.trim();
      if (!name) {
        Swal.showValidationMessage("Please enter a food name");
        return false;
      }
      return {
        name,
        calories: Number(document.getElementById("swal-food-cal").value) || 0,
        protein: Number(document.getElementById("swal-food-protein").value) || 0,
        carbs: Number(document.getElementById("swal-food-carbs").value) || 0,
        fat: Number(document.getElementById("swal-food-fat").value) || 0,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      addFoodLogEntry({
        id: Date.now(),
        mealId: null,
        name: result.value.name,
        thumbnail: "https://via.placeholder.com/48?text=🍽️",
        servings: 1,
        calories: result.value.calories,
        protein: result.value.protein,
        carbs: result.value.carbs,
        fat: result.value.fat,
        loggedAt: new Date().toISOString(),
      });
      renderFoodLog();
      Swal.fire({
        icon: "success",
        title: "Meal logged successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
}
renderFoodLog();



function getWeekDates() {
 
  const today = new Date();
  const dayOfWeek = today.getDay(); 
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

function getLogForDate(date) {
  const key = `foodlog-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function renderWeeklyOverview() {
  const weekDates = getWeekDates();
  const today = new Date();
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const grid = document.getElementById("weekly-days-grid");
  grid.innerHTML = "";

  let totalCalories = 0;
  let daysWithData = 0;
  let totalItems = 0;
  let daysOnGoal = 0;

  weekDates.forEach((date, index) => {
    const entries = getLogForDate(date);
    const dayCalories = entries.reduce((sum, e) => sum + e.calories, 0);
    const isToday = isSameDay(date, today);
    const isFuture = date > today && !isToday;

    if (entries.length > 0) {
      totalCalories += dayCalories;
      daysWithData++;
      totalItems += entries.length;

      const percentOfGoal = (dayCalories / DAILY_GOALS.calories) * 100;
      if (percentOfGoal >= 75 && percentOfGoal <= 120) {
        daysOnGoal++;
      }
    }

    const cardClasses = isToday
      ? "bg-indigo-100 border-2 border-indigo-300"
      : "bg-transparent";

    const calorieText = isFuture
      ? `<p class="text-lg font-bold text-gray-200 mt-1">--</p>`
      : `<p class="text-lg font-bold ${dayCalories > 0 ? "text-emerald-600" : "text-gray-300"} mt-1">${dayCalories}</p>`;

    grid.innerHTML += `
      <div class="rounded-xl p-3 text-center ${cardClasses}">
        <p class="text-xs text-gray-500">${dayLabels[index]}</p>
        <p class="text-sm font-semibold text-gray-900">${date.getDate()}</p>
        ${calorieText}
        <p class="text-[10px] text-gray-400 -mt-1">kcal</p>
        ${entries.length > 0 ? `<p class="text-[10px] text-gray-400 mt-1">${entries.length} item${entries.length > 1 ? "s" : ""}</p>` : ""}
      </div>
    `;
  });

  const avgCalories = daysWithData > 0 ? Math.round(totalCalories / 7) : 0;

  document.getElementById("weekly-avg-calories").textContent = `${avgCalories} kcal`;
  document.getElementById("weekly-total-items").textContent = `${totalItems} item${totalItems !== 1 ? "s" : ""}`;
  document.getElementById("weekly-days-on-goal").textContent = `${daysOnGoal} / 7`;
}
renderFoodLog();
renderWeeklyOverview();


renderFoodLog();
renderWeeklyOverview();


renderFoodLog();
renderWeeklyOverview();


renderFoodLog();
renderWeeklyOverview();
initProductCategories();

document.addEventListener("nutriplan:log-product", (e) => {
  const product = e.detail;
  if (!product) return;

  const n = product.nutrients || {};

  const entry = {
    id: Date.now(),
    mealId: null,
    productBarcode: product.barcode || null,
    name: product.name || "Unnamed product",
    thumbnail: product.image || "https://via.placeholder.com/48?text=🍽️",
    servings: 1,
    servingLabel: "100g",
    calories: Math.round(n.calories || 0),
    protein: Math.round(n.protein || 0),
    carbs: Math.round(n.carbs || 0),
    fat: Math.round(n.fat || 0),
    loggedAt: new Date().toISOString(),
  };

  addFoodLogEntry(entry);
  renderFoodLog();
  renderWeeklyOverview();
});
let currentView = "grid"; // "grid" | "list"
let lastRenderedRecipes = [];

const gridViewBtn = document.getElementById("grid-view-btn");
const listViewBtn = document.getElementById("list-view-btn");

function setViewButtonsActive(view) {
  if (view === "grid") {
    gridViewBtn.classList.add("bg-white", "shadow-sm");
    gridViewBtn.querySelector("i").classList.remove("text-gray-500");
    gridViewBtn.querySelector("i").classList.add("text-gray-700");

    listViewBtn.classList.remove("bg-white", "shadow-sm");
    listViewBtn.querySelector("i").classList.remove("text-gray-700");
    listViewBtn.querySelector("i").classList.add("text-gray-500");
  } else {
    listViewBtn.classList.add("bg-white", "shadow-sm");
    listViewBtn.querySelector("i").classList.remove("text-gray-500");
    listViewBtn.querySelector("i").classList.add("text-gray-700");

    gridViewBtn.classList.remove("bg-white", "shadow-sm");
    gridViewBtn.querySelector("i").classList.remove("text-gray-700");
    gridViewBtn.querySelector("i").classList.add("text-gray-500");
  }
}

gridViewBtn.addEventListener("click", () => {
  if (currentView === "grid") return;
  currentView = "grid";
  setViewButtonsActive("grid");
  displayRecipes(lastRenderedRecipes);
});

listViewBtn.addEventListener("click", () => {
  if (currentView === "list") return;
  currentView = "list";
  setViewButtonsActive("list");
  displayRecipes(lastRenderedRecipes);
});

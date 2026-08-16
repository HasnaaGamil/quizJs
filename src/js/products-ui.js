import {
  getProductCategories,
  getProductsByCategory,
  searchProducts,
  getProductByBarcode,
} from "./api/products.js";
import { setBarsRelative } from "./utils/bars.js";

const productCategoriesContainer = document.getElementById("product-categories");
const productsGrid = document.getElementById("products-grid");
const productsCount = document.getElementById("products-count");
const searchInput = document.getElementById("product-search-input");
const searchBtn = document.getElementById("search-product-btn");
const barcodeInput = document.getElementById("barcode-input");
const barcodeBtn = document.getElementById("lookup-barcode-btn");

// "category" | "search" | "barcode"
let mode = "category";
let activeCategoryId = null;
let activeCategoryName = "";
let searchQuery = "";
let currentPage = 1;
let totalPages = 1;
let loadedProducts = [];
let activeGradeFilter = "";

const CATEGORY_META = {
  snacks: { icon: "fa-cookie-bite", from: "from-fuchsia-500", to: "to-pink-500" },
  beverages: { icon: "fa-bottle-water", from: "from-blue-500", to: "to-cyan-500" },
  dairies: { icon: "fa-cheese", from: "from-sky-400", to: "to-blue-500" },
  cheeses: { icon: "fa-cheese", from: "from-amber-400", to: "to-yellow-500" },
  yogurts: { icon: "fa-ice-cream", from: "from-fuchsia-500", to: "to-pink-500" },
  chocolates: { icon: "fa-cookie", from: "from-amber-400", to: "to-yellow-800" },
  biscuits: { icon: "fa-cookie", from: "from-orange-400", to: "to-amber-500" },
  "ice-creams": { icon: "fa-ice-cream", from: "from-cyan-400", to: "to-pink-400" },
  "breakfast-cereals": { icon: "fa-wheat-awn", from: "from-orange-500", to: "to-amber-500" },
  breads: { icon: "fa-bread-slice", from: "from-sky-500", to: "to-blue-600" },
  waters: { icon: "fa-droplet", from: "from-sky-400", to: "to-cyan-500" },
  sodas: { icon: "fa-bottle-droplet", from: "from-red-500", to: "to-rose-500" },
  coffees: { icon: "fa-mug-saucer", from: "from-amber-600", to: "to-yellow-800" },
  teas: { icon: "fa-mug-hot", from: "from-sky-500", to: "to-teal-600" },
  fruits: { icon: "fa-apple-whole", from: "from-red-500", to: "to-rose-600" },
  vegetables: { icon: "fa-carrot", from: "from-sky-400", to: "to-blue-500" },
  meats: { icon: "fa-drumstick-bite", from: "from-red-600", to: "to-rose-700" },
  fishes: { icon: "fa-fish", from: "from-sky-500", to: "to-teal-600" },
  "plant-based-foods": { icon: "fa-leaf",  from: "from-orange-500", to: "to-amber-500" },
  "chips-and-fries": { icon: "fa-bowl-food", from: "from-amber-500", to: "to-orange-600" },
  sauces: { icon: "fa-bottle-droplet",from: "from-red-500", to: "to-rose-500" },
  spreads: { icon: "fa-jar", from: "from-orange-400", to: "to-red-500" },
  pastas: { icon: "fa-bowl-food", from: "from-amber-400", to: "to-yellow-500" },
  desserts: { icon: "fa-cake-candles", from: "from-fuchsia-500", to: "to-pink-500" },
};

const DEFAULT_META = { icon: "fa-bowl-food", from: "from-gray-400", to: "to-gray-500" };

const GRADE_BADGE = {
  a: "bg-green-500",
  b: "bg-lime-500",
  c: "bg-yellow-500",
  d: "bg-orange-500",
  e: "bg-red-500",
  unknown: "bg-gray-400",
};

const NOVA_BADGE = {
  1: "bg-green-500",
  2: "bg-lime-500",
  3: "bg-orange-500",
  4: "bg-red-500",
};

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}

// ---------- Categories ----------

export async function initProductCategories() {
  productCategoriesContainer.innerHTML = `
    <div class="h-9 w-28 bg-gray-100 rounded-lg animate-pulse shrink-0"></div>
    <div class="h-9 w-32 bg-gray-100 rounded-lg animate-pulse shrink-0"></div>
    <div class="h-9 w-24 bg-gray-100 rounded-lg animate-pulse shrink-0"></div>
    <div class="h-9 w-28 bg-gray-100 rounded-lg animate-pulse shrink-0"></div>
  `;

  try {
    const data = await getProductCategories();
    renderCategoryPills(data.results);

    if (data.results.length > 0) {
      selectCategory(data.results[0].id, data.results[0].name);
    }
  } catch (error) {
    productCategoriesContainer.innerHTML = `
      <p class="text-sm text-red-500">Couldn't load categories. Refresh to try again.</p>
    `;
  }
}

function renderCategoryPills(categories) {
  productCategoriesContainer.innerHTML = "";

  categories.forEach((category) => {
    const meta = CATEGORY_META[category.id] || DEFAULT_META;

    const button = document.createElement("button");
    button.className =
      `product-category-btn flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap ` +
      `text-white bg-linear-to-r ${meta.from} ${meta.to} shadow-sm hover:shadow-md hover:scale-[1.03] transition-all shrink-0`;
    button.dataset.categoryId = category.id;
    button.innerHTML = `<i class="fa-solid ${meta.icon}"></i><span>${escapeHtml(category.name)}</span>`;

    button.addEventListener("click", () => selectCategory(category.id, category.name));
    productCategoriesContainer.appendChild(button);
  });
}

function setActivePill(categoryId) {
  document.querySelectorAll(".product-category-btn").forEach((btn) => {
    const isActive = btn.dataset.categoryId === categoryId;
    btn.classList.toggle("ring-2", isActive);
    btn.classList.toggle("ring-offset-2", isActive);
    btn.classList.toggle("ring-gray-900", isActive);
  });
}

async function selectCategory(categoryId, categoryName) {
  mode = "category";
  activeCategoryId = categoryId;
  activeCategoryName = categoryName;
  currentPage = 1;
  activeGradeFilter = "";
  setActivePill(categoryId);
  resetGradeFilterButtons();
  clearInputs();
  await loadCurrentPage(true);
}

// ---------- Search & barcode ----------

async function performSearch(query) {
  mode = "search";
  searchQuery = query;
  currentPage = 1;
  activeGradeFilter = "";
  setActivePill(null);
  resetGradeFilterButtons();
  await loadCurrentPage(true);
}

async function lookupBarcode(barcode) {
  mode = "barcode";
  setActivePill(null);
  activeGradeFilter = "";
  resetGradeFilterButtons();
  productsGrid.innerHTML = skeletonCards(1);
  productsCount.textContent = "Looking up barcode...";

  try {
    const data = await getProductByBarcode(barcode);

    if (!data || !data.result) {
      loadedProducts = [];
      productsCount.textContent = `No product found for barcode ${barcode}`;
      productsGrid.innerHTML = `
        <p class="col-span-full text-center text-gray-500 py-10">
          No product matches that barcode. Double-check the number and try again.
        </p>
      `;
      Swal.fire({
        icon: "error",
        title: "Product not found",
        text: `No product matches barcode ${barcode}.`,
      });
      return;
    }

    loadedProducts = [data.result];
    productsCount.textContent = `1 product found`;
    renderProductsGrid();

    // Open the detail modal directly since we already have the full product data
    openProductDetailWithData(data.result);
  } catch (error) {
    productsGrid.innerHTML = `
      <p class="col-span-full text-center text-gray-500 py-10">
        Couldn't look up that barcode. Try again.
      </p>
    `;
  }
}
function clearInputs() {
  searchInput.value = "";
  barcodeInput.value = "";
}

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();

  if (!query) {
    Swal.fire({
      icon: "warning",
      title: "Enter a search term",
      timer: 1500,
      showConfirmButton: false,
    });
    return;
  }

  performSearch(query);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

barcodeBtn.addEventListener("click", () => {
  const barcode = barcodeInput.value.trim();

  if (!barcode) {
    Swal.fire({
      icon: "warning",
      title: "Enter a barcode number",
      timer: 1500,
      showConfirmButton: false,
    });
    return;
  }

  lookupBarcode(barcode);
});

barcodeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") barcodeBtn.click();
});

// ---------- Shared loading / rendering ----------

function skeletonCards(n) {
  return Array.from({ length: n }).map(() => `
    <div class="bg-white rounded-xl overflow-hidden shadow-sm">
      <div class="h-40 bg-gray-100 animate-pulse"></div>
      <div class="p-4 space-y-2">
        <div class="h-3 w-1/2 bg-gray-100 rounded animate-pulse"></div>
        <div class="h-4 w-3/4 bg-gray-100 rounded animate-pulse"></div>
        <div class="h-8 w-full bg-gray-100 rounded animate-pulse mt-3"></div>
      </div>
    </div>
  `).join("");
}

async function loadCurrentPage(reset) {
  if (reset) {
    productsGrid.innerHTML = skeletonCards(8);
    productsCount.textContent = "Loading...";
  }

  try {
    const data = mode === "search"
      ? await searchProducts(searchQuery, currentPage)
      : await getProductsByCategory(activeCategoryId, currentPage);

    totalPages = data.pagination.totalPages;

    loadedProducts = reset ? data.results : loadedProducts.concat(data.results);

    productsCount.textContent = mode === "search"
      ? `${data.pagination.total.toLocaleString()} results for "${searchQuery}"`
      : `${data.pagination.total.toLocaleString()} products in ${activeCategoryName}`;

    renderProductsGrid();
  } catch (error) {
    if (reset) {
      productsGrid.innerHTML = `
        <p class="col-span-full text-center text-gray-500 py-10">
          Couldn't load products. Try again.
        </p>
      `;
    }
  }
}

function resetGradeFilterButtons() {
  document.querySelectorAll(".nutri-score-filter").forEach((btn) => {
    const isAll = btn.dataset.grade === "";
    btn.classList.toggle("bg-emerald-600", isAll);
    btn.classList.toggle("text-white", isAll);
  });
}

function renderProductsGrid() {
  const visible = activeGradeFilter
    ? loadedProducts.filter((p) => (p.nutritionGrade || "unknown").toLowerCase() === activeGradeFilter)
    : loadedProducts;

  if (visible.length === 0) {
    productsGrid.innerHTML = `
      <p class="col-span-full text-center text-gray-500 py-10">
        No products match this filter yet.
      </p>
    `;
    return;
  }

  const showLoadMore = mode !== "barcode";
  productsGrid.innerHTML = visible.map(renderProductCard).join("") + (showLoadMore ? renderLoadMoreButton() : "");

  const loadMoreBtn = document.getElementById("products-load-more-btn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", async () => {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = "Loading...";
      currentPage += 1;
      await loadCurrentPage(false);
    });
  }
}

function renderLoadMoreButton() {
  if (currentPage >= totalPages) return "";
  return `
    <div class="col-span-full flex justify-center mt-2">
      <button
        id="products-load-more-btn"
        class="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
      >
        Show more products
      </button>
    </div>
  `;
}

function renderProductCard(p) {
  const grade = (p.nutritionGrade || "unknown").toLowerCase();
  const gradeBadge = GRADE_BADGE[grade] || GRADE_BADGE.unknown;
  const novaBadge = NOVA_BADGE[p.novaGroup] || "bg-gray-400";
  const n = p.nutrients || {};

  return `
    <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${escapeHtml(p.barcode)}">
      <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        ${p.image ? `
          <img
            class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            src="${escapeHtml(p.image)}"
            alt="${escapeHtml(p.name)}"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div class="hidden absolute inset-0 items-center justify-center text-gray-300">
            <i class="fa-solid fa-image text-3xl"></i>
          </div>
        ` : `
          <div class="flex items-center justify-center text-gray-300">
            <i class="fa-solid fa-image text-3xl"></i>
          </div>
        `}

        <div class="absolute top-2 left-2 ${gradeBadge} text-white text-xs font-bold px-2 py-1 rounded uppercase">
          Nutri-Score ${grade === "unknown" ? "?" : grade}
        </div>

        ${p.novaGroup ? `
          <div class="absolute top-2 right-2 ${novaBadge} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${p.novaGroup}">
            ${p.novaGroup}
          </div>
        ` : ""}
      </div>

      <div class="p-4">
        <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${escapeHtml(p.brand || "Unknown brand")}</p>
        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          ${escapeHtml(p.name || "Unnamed product")}
        </h3>

        <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span><i class="fa-solid fa-fire mr-1"></i>${Math.round(n.calories || 0)} kcal/100g</span>
          <span class="text-gray-400"><i class="fa-solid fa-barcode mr-1"></i>${escapeHtml(p.barcode)}</span>
        </div>

        <div class="grid grid-cols-4 gap-1 text-center">
          <div class="bg-emerald-50 rounded p-1.5">
            <p class="text-xs font-bold text-emerald-700">${n.protein ?? 0}g</p>
            <p class="text-[10px] text-gray-500">Protein</p>
          </div>
          <div class="bg-blue-50 rounded p-1.5">
            <p class="text-xs font-bold text-blue-700">${n.carbs ?? 0}g</p>
            <p class="text-[10px] text-gray-500">Carbs</p>
          </div>
          <div class="bg-purple-50 rounded p-1.5">
            <p class="text-xs font-bold text-purple-700">${n.fat ?? 0}g</p>
            <p class="text-[10px] text-gray-500">Fat</p>
          </div>
          <div class="bg-orange-50 rounded p-1.5">
            <p class="text-xs font-bold text-orange-700">${n.sugar ?? 0}g</p>
            <p class="text-[10px] text-gray-500">Sugar</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

document.querySelectorAll(".nutri-score-filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeGradeFilter = btn.dataset.grade || "";

    document.querySelectorAll(".nutri-score-filter").forEach((b) => {
      b.classList.remove("bg-emerald-600", "text-white");
    });
    btn.classList.add("bg-emerald-600", "text-white");

    renderProductsGrid();
  });
});
// ---------- Product Detail Modal ----------

const productModal = document.getElementById("product-detail-modal");
const productModalCloseX = document.getElementById("product-modal-close-x");
const productModalCloseBtn = document.getElementById("product-modal-close-btn");
const productModalLoading = document.getElementById("product-modal-loading");
const productModalBody = document.getElementById("product-modal-body");
const productModalLogBtn = document.getElementById("product-modal-log-btn");

let activeModalProduct = null;

const GRADE_MODAL_STYLE = {
  a: { bg: "bg-green-500", label: "Excellent" },
  b: { bg: "bg-lime-500", label: "Good" },
  c: { bg: "bg-yellow-500", label: "Average" },
  d: { bg: "bg-orange-500", label: "Poor" },
  e: { bg: "bg-red-500", label: "Bad" },
  unknown: { bg: "bg-gray-400", label: "Unknown" },
};

const NOVA_MODAL_STYLE = {
  1: { bg: "bg-green-500", label: "Unprocessed" },
  2: { bg: "bg-lime-500", label: "Processed culinary ingredients" },
  3: { bg: "bg-orange-500", label: "Processed food" },
  4: { bg: "bg-red-500", label: "Ultra-processed" },
};

productsGrid.addEventListener("click", (e) => {
  if (e.target.closest("#products-load-more-btn")) return;

  const card = e.target.closest(".product-card");
  if (!card) return;

  openProductDetail(card.dataset.barcode);
});

async function openProductDetail(barcode) {
  const cached = loadedProducts.find((p) => p.barcode === barcode);

  showProductModal();

  try {
    const data = await getProductByBarcode(barcode);
    const product = (data && data.result) || cached;
    if (!product) throw new Error("Product not found");

    activeModalProduct = product;
    populateProductModal(product);
  } catch (error) {
    if (cached) {
      activeModalProduct = cached;
      populateProductModal(cached);
    } else {
      productModalLoading.innerHTML = `<p class="text-gray-500 py-6 text-center">Couldn't load this product's details.</p>`;
    }
  }
}

function openProductDetailWithData(product) {
  showProductModal();
  activeModalProduct = product;
  populateProductModal(product);
}

function showProductModal() {
  activeModalProduct = null;
  productModal.classList.remove("hidden");
  productModal.classList.add("flex");
  document.body.style.overflow = "hidden";

  productModalBody.classList.add("hidden");
  productModalLoading.classList.remove("hidden");
  productModalLoading.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-2xl"></i>`;
}

function populateProductModal(p) {
  const n = p.nutrients || {};
  const grade = (p.nutritionGrade || "unknown").toLowerCase();
  const gradeStyle = GRADE_MODAL_STYLE[grade] || GRADE_MODAL_STYLE.unknown;
  const novaStyle = NOVA_MODAL_STYLE[p.novaGroup];

  document.getElementById("product-modal-image").src = p.image || "";
  document.getElementById("product-modal-image").alt = p.name || "";
  document.getElementById("product-modal-subtitle").textContent =
    p.brand || (Array.isArray(p.categories) ? p.categories.join(", ") : "") || "";
  document.getElementById("product-modal-name").textContent = p.name || "Unnamed product";

  const gradeBadge = document.getElementById("product-modal-grade-badge");
  gradeBadge.className = `flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-bold ${gradeStyle.bg}`;
  document.getElementById("product-modal-grade-letter").textContent = grade === "unknown" ? "?" : grade.toUpperCase();
  document.getElementById("product-modal-grade-label").textContent = `Nutri-Score · ${gradeStyle.label}`;

  const novaBadge = document.getElementById("product-modal-nova-badge");
  if (novaStyle) {
    novaBadge.className = `flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-bold ${novaStyle.bg}`;
    document.getElementById("product-modal-nova-number").textContent = `NOVA ${p.novaGroup}`;
    document.getElementById("product-modal-nova-label").textContent = novaStyle.label;
  } else {
    novaBadge.className = "hidden";
  }

  document.getElementById("product-modal-calories").textContent = Math.round(n.calories || 0);

  setBarsRelative([
    { barId: "product-modal-protein-bar", valueId: "product-modal-protein", value: n.protein || 0, unit: "g" },
    { barId: "product-modal-carbs-bar", valueId: "product-modal-carbs", value: n.carbs || 0, unit: "g" },
    { barId: "product-modal-fat-bar", valueId: "product-modal-fat", value: n.fat || 0, unit: "g" },
    { barId: "product-modal-sugar-bar", valueId: "product-modal-sugar", value: n.sugar || 0, unit: "g" },
  ]);

  document.getElementById("product-modal-saturated-fat").textContent = `${n.saturatedFat ?? 0}g`;
  document.getElementById("product-modal-fiber").textContent = `${n.fiber ?? 0}g`;
  document.getElementById("product-modal-salt").textContent = `${n.sodium ?? 0}g`;

  const ingredientsSection = document.getElementById("product-modal-ingredients-section");
  const ingredientsText = p.ingredients || p.ingredientsText || "";
  ingredientsSection.classList.toggle("hidden", !ingredientsText);
  document.getElementById("product-modal-ingredients").textContent = ingredientsText;

  const allergensSection = document.getElementById("product-modal-allergens-section");
  const allergensList = Array.isArray(p.allergens) ? p.allergens.join(", ") : (p.allergens || "");
  allergensSection.classList.toggle("hidden", !allergensList);
  document.getElementById("product-modal-allergens").textContent = allergensList;

  productModalLoading.classList.add("hidden");
  productModalBody.classList.remove("hidden");
}

function closeProductModal() {
  productModal.classList.add("hidden");
  productModal.classList.remove("flex");
  document.body.style.overflow = "";
  activeModalProduct = null;
}

productModalCloseX.addEventListener("click", closeProductModal);
productModalCloseBtn.addEventListener("click", closeProductModal);
productModal.addEventListener("click", (e) => {
  if (e.target === productModal) closeProductModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !productModal.classList.contains("hidden")) closeProductModal();
});

productModalLogBtn.addEventListener("click", () => {
  if (!activeModalProduct) return;

  // Let main.js / the food log module pick this up
  document.dispatchEvent(new CustomEvent("nutriplan:log-product", { detail: activeModalProduct }));

  Swal.fire({
    icon: "success",
    title: "Added to food log",
    text: activeModalProduct.name || "Product",
    timer: 1500,
    showConfirmButton: false,
  });

  closeProductModal();
});

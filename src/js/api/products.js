const PRODUCTS_BASE_URL = "https://nutriplan-api.vercel.app/api/products";

export async function getProductCategories() {
  try {
    const response = await fetch(`${PRODUCTS_BASE_URL}/categories`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get product categories:", error);
    throw error;
  }
}

export async function getProductsByCategory(categoryId, page = 1) {
  try {
    const response = await fetch(
      `${PRODUCTS_BASE_URL}/category/${encodeURIComponent(categoryId)}?page=${page}`,
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get products by category:", error);
    throw error;
  }
}

export async function searchProducts(query, page = 1, limit = 24) {
  try {
    const response = await fetch(
      `${PRODUCTS_BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to search products:", error);
    throw error;
  }
}

export async function getProductByBarcode(barcode) {
  try {
    const response = await fetch(
      `${PRODUCTS_BASE_URL}/barcode/${encodeURIComponent(barcode)}`,
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to look up barcode:", error);
    throw error;
  }
}
const BASE_URL="https://nutriplan-api.vercel.app/api";

export async function getAllCountries() {
    try {
        const response=await fetch(`${BASE_URL}/meals/areas`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
        
    } catch (error) {
         console.error("Failed to get countries:", error);
        throw error
    }
    
}

export async function getAllCategories() {
    try {
        const response=await fetch(`${BASE_URL}/meals/categories`);
        
        if (!response.ok) {
            throw new Error(`Error: ${respoanse.status}`);
        }
        return await response.json();
        
    } catch (error) {
         console.error("Failed to get categories:", error);
        throw error
    }
    
}
export async function filterRecipesByCountry(country) {
    try {
        const formattedCountry =
            country.charAt(0).toLowerCase() + country.slice(1);

        const response = await fetch(
            `${BASE_URL}/meals/filter?area=${formattedCountry}&page=1&limit=25`
        );

        console.log(
            `${BASE_URL}/meals/filter?area=${formattedCountry}&page=1&limit=25`
        );

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        console.log(data);

        return data;

    } catch (error) {
        console.error("Failed to filter by country:", error);
        throw error;
    }
}


export async function getMealsByCategory(category, page = 1, limit = 25) {
    try {
        const response = await fetch(
            `${BASE_URL}/meals/filter?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Failed to get meals by category:", error);
        throw error;
    }
}


export async function getMealById(id) {
    try {
        const response = await fetch(`${BASE_URL}/meals/${id}`);

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Failed to get meal:", error);
        throw error;
    }
}


export async function analyzeNutrition(recipeName, ingredients) {
    try {
        const response = await fetch(`${BASE_URL}/nutrition/analyze`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "x-api-key": `NvNEaNGNB5m7VAiZ58XlWZQhZQLmn2flEEzN8lje`
            },

            body: JSON.stringify({
                recipeName,
                ingredients
            })
        });

        if (!response.ok) {
            throw new Error(`Nutrition API error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Failed to analyze nutrition:", error);
        throw error;
    }
}


export async function searchMeals(query, page = 1, limit = 25) {
    try {
        const response = await fetch(
            `${BASE_URL}/meals/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        return data;

    } catch (error) {
        console.error("Failed to search meals:", error);
        throw error;
    }
}


export async function getRandomMeals(count = 25) {
    try {
        const response = await fetch(`${BASE_URL}/meals/random?count=${count}`);

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Failed to get random meals:", error);
        throw error;
    }
}
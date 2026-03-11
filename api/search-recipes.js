/**
 * Vercel Serverless Function — /api/search-recipes
 *
 * Replaces the never-deployed Supabase Edge Function.
 * Runs on Vercel's servers. No CORS issues. API key stays secret.
 *
 * Flow:
 *  1. Browser POST { ingredients: ["tomato","garlic",...] }
 *  2. This function calls Spoonacular findByIngredients
 *  3. Then fetches full details for the top results
 *  4. Returns shaped recipe data back to the browser
 */

export default async function handler(req, res) {
    // CORS headers (Vercel only serves from your domain, but good practice)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "SPOONACULAR_API_KEY environment variable not set" });
    }
  
    const { ingredients } = req.body ?? {};
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "ingredients array is required" });
    }
  
    try {
      // ── Step 1: Find recipes by ingredients ──────────────────────────────
      const ingredientList = ingredients.join(",+");
      const searchUrl =
        `https://api.spoonacular.com/recipes/findByIngredients` +
        `?ingredients=${encodeURIComponent(ingredientList)}` +
        `&number=10` +
        `&ranking=2` +  // maximise used ingredients (minimise missing)
        `&ignorePantry=true` +
        `&apiKey=${apiKey}`;
  
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) {
        const err = await searchRes.text();
        console.error("Spoonacular findByIngredients error:", err);
        return res.status(searchRes.status).json({ error: "Spoonacular search failed", detail: err });
      }
  
      const found = await searchRes.json(); // Array of { id, title, image, usedIngredients, missedIngredients }
  
      if (!found.length) {
        return res.status(200).json({ recipes: [] });
      }
  
      // ── Step 2: Fetch full details for each recipe ───────────────────────
      const ids = found.map((r) => r.id).join(",");
      const detailUrl =
        `https://api.spoonacular.com/recipes/informationBulk` +
        `?ids=${ids}` +
        `&includeNutrition=false` +
        `&apiKey=${apiKey}`;
  
      const detailRes = await fetch(detailUrl);
      if (!detailRes.ok) {
        // If bulk details fail, return what we have from step 1
        const minimalRecipes = found.map((r) => ({
          id: r.id,
          title: r.title,
          image: r.image,
          cuisines: [],
          readyInMinutes: 30,
          servings: 4,
          summary: "",
          dishTypes: [],
          diets: [],
          usedIngredients: r.usedIngredients.map((i) => i.name),
          missedIngredients: r.missedIngredients.map((i) => i.name),
          steps: [],
        }));
        return res.status(200).json({ recipes: minimalRecipes });
      }
  
      const details = await detailRes.json(); // Array of full recipe objects
  
      // ── Step 3: Fetch step-by-step instructions ──────────────────────────
      // Build a map of id → used/missed ingredients from the search results
      const ingredientMap = {};
      for (const r of found) {
        ingredientMap[r.id] = {
          usedIngredients: r.usedIngredients.map((i) => i.name),
          missedIngredients: r.missedIngredients.map((i) => i.name),
        };
      }
  
      // Attach instructions (already included in informationBulk via analyzedInstructions)
      const recipes = details.map((d) => {
        const ing = ingredientMap[d.id] ?? { usedIngredients: [], missedIngredients: [] };
  
        // Flatten analyzed instructions into steps
        const steps =
          d.analyzedInstructions?.[0]?.steps?.map((s) => ({
            number: s.number,
            step: s.step,
          })) ?? [];
  
        return {
          id: d.id,
          title: d.title,
          image: d.image,
          cuisines: d.cuisines ?? [],
          readyInMinutes: d.readyInMinutes ?? 30,
          servings: d.servings ?? 4,
          summary: d.summary ?? "",
          dishTypes: d.dishTypes ?? [],
          diets: d.diets ?? [],
          sourceUrl: d.sourceUrl ?? "#",
          usedIngredients: ing.usedIngredients,
          missedIngredients: ing.missedIngredients,
          steps,
        };
      });
  
      return res.status(200).json({ recipes });
    } catch (error) {
      console.error("search-recipes error:", error);
      return res.status(500).json({ error: "Internal server error", detail: error.message });
    }
  }
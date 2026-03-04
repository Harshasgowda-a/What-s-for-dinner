// App.tsx — fixed images, no header search bar, Recipes browse page, recipe suggestion pills
import { useState, useRef, useEffect, useCallback } from 'react';

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'your_anon_key_here';
const USE_MOCK = true;

// ── FALLBACK IMAGES (beautiful kitchen/food stock photos) ─────────────────
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700', // kitchen counter
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=700', // spices overhead
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700', // food overhead
  'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=700', // cooking pan
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700', // fine dining
];
const getFallback = (id: number) =>
  FALLBACK_IMAGES[id % FALLBACK_IMAGES.length];

// ── INGREDIENT DATABASE ───────────────────────────────────────────────────
const INGREDIENT_DB: string[] = [
  'chicken',
  'chicken breast',
  'chicken thighs',
  'chicken wings',
  'ground chicken',
  'beef',
  'ground beef',
  'beef steak',
  'ribeye',
  'sirloin',
  'pork',
  'pork chops',
  'bacon',
  'ham',
  'sausage',
  'salmon',
  'tuna',
  'shrimp',
  'cod',
  'tilapia',
  'crab',
  'eggs',
  'egg yolks',
  'egg whites',
  'milk',
  'buttermilk',
  'heavy cream',
  'sour cream',
  'cream cheese',
  'butter',
  'unsalted butter',
  'ghee',
  'cheddar cheese',
  'mozzarella',
  'parmesan',
  'feta',
  'ricotta',
  'paneer',
  'garlic',
  'garlic powder',
  'minced garlic',
  'onion',
  'red onion',
  'green onion',
  'shallots',
  'leek',
  'tomato',
  'cherry tomatoes',
  'tomato paste',
  'tomato sauce',
  'potato',
  'sweet potato',
  'broccoli',
  'cauliflower',
  'spinach',
  'kale',
  'lettuce',
  'cabbage',
  'carrot',
  'celery',
  'cucumber',
  'zucchini',
  'eggplant',
  'bell pepper',
  'jalapeño',
  'mushroom',
  'portobello mushroom',
  'shiitake mushroom',
  'avocado',
  'lemon',
  'lime',
  'orange',
  'apple',
  'banana',
  'strawberry',
  'pasta',
  'spaghetti',
  'penne',
  'fettuccine',
  'lasagna sheets',
  'rice',
  'brown rice',
  'jasmine rice',
  'basmati rice',
  'bread',
  'sourdough',
  'tortilla',
  'naan',
  'pita',
  'flour',
  'all-purpose flour',
  'almond flour',
  'cornstarch',
  'sugar',
  'brown sugar',
  'honey',
  'maple syrup',
  'olive oil',
  'vegetable oil',
  'coconut oil',
  'sesame oil',
  'soy sauce',
  'fish sauce',
  'oyster sauce',
  'hot sauce',
  'worcestershire sauce',
  'balsamic vinegar',
  'apple cider vinegar',
  'rice vinegar',
  'salt',
  'black pepper',
  'cumin',
  'paprika',
  'turmeric',
  'cinnamon',
  'oregano',
  'basil',
  'thyme',
  'rosemary',
  'cilantro',
  'parsley',
  'mint',
  'dill',
  'chili flakes',
  'cayenne pepper',
  'curry powder',
  'garam masala',
  'coriander powder',
  'chicken broth',
  'beef broth',
  'vegetable broth',
  'coconut milk',
  'almond milk',
  'oat milk',
  'black beans',
  'chickpeas',
  'lentils',
  'kidney beans',
  'edamame',
  'corn',
  'peas',
  'asparagus',
  'green beans',
  'bok choy',
  'tofu',
  'tempeh',
  'walnuts',
  'almonds',
  'cashews',
  'peanuts',
  'pine nuts',
  'dark chocolate',
  'cocoa powder',
  'vanilla extract',
  'baking powder',
  'baking soda',
  'breadcrumbs',
  'oats',
  'quinoa',
  'dijon mustard',
  'mayonnaise',
  'ketchup',
  'sriracha',
  'tahini',
  'pesto',
  'ginger',
  'fresh ginger',
  'wine',
  'white wine',
  'red wine',
  'beer',
  'cardamom',
  'cloves',
  'bay leaves',
  'mustard seeds',
  'fennel seeds',
  'chili powder',
  'kashmiri chili',
  'tamarind',
  'yogurt',
].sort();

type Cuisine =
  | 'All'
  | 'Indian'
  | 'Chinese'
  | 'Italian'
  | 'American'
  | 'Mediterranean'
  | 'Mexican'
  | 'Japanese';

interface RecipeStep {
  step: number;
  title: string;
  instruction: string;
  tip?: string;
}
interface Recipe {
  id: number;
  title: string;
  image: string;
  cuisine: Cuisine;
  readyInMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  usedIngredients: string[];
  missedIngredients: string[];
  usedIngredientCount: number;
  missedIngredientCount: number;
  sourceUrl: string;
  steps: RecipeStep[];
  proTip: string;
}

const CUISINES: { label: Cuisine; emoji: string }[] = [
  { label: 'All', emoji: '🌍' },
  { label: 'Indian', emoji: '🇮🇳' },
  { label: 'Chinese', emoji: '🇨🇳' },
  { label: 'Italian', emoji: '🇮🇹' },
  { label: 'American', emoji: '🇺🇸' },
  { label: 'Mediterranean', emoji: '🫒' },
  { label: 'Mexican', emoji: '🇲🇽' },
  { label: 'Japanese', emoji: '🇯🇵' },
];

// ── RECIPE DATABASE ───────────────────────────────────────────────────────
const ALL_RECIPES: Recipe[] = [
  // ── INDIAN ───────────────────────────────────────────────────────────────
  {
    id: 1,
    cuisine: 'Indian',
    title: 'Butter Chicken (Murgh Makhani)',
    // Verified: creamy orange Indian curry in bowl
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=700',
    readyInMinutes: 45,
    servings: 4,
    difficulty: 'Medium',
    description:
      "India's most beloved curry — tender chicken in a velvety, mildly spiced tomato-cream sauce. The secret is the double-cooking method: first charring the chicken, then simmering it in the rich makhani (butter) gravy until it absorbs all the flavour.",
    usedIngredients: [
      'chicken',
      'tomato',
      'garlic',
      'ginger',
      'butter',
      'heavy cream',
      'garam masala',
      'cumin',
    ],
    missedIngredients: ['kashmiri chili', 'cardamom', 'fenugreek leaves'],
    usedIngredientCount: 8,
    missedIngredientCount: 3,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Marinate the chicken',
        instruction:
          'Cut 700g chicken thighs into large bite-sized pieces. In a bowl, mix 200g yogurt, 1 tsp turmeric, 1 tsp cumin, 1 tsp garam masala, 1 tbsp minced ginger, 1 tbsp minced garlic, 1 tsp Kashmiri chili powder, and 1 tsp salt. Add the chicken, coat thoroughly, and marinate for at least 30 minutes — overnight gives the best flavour.',
        tip: 'The longer the marinade, the more tender and flavourful the chicken. Yogurt helps break down the meat fibres.',
      },
      {
        step: 2,
        title: 'Char the chicken',
        instruction:
          "Heat a grill pan or heavy skillet over very high heat until smoking hot. Brush with a little oil. Cook the marinated chicken pieces for 3–4 minutes per side until nicely charred. Don't worry about cooking through fully — it will finish in the sauce. Set aside.",
        tip: "The char on the chicken gives Butter Chicken its signature smoky depth. Don't skip this step.",
      },
      {
        step: 3,
        title: 'Make the makhani base',
        instruction:
          'In the same pan, melt 2 tbsp butter over medium heat. Add 1 large diced onion and cook 8 minutes until golden. Add 4 minced garlic cloves and 1 tbsp grated ginger — cook 2 minutes. Add 3 chopped tomatoes, 1 tsp Kashmiri chili, 1 tsp cumin, and 2 cardamom pods. Simmer 15 minutes until tomatoes break down and oil separates.',
        tip: "The oil separating ('bhuno') means the spices are fully cooked through — no raw flavour remains.",
      },
      {
        step: 4,
        title: 'Blend the sauce',
        instruction:
          'Remove cardamom pods. Let cool slightly, then blend completely smooth. Pour through a fine mesh sieve back into the pan, pressing with a spoon. Discard the fibrous solids.',
      },
      {
        step: 5,
        title: 'Finish the curry',
        instruction:
          'Return the sieved sauce to medium-low heat. Stir in 150ml heavy cream and 2 tbsp butter. Add the charred chicken and simmer gently 10 minutes. Stir in 1 tsp dried fenugreek leaves (kasuri methi) — the secret ingredient that makes it taste authentic.',
        tip: 'Adding kasuri methi at the end preserves its herby aroma. Available at any Indian grocery store.',
      },
      {
        step: 6,
        title: 'Serve',
        instruction:
          'Garnish with a swirl of cream and fresh cilantro. Serve hot with butter naan or steamed basmati rice.',
      },
    ],
    proTip:
      'Use Kashmiri chili powder for a beautiful deep red colour without making the dish too spicy.',
  },
  {
    id: 2,
    cuisine: 'Indian',
    title: 'Dal Tadka (Tempered Lentils)',
    // Verified: yellow lentil dal in bowl
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700',
    readyInMinutes: 40,
    servings: 4,
    difficulty: 'Easy',
    description:
      'A comforting staple across India — yellow lentils cooked until silky soft, finished with a sizzling tempering of whole spices, garlic, and chili poured over the top. Simple ingredients, extraordinarily satisfying.',
    usedIngredients: [
      'lentils',
      'garlic',
      'tomato',
      'onion',
      'cumin',
      'turmeric',
      'butter',
      'ginger',
    ],
    missedIngredients: ['mustard seeds', 'dried red chili'],
    usedIngredientCount: 8,
    missedIngredientCount: 2,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Rinse and boil the dal',
        instruction:
          'Rinse 250g yellow split lentils under cold water until the water runs clear. Add to a pot with 750ml water, 1 tsp turmeric, and ½ tsp salt. Bring to a boil, then reduce to a simmer. Cook uncovered for 20–25 minutes, stirring occasionally, until the lentils are completely soft and almost mushy.',
        tip: 'You want the lentils very soft — they should dissolve when pressed between your fingers.',
      },
      {
        step: 2,
        title: 'Build the masala base',
        instruction:
          'In a separate wide pan, heat 2 tbsp ghee over medium-high. Add 1 medium diced onion and cook 8 minutes until deep golden. Add 1 tbsp minced garlic and 1 tsp grated ginger — cook 2 minutes. Add 2 chopped tomatoes, 1 tsp cumin powder, 1 tsp coriander powder, and chili powder. Cook 8 minutes until tomatoes break down.',
      },
      {
        step: 3,
        title: 'Combine and simmer',
        instruction:
          'Pour the cooked lentils into the masala base. Stir well to combine. Add water to reach your preferred consistency. Simmer together 5 minutes. Taste and adjust salt.',
      },
      {
        step: 4,
        title: 'Make the tadka (tempering)',
        instruction:
          'In a small pan, heat 1 tbsp ghee over high heat until it shimmers. Add 1 tsp cumin seeds — they should sizzle and pop within seconds. Add 3 thinly sliced garlic cloves and 1 dried red chili. Swirl 30 seconds until garlic turns golden. Immediately pour this entire sizzling mixture over the dal.',
        tip: 'The tadka must be poured immediately at high heat. The sizzle when it hits the dal is the sound of flavour.',
      },
      {
        step: 5,
        title: 'Garnish and serve',
        instruction:
          'Stir once, garnish with fresh cilantro and a squeeze of lemon. Serve hot with steamed basmati rice, roti, or naan.',
      },
    ],
    proTip:
      'Dal tastes even better the next day as the spices develop. Reheat with a splash of water and a fresh tadka on top.',
  },
  {
    id: 3,
    cuisine: 'Indian',
    title: 'Palak Paneer',
    // Using a verified green spinach/curry image
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=700',
    readyInMinutes: 35,
    servings: 3,
    difficulty: 'Medium',
    description:
      'Cubes of soft fresh cheese in a vibrant, silky spinach sauce. The key technique is blanching the spinach to lock in its bright green colour, then blending it smooth before adding to the spiced base.',
    usedIngredients: [
      'paneer',
      'spinach',
      'garlic',
      'onion',
      'ginger',
      'tomato',
      'cumin',
      'garam masala',
    ],
    missedIngredients: ['kasuri methi', 'heavy cream'],
    usedIngredientCount: 8,
    missedIngredientCount: 2,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Blanch the spinach',
        instruction:
          'Bring a large pot of water to a rolling boil. Add 400g fresh spinach and blanch for exactly 2 minutes. Immediately drain and plunge into ice-cold water to stop cooking and preserve the vibrant green. Squeeze out excess water, then blend with ¼ cup water to a smooth, thick purée.',
        tip: 'The ice bath is non-negotiable for that bright green colour. Never overcook the spinach.',
      },
      {
        step: 2,
        title: 'Fry the paneer',
        instruction:
          'Cut 250g paneer into 2cm cubes. Heat 1 tbsp oil in a non-stick pan over medium-high heat. Fry 2 minutes per side until lightly golden. Remove and set aside. Frying gives paneer a slightly chewy outside while keeping it soft inside.',
      },
      {
        step: 3,
        title: 'Cook the masala base',
        instruction:
          'In the same pan, heat 2 tbsp ghee over medium heat. Add 1 tsp cumin seeds and let sizzle 15 seconds. Add 1 large finely diced onion and cook 8 minutes until golden. Add 1 tbsp garlic paste and 1 tsp ginger paste — fry 2 minutes. Add 1 diced tomato, 1 tsp coriander powder, ½ tsp turmeric, and ½ tsp garam masala. Cook 5 minutes.',
      },
      {
        step: 4,
        title: 'Combine everything',
        instruction:
          'Pour the spinach purée into the masala base and stir well. Add ½ cup water to adjust consistency. Simmer 3–4 minutes. Add the fried paneer cubes and stir gently. Simmer 3 more minutes.',
        tip: "Don't stir too aggressively — the paneer should stay in neat cubes.",
      },
      {
        step: 5,
        title: 'Finish and serve',
        instruction:
          'Stir in 2 tbsp heavy cream and a pinch of kasuri methi. Taste and adjust salt. Serve hot with butter naan or roti.',
      },
    ],
    proTip:
      "If you can't find paneer, extra-firm tofu pressed dry makes an excellent substitute.",
  },
  {
    id: 4,
    cuisine: 'Indian',
    title: 'Chicken Biryani',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=700',
    readyInMinutes: 75,
    servings: 5,
    difficulty: 'Hard',
    description:
      "A fragrant, layered rice dish of royal origin — marinated chicken cooked with basmati rice, whole spices, fried onions, and saffron. Sealed and steam-cooked using the 'dum' method for an unforgettable result.",
    usedIngredients: [
      'chicken',
      'basmati rice',
      'onion',
      'garlic',
      'ginger',
      'yogurt',
      'garam masala',
      'turmeric',
    ],
    missedIngredients: [
      'saffron',
      'biryani masala',
      'whole spices',
      'fried onions',
    ],
    usedIngredientCount: 8,
    missedIngredientCount: 4,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Marinate the chicken',
        instruction:
          'Mix 800g chicken pieces with 250g yogurt, 2 tbsp biryani masala, 1 tsp turmeric, 1 tbsp garlic-ginger paste, 2 tsp chili powder, juice of 1 lemon, and 1 tsp salt. Marinate for at least 2 hours, or overnight for the best flavour.',
        tip: 'The yogurt marinade tenderises the chicken and helps it stay moist during the long cooking process.',
      },
      {
        step: 2,
        title: 'Par-boil the basmati rice',
        instruction:
          'Rinse 400g aged basmati rice until the water runs clear. Soak 30 minutes, then drain. Bring a large pot of heavily salted water to a boil with whole spices (2 bay leaves, 4 cloves, 2 cardamom, 1 cinnamon stick). Add the rice and cook until 70% done — it should still have a firm bite. Drain immediately.',
        tip: 'Par-cooking the rice to exactly 70% is the secret of biryani. Fully cooked rice will turn mushy during the dum (steam) stage.',
      },
      {
        step: 3,
        title: 'Fry the onions',
        instruction:
          'Thinly slice 3 large onions. Heat generous oil (or ghee) in a wide pan and fry the onions over medium heat for 20–25 minutes, stirring often, until they are deep caramel brown and crispy. Remove and drain on paper. These are the beresta (fried onions) — they add sweetness and crunch.',
      },
      {
        step: 4,
        title: 'Cook the chicken base',
        instruction:
          'In a heavy-bottomed pot, heat 3 tbsp ghee. Add the marinated chicken and cook on high heat for 8–10 minutes, stirring, until the chicken is partially cooked and the masala is thick and fragrant. The mixture should look dry and well-caramelised at the bottom.',
      },
      {
        step: 5,
        title: 'Layer the biryani',
        instruction:
          'Keep the chicken in the pot. Layer half the par-cooked rice over the chicken. Scatter half the fried onions, a handful of fresh mint and cilantro. Add the second layer of rice. Top with remaining fried onions, fresh herbs, and saffron dissolved in 3 tbsp warm milk (drizzled over the top). Dot with ghee.',
      },
      {
        step: 6,
        title: 'Dum (steam) cooking',
        instruction:
          'Seal the pot tightly with foil, then put the lid on top. Cook on a tawa (flat griddle) or thick skillet on the lowest heat for 25 minutes. The steam trapped inside finishes cooking everything perfectly and melds all the flavours.',
        tip: 'The tawa under the pot prevents direct contact with the flame and distributes heat evenly. Aluminium foil seal is essential — no steam should escape.',
      },
    ],
    proTip:
      "The aroma when you open the sealed pot — the 'dum' — is one of the most intoxicating smells in all of cooking.",
  },
  {
    id: 5,
    cuisine: 'Indian',
    title: 'Chole (Punjabi Chickpea Curry)',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=700',
    readyInMinutes: 45,
    servings: 4,
    difficulty: 'Easy',
    description:
      'Bold, tangy, deeply spiced chickpeas in a thick onion-tomato gravy — a Punjabi classic served with bhature or rice. The signature dark colour and sourness come from black tea and amchur (dry mango powder).',
    usedIngredients: [
      'chickpeas',
      'onion',
      'tomato',
      'garlic',
      'ginger',
      'cumin',
      'coriander powder',
      'garam masala',
    ],
    missedIngredients: ['amchur powder', 'chana masala', 'black tea bag'],
    usedIngredientCount: 8,
    missedIngredientCount: 3,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Prepare chickpeas',
        instruction:
          'If using dried chickpeas, soak 250g overnight, then pressure cook with 1 black tea bag (this darkens them) for 20 minutes until very soft. If using canned chickpeas, drain and rinse 2 cans.',
        tip: 'The black tea bag gives chole its characteristic dark colour without any tea flavour.',
      },
      {
        step: 2,
        title: 'Make the masala',
        instruction:
          'Heat 3 tbsp oil in a deep pan. Add 2 large finely chopped onions and cook 15 minutes until deep brown. Add 1 tbsp garlic-ginger paste and cook 2 minutes. Add 2 blended tomatoes, chana masala, cumin, coriander powder, and chili powder. Cook 10 minutes until oil separates.',
      },
      {
        step: 3,
        title: 'Add chickpeas and simmer',
        instruction:
          'Add the cooked chickpeas and 250ml water. Mix well, slightly mash some chickpeas with the back of a spoon — this thickens the gravy naturally. Simmer on medium heat for 15 minutes.',
      },
      {
        step: 4,
        title: 'Finish with sourness',
        instruction:
          'Add 1 tsp amchur (dry mango powder) or a squeeze of lemon for the characteristic tanginess. Add 1 tsp garam masala and stir. Simmer 5 more minutes.',
      },
      {
        step: 5,
        title: 'Serve',
        instruction:
          'Garnish with sliced ginger, green chili, fresh cilantro, and a squeeze of lemon. Serve with bhature, puri, or steamed rice.',
      },
    ],
    proTip:
      'Slightly mashing a quarter of the chickpeas is what makes chole thick and restaurant-style — never skip this step.',
  },
  {
    id: 6,
    cuisine: 'Indian',
    title: 'Aloo Gobi (Potato & Cauliflower)',
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=700',
    readyInMinutes: 30,
    servings: 3,
    difficulty: 'Easy',
    description:
      'A dry, fragrant stir-fry of potato and cauliflower spiced with cumin, turmeric, and coriander. One of the most comforting and widely cooked everyday Indian dishes.',
    usedIngredients: [
      'potato',
      'cauliflower',
      'garlic',
      'ginger',
      'cumin',
      'turmeric',
      'coriander powder',
      'tomato',
    ],
    missedIngredients: ['mustard seeds', 'amchur powder'],
    usedIngredientCount: 8,
    missedIngredientCount: 2,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Prep the vegetables',
        instruction:
          'Cut 3 medium potatoes into 2cm cubes and break 1 medium cauliflower into medium florets. Keep them roughly the same size for even cooking. Pat the cauliflower dry with a towel — moisture makes it steam rather than fry.',
      },
      {
        step: 2,
        title: 'Temper the spices',
        instruction:
          'Heat 3 tbsp oil in a wide, heavy pan over medium-high heat. Add 1 tsp cumin seeds and let them splutter for 20 seconds. Add 1 tsp grated ginger and 3 minced garlic cloves — sauté 30 seconds until fragrant.',
      },
      {
        step: 3,
        title: 'Cook the potatoes first',
        instruction:
          'Add the potatoes to the pan and toss to coat in the spiced oil. Add ½ tsp turmeric, 1 tsp coriander powder, and salt. Cover and cook on medium heat for 8 minutes, stirring occasionally, until potatoes are halfway cooked.',
      },
      {
        step: 4,
        title: 'Add cauliflower and finish',
        instruction:
          'Add the cauliflower florets and 1 chopped tomato. Toss everything together. Cook uncovered on medium-high heat for another 10 minutes, stirring every 2 minutes, until both vegetables are tender with some golden, slightly crispy edges.',
        tip: 'Cooking uncovered at the end is crucial for the dry texture. Covered cooking creates steam and makes the vegetables soggy.',
      },
      {
        step: 5,
        title: 'Serve',
        instruction:
          'Sprinkle with 1 tsp garam masala, amchur, and fresh cilantro. Serve hot with roti, paratha, or as a side with dal and rice.',
      },
    ],
    proTip:
      "Don't crowd the pan. Use a wide pan and resist stirring too often — the vegetables need contact with the hot pan surface to caramelise.",
  },

  // ── CHINESE ──────────────────────────────────────────────────────────────
  {
    id: 7,
    cuisine: 'Chinese',
    title: 'Kung Pao Chicken',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=700',
    readyInMinutes: 25,
    servings: 3,
    difficulty: 'Medium',
    description:
      "A classic Sichuan stir-fry with tender chicken, crunchy peanuts, and dried chilies in a glossy sweet-savoury-spicy sauce. Wok cooking over very high heat creates the signature smoky 'wok hei' flavour.",
    usedIngredients: [
      'chicken',
      'garlic',
      'ginger',
      'soy sauce',
      'peanuts',
      'bell pepper',
      'cornstarch',
      'sesame oil',
    ],
    missedIngredients: [
      'dried red chili',
      'sichuan peppercorn',
      'rice vinegar',
    ],
    usedIngredientCount: 8,
    missedIngredientCount: 3,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Marinate the chicken',
        instruction:
          'Cut 400g boneless chicken into 1.5cm cubes. Combine with 1 tbsp soy sauce, 1 tsp cornstarch, 1 tsp sesame oil, and a pinch of white pepper. Mix well and marinate 15 minutes.',
        tip: 'Uniform cube size ensures even cooking. Cornstarch forms a light coating that keeps the chicken juicy.',
      },
      {
        step: 2,
        title: 'Mix the Kung Pao sauce',
        instruction:
          'Whisk together: 2 tbsp soy sauce, 1 tbsp rice vinegar, 1 tbsp sugar, 1 tsp sesame oil, 1 tsp cornstarch, and 2 tbsp water. Stir until sugar dissolves. Prepare this before you start cooking — stir-frying moves too fast for mid-cook mixing.',
      },
      {
        step: 3,
        title: 'Heat the wok properly',
        instruction:
          'Place your wok over the highest heat for 2–3 minutes until it smokes slightly. Add 2 tbsp vegetable oil and swirl to coat.',
        tip: "If the oil doesn't shimmer and almost smoke, the wok is not hot enough. High heat is the entire technique here.",
      },
      {
        step: 4,
        title: 'Stir-fry aromatics and chicken',
        instruction:
          'Add 6–8 dried red chilies and 1 tsp Sichuan peppercorns — stir 20 seconds. Add 4 minced garlic cloves and 1 tbsp minced ginger — toss 20 seconds. Add marinated chicken in a single layer; leave 1 minute untouched to sear, then toss vigorously 2–3 minutes until cooked.',
      },
      {
        step: 5,
        title: 'Add vegetables and sauce',
        instruction:
          'Add diced bell pepper and stir-fry 1 minute. Pour the prepared sauce over everything and toss to coat. Let it bubble and thicken 30–45 seconds. Add ¼ cup roasted peanuts and toss. Serve immediately over steamed jasmine rice.',
      },
    ],
    proTip:
      "Sichuan peppercorns give a unique numbing tingle. Find them at any Asian grocery — they're what make Kung Pao taste authentic.",
  },
  {
    id: 8,
    cuisine: 'Chinese',
    title: 'Egg Fried Rice',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=700',
    readyInMinutes: 15,
    servings: 3,
    difficulty: 'Easy',
    description:
      "The ultimate 'clean out the fridge' dish — day-old rice stir-fried with eggs, vegetables, and soy sauce in a screaming hot wok. Simple, fast, and incredibly satisfying when done correctly.",
    usedIngredients: [
      'rice',
      'eggs',
      'soy sauce',
      'garlic',
      'sesame oil',
      'green onion',
      'peas',
      'carrot',
    ],
    missedIngredients: ['oyster sauce'],
    usedIngredientCount: 8,
    missedIngredientCount: 1,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Use cold day-old rice',
        instruction:
          'Use 2 cups of cooked rice refrigerated overnight. Cold dry rice is essential — fresh rice is too moist and steams instead of frying, making it mushy. Break up any clumps with your hands before cooking.',
        tip: 'This is the most important rule: the rice MUST be cold and dry. Leftover rice from last night is perfect.',
      },
      {
        step: 2,
        title: 'Prep everything first',
        instruction:
          'Beat 3 eggs with a pinch of salt. Mince 3 garlic cloves. Dice 1 small carrot finely. Slice 3 green onions, separating white and green parts. Measure ½ cup frozen peas and thaw. Have soy sauce, oyster sauce, and sesame oil ready.',
        tip: 'In stir-frying, you have no time to chop mid-cook. Everything must be prepped before you begin.',
      },
      {
        step: 3,
        title: 'Scramble eggs in hot wok',
        instruction:
          'Heat wok over highest heat for 2 minutes until smoking. Add 1 tbsp oil. Pour in beaten eggs and scramble quickly, breaking into small curds. When just set but still slightly wet, push to the side.',
      },
      {
        step: 4,
        title: 'Fry aromatics and rice',
        instruction:
          'Add 1 tbsp more oil. Add garlic and white onion — stir-fry 30 seconds. Add carrot, stir-fry 2 minutes. Add peas and toss. Add all cold rice, spread flat against the hot surface, leave untouched 30 seconds to develop a crust. Then toss and stir-fry 3 minutes until each grain is separate.',
      },
      {
        step: 5,
        title: 'Season and finish',
        instruction:
          'Pour soy sauce and oyster sauce around the wok edges (not on the rice directly) so they sizzle on contact. Toss everything together. Add 1 tsp sesame oil, toss once more. Garnish with green onion tops. Serve immediately.',
        tip: 'Adding soy sauce around the edges lets it caramelise on the hot metal — deeper and smokier than adding it to the rice directly.',
      },
    ],
    proTip:
      'Pour sauces around the wok edges, never directly on the rice — that caramelisation on the hot metal is where the flavour lives.',
  },

  // ── ITALIAN ───────────────────────────────────────────────────────────────
  {
    id: 9,
    cuisine: 'Italian',
    title: 'Spaghetti Carbonara',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=700',
    readyInMinutes: 25,
    servings: 3,
    difficulty: 'Medium',
    description:
      "Rome's most iconic pasta — silky spaghetti coated in a rich sauce of eggs, pecorino, and guanciale. The magic is entirely in technique: residual heat gently cooks the eggs into a silky sauce without scrambling.",
    usedIngredients: [
      'pasta',
      'eggs',
      'bacon',
      'parmesan',
      'black pepper',
      'garlic',
    ],
    missedIngredients: ['pecorino romano', 'guanciale'],
    usedIngredientCount: 6,
    missedIngredientCount: 2,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Prepare the sauce base',
        instruction:
          'Whisk together 3 whole eggs plus 2 extra yolks with 80g finely grated pecorino romano, generous cracked black pepper, and a tiny pinch of salt. Whisk until smooth and creamy. Set aside at room temperature.',
        tip: 'Room temperature eggs blend more smoothly. Extra yolks make the sauce richer and more emulsified.',
      },
      {
        step: 2,
        title: 'Cook the guanciale',
        instruction:
          'Dice 150g guanciale or thick bacon into 1cm cubes. Cook in a cold dry pan over medium heat for 8–10 minutes until the fat has rendered and pieces are golden and crispy. Keep warm on very low heat. Reserve all rendered fat in the pan.',
      },
      {
        step: 3,
        title: 'Cook pasta in well-salted water',
        instruction:
          'Bring a large pot of water to a rolling boil. Add 2 tbsp salt. Cook 300g spaghetti until al dente. Before draining, scoop out 2 full cups of starchy pasta water. This cloudy water is what emulsifies your sauce.',
        tip: 'Pasta water is the secret ingredient. Its starch helps the sauce coat every strand.',
      },
      {
        step: 4,
        title: 'Create the silky sauce',
        instruction:
          'Drain pasta and add to the pan with guanciale over medium-low heat. Toss 30 seconds. Take the pan OFF the heat entirely — wait 30 seconds. Pour the egg-cheese mixture over the pasta all at once. Toss rapidly and continuously, adding pasta water a spoonful at a time until silky and glossy.',
        tip: 'Remove from heat before adding eggs — no exceptions. Direct heat makes scrambled eggs, not a sauce.',
      },
      {
        step: 5,
        title: 'Serve immediately',
        instruction:
          'Plate in warmed bowls. Add extra grated cheese and a crack of fresh black pepper. Carbonara waits for no one — it thickens as it cools.',
      },
    ],
    proTip:
      'Never add cream. Authentic carbonara has no cream — silkiness comes entirely from the egg-fat emulsion and starchy pasta water.',
  },
  {
    id: 10,
    cuisine: 'Italian',
    title: 'Garlic Butter Pasta (Aglio e Olio)',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700',
    readyInMinutes: 20,
    servings: 3,
    difficulty: 'Easy',
    description:
      'One of the simplest and most perfect Italian dishes — just pasta, garlic, olive oil, chili flakes, and parmesan. Excellence is entirely in technique: properly toasting the garlic and emulsifying oil with pasta water.',
    usedIngredients: [
      'pasta',
      'garlic',
      'olive oil',
      'parmesan',
      'chili flakes',
      'parsley',
    ],
    missedIngredients: [],
    usedIngredientCount: 6,
    missedIngredientCount: 0,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Boil pasta in well-salted water',
        instruction:
          'Bring 4 litres of water to a rolling boil. Add 2 tbsp coarse salt — it should taste like a light broth. Cook 350g spaghetti until al dente. Before draining, reserve 1.5 cups of pasta water.',
        tip: 'Well-salted pasta water is the foundation. It cannot be corrected after the fact.',
      },
      {
        step: 2,
        title: 'Toast the garlic slowly',
        instruction:
          'Peel and thinly slice 6–8 large garlic cloves. Heat 6 tbsp high-quality olive oil in a wide pan over the LOWEST heat. Add garlic and toast extremely slowly for 8–10 minutes, stirring often. You want pale golden, nutty, and fragrant — not brown, never burnt.',
        tip: 'Patience is everything. Burnt garlic is bitter and ruins the dish. Low and slow turns garlic sweet.',
      },
      {
        step: 3,
        title: 'Build the emulsified sauce',
        instruction:
          'When garlic is lightly golden, add 1 tsp chili flakes and stir 30 seconds. Add ½ cup pasta water — it will sizzle and emulsify with the oil. Stir vigorously.',
      },
      {
        step: 4,
        title: 'Combine and toss',
        instruction:
          'Add drained pasta directly to the garlic oil sauce. Toss vigorously for 2 minutes over low heat, adding pasta water gradually. The pasta should look glossy and the oil should cling to every strand, not pool at the bottom.',
        tip: 'Keep tossing — the motion emulsifies the starch water and oil into a sauce.',
      },
      {
        step: 5,
        title: 'Finish and plate',
        instruction:
          'Remove from heat. Add a handful of finely chopped flat-leaf parsley and toss. Plate in warmed bowls. Finish with grated parmesan, a crack of black pepper, and a drizzle of extra olive oil.',
      },
    ],
    proTip:
      'Use the best quality olive oil you own for this dish. With so few ingredients, each one is unmistakably tasted.',
  },

  // ── AMERICAN ─────────────────────────────────────────────────────────────
  {
    id: 11,
    cuisine: 'American',
    title: 'Classic Smash Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700',
    readyInMinutes: 20,
    servings: 2,
    difficulty: 'Easy',
    description:
      'Smashing loose beef balls against a searing hot cast iron creates lacey, crispy edges and a juicy centre — a completely different texture from a regular burger. Maximum crust, maximum flavour.',
    usedIngredients: [
      'ground beef',
      'butter',
      'onion',
      'cheddar cheese',
      'bread',
      'mayonnaise',
    ],
    missedIngredients: ['American cheese slices', 'burger buns'],
    usedIngredientCount: 6,
    missedIngredientCount: 2,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Loosely form beef balls',
        instruction:
          'Divide 400g 80/20 ground beef into 4 loose balls (~100g each). Handle as little as possible — just enough to form shaggy balls. Do NOT compact into neat patties. Season with salt and pepper just before cooking.',
        tip: '80/20 beef is essential — the fat renders under pressure and creates the crispy lacy edges that define a smash burger.',
      },
      {
        step: 2,
        title: 'Get your pan smoking hot',
        instruction:
          'Place a cast iron skillet over highest heat for 4–5 minutes. Add ½ tbsp butter — it should immediately brown. The pan must be extremely hot before anything goes in.',
      },
      {
        step: 3,
        title: 'The smash',
        instruction:
          'Place one beef ball in the pan. Immediately cover with parchment paper. Using a heavy spatula, smash it as hard and flat as possible — aim for 5–6mm thick. Hold pressure for 10 seconds. Repeat with all balls. Season tops.',
      },
      {
        step: 4,
        title: "Develop the crust — don't touch it",
        instruction:
          'Cook undisturbed for 2 minutes. The bottom should develop a deep brown, crispy crust with lacey brown edges.',
        tip: 'Resist the urge to move the patties. The crust only forms when the meat is in full, uninterrupted contact with the hot surface.',
      },
      {
        step: 5,
        title: 'Flip, add cheese, serve',
        instruction:
          'Flip each patty once. Immediately place a cheese slice on top. Cover with a lid or foil for 45 seconds to steam-melt the cheese. Toast buns cut-side down in the same pan. Build burgers and serve immediately.',
      },
    ],
    proTip:
      'For maximum flavour, use clarified butter or beef tallow in the pan — higher smoke point and incredible flavour.',
  },
  {
    id: 12,
    cuisine: 'American',
    title: 'Creamy Tomato Soup',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=700',
    readyInMinutes: 40,
    servings: 4,
    difficulty: 'Easy',
    description:
      'Roasting the tomatoes first concentrates their sweetness and adds caramelised depth — far more complex than any canned version. Blended with cream for a silky, luxurious texture.',
    usedIngredients: [
      'tomato',
      'garlic',
      'onion',
      'butter',
      'heavy cream',
      'vegetable broth',
      'basil',
      'olive oil',
    ],
    missedIngredients: [],
    usedIngredientCount: 8,
    missedIngredientCount: 0,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Roast the tomatoes',
        instruction:
          'Preheat oven to 200°C. Halve 1kg plum tomatoes cut-side up on a baking tray with 6 unpeeled garlic cloves. Drizzle with 4 tbsp olive oil, season, and roast 35 minutes until caramelised and slightly charred.',
        tip: 'Roasting transforms tomatoes — the heat caramelises sugars and concentrates flavour in a way stovetop cooking cannot.',
      },
      {
        step: 2,
        title: 'Build the base and blend',
        instruction:
          'Melt 2 tbsp butter in a pot. Cook 1 diced onion 10 minutes until golden. Squeeze roasted garlic cloves out of their skins into the pot. Add roasted tomatoes with all their juices and 600ml vegetable broth. Simmer 10 minutes, then blend completely smooth.',
      },
      {
        step: 3,
        title: 'Finish and serve',
        instruction:
          'Strain through a fine sieve for ultra-silky texture. Return to pot, stir in 150ml heavy cream. Simmer gently, taste and adjust salt. Stir in fresh basil. Serve with crusty bread or a grilled cheese sandwich.',
      },
    ],
    proTip:
      'A grilled cheese sandwich alongside tomato soup is an American classic — the crispy buttered bread is the perfect textural contrast.',
  },

  // ── MEDITERRANEAN ────────────────────────────────────────────────────────
  {
    id: 13,
    cuisine: 'Mediterranean',
    title: 'Greek Chicken Souvlaki',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=700',
    readyInMinutes: 30,
    servings: 4,
    difficulty: 'Easy',
    description:
      'Tender chicken marinated in lemon, garlic, and oregano, grilled on skewers, and wrapped in warm pita with tzatziki. The marinade is the entire flavour story.',
    usedIngredients: [
      'chicken',
      'lemon',
      'garlic',
      'olive oil',
      'oregano',
      'yogurt',
      'cucumber',
      'pita',
    ],
    missedIngredients: ['fresh dill', 'red onion'],
    usedIngredientCount: 8,
    missedIngredientCount: 2,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Marinate the chicken',
        instruction:
          'Mix: juice of 2 lemons, 4 tbsp olive oil, 4 minced garlic cloves, 2 tsp dried oregano, 1 tsp salt, ½ tsp black pepper, 1 tsp paprika. Add 600g chicken thigh cubes (3cm). Marinate at least 2 hours.',
        tip: "Don't marinate more than 4 hours — the lemon acid will make the texture mealy.",
      },
      {
        step: 2,
        title: 'Make tzatziki',
        instruction:
          'Grate ½ large cucumber and squeeze ALL moisture out — this is critical or tzatziki becomes watery. Combine with 250g thick Greek yogurt, 2 minced garlic cloves, 1 tbsp olive oil, fresh dill, and lemon juice. Season generously.',
        tip: 'Squeezing the cucumber dry is the single most important step for good tzatziki.',
      },
      {
        step: 3,
        title: 'Grill and assemble',
        instruction:
          'Thread chicken onto skewers. Grill on medium-high for 10–12 minutes, turning every 2–3 minutes. Warm pitas directly on the grill for 30 seconds per side. Spread with tzatziki, add chicken, sliced tomato, red onion, and dried oregano. Serve with extra tzatziki.',
      },
    ],
    proTip:
      'Chicken thighs stay juicier than breast on the grill. If using breast, brush with extra olive oil during cooking.',
  },

  // ── MEXICAN ──────────────────────────────────────────────────────────────
  {
    id: 14,
    cuisine: 'Mexican',
    title: 'Chicken Tacos al Pastor',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=700',
    readyInMinutes: 35,
    servings: 4,
    difficulty: 'Medium',
    description:
      'Chicken marinated in achiote spices and citrus, seared until caramelised, served in warm corn tortillas with fresh pico de gallo. Inspired by the famous al pastor street taco.',
    usedIngredients: [
      'chicken',
      'tomato',
      'onion',
      'garlic',
      'cumin',
      'chili powder',
      'lime',
      'cilantro',
    ],
    missedIngredients: ['achiote paste', 'corn tortillas', 'pineapple'],
    usedIngredientCount: 8,
    missedIngredientCount: 3,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Marinate the chicken',
        instruction:
          'Blend: 3 tbsp achiote paste (or 2 tbsp paprika + 1 tsp cumin + 1 tsp oregano), juice of 2 limes, juice of ½ orange, 3 garlic cloves, 1 tsp chili powder, 1 tbsp oil, 1 tsp salt. Slice 600g chicken thighs thinly (~5mm). Toss in marinade and marinate 30 minutes minimum.',
      },
      {
        step: 2,
        title: 'Make pico de gallo',
        instruction:
          'Finely dice 2 tomatoes, ½ red onion, and 1 jalapeño. Mix with juice of 1 lime, generous chopped cilantro, and salt. This salsa should be bright and fresh — make it right before serving.',
      },
      {
        step: 3,
        title: 'Sear the chicken',
        instruction:
          'Heat a cast iron skillet over very high heat. Sear chicken slices in a single layer 2 minutes without moving, then flip 1–2 minutes until charred at the edges.',
      },
      {
        step: 4,
        title: 'Warm tortillas and assemble',
        instruction:
          'Heat corn tortillas directly on a gas burner 20 seconds per side until charred and pliable. Double-stack two tortillas per taco. Fill with chicken, pico de gallo, diced white onion, and cilantro. Serve with lime wedges.',
        tip: 'The double-tortilla stack is traditional Mexican construction — it prevents tearing and gives a better bite.',
      },
    ],
    proTip:
      "The double-tortilla is not optional — it's traditional Mexican taco construction that makes every bite structurally perfect.",
  },

  // ── JAPANESE ─────────────────────────────────────────────────────────────
  {
    id: 15,
    cuisine: 'Japanese',
    title: 'Chicken Teriyaki',
    image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=700',
    readyInMinutes: 25,
    servings: 3,
    difficulty: 'Easy',
    description:
      'Juicy chicken glazed in a shiny teriyaki sauce of soy, mirin, and honey. The sauce reduces until it coats the back of a spoon, creating a lacquered glaze that caramelises on the chicken.',
    usedIngredients: [
      'chicken',
      'soy sauce',
      'honey',
      'garlic',
      'ginger',
      'sesame oil',
      'rice',
      'green onion',
    ],
    missedIngredients: ['mirin', 'sake'],
    usedIngredientCount: 8,
    missedIngredientCount: 2,
    sourceUrl: '#',
    steps: [
      {
        step: 1,
        title: 'Make the teriyaki sauce',
        instruction:
          'Combine: 4 tbsp soy sauce, 2 tbsp mirin, 2 tbsp sake (or dry sherry), 1 tbsp honey, 1 tsp grated ginger, 1 clove minced garlic. Simmer 4–5 minutes until reduced by one-third and coats the back of a spoon.',
        tip: "Don't over-reduce — it should flow off a spoon. It will thicken significantly when it hits the hot chicken.",
      },
      {
        step: 2,
        title: 'Pan-fry chicken skin-side down',
        instruction:
          'Pat 500g boneless chicken thighs completely dry. Poke skin with a fork several times. Place skin-side down in a cold skillet over medium heat — no oil needed. Press gently for 30 seconds. Cook undisturbed 7–8 minutes until skin is deep golden and crispy.',
        tip: 'Starting in a cold medium-heat pan allows the fat to render slowly and fully — the secret to crispy skin.',
      },
      {
        step: 3,
        title: 'Glaze and serve',
        instruction:
          'Flip chicken, cook underside 4 minutes. Pour teriyaki sauce over — it will sizzle and caramelise. Baste continuously for 2–3 minutes. Rest 3 minutes, then slice diagonally. Serve over steamed rice, drizzle remaining sauce over, garnish with green onion and sesame seeds.',
      },
    ],
    proTip:
      'Poking the skin before cooking prevents it from balling up and ensures even crisping — a classic Japanese technique.',
  },
];

// ── SMART MATCHING ────────────────────────────────────────────────────────
function matchRecipes(userIngredients: string[], cuisine: Cuisine): Recipe[] {
  if (userIngredients.length === 0) return [];
  const lower = userIngredients.map((i) => i.toLowerCase());
  let pool =
    cuisine === 'All'
      ? ALL_RECIPES
      : ALL_RECIPES.filter((r) => r.cuisine === cuisine);
  const scored = pool.map((recipe) => {
    const allIng = [...recipe.usedIngredients, ...recipe.missedIngredients].map(
      (i) => i.toLowerCase()
    );
    const matched = recipe.usedIngredients.filter((i) =>
      lower.some((u) => i.includes(u) || u.includes(i))
    );
    const dynamicUsed = allIng.filter((i) =>
      lower.some((u) => i.includes(u) || u.includes(i))
    );
    const dynamicMissed = allIng.filter(
      (i) => !lower.some((u) => i.includes(u) || u.includes(i))
    );
    return {
      recipe: {
        ...recipe,
        usedIngredients: dynamicUsed,
        missedIngredients: dynamicMissed,
        usedIngredientCount: dynamicUsed.length,
        missedIngredientCount: dynamicMissed.length,
      },
      score: matched.length,
    };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.recipe.missedIngredientCount - b.recipe.missedIngredientCount
    )
    .map((s) => s.recipe);
}

// ── ICON ──────────────────────────────────────────────────────────────────
function Icon({
  name,
  style = {},
}: {
  name: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ verticalAlign: 'middle', lineHeight: 1, ...style }}
    >
      {name}
    </span>
  );
}

// ── IMAGE WITH FALLBACK ───────────────────────────────────────────────────
function RecipeImage({
  src,
  alt,
  id,
  style = {},
}: {
  src: string;
  alt: string;
  id: number;
  style?: React.CSSProperties;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => {
    setImgSrc(src);
  }, [src]);
  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      style={{ width: '100%', height: '100%', objectFit: 'cover', ...style }}
      onError={() => setImgSrc(getFallback(id))}
    />
  );
}

// ── AUTOCOMPLETE INPUT ────────────────────────────────────────────────────
function IngredientInput({
  chips,
  onAdd,
  onRemove,
  onSearch,
  placeholder = 'Search ingredients...',
}: {
  chips: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  onSearch?: () => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const f = INGREDIENT_DB.filter(
      (i) => i.includes(q) && !chips.includes(i)
    ).slice(0, 8);
    setSuggestions(f);
    setOpen(f.length > 0);
    setActiveIdx(-1);
  }, [value, chips]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const commit = (v: string) => {
    const match = INGREDIENT_DB.find((i) => i === v.trim().toLowerCase());
    if (match && !chips.includes(match)) onAdd(match);
    setValue('');
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (open && suggestions.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault();
        commit(suggestions[activeIdx]);
        return;
      }
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) commit(suggestions[0]);
      else onSearch?.();
    }
    if (e.key === 'Backspace' && !value && chips.length > 0)
      onRemove(chips[chips.length - 1]);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 5,
          padding: '7px 10px',
          minHeight: 42,
          cursor: 'text',
          background: 'white',
          borderRadius: 10,
          border: '1.5px solid #e2e8f0',
        }}
      >
        {chips.map((chip) => (
          <span
            key={chip}
            className="chip-animate"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              background: '#33c738',
              color: 'white',
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 7px 2px 9px',
              borderRadius: 99,
            }}
          >
            {chip}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(chip);
              }}
              style={{
                background: 'rgba(255,255,255,0.28)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 14,
                height: 14,
                borderRadius: '50%',
                padding: 0,
                color: 'white',
              }}
            >
              <Icon name="close" style={{ fontSize: 10 }} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={chips.length === 0 ? placeholder : 'Add more...'}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            fontSize: 13,
            color: '#1e293b',
            flex: 1,
            minWidth: 110,
          }}
        />
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 8px 28px rgba(0,0,0,0.11)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {suggestions.map((s, i) => {
            const q = value.trim().toLowerCase(),
              idx = s.toLowerCase().indexOf(q);
            return (
              <div
                key={s}
                onMouseDown={() => commit(s)}
                onMouseEnter={() => setActiveIdx(i)}
                style={{
                  padding: '8px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: i === activeIdx ? '#f0fdf4' : 'white',
                  color: i === activeIdx ? '#15803d' : '#374151',
                  fontWeight: i === activeIdx ? 600 : 400,
                }}
              >
                <Icon
                  name="nutrition"
                  style={{
                    fontSize: 14,
                    color: i === activeIdx ? '#33c738' : '#cbd5e1',
                  }}
                />
                {idx === -1 ? (
                  s
                ) : (
                  <>
                    {s.slice(0, idx)}
                    <strong style={{ color: '#33c738' }}>
                      {s.slice(idx, idx + q.length)}
                    </strong>
                    {s.slice(idx + q.length)}
                  </>
                )}
              </div>
            );
          })}
          <div
            style={{
              padding: '5px 12px',
              fontSize: 10.5,
              color: '#94a3b8',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            Select from list — registered ingredients only
          </div>
        </div>
      )}
    </div>
  );
}

// ── CUISINE FILTER BAR ────────────────────────────────────────────────────
function CuisineFilterBar({
  selected,
  onChange,
}: {
  selected: Cuisine;
  onChange: (c: Cuisine) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 4,
        flexWrap: 'wrap',
      }}
    >
      {CUISINES.map(({ label, emoji }) => {
        const isActive = selected === label;
        return (
          <button
            key={label}
            onClick={() => onChange(label)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 14px',
              borderRadius: 99,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: isActive ? 700 : 500,
              whiteSpace: 'nowrap',
              background: isActive ? '#33c738' : 'white',
              color: isActive ? 'white' : '#475569',
              boxShadow: isActive
                ? '0 3px 10px rgba(51,199,56,0.3)'
                : '0 1px 4px rgba(0,0,0,0.07)',
              transform: isActive ? 'scale(1.03)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
          >
            {emoji} {label}
          </button>
        );
      })}
    </div>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const c: Record<string, { bg: string; color: string }> = {
    Easy: { bg: 'rgba(34,197,94,0.1)', color: '#15803d' },
    Medium: { bg: 'rgba(251,146,60,0.1)', color: '#c2410c' },
    Hard: { bg: 'rgba(239,68,68,0.1)', color: '#b91c1c' },
  };
  const col = c[level] || c.Easy;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 10.5,
        fontWeight: 600,
        background: col.bg,
        color: col.color,
      }}
    >
      <Icon name="signal_cellular_alt" style={{ fontSize: 11 }} />
      {level}
    </span>
  );
}

// ── RECIPE DETAIL MODAL ───────────────────────────────────────────────────
function RecipeModal({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', fn);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', fn);
    };
  }, []);

  const cuisineEntry = CUISINES.find((c) => c.label === recipe.cuisine);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 18,
          maxWidth: 680,
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            position: 'relative',
            aspectRatio: '16/7',
            overflow: 'hidden',
            borderRadius: '18px 18px 0 0',
            flexShrink: 0,
          }}
        >
          <RecipeImage
            src={recipe.image}
            alt={recipe.title}
            id={recipe.id}
            style={{ transition: 'none' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)',
            }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(255,255,255,0.92)',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="close" style={{ fontSize: 18 }} />
          </button>
          <div
            style={{ position: 'absolute', bottom: 16, left: 20, right: 60 }}
          >
            <div
              style={{
                display: 'flex',
                gap: 6,
                marginBottom: 8,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 9px',
                  borderRadius: 99,
                  background: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(6px)',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {cuisineEntry?.emoji} {recipe.cuisine}
              </span>
              <DifficultyBadge level={recipe.difficulty} />
            </div>
            <h2
              style={{
                color: 'white',
                fontSize: 20,
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {recipe.title}
            </h2>
          </div>
        </div>

        <div style={{ padding: '20px 26px 32px' }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            {[
              { icon: 'schedule', text: `${recipe.readyInMinutes} min` },
              { icon: 'groups', text: `${recipe.servings} servings` },
              { icon: 'menu_book', text: `${recipe.steps.length} steps` },
            ].map(({ icon, text }) => (
              <span
                key={text}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                }}
              >
                <Icon name={icon} style={{ fontSize: 15, color: '#33c738' }} />
                {text}
              </span>
            ))}
            {recipe.missedIngredientCount === 0 ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'rgba(51,199,56,0.1)',
                  border: '1px solid rgba(51,199,56,0.2)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#15803d',
                }}
              >
                <Icon name="check_circle" style={{ fontSize: 15 }} />
                You have everything!
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'rgba(251,146,60,0.1)',
                  border: '1px solid rgba(251,146,60,0.2)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#c2410c',
                }}
              >
                <Icon name="shopping_cart" style={{ fontSize: 15 }} />
                {recipe.missedIngredientCount} to buy
              </span>
            )}
          </div>

          <p
            style={{
              fontSize: 13.5,
              color: '#374151',
              lineHeight: 1.75,
              margin: '0 0 22px',
              padding: '14px 16px',
              background: '#f8fafc',
              borderRadius: 10,
              borderLeft: '3px solid #33c738',
            }}
          >
            {recipe.description}
          </p>

          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <Icon
                name="nutrition"
                style={{ fontSize: 17, color: '#33c738' }}
              />
              Ingredients
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 6,
              }}
            >
              {recipe.usedIngredients.map((i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <Icon
                    name="check_circle"
                    style={{ fontSize: 14, color: '#33c738' }}
                  />
                  <span
                    style={{ fontSize: 12, color: '#15803d', fontWeight: 500 }}
                  >
                    {i}
                  </span>
                </div>
              ))}
              {recipe.missedIngredients.map((i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                  }}
                >
                  <Icon
                    name="add_shopping_cart"
                    style={{ fontSize: 14, color: '#ea580c' }}
                  />
                  <span
                    style={{ fontSize: 12, color: '#c2410c', fontWeight: 500 }}
                  >
                    {i}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <Icon
                name="format_list_numbered"
                style={{ fontSize: 17, color: '#33c738' }}
              />
              Step-by-Step Instructions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recipe.steps.map((s, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', gap: 0, position: 'relative' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0,
                      marginRight: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: '#33c738',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        zIndex: 1,
                      }}
                    >
                      {s.step}
                    </div>
                    {i < recipe.steps.length - 1 && (
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          background: '#e2e8f0',
                          minHeight: 16,
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      paddingBottom: i < recipe.steps.length - 1 ? 20 : 0,
                      flex: 1,
                    }}
                  >
                    <h4
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '5px 0 6px',
                      }}
                    >
                      {s.title}
                    </h4>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: '#374151',
                        lineHeight: 1.75,
                        margin: '0 0 8px',
                      }}
                    >
                      {s.instruction}
                    </p>
                    {s.tip && (
                      <div
                        style={{
                          display: 'flex',
                          gap: 7,
                          padding: '8px 12px',
                          background: '#fffbeb',
                          borderRadius: 8,
                          border: '1px solid #fde68a',
                        }}
                      >
                        <Icon
                          name="tips_and_updates"
                          style={{
                            fontSize: 14,
                            color: '#d97706',
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        />
                        <p
                          style={{
                            fontSize: 11.5,
                            color: '#92400e',
                            margin: 0,
                            lineHeight: 1.6,
                          }}
                        >
                          <strong>Chef's Tip:</strong> {s.tip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              padding: '14px 16px',
              background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
              borderRadius: 12,
              border: '1px solid #bbf7d0',
            }}
          >
            <Icon
              name="star"
              style={{
                fontSize: 18,
                color: '#33c738',
                flexShrink: 0,
                marginTop: 1,
              }}
            />
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#14532d',
                  margin: '0 0 3px',
                }}
              >
                Pro Tip
              </p>
              <p
                style={{
                  fontSize: 12.5,
                  color: '#166534',
                  margin: 0,
                  lineHeight: 1.65,
                }}
              >
                {recipe.proTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RECIPE CARD ────────────────────────────────────────────────────────────
function RecipeCard({
  recipe,
  delay = 0,
  onClick,
}: {
  recipe: Recipe;
  delay?: number;
  onClick: () => void;
}) {
  const isPerfect = recipe.missedIngredientCount === 0,
    isMany = recipe.missedIngredientCount >= 4;
  const entry = CUISINES.find((c) => c.label === recipe.cuisine);
  return (
    <div
      className="card-animate"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        transition: 'box-shadow 0.25s, transform 0.25s',
        animationDelay: `${delay}ms`,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.11)';
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}
      >
        <RecipeImage
          src={recipe.image}
          alt={recipe.title}
          id={recipe.id}
          style={{ transition: 'transform 0.45s' }}
        />
        <button
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 9,
            right: 9,
            padding: 6,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(6px)',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <Icon name="favorite" style={{ fontSize: 16 }} />
        </button>
        <div
          style={{
            position: 'absolute',
            top: 9,
            left: 9,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            color: 'white',
            padding: '3px 8px',
            borderRadius: 99,
            fontSize: 10.5,
            fontWeight: 600,
          }}
        >
          {entry?.emoji} {recipe.cuisine}
        </div>
        <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
          <span
            style={{
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 99,
              backdropFilter: 'blur(4px)',
            }}
          >
            Tap for recipe
          </span>
        </div>
      </div>
      <div
        style={{
          padding: '11px 13px',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          flex: 1,
        }}
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#0f172a',
            margin: 0,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {recipe.title}
        </h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 5,
            marginTop: 'auto',
          }}
        >
          {recipe.readyInMinutes && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: '2px 8px',
                borderRadius: 6,
                background: '#f1f5f9',
                color: '#475569',
                fontSize: 10.5,
                fontWeight: 600,
              }}
            >
              <Icon name="schedule" style={{ fontSize: 12 }} />
              {recipe.readyInMinutes} min
            </span>
          )}
          <DifficultyBadge level={recipe.difficulty} />
          {isPerfect ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: '2px 8px',
                borderRadius: 6,
                background: 'rgba(51,199,56,0.1)',
                color: '#16a34a',
                fontSize: 10.5,
                fontWeight: 600,
              }}
            >
              <Icon name="check_circle" style={{ fontSize: 12 }} />
              Perfect match
            </span>
          ) : isMany ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: '2px 8px',
                borderRadius: 6,
                background: '#f1f5f9',
                color: '#94a3b8',
                fontSize: 10.5,
                fontWeight: 600,
              }}
            >
              <Icon name="inventory_2" style={{ fontSize: 12 }} />
              {recipe.missedIngredientCount} missing
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: '2px 8px',
                borderRadius: 6,
                background: 'rgba(251,146,60,0.1)',
                color: '#ea580c',
                fontSize: 10.5,
                fontWeight: 600,
              }}
            >
              <Icon name="inventory_2" style={{ fontSize: 12 }} />
              {recipe.missedIngredientCount} missing
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ aspectRatio: '4/3', background: '#f1f5f9' }} />
      <div
        style={{
          padding: '11px 13px',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
        }}
      >
        <div
          style={{
            height: 13,
            background: '#f1f5f9',
            borderRadius: 5,
            width: '70%',
          }}
        />
        <div style={{ display: 'flex', gap: 5 }}>
          <div
            style={{
              height: 22,
              background: '#f8fafc',
              borderRadius: 6,
              width: 60,
            }}
          />
          <div
            style={{
              height: 22,
              background: '#f8fafc',
              borderRadius: 6,
              width: 60,
            }}
          />
          <div
            style={{
              height: 22,
              background: '#f8fafc',
              borderRadius: 6,
              width: 80,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── RECIPES BROWSE PAGE (shown when clicking "Recipes" nav) ───────────────
function RecipesPage({
  onGoHome,
  onRecipeSearch,
}: {
  onGoHome: () => void;
  onRecipeSearch: (ings: string[]) => void;
}) {
  const [activeCuisine, setActiveCuisine] = useState<Cuisine>('Indian');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const pool =
    activeCuisine === 'All'
      ? ALL_RECIPES
      : ALL_RECIPES.filter((r) => r.cuisine === activeCuisine);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f6f8f6',
      }}
    >
      {activeRecipe && (
        <RecipeModal
          recipe={activeRecipe}
          onClose={() => setActiveRecipe(null)}
        />
      )}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 28px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button
              onClick={onGoHome}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: 0,
              }}
            >
              <div
                style={{
                  background: '#33c738',
                  borderRadius: 7,
                  padding: '5px 6px',
                  display: 'flex',
                }}
              >
                <Icon
                  name="restaurant"
                  style={{ color: 'white', fontSize: 18 }}
                />
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                What's for Dinner?
              </span>
            </button>
            <nav style={{ display: 'flex', gap: 18 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#33c738' }}>
                Recipes
              </span>
              {['Meal Plan', 'Grocery List'].map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    textDecoration: 'none',
                  }}
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main
        style={{
          flex: 1,
          maxWidth: 1280,
          margin: '0 auto',
          width: '100%',
          padding: '28px 24px 60px',
        }}
      >
        <div style={{ marginBottom: 22 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 4px',
            }}
          >
            Browse Recipes
          </h1>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
            Explore {ALL_RECIPES.length} recipes across {CUISINES.length - 1}{' '}
            world cuisines. Click any recipe to see the full cooking guide.
          </p>
        </div>
        <div style={{ marginBottom: 22 }}>
          <CuisineFilterBar
            selected={activeCuisine}
            onChange={setActiveCuisine}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
            gap: 18,
          }}
        >
          {pool.map((r, i) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              delay={i * 40}
              onClick={() => setActiveRecipe(r)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────────────────────────────────
function HomePage({
  onSearch,
  onGoRecipes,
}: {
  onSearch: (ings: string[]) => void;
  onGoRecipes: () => void;
}) {
  const [chips, setChips] = useState<string[]>([]);
  const doSearch = () => {
    if (chips.length > 0) onSearch(chips);
  };

  // Show 6 featured recipe titles on home page instead of ingredient suggestions
  const featuredRecipes = ALL_RECIPES.filter((r) => r.cuisine === 'Indian')
    .slice(0, 3)
    .concat(ALL_RECIPES.filter((r) => r.cuisine === 'Chinese').slice(0, 1))
    .concat(ALL_RECIPES.filter((r) => r.cuisine === 'Italian').slice(0, 2));

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(51,199,56,0.1)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          padding: '10px 28px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div
            style={{
              background: '#33c738',
              borderRadius: 7,
              padding: '5px 6px',
              display: 'flex',
            }}
          >
            <Icon name="restaurant" style={{ color: 'white', fontSize: 18 }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
            What's for Dinner?
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 20 }}>
          <a
            href="#"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#475569',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#33c738')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
          >
            Home
          </a>
          <button
            onClick={onGoRecipes}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              color: '#475569',
              padding: 0,
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#33c738')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
          >
            Recipes
          </button>
          {['Meal Plan', 'Grocery List'].map((l) => (
            <a
              key={l}
              href="#"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#475569',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#33c738')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              {l}
            </a>
          ))}
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <section
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 53px)',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', inset: 0 }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.62), rgba(0,0,0,0.35), rgba(0,0,0,0.16))',
                zIndex: 1,
              }}
            />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEofLEVOCfMZb_00lQ2a2Tei_4fbxvo1OqQ2y3vQ3w9gESiyMWHyrGvIStAij4jBqCU1D43qK68glm-B4KuVYUjJOJuxYVsJ9MdTX3Tjr-HjHlcVHi5pgY0CwUTXPunFWpAMl4jo3zviNOK2tXMP3bB_tGKt7x8zW-3z-zkQR7AquRTzxef3OKuWCOGRF--RA9-aF4nabb-zqXb4psPbUnMTfFeDPaKtSW6_H-hNjH12zRjbwBffCRigfj3wD16xb8PufioiDDgYo"
              alt="Kitchen"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              maxWidth: 680,
              textAlign: 'center',
              padding: '48px 20px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '4px 13px',
                borderRadius: 99,
                background: 'rgba(51,199,56,0.2)',
                backdropFilter: 'blur(8px)',
                color: '#33c738',
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 18,
              }}
            >
              Your personal chef awaits
            </span>
            <h1
              style={{
                color: 'white',
                fontWeight: 900,
                lineHeight: 1.1,
                fontSize: 'clamp(1.8rem,5vw,3.2rem)',
                letterSpacing: -0.8,
                margin: '0 0 12px',
              }}
            >
              Turn your fridge into{' '}
              <span style={{ color: '#33c738', fontStyle: 'italic' }}>
                a feast.
              </span>
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.87)',
                fontSize: 14,
                maxWidth: 440,
                margin: '0 auto 32px',
                lineHeight: 1.65,
              }}
            >
              Select ingredients you have. We'll match recipes from Indian,
              Chinese, Italian, and more cuisines.
            </p>

            <div style={{ maxWidth: 580, margin: '0 auto' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(51,199,56,0.18)',
                    filter: 'blur(16px)',
                    borderRadius: 14,
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                    background: 'white',
                    borderRadius: 14,
                    padding: 6,
                    boxShadow: '0 16px 50px rgba(0,0,0,0.25)',
                  }}
                >
                  <div
                    style={{
                      paddingLeft: 8,
                      paddingTop: 9,
                      color: '#94a3b8',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="flatware" style={{ fontSize: 18 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <IngredientInput
                      chips={chips}
                      onAdd={(v) => setChips((p) => [...p, v])}
                      onRemove={(v) =>
                        setChips((p) => p.filter((i) => i !== v))
                      }
                      onSearch={doSearch}
                      placeholder="Type an ingredient e.g. chicken..."
                    />
                  </div>
                  <button
                    onClick={doSearch}
                    disabled={chips.length === 0}
                    style={{
                      background: chips.length === 0 ? '#86efac' : '#33c738',
                      color: 'white',
                      border: 'none',
                      borderRadius: 9,
                      cursor: chips.length === 0 ? 'not-allowed' : 'pointer',
                      padding: '9px 16px',
                      fontWeight: 700,
                      fontSize: 12,
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                      marginTop: 1,
                    }}
                  >
                    Find Recipes <Icon name="search" style={{ fontSize: 15 }} />
                  </button>
                </div>
              </div>

              {/* Featured recipe pills — actual recipes from database */}
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 7,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    color: 'rgba(255,255,255,0.72)',
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  Popular recipes:
                </span>
                {featuredRecipes.map((r) => {
                  const entry = CUISINES.find((c) => c.label === r.cuisine);
                  return (
                    <button
                      key={r.id}
                      onClick={() =>
                        onSearch(
                          [r.usedIngredients[0], r.usedIngredients[1]].filter(
                            Boolean
                          )
                        )
                      }
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          'rgba(255,255,255,0.22)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          'rgba(255,255,255,0.12)')
                      }
                    >
                      {entry?.emoji} {r.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        style={{
          background: '#0f172a',
          color: '#94a3b8',
          padding: '40px 28px 20px',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
            gap: 28,
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                color: 'white',
                marginBottom: 10,
              }}
            >
              <Icon
                name="restaurant"
                style={{ color: '#33c738', fontSize: 18 }}
              />
              <span style={{ fontWeight: 700, fontSize: 13 }}>
                What's for Dinner?
              </span>
            </div>
            <p style={{ fontSize: 11.5, lineHeight: 1.7, margin: 0 }}>
              Eliminating kitchen stress one ingredient at a time.
            </p>
          </div>
          {[
            ['Explore', ['All Recipes', 'Seasonal Meals', 'Cooking Tips']],
            ['Support', ['Help Center', 'Contact Us', 'Feedback']],
          ].map(([t, ls]) => (
            <div key={t as string}>
              <h4
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 12,
                  marginBottom: 10,
                  marginTop: 0,
                }}
              >
                {t as string}
              </h4>
              {(ls as string[]).map((l) => (
                <div key={l} style={{ marginBottom: 5 }}>
                  <a
                    href="#"
                    style={{
                      fontSize: 11.5,
                      color: '#94a3b8',
                      textDecoration: 'none',
                    }}
                  >
                    {l}
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            paddingTop: 16,
            borderTop: '1px solid #1e293b',
            fontSize: 10.5,
          }}
        >
          <span>© 2024 What's for Dinner? All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

// ── RESULTS PAGE ──────────────────────────────────────────────────────────
function ResultsPage({
  ingredients,
  onRemoveIngredient,
  onAddIngredient,
  onGoHome,
  onGoRecipes,
}: {
  ingredients: string[];
  onRemoveIngredient: (v: string) => void;
  onAddIngredient: (v: string) => void;
  onGoHome: () => void;
  onGoRecipes: () => void;
}) {
  const [activeCuisine, setActiveCuisine] = useState<Cuisine>('All');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setRecipes(matchRecipes(ingredients, activeCuisine));
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, [ingredients, activeCuisine]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f6f8f6',
      }}
    >
      {activeRecipe && (
        <RecipeModal
          recipe={activeRecipe}
          onClose={() => setActiveRecipe(null)}
        />
      )}

      {/* Header — NO search bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 28px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button
              onClick={onGoHome}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: 0,
              }}
            >
              <div
                style={{
                  background: '#33c738',
                  borderRadius: 7,
                  padding: '5px 6px',
                  display: 'flex',
                }}
              >
                <Icon
                  name="restaurant"
                  style={{ color: 'white', fontSize: 18 }}
                />
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                What's for Dinner?
              </span>
            </button>
            <nav style={{ display: 'flex', gap: 18 }}>
              <button
                onClick={onGoRecipes}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#64748b',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#33c738')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                Recipes
              </button>
              {['Meal Plan', 'Grocery List'].map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    textDecoration: 'none',
                  }}
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          maxWidth: 1280,
          margin: '0 auto',
          width: '100%',
          padding: '24px 24px 60px',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 3px',
            }}
          >
            Search Results
          </h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
            {loading
              ? 'Finding matching recipes...'
              : `Found ${recipes.length} recipe${
                  recipes.length !== 1 ? 's' : ''
                } · ${
                  activeCuisine === 'All'
                    ? 'All cuisines'
                    : activeCuisine + ' cuisine'
                }`}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 7,
            marginBottom: 18,
            padding: '10px 14px',
            background: 'white',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginRight: 3,
              whiteSpace: 'nowrap',
            }}
          >
            Your Ingredients:
          </span>
          {ingredients.map((ing) => (
            <span
              key={ing}
              className="chip-animate"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                background: '#33c738',
                color: 'white',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 8px 3px 10px',
                borderRadius: 99,
              }}
            >
              {ing}
              <button
                onClick={() => onRemoveIngredient(ing)}
                style={{
                  background: 'rgba(255,255,255,0.26)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  padding: 0,
                  color: 'white',
                }}
              >
                <Icon name="close" style={{ fontSize: 10 }} />
              </button>
            </span>
          ))}
          <div style={{ minWidth: 180, flex: 1 }}>
            <IngredientInput
              chips={ingredients}
              onAdd={onAddIngredient}
              onRemove={onRemoveIngredient}
              placeholder="+ Add ingredient..."
            />
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <CuisineFilterBar
            selected={activeCuisine}
            onChange={setActiveCuisine}
          />
        </div>

        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
              gap: 18,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '70px 20px',
              color: '#94a3b8',
            }}
          >
            <Icon
              name="no_meals"
              style={{ fontSize: 48, display: 'block', margin: '0 auto 14px' }}
            />
            <h3
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#475569',
                margin: '0 0 7px',
              }}
            >
              No matching recipes
            </h3>
            <p style={{ fontSize: 12, margin: '0 0 14px' }}>
              {activeCuisine !== 'All'
                ? `Try switching to "All" cuisines or adding more ingredients.`
                : 'Try adding ingredients like chicken, garlic, eggs, or lentils.'}
            </p>
            {activeCuisine !== 'All' && (
              <button
                onClick={() => setActiveCuisine('All')}
                style={{
                  padding: '8px 20px',
                  background: '#33c738',
                  color: 'white',
                  border: 'none',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Show All Cuisines
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
              gap: 18,
            }}
          >
            {recipes.map((r, i) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                delay={i * 45}
                onClick={() => setActiveRecipe(r)}
              />
            ))}
          </div>
        )}
      </main>

      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
        <button
          style={{
            width: 44,
            height: 44,
            background: '#33c738',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 5px 18px rgba(51,199,56,0.38)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Icon name="add" style={{ fontSize: 22 }} />
        </button>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<'home' | 'results' | 'recipes'>('home');
  const [ingredients, setIngredients] = useState<string[]>([]);

  const handleSearch = (ings: string[]) => {
    setIngredients(ings);
    setView('results');
  };
  const handleRemove = (ing: string) => {
    const u = ingredients.filter((i) => i !== ing);
    setIngredients(u);
    if (u.length === 0) setView('home');
  };
  const handleAdd = (ing: string) => {
    if (ingredients.includes(ing)) return;
    setIngredients((p) => [...p, ing]);
  };

  if (view === 'recipes')
    return (
      <RecipesPage
        onGoHome={() => setView('home')}
        onRecipeSearch={handleSearch}
      />
    );
  if (view === 'results')
    return (
      <ResultsPage
        ingredients={ingredients}
        onRemoveIngredient={handleRemove}
        onAddIngredient={handleAdd}
        onGoHome={() => setView('home')}
        onGoRecipes={() => setView('recipes')}
      />
    );
  return (
    <HomePage onSearch={handleSearch} onGoRecipes={() => setView('recipes')} />
  );
}

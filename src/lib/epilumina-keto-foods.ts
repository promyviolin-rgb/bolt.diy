/* Local ketogenic food database — macros per 100 g. 100% on-device, no network.
 * f = fat (g), p = protein (g), c = net carbs (g). kcal derived: 9F + 4P + 4C.
 */
export type KetoFood = {
  id: string;
  pl: string;
  en: string;
  de?: string;
  es?: string;
  fr?: string;
  zh?: string;
  f: number;
  p: number;
  c: number;
  cat: string;
};

import { KETO_FOODS_EXTRA } from "./epilumina-keto-foods-extra";
import { FOOD_NAMES_I18N } from "./epilumina-keto-foods-i18n";

const KETO_FOODS_CORE: KetoFood[] = [
  // Fats & oils
  { id: "mct", pl: "Olej MCT", en: "MCT oil", f: 100, p: 0, c: 0, cat: "fat" },
  { id: "oliveoil", pl: "Oliwa z oliwek", en: "Olive oil", f: 100, p: 0, c: 0, cat: "fat" },
  { id: "coconutoil", pl: "Olej kokosowy", en: "Coconut oil", f: 100, p: 0, c: 0, cat: "fat" },
  { id: "rapeseed", pl: "Olej rzepakowy", en: "Rapeseed oil", f: 100, p: 0, c: 0, cat: "fat" },
  { id: "butter", pl: "Masło", en: "Butter", f: 81, p: 0.9, c: 0.6, cat: "fat" },
  { id: "ghee", pl: "Masło klarowane", en: "Ghee", f: 99, p: 0.3, c: 0, cat: "fat" },
  { id: "lard", pl: "Smalec", en: "Lard", f: 99, p: 0, c: 0, cat: "fat" },
  { id: "cream36", pl: "Śmietanka 36%", en: "Heavy cream 36%", f: 36, p: 2.1, c: 2.9, cat: "fat" },
  { id: "cream30", pl: "Śmietanka 30%", en: "Cream 30%", f: 30, p: 2.4, c: 3.2, cat: "fat" },
  { id: "mayo", pl: "Majonez", en: "Mayonnaise", f: 75, p: 1, c: 1.5, cat: "fat" },
  {
    id: "coconutmilk",
    pl: "Mleko kokosowe",
    en: "Coconut milk",
    f: 21,
    p: 2.3,
    c: 2.8,
    cat: "fat",
  },
  {
    id: "coconutflakes",
    pl: "Wiórki kokosowe",
    en: "Coconut flakes",
    f: 65,
    p: 6.9,
    c: 6.4,
    cat: "fat",
  },

  // Dairy
  { id: "cheddar", pl: "Ser cheddar", en: "Cheddar cheese", f: 33, p: 25, c: 1.3, cat: "dairy" },
  { id: "gouda", pl: "Ser gouda", en: "Gouda cheese", f: 27, p: 25, c: 2.2, cat: "dairy" },
  { id: "mozzarella", pl: "Mozzarella", en: "Mozzarella", f: 22, p: 22, c: 2.2, cat: "dairy" },
  {
    id: "cream_cheese",
    pl: "Serek śmietankowy",
    en: "Cream cheese",
    f: 34,
    p: 6,
    c: 4,
    cat: "dairy",
  },
  { id: "parmesan", pl: "Parmezan", en: "Parmesan", f: 29, p: 36, c: 3.2, cat: "dairy" },
  { id: "feta", pl: "Feta", en: "Feta", f: 21, p: 14, c: 4.1, cat: "dairy" },
  {
    id: "cottage",
    pl: "Twaróg półtłusty",
    en: "Cottage cheese",
    f: 4.3,
    p: 12,
    c: 3.4,
    cat: "dairy",
  },
  {
    id: "greekyog",
    pl: "Jogurt grecki 10%",
    en: "Greek yogurt 10%",
    f: 10,
    p: 5.7,
    c: 3.6,
    cat: "dairy",
  },
  { id: "milk32", pl: "Mleko 3,2%", en: "Whole milk", f: 3.2, p: 3.3, c: 4.7, cat: "dairy" },

  // Eggs, meat, fish
  { id: "egg", pl: "Jajko kurze", en: "Egg", f: 10, p: 13, c: 0.7, cat: "protein" },
  { id: "eggyolk", pl: "Żółtko jaja", en: "Egg yolk", f: 27, p: 16, c: 3.6, cat: "protein" },
  {
    id: "chickenbreast",
    pl: "Pierś z kurczaka",
    en: "Chicken breast",
    f: 3.6,
    p: 31,
    c: 0,
    cat: "protein",
  },
  {
    id: "chickenthigh",
    pl: "Udko z kurczaka",
    en: "Chicken thigh",
    f: 15,
    p: 24,
    c: 0,
    cat: "protein",
  },
  {
    id: "beefmince",
    pl: "Mielona wołowina 20%",
    en: "Ground beef 20%",
    f: 20,
    p: 17,
    c: 0,
    cat: "protein",
  },
  { id: "porkbelly", pl: "Boczek", en: "Pork belly", f: 53, p: 9, c: 0, cat: "protein" },
  { id: "ham", pl: "Szynka", en: "Ham", f: 5, p: 21, c: 1.5, cat: "protein" },
  { id: "salmon", pl: "Łosoś", en: "Salmon", f: 13, p: 20, c: 0, cat: "protein" },
  { id: "mackerel", pl: "Makrela", en: "Mackerel", f: 25, p: 19, c: 0, cat: "protein" },
  { id: "tuna", pl: "Tuńczyk w oleju", en: "Tuna in oil", f: 8, p: 25, c: 0, cat: "protein" },
  { id: "sardines", pl: "Sardynki", en: "Sardines", f: 11, p: 25, c: 0, cat: "protein" },
  { id: "cod", pl: "Dorsz", en: "Cod", f: 0.7, p: 18, c: 0, cat: "protein" },
  { id: "shrimp", pl: "Krewetki", en: "Shrimp", f: 1.1, p: 20, c: 0.2, cat: "protein" },
  { id: "turkey", pl: "Indyk", en: "Turkey breast", f: 2, p: 29, c: 0, cat: "protein" },
  { id: "tofu", pl: "Tofu", en: "Tofu", f: 4.8, p: 8, c: 1.2, cat: "protein" },

  // Nuts & seeds
  { id: "almond", pl: "Migdały", en: "Almonds", f: 49, p: 21, c: 9.5, cat: "nuts" },
  { id: "walnut", pl: "Orzechy włoskie", en: "Walnuts", f: 65, p: 15, c: 7, cat: "nuts" },
  { id: "pecan", pl: "Orzechy pekan", en: "Pecans", f: 72, p: 9, c: 4.3, cat: "nuts" },
  { id: "macadamia", pl: "Makadamia", en: "Macadamia", f: 76, p: 8, c: 5.2, cat: "nuts" },
  { id: "hazelnut", pl: "Orzechy laskowe", en: "Hazelnuts", f: 61, p: 15, c: 7, cat: "nuts" },
  {
    id: "peanutbutter",
    pl: "Masło orzechowe",
    en: "Peanut butter",
    f: 50,
    p: 25,
    c: 8,
    cat: "nuts",
  },
  { id: "chia", pl: "Nasiona chia", en: "Chia seeds", f: 31, p: 17, c: 7.7, cat: "nuts" },
  { id: "flax", pl: "Siemię lniane", en: "Flaxseed", f: 42, p: 18, c: 1.6, cat: "nuts" },
  { id: "sunflower", pl: "Słonecznik", en: "Sunflower seeds", f: 51, p: 21, c: 11, cat: "nuts" },
  { id: "almondflour", pl: "Mąka migdałowa", en: "Almond flour", f: 54, p: 21, c: 10, cat: "nuts" },

  // Vegetables
  { id: "avocado", pl: "Awokado", en: "Avocado", f: 15, p: 2, c: 1.8, cat: "veg" },
  { id: "broccoli", pl: "Brokuł", en: "Broccoli", f: 0.4, p: 2.8, c: 4, cat: "veg" },
  { id: "cauliflower", pl: "Kalafior", en: "Cauliflower", f: 0.3, p: 1.9, c: 3, cat: "veg" },
  { id: "spinach", pl: "Szpinak", en: "Spinach", f: 0.4, p: 2.9, c: 1.4, cat: "veg" },
  { id: "zucchini", pl: "Cukinia", en: "Zucchini", f: 0.3, p: 1.2, c: 2.1, cat: "veg" },
  { id: "cucumber", pl: "Ogórek", en: "Cucumber", f: 0.1, p: 0.7, c: 2.2, cat: "veg" },
  { id: "lettuce", pl: "Sałata", en: "Lettuce", f: 0.2, p: 1.4, c: 1.4, cat: "veg" },
  { id: "pepper", pl: "Papryka czerwona", en: "Red pepper", f: 0.3, p: 1, c: 4.2, cat: "veg" },
  { id: "tomato", pl: "Pomidor", en: "Tomato", f: 0.2, p: 0.9, c: 2.7, cat: "veg" },
  { id: "mushroom", pl: "Pieczarki", en: "Mushrooms", f: 0.3, p: 3.1, c: 2.3, cat: "veg" },
  {
    id: "greenbeans",
    pl: "Fasolka szparagowa",
    en: "Green beans",
    f: 0.2,
    p: 1.8,
    c: 3.6,
    cat: "veg",
  },
  { id: "asparagus", pl: "Szparagi", en: "Asparagus", f: 0.1, p: 2.2, c: 1.9, cat: "veg" },
  { id: "cabbage", pl: "Kapusta", en: "Cabbage", f: 0.1, p: 1.3, c: 3.3, cat: "veg" },
  { id: "olives", pl: "Oliwki", en: "Olives", f: 15, p: 0.8, c: 0.5, cat: "veg" },

  // Fruit (limited)
  { id: "raspberry", pl: "Maliny", en: "Raspberries", f: 0.7, p: 1.2, c: 5.4, cat: "fruit" },
  { id: "blueberry", pl: "Borówki", en: "Blueberries", f: 0.3, p: 0.7, c: 12, cat: "fruit" },
  { id: "strawberry", pl: "Truskawki", en: "Strawberries", f: 0.3, p: 0.7, c: 5.7, cat: "fruit" },
  { id: "blackberry", pl: "Jeżyny", en: "Blackberries", f: 0.5, p: 1.4, c: 4.3, cat: "fruit" },
  { id: "lemon", pl: "Cytryna", en: "Lemon", f: 0.3, p: 1.1, c: 6.5, cat: "fruit" },

  // Other
  {
    id: "darkchoc90",
    pl: "Czekolada 90%",
    en: "Dark chocolate 90%",
    f: 55,
    p: 10,
    c: 14,
    cat: "other",
  },
  { id: "cocoa", pl: "Kakao gorzkie", en: "Cocoa powder", f: 14, p: 20, c: 8, cat: "other" },
  { id: "psyllium", pl: "Babka płesznik", en: "Psyllium husk", f: 0.6, p: 1.5, c: 3, cat: "other" },
  { id: "eryth", pl: "Erytrytol", en: "Erythritol", f: 0, p: 0, c: 0, cat: "other" },
  { id: "bonebroth", pl: "Bulion kostny", en: "Bone broth", f: 1.2, p: 3, c: 0.3, cat: "other" },
];

export const KETO_FOODS: KetoFood[] = [...KETO_FOODS_CORE, ...KETO_FOODS_EXTRA];

/** Localised product name — falls back to English, then Polish. */
export function foodName(f: KetoFood, lang: string) {
  if (lang === "pl") return f.pl || f.en;
  if (lang === "en") return f.en || f.pl;
  const extra = (f as any)[lang] || FOOD_NAMES_I18N[f.id]?.[lang as "de" | "es" | "fr" | "zh"];
  return extra || f.en || f.pl;
}

/** Alternative spellings keyed by product id (searched in addition to the names). */
export const FOOD_ALIASES: Record<string, string[]> = {
  donut: ["donut", "doughnut", "dónut", "paczek", "berliner", "krapfen"],
  applepie: ["apple pie", "apfelkuchen", "szarlotka", "jabłecznik", "jablecznik"],
  cheesecake: ["cheesecake", "sernik", "käsekuchen", "kasekuchen"],
  mayo: ["mayo", "majonez", "mayonnaise", "mayonesa"],
  zucchini: ["zucchini", "courgette", "cukinia", "calabacín", "calabacin"],
  shrimp: ["shrimp", "prawn", "prawns", "krewetki"],
};

/** Every known name of a product (all languages + aliases), de-duplicated, lower-cased. */
export function foodSearchIndex(f: KetoFood) {
  const tr = FOOD_NAMES_I18N[f.id] || {};
  const names = [
    f.pl,
    f.en,
    f.de,
    f.es,
    f.fr,
    f.zh,
    tr.de,
    tr.es,
    tr.fr,
    tr.zh,
    ...(FOOD_ALIASES[f.id] || []),
  ];
  const seen = new Set<string>();
  for (const n of names) if (n) seen.add(n.toLowerCase());
  return [...seen].join(" ");
}

export function kcalOf(f: number, p: number, c: number) {
  return f * 9 + p * 4 + c * 4;
}

/** Ketogenic ratio = fat(g) / (protein(g) + carbs(g)). */
export function ketoRatio(fat: number, protein: number, carbs: number) {
  const denom = protein + carbs;
  if (denom <= 0) return fat > 0 ? Infinity : 0;
  return fat / denom;
}

/** Grams of pure fat (e.g. MCT oil) required to reach the target ratio. */
export function fatToReachRatio(fat: number, protein: number, carbs: number, target: number) {
  const need = target * (protein + carbs) - fat;
  return need > 0 ? Math.round(need * 10) / 10 : 0;
}

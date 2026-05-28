/** Minimální délka textu recenze (znaky). */
export const REVIEW_TEXT_MIN = 3;

/**
 * Maximální délka textu recenze.
 * Ukázkové recenze mají průměr ~95 znaků; limit 150 nechává prostor pro 2–3 věty
 * a vejde se do 4 řádků karty bez rozbalovacího panelu.
 */
export const REVIEW_TEXT_MAX = 150;

/** Nad touto délkou se v kartě zobrazí zkrácený náhled s fade efektem. */
export const REVIEW_PREVIEW_CHAR_LIMIT = REVIEW_TEXT_MAX;

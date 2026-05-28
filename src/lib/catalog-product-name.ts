type NamedProduct = { name: string; slug: string };

function slugToLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stripCategoryPrefix(category: string, name: string) {
  if (!name.toLowerCase().startsWith(category.toLowerCase())) return name;
  return name.slice(category.length).trim().replace(/^[-–—:,]\s*/, "");
}

/** Krátké jméno produktové řady (Covert, Rovo, Isoline…). */
export function getProductCategoricalName(groupName: string, product: NamedProduct) {
  const category = groupName.trim();
  const name = product.name.trim();
  if (!name) return slugToLabel(product.slug);

  const stripped = stripCategoryPrefix(category, name);
  if (stripped && stripped !== name) return stripped;

  const wordCount = name.split(/\s+/).length;
  const looksLikeLineName = name.length <= 36 && wordCount <= 5;
  if (looksLikeLineName) return name;

  const slugLabel = slugToLabel(product.slug);
  if (name.toLowerCase().includes(slugLabel.toLowerCase())) return slugLabel;

  return slugLabel || name;
}

/** Celý titulek dlaždice: název kategorie + kategorické jméno produktu. */
export function formatCatalogProductName(groupName: string, product: NamedProduct) {
  const category = groupName.trim();
  const categorical = getProductCategoricalName(category, product);
  if (!category) return categorical;
  if (!categorical) return category;
  if (categorical.toLowerCase() === category.toLowerCase()) return category;
  return `${category} ${categorical}`;
}

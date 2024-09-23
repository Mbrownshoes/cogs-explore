import siteDataRaw from "@/public/data/siteData.json";

export const siteData = siteDataRaw;
console.log(siteData);

export const siteAliases = Object.fromEntries(
  Object.entries(siteData).map(([key, value]) => {
    console.log(key, value);

    return [value.name, key];
  })
);
export function getSiteById(id) {
  return Object.values(siteData).find((site) => site.id === id);
}

export function layersForSite(siteName) {
  const siteKey = siteAliases[siteName] || siteName;
  console.log(siteKey);

  return siteData[siteKey]?.layers || {};
}

export const getTilesetUrl = (selectedSite, selectedLayer) => {
  const site = siteData[siteAliases[selectedSite] || selectedSite];
  if (!site) return null;
  return site.layers[selectedLayer];
};

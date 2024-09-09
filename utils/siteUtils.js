import { siteAliases, siteData } from "../utils/siteData";

export function getCoordsForSite(siteName) {
  const siteKey = siteAliases[siteName] || siteName;
  return siteData[siteKey]?.lngLat || {};
}

export function getBoundsForSite(siteName) {
  const siteKey = siteAliases[siteName] || siteName;
  return siteData[siteKey]?.bounds || {};
}

export function getLayersForSite(siteName) {
  const siteKey = siteAliases[siteName] || siteName;
  return siteData[siteKey]?.layers || {};
}
export function getSiteNames() {
  return Object.keys(siteData);
}

export function getSiteAlias(siteName) {
  return (
    Object.entries(siteAliases).find(
      ([alias, name]) => name === siteName
    )?.[0] || siteName
  );
}

import { getSiteById, siteData } from "../utils/siteData";

export function getCoordsForSite(site) {
  const siteKey = siteAliases[site] || site;
  return siteData[siteKey]?.lngLat || {};
}

export function getBoundsForSite(site) {
  console.log(getSiteById(site)?.bounds);

  return getSiteById(site)?.bounds || {};
}

export function getLayersForSite(site) {
  return getSiteById(site)?.layers;
}
export function getSiteNames() {
  return Object.keys(siteData);
}

export function getSiteAlias(site) {
  return (
    Object.entries(siteAliases).find(([alias, name]) => name === site)?.[0] ||
    site
  );
}

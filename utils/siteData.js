// File: utils/siteData.js
export const getTilesetUrl = (selectedSite, selectedLayer) => {
  if (selectedSite === "Place Glacier") {
    if (["DEM 1", "Ortho 1", "HS 1", "Countour 1"].includes(selectedLayer)) {
      return "https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/22_4012_07_1m_GF_DEM_WGS84_z10_Ellips_FullExtent_COG.tif";
    } else {
      return "https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/23_4012_01_PlaceGlacier_DEM_1m_WGS84_UTM10_Ellips_cog.tif";
    }
  } else {
    return "https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_DEM_1m_CSRS_UTM10_HTv2_cog.tif";
  }
};

export const siteData = {
  ElliotCreekLandslide: {
    name: "Elliot Creek",
    layers: {
      "Ortho Apr. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?bidx=1&bidx=2&bidx=3&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_ORTHO_CSRS_UTM10_HTv2_cog.tif`,
      "DEM Apr. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?colormap_name=gist_earth&rescale=-10,2500&nodata=-340282346638528859811704183484516925440&bidx=1&resampling=nearest&return_mask=true&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_DEM_1m_CSRS_UTM10_HTv2_cog.tif`,
      "HS Apr. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?algorithm=hillshade&algorithm_params={"angle_altitude":45}&nodata=-340282346638528859811704183484516925440&bidx=1&resampling=nearest&return_mask=true&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_DEM_1m_CSRS_UTM10_HTv2_cog.tif`,
      "Countour Apr. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?algorithm=contours&algorithm_params={"increment":100,"thickness":1,"minz":0,"maxz":2500}&nodata=-340282346638528859811704183484516925440&bidx=1&resampling=nearest&return_mask=true&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_DEM_1m_CSRS_UTM10_HTv2_cog.tif`,

      "Ortho Jul. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?bidx=1&bidx=2&bidx=3&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_02_ElliotCreekLandslide_ORTHO_CSRS_UTM10_HTv2_cog.tif`,
      "Ortho Oct. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?bidx=1&bidx=2&bidx=3&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_03_ElliotCreekLandslide_ORTHO_CSRS_UTM10_HTv2_cog.tif`,
    },
    lngLat: [-124.6717, 50.9013],
    bounds: [
      -124.83764648437511, 50.831529285350065, -124.55749511718761,
      50.9999288558598,
    ],
  },
  PlaceGlacier: {
    name: "Place Glacier",
    layers: {
      "Ortho 1": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?bidx=1&bidx=2&bidx=3&url=https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/22_4012_07_PlaceGlacier_wgs84utm10_Ortho_COG.tif`,
      "DEM 1": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?colormap_name=gist_earth&rescale=-10,2500&nodata=-340282346638528859811704183484516925440&bidx=1&resampling=nearest&return_mask=true&url=https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/22_4012_07_1m_GF_DEM_WGS84_z10_Ellips_FullExtent_COG.tif`,
      "HS 1": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?algorithm=hillshade&algorithm_params={"angle_altitude":45}&nodata=-340282346638528859811704183484516925440&bidx=1&resampling=nearest&return_mask=true&url=https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/22_4012_07_1m_GF_DEM_WGS84_z10_Ellips_FullExtent_COG.tif`,
      "Countour 1": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?algorithm=contours&algorithm_params={"increment":100,"thickness":1,"minz":0,"maxz":2500}&nodata=-340282346638528859811704183484516925440&bidx=1&resampling=nearest&return_mask=true&url=https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/22_4012_07_1m_GF_DEM_WGS84_z10_Ellips_FullExtent_COG.tif`,

      "Ortho 2": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?bidx=1&bidx=2&bidx=3&url=https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/23_4012_01_PlaceGlacier_ORTHO_WGS84_UTM10_Ellips_cog.tif`,

      "DEM 2": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?colormap_name=gist_earth&rescale=-10,2500&nodata=-340282346638528859811704183484516925440&bidx=1&resampling=nearest&return_mask=true&url=https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/23_4012_01_PlaceGlacier_DEM_1m_WGS84_UTM10_Ellips_cog.tif`,
      Slope: `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?bidx=1&url=https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?bidx=1&rescale=0,90&colormap_name=viridis&url=https://public-aco-data.s3.amazonaws.com/data/4012_PlaceGlacier/24_4012_05/24_4012_05_PlaceGlacier_SLOPE_1m_WGS84_UTM10_Ellips_cog.tif`,
    },
    lngLat: [-122.62, 50.389],
    bounds: [
      -122.67754493594516, 50.38855515565575, -122.54698332988868,
      50.46361196092505,
    ],
  },
};

export const siteAliases = {
  "Place Glacier": "PlaceGlacier",
  "Elliot Creek": "ElliotCreekLandslide",
};

export function layersForSite(siteName) {
  const siteKey = siteAliases[siteName] || siteName;
  return siteData[siteKey]?.layers || {};
}

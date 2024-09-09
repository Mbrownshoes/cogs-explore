// File: utils/elevation.js
const tilesetUrl =
  selectedSite === "Place Glacier" &&
  (selectedLayer === "DEM 1" || "Ortho 1" || "HS 1" || "Countour 1")
    ? "https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/22_4012_07_1m_GF_DEM_WGS84_z10_Ellips_FullExtent_COG.tif"
    : selectedSite === "Place Glacier" &&
      (!selectedLayer !== "DEM 1" || "Ortho 1" || "HS 1" || "Countour 1")
    ? "https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/23_4012_01_PlaceGlacier_DEM_1m_WGS84_UTM10_Ellips_cog.tif"
    : "https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_DEM_1m_CSRS_UTM10_HTv2_cog.tif";

export const getElevation = async (lng, lat, tilesetUrl) => {
  const url = `https://goose.hakai.org/titiler/cog/point/${lng},${lat}?url=${encodeURIComponent(
    tilesetUrl
  )}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.values && data.values.length > 0) {
      return data.values[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching elevation data:", error);
    return null;
  }
};

export async function getTransectElevation(
  startPoint,
  endPoint,
  tilesetUrl,
  numSamples = 100
) {
  // Create a line from start to end point
  const line = lineString([startPoint, endPoint]);

  const lineLength = length(line, { units: "kilometers" });

  // Sample points along the line
  const samplePoints = [];
  for (let i = 0; i <= numSamples; i++) {
    const point = turf.along(line, (lineLength / numSamples) * i, {
      units: "kilometers",
    });
    samplePoints.push(point.geometry.coordinates);
  }

  // Fetch elevation for each point
  const elevationData = await Promise.all(
    samplePoints.map(async ([lng, lat]) => {
      const url = `https://goose.hakai.org/titiler/cog/point/${lng},${lat}?url=${encodeURIComponent(
        tilesetUrl
      )}`;
      const response = await fetch(url);
      const data = await response.json();
      return {
        lng,
        lat,
        elevation: data.values[0],
      };
    })
  );

  return elevationData;
}

export async function getTransectElevationDiff(
  startPoint,
  endPoint,
  numSamples = 100
) {
  // Create a line from start to end point
  const line = lineString([startPoint, endPoint]);

  const lineLength = length(line, { units: "kilometers" });

  // Sample points along the line
  const samplePoints = [];
  for (let i = 0; i <= numSamples; i++) {
    const point = turf.along(line, (lineLength / numSamples) * i, {
      units: "kilometers",
    });
    samplePoints.push(point.geometry.coordinates);
  }

  // Define both URLs
  const url1 =
    "https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/22_4012_07_1m_GF_DEM_WGS84_z10_Ellips_FullExtent_COG.tif";
  const url2 =
    "https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/23_4012_01_PlaceGlacier_DEM_1m_WGS84_UTM10_Ellips_cog.tif";
  // Fetch elevation for each point from both URLs
  const elevationData = await Promise.all(
    samplePoints.map(async ([lng, lat]) => {
      const fetchUrl1 = `https://goose.hakai.org/titiler/cog/point/${lng},${lat}?url=${encodeURIComponent(
        url1
      )}`;
      const fetchUrl2 = `https://goose.hakai.org/titiler/cog/point/${lng},${lat}?url=${encodeURIComponent(
        url2
      )}`;

      const [response1, response2] = await Promise.all([
        fetch(fetchUrl1),
        fetch(fetchUrl2),
      ]);

      const [data1, data2] = await Promise.all([
        response1.json(),
        response2.json(),
      ]);

      return {
        lng,
        lat,
        elevation1: data1.values[0],
        elevation2: data2.values[0],
        elevationDiff: data2.values[0] - data1.values[0],
      };
    })
  );

  return elevationData;
}

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://public-aco-data.s3.amazonaws.com/stac";
const TILE_BASE_URL = "https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}";
const S3_BASE_URL = "https://public-aco-data.s3.amazonaws.com";

async function fetchJson(url) {
  const response = await axios.get(url);
  return response.data;
}

function createTileUrl(params) {
  const queryString = Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join("&");
  return `${TILE_BASE_URL}?${queryString}`;
}

function createS3Url(path) {
  return `${S3_BASE_URL}/${path}`;
}

function createLayerConfig(type, s3Path, additionalParams = {}) {
  const baseParams = {
    url: createS3Url(s3Path),
  };

  const typeConfigs = {
    ortho: { bidx: [1, 2, 3] },
    dem: {
      colormap_name: "gist_earth",
      rescale: "-10,2500",
      nodata: "-340282346638528859811704183484516925440",
      bidx: 1,
      resampling: "nearest",
      return_mask: "true",
    },
    hillshade: {
      algorithm: "hillshade",
      algorithm_params: '{"angle_altitude":45}',
      nodata: "-340282346638528859811704183484516925440",
      bidx: 1,
      resampling: "nearest",
      return_mask: "true",
    },
    contour: {
      algorithm: "contours",
      algorithm_params: '{"increment":100,"thickness":1,"minz":0,"maxz":2500}',
      nodata: "-340282346638528859811704183484516925440",
      bidx: 1,
      resampling: "nearest",
      return_mask: "true",
    },
    slope: { rescale: "0,90", colormap_name: "viridis" },
  };

  return createTileUrl({
    ...baseParams,
    ...typeConfigs[type],
    ...additionalParams,
  });
}

async function fetchStacData() {
  const rootCatalog = await fetchJson(`${BASE_URL}/catalog.json`);
  const siteData = {};
  let siteId = 1;

  for (const link of rootCatalog.links) {
    if (link.rel === "child") {
      const siteCatalog = await fetchJson(`${BASE_URL}/${link.href}`);
      const siteName = link.title;
      siteData[siteName] = {
        id: siteId++,
        name: siteName,
        dates: {},
        bounds: null,
        lngLat: null,
      };

      for (const childLink of siteCatalog.links) {
        if (childLink.rel === "child") {
          const collectionUrl = `${BASE_URL}/${link.href.replace(
            "catalog.json",
            ""
          )}${childLink.href}`;
          const collection = await fetchJson(collectionUrl);
          const collectionId = collection.id;
          const collectionDate = collection.extent.temporal.interval[0][0];

          if (!siteData[siteName].dates[collectionDate]) {
            siteData[siteName].dates[collectionDate] = {
              layers: {},
            };
          }

          for (const item of collection.links) {
            if (item.rel === "item") {
              const itemParts = item.href.split("/");
              const itemName = itemParts[itemParts.length - 2];
              const itemType = itemName.split("_").pop().toLowerCase();

              if (
                ["dem", "ortho", "HS", "contour", "slope"].includes(itemType)
              ) {
                const layerName = `${
                  itemType.charAt(0).toUpperCase() + itemType.slice(1)
                } ${collectionId}`;
                const s3Path = `${link.title}/${childLink.href.replace(
                  "collection.json",
                  ""
                )}${itemName}/${item.href.split("/").pop()}`;

                siteData[siteName].dates[collectionDate].layers[layerName] =
                  createLayerConfig(
                    itemType === "ortho" ? "ortho" : "dem",
                    s3Path
                  );
              }
            }

            // Add bounds and lngLat
            if (
              collection.extent &&
              collection.extent.spatial &&
              collection.extent.spatial.bbox
            ) {
              const bbox = collection.extent.spatial.bbox[0];

              siteData[siteName].bounds = bbox;
              siteData[siteName].lngLat = [
                (bbox[0] + bbox[2]) / 2,
                (bbox[1] + bbox[3]) / 2,
              ];
            }
          }
        }
      }
    }
  }

  return siteData;
}

async function main() {
  try {
    console.log("Fetching STAC data...");
    const siteData = await fetchStacData();

    const outputPath = path.join(
      __dirname,
      "..",
      "public",
      "data",
      "siteData.json"
    );
    await fs.writeFile(outputPath, JSON.stringify(siteData, null, 2));

    console.log(`STAC data has been saved to ${outputPath}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();

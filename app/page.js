"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { lineString, along } from "@turf/turf";
import * as turf from "@turf/turf";

import length from "@turf/length";
import ElevationChart from "./chart.js"; // Adjust the import path as needed
import D3Legend from "./legend.js";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaGFrYWkiLCJhIjoiY2lyNTcwYzY5MDAwZWc3bm5ubTdzOWtzaiJ9.6QhxH6sQEgK634qO7a8MoQ";

const gistEarthColormap = [
  "#000000",
  "#1E2A41",
  "#3C5282",
  "#5A7AC3",
  "#78A2E5",
  "#96CBF8",
  "#B4F3FF",
  "#D2FFE7",
  "#F0FFCF",
  "#FFFFB7",
  "#FFE89F",
  "#FFD187",
  "#FFBA6F",
  "#FFA357",
  "#FF8B3F",
  "#FF7427",
];
// const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
// const mosaicJsonUrl =
//   "https://gist.githubusercontent.com/Mbrownshoes/92ccda216d53db9f20a8f2b4c3a60b58/raw/b8c238a7e53bea1d185b7704d6e5960ac459b925/mosaic.json";
const siteData = {
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
    },
    lngLat: [-122.62, 50.389],
  },
};

const siteAliases = {
  "Place Glacier": "PlaceGlacier",
  "Elliot Creek": "ElliotCreekLandslide",
};

// const default_dataset = Object.keys(layers)[0];
export default function Home(callback, deps) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [lng, setLng] = useState(-122.595414);
  const [lat, setLat] = useState(50.381554);
  const [zoom, setZoom] = useState(12);
  const [pitch, setPitch] = useState(60);
  const [bearing, setBearing] = useState(0);
  const requestRef = useRef();
  const [elevation, setElevation] = useState(null);
  const [transectData, setTransectData] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [showDrawHelper, setShowDrawHelper] = useState(false);

  const [selectedSite, setSelectedSite] = useState("Place Glacier");

  const sites = ["Place Glacier", "Elliot Creek"];
  // setSelectedSite("Place Glacier");
  const handleSiteSelection = (site) => {
    site === "Place Glacier"
      ? setSelectedLayer(default_dataset)
      : setSelectedLayer(Object.keys(layersForSelectedSite)[0]);
    setSelectedSite(site);
    // You can add additional logic here, such as updating the UI or fetching data for the selected site
  };

  function getCoordsForSite(siteName) {
    const siteKey = siteAliases[siteName] || siteName;
    return siteData[siteKey]?.lngLat || {};
  }
  function getLayersForSite(siteName) {
    const siteKey = siteAliases[siteName] || siteName;
    return siteData[siteKey]?.layers || {};
  }
  const [layersForSelectedSite, setLayersForSelectedSite] = useState({});
  const [selectedLayer, setSelectedLayer] = useState({});
  useEffect(() => {
    console.log(selectedSite);

    const layers = getLayersForSite(selectedSite);
    setLayersForSelectedSite(layers);
    setSelectedLayer(Object.keys(layers)[0]);
  }, [selectedSite]);

  const CoordsForSelectedSite = getCoordsForSite(selectedSite);

  const default_dataset = Object.keys(layersForSelectedSite)[0];
  // const [selectedLayer, setSelectedLayer] = useState(default_dataset);

  const tilesetUrl =
    selectedSite === "Place Glacier" &&
    (selectedLayer === "DEM 1" || "Ortho 1" || "HS 1" || "Countour 1")
      ? "https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/22_4012_07_1m_GF_DEM_WGS84_z10_Ellips_FullExtent_COG.tif"
      : selectedSite === "Place Glacier" &&
        (!selectedLayer === "DEM 1" || "Ortho 1" || "HS 1" || "Countour 1")
      ? "https://public-aco-data.s3.amazonaws.com/4012_PlaceGlacier/23_4012_01_PlaceGlacier_DEM_1m_WGS84_UTM10_Ellips_cog.tif"
      : "https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_DEM_1m_CSRS_UTM10_HTv2_cog.tif";

  const getElevation = async (lng, lat) => {
    const url = `https://goose.hakai.org/titiler/cog/point/${lng},${lat}?url=${encodeURIComponent(
      tilesetUrl
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.values && data.values.length > 0) {
        const elevationValue = data.values[0];
        setElevation(elevationValue);
      } else {
        setElevation(null);
      }
    } catch (error) {
      console.error("Error fetching elevation data:", error);
      setElevation(null);
    }
  };

  const rotateCamera = (timestamp) => {
    if (!map.current) return;
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.current.rotateTo((timestamp / 100) % 360, { duration: 0 });

    // Request the next frame of the animation.
    requestRef.current = requestAnimationFrame(rotateCamera);
  };

  const stopRotating = useCallback(() => {
    if (!requestRef.current) return;
    cancelAnimationFrame(requestRef.current);
    requestRef.current = null;
  }, []);
  const [stats, setStats] = useState({ min: 0, max: 2500 }); // Default values

  useEffect(() => {
    if (map.current) {
      // If a map already exists, remove it before creating a new one
      map.current.remove();
    }
    // if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [CoordsForSelectedSite[0], CoordsForSelectedSite[1]],
      zoom: zoom,
      pitch: pitch,
    });
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
      setPitch(map.current.getPitch().toFixed(2));
      setBearing(map.current.getBearing().toFixed(2));
    });

    // map.current.on("click", stopRotating);

    map.current.on("touchstart", stopRotating);
    map.current.on("contextmenu", stopRotating);

    map.current.on("load", () => {
      // Start the animation.
      //   rotateCamera(0);
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          line_string: true,
          trash: true,
        },
      });
      map.current.addControl(draw.current, "top-right");
      setShowDrawHelper(true);

      map.current.on("draw.create", handleDrawEvent);
      map.current.on("draw.update", handleDrawEvent);
      map.current.on("draw.delete", handleDeleteEvent);

      map.current.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      // add the DEM source as a terrain layer with exaggerated height
      map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1 });

      Object.keys(layersForSelectedSite).forEach((layer) => {
        const source = layersForSelectedSite[layer];

        map.current.addSource(layer, {
          type: "raster",
          tiles: [source],
          tileSize: 512,
        });
      });

      map.current.addLayer(
        {
          id: selectedLayer,
          type: "raster",
          source: selectedLayer,
          paint: {},
        },
        "building" // Place under labels, roads and buildings
      );
    });
    map.current.on("error", (e) => {
      console.error("Map error:", e.error);
    });
    const getTransectElevation = async (
      startPoint,
      endPoint,
      numSamples = 100
    ) => {
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
    };

    function handleDrawEvent(e) {
      const data = draw.current.getAll();
      const lines = data.features.filter(
        (f) => f.geometry.type === "LineString"
      );

      if (lines.length > 0) {
        const line = lines[0];
        const coordinates = line.geometry.coordinates;
        const startPoint = coordinates[0];
        const endPoint = coordinates[coordinates.length - 1];

        getTransectElevation(startPoint, endPoint).then((elevationData) => {
          setTransectData(elevationData.filter((d) => d.elevation > 0));
          setShowChart(true);
        });
      }
    }

    function handleDeleteEvent() {
      setTransectData(null);
      setShowChart(false);
    }
    map.current.on("mousemove", (e) => {
      const { lng, lat } = e.lngLat;
      getElevation(lng, lat);
    });
  }, [selectedSite, layersForSelectedSite]);

  const updateLayer = (newLayer) => {
    map.current.removeLayer(selectedLayer);
    map.current.addLayer(
      {
        id: newLayer,
        type: "raster",
        source: newLayer,
        paint: {},
      },
      "building" // Place under labels, roads and buildings
    );

    setSelectedLayer(newLayer);
  };

  return (
    <main className="w-screen min-h-screen">
      <div className="absolute top-0 bottom-0 left-0 right-0">
        {/*Layer radio selector*/}
        <div className="absolute top-0 left-0 m-4 z-10">
          <div className="mt-4 bg-base-200 p-2 rounded-box">
            <h3 className="label-text text-lg font-bold">Select a Site</h3>
            <div className="flex flex-col">
              {sites.map((site) => (
                <button
                  key={site}
                  onClick={() => handleSiteSelection(site)}
                  className={`btn btn-sm m-1 ${
                    selectedSite === site ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {site}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col bg-base-200 w-40 p-2 rounded-box">
            <h3 className="label-text text-lg font-bold">Layers</h3>
            {Object.keys(layersForSelectedSite).map((layer) => {
              return (
                <div key={layer} className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">{layer}</span>
                    <input
                      type="radio"
                      name="radio-10"
                      className="radio checked:bg-red-500"
                      checked={layer === selectedLayer}
                      onChange={() => updateLayer(layer)}
                    />
                  </label>
                </div>
              );
            })}
          </div>

          {/* Site Selector */}
        </div>

        {/* Elevation display - now at top right */}
        <div className="absolute top-2 left-1/3 transform -translate-x-1/2 z-10 bg-base-200 p-2 rounded-box">
          <h3 className="label-text text-lg font-bold">Elevation</h3>
          <p className="label-text">
            {elevation !== null && elevation > 0
              ? `${elevation.toFixed(2)} meters`
              : "Hover for elevation"}
          </p>
        </div>
        {/* Draw helper text */}
        {showDrawHelper && (
          <div className="absolute top-2 right-10 z-10 bg-base-200 p-2 rounded-box">
            <p className="label-text">
              Draw a line to measure elevation change
            </p>
          </div>
        )}
        {typeof selectedLayer === "string" && selectedLayer.includes("DEM") && (
          <div className="absolute bottom-2 left-1/4 transform -translate-x-1/2 z-10 bg-white p-2 rounded-box shadow-md">
            <D3Legend
              min={stats.min}
              max={stats.max}
              colormap={gistEarthColormap}
            />
          </div>
        )}
        <div style={{ position: "relative", width: "100%", height: "100vh" }}>
          <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

          {transectData && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "30%", // Adjust this value to control how much of the map the chart covers
                backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent white background
                zIndex: 10, // Ensure the chart appears above the map
                padding: "10px",
                boxSizing: "border-box",
              }}
            >
              <ElevationChart transectData={transectData} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

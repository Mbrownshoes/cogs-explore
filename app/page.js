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

mapboxgl.accessToken =
  "pk.eyJ1IjoiaGFrYWkiLCJhIjoiY2lyNTcwYzY5MDAwZWc3bm5ubTdzOWtzaiJ9.6QhxH6sQEgK634qO7a8MoQ";

const layers = {
  "Ortho Apr. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?bidx=1&bidx=2&bidx=3&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_ORTHO_CSRS_UTM10_HTv2_cog.tif`,
  "DEM Apr. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?colormap_name=gist_earth&rescale=-10,2500&nodata=-340282346638528859811704183484516925440&bidx=1&resampling=nearest&return_mask=true&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_DEM_1m_CSRS_UTM10_HTv2_cog.tif`,
  "HS Apr. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?algorithm=hillshade&algorithm_params={"angle_altitude":45}&nodata=-340282346638528859811704183484516925440&bidx=1&resampling=nearest&return_mask=true&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_DEM_1m_CSRS_UTM10_HTv2_cog.tif`,
  "Ortho Jul. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?bidx=1&bidx=2&bidx=3&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_02_ElliotCreekLandslide_ORTHO_CSRS_UTM10_HTv2_cog.tif`,
  "Ortho Oct. '21": `https://goose.hakai.org/titiler/cog/tiles/{z}/{x}/{y}?bidx=1&bidx=2&bidx=3&url=https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_03_ElliotCreekLandslide_ORTHO_CSRS_UTM10_HTv2_cog.tif`,
};
const default_dataset = Object.keys(layers)[0];

export default function Home(callback, deps) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [lng, setLng] = useState(-124.6717);
  const [lat, setLat] = useState(50.9013);
  const [zoom, setZoom] = useState(12);
  const [pitch, setPitch] = useState(60);
  const [bearing, setBearing] = useState(0);
  const requestRef = useRef();
  const [selectedLayer, setSelectedLayer] = useState(default_dataset);
  const [elevation, setElevation] = useState(null);
  const [transectData, setTransectData] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const getElevation = async (lng, lat) => {
    // console.log(layers[selectedLayer]);

    const tilesetUrl =
      "https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_DEM_1m_CSRS_UTM10_HTv2_cog.tif";
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

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
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
      map.current.addControl(draw.current);

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

      Object.keys(layers).forEach((layer) => {
        const source = layers[layer];
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
    const getTransectElevation = async (
      startPoint,
      endPoint,
      numSamples = 100
    ) => {
      const tilesetUrl =
        "https://public-aco-data.s3.amazonaws.com/3030_ElliotCreekLandslide/21_3030_01_ElliotCreekLandslide_DEM_1m_CSRS_UTM10_HTv2_cog.tif";

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
          console.log(elevationData.filter((d) => d.elevation > 0));

          setTransectData(elevationData.filter((d) => d.elevation > 0));
          setShowChart(true);
        });
      }
    }

    function handleDeleteEvent() {
      setTransectData(null);
      setShowChart(false);
    }
    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      getElevation(lng, lat);
    });
  });

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
          <div className="flex flex-col bg-base-200 w-40 p-2 rounded-box">
            <h3 className="label-text text-lg font-bold">Layers</h3>
            {Object.keys(layers).map((layer) => (
              <div key={layer} className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{layer}</span>
                  <input
                    type="radio"
                    name="radio-10"
                    className="radio checked:bg-red-500"
                    checked={layer === selectedLayer}
                    onClick={() => updateLayer(layer)}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Elevation display - now at top right */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-base-200 p-2 rounded-box">
          <h3 className="label-text text-lg font-bold">Elevation</h3>
          <p className="label-text">
            {elevation !== null
              ? `${elevation.toFixed(2)} meters`
              : "Click on the map to get elevation"}
          </p>
        </div>

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

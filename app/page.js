"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl";

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
  const [lng, setLng] = useState(-124.6717);
  const [lat, setLat] = useState(50.9013);
  const [zoom, setZoom] = useState(12);
  const [pitch, setPitch] = useState(60);
  const [bearing, setBearing] = useState(0);
  const requestRef = useRef();
  const [selectedLayer, setSelectedLayer] = useState(default_dataset);

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

    map.current.on("click", stopRotating);
    map.current.on("touchstart", stopRotating);
    map.current.on("contextmenu", stopRotating);

    map.current.on("load", () => {
      // Start the animation.
      rotateCamera(0);

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
        <div className="h-full z-0" ref={mapContainer} />
      </div>
    </main>
  );
}

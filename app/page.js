"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import SiteSelector from "../components/siteSelector";
import LayerSelector from "../components/layerSelector";
import ElevationDisplay from "../components/elevationDisplay";
import DrawHelper from "../components/drawHelper";
import DEMLegend from "../components/DEMLegend";
import { getLayersForSite } from "../utils/siteUtils";

const Map = dynamic(() => import("../components/map"), { ssr: false });

export default function Home() {
  const [selectedSite, setSelectedSite] = useState("Place Glacier");
  const [selectedLayer, setSelectedLayer] = useState("");
  const [layersForSelectedSite, setLayersForSelectedSite] = useState({});
  const [elevation, setElevation] = useState(null);
  const [showDrawHelper, setShowDrawHelper] = useState(false);
  const [compareChangeEnabled, setCompareChangeEnabled] = useState(false);
  const [transectData, setTransectData] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    console.log(selectedSite);

    const layers = getLayersForSite(selectedSite);
    setLayersForSelectedSite(layers);
    setSelectedLayer(Object.keys(layers)[0]); //set initial layer
  }, [selectedSite]);

  // Additional state variables
  const [mapCenter, setMapCenter] = useState({
    lng: -122.595414,
    lat: 50.381554,
  });
  const [mapZoom, setMapZoom] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Additional functions
  const handleMapMove = useCallback((newCenter, newZoom) => {
    setMapCenter(newCenter);
    setMapZoom(newZoom);
  }, []);

  const handleLayerOpacityChange = useCallback((layerId, opacity) => {
    // Logic to change layer opacity
  }, []);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    // Additional error handling logic
  }, []);

  const fetchSiteData = useCallback(
    async (siteName) => {
      setIsLoading(true);
      try {
        // Fetch data for the selected site
        const data = await fetchDataForSite(siteName);
        setLayersForSelectedSite(data.layers);
        setIsLoading(false);
      } catch (error) {
        handleError("Failed to fetch site data");
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const handleTransectDataChange = useCallback((newTransectData) => {
    setTransectData(newTransectData);
    // You can add any additional logic here, such as updating other parts of your UI
    // or triggering other functions based on the new transect data
  }, []);

  const handleDrawEvent = useCallback(
    (e, eventType) => {
      const lines = e.features.filter((f) => f.geometry.type === "LineString");
      if (lines.length > 0) {
        const line = lines[0];
        const [startPoint, endPoint] = [
          line.geometry.coordinates[0],
          line.geometry.coordinates[line.geometry.coordinates.length - 1],
        ];

        const fetchElevationData = compareChangeEnabled
          ? getTransectElevationDiff
          : getTransectElevation;

        fetchElevationData(startPoint, endPoint).then((elevationData) => {
          handleTransectDataChange(
            elevationData.filter((d) => d.elevation > 0)
          );
        });
      }
    },
    [compareChangeEnabled, handleTransectDataChange]
  );

  const handleMapLoad = useCallback(
    (map) => {
      setMapInstance(map);

      // Example: Add a custom layer immediately after map load
      map.addSource("custom-source", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [mapCenter.lng, mapCenter.lat],
          },
        },
      });

      map.addLayer({
        id: "custom-layer",
        type: "circle",
        source: "custom-source",
        paint: {
          "circle-radius": 10,
          "circle-color": "#ff0000",
        },
      });

      // Example: Set up event listeners
      map.on("click", "custom-layer", (e) => {
        console.log("Custom layer clicked!", e.features[0].properties);
      });

      // Example: Fly to the initial center
      map.flyTo({
        center: [mapCenter.lng, mapCenter.lat],
        zoom: mapZoom,
        essential: true,
      });
    },
    [mapCenter, mapZoom]
  );

  return (
    <main className="w-screen min-h-screen">
      <div className="absolute top-0 bottom-0 left-0 right-0">
        <div className="absolute top-0 left-0 z-10 m-4 flex flex-col gap-4">
          <SiteSelector
            selectedSite={selectedSite}
            onSiteSelect={setSelectedSite}
          />
          <LayerSelector
            layers={layersForSelectedSite}
            selectedLayer={selectedLayer}
            onLayerSelect={setSelectedLayer}
          />
        </div>
        <ElevationDisplay elevation={elevation} />
        {showDrawHelper && (
          <DrawHelper
            compareChangeEnabled={compareChangeEnabled}
            onCompareChange={setCompareChangeEnabled}
          />
        )}
        {selectedLayer.includes("DEM") && <DEMLegend />}
        <Map
          selectedSite={selectedSite}
          selectedLayer={selectedLayer}
          onElevationChange={setElevation}
          onShowDrawHelper={setShowDrawHelper}
          compareChangeEnabled={compareChangeEnabled}
          onTransectDataChange={handleTransectDataChange}
          onMapMove={handleMapMove}
          onDrawEvent={handleDrawEvent}
          onMapLoad={handleMapLoad}
        />
      </div>
    </main>
  );
}

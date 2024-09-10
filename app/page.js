"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useRef } from "react";
import SiteSelector from "../components/siteSelector";
import LayerSelector from "../components/layerSelector";
import ElevationDisplay from "../components/elevationDisplay";
import DrawHelper from "../components/drawHelper";
import DEMLegend from "../components/DEMLegend";
import { getLayersForSite } from "../utils/siteUtils";
import ElevationChart from "./chart.js"; // Adjust the import path as needed

const Map = dynamic(() => import("../components/map"), { ssr: false });

export default function Home() {
  const [selectedSite, setSelectedSite] = useState("Place Glacier");
  const [selectedLayer, setSelectedLayer] = useState("");
  const [layersForSelectedSite, setLayersForSelectedSite] = useState({});
  const [elevation, setElevation] = useState(null);
  const [showDrawHelper, setShowDrawHelper] = useState(true);
  const [compareChangeEnabled, setCompareChangeEnabled] = useState(false);
  const [transectData, setTransectData] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  const [mapCenter, setMapCenter] = useState({
    lng: -122.595414,
    lat: 50.381554,
  });
  const [mapZoom, setMapZoom] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialLoadDone = useRef(false);

  useEffect(() => {
    console.log(selectedSite);

    const layers = getLayersForSite(selectedSite);
    setLayersForSelectedSite(layers);
    setSelectedLayer(Object.keys(layers)[0]); //set initial layer
  }, [selectedSite]);

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

  const handleTransectDataChange = useCallback((newTransectData) => {
    setTransectData(newTransectData);
    // You can add any additional logic here, such as updating other parts of your UI
    // or triggering other functions based on the new transect data
  }, []);

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
        <div style={{ position: "relative", width: "100%", height: "100vh" }}>
          <Map
            mapCenter={mapCenter}
            selectedSite={selectedSite}
            selectedLayer={selectedLayer}
            onElevationChange={setElevation}
            onShowDrawHelper={setShowDrawHelper}
            compareChangeEnabled={compareChangeEnabled}
            onTransectDataChange={handleTransectDataChange}
            // onMapMove={handleMapMove}
            // onDrawEvent={handleDrawEvent}
            // onMapLoad={handleMapLoad}
          />
          {transectData &&
            (compareChangeEnabled ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    bottom: "15%", // Position it above the second chart
                    left: 0,
                    right: 0,
                    height: "15%",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    zIndex: 10,
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  <ElevationChart
                    transectData={transectData}
                    varToPlot={"elevation1"}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "15%",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    zIndex: 10,
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  <ElevationChart
                    transectData={transectData}
                    varToPlot={"elevationDiff"}
                  />
                </div>
              </>
            ) : (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "15%",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  zIndex: 10,
                  padding: "10px",
                  boxSizing: "border-box",
                }}
              >
                <ElevationChart
                  transectData={transectData}
                  varToPlot={"elevation"}
                />
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}

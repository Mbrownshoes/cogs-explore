import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import {
  getTransectElevation,
  getTransectElevationDiff,
  getElevation,
} from "../utils/elevation";
import { getTilesetUrl } from "../utils/siteData";
import { debounce } from "../utils/functions";
import { getBoundsForSite, getLayersForSite } from "../utils/siteUtils";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaGFrYWkiLCJhIjoiY20wbXh4emprMDc3cjJrcTI5czI3cXRjbCJ9.XNfWqelIzmfMTVRJlc7nIg";

export default function Map({
  mapCenter,
  selectedSite,
  selectedLayer,
  onElevationChange,
  onShowDrawHelper,
  compareChangeEnabled,
  onTransectDataChange,
}) {
  console.log(selectedSite, selectedLayer);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const handleDrawEvent = useCallback(
    (e) => {
      setShowChart(false);
      const data = draw.current.getAll();
      const lines = data.features.filter(
        (f) => f.geometry.type === "LineString"
      );

      if (lines.length > 0) {
        const line = lines[0];
        const [startPoint, endPoint] = [
          line.geometry.coordinates[0],
          line.geometry.coordinates[line.geometry.coordinates.length - 1],
        ];
        const tilesetUrl = getTilesetUrl(selectedSite, selectedLayer);

        const fetchElevationData = compareChangeEnabled
          ? (start, end) => getTransectElevationDiff(start, end, tilesetUrl)
          : (start, end) => getTransectElevation(start, end, tilesetUrl);

        fetchElevationData(startPoint, endPoint).then((elevationData) => {
          onTransectDataChange(
            elevationData.filter((d) =>
              compareChangeEnabled
                ? d.elevation1 > 0 && d.elevation2 > 0
                : d.elevation > 0
            )
          );
          setShowChart(true);
        });
      }
    },
    [compareChangeEnabled, onTransectDataChange, selectedSite, selectedLayer]
  );

  const handleDeleteEvent = useCallback(() => {
    onTransectDataChange(null);
    setShowChart(false);
  }, [onTransectDataChange]);

  // Effect to initialize the map
  useEffect(() => {
    if (map.current) return; // Only create the map once
    console.log("Map initialized");

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [mapCenter.lng, mapCenter.lat],
      zoom: 12,
      pitch: 60,
    });

    map.current.on("load", () => {
      console.log("Map loaded");
      setMapLoaded(true);

      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          line_string: true,
          trash: true,
        },
      });
      map.current.addControl(draw.current, "top-right");

      onShowDrawHelper(true);

      map.current.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1 });

      // Initial bounds setting moved to separate effect
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapCenter, onShowDrawHelper]);

  // New effect to handle selectedSite changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const bounds = getBoundsForSite(selectedSite);
    map.current.flyTo({
      center: [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2],
      zoom: 12,
      pitch: 60,
      duration: 2000, // Duration of animation in milliseconds
    });
  }, [selectedSite, mapLoaded]);

  // Function to update layers
  const updateLayers = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) {
      console.log("Map or style not loaded yet, retrying in 100ms...");
      setTimeout(updateLayers, 100);
      return;
    }

    const layers = getLayersForSite(selectedSite);
    console.log(layers);

    // Remove existing layers
    Object.keys(layers).forEach((layer) => {
      if (map.current.getLayer(layer)) {
        map.current.removeLayer(layer);
      }
      if (map.current.getSource(layer)) {
        map.current.removeSource(layer);
      }
    });

    // Add new layers
    Object.entries(layers).forEach(([layerName, sourceUrl]) => {
      console.log(sourceUrl);

      map.current.addSource(layerName, {
        type: "raster",
        tiles: [sourceUrl],
        tileSize: 512,
      });

      map.current.addLayer(
        {
          id: layerName,
          type: "raster",
          source: layerName,
          paint: {},
        },
        "gl-draw-polygon-fill-inactive.cold"
      );

      // Set visibility based on selectedLayer
      map.current.setLayoutProperty(
        layerName,
        "visibility",
        layerName === selectedLayer ? "visible" : "none"
      );
    });

    console.log("Layers updated successfully");
  }, [selectedSite, selectedLayer]);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    const tilesetUrl = getTilesetUrl(selectedSite, selectedLayer);

    const handleMouseMove = debounce(async (e) => {
      const { lng, lat } = e.lngLat;
      const elevation = await getElevation(lng, lat, tilesetUrl);
      if (elevation !== null) {
        onElevationChange(elevation);
      }
    }, 100);

    map.current.on("mousemove", handleMouseMove);

    return () => {
      if (map.current) {
        map.current.off("mousemove", handleMouseMove);
      }
    };
  }, [mapLoaded, onElevationChange, selectedSite, selectedLayer]);

  // Effect to handle layer changes
  useEffect(() => {
    if (!mapLoaded) return;
    updateLayers();
  }, [selectedSite, selectedLayer, mapLoaded, updateLayers]);

  useEffect(() => {
    if (!mapLoaded || !map.current || !draw.current) return;

    map.current.on("draw.create", handleDrawEvent);
    map.current.on("draw.update", handleDrawEvent);
    map.current.on("draw.delete", handleDeleteEvent);

    return () => {
      if (map.current) {
        map.current.off("draw.create", handleDrawEvent);
        map.current.off("draw.update", handleDrawEvent);
        map.current.off("draw.delete", handleDeleteEvent);
      }
    };
  }, [mapLoaded, handleDrawEvent, handleDeleteEvent]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}

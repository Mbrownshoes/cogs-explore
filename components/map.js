import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import {
  getTransectElevation,
  getTransectElevationDiff,
  getElevation,
} from "../utils/elevation";
import { layersForSite, getTilesetUrl } from "../utils/siteData";
import { debounce } from "../utils/functions";
import { getBoundsForSite } from "../utils/siteUtils";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaGFrYWkiLCJhIjoiY20wbXh4emprMDc3cjJrcTI5czI3cXRjbCJ9.XNfWqelIzmfMTVRJlc7nIg";

export default function Map({
  selectedSite,
  onMapLoad,
  selectedLayer,
  onElevationChange,
  onShowDrawHelper,
  compareChangeEnabled,
  onTransectDataChange,
}) {
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

  useEffect(() => {
    if (map.current) return; // Only create the map once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-122.595414, 50.381554],
      zoom: 12,
      pitch: 60,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      if (onMapLoad) onMapLoad(map.current);

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

      const initialLayers = layersForSite(selectedSite);
      Object.entries(initialLayers).forEach(([layerName, sourceUrl]) => {
        map.current.addSource(layerName, {
          type: "raster",
          tiles: [sourceUrl],
          tileSize: 512,
        });

        map.current.addLayer({
          id: layerName,
          type: "raster",
          source: layerName,
          paint: {},
        });
      });

      if (selectedLayer) {
        Object.keys(initialLayers).forEach((layer) => {
          map.current.setLayoutProperty(
            layer,
            "visibility",
            layer === selectedLayer ? "visible" : "none"
          );
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMapLoad, selectedSite, selectedLayer, onShowDrawHelper]);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const layers = layersForSite(selectedSite);

    Object.keys(layers).forEach((layer) => {
      if (map.current.getLayer(layer)) {
        map.current.setLayoutProperty(
          layer,
          "visibility",
          layer === selectedLayer ? "visible" : "none"
        );
      }
    });

    const bounds = getBoundsForSite(selectedSite);
    map.current.fitBounds(bounds, {
      padding: 20,
      duration: 1000,
      pitch: 60,
    });
  }, [selectedSite, selectedLayer, mapLoaded]);

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

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

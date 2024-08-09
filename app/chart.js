import React, { useEffect, useRef } from "react";
import * as Plot from "@observablehq/plot";

function ElevationChart({ transectData }) {
  const chartRef = useRef();

  useEffect(() => {
    if (transectData && transectData.length > 0) {
      const chart = Plot.plot({
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight,
        y: {
          label: "Elevation (m)",
        },
        marks: [
          Plot.line(transectData, {
            x: (d, i) => i,
            y: "elevation",
          }),
          //   Plot.ruleY([0]),
        ],
      });

      chartRef.current.innerHTML = "";
      chartRef.current.append(chart);

      return () => chart.remove();
    }
  }, [transectData]);

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }}></div>;
}

export default ElevationChart;

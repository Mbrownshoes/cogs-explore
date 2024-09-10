import React, { useEffect, useRef } from "react";
import * as Plot from "@observablehq/plot";

function ElevationChart({ transectData, varToPlot }) {
  const chartRef = useRef();
  console.log(transectData, varToPlot);

  useEffect(() => {
    if (
      (transectData &&
        transectData.length > 0 &&
        varToPlot === "elevationDiff") ||
      varToPlot === "elevation"
    ) {
      const chart = Plot.plot({
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight,
        y: {
          label: "Elevation change(m)",
        },
        marks: [
          Plot.line(transectData, {
            x: (d, i) => i,
            y: varToPlot,
            stroke: "orange",
          }),
          //   Plot.ruleY([0]),
        ],
      });

      chartRef.current.innerHTML = "";
      chartRef.current.append(chart);

      return () => chart.remove();
    } else if (
      transectData &&
      transectData.length > 0 &&
      varToPlot === "elevation1"
    ) {
      const chart = Plot.plot({
        width: chartRef.current.clientWidth,
        height: chartRef.current.clientHeight,
        y: {
          label: "Elevation (m)",
        },
        marks: [
          Plot.line(transectData, {
            x: (d, i) => i,
            y: "elevation1",
            stroke: "blue",
          }),
          Plot.line(transectData, {
            x: (d, i) => i,
            y: "elevation2",
            stroke: "red",
          }),
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

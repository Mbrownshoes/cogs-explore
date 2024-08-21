import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const D3Legend = ({ min, max, colormap }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 200;
    const height = 50;
    const marginRight = 10;
    const marginLeft = 10;
    const barHeight = 15;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Clear any existing content
    svg.selectAll("*").remove();

    const x = d3
      .scaleLinear()
      .domain([min, max])
      .range([marginLeft, width - marginRight]);

    const colorScale = d3
      .scaleLinear()
      .domain(d3.range(0, 1, 1 / (colormap.length - 1)))
      .range(colormap);

    // Create gradient
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    colormap.forEach((color, i) => {
      gradient
        .append("stop")
        .attr("offset", `${(i / (colormap.length - 1)) * 100}%`)
        .attr("stop-color", color);
    });

    // Draw the rectangle and fill with gradient
    svg
      .append("rect")
      .attr("x", marginLeft)
      .attr("y", 0)
      .attr("width", width - marginLeft - marginRight)
      .attr("height", barHeight)
      .style("fill", "url(#legend-gradient)");

    // Create the scale
    const axisScale = d3
      .axisBottom(x)
      .tickSize(4)
      .tickValues(d3.range(min, max, (max - min) / 5))
      .tickFormat(d3.format("d"));

    // Add the scale to the legend
    svg
      .append("g")
      .attr("transform", `translate(0,${barHeight})`)
      .call(axisScale)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g.selectAll(".tick line").attr("stroke", "#000").attr("stroke-width", 2)
      )
      .call((g) =>
        g.selectAll(".tick text").attr("y", 10).attr("dy", "0.71em")
      );

    // Add legend title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Elevation (m)");
  }, [min, max, colormap]);

  return <svg ref={svgRef}></svg>;
};

export default D3Legend;

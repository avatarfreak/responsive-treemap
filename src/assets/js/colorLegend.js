import { select } from "d3";
export const colorLegends = (selection, props) => {
  const { data, innerHeight, innerWidth, margin, colorScale } = props;
  const legendDims = { width: 20, height: 20, col: 4, padding: 160, space: 25 };

  
  const legend = selection
    .selectAll("#legend")
    .data([null])
    .join("svg")
    .attr("id", "legend")
     .attr("viewBox", `0 0  ${innerWidth} ${innerHeight}`)
    .attr("perserveAspectRatio", "xMinYMid")
    .attr("transform", `translate(${margin.left}, ${0})`);

  legend
    .selectAll(".legend-item")
    .data(data.children)
    .join("rect")
    .attr("class", "legend-item")
    .attr("width", (d, i) => `${legendDims.width}`)
    .attr("height", legendDims.height)
    .attr("x", (d, i) => parseInt(i / legendDims.col) * legendDims.padding)
    .attr("y", (d, i) => (i % legendDims.col) * legendDims.space)
    .attr("fill", (d, i) => colorScale(d.name));

  legend
    .selectAll("text")
    .data(data.children)
    .join("text")
    .attr("class", "legend-text")
    .attr("dx", legendDims.width)
    .attr("dy", (i, d) => legendDims.height)
    .attr("x", (d, i) => parseInt(i / legendDims.col) * legendDims.padding + 5)
    .attr("y", (d, i) => (i % legendDims.col) * legendDims.space)
    .style("font-size", ".8em")
    .style("fill", "#fcfcfc")
    .text(d => d.name);
};

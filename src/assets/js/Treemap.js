import { select, treemap, hierarchy } from "d3";
import { scaleLinear } from "d3-scale";

export const Treemap = (selection, props) => {
  //destructuring
  const { colorScale, data, innerWidth, innerHeight, margin } = props;

  const tooltip = select(".display__svg")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("padding", "5px 7px")
    .style("border", "1px #333 solid")
    .style("border-radius", "5px")
    .style("opacity", 0);

  let transitioning;
  // sets x and y scale to determine size of visible boxes
  const x = scaleLinear()
    .domain([0, innerWidth])
    .range([0, innerWidth]);

  const y = scaleLinear()
    .domain([0, innerHeight])
    .range([0, innerHeight]);

  //invoking treemap
  const treemapLayout = treemap()
    .size([innerWidth, innerHeight])
    .paddingInner(1)

  const svg = selection
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");

  const grandparent = svg.append("g").attr("class", "grandparent");
  grandparent
    .append("rect")
    .attr("y", -margin.top)
    .attr("width", innerWidth)
    .attr("height", margin.top);

  grandparent
    .append("text")
    .attr("x", 6)
    .attr("y", 10 - margin.top)
    .attr("dy", ".75em")
    .attr("fill", "#fcfcfc");

  const root = hierarchy(data);
  root
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemapLayout(root);

  display(root);
  function display(d) {
    // write text into grandparent
    // and activate click's handler
    grandparent
      .datum(d.parent)
      .on("click", transition)
      .select("text")
      .text(name(d));

    // grandparent color
    grandparent
      .datum(d.parent)
      .select("rect")
      .attr("fill", () => "coral");

    const g1 = svg
      .insert("g", ".grandparent")
      .datum(d)
      .attr("class", "depth");

    const g = g1
      .selectAll("g")
      .data(d.children)
      .join("g");

    // add class and click handler to all g's with children
    g.filter(d => d.children)
      .classed("children", true)
      .on("click", transition);

    g.selectAll(".child")
      .data(d => d.children || [d])
      .join("rect")
      .attr("class", "child")
      .attr("class", "tile")
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .call(rect);

    g.on("mouseover", showTooTip).on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

    // add title to parents
    g.append("rect")
      .attr("class", "parent")
      .attr("stroke", "white")
      .call(rect)
      .append("title")
      .text(d => d.data.name);

    /* Adding a foreign object instead of a text object, allows for text wrapping */
    g.append("foreignObject")
      .call(rect)
      .attr("class", "foreignobj")
      .append("xhtml:div")
      .attr("dy", ".75em")
      .html(d => {
        return `<p class="title">${d.data.name}</p>`;
      })
      .attr("class", "textdiv");
       
    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;
      var g2 = display(d),
        t1 = g1.transition().duration(650),
        t2 = g2.transition().duration(650);
      // Update the domain only after entering new elements.
      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);
      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort((a, b) => a.depth - b.depth);

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);
      g2.selectAll("foreignObject div").style("display", "none");

      // Transition to the new view.
      t1.selectAll("text")
        .call(text)
        .style("fill-opacity", 0);

      t2.selectAll("text")
        .call(text)
        .style("fill-opacity", 1);

      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);
      /* Foreign object */
      t1.selectAll(".textdiv").style("display", "none");
      t1.selectAll(".foreignobj").call(foreign);
      t2.selectAll(".textdiv").style("display", "block");
      t2.selectAll(".foreignobj").call(foreign);

      // Remove the old node when the transition is finished.
      t1.on("end.remove", function() {
        this.remove();
        transitioning = false;
      });
    }
    return g;
  }
  function text(text) {
    text.attr("x", d => x(d.x) + 6).attr("y", d => y(d.y) + 6);
  }
  function rect(rect) {
    rect
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.y0))
      .attr("width", d => x(d.x1) - x(d.x0))
      .attr("height", d => y(d.y1) - y(d.y0))
      .attr("stroke", "white")
      .style("fill", d => colorScale(d.data.name));
  }
  function foreign(foreign) {
    /* added */
    foreign
      .attr("x", d => x(d.x0))
      .attr("y", d => y(d.y0))
      .attr("width", d => x(d.x1) - x(d.x0))
      .attr("height", d => y(d.y1) - y(d.y0));
  }
  function name(d) {
    return (
      breadcrumbs(d) +
      (d.parent ? " -  Click to zoom out" : " - Click inside square to zoom in")
    );
  }

  function breadcrumbs(d) {
    var res = "";
    var sep = " > ";
    d.ancestors()
      .reverse()
      .forEach(i => (res += i.data.name + sep));
    return res
      .split(sep)
      .filter(i => i !== "")
      .join(sep);
  }

  function showTooTip(d) {
    //looking for classname
    let className = this.getAttribute("class");
    //getting total value for parent
    //if not indivual items value
    let findValue = (a, b) => (className === "children" ? a.toFixed(1) : b);

    //parent's  name is same as category
    let findCategory = (a, b) => (className === "children" ? a : b);

    tooltip.transition().duration(200).style("opacity", 1);
    tooltip
      .html(
        `
          <label>Name: <b>${d.data.name}</b> </label> 
          <br>
          <label>Category: <b>${findCategory(
            d.parent.data.name,
            d.data.category
          )}</b> </label> 
          <br>
          <label>Value: <b> ${findValue(d.value, d.data.value)}</b></label> 
          `
      )
      .attr("data-value", `${findValue(d.value, d.data.value)}`)
      .style(
        "left",
        `${event.pageX < innerWidth / 1.25 ? event.pageX : event.pageX - 250}px`
      )
      .style(
        "top",
        `${event.pageY < innerHeight / 1.25 ? event.pageY : event.pageY - 100}px`
      );
  }
};

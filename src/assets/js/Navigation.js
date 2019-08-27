import { select } from "d3";

export const Navigation = (selection, props) => {
 const { options, onOptionClick, selectedOption } = props;

  let select = selection.selectAll("select").data([null])
    .join("select")
    .on("change", function(){
     onOptionClick(this.value, this.selectedIndex);
    });

  const option = select.selectAll("option").data(options);
  option
    .enter()
    .append("option")
    .merge(option)
    .attr("value", d => d)
    .property("selected", d => d === selectedOption) // to set the property 'selected' on the selected option
    .text(d => d);

};

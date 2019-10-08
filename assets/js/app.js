// Script to create SVG scatter plot and update plot based on user selection
// ---------------------------------------------------------------------------
// created by: Jack Langree
// version: 1.0
//=============================================================================
//=============================================================================


// svg container dimensions
var height = 700;
var width = 700;

// margins
var margin = {
  top: 50,
  right: 50,
  bottom: 120,
  left: 120
};

// chart area
var chartHeight = height - margin.top - margin.bottom;
var chartWidth = width - margin.left - margin.right;

// create svg container
var svg = d3.select("#scatter")
  .append("svg")
  .attr("height", height)
  .attr("width", width);

// translate chart elements by left and top margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// axis labels lists to iterate through later
var xlabelList = ["poverty", "age", "income"];
var ylabelList = ["healthcare", "obesity", "smokes"];

// set initial axes
var selectedX = "poverty";
var selectedY = "healthcare";

// set marker colors
var fillColor = "teal";
var fillAlternate = "darkred";

// functions to create new x- and y- scales when new user selection made
function xScale(healthData, selectedX) {
    
  // create scale for axis, going from just under the min to just over the max
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[selectedX]) * 0.8,
      d3.max(healthData, d => d[selectedX]) * 1.2
    ])
    .range([0, chartWidth]);

  return xLinearScale;
}

function yScale(healthData, selectedY) {

  // create scale for axis, going from just under the min to just over the max
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[selectedY]) * 0.8,
      d3.max(healthData, d => d[selectedY]) * 1.2
    ])
    .range([chartHeight, 0]);

  return yLinearScale;
}

// function to update xAxis or yAxis upon click on axis label
function renderAxes(newScale, axis, xy) {
  
  if (xy === "x") {  // axis chosen is x
    var bottomAxis = d3.axisBottom(newScale);

    axis.transition()
    .duration(1000)
    .call(bottomAxis);
  }
  else {  // axis chosen is y
    var leftAxis = d3.axisLeft(newScale);

    axis.transition()
    .duration(1000)
    .call(leftAxis);
  } 
  return axis;
}

// function to update circles group - with transition
function renderCirclesX(circlesGroup, newXScale, selectedX) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[selectedX]));

  return circlesGroup;
}

// function to update circles group - with transition
function renderCirclesY(circlesGroup, newYScale, selectedY) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[selectedY]));

  return circlesGroup;
}

// function to update circles group with new tooltip
function updateToolTip(selectedX, selectedY, circlesGroup) {

  var xlabel;   // labels for tooltip
  var ylabel;

  switch (selectedX) {    // choose xlabel
    case "poverty":
      xlabel = "In Poverty";
      break;
    case "age":
      xlabel = "Age (Median)";
      break;
    case "income":
      xlabel = "Income";
      break;
    default:
      xlabel = "In Poverty";
  }

  switch (selectedY) {    // choose ylabel
    case "healthcare":
      ylabel = "Lacking Healthcare";
      break;
    case "obesity":
      ylabel = "Obesity";
      break;
    case "smokes":
      ylabel = "Smokes";
      break;
    default:
      ylabel = "Lacking Healthcare";
  }


  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      if (selectedX === "poverty") {   // only add '%' to poverty xlabel
        return (`${d.state}<br>${xlabel}: ${d[selectedX]}%<br>${ylabel}: ${d[selectedY]}%`);
      }
      else {
        return (`${d.state}<br>${xlabel}: ${d[selectedX]}<br>${ylabel}: ${d[selectedY]}%`);
      }
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
    d3.select(this).attr("fill", fillAlternate);  // highlight with alternate color
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
      d3.select(this).attr("fill", fillColor);  // return to normal color
    });

  return circlesGroup;
}

function setAxisLabels(xlabelsGroup, ylabelsGroup) {
  // xlabels ------------------------------------------------------
  var povertyLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "age") // value to grab for event listener
  .classed("inactive", true)
  .text("Median Age");

  var incomeLabel = xlabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Median Household Income");

  // ylabels -------------------------------------------------------
  var healthcareLabel = ylabelsGroup.append("text")
  .attr("y", 0 - margin.left + 60)
  .attr("x", 0 - (chartHeight / 2))
  .attr("value", "healthcare") // value to grab for event listener
  .classed("active", true)
  .text("Lacking Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
  .attr("y", 0 - margin.left + 40)
  .attr("x", 0 - (chartHeight / 2))
  .attr("value", "smokes") // value to grab for event listener
  .classed("inactive", true)
  .text("Smokes (%)");

  var obesityLabel = ylabelsGroup.append("text")
  .attr("y", 0 - margin.left + 20)
  .attr("x", 0 - (chartHeight / 2))
  .attr("value", "obesity") // value to grab for event listener
  .classed("inactive", true)
  .text("Obesity (%)");

  var axisLabels = {
    x: {
      poverty: povertyLabel,
      age: ageLabel,
      income: incomeLabel
    },
    y: {
      healthcare: healthcareLabel,
      smokes: smokesLabel,
      obesity: obesityLabel
    }
  };

  return axisLabels;
}

// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------


// import data from csv, execute code to set up chart
d3.csv("assets/data/data.csv").then(function(healthData, err) {
  if (err) throw err;
    
  console.log(healthData);  // debugging


  // parse relevant data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale and yLinearScale --> functions above csv import
  var xLinearScale = xScale(healthData, selectedX);
  var yLinearScale = yScale(healthData, selectedY);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circle markers
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[selectedX]))
    .attr("cy", d => yLinearScale(d[selectedY]))
    .attr("r", 10)
    .attr("fill", fillColor)
    .attr("opacity", ".5");

  // add tooltips to markers on chart
  updateToolTip(selectedX, selectedY, circlesGroup);

  // Create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  // create group for 3 y-axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  // call getAxisLabels to append x- and y-axis labels, store as object 'axisLabels' 
  var axisLabels = setAxisLabels(xlabelsGroup, ylabelsGroup);

  // x-axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {

      var value = d3.select(this).attr("value");
      
      if (value !== selectedX) {    // only perform if new selection made

        // replaces selectedX with value
        selectedX = value;

        // updates x scale for new data
        xLinearScale = xScale(healthData, selectedX);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis, "x");

        // updates circles with new x values
        circlesGroup = renderCirclesX(circlesGroup, xLinearScale, selectedX);

        // updates tooltips with new info
        circlesGroup = updateToolTip(selectedX, selectedY, circlesGroup);

        // changes classes to change bold text
        for (x of xlabelList) {
          var label = x;

          if (x !== selectedX) {   // toggle labels other than selected to inactive
            axisLabels.x[label]
              .classed("inactive", true)
              .classed("active", false);
          }
          else {                  // toggle selected label to active
            axisLabels.x[label]
              .classed("inactive", false)
              .classed("active", true)
          }
        }
      }
    });




      // x-axis labels event listener
    ylabelsGroup.selectAll("text")
      .on("click", function() {

        var value = d3.select(this).attr("value");
    
          if (value !== selectedY) {    // only perform if new selection made

            // replaces selectedY with value
            selectedY = value;

            // updates y scale for new data
            yLinearScale = yScale(healthData, selectedY);

            // updates y axis with transition
            yAxis = renderAxes(yLinearScale, yAxis, "y");

            // updates circles with new y values
            circlesGroup = renderCirclesY(circlesGroup, yLinearScale, selectedY);

            // updates tooltips with new info
            circlesGroup = updateToolTip(selectedX, selectedY, circlesGroup);
          
            // changes classes to change bold text
            for (y of ylabelList) {
              var label = y;
              
              console.log(axisLabels.y[label]);

              if (y !== selectedY) {   // toggle labels other than selected to inactive
                axisLabels.y[label]
                  .classed("inactive", true)
                  .classed("active", false);
              }
              else {                  // toggle selected label to active
                axisLabels.y[label]
                  .classed("inactive", false)
                  .classed("active", true)
              }
            }            
          } 
        });
});
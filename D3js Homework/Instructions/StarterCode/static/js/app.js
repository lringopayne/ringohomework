// Define SVG attributes
let width = parseInt(d3.select('#scatter')
    .style("width"));

let height = width * 2/3;
let margin = 20;
let labelArea = 110;
let padding = 45;

// Create SVG object 
let svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// Labels for axes=================================
// Add first g - tag for x axis text 
svg.append("g").attr("class", "xText");
let xText = d3.select(".xText");

// Transform to adjust for xText
let bottomTextX =  (width - labelArea)/2 + labelArea;
let bottomTextY = height - margin - padding;
xText.attr("transform",`translate(
    ${bottomTextX}, 
    ${bottomTextY})`
    );

// x-axis (bottom) ______________________________
// Build xText details 
xText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

xText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Age");

// y-axis (left)___________________________________
// Second g tag for yText 
svg.append("g").attr("class", "yText");
let yText = d3.select(".yText");

// Transform to adjust for yText
let leftTextX =  margin + padding;
let leftTextY = (height + labelArea) / 2 - labelArea;
yText.attr("transform",`translate(
    ${leftTextX}, 
     ${leftTextY}
    )rotate(-90)`
    );

// y-axis (left) ______________________________
// Build yText details 


yText .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

yText .append("text")
    .attr("y", 22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Healthcare (%)");
    
// Visualize data  _______________________________________  
// Define dynamic circle radius
let cRadius;
function adjustRadius() {
  if (width <= 530) {
    cRadius = 7;}
  else { 
    cRadius = 10;}
}
adjustRadius();

// Read in data as promise... and then... newer d3.js method
d3.csv("static/data/data.csv").then(function(data) {
    view(data);
});

function view (healthData) {
   let xMin;
   let xMax;
   let yMin;
   let yMax;

   // Current X & Y default selections
   let currentX = "poverty";
   let currentY = "healthcare";

   // Tool Tip info box (state, X stats,  Y stats)
   let toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
            //Build text box
            let stateLine = `<div>${d.state}</div>`;
            let yLine = `<div>${currentY}: ${d[currentY]}%</div>`;
            if (currentX === "poverty") {
                xLine = `<div>${currentX}: ${d[currentX]}%</div>`}          
            else {
                xLine = `<div>${currentX}: ${parseFloat(d[currentX]).toLocaleString("en")}</div>`;}             
            return stateLine + xLine + yLine  
        });

    // Add toolTip to svg
    svg.call(toolTip);

    // Update upon axis option clicked
    function  labelUpdate(axis, clickText) {
        // Switch active to inactive
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
    
        // switch the text just clicked to active
        clickText.classed("inactive", false).classed("active", true);
        }

    // Find the data max & min values for scaling
    function xMinMax() {
      xMin = d3.min(healthData, function(d) {
        return parseFloat(d[currentX]) * 0.85;
      });
      xMax = d3.max(healthData, function(d) {
        return parseFloat(d[currentX]) * 1.15;
      });     
    }

    function yMinMax() {
      yMin = d3.min(healthData, function(d) {
        return parseFloat(d[currentY]) * 0.85;
      });
      yMax = d3.max(healthData, function(d) {
        return parseFloat(d[currentY]) * 1.15;
      }); 
    }

    // Scatter plot X & Y axis computation
    xMinMax();
    yMinMax();

    let xScale = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    let yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])

    // Create scaled X and Y axis
    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);

    // Calculate X and Y tick counts
    function tickCount() {
      if (width <= 500) {
         xAxis.ticks(5);
         yAxis.ticks(5);
      }
      else {
          xAxis.ticks(10);
          yAxis.ticks(10);
      }        
    }
    tickCount();

    // append axis to the svg as group elements
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labelArea})`
        );

    svg.append("g")
        .call(yAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            ${margin + labelArea}, 
            0 )`
        );

    // Append the circles for each row of data
    let allCircles = svg.selectAll("g allCircles").data(healthData).enter();

    allCircles.append("circle")
        .attr("cx", function(d) {
            // xScale figures the pixels
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", cRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d) {
            // Show tooltip when mouse is on circle
            toolTip.show(d, this);
            // Highlight circle border
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {
            // Remove the tooltip
            toolTip.hide(d);
            // Remove the highlight
            d3.select(this).style("stroke", "#e3e3e3")
        });

        // Apply state text on circles (dx & dy are locations)
        allCircles
            .append("text")
            .attr("font-size", cRadius)
            .attr("class", "stateText")

            .attr("dx", function(d) {
               return xScale(d[currentX]);
            })
            .attr("dy", function(d) {
              // Push text to center by a 1/3
              return yScale(d[currentY]) + cRadius /3;
            })
            .text(function(d) {
                return d.abbr;
              })

            .on("mouseover", function(d) {
                toolTip.show(d);
                d3.select("." + d.abbr).style("stroke", "#323232");
            })

            .on("mouseout", function(d) {
                toolTip.hide(d);
                d3.select("." + d.abbr).style("stroke", "#e3e3e3");
            });

          // Dynamic graph on click
          d3.selectAll(".aText").on("click", function() {
              let self = d3.select(this)

              // Select inactive
              if (self.classed("inactive")) {
                // Obtain name and axis saved in the label
                let axis = self.attr("data-axis")
                let name = self.attr("data-name")

                if (axis === "x") {
                  currentX = name;

                  // Update min and max of domain (x)
                  xMinMax();
                  xScale.domain([xMin, xMax]);

                  svg.select(".xAxis")
                        .transition().duration(800)
                        .call(xAxis);
                  
                  // Update location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cx", function(d) {
                            return xScale(d[currentX])                
                        });
                  });   

                  d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("dx", function(d) {
                            return xScale(d[currentX])                          
                        });
                  });          
                  // Update
                  labelUpdate(axis, self);
                }

                 // Update for Y axis selection 
                else {
                  currentY = name;

                  // Update min and max of range (y)
                  yMinMax();
                  yScale.domain([yMin, yMax]);

                  svg.select(".yAxis")
                        .transition().duration(800)
                        .call(yAxis);

                  // Update location of the circles
                  d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition().duration(800)
                        .attr("cy", function(d) {
                            return yScale(d[currentY])                
                        });                       
                  });   

                  d3.selectAll(".stateText").each(function() {
                      d3.select(this)
                        .transition().duration(800)
                        .attr("dy", function(d) {
                           // Center text
                            return yScale(d[currentY]) + cRadius/3;                          
                        });
                  });

                  // change the classes of to active and the clicked label
                  labelUpdate(axis, self);
                }
              }
          });
}
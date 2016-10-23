function draw(data) {
    
    //draw linecharts
    function linechart(data, index, num) {
        
         //Update Y axis
        svg.select(".y.axis")
           .transition()
              .duration(1000)
              .delay(num*3000)
              .ease("linear")
           .call(yAxis.ticks(10));

        //Update chart subtitle
        d3.select("#subtitle")
          .transition()
              .duration(1000)
              .delay(num*3000)
          .text("Income Range: " + index)
          .style("opacity", 0.9);
        
        // Define line
        var line = d3.svg.line()
                     
                     .x(function(d) {
                            return x(d['LoanOriginationQuarter']);
                     })
                     .y(function(d) {
                            return y(d['BorrowerRate']);
                     })
                     .interpolate("cardinal");

        //Add line chart 
        var line_chart = svg.append("path")
                            .attr("class", "chart")
                            .attr("id", IncomeRange[index])
                            .attr("d", line(data))
                            .attr("stroke", "steelblue")
                            .attr("stroke-width", "2")
                            .attr("fill", "none");


        var totalLength = line_chart.node().getTotalLength();

        line_chart
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
                .duration(3000)
                .delay(num*3000)               
                .ease("linear")
                .attr("stroke-dashoffset", 0)
            .transition()
                .duration(1000)
                .attr("stroke", "lightgrey")
                .attr("stroke-width", 1);

        d3.select("#subtitle")
          .transition()
              .duration(1000)
              .delay(num*3000+4000)
          .style("opacity", 0);
    }
    
    //Update line information
    function updatechart(id) {
        var subtitle = nested[parseInt(id[1])].key
        d3.select("#subtitle")
          .transition()
              .duration(800)
              .delay(500)
          .text("Income Range: " + subtitle)
          .style("opacity", .9)
    }

    //Mouse click event function
    function clicked(id) {
        var color = d3.select("#"+id)
                      .attr("stroke");
        
        if (color == "olive" || color == "#d3d3d3") {  
              //Active the line
              d3.select("#"+id)
                .transition()
                  .duration(100)
                .attr("stroke", colors[id[1]])
                .attr("stroke-width", 2); 

              //Active the circles
              circles.each(function(d) {
                  if (IncomeRange[d['IncomeRange']] == id) { 
                      d3.select(this)
                        .attr("r", 2.5);
                  }
              });

              //Active related table cell
              d3.selectAll("td")
                .each(function() {                  
                    var cell = d3.select(this)
                                 .datum();
                    if (IncomeRange[cell] == id) {
                      d3.select(this)
                        .style("background-color", "cadetblue")
                        .style("color", "white");
                    }
                });
              
              //Render selected legend's element
              d3.select("#l_"+id)
                .transition()
                  .duration(100)
                .selectAll("rect, text")
                  .style("opacity", .9)

          }
          else {
              //Deactive the line
              d3.select("#"+id)
                .transition()
                  .duration(100)
                .attr("stroke", "#d3d3d3")
                .attr("stroke-width", 1); 
            
              //Hide the cycles
              circles.each(function(d) {
                      if (IncomeRange[d['IncomeRange']] == id) { 
                          d3.select(this)
                            .attr("r", 0);
                      }
              });

              //Hide the Legend's element
              d3.select("#l_"+id)
                .transition()
                  .duration(100)
                .selectAll("rect, text")
                  .style("opacity", 0);

              //Deactive the cell
              d3.selectAll("td")
                .each(function() {                  
                    //Get cell value
                    var cell = d3.select(this)
                                 .datum();
                    //Update selected cell background color
                    if (IncomeRange[cell] == id) {
                        d3.select(this)
                          .style("background-color", null)
                          .style("color", null);
                    }
                })

              //Hide the tooltip
              d3.select("#tooltip")
                .classed("hidden", true);
          }
    }

    // Get Quarter-Year value for sorting x-axis
    function qval(quarterString) {
        var qv, parts;
        parts = quarterString.match(/^Q(\d) (\d{4})$/);
        qv = (parseInt(parts[2]) * 4) + parseInt(parts[1]);
        return qv;
    }

    // Line Color selector
    function color_selector(n) {
        var colors = ["cadetblue", "deepskyblue", "royalblue", "steelblue", "mediumblue", "mediumslateblue"];
        return colors[n];
    } 

//----------------------------------------------Main Part Start---------------------------------------------// 

    // Add the svg canvas
    var margin = 75,
        width = 1200 - margin,
        padding = 200,
        top_padding = 170,
        right_padding = 200,
        height = 650 - margin;
        colors = ["cadetblue", "deepskyblue", "royalblue", "steelblue", "mediumblue", "mediumslateblue", "gold"];
    // Add svg range  
    var svg = d3.select("body")
                .append("svg")
                .attr("width", width + margin)
                .attr("height", height + margin);    
    
    //line chart title mapping
    var IncomeRange = {
                        "Not employed": "l3",
                        "$1-24,999": "l0",
                        "$25,000-49,999": "l5",
                        "$50,000-74,999": "l1",
                        "$75,000-99,999": "l2",
                        "$100,000+": "l4",
                        "Average Rate": "l6"
                      };

    //Sort data by Quarter-Year  
    var data = data.sort(function(a, b) {
                   return qval(a['LoanOriginationQuarter']) - qval(b['LoanOriginationQuarter']);
                 });

    //Nested data by IncomeRange
    var nested = d3.nest()
                     .key(function(d) {
                          return d['IncomeRange'];
                      })
                     .entries(data);

    var avg_rate = d3.nest()
                     .key(function(d) {
                          return d['LoanOriginationQuarter'];
                     })
                     .rollup(function(leaves) {
                          var avg_borrower_rate = d3.mean(leaves, function(d) {
                                return d['BorrowerRate'];
                          });
                          return {'Avg_Borrower_Rate' : Math.round(avg_borrower_rate)
                                 }
                     })
                     .entries(data);

    //Define X/Y Scale and X/Y Axes
    var x =  d3.scale.ordinal()
                    .domain(data.map(function(d) {
                                return d['LoanOriginationQuarter'];
                    }))
                    .rangeBands([padding, width-right_padding], 0.01); 

    var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient("bottom");

    var y = d3.scale.linear()
                    .domain([8, 2+d3.max(data, function(d) {
                        return d['BorrowerRate'];
                    })])
                    .range([height, top_padding]);

    var yAxis = d3.svg.axis()
                  .scale(y)
                  .innerTickSize(-(width-padding-right_padding))
                  .outerTickSize(0)
                  .orient("left");

    //Add X Axis
    svg.append("g")
           .attr("class", "x axis")
           .attr("transform", "translate(0, "+ (height) + ")")
           .call(xAxis)
           .selectAll("text")
                  .style("text-anchor", "end")
                  .attr("dx", "4.5em")
                  .attr("dy", ".7em")
                  .attr("transform", "rotate(90)" )
    
    //Add Y Axis & Label      
    svg.append("g")
           .attr("class", "y axis")
           .attr("transform", "translate("+(padding)+", 0)")
           .call(yAxis)
           .append("text")
            .text("Borrower Rate (%)")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -10)
            .attr("x", 0 - height / 2)
            .attr("dy", "-2.5em")
            .style("text-anchor", "end")
            .style("font-size","18px");

    // Draw all lines by different IncomeRange
    nested.forEach(function(d, i) {
        linechart(d.values, d.key, i+1);
    });

    // Draw Average Borrower Rate line
     var Avg_line = d3.svg.line()                    
                     .x(function(d) {
                            return x(d['key']);
                     })
                     .y(function(d) {
                            return y(d.values['Avg_Borrower_Rate']);
                     })
                     .interpolate("cardinal");
    //Add line
    svg.append("path")
       .attr("class", "chart")
       .attr("id", "Avg_Borrower_Rate")
       .attr("d", Avg_line(avg_rate))
       .attr("stroke", "gold")
       .attr("stroke-width", "2")
       .attr("fill", "none");  

     d3.select(".side_text")
          .select("p") 
          .transition()
              .duration(1000)
              .delay(6*3000+5000)
          .style("opacity", .9);

    //Draw Borrower Rate circles
    var circles = svg.append("g")
                     .attr("class", "circles")
                     .selectAll("circle")
                     .data(data)
                     .enter()
                     .append("circle")
                     .attr("cx", function(d){
                                    return x(d['LoanOriginationQuarter']);
                                 })
                     .attr("cy", function(d){
                                    return y(d['BorrowerRate']);
                                 })
                     .attr("r", 0)
                     .attr("fill", function(d) {
                                    id = IncomeRange[d['IncomeRange']];
                                    return colors[id[1]];
                                   });
     //Add line's Legend
     var legend = svg.selectAll(".Legend")
                    .data(d3.keys(IncomeRange))  
                    .enter()  
                    .append("g")
                    .attr("class", "legend")
                    .attr("id", function(d) { 
                        return "l_"+ IncomeRange[d];
                    })   
                    .attr("transform", function(d, i) {  
                        var legendX = width-right_padding + 10;   //set position for each legend element  
                        var legendY = top_padding +10 + i*15;  
                        return "translate(" + legendX + ", " + legendY + ")"; 
                    }); 
     //Add legend's elements colors     
    legend.append("rect")  
        .attr("x", 0)  
        .attr("y", 1)  
        .attr("width", 16)  
        .attr("height", 8)  
        .style("fill", function(d) {
           id = IncomeRange[d];
           return colors[id[1]];
        })
        .style("opacity", 0); 
    
    //Add legend's elements texts  
    legend.append("text")  
        .attr("x", 20)  
        .attr("y", 9)  
        .classed("legendtext", true)  
        .text(function(d) {  
           return d; 
        })
        .style("opacity", 0);   

    //Render average line legend element
    d3.select("#l_l6")
                .transition()
                  .duration(100)
                .selectAll("rect, text")
                  .style("opacity", .9)

    //Add chart note
    var note = "Prosper, a P2P lending platform, " +
               "was shut down by the SEC in Q4 2008, " +
               "and restarted the business in Q2 2009. " + 
               "The chart shows quarterly average " +
               "rate for different income ranges." ;

    var chart_tip = d3.select("body")
                      .append("div")
                      .attr("class", "chart_tip")
                      .html(note);

    //Add circles' tooltip
    var circle_tooltip = d3.select("body")
                           .append("div")
                           .attr("class", "circle_tooltip")
                           .style("opacity", 0);

    //Add mouse event function for lines
    svg.selectAll(".chart")
       .on("mouseover", function(){
                          var color = d3.select(this)
                                        .attr("stroke");
                          
                          var id = d3.select(this)
                                        .attr("id");

                          var subtitle = nested[parseInt(id[1])].key

                          if (color == "#d3d3d3") {
                                d3.select(this)
                                  .attr("stroke", "olive")
                                  .attr("stroke-width", 2);

                                updatechart(id);
                          }
                          //Get mouse cursor current x/y values, then augment for the tooltip
                          var xPosition = d3.event.pageX + 10;
                          var yPosition = d3.event.pageY + 5;

                          //Update the tooltip position and value
                          d3.select("#tooltip")
                            .style("left", xPosition + "px")
                            .style("top", yPosition + "px")
                            .select("#value")
                            .text(subtitle);

                          //Show the tooltip
                          d3.select("#tooltip")
                            .classed("hidden", false);                          
                        })
       .on("mouseout", function() {
                          var color = d3.select(this)
                                        .attr("stroke");

                          if (color == "olive") {
                              d3.select(this)
                                .transition()
                                    .duration(100)
                                .attr("stroke", "#d3d3d3")
                                .attr("stroke-width", 1);
                           }
                           //Hide subtitle
                           d3.select("#subtitle")
                             .transition()
                                .duration(500)
                                .delay(100)
                             .style("opacity", 0);

                          //Hide the tooltip
                          d3.select("#tooltip")
                            .classed("hidden", true);
                    })
       .on("click", function() {
                    var id = d3.select(this)
                               .attr("id");                          
                    clicked(id);
        });

    // Add mouse even function for circles
    circles
       .on("mouseover", function(d) {
            //Get mouse cursor current x/y values, then augment for the tooltip
            var xPosition = d3.event.pageX + 10;
            var yPosition = d3.event.pageY + 5;
            
            var subtitle = d['IncomeRange'];

            d3.select(this)
              .transition()
                  .duration(500)
              .attr("r", 6);
              
            //Show circle's tooltip
            circle_tooltip.transition()
                              .duration(200)
                          .style("opacity", .9);

            //Update the tooltip position and value
            circle_tooltip.html("<strong>" + subtitle + "</strong>" 
                                + "<br/>" + d['LoanOriginationQuarter']
                                + ": " + d['BorrowerRate'] +"%")
                          .style("left", xPosition + "px")
                          .style("top",  yPosition + "px");
       })
       .on("mouseout", function() {
            
            //Hide the tooltip
            circle_tooltip.transition()
                              .duration(200)
                          .style("opacity", 0);

            d3.select(this)
              .transition()
                  .duration(500)
              .attr("r", 2.5);
             
       });   

       //Add click event function for table cells
       d3.selectAll("td")
         .on("click", function() {

            var cell = d3.select(this)
                           .datum();
  
              //Update linechart
            clicked(IncomeRange[cell]);
        });
};

// Get the data
d3.csv("./data/quarter_ProsperLoanData.csv", function(d) {
                        d['BorrowerRate'] = Math.round(+d['BorrowerRate']*1000) / 10; 
                        return d;
}, draw);  


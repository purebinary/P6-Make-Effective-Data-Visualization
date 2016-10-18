function draw(data) {
    
    //draw linecharts
    function linechart(data, index, num) {
        
        y.domain([0, d3.max(data, function(d) {
                        return d.values[index];
                    })]);
        
         //Update Y axis
        svg.select(".y.axis")
           .transition()
              .duration(1000)
              .delay(num*3000)
              .ease("linear")
           .call(yAxis.ticks(10));

        //Update Y label
        svg.select(".label")
           .transition()
              .duration(1000)
              .delay(num*3000)
              .ease("linear")
           .text(lookup[index]);

        //Update chart subtitle
        d3.select("#subtitle")
          .transition()
              .duration(1000)
              .delay(num*3000)
          .text("Current:  " + lookup[index]);
        
        // Define line
        var line = d3.svg.line()
                     
                     .x(function(d) {
                          return x(d['key']);
                     })
                     .y(function(d) {
                          return y(d.values[index]);
                     })
                     .interpolate("cardinal");

        //Add line chart 
        var line_chart = svg.append("path")
                       .attr("class", "chart ")
                       .attr("id", index)
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

        svg.select(".y.axis")
           .transition()
              .duration(2000)
              .delay(num*3000+3000)
              .ease("linear")
           .call(yAxis.ticks(0)); 

        svg.select(".label")
           .transition()
              .duration(3000)
              .delay(num*3000+4000)
              .ease("linear")
           .text("");

        d3.select("#subtitle")
          .transition()
              .duration(1000)
              .delay(num*3000+4000)
          .text("Current:");           
    }
    
    //Update chart's Y axis and label
    function updatechart(data, index) {

        y.domain([0, d3.max(data, function(d) {
                                return d.values[index];
                    })]);
        
         //Update Y axis
        svg.select(".y.axis")
           .transition()
              .duration(800)
              .delay(500)
              .ease("linear")
           .call(yAxis.ticks(10));

        //Update Y label
        svg.select(".label")
           .transition()
              .duration(800)
              .delay(500)
              .ease("linear")
           .text(lookup[index]);
        
        //Update subtile
        d3.select("#subtitle")
          .transition()
              .duration(800)
              .delay(500)
          .text("Current:  " + lookup[index]);
    }
    //Mouse click event function
    function clicked(data, index) {
        //Inactive previous clicked line chart and circles
        if (isClick) {
            var color = d3.select("#"+index)
                            .attr("stroke");
            if (color != "steelblue") {
                 d3.select("#"+pre_index)
                   .transition()
                     .duration(100)
                   .attr("stroke", "lightgrey")
                   .attr("stroke-width", 1); 
               
                 circles.attr("r", 0); 
              }                           
            }
          
          //Active click linechart
          d3.select("#"+index)
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2);

          //Active related table cell
          d3.selectAll("td")
            .each(function() {
              
              //Get cell value
              var cell = d3.select(this)
                           .datum();
              var sub_str = lookup[index].substr(0, cell.length);
              
              //Update selected cell background color
              if (cell == sub_str) {
                d3.select(this)
                  .style("background-color", "cadetblue")
                  .style("color", "white");
              }
              else {
                d3.select(this)
                  .style("background-color", null)
                  .style("color", null);
              }
            });
          
          updatechart(data, index);

          //Add circles on the line chart
          circles.attr("cx", function(d){
                                return x(d['key']);
                             })
                 .attr("cy", function(d){
                                return y(d.values[index]);
                             })
                 .attr("r", 3)
                 .attr("fill", "steelblue")
                 .transition()
                    .duration(3000)
                    .delay(1000)
                 .text(function(d) {
                        return lookup[index] + Math.round(d.values[index]);
                      });

          isClick = true;
          pre_index = index;
    }

    function year_avg(leaves) {
          var avg_borrower_rate = d3.mean(leaves, function(d) {
              return d['BorrowerRate'];
          });

          var avg_monthly_income = d3.mean(leaves, function(d) {
              return d['StatedMonthlyIncome'];
          });

          var avg_monthly_payment = d3.mean(leaves, function(d) {
              return d['MonthlyLoanPayment']
          });

          var total_amount = d3.sum(leaves, function(d) {
              return d['LoanOriginalAmount'];
          }); 

          var total_payment = d3.sum(leaves, function(d) {
              return d['LP_CustomerPayments'];
          }); 

          var total_interest = d3.sum(leaves, function(d) {
              return d['LP_InterestandFees'];
          });

          return {
            'Avg_Borrower_Rate' : avg_borrower_rate * 100,
            'Avg_Monthly_Income' : avg_monthly_income,
            'Avg_Monthly_Payment' : avg_monthly_payment,
            'Total_Amount' : total_amount / 1000000.0,
            'Total_Payment': total_payment / 100000.0,
            'Total_Interest': total_interest / 1000000.0,
          };
    }

// Adds the svg canvas
    var margin = 75,
        width = 960 - margin,
        padding = 150,
        height = 600 - margin;

    var svg = d3.select("body")
                .append("svg")
                .attr("width", width + margin)
                .attr("height", height + margin);    

    //line chart title mapping
    var lookup = {
            Avg_Borrower_Rate: 'Average Borrower Rate (%)',
            Avg_Monthly_Payment: 'Average Monthly Payment (USD)',
            Avg_Monthly_Income: 'Average Monthly Income (USD)',
            Total_Amount: 'Total Loan Amount (M.USD)',
            Total_Payment: 'Total Customer Payments (M.USD)',
            Total_Interest: 'Total Interest & Fees (M.USD)',
           };
    
    //Nest entries by year
    var nested = d3.nest()
                     .key(function(d) {
                        return d['LoanOriginationDate'].getUTCFullYear();
                     })
                     .rollup(year_avg)
                     .entries(data);
    
    //Range, Scale & Axes
    var x =  d3.scale.linear()
                    .domain(d3.extent(nested, function(d){
                                return d['key'];
                    }))
                    .range([padding, width]);
    var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient("bottom");
    var y = d3.scale.linear()
                    .range([height,padding-80]);
    var yAxis = d3.svg.axis()
                  .scale(y)
                  .innerTickSize(-(width-padding))
                  .outerTickSize(0)
                  .orient("left");

    //Add X Axis
    svg.append("g")
           .attr("class", "x axis")
           .attr("transform", "translate(0, "+ (height) + ")")
           .call(xAxis);
    
    //Add Y Axis & Label      
    svg.append("g")
           .attr("class", "y axis")
           .attr("transform", "translate("+(padding)+", 0)")
           .call(yAxis)
           .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -10)
            .attr("x", 0 - height / 3)
            .attr("dy", "-2.5em")
            .style("text-anchor", "end");
    
    //draw line charts
    var i = 0;
    for (index in lookup) { 
        linechart(nested, index, i);
        i ++;
    };

    var isClick = false;
    var pre_index = "";

    //Add Circles
    var circles = svg.append("g")
                     .attr("class", "circles")
                     .selectAll("circle")
                     .data(nested)
                     .enter()
                     .append("circle");

    //Add circles' tooltip
    var circle_tooltip = d3.select("body")
                           .append("div")
                           .attr("class", "circle_tooltip")
                           .style("opacity", 0);

    //Add mouse event function for linecharts 
    svg.selectAll(".chart")
       .on("mouseover", function(){
                          var color = d3.select(this)
                                        .attr("stroke");
                          
                          var index = d3.select(this)
                                        .attr("id");

                          if (color != "steelblue") {
                                d3.select(this)
                                  .attr("stroke", "olive")
                                  .attr("stroke-width", 2);

                                updatechart(nested, index);
                          }
                          //Get mouse cursor current x/y values, then augment for the tooltip
                          var xPosition = d3.event.pageX + 10;
                          var yPosition = d3.event.pageY + 5;

                          //Update the tooltip position and value
                          d3.select("#tooltip")
                            .style("left", xPosition + "px")
                            .style("top", yPosition + "px")
                            .select("#value")
                            .text(lookup[index]);

                          //Show the tooltip
                          d3.select("#tooltip").classed("hidden", false);                          
                        })
       .on("mouseout", function() {
                          var color = d3.select(this)
                                        .attr("stroke");

                          var sw_text = "Current:  ";
                          if (color != "steelblue") {
                              d3.select(this)
                                .transition()
                                    .duration(100)
                                .attr("stroke", "lightgrey")
                                .attr("stroke-width", 2);
                                                                 
                              y.domain([0, d3.max(nested, function(d) {
                                return d.values[pre_index];
                              })]);
                              
                              //Update Y axis
                              svg.select(".y.axis")
                                 .transition()
                                    .duration(800)
                                    .delay(500)
                                    .ease("linear")
                                 .call(yAxis.ticks(10)); 
                              
                              //Update Y label
                              svg.select(".label")
                                 .transition()
                                    .duration(800)
                                    .delay(500)
                                    .ease("linear")
                                 .text(lookup[pre_index]);

                              if (isClick) {
                                  sw_text += lookup[pre_index];                                        
                              }
                              //update subtile
                              d3.select("#subtitle")
                                    .transition()
                                      .duration(800)
                                      .delay(500)
                                    .text(sw_text);
                          } 
                          //Hide the tooltip
                          d3.select("#tooltip").classed("hidden", true);
                    })
       .on("click", function() {
                    var index = d3.select(this)
                                  .attr("id");                          
                    clicked(nested, index);
        });

    // Add mouse even function for circles
    circles
       .on("mouseover", function(d) {
            //Get mouse cursor current x/y values, then augment for the tooltip
            var xPosition = d3.event.pageX + 10;
            var yPosition = d3.event.pageY + 5;

            d3.select(this)
              .transition()
                  .duration(500)
              .attr("r", 6)
              .attr("fill", "red");

            //Show circle's tooltip
            circle_tooltip.transition()
                              .duration(200)
                          .style("opacity", .9);

            //Update the tooltip position and value
            circle_tooltip.html("<strong>" + lookup[pre_index] + "</strong>" 
                                           + "<br/>" + d['key']+ ":     " 
                                           + Math.round(d.values[pre_index]*100) / 100)
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
              .attr("r", 3)
              .attr("fill", "steelblue");
       });   

       //Add click event function for table cells
       d3.selectAll("td")
         .on("click", function() {

              var cell = d3.select(this)
                           .datum();
              for (entry in lookup) { 
                  var sub_str = lookup[entry].substr(0, cell.length);
                  if (cell == sub_str) {
                     index = entry;
                  }                       
              }
              //Update linechart
              clicked(nested, index);
        });
};


// Format the date / time
var format = d3.time.format("%Y-%m-%d %H:%M:%S");

// Get the data
d3.csv("./data/LoanData.csv", function(d) {
                        d['BorrowerRate'] = +d['BorrowerRate'];
                        d['MonthlyLoanPayment'] = +d['MonthlyLoanPayment'];
                        d['StatedMonthlyIncome'] = +d['StatedMonthlyIncome'];
                        d['LoanOriginalAmount'] = +d['LoanOriginalAmount'];
                        d['LP_CustomerPayments'] = +d['LP_CustomerPayments'];
                        d['LP_InterestandFees'] = +d['LP_InterestandFees'];
                        d['LoanOriginationDate'] = format.parse(d['LoanOriginationDate']);
                        return d;
}, draw);  


var div = d3.select("body")
                .append("div")
                .attr("class", "table")
                .attr("width", 960)
                .attr("height",80);
                
var side_text = div.append("side_text")
                   .attr("class", "side_text")
                   .append("h2")
                      .text("Prosper Loan Line Chart");
                      
d3.select(".side_text")
  .append("h2")
  .attr("id", "subtitle")
  .text("Current:");

d3.select(".side_text")
  .append("p")
  .text("Click table item or Line for detail");

var table = div.append("table");
var thead = table.append("thead");
var tbody = table.append("tbody");

//table cell data
var item = [
    ['Average Borrower Rate', 'Total Loan Amount'],
    ['Average Monthly Payment', 'Total Customer Payments'],
    ['Average Monthly Income', 'Total Interest & Fees']
    ];

// create the table header
thead.selectAll("th")
     .data(["Average", "Total"])
     .enter()
     .append("th")
     .text(function(d) {return d;});

// fill the table
// create rows
var tr = tbody.selectAll("tr")
     .data(item)
     .enter()
     .append("tr")
// cells
var td = tr.selectAll("td")
      .data(function(d){return d;})
      .enter()
      .append("td")
      .text(function(d) {return d;})
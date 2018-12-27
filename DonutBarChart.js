//Alberto Calvo Madurga

//Formats
var margin = {top: 60, right: 20, bottom: 30, left: 40},
w = 1300 - margin.left - margin.right,
h = 600 - margin.top - margin.bottom;

var width = w + margin.left + margin.right
var height = h + margin.top + margin.bottom

var radius=150;
var cx =650;
var cy =200;

//Start colours
var color = d3.scaleOrdinal()
    .range(["blue","lightblue"]);

//Transformations
var x = d3.scaleBand().rangeRound([0,w]).padding(.1)
var y = d3.scaleLinear().range([h, 0]);

//Donut settings
var arc = d3.arc()
  .outerRadius(radius)
  .innerRadius(radius-50)
  .padAngle(.02)
  .padRadius(100)
  .cornerRadius(4);

// Generate donut chart
var pie = d3.pie()
      .sort(null)
      .value(function(d) {
        return d.population;});

//Elements
var svg = d3.select("body").append("svg")
.attr("width",width)
.attr("height",height )
.append("g")
.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

//Axis
var xAxis = d3.axisBottom(x)
var yAxis = d3.axisLeft(y).ticks(6)
var yGrid = d3.axisLeft(y)
.ticks(5)
.tickSize(-w, 0, 0)
.tickFormat("");

//Lecture of the data
d3.csv("DatosFinales.csv", function(error, data) {
var sum = 0;
data.forEach(function(d) {
  d.salario = +d.salario;
  sum += d.salario;
  d.golesExt = +d.golesExt;
  d.golesEsp = +d.golesEsp;
  d.abrv=d.abrv;

  //Giving format desired to data
  color.domain(d3.keys(data[0]).filter(function(key) {
    if(key =="golesEsp" || key =="golesExt"){
      return key;
    }
  }));
});

data.forEach(function(d){
  d.goals = color.domain().map(function(name) {
    return {id:d.equipo, name, population: +d[name]};
  });
});

//Map domain
x.domain(data.map(function(d) { return d.abrv; }));
y.domain([0,600])

//Axis settings
svg.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0, " + h + ")")
.call(xAxis);

svg.append("g")
.attr("class", "y axis")
.call(yAxis);

svg.append("g")
.attr("class", "grid")
.call(yGrid);

var labels = svg.append("g")
.attr("class", "labels");

labels.append("text")
.attr("id","yaxisname")
//.attr("dy", ".20em")
.attr("dx", ".30em")
.text("Salarial");

labels.append("text")
.attr("id","yaxisname2")
.attr("dy", "-.8em")
.attr("dx", ".30em")
.text("Límite");

//Title settings
var title = svg.append("g")
.attr("class", "title");
title.append("text")
.attr("x", (w / 2))
.attr("y", -30 )
.attr("text-anchor", "middle")
.text("Límite Salarial - Procedencia Goles");
title.append("text")
.attr("x", (w / 2))
.attr("y", -5 )
.attr("text-anchor", "middle")
.text("Liga Santander 17/18");

//Legend settings - Library d3-legend
var ordinal = d3.scaleOrdinal()
  .domain(["Campeón de la Liga Santander", "Clasificado para la Champions League", "Clasificado para la Europa League", "Permanencia en la categoría","Descenso a segunda división"])
  .range([ "gold", "navy", "darkorange","greenyellow","red"]);

svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(150,20)");

var legendOrdinal = d3.legendColor()
  .shapePadding(2)
  .cellFilter(function(d){ return d.label !== "e" })
  .scale(ordinal)

svg.select(".legendOrdinal")
  .call(legendOrdinal);




//Bar settings
var bars =svg.selectAll(".bar")
.data(data)
.enter().append("rect")
.attr("class", "bar")
.attr("rx",4)
.attr("id",function(d){return d.equipo})
.attr("x", function(d) { return x(d.abrv); })
.attr("width", x.bandwidth())
.attr("y",function(d,i){ return h;})
.attr("height",0)
.attr("fill",function(d){return d.colpos;})
.attr("opacity",1)
.on("mouseover", handleMouseOver)
.on("mouseout", handleMouseOut)

//Initial transition for the bars
bars.transition().duration(1000)
.attr("y",function(d,i){ return y(d.salario);})
.attr("height",function(d) { return h - y(d.salario); })
//.attr("stroke", "black");


//Event Handlers for mouse
function handleMouseOver(d){

  // Specify where to put the bar label
  svg.append("text")
    .attr("id","etiq")
    .attr("x", function(pos) { return x(d.abrv)+x.bandwidth()/2; })
    .attr("y",function(){ return [y(d.salario)-5];})
    .attr("text-anchor","middle")
    .text(function() {return [d.salario]; });

    //Opacity changes
    var clicked = this

    var active = this.active? false: true;

    bars.filter(function(){return  clicked!=this})
    .style("opacity",0.5)

    this.active=active;

    //Colors that represent the teams
    var teamcolours = d3.scaleOrdinal()
      .domain(["Goles anotados por delanteros extranjeros","Goles anotados por delanteros españoles"])
      .range([[d.col1],[d.col2]]);

    //Colors of the team with mouseover
    var actcol1=[d.col1]
    var actcol2=[d.col2]

    var actteamcolours = d3.scaleOrdinal()
      .domain(["Goles anotados por delanteros extranjeros","Goles anotados por delanteros españoles"])
      .range([actcol1,actcol2]);

    //Pie colours legend
    var ordinalPie = d3.scaleOrdinal()
      .domain(["Goles anotados por delanteros extranjeros","Goles anotados por delanteros españoles"])
      .range(["blue","lightblue"]);

    svg.append("g")
      .attr("class", "legendOrdinalPie")
      .attr("transform", "translate("+(cx+radius+20)+","+(cy-radius/2+120)+")")


    var legendOrdinalpie = d3.legendColor()
      .shapePadding(2)
      .cellFilter(function(d){ return d.label !== "e" })
      .scale(actteamcolours);

    svg.select(".legendOrdinalPie")
      .call(legendOrdinalpie);

    //Pie legend visible
    d3.select(".legendOrdinalPie")
    .attr("opacity",1)

    //Information about the team
    svg.append("text")
    .attr("class","equipo")
    .attr("id","equipo")
    .attr("x",cx+radius+20)
    .attr("y",cy-radius/2)
    .text(function(){return("Equipo: "+[d.equipo]);});

    svg.append("text")
    .attr("class","golExt")
    .attr("id","golExt")
    .attr("x",cx+radius+20)
    .attr("y",cy-radius/2+25)
    .text(function(){return("Goles anotados por\n delanteros extranjeros: "+[d.golesExt]);});

    svg.append("text")
    .attr("class","golEsp")
    .attr("id","golEsp")
    .attr("x",cx+radius+20)
    .attr("y",cy-radius/2+50)
    .text(function(){return("Goles anotados por delanteros españoles: "+[d.golesEsp]);});

    svg.append("text")
    .attr("class","pos")
    .attr("id","pos")
    .attr("x",cx+radius+20)
    .attr("y",cy-radius/2+75)
    .text(function(){return("Posición en la temporada 17/18: "+[d.pos]+"º");});

    // Selecting the id of the bar clicked, related with one only team
    var equiposel=d3.select(this).attr("id")

    //Filtering the data for the team selected
    var filtrado =data.filter(function(d){return d.equipo===equiposel;})

    svg.data(filtrado).enter()

    //Insert badge of the team
    svg.append("svg:image")
             .attr("id","image")
             .attr("xlink:href",function(d){return [d.url]})
             .attr("width", 120)
             .attr("height", 120)
             .attr("x", cx-radius/2.5)
             .attr("y",cy-radius/2.5)
             .attr("opacity",1)

    //Arcs for the pie
    var arcs = svg.selectAll(".arc")
        .data(function(d) {return pie(d.goals); })
        .enter().append("path")
        .attr("class", "arc")
        .attr("id",function(d,i){return "arc"+i; })
        .attr("d", arc)
        .attr("transform", "translate("+cx+","+cy+")")
        .style("fill", function(d) { return teamcolours(d.data.name); })
        .each(function(d) { this._current = d; }); // store the initial angles;;

}

function handleMouseOut(d){

  //Change color back to normal
  d3.select(this).attr("fill",function(d){return d.colpos;});

  //Remove the bar label
  d3.select("#etiq").remove()

  //Pie legend invisible
  d3.select(".legendOrdinalPie")
  .attr("opacity",0)

  //Opacity changes
  var clicked = this
  var active = this.active? false: true;

  bars.filter(function(){return  clicked!=this})
  .style("opacity",1)

  this.active=active;

  //Removals actual pie
  d3.select("#arc0").remove()
  d3.select("#arc1").remove()
  d3.select("#equipo").remove()
  d3.select("#golEsp").remove()
  d3.select("#golExt").remove()
  d3.select("#pos").remove()
  d3.select("#image").remove()
}

});

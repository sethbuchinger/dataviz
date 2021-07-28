var HEIGHT,WIDTH,MARGINS

var dataset;
var projDataset;
var subActGrouped;
var subProjGrouped;
var subsetActData;
var projSDSDataset;
var subProjSDSGrouped;
// slider
var sMargin = {top:0, right:50, bottom:0, left:50},
    sWidth = 960 - sMargin.left - sMargin.right,
    sHeight = 200 - sMargin.top - sMargin.bottom;

var formatDateIntoYear = d3.timeFormat("%Y");


var startDate = new Date("2010");
var endDate = new Date ( "2020")

var svgSlider = d3.select("#slider")
    .append("svg")
    .attr("width", sWidth + sMargin.left + sMargin.right)
    .attr("height", sHeight);

var x = d3.scaleTime()
    .domain([startDate,endDate])
    .range([0,sWidth])
    .clamp(true)

var slider = svgSlider.append("g")
    .attr("class","slider")
    .attr("transform", "translate(" + sMargin.left + "," + sHeight /2 + ")");


slider.append("line")
    .attr("class","track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function() {return this.parentNode.appendChild(this.cloneNode(true));})
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() { update(x.invert(d3.event.x)); }));

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9)
    .attr("cx",860)

var label = slider.append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDateIntoYear(startDate))
    .attr("transform", "translate(0," + (-25) + ")")


var vis
var color




var tooltip = d3.select('body')
    .append('div')
    .style('position', 'absolute')
    .style('padding', '0 10px')
    .style('background', 'white')
    .style('opacity', 0)
//import csv

var idScene1 = document.getElementById('scene_1');
var idScene2 = document.getElementById('scene_2');
var idScene3 = document.getElementById('scene_3');
var idSlider = document.getElementById('slider');

var idCheckbox1 = document.getElementById('checkbox1');
var idCheckbox2 = document.getElementById('checkbox2');

function drawLegend(dataGroup,colors){
    //initialize legend
    var legendItemSize = 8;
    var legendSpacing = 4;
    var xOffset = 0;
    var yOffset = 5;
    var legend = d3.select('#legend').append('svg')
        .selectAll('.legendItem')
        .data(dataGroup);


    //create legend items
    legend.enter()
        .append('text')
        .attr('x', xOffset + legendItemSize +5)
        .attr('y', (d,i) => yOffset + (legendItemSize + legendSpacing) * i +8)
        .text(d=>d.key);


        legend.enter().append('rect')
            .attr('class', 'legendItem')
            .attr('width', legendItemSize)
            //.attr('id', 'legendItem_', + d.key);
            .attr('height', legendItemSize)
            .attr('fill', function (d, i) {
                return colors(i)
            })
            .attr('transform',
                (d, i) => {
                    var x = xOffset;
                    var y = yOffset + (legendItemSize + legendSpacing) * i;
                    return `translate(${x}, ${y})`;
                });








}




function switchToScene1() {

    //load dive elements
        d3.selectAll("path").remove();
        d3.select('#visualisation').selectAll("circle").remove()
        d3.select('#legend').selectAll("svg").remove()
        idScene1.style.display = 'block';
        idScene2.style.display = 'none';
        idSlider.style.display = 'block';
        idScene3.style.display = 'none';


    //load in scene 1 data
    d3.csv('js/data/IEA-EV-dataEV sales shareCarsHistorical.csv', function (data) {
        parseDate = d3.timeParse("%Y")
        data.forEach(function (d) {
            d.value = +d.value;
            d.year = new Date(+d.year, 0, 1)
        });

        colors = d3.scaleLinear()
            .domain([0, 2, 4, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30, 32, 34])
            .range(["red", "palegreen", "yellow", "blue", "aqua", "coral", "darkviolet", "seagreen", "skyblue", "peachpuff", "royalblue", "magenta", "navy", "olive", "orchid"])

        //console.log(JSON.stringify(dataGroup))
        dataset = data;
        var easeInto = d3.easeLinear;
       var newDuration = 3000;
       var groupedData = groupByCountry(dataset);
        drawLegend(groupedData,colors);
        drawAxes(dataset,70);
        drawPlot(dataset,newDuration,colors);
        axesLabels();




    });

}
//draw the plot
    function groupByCountry(data){
        console.log(data[0])
        return d3.nest()
            .key(function (d) {
                return d.region;
            })
            .entries(data);

    }
    function drawAxes(data,cap){
        // set vars: dimensions and margins of the graph
        var yTicks = 6;
        var xTicks = 11;
        var margin = {top: 20, right: 20, bottom: 20, left: 60},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;


        vis = d3.select("#visualisation"),
            WIDTH = width,
            HEIGHT = height,
            MARGINS = margin,
            lSpace = WIDTH / data.length;




        color = d3.scaleLinear()
            .domain([0, 2, 4, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30, 32, 34])
            .range(["red", "palegreen", "yellow", "blue", "aqua", "coral", "darkviolet", "seagreen", "skyblue", "peachpuff", "royalblue", "magenta", "navy", "olive", "orchid"])

        // set scales and axes

        formatYear = d3.timeFormat("%Y")
        xScale = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return formatYear(d.year);
            }), d3.max(data, function (d) {
                return formatYear(d.year);
            })])
            .range([MARGINS.left * 2, WIDTH - MARGINS.right]),
            yScale = d3.scaleLinear()
                .domain([0, cap])
                .range([HEIGHT - MARGINS.top, MARGINS.bottom]),
            xAxis = d3.axisBottom()
                .scale(xScale)
                .ticks(xTicks, "");

   
        yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(yTicks)
            .tickFormat(d => d + "%");

        // create our axes
        vis.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);
        vis.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            .call(yAxis);


        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(yScale)
                .ticks(yTicks)
        }

        // gridlines in x axis function
        function make_x_gridlines() {
            return d3.axisBottom(xScale)
                .ticks(xTicks)
        }

        // add the Y gridlines
        vis.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat('')
            );



    }

    function drawPlot(data,duration,colors) {
        //console.log(data[0]);

        //nest the data


        var lineGen = d3.line()
            .x(function (d) {
                return xScale(formatYear(d.year));
            })
            .y(function (d) {
                return yScale(d.value);
            })
            //.curve(d3.curveBasis);

        // create the line graph

        groupedData = groupByCountry(data);
        console.log(groupedData[0]);
        groupedData.forEach(function (d, i) {
            var pathData = lineGen(d.values);
            vis.append('path')
                .attr('d', pathData)
                .attr('class', 'line')
                .attr('id', 'line_' + d.key)
                //.select('path').transition().duration(20)
                .attr('stroke-width', 2)
                .attr('stroke', function (d, j) {
                    return colors(i)
                })
                .attr("fill", "none")




                //create hover tooltip
                .on('mouseover', function () {
                    // console.log(d)
                    tooltip.transition().duration(200)
                        .style('opacity', .9)
                    tooltip.html(
                        '<div style="font-family:sans-serif; font-size: 1rem; font-weight: bold">' + d.key + '</div>'
                    )
                        .style('left', (d3.event.pageX - 35) + 'px')
                        .style('top', (d3.event.pageY - 30) + 'px')
                })
                .on('mouseout', function () {
                    tooltip.html('')
                })
                .attr("stroke-dasharray", function (){
                    return pathLength = this.getTotalLength();
                })
                .attr("stroke-dashoffset",pathLength)
                .transition()
                .ease(d3.easeLinear)
                .duration(duration)
                .attr("stroke-dashoffset", 0)




        });




    }

function update(h) {
    var upDuration = 0;
    var easeBack = d3.easePolyOut;
    handle.attr("cx", x(h));
    label
        .attr("x", x(h))
        .text(formatDateIntoYear(h));

    var newData = dataset.filter(function (d) {
        console.log(h)
        return d.year < h;
    })
    d3.selectAll("path").remove();
    drawPlot(newData,upDuration);
}


function axesLabels(){

    vis.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("y", 60 - MARGINS.left)
        .attr("x",0 - (HEIGHT / 2))
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .text("EV Adoption Rate (% market share)");

    vis.append("text")
        .attr("transform",
            "translate(" + (WIDTH/2) + " ," +
            (HEIGHT + MARGINS.top + 10) + ")")
        .style("text-anchor", "middle")
        .text("Date");
}

function switchToScene2(){

    d3.selectAll("path").remove();
    d3.select('#visualisation').selectAll("circle").remove()
    d3.select('#visualisation').selectAll("g").remove()
    d3.select('#legend').selectAll("svg").remove()
    idScene1.style.display = 'none';
    idScene2.style.display = 'block';
    idSlider.style.display = 'none';
    idScene3.style.display = 'none';


    //plot US vs. Norway
    var subsetData = dataset.filter(function (d) {
        return d.region === 'Norway'|| d.region === 'USA' || d.region ==='World';
    })
    var groupedData = groupByCountry(subsetData);

   /* color = d3.scaleLinear()
        .domain([0, 2, 4, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30, 32, 34])
        .range(["red", "palegreen", "yellow", "blue", "aqua", "coral", "darkviolet", "seagreen", "skyblue", "peachpuff", "royalblue", "magenta", "navy", "olive", "orchid"])
*/
    //Norway 255,218,185
//US 128,128,0
//World 173,120,107
   var colors = d3.scaleLinear()
        .domain([0,1,2])
        .range(["rgb(255,218,185)","rgb(128,128,0)","rgb(173,120,107)"])
    drawAxes(subsetData,80);
    drawPlot(subsetData,2000,colors);
    drawLegend(groupedData,colors);
    axesLabels();
    addAnnotations();



}


function addAnnotations() {

    var circleTooltip = d3.select('body')
        .append('div')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'gainsboro')
        .style('opacity', 0)

    var lineTooltip = d3.select('body').append('div')
        .style('border-left', '2px dotted slategray')
        .style('position', 'absolute')
        .style('color', 'black')

//1st annotation
    d3.select("#visualisation").append("circle")
        .attr("cx", 120)
        .attr("cy", 433)
        .attr('r', 5)
        .style("fill", "orange")
        .on('mouseover', function () {

            circleTooltip.transition().duration(200)
                .style('opacity', .9)
            circleTooltip.html(
                '<div style="font-family:Verdana; font-size: 12px; ">' +
                '<strong>Pre-2010 Measures</strong>'+'<ul><li>Exemption from import tax</li><li>Reduced registration tax</li>' +
                '<li>Exemption from toll roads</li></ul>'+'</div>'

            )

                .style('left', (d3.event.pageX - 50) + 'px')
                .style('top', (d3.event.pageY - 200) + 'px')



            lineTooltip.html(
                '<div style = "">'+'<br><br><br><br><br><br>'+ '</div>'

            )
                .style('left', (d3.event.pageX - 0) + 'px')
                .style('top', (d3.event.pageY - 120) + 'px')

        })
        .on('mouseout', function () {
            circleTooltip.html('')
            lineTooltip.html('')
        })

    //2nd annotation

    d3.select("#visualisation").append("circle")
        .attr("cx", 200)
        .attr("cy", 427)
        .attr('r', 5)
        .style("fill", "orange")
        .on('mouseover', function () {

            circleTooltip.transition().duration(200)
                .style('opacity', .9)
            circleTooltip.html(
                '<div style="font-family:Verdana; font-size: 10px; ">' +
                '<strong>New EV Options Launched in Norway</strong>'+'<ul><li>Mitsubishi i-MiEV</li>' +
                '<li>Nissan Leaf</li></ul>'+'</div>'

            )
                .style('left', (d3.event.pageX - 50) + 'px')
                .style('top', (d3.event.pageY - 200) + 'px')



            lineTooltip.html(
                '<div style = "">'+'<br><br><br><br><br><br>'+ '</div>'

            )
                .style('left', (d3.event.pageX - 0) + 'px')
                .style('top', (d3.event.pageY - 120) + 'px')

        })
        .on('mouseout', function () {
            circleTooltip.html('')
            lineTooltip.html('')
        })
}



function switchToScene3() {

    d3.selectAll("path").remove();
    d3.select('#visualisation').selectAll("circle").remove()
    d3.select('#visualisation').selectAll("g").remove()
    d3.select('#legend').selectAll("svg").remove()
    idScene1.style.display = 'none';
    idScene2.style.display = 'none';
    idSlider.style.display = 'none';
    idScene3.style.display = 'block';
    idCheckbox1.style.display = 'block';
    idCheckbox2.style.display = 'block';

    d3.csv('js/data/IEA-EV-dataEV sales shareCarsProjection-CombinedSTEPS.csv', function (data) {
        parseDate = d3.timeParse("%Y")
        data.forEach(function (d) {
            d.value = +d.value;
            d.value = +d.value;
            d.year = new Date(+d.year, 0, 1)
        });
        projDataset = data;

        //filter only actual data points
        var actDateFilt = new Date(2020, 1, 1)
        console.log(actDateFilt)
        subsetActData = projDataset.filter(function (d) {
            return d.year < actDateFilt
        })
        // var subProjData = projDataset.filter(function (d) {
        //     return d.year >= actDateFilt
        // })

        subActGrouped = groupByCountry(subsetActData);
        subProjGrouped = groupByCountry(projDataset);
        //plot US vs. Norway


        drawAxes(projDataset, 80);
        plotSubActGrouped();


        /*     var checkbox1 = d3.select('body')
                 .append('div')
                 .attr('id','checkbox1')
                 .style('float','left')
                 .style('margin-left','900px')
                 .style('position','fixed')
                 .append('label')
                 .attr('for','model1')
                 .text("STEPS")
                 .append('input')
                 .attr('type','checkbox')
                 .attr('id', 'model1')
                 .attr('name','model1')
                 .attr('value',"Model1")
                 .attr('onchange',"plotSTEPS(this)")



             var checkbox2 = d3.select('body')

                 .append('div')
                 .attr('id','checkbox2')
                 .style('float','left')
                 .style('margin-left','1000px')
                 .style('position','fixed')
                 .append('label')
                 .attr('for','model3')
                 .text("SDS")
                 .append('input')
                 .attr('type','checkbox')
                 .attr('id', 'model1')
                 .attr('name','model1')
                 .attr('value',"Model1")*/






    })




}

//create plot of projected data
function plotSTEPS(checkboxElem) {
    if (checkboxElem.checked) {
        plotSubProjGrouped()
    } else {
        d3.select('#visualisation').selectAll("circle").remove()
        d3.selectAll("path").remove();
        plotSubActGrouped();
        var cbSDS =  document.getElementById('SDS');

        if (cbSDS.checked){
            plotSubProjSDSGrouped()
        }
    }
}
function plotSubProjGrouped() {

    var lineGen = d3.line()
        .x(function (d) {
            return xScale(formatYear(d.year));
        })
        .y(function (d) {
            return yScale(d.value);
        })
    subProjGrouped.forEach(function (d, i) {
        var pathData2 = lineGen(d.values);
        vis.append('path')
            .attr('d', pathData2)
            .attr('class', 'line')
            .attr('id', 'line_' + d.key)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', 4)
            .attr('stroke', function (d, j) {
                return color(i)
            })
            .attr("fill", "none")

            //create hover tooltip
            .on('mouseover', function () {
                // console.log(d)
                tooltip.transition().duration(200)
                    .style('opacity', .9)
                tooltip.html(
                    '<div style="font-family:sans-serif; font-size: 1rem; font-weight: bold">' + d.key + '</div>'
                )
                    .style('left', (d3.event.pageX - 35) + 'px')
                    .style('top', (d3.event.pageY - 30) + 'px')
            })
            .on('mouseout', function () {
                tooltip.html('')
            })
        vis.selectAll('myCircles')
            .data(projDataset)
            .enter()
            .append('circle')
            .attr("fill", "lightgrey")
            .attr("stroke", "none")
            .attr("cx", function (d) {
                return xScale(formatYear(d.year))
            })
            .attr("cy", function (d) {
                return yScale(d.value)
            })
            .attr("r", 3)
            .on('mouseover', function (d) {
                // console.log(d)
                tooltip.transition().duration(200)
                    .style('opacity', .9)
                tooltip.html(
                    '<div style="font-family:sans-serif; font-size: 1rem; font-weight: bold">' + d.value + '</div>'
                )
                    .style('left', (d3.event.pageX - 35) + 'px')
                    .style('top', (d3.event.pageY - 30) + 'px')
            })
            .on('mouseout', function () {
                tooltip.html('')

            })

    })


}
function plotSubActGrouped() {

    var lineGen = d3.line()
        .x(function (d) {
            return xScale(formatYear(d.year));
        })
        .y(function (d) {
            return yScale(d.value);
        })

//.curve(d3.curveBasis);

// create the line graph

    subActGrouped.forEach(function (d, i) {


        var pathData1 = lineGen(d.values);
        vis.append('path')
            .attr('d', pathData1)
            .attr('class', 'line')
            .attr('id', 'line_' + d.key)
            .attr('stroke-width', 2)
            .attr('stroke', function (d, j) {
                return color(i)
            })
            .attr("fill", "none")

            //create hover tooltip
            .on('mouseover', function () {
                // console.log(d)
                tooltip.transition().duration(200)
                    .style('opacity', .9)
                tooltip.html(
                    '<div style="font-family:sans-serif; font-size: 1rem; font-weight: bold">' + d.key + '</div>'
                )
                    .style('left', (d3.event.pageX - 35) + 'px')
                    .style('top', (d3.event.pageY - 30) + 'px')
            })
            .on('mouseout', function () {
                tooltip.html('')
            })


        vis.selectAll('myCircles')
            .data(subsetActData)
            .enter()
            .append('circle')
            .attr("fill", "lightgrey")
            .attr("stroke", "none")
            .attr("cx", function (d) {
                return xScale(formatYear(d.year))
            })
            .attr("cy", function (d) {
                return yScale(d.value)
            })
            .attr("r", 3)
            .on('mouseover', function (d) {
                // console.log(d)
                tooltip.transition().duration(200)
                    .style('opacity', .9)
                tooltip.html(
                    '<div style="font-family:sans-serif; font-size: 1rem; font-weight: bold">' + d.value + '</div>'
                )
                    .style('left', (d3.event.pageX - 35) + 'px')
                    .style('top', (d3.event.pageY - 30) + 'px')
            })
            .on('mouseout', function () {
                tooltip.html('')

            })

        var projThresh = new Date(2020, 0, 1);

        vis.append('line')
            .attr('x1', 490)
            .attr('y1', 439)
            .attr('x2', 490)
            .attr('y2', 150)
            .style("stroke-width", 2)
            .style("stroke", "lightgrey")
            .style("stroke-dasharray", 3)
            .style("fill", "none");


    })
}

function plotSDS(checkboxElem) {
    if (checkboxElem.checked) {
        plotSubProjSDSGrouped()
    }

    else {
        d3.select('#visualisation').selectAll("circle").remove()
        d3.selectAll("path").remove();
        plotSubActGrouped();

        var cbSTEPS =  document.getElementById('STEPS');

        if (cbSTEPS.checked){
            plotSubProjGrouped()
        }

    }
}
function plotSubProjSDSGrouped()
{
    d3.csv('js/data/IEA-EV-dataEV sales shareCarsProjection-CombinedSDS.csv', function (data) {
        parseDate = d3.timeParse("%Y")
        data.forEach(function (d) {
            d.value = +d.value;
            d.value = +d.value;
            d.year = new Date(+d.year, 0, 1)
        });
        projSDSDataset = data;

        subProjSDSGrouped = groupByCountry(projSDSDataset);
        //plot US vs. Norway


        var lineGen = d3.line()
            .x(function (d) {
                return xScale(formatYear(d.year));
            })
            .y(function (d) {
                return yScale(d.value);
            })
        subProjSDSGrouped.forEach(function (d, i) {
            var pathData2 = lineGen(d.values);
            vis.append('path')
                .attr('d', pathData2)
                .attr('class', 'line')
                .attr('id', 'line_' + d.key)
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', 4)
                .attr('stroke', function (d, j) {
                    return color(i)
                })
                .attr("fill", "none")

                //create hover tooltip
                .on('mouseover', function () {
                    // console.log(d)
                    tooltip.transition().duration(200)
                        .style('opacity', .9)
                    tooltip.html(
                        '<div style="font-family:sans-serif; font-size: 1rem; font-weight: bold">' + d.key + '</div>'
                    )
                        .style('left', (d3.event.pageX - 35) + 'px')
                        .style('top', (d3.event.pageY - 30) + 'px')
                })
                .on('mouseout', function () {
                    tooltip.html('')
                })
            vis.selectAll('myCircles')
                .data(projSDSDataset)
                .enter()
                .append('circle')
                .attr("fill", "lightgrey")
                .attr("stroke", "none")
                .attr("cx", function (d) {
                    return xScale(formatYear(d.year))
                })
                .attr("cy", function (d) {
                    return yScale(d.value)
                })
                .attr("r", 3)
                .on('mouseover', function (d) {
                    // console.log(d)
                    tooltip.transition().duration(200)
                        .style('opacity', .9)
                    tooltip.html(
                        '<div style="font-family:sans-serif; font-size: 1rem; font-weight: bold">' + d.value + '</div>'
                    )
                        .style('left', (d3.event.pageX - 35) + 'px')
                        .style('top', (d3.event.pageY - 30) + 'px')
                })
                .on('mouseout', function () {
                    tooltip.html('')

                })

        })



    })

}
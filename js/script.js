var HEIGHT,WIDTH,MARGINS
var vis
var dataset;
var projDataset;
var subActGrouped;
var subProjGrouped;
var subsetActData;
var projSDSDataset;
var subProjSDSGrouped;
var newData;

var annotationData;
var sliderLine;
// slider
var sMargin = {top:0, right:50, bottom:0, left:410},
    sWidth = 750
    sHeight = 75- sMargin.top - sMargin.bottom;

var formatDateIntoYear = d3.timeFormat("%Y");


var startDate = new Date (2010, 0, 1);
var endDate = new Date ( 2020, 1, 1)


var handle
var label

var color
var x



var tooltip = d3.select('body')
    .append('div')
    .style('position', 'absolute')
    .style('padding', '0 10px')
    .style('background', 'white')
    .style('opacity', 0)
    .style('pointer-events', 'none!important')
//import csv

var idScene1 = document.getElementById('scene_1');
var idScene2 = document.getElementById('scene_2');
var idScene3 = document.getElementById('scene_3');
var idSlider = document.getElementById('slider');

var idCheckbox1 = document.getElementById('checkbox1');
var idCheckbox2 = document.getElementById('checkbox2');

var scene1Button = document.getElementById('scene1Button');
var scene2Button = document.getElementById('scene2Button');
var scene3Button = document.getElementById('scene3Button');
var myCircles = document.getElementById('myCircles');
var sliderTipElem= document.getElementById('sliderTip');

var sourceInto = d3.select('body').append('div').html('<div id="sourceInfo" style="float: left; position: fixed;  font-style: italic; font-size: 8px; bottom; 0px">'
    +'Source: IEA (2021), Global EV Outlook 2021, IEA, Paris<br> https://www.iea.org/reports/global-ev-outlook-2021'+
    '</div>'
)

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
    d3.select('#visualisation').selectAll("g").remove()
    d3.select('#visualisation').selectAll("line").remove()
        d3.select('#legend').selectAll("svg").remove()
    d3.selectAll('#arrowTextBox').remove()
    d3.select('body').selectAll('#myAnnotations').remove()
    d3.select('body').selectAll('#myLineToolTips').remove()
    d3.select('#slider').selectAll('svg').remove()
    d3.select('body').selectAll('#sliderTip').remove()
    d3.select('body').selectAll('#tooltipTip').remove()
    d3.select('body').selectAll('#SDSTooltip').remove()
    d3.select('body').selectAll('#STEPSTooltip').remove()
    d3.select('body').selectAll('#checkboxTip').remove()
        idScene1.style.display = 'block';
        idScene2.style.display = 'none';
        idSlider.style.display = 'block';
        idScene3.style.display = 'none';
    idCheckbox1.style.display = 'none';
    idCheckbox2.style.display = 'none';
    idCheckbox2.style.display = 'none';
scene1Button.style.background = 'lightskyblue';
    scene2Button.style.background = '#ddd';
    scene3Button.style.background = '#ddd';

    var sliderTip = d3.select('body')
        .append('div')
        .attr('id','sliderTip')
        .style('top','480px')
        .style('left', '980px')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'rgb(255,255,153)')
        .style('border-radius','25px')
        .style('opacity', 0.75)
        .html(
            '<div style="font-family:sans-serif; font-size: 16px; font-weight: bold; text-align: center">Click and drag slider to filter out data by year<br>' +
            '<em'
            + '>(click to clear)</em><div style="font-size:48px;">&#8595</div></div>'
        )
        .on("click",function(){
            d3.select('body').selectAll('#sliderTip').remove()
        })

    var tooltipTip = d3.select('body')
        .append('div')
        .attr('id','tooltipTip')
        .style('top','125px')
        .style('left', '800px')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'rgb(255,255,153)')
        .style('border-radius','25px')
        .style('opacity', 0.75)
        .html(
            '<div style="font-family:sans-serif; font-size: 16px; font-weight: bold; text-align: center">Hover over points for more information<br>' +
            '<em'
            + '>(click to clear)</em><div style="font-size:48px;">&nbsp;&nbsp;&nbsp;&#8600</div></div>'
        )
        .on("click",function(){
            d3.select('body').selectAll('#tooltipTip').remove()
        })



    var svgSlider = d3.select("#slider")
        .append("svg")
        .attr("width", sWidth + sMargin.left + sMargin.right)
        .attr("height", sHeight);

    x = d3.scaleTime()
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
            .on("start drag", function() { update(x.invert(d3.event.x)); }))
            //.on("start drag", function() { updateAnnotations(x.invert(d3.event.x)); }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(11))
        .enter()
        .append("text")
        .attr("font-size",'10px')
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatDateIntoYear(d); });

    handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9)
        .attr("cx",750)




/*    label = slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("font-size",'14px')
        .text("Use the slider below to focus on a Year")
        .attr("transform", "translate(125," + (-20) + ")")*/

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
       var newDuration = 500;
       var groupedData = groupByCountry(dataset);
        drawLegend(groupedData,colors);
        drawAxes(dataset,80);
        drawPlot(dataset,newDuration,colors);
        axesLabels();

        vis.selectAll('myCircles')
            .data(dataset)
            .enter()
            .append('circle')
            .attr("id", "myCircles")
            .attr("fill", "lightgrey")
            .attr("stroke", "none")
            .attr("cx", function (d) {
                return xScale(formatYear(d.year))
            })
            .attr("cy", function (d) {
                return yScale(d.value)
            })
            .attr("r", 5)
            .on('mouseover', function (d) {
                // console.log(d)
                tooltip.transition().duration(1000)
                    .style('opacity', .9)
                tooltip.html(
                    '<div style="font-family:sans-serif; font-size: 10px; font-weight: bold">Region:' + d.region
                    + '<br>Value:' + d3.format(".1f")(d.value)
                    + '%'+'<br>Year:'+ formatYear(d.year) + '</div>'
                )
                    .style('left', (d3.event.pageX - 35) + 'px')
                    .style('top', (d3.event.pageY - 30) + 'px')
                    .style("display",null)
                    .style("pointer-events", 'none')
            })
            .on('mouseout', function () {
                tooltip.html('')
                    .style("display", "none")

            })





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
    newData = dataset.filter(function (d) {
        console.log(h)
        return d.year < h;
    })

    d3.selectAll("path").remove();
    d3.select("#visualisation").selectAll('#myCircles').remove();
    drawPlot(newData,upDuration,colors);


    vis.selectAll('myCircles')
        .data(newData)
        .enter()
        .append('circle')
        .attr("id", "myCircles")
        .attr("fill", "lightgrey")
        .attr("stroke", "none")
        .attr("cx", function (d) {
            return xScale(formatYear(d.year))
        })
        .attr("cy", function (d) {
            return yScale(d.value)
        })
        .attr("r", 5)
        .on('mouseover', function (d) {
            // console.log(d)
            tooltip.transition().duration(1000)
                .style('opacity', .9)
            tooltip.html(
                '<div style="font-family:sans-serif; font-size: 10px; font-weight: bold">Region:' + d.region
                + '<br>Value:' + d3.format(".1f")(d.value)
                + '%'+'<br>Year:'+ formatYear(d.year) + '</div>'
            )
                .style('left', (d3.event.pageX - 35) + 'px')
                .style('top', (d3.event.pageY - 30) + 'px')
                .style("display",null)
                .style("pointer-events", 'none')

        })
        .on('mouseout', function () {
            tooltip.html('')



        })





}

function updateAnnotations(h) {

    d3.csv('js/data/annotations.csv', function (data) {
        parseDate = d3.timeParse("%Y")
        data.forEach(function (d) {
            d.year = new Date(+d.year, 0, 1)
            d.value = +d.value;
        })

        annotationData = data;
    })


        handle.attr("cx", x(h));
    label
        .attr("x", x(h))
    var newAnnotationData = annotationData.filter(function (d) {
        console.log(h)
        return d.year < h;
    })


    d3.select('#visualisation').selectAll('#innerCircles').remove()
    d3.select('#visualisation').selectAll('#outerCircles').remove()
    d3.select('body').selectAll('#myAnnotations').remove()
    d3.select('body').selectAll('#circleToolTip').remove()
    d3.select('body').selectAll('#myLineToolTips').remove()
    addAnnotations(newAnnotationData);
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
            "translate(" + ((WIDTH/2)+45) + " ," +
            (HEIGHT + MARGINS.top + 10) + ")")
        .style("text-anchor", "middle")
        .text("Date");
}

function switchToScene2(){
    d3.select('body').selectAll('#sliderTip').remove()
    d3.select('body').selectAll('#tooltipTip').remove()
    d3.selectAll("path").remove();
    d3.select('#visualisation').selectAll("circle").remove()
    d3.select('#visualisation').selectAll("g").remove()
    d3.select('#legend').selectAll("svg").remove()
    d3.selectAll('#arrowTextBox').remove()
    d3.select('#visualisation').selectAll("line").remove()
    d3.select('#slider').selectAll('svg').remove()
    d3.select('body').selectAll('#SDSTooltip').remove()
    d3.select('body').selectAll('#STEPSTooltip').remove()
    d3.select('body').selectAll('#checkboxTip').remove()
    idScene1.style.display = 'none';
    idScene2.style.display = 'block';
    idSlider.style.display = 'block';
    idScene3.style.display = 'none';
    idCheckbox1.style.display = 'none';
    idCheckbox2.style.display = 'none';
    scene1Button.style.background = '#ddd';
    scene2Button.style.background = 'lightskyblue';
    scene3Button.style.background = '#ddd';

    var svgSlider = d3.select("#slider")
        .append("svg")
        .attr("width", sWidth + sMargin.left + sMargin.right)
        .attr("height", sHeight);

    x = d3.scaleTime()
        .domain([startDate,endDate])
        .range([0,sWidth])
        .clamp(true)

    var slider = svgSlider.append("g")
        .attr("class","slider")
        .attr("transform", "translate(" + sMargin.left + "," + sHeight /2 + ")");


    var sliderTip = d3.select('body')
        .append('div')
        .attr('id','sliderTip')
        .style('top','480px')
        .style('left', '205px')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'rgb(255,255,153)')
        .style('border-radius','25px')
        .style('opacity', 0.75)
        .html(
            '<div style="font-family:sans-serif; font-size: 16px; font-weight: bold; text-align: center">Click and drag slider to reveal events in the timeline<br>' +
            '<em'
            + '>(click to clear)</em><div style="font-size:48px;">&#8595</div></div>'
        )
        .on("click",function(){
            d3.select('body').selectAll('#sliderTip').remove()
        })



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
           // .on("start drag", function() { update(x.invert(d3.event.x)); }))
    .on("start drag", function() { updateAnnotations(x.invert(d3.event.x)); }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(11))
        .enter()
        .append("text")
        .attr("font-size",'10px')
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatDateIntoYear(d); });

    handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9)
        .attr("cx",0)




    label = slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("font-size",'12px')
        .text("Year Selector")
        .attr("transform", "translate(0," + (50) + ")")


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
    drawAxes(subsetData,100);
    drawPlot(subsetData,2000,colors);
    drawLegend(groupedData,colors);
    axesLabels();
    //addAnnotations(subsetData);



}


function addAnnotations(passedAnnotationData) {



//1st annotation
        vis.selectAll('myCircles')
            .data(passedAnnotationData)
            .enter()
            .append('circle')
            .attr("id", "outerCircles")
            .attr("fill", "lightgrey")
            .attr("stroke", "none")
            .attr("cx", function (d) {
                return xScale(formatYear(d.year))
            })
            .attr("cy", function (d) {
                return yScale(d.value)
            })
                .attr('r', 13)
                .style("fill", "lightgrey")
            .style("opacity", 0.5)


            vis.selectAll('myCircles')
                .data(passedAnnotationData)
                .enter()
                .append('circle')
                .attr("id", "innerCircles")
            .attr("stroke", "none")
            .attr("cx", function (d) {
                return xScale(formatYear(d.year))
            })
            .attr("cy", function (d) {
                return yScale(d.value)
            })
            .attr('r', 5)
            .style("fill", "orange")

    var circleTooltip = d3.select('body').selectAll('myAnnotations')
        .data(passedAnnotationData)
        .enter()
        .append('div')
        .attr("id", "myAnnotations")
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'none')
        .style('opacity', 1)
        .style('font-size','12px')
        .style('left', function(d,i){
            return xScale(formatYear(d.year))+275
            +'px'})
        .html(function(d){ return d.annotation})
        .style('top',function (d,i){
            return yScale(d.value)-35
                +'px'})



        }





function switchToScene3() {

    d3.select('body').selectAll('#sliderTip').remove()
    d3.select('body').selectAll('#tooltipTip').remove()
    d3.selectAll("path").remove();
    d3.select('#visualisation').selectAll("circle").remove()
    d3.select('#visualisation').selectAll("g").remove()
    d3.select('#legend').selectAll("svg").remove()
    d3.select('#SDSTooltip').remove();
    d3.select('#STEPSTooltip').remove();
    d3.select('body').selectAll('#myAnnotations').remove()
    d3.select('body').selectAll('#myLineToolTips').remove()

    idScene1.style.display = 'none';
    idScene2.style.display = 'none';
    idSlider.style.display = 'none';
    idScene3.style.display = 'block';
    idCheckbox1.style.display = 'block';
    idCheckbox2.style.display = 'block';
    scene1Button.style.background = '#ddd';
    scene2Button.style.background = '#ddd';
    scene3Button.style.background = 'lightskyblue';

    plotArrowText();

    var checkboxTip = d3.select('body')
        .append('div')
        .attr('id','checkboxTip')
        .style('top','455px')
        .style('left', '800px')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'rgb(255,255,153)')
        .style('border-radius','25px')
        .style('opacity', 0.75)
        .html(
            '<div style="font-family:sans-serif; font-size: 16px; font-weight: bold; text-align: center">Select scenario(s) below to plot the projection data<br>' +
            '<em'
            + '>(click to clear)</em><div style="font-size:48px;">&#8595;&nbsp;&nbsp;&nbsp;&nbsp;&#8595</div></div>'
        )
        .on("click",function(){
            d3.select('body').selectAll('#checkboxTip').remove()
        })


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
        var colors = d3.scaleLinear()
            .domain([0,1,2,3,4])
            .range(["rgb(170,170,85)","rgb(0,0,255)","rgb(219,85,124)","rgb(128,128,0)","rgb(173,120,107)"])

        //China "rgb(170,170,85)"
        //Europe "rgb(0,0,255)"
        //India "rgb(219,85,124)"
        //USA "rgb(128,128,0)
        //World rgb(173,120,107)

        drawAxes(projDataset, 80);
        plotSubActGrouped();
        drawLegend(subProjGrouped,colors);



    })




}

//create plot of projected data
function plotSTEPS(checkboxElem) {

    if (checkboxElem.checked) {
        plotSubProjGrouped()
        showSTEPSTooltip()
    } else {
        d3.select('#visualisation').selectAll("circle").remove()
        d3.selectAll("path").remove();
        d3.select('#STEPSTooltip').remove();
        plotSubActGrouped();
        var cbSDS =  document.getElementById('SDS');

        if (cbSDS.checked){
            plotSubProjSDSGrouped()
        }
    }
}
function plotSubProjGrouped() {

    var colors = d3.scaleLinear()
        .domain([0,1,2,3,4])
        .range(["rgb(170,170,85)","rgb(0,0,255)","rgb(219,85,124)","rgb(128,128,0)","rgb(173,120,107)"])

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
            .attr('stroke-width', 3)
            .attr('stroke-dasharray', 10)
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
                    '<div style="font-family:sans-serif; font-size: 10px; font-weight: bold">'+'Region: ' + d.key +
                    '<br>Scenario: STEPS '+'</div>')
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
            .attr("r", 5)
            .on('mouseover', function (d) {
                // console.log(d)
                tooltip.transition().duration(200)
                    .style('opacity', .9)
                tooltip.html(
                    '<div style="font-family:sans-serif; font-size: 10px; font-weight: bold">Region:' + d.region
                    + '<br>Value:' + d3.format(".1f")(d.value)
                    + '%'+'<br>Year:'+ formatYear(d.year) + '<br>Scenario: STEPS '+'</div>'+ '</div>')
                    .style('left', (d3.event.pageX - 35) + 'px')
                    .style('top', (d3.event.pageY - 30) + 'px')
                    .style("pointer-events", 'none')
            })
            .on('mouseout', function () {
                tooltip.html('')

            })

    })


}
function plotSubActGrouped() {
    var colors = d3.scaleLinear()
        .domain([0,1,2,3,4])
        .range(["rgb(170,170,85)","rgb(0,0,255)","rgb(219,85,124)","rgb(128,128,0)","rgb(173,120,107)"])
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
            .duration(0)
            .attr("stroke-dashoffset", 0)


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
            .attr("r", 5)
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
            .transition()
            .ease(d3.easeLinear)
            .duration(2000)


        var projThresh = new Date(2020, 0, 1);

        vis.append('line')
            .attr('x1', 490)
            .attr('y1', 439)
            .attr('x2', 490)
            .attr('y2', 0)
            .style("stroke-width", 2)
            .style("stroke", "lightgrey")
            .style("stroke-dasharray", 3)
            .style("fill", "none");





    })
}

function plotArrowText(){
    var arrowTextBox = d3.select('body')
        .append('div')
        .attr('id', 'arrowTextBox')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('opacity', 50)


    arrowTextBox.html(
        '<div style="font-family:Verdana; font-size: 24px;">' +
        '<p style="color: darkgray">&#x27F8&nbspHistorical&nbsp&nbsp&nbsp &nbsp &nbsp&nbsp&nbsp&nbspProjected&nbsp&#x27F9</p>'
    )
        .style('left', '580px')
        .style('top', '18px')
}
function plotSDS(checkboxElem) {
    if (checkboxElem.checked) {
        plotSubProjSDSGrouped()
        showSDSTooltip()
    }

    else {
        d3.select('#visualisation').selectAll("circle").remove()
        d3.selectAll("path").remove();
        d3.select('#SDSTooltip').remove();
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

        var colors = d3.scaleLinear()
            .domain([0,1,2,3,4])
            .range(["rgb(170,170,85)","rgb(0,0,255)","rgb(219,85,124)","rgb(128,128,0)","rgb(173,120,107)"])
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
                .attr('stroke-dasharray', 3)
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
                        '<div style="font-family:sans-serif; font-size: 10px; font-weight: bold">'+'Region: ' + d.key +
                        '<br>Scenario: SDS '+'</div>'
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
                .attr("r", 5)
                .on('mouseover', function (d) {
                    // console.log(d)
                    tooltip.transition().duration(200)
                        .style('opacity', .9)
                    tooltip.html('<div style="font-family:sans-serif; font-size: 10px; font-weight: bold">Region:' + d.region
                        + '<br>Value:' + d3.format(".1f")(d.value)
                        + '%'+'<br>Year:'+ formatYear(d.year) + '<br>Scenario: SDS '+'</div>'+ '</div>')
                        .style('left', (d3.event.pageX - 35) + 'px')
                        .style('top', (d3.event.pageY - 30) + 'px')
                        .style("pointer-events", 'none')
                })
                .on('mouseout', function () {
                    tooltip.html('')

                })

        })



    })

}

function showSDSTooltip(){

    var SDSTooltip = d3.select('body')
        .append('div')
        .attr('id', 'SDSTooltip')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'gainsboro')
        .style('opacity', 0)
        .style('border-radius','25px')


    SDSTooltip.transition().duration(0).ease(d3.easeCircleIn)
        .style('opacity', .9)


    SDSTooltip.html(
        '<div style="font-family:Verdana; font-size: 12px; ">' +
        '<h3>SDS Model</h3>'+'<p>The SDS models a rapid and deep transformation of <br> the global energy sector' +
        ' which is likely (66% probablility) <br> to limit the rise in average global' +
        ' temperature to 1.8 deg C <br> and on track for global net zero emissions by 2070.</p>'
    )

        .style('left', '400px')
        .style('top', '100px')


}

function showSTEPSTooltip(){

    var STEPSTooltip = d3.select('body')
        .append('div')
        .attr('id', 'STEPSTooltip')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'gainsboro')
        .style('opacity', 50)
        .style('border-radius','25px')


    STEPSTooltip.transition().duration(1000).ease(d3.easeCircleIn)
        .style('opacity', .9)


    STEPSTooltip.html(
        '<div style="font-family:Verdana; font-size: 12px; ">' +
        '<h3>STEPS Model</h3>'+'<p>The Staded Policies Scenario (STEPS) models the likely <br> global warming effect ' +
        'with the current policies that are in<br> place  for  2021.  The likely resuts is a 2.7 deg C increase <br>  and  falling' +
        ' well short of the global net-zero emissions <br> by 2050 goal'+'</p>'
    )
        .style('left', '400px')
        .style('top', '300px')


}
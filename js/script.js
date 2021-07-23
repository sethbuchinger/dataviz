var dataset;
var projDataset;
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
    .attr("r", 9);

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

function switchToScene1() {
    d3.csv('js/data/IEA-EV-dataEV sales shareCarsHistorical.csv', function (data) {
        parseDate = d3.timeParse("%Y")
        data.forEach(function (d) {
            d.value = +d.value;
            d.year = new Date(+d.year, 0, 1)
        });


        //console.log(JSON.stringify(dataGroup))
        dataset = data;
        groupByCountry(dataset);
        drawAxes(dataset)

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

        console.log('Passed group by countyr')
    }
    function drawAxes(data){
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
                .domain([0, 50])
                .range([HEIGHT - MARGINS.top, MARGINS.bottom]),
            xAxis = d3.axisBottom()
                .scale(xScale)
                .ticks(xTicks, "");

        yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(yTicks);

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

    function drawPlot(data) {
        //console.log(data[0]);

        //nest the data



        var lineGen = d3.line()
            .x(function (d) {
                return xScale(formatYear(d.year));
            })
            .y(function (d) {
                return yScale(d.value);
            })
            .curve(d3.curveBasis);

        // create the line graph

        groupedData = groupByCountry(data);
        console.log(groupedData[0]);
        groupedData.forEach(function (d, i) {
            var pathData = lineGen(d.values);
            vis.append('path')
                .attr('d', pathData)
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
                        '<div style="font-family:sans-serif; font-size: 1rem; font-weight: bold">' + d.key +'</div>'
                    )
                        .style('left', (d3.event.pageX - 35) + 'px')
                        .style('top', (d3.event.pageY - 30) + 'px')
                })
                .on('mouseout', function () {
                    tooltip.html('')
                })
        });

    }

function removeData(){


}
function update(h) {
    handle.attr("cx", x(h));
    label
        .attr("x", x(h))
        .text(formatDateIntoYear(h));

    var newData = dataset.filter(function (d) {
        console.log(h)
        return d.year < h;
    })
    d3.selectAll("path").remove();
    drawPlot(newData);
}


function switchToScene2(){

    var idScene2 = document.getElementById('scene_2');
    var idScene1 = document.getElementById('scene_1');
    var idSlider = document.getElementById('slider');
    var idViz = document.getElementById('visualisation')


    if (idScene2.style.display === 'none') {
        idScene2.style.display = 'block';
        idScene1.style.display = 'none';
        idSlider.style.display = 'none';
        d3.selectAll("path").remove();
    } else {
        idScene2.style.display = 'none';

    }
    //plot US vs. Norway
    var subsetData = dataset.filter(function (d) {
        return d.region === 'Norway'|| d.region === 'USA' || d.region ==='World';
    })


    drawPlot(subsetData);
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


function switchToScene3(){
    d3.csv('js/data/IEA-EV-dataEV sales shareCarsProjection-Combined.csv',function(data) {
        parseDate = d3.timeParse("%Y")
        data.forEach(function (d) {
            d.value = +d.value;
            d.value = +d.value;
            d.year = new Date(+d.year, 0, 1)
        });
        projDataset = data;
        console.log(projDataset[0])

        var idScene3 = document.getElementById('scene_3');
        var idScene1 = document.getElementById('scene_1');
        var idSlider = document.getElementById('slider');
        var idViz = document.getElementById('visualisation')


        if (idScene3.style.display === 'none') {
            idScene3.style.display = 'block';
            idScene1.style.display = 'none';
            idSlider.style.display = 'none';
            d3.selectAll("path").remove();
        } else {
            idScene3.style.display = 'none';

        }



        var projGrouped = groupByCountry(projDataset);
        drawAxes(projDataset);
        var lineGen = d3.line()
            .x(function (d) {
                return xScale(formatYear(d.year));
            })
            .y(function (d) {
                return yScale(d.value);
            })


            //.curve(d3.curveBasis);

        // create the line graph

        console.log(projGrouped[0]);
        projGrouped.forEach(function (d, i) {


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
                .data(projDataset)
                .enter()
                .append('circle')
                .attr("fill","red")
                .attr("stroke", "none")
                .attr("cx", function (d){return xScale(formatYear(d.year))})
                .attr("cy", function (d){return yScale(d.value)})
                .attr("r", 3)



        })







    })









}


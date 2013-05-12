var beatsviz = beatsviz || {
    'version': 0.1,
    'controller': {},
    'viz': {},
    'extras': {}
};


beatsviz.viz.bcnRT = function(options) {

    // Object

    var self = {};

    // Global vars
    // Tetuan: 41.394872,2.175593
    // Glories: 41.403403, 2.187052
    // Corsega/S.Juan: 41.40189,2.166324

    self.originLatitude = 41.40189;
    self.originLongitude = 2.166324;

    /* Initialize tooltips */

    self.tipTwitter = d3.tip()
        .attr('class', 'd3-tip');

    self.tipFoursquare = d3.tip()
        .attr('class', 'd3-tip');

    self.tipBicing = d3.tip()
        .attr('class', 'd3-tip');

    // Get options data

    for (key in options) {
        self[key] = options[key];
    }

    self.parentSelect = "#" + self.idName;

    self.init = function() {

        // svg init

        self.myLog("Iniciando network diagram... en ", 3);
        self.myLog(self.parentSelect, 3);

        self.svgMap = d3.select(self.parentSelect).append("svg")
            .attr("width", self.width)
            .attr("height", self.height)
            .attr("class", "svg-projection")
            .append("g");

        self.svgVoronoi = d3.select(self.parentSelect).append("svg")
            .attr("width", self.width)
            .attr("height", self.height)
            .attr("class", "svg-voronoi")
            .append("g");

        self.svgData = d3.select(self.parentSelect).append("svg")
            .attr("width", self.width)
            .attr("height", self.height)
            .attr("class", "svg-data Reds")
            .append("g");

        self.svgSea = d3.select(self.parentSelect).append("svg")
            .attr("width", self.width)
            .attr("height", self.height)
            .attr("class", "svg-sea")
            .append("g");

        self.projection = d3.geo.mercator()
            .rotate([(0 - self.originLongitude), (0 - self.originLatitude), -45])
            .scale(448500)
            .translate([self.width / 2, self.height / 2]);

        d3.json("data/bcn_streets.json", function(error, bcn) {

            self.streets = topojson.feature(bcn, bcn.objects.bcn_streets);

            self.path = d3.geo.path()
                .projection(self.projection);

            self.svgMap.append("path")
                .datum(self.streets)
                .attr("d", self.path)
                .attr("class", "bcn-streets");
        });     

        d3.json("data/bcn_mask.json", function(error, bcnMask) {

            self.mask = topojson.feature(bcnMask, bcnMask.objects.bcn_mask);

            self.pathMask = d3.geo.path()
                .projection(self.projection);

            self.svgSea.append("path")
                .datum(self.mask)
                .attr("d", self.pathMask)
                .attr("class", "mask-land");
        });                                                                                                 

        d3.json("data/bcn_sea.json", function(error, bcnSea) {

            self.sea = topojson.feature(bcnSea, bcnSea.objects.bcn_sea);

            self.pathSea = d3.geo.path()
                .projection(self.projection);

            self.svgSea.append("path")
                .datum(self.sea)
                .attr("d", self.pathSea)
                .attr("class", "mask-sea");
        });  

        self.bcnLatlong = [];
        self.bcnPoints = [];

        // Key

        self.legendSVG = d3.select("#" + self.legendId).append("svg")
            .attr("width", 100)
            .attr("height", 150)
            .append("g");

        for (var i in self.scaleType.domain()) {

            var company = self.scaleType.domain()[i];

            self.legendSVG.append("circle")
                .attr("class", "legendNodes")
                .style("fill", self.scaleType(company))
                .attr("cx", 10)
                .attr("cy", 30 + (i * 25))
                .attr("r", 5);

            self.legendSVG.append("text")
                .attr("class", "legendTexts")
                .attr("x", 20)
                .attr("y", 34 + (i * 25))
                .text(company);
        }

        // warning message

        self.warningMessage = self.svgData.append("text")
            .attr("text-anchor", "middle")
            .attr("class", "netChartTextWarning")
            .attr("x", self.width / 2)
            .attr("y", self.height / 2)
            .text(self.loadingMessage);
        
    }

    self.render = function(data, dataIn) {

        self.data = data;
        self.dataIn = dataIn;

        d3.selectAll(".circleDraw").remove();
        d3.selectAll(".lineDraw").remove();
        d3.selectAll(".bicing-areas").remove();

        if (self.dataIn == 'bicing' || self.dataIn == 'all') {

            self.drawPoints = [];
            self.drawPointsBicing = [];

            self.valuePointsBicing = {};
                self.valuePointsBicing.values = [];

            self.dataPoints = [];

            for (var i in self.data) {

                var point = self.data[i];

                if (point.type == 'bicing') {

                    self.drawPoints.push(self.projection([+point.geo.info.lng, +point.geo.info.lat]));
                    self.dataPoints.push(point);

                    self.points = self.svgData.selectAll("circle.bicing")
                        .data(self.dataPoints)
                        .enter().append("svg:circle")
                        .attr("cx", function(d, j) {
                            return Math.floor(self.drawPoints[j][0]);
                        })
                        .attr("cy", function(d, j) {
                            return Math.floor(self.drawPoints[j][1]);
                        })
                        .attr("r", function(d, j) {
                            // Populate voronoi polygons array
                            self.drawPointsBicing.push([self.drawPoints[j][0], self.drawPoints[j][1]]);
                            // Construct info for tooltip
                            var scale = self.sizeScale['bicing'];
                            var point = self.dataPoints[j];
                            self.valuePointsBicing.values.push([Math.floor(scale(point.data.slots.occupation)), d.data.stationName, d.data.slots.free, d.data.slots.available]);
                            return 1;
                        })
                        .attr("fill", "rgb(103,0,13)")
                        .attr("class", "circleDraw bicing")
                        .call(self.tipBicing)
                        .style("opacity", 0.7)
                        .style("fill", function(d, j) {
                            return (self.scaleType("bicing"));
                        })                        
                }

                if (i == Math.round(self.data.length/2)) {
                    renderVoronoi(self.drawPointsBicing, self.valuePointsBicing.values);
                }
            }
        }

        if (self.dataIn == 'traffic' || self.dataIn == 'all') {

            self.drawLines = [];
            self.dataLines = [];

            for (var i in self.data) {
                var point = self.data[i];

                if (point.type == 'traffic') {

                    var polygon = point.geo.info;

                    var polnumpoints = polygon.length - 1;

                    for (var j = 0; j < polnumpoints; j++) {
                        self.dataLines.push({
                            'first': self.projection([polygon[j][0], polygon[j][1]]),
                            'second': self.projection([polygon[j + 1][0], polygon[j + 1][1]]),
                            'now': point.data.now
                        });
                    }
                }
            }

            self.lines = self.svgData.selectAll("g")
                .data(self.dataLines)
                .enter().append("svg:line")
                .attr("x1", function(d, j) {
                    return d.first[0];
                })
                .attr("y1", function(d, j) {
                    return d.first[1];
                })
                .attr("x2", function(d, j) {
                    return d.second[0];
                })
                .attr("y2", function(d, j) {
                    return d.second[1];
                })
                .attr("class", "lineDraw")
                .attr("stroke", self.scaleType("traffic"))
                .attr("stroke-width", 0)
                .style("opacity", function(d, k) {
                    return self.sizeScale['traffic'](d.now);
                }).transition().duration(self.transTime).attr("stroke-width", function(d, k) {
                    return self.sizeScale['trafficW'](d.now);
                });
        }


        if (self.dataIn == 'twitter' || self.dataIn == 'all') {

            self.drawPoints = [];
            self.dataPoints = [];

            for (var i in self.data) {
                var point = self.data[i];

                if (point.type == 'twitter') {

                    self.drawPoints.push(self.projection([point.geo.info.lng, point.geo.info.lat]));
                    self.dataPoints.push(point);


                    self.points = self.svgData.selectAll("circle.twitter")
                        .data(self.dataPoints)
                        .enter().append("image")
                        .attr("xlink:href","img/twitter_logo.png")
                        .attr("x", function(d, j) {
                            return Math.floor(self.drawPoints[j][0]);
                        })
                        .attr("y", function(d, j) {
                            return Math.floor(self.drawPoints[j][1]);
                        })
                        .attr("width", 0)
                        .attr("height", 0)
                        .attr("class", "circleDraw twitter")
                        .call(self.tipTwitter)
                        .style("opacity", 0.5)
                        .style("fill", function(d, j) {
                            return (self.scaleType("twitter"));
                        })
                        .on('mouseover', self.tipTwitter.html(function(d, j){
                            return "<h4 class='twitter-header'>@" + d.data.from_user + "</h4><p>" + d.data.text + "</p>";
                        }).show)
                        .on('mouseout', self.tipTwitter.hide);

                    self.points.transition().duration(self.transTime)
                        .attr("width", 16)
                        .attr("height", 16);
                }
            }
        }

        if (self.dataIn == 'foursquare' || self.dataIn == 'all') {

            self.drawPoints = [];
            self.dataPoints = [];


            for (var i in self.data) {
                var point = self.data[i];

                if (point.type == 'foursquare') {
                    self.drawPoints.push(self.projection([point.geo.info.lng, point.geo.info.lat]));
                    self.dataPoints.push(point);

                    self.points = self.svgData.selectAll("circle.foursquare")
                        .data(self.dataPoints)
                        .enter().append("svg:circle")
                        .attr("cx", function(d, j) {
                            return Math.floor(self.drawPoints[j][0]);
                        })
                        .attr("cy", function(d, j) {
                            return Math.floor(self.drawPoints[j][1]);
                        })
                        .attr("r", 0)
                        .attr("class", "circleDraw foursquare")
                        .call(self.tipFoursquare)
                        .style("opacity", 0.7)
                            .style("fill", function(d, j) {
                            return (self.scaleType("foursquare"));
                        })
                        .on('mouseover', self.tipFoursquare.html(function(d, j){
                            return "<h4 class='foursquare-header'>" + d.data.name + "</h4><p class='foursquare-info'><span>" + d.data.checkins + "</span>checkins</p>";
                        }).show)
                        .on('mouseout', self.tipFoursquare.hide);

                    self.points.transition().duration(self.transTime)
                        .attr("r", function(d, j) {
                        var scale = self.sizeScale['foursquare'];
                        var point = self.dataPoints[j];
                            return Math.floor(scale(point.data.checkins))
                        });
                }
            }
        }

        if (self.dataIn == 'instagram' || self.dataIn == 'all') {

            self.drawPoints = [];
            self.dataPoints = [];

            for (var i in self.data) {
                var point = self.data[i];

                if (point.type == 'instagram') {


                    self.drawPoints.push(self.projection([point.geo.info.lng, point.geo.info.lat]));
                    self.dataPoints.push(point);

                    self.points = self.svgData.selectAll("circle.instagram")
                        .data(self.dataPoints)
                        .enter().append("image")
                        .attr("xlink:href", "img/instagram_logo.png")
                        .attr("x", function(d, j) {
                            return Math.floor(self.drawPoints[j][0]);
                        })
                        .attr("y", function(d, j) {
                            return Math.floor(self.drawPoints[j][1]);
                        })
                        .attr("width", 0)
                        .attr("height", 0)
                        .attr("class", "circleDraw instagram")
                        .style("opacity", 0.7)
                        .style("fill", function(d, j) {
                            return (self.scaleType("instagram"));
                        });

                    self.points.on("click", function(d, i) {
                        window.open(d.data.link, '_blank');
                        window.focus();
                        // $('#instagram-modal').removeData('modal').modal({
                        //     show : true
                        // });
                        // var url = d.data.link;
                        // $('.modal-body').html('<iframe width="100%" height="100%" frameborder="0" scrolling="no" allowtransparency="true" src="' + url + '"></iframe>');
                    });

                    self.points.append("title").text(function(d, j) {
                        if (!self.dataPoints[j].data.caption) {
                            return self.dataPoints[j].data.user.username;
                        } else {
                            return self.dataPoints[j].data.user.username + "- " + self.dataPoints[j].data.caption.text;
                        }
                    });

                    self.points.transition().duration(self.transTime)
                        .attr("width", function(d, j) {
                            var scale = self.sizeScale['instagram'];
                            var point = self.dataPoints[j];
                            return Math.floor(scale(point.data.likes.count))
                        })
                        .attr("height", function(d, j) {
                            var scale = self.sizeScale['instagram'];
                            var point = self.dataPoints[j];
                            return Math.floor(scale(point.data.likes.count))
                        });
                }
            }
        }

        // El remove del warning esta al final porque el primer render tarda...
        self.warningMessage.transition().duration(self.transTime).style("opacity", 0.0).remove();

        function renderVoronoi(voronoiArray, voronoiValue) {
            self.svgData.selectAll("path")
                .data(d3.geom.voronoi(voronoiArray))
                .enter().append("svg:path")
                .attr("class", function(d, i) { return "bicing-areas q" + voronoiValue[i][0] + "-9"; })
                .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
                .on("mouseover", self.tipBicing.html(function(d, i){
                    return "<h4 class='bicing-header'>" + voronoiValue[i][1] + "</h4>"
                            + "<ul class='bicing-info'>" 
                                + "<li><span>" + voronoiValue[i][2]+ "</span>free slots</li>" 
                                + "<li><span>" + voronoiValue[i][3] + "</span>bikes</li>" 
                            + "</ul>";
                }).show)
                .on("mouseout", self.tipBicing.hide);
        }
    }

    // Main del objeto

    self.init();
    return self;

}
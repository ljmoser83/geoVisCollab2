(function() {

    var options = {
        center: [38, -85.45],
        zoom: 8
    }

    var map = L.map('map', options);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community;  MAP DESIGNED 11-2017 BY <a href="https://ljmoser83.github.io" target=external >ljmoser83</a> and <a href="https://digitalfootprints.github.io" target=external >digitalfootprints</a>'
    }).addTo(map);

    $.when(
        $.getJSON('data/physio-regions2.json'),
        $.getJSON('data/vividcolors.json'),
        $.getJSON('data/campsites2.json')
    ).done(function(regions, colors, campsites) {

        console.log(regions) // will be object with 3 props

        regions = regions[0];
        colors = colors[0];
        campsites = campsites[0];

        console.log(regions.features[0].properties.REGION) // will just be our geojson

        // store a reference to the HTML list
        var legendList = $('#legend-list');

        // loop through the features and create a new
        // list item for each feature in the legend
        for (var i = 1; i <= regions.features.length; i++) {
            legendList.append('<li class="legend-item" id="region-' + i + '"><a style="color:' + colors.Vivid[10][i - 1] + '" href="#"> ' + regions.features[i - 1].properties.REGION + '  (<span></span>)</a></li>');
        }


        // create a layerGroup with the geojson data
        var regionsLayerGroup = L.geoJson(regions, {
            style: function(feature) {
                // use the colors object to style
                // each polygon a unique color
                return {
                    color: colors.Vivid[10][feature.properties.region_id - 1],
                    fillOpacity: .6
                }
            },
            onEachFeature(feature, layer) {

                $('#region-' + feature.properties.region_id + ' span').append(feature.properties.count);

                layer.on('mouseover', function() {
                    this.setStyle({
                        fillOpacity: .8
                    });

                    $('#region-' + feature.properties.region_id).addClass('highlight');
                });

                layer.on('mouseout', function() {
                    this.setStyle({
                        fillOpacity: .6
                    });

                    $('#region-' + feature.properties.region_id).removeClass('highlight');
                });
            }
        }).addTo(map);
        // select all the list items and on mouseover
        $('.legend-item').on('mouseover', function() {
            // extract the specific number from the specific item
            // being moused over
            var num = this.id.replace('region-', '');
            // send this number as an argument to the highlightRegion function
            highlightRegion(num);
        });

        function highlightRegion(regionNum) {
            // loop through the regions polygons
            regionsLayerGroup.eachLayer(function(layer) {
                // if the regions id matches the one we're mousing over
                if (layer.feature.properties.region_id == regionNum) {
                    // change the layer style
                    layer.setStyle({
                        fillOpacity: .8
                    }).bringToFront();
                } else {
                    // return to original
                    layer.setStyle({
                        fillOpacity: .6
                    });
                }
            });
        }

        // create new markerClusterGroup
        var markers = L.markerClusterGroup();

        // loop through all our signals features
        campsites.features.forEach(function(feature) {
            // create a new Leaflet marker for each
            var coords = feature.geometry.coordinates,
                marker = L.marker([coords[1], coords[0]]);
            // bind a tooltip to the marker
            marker.bindTooltip("Campsite: " + feature.properties.PARK_NAME);
            // add the marker to the markerClusterGroup
            markers.addLayer(marker);

        });
        // add the markerClusterGroup to the map
        map.addLayer(markers);
    });

})();

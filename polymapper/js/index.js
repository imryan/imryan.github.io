// Polymapper
//
// Originally forked from Jeremy Hawes:
// https://github.com/jeremy-hawes/google-maps-coordinates-polygon-tool
//

var map;
var polygon;
var coordinates = []

function initialize() {
  var center = new google.maps.LatLng(40.7272, -73.9941);

  var mapOptions = {
    zoom: 12,
    center: center,
    mapTypeId: google.maps.MapTypeId.RoadMap
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  google.maps.event.addListener(polygon.getPath(), "insert_at", getPolygonCoords);
  google.maps.event.addListener(polygon.getPath(), "set_at", getPolygonCoords);

  drawMap(coordinates);
}

function drawMap(coordinates) {
  if (!coordinates) {
    coordinates = [];
  }

  polygon = new google.maps.Polygon({
    paths: coordinates,
    draggable: true,
    editable: true,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35
  });

  polygon.setMap(map);

  google.maps.event.addListener(polygon.getPath(), "insert_at", getPolygonCoords);
  google.maps.event.addListener(polygon.getPath(), "set_at", getPolygonCoords);
}

function getPolygonCoords() {
  var len = polygon.getPath().getLength();
  var htmlStr = "CLLocationCoordinate2D coords[] = {\n"

  for (var i = 0; i < len; i++) {
    htmlStr += "CLLocationCoordinate2DMake(" + polygon.getPath().getAt(i).toUrlValue(5) + "),\n";
    console.log(polygon.getPath().getAt(i).toUrlValue(5));
  }

  document.getElementById('info').innerHTML = htmlStr + "};"
}

function generate() {
  var text = document.getElementById('input').value.split('\n');

  for (var i = 0; i < text.length; i++) {
    var lat = parseFloat(text[i].split(',')[0]);
    var lon = parseFloat(text[i].split(',')[1]);

    console.log(lat + ', ' + lon);
    // Check if valid lat,lon
    var coordinate = new google.maps.LatLng(lat, lon);

    coordinates.push(coordinate);
  }
  drawMap(coordinates);
}

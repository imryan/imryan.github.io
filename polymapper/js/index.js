// Polymapper
//
// Originally forked from Jeremy Hawes:
// https://github.com/jeremy-hawes/google-maps-coordinates-polygon-tool
//

var map;
var polygon;
var coordinates = [];

function initialize() {
  var center = new google.maps.LatLng(40.7272, -73.9941);

  var mapOptions = {
    zoom: 14,
    center: center,
    streetViewControl: false,
    mapTypeId: google.maps.MapTypeId.RoadMap
  };

  // Temp
  document.getElementById('input').innerHTML = '40.71877,-74.0003\n40.71461,-73.9894\n40.72542,-73.99292';

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  google.maps.event.addListener(polygon.getPath(), "insert_at", getSnippet);
  google.maps.event.addListener(polygon.getPath(), "set_at", getSnippet);
}

function drawMap() {
  polygon = new google.maps.Polygon({
    paths: coordinates,
    draggable: true,
    editable: true,
    strokeColor: '#2980b9',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#3498db',
    fillOpacity: 0.35
  });

  polygon.setMap(map);

  google.maps.event.addListener(polygon.getPath(), "insert_at", getSnippet);
  google.maps.event.addListener(polygon.getPath(), "set_at", getSnippet);

  google.maps.event.addListener(polygon, 'rightclick', function (event) {
    polygon.setMap(null);
  });
}

function getSnippet() {
  var len = polygon.getPath().getLength();

  var e = document.getElementById("syntax-selector");
  var platform = e.options[e.selectedIndex].value;

  if (platform == 'ios') {
    var htmlStr = "CLLocationCoordinate2D coords[] = {\n"

    for (var i = 0; i < len; i++) {
      htmlStr += "CLLocationCoordinate2DMake(" + polygon.getPath().getAt(i).toUrlValue(5) + "),\n";
    }
    document.getElementById('info').innerHTML = htmlStr + "};";

  } else if (platform == 'android') {
    htmlStr = "List<Point> coordinates = new ArrayList<>();\n";

    for (var i = 0; i < len; i++) {
      htmlStr += "coordinates.add(new Point(" + polygon.getPath().getAt(i).toUrlValue(5) + "));\n";
    }
    document.getElementById('info').innerHTML = htmlStr;
  }
}

function generate() {
  coordinates = [];
  var text = document.getElementById('input').value.split('\n');

  for (var i = 0; i < text.length; i++) {
    var lat = parseFloat(text[i].split(',')[0]);
    var lon = parseFloat(text[i].split(',')[1]);

    var coordinate = new google.maps.LatLng(lat, lon);
    coordinates.push(coordinate);
  }

  drawMap();
  getSnippet();
}

function dropdownChanged() {
  getSnippet();
}

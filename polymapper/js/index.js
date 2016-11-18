//var myPolygon;
function initialize() {
  // Map Center
  var myLatLng = new google.maps.LatLng(33.5190755, -111.9253654);
  // General Options
  var mapOptions = {
    zoom: 1,
    center: myLatLng,
    mapTypeId: google.maps.MapTypeId.RoadMap
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var lat = [
    -85.05113,
23.7046,  
26.56108, 
24.84848, 
30.03519, 
39.44212, 
38.88248, 
39.73676, 
37.94673, 
35.41384, 
37.52935, 
38.35857, 
42.37072, 
49.08106, 
42.96655, 
41.66286, 
43.5917,  
47.23076, 
48.31997, 
53.87343, 
47.71211, 
48.45765, 
42.82541, 
49.89463, 
62.29659, 
62.38428, 
62.34961, 
67.70887, 
72.9578,  
76.15828, 
78.90354, 
85.04332, 
85.03594, 
77.84185, 
46.25585, 
-0.36365, 
-50.47289,
-84.88472,
-84.87796
  ];
  var lon = [
      55.19531,
59.93963,
 56.30399,
 52.76026,
 48.50914,
 43.92467,
 46.35132,
 47.9718,
 57.92827,
 62.80426,
 65.45381,
 71.05743,
 80.67261,
 87.03918,
 96.69304,
 104.75745,
112.10303,
 120.05859,
 114.76902,
 123.39581,
 131.4276,
 134.89783,
 133.90373,
 157.19238,
 177.07651,
 177.98894,
 179.82422,
 179.47132,
-179.56088,
 176.70427,
 176.48504,
 176.66282,
 9.93164,
 8.26172,
 -47.28516,
 -23.27402,
  -18.95039,
  -17.08769,
  36.10313
  ];

  var coords = buildCoords(lat, lon);

  // Styling & Controls
  myPolygon = new google.maps.Polygon({
    paths: coords,
    draggable: true, // turn off if it gets annoying
    editable: true,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35
  });

  myPolygon.setMap(map);
  //google.maps.event.addListener(myPolygon, "dragend", getPolygonCoords);
  google.maps.event.addListener(myPolygon.getPath(), "insert_at", getPolygonCoords);
  //google.maps.event.addListener(myPolygon.getPath(), "remove_at", getPolygonCoords);
  google.maps.event.addListener(myPolygon.getPath(), "set_at", getPolygonCoords);
}

function buildCoords(lat, lon) {
  var coordsArray = [];
  for (var i = 0; i < lat.length; i++) {
    var coord = new google.maps.LatLng(lat[i], lon[i]);
    coordsArray.push(coord);
  }
  return coordsArray;
}

//Display Coordinates below map
function getPolygonCoords() {
  var len = myPolygon.getPath().getLength();
  var htmlStr = "";
  for (var i = 0; i < len; i++) {
    htmlStr += '@"' + myPolygon.getPath().getAt(i).toUrlValue(5) + '",\n';
  }
  document.getElementById('info').innerHTML = htmlStr;
}

function copyToClipboard(text) {
  window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}
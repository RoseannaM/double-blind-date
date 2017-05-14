let https = require ('https');

//runs third location based on radius
module.exports = function randLocation (location1, location2, radius, cb) {
    const radiusInLatLong = radius / 70;
    let l1_lat = location1.lat;
    let l1_long = location1.long;
    let l2_lat = location2.lat;
    let l2_long = location2.long;

    let u = Math.random();
    let v = Math.random();
    let w = radiusInLatLong * Math.sqrt(u);
    let t = 2 * Math.PI * v;
    let x = w * Math.cos(t);
    let y = w * Math.sin(t);
    let location3 = {};
    
    location3.lat = (l1_lat + l2_lat)/2 + x;
    location3.long = (l1_long + l2_long)/2 + y;
    getGooglePlace(location3, null, cb);
}
//performs GooglePlace API search and grabs random location.
function getGooglePlace (location3, activity = null, cb) {
  var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
  let lat = location3.lat;
  let long = location3.long;
  let key = "AIzaSyC5O4dq7xFPmYl_HAWdK_Syk3pK8GyKEtg";
  url += "?location=" + lat + "," + long + "&radius=20" + "&key=" + key;
  https.get(url, function(response) {
    let body ='';
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function () {
      let places = JSON.parse(body);
      let locations = places.results;
      if (locations.length === 0) {
        console.log('Google returned no interesting places, so use the random place');
        cb({
            geometry: {
                location: location3
            }
        });
        return;
      }
      let randLoc = locations[Math.floor(Math.random() * locations.length)];
      cb(randLoc);
    });
  }).on('error', function(error) {
      console.log("Error is: " + error.message);
  });
}
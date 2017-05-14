// upon success of making an activity location
//grab users location, and activity location from database
//make a request to lyft API
//update users with success of request.
let https = require('https');
var functions = require('firebase-functions');
const admin = require('firebase-admin');
const GeoFire = require('geofire');

//grab location of user from database.
function getLocation (user) {
  let db = admin.database;
  let ref = db.ref('/user/' + user + '/location');
  let location = {};
  ref.on('child_added', function (snapshot) {
        let snapshot = snapshot.val();
        let location.lat = snapshot.lat;
        let location.lng = snapshot.long;
  }, function (error) {
    console.log("Error! " + error.code);
  });
  return location;
}

//grabs activity location from dates database
function getActivity (user) {
  let db = admin.database;
  let ref = db.ref('/dates/' + user + '/location/coords/geometry/location)';
  let location = {};
  ref.on('child_added', function (snapshot) {
    let snapshot = snapshot.val();
    let location.lat = snapshot.lat;
    let location.lng = snapshot.long;
  }, function (error) {
    console.log("Error! " + error.code);
  });
  return location;
}

//makes POST request to Lyft API
function postLyftLocations (user, activity) {
  const userlat = user.lat;
  const userlong = user.long;
  const activitylat = activity.lat;
  const activitylong = activity.long;
  const postData = JSON.stringify({
      ride_type: "lyft",
      origin: {
        lat: activitylat,
        lng: activitylong
        address: null
      },
      destination: {
        lat: userlat,
        lng: userlong
      }
  });
  const options = {
    hostname: 'api.lyft.com',
    port: 443,
    path: '/v1/rides',
    method: 'POST',
    headers: {
      content-type: "application/json",
      content-length: Buffer.bytelength(postData)
    }
  };
  let req = https.request(options, (res) => {
    res.setEncoding('utf8');
    let body='';
    console.log("statusCode:", res.statusCode);
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('error', function (error) {
      console.log ("Error is: " + error.message);
    });
  req.write(data);
  req.end();
  });
}

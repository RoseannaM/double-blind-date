// upon success of making an activity location
//grab users location, and activity location from database
//make a request to lyft API
//update users with success of request.
let https = require('https');
var functions = require('firebase-functions');
const admin = require('firebase-admin');
const GeoFire = require('geofire');

// AUTHENTICATION
//authentication post for Lyft
function obtainAccess() {
  const client_id = "xbjKV9iro2fD";
  const scope = "&scope=public%20rides.request%20offile%20rides.read";
  const response_state = "&response_type=code";
  const state = "&<state_string>";
  var url = "/oauth/authorize?client_id=" + client_id + scope + state + response_type;

  var options = {
    hostname: 'api.lyft.com',
    port: 443,
    path: url,
    method: 'GET',
  };
  let req = https.get(options, (res) => {
    res.setEncoding('utf8');
    let body='';
    console.log("statusCode:", res.statusCode);
    res.on('data', function (chunk) {
      body += chunk;  //returns your-redirect-uri/?code=<authorization_code>?
    });
    res.on('end', function() {
      let authCode = JSON.parse(body);
    });
    res.on('error', function (error) {
      console.log ("Error is: " + error.message);
    });
    req.write(data);
    req.end();
  });
  return authCode;
}

//get access token once provided with authCode from obtainAccess();
function getToken (authCode) {
  const client_id = "xbjKV9iro2fD";
  const client_secret = "yw-6JdHHRws_baMjdwJHAsKHUj9Zzu-z";
  let data = JSON.stringify{
    grant_type: authCode,
    code: "<authorization_code>"
  };
  const options = {
    hostname: 'api.lyft.com',
    port: 443,
    headers: {
      authorization: (client_id:client_secret),
      content-type: 'application/json;charset=UTF-8',
      content-length: Buffer.bytelength(data)
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
  return body;
}

//for refreshing the token if it expires.
function refreshToken(authCode) {
  const client_id = "xbjKV9iro2fD";
  const client_secret = "yw-6JdHHRws_baMjdwJHAsKHUj9Zzu-z";
  let data = JSON.stringify{
    grant_type: authCode,
    refresh_token: "<refresh_token>"
  };
  const options = {
    hostname: 'api.lyft.com',
    port: 443,
    headers: {
      authorization: (client_id:client_secret),
      content-type: 'application/json;charset=UTF-8',
      content-length: Buffer.bytelength(data)
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
  return body;
}

//FUNCTIONS
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
function postLyftLocations (user, activity, accessCode) {
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
    path: '/oauth/token',
    method: 'POST',
    headers: {
      authorization: 'Bearer' + accessCode,
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

//getting ETA from lyft rider
function getETA (user, accessCode) {
    let location = getLocation(user);
    const options = {
      hostname: 'api.lyft.com',
      port: 443,
      path: '/v1/eta?lat=' + location.lat + '&lng=' + location.lng,
      method: 'GET',
      headers: {
        authentication: 'bearer' + accessCode,
      }
    };
    https.get(options, function (response) {
      let body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });
      response.on('end', function () {
        let estimate = JSON.parse(body);
        let time = estimate.results;
      });
      response.on('error', function (error) {
        console.log ("Error is: " + error.message);
      });
    });
}

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}

request(options, callback);

}

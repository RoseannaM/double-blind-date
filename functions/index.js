var functions = require('firebase-functions');
const admin = require('firebase-admin');
const GeoFire = require('geofire');
admin.initializeApp(functions.config().firebase);

const dateRadius = 50; //km

function getGeoFire() {
    return new GeoFire(admin.database().ref('/geofire'));
}

exports.convertToGeofire = functions.database.ref('/users/{user}/location').onWrite(event => {
    const user = event.params.user;
    const locationRef = admin.database().ref(`/users/${user}/location`);

    const geoFire = getGeoFire();

    return admin.database().ref(`/users/${user}/location`).once('value').then(function(snapshot) {
        const long = snapshot.val().long;
        const lat = snapshot.val().lat;

        return geoFire.set(user, [lat, long]);
    });
});

exports.matchmake = functions.https.onRequest((req, res) => {
    const geoFire = getGeoFire();

    admin.database().ref(`/users`).once('value').then(function(snapshot) {
        const users = snapshot.val();
        const userIds = Object.keys(users);
        const availableUserIds = userIds.filter((userId) => users[userId].isAvailable);
        availableUserIds.forEach(availableUserId => {
            const user = users[availableUserId];
            const geoQuery = geoFire.query({
                center: [user.location.lat, user.location.long],
                radius: dateRadius,
            });


            geoQuery.on('key_entered', (key, location, distance) => {
                console.log(`Found a couple: ${availableUserId} and ${key} at distance ${distance} and location ${location}`);
            });

            geoQuery.on('ready', () => {
                geoQuery.cancel(); //:'( poor geoQuery
            });
        });

        res.send(200, 'Matchmaking complete!');
    });
    // const newPage = admin.database().ref(`/sites/${site}/pages`).push();
    // newPage.set({ 
    //     url,
    // });
});
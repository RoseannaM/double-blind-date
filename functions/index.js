var functions = require('firebase-functions');
const admin = require('firebase-admin');
const GeoFire = require('geofire');
const randLocation = require('./date');

admin.initializeApp(functions.config().firebase);

const dateRadius = 50; //km

function getGeoFire() {
    return new GeoFire(admin.database().ref('/geofire'));
}

function getMainDater(dater1, dater2) {
    return dater1 > dater2 ? dater1 : dater2;
}

function forEachUser(cb) {
    admin.database().ref(`/users`).once('value').then(function(snapshot) {
        const users = snapshot.val();
        const userIds = Object.keys(users);
        userIds.forEach(userId => {
            cb(userId, users);
        });
    });
}

// exports.convertToGeofire = functions.database.ref('/users/{user}/location').onWrite(event => {
//     const user = event.params.user;
//     const locationRef = admin.database().ref(`/users/${user}/location`);

//     const geoFire = getGeoFire();

//     return admin.database().ref(`/users/${user}/location`).once('value').then(function(snapshot) {
//         const long = snapshot.val().long;
//         const lat = snapshot.val().lat;

//         return geoFire.set(user, [lat, long]);
//     });
// });

// exports.changeAvailability = functions.database.ref('/users/{user}/isAvailable').onWrite(event => {
//     const isAvailable = event.data.val();
//     const user = event.params.user;
//     if (!isAvailable) {
//         return admin.database().ref(`/dates`).once('value').then(function(snapshot) {
//             const dates = snapshot.val();
//             Object.keys(dates).forEach(mainDater => {
//                 const date = dates[mainDater];
//                 const { dater1, dater2 } = date;
//                 if ((dater1 === user) || (dater2 === user)) {
//                     admin.database().ref(`/dates/${mainDater}`).remove();
//                 }
//             });
//         });
//     }
// });

function updateAllToGeofire () {
    const promises = [];
    forEachUser((userId, users) => {
        const user = users[userId];
        const locationRef = admin.database().ref(`/users/${userId}/location`);

        const geoFire = getGeoFire();

        const geofireUpdatedPromise = new Promise((resolve, reject) => {
            admin.database().ref(`/users/${userId}/location`).once('value').then(function(snapshot) {
                const long = snapshot.val().long;
                const lat = snapshot.val().lat;
                console.log(`Updating ${userId} to geoFire`);
                geoFire.set(userId, [lat, long]).then(resolve);
            });
        });
        promises.push(geofireUpdatedPromise);
    });
    console.log(`geofire promises list: ${JSON.stringify(promises)}`);
    return Promise.all(promises);
}

exports.findDateLocation = functions.database.ref('/dates/{user}').onWrite(event => {
    const mainDater = event.params.user;
    const date = event.data.val();
    if (date.location) {
        return;
    }
    const {dater1, dater2} = event.data.val();
    return admin.database().ref(`/users`).once('value').then(function(snapshot) {
        const location1 = snapshot.val()[dater1].location;
        const location2 = snapshot.val()[dater2].location;
        randLocation(location1, location2, dateRadius, (dateLocation) => {
            admin.database().ref(`/dates/${mainDater}/location`).set({
                coords: dateLocation,
            });
        });
    });
});

exports.matchmake = functions.https.onRequest((req, res) => {
    updateAllToGeofire().then(() => {
        const geoFire = getGeoFire();
    
        forEachUser((userId, users) => {
            const user = users[userId];
            if (!user.location) {
                return;
            }
            if (!user.isAvailable) {
                console.log(`${userId} is not available for dating, so they will not get hitched.`);
                return;
            }
            const geoQuery = geoFire.query({
                center: [user.location.lat, user.location.long],
                radius: dateRadius,
            });


            geoQuery.on('key_entered', (key, location, distance) => {
                const dater1 = userId;
                const dater2 = key;

                if (dater1 === dater2) {
                    return; //that'd be sad.
                }

                if (!users[dater2].isAvailable) {
                    console.log(`${dater2} is not available for dating, so they will not get hitched.`);
                    return;
                }

                const dateKey = getMainDater(dater1, dater2);
                admin.database().ref(`/dates/${dateKey}`).set({
                    dater1,
                    dater2,
                });
                admin.database().ref(`/users/${dater1}/isAvailable`).set(false);
                admin.database().ref(`/users/${dater2}/isAvailable`).set(false);
                console.log(`Found a couple: ${dater1} and ${dater2} at distance ${distance} and location ${location}`);
            });

            geoQuery.on('ready', () => {
                geoQuery.cancel(); //:'( poor geoQuery
            });
        });

        res.send(200, 'Matchmaking complete!');
    });
    
});
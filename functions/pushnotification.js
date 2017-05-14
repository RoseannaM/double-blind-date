const admin = require('firebase-admin');

module.exports = function pushNotification (admin, user, messageTitle, messageBody) {
    //get the usertoken
    admin.database().ref(`users/${user}/fcmToken`).once('value').then((value) => {
            const registrationToken = value.snapshot();
            //send push notificatoin
   })

    // Define a message payload.
    var payload = {
        notification: {
            title: messageTitle,
            body: messageBody
        }
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().sendToDevice(registrationToken, payload)
        .then(function (response) {
            // See the MessagingDevicesResponse reference documentation for
            // the contents of response.
            console.log("Successfully sent message:", response);
        })
        .catch(function (error) {
            console.log("Error sending message:", error);
        });
}


      


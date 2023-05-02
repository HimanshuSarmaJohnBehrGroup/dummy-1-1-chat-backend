// const mongoose = require('mongoose');
const FCM =  require('fcm-node');
const { getUserDataByName } = require('./controllers/userControllers'); 

// var serverKey = require('../server/dummy-1-1-chat-firebase-adminsdk-fllkr-a7b780be77.json')

// const fcm = new FCM(serverKey)

const fcm = new FCM(process.env.FCM_SERVER_KEY);

const sendNotification = async (username, title, body, cb) => {

    // mongoose.connect(process.env.MONGO_DB_CONNECTION_URI)
    // .then(res => {
        // console.log(`Conntected to database`);
        getUserDataByName({
            body: {
                name: username
            }
        }, null, null, (status, userData) => {
            console.log(22, userData);
            if (status) {
                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    // to: 'dmMHFImE2H1tWz9Otsg5NY:APA91bGGOJ6igotRfK6um527Wl8ykIxx-Sz-1Qt033Tp9tLIhljqrk4BSJdQiP3lCyQHqSlYkuDEJDGDGER71nr4ePkVfYN6g-Pi-zCgwmkqa51WgLywawc-nzCnyjJ7b-Npy0SAImUo', 
                    to: userData.fcm_token,
                    // collapse_key: 'your_collapse_key',
                    
                    notification: {
                        title: title, 
                        body: body 
                    },
                    
                    // data: {  //you can send only notification or only data(or include both)
                    //     my_key: 'my value',
                    //     my_another_key: 'my another value'
                    // }
                };
            
                fcm.send(message, function(err, response){
                    console.log(22, err, response);
                    if (cb) {
                        cb(err, response);
                    }
                });
            } else {
                cb(true, null);
            }
        })
    // })
    // .catch(err => {
    //     console.log(74, err);
    // });
};

// sendNotification('Person1', 'title from server', 'body from server', (err, response) => {
//     // console.log(49, err, response);
// });

module.exports = {
    sendNotification
}

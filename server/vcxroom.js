/// ////////////////////////////////////////////////////
//
// This file does RestAPI Call to communicate with EnableX Server API
//
/// //////////////////////////////////////////////////

const fs = require('fs');
require('dotenv').config();
const vcxutil = require('./vcxutil');

const vcxroom = {};

// room object for creating room for one to one call
const roomObj = {
  "name": "room for multiparty video meeting",
  "owner_ref": "multiparty github sample",
  "settings": {
    "description": "One-to-One-Video-Chat-Sample-Web-Application",
    "scheduled": false,
    "adhoc": true,
    "moderators": 1,
    "participants": 2,
    "duration": 30,
    "quality": "SD",
    "auto_recording": false
  }
};

// room object for creating room with multi party calling
const multiPartyRoomObj = {
  name: 'room for multiparty video meeting',
  owner_ref: 'multiparty github sample',
  settings: {
    description: 'One-to-One-Video-Chat-Sample-Web-Application',
    scheduled: false,
    adhoc: true,
    moderators: '1',
    participants: '5',
    duration: '30',
    quality: 'SD',
    auto_recording: false,
  },
};

// HTTP Request Header Creation
const options = {
  host: 'api.enablex.io',
  port: 443,
  // key: fs.readFileSync(process.env.CERTIFICATE_SSL_KEY).toString(),
  // cert: fs.readFileSync(process.env.CERTIFICATE_SSL_CERT).toString(),
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${vcxutil.getBasicAuthToken()}`,
  },
};

// Function: To get Token for a Room
vcxroom.getToken = (details, callback) => {
  options.path = `/v2/rooms/${details.roomId}/tokens`;
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${vcxutil.getBasicAuthToken()}`,
  };

  vcxutil.connectServer(options, JSON.stringify(details), (status, data) => {
    console.log(67, status);
    callback(status, data);
    // Status can be 'error' or 'success'.
  });
};

// Function: To get a list of Rooms
vcxroom.getAllRooms = (callback) => {
  options.path = '/v2/rooms/';
  options.method = 'GET';
  vcxutil.connectServer(options, null, (status, data) => {
    callback(data);
  });
};

// Function: To get information of a Room
vcxroom.getRoom = (roomName, callback) => {
  options.path = `/v2/rooms/${roomName}`;
  options.method = 'GET';
  vcxutil.connectServer(options, null, (status, data) => {
    callback(status, data);
    // Status can be 'error' or 'success'.
  });
};

// Function: To create Room
vcxroom.createRoom = (callback) => {
  const roomMeta = roomObj;
  options.path = '/video/v2/rooms/';
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${vcxutil.getBasicAuthToken()}`,
  };

  console.log(107, options);
  vcxutil.connectServer(options, JSON.stringify(roomMeta), (status, data) => {
    callback(status, data);
    // Status can be 'error' or 'success'.
  });
};

// Function: To delete Room
vcxroom.deleteRoom = (roomId, callback) => {
  const roomMeta = roomObj;
  options.path = `/video/v2/rooms/${roomId}`;
  options.method = 'DELETE';
  options.headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${vcxutil.getBasicAuthToken()}`,
  };

  console.log(107, options);
  vcxutil.connectServer(options, JSON.stringify(roomMeta), (status, data) => {
    callback(status, data);
    // Status can be 'error' or 'success'.
  });
};

// Function: To get users list in a room
vcxroom.getUsersInARoom = (roomId, callback) => {
  const roomMeta = roomObj;
  options.path = `/video/v2/rooms/${roomId}/users`;
  options.method = 'GET';
  options.headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${vcxutil.getBasicAuthToken()}`,
  };

  console.log(107, options);
  vcxutil.connectServer(options, JSON.stringify(roomMeta), (status, data) => {
    callback(status, data);
    // Status 
  });
};

// Function: To create Room
vcxroom.createRoomMulti = (callback) => {
  const roomMeta = multiPartyRoomObj;
  options.path = '/v2/rooms/';
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${vcxutil.getBasicAuthToken()}`,
  };
  vcxutil.connectServer(options, JSON.stringify(roomMeta), (status, data) => {
    callback(status, data);
    // Status can be 'error' or 'success'.
  });
};

module.exports = vcxroom;

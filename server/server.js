/// ////////////////////////////////////////////////////
//
// File: server.js
// This is the Service File - executable using node command
//
/// //////////////////////////////////////////////////

const express = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/user_routes')
const { updateUser, getUserDataByName, getAllUsers } = require('./controllers/userControllers')
const { createRoom, getRoomById, getActiveRoomByRoomId, updateRoomByRoomId, deleteRoomByRoomId } = require('./controllers/roomControllers')

// const firebaseAdmin = require('firebase-admin');
// const { initializeApp, refreshToken } = require('firebase-admin/app');
const { sendNotification } = require('../server/fcm');

const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
const log = require('../util/logger/logger').logger;

const logger = log.getLogger('AppApi');
const vcxroom = require('./vcxroom');
const { stat } = require('fs/promises');

// Initialization of basic HTTP / HTTPS Service
const options = {
  // key: fs.readFileSync(process.env.CERTIFICATE_SSL_KEY).toString(),
  // cert: fs.readFileSync(process.env.CERTIFICATE_SSL_CERT).toString(),
};
if (process.env.CERTIFICATE_SSLCACERTS) {
  options.ca = [];
  process.env.CERTIFICATE_SSLCACERTS.forEach((sslCaCert) => {
    options.ca.push(fs.readFileSync(sslCaCert).toString());
  });
}
// const server = https.createServer(options, app);
const port = process.env.SERVICE_PORT || 3000;

// Start the Service
// app.set('port', port);
// server.listen(port);


// Exception Handler Function
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Function: To confirm Service is listening on the configured Port
function onListening() {
  mongoose.connect(process.env.MONGO_DB_CONNECTION_URI)
  .then(res => {
    console.log(`Conntected to database`);
  })
  .catch(err => {
    console.log(74, err);
  });

  // const addr = server.address();
  // const bind = typeof addr === 'string'
  //   ? `pipe ${addr}`
  //   : `port ${addr.port}`;
  // console.log(`Listening on ${bind}`);
}

logger.info(`Server started. Listening on Port ${port}`);
// server.on('error', onError);
// server.on('listening', onListening);

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://c584-122-179-210-88.ngrok-free.app"); // update to match 
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // update to match 
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.on("connection", (socket) => {

  console.log(110);
  
  socket.on(`/home`, async (data) => {
    const parsedData = JSON.parse(data);
    const headers = socket.request.headers;

    const updateRoomData = {};
    let updatedActiveRoom;

    if (parsedData?.role) {
      if (parsedData.role === 'initiator') {
        updateRoomData[`initiatorSocketId`] = socket.id
      } else {
        updateRoomData[`receiverSocketId`] = socket.id
      }
    }

    // Update socket id of the new...
    await updateUser({
      ...parsedData,
      socketId: socket.id
    });

    const allUsers = await getAllUsers();
    // Pipeline requests with promise.all...

    console.log(129, updatedActiveRoom);

    io.to(socket.id).emit('/home-response', {
      socketId: socket.id,
      allUsers
    });

    if (parsedData?.roomId) {
      updatedActiveRoom = await updateRoomByRoomId(parsedData?.roomId, updateRoomData);
    }

    if (updatedActiveRoom) {

      vcxroom.getUsersInARoom(parsedData?.roomId, (status, usersList) => {
        console.log(147, usersList.users);
        if (status && usersList.users?.length === 0) {
          console.log(133, updateRoomData);
          const dataForReceiver = {};
          const dataForInitiator = {};

          if (updateRoomData.receiverSocketId) {
            dataForReceiver[`initiator`] = updatedActiveRoom?.initiatorName
          } else {
            dataForReceiver[`createdAt`] = updatedActiveRoom?.createdAt
          }

          io.to(socket.id).emit(updateRoomData.initiatorSocketId ? updatedActiveRoom.initiatorName : updatedActiveRoom.receiverName, {
            ...updatedActiveRoom,
            ...dataForReceiver,
            ...dataForInitiator,
            socketId: socket.id,
            token: updateRoomData.initiatorSocketId ? updatedActiveRoom.initiatorRoomToken : updatedActiveRoom.receiverRoomToken,
            role: updateRoomData.initiatorSocketId ? `initiator` : `receiver`,
            roomId: updatedActiveRoom?.roomId,
            callType: updatedActiveRoom?.callType
          })

          io.to(updateRoomData.initiatorSocketId ? updatedActiveRoom.receiverSocketId : updatedActiveRoom.initiatorSocketId).emit(`/other-participant-refresh`, {
            otherParticipantSocketId: socket.id
          })
        }
      })
    }
    
  })

  socket.on(`/create-token`, (data) => {
    const parsedData = JSON.parse(data);
    const address = socket.request.headers;

    // console.log(134, parsedData);

    vcxroom.createRoom((status, roomData) => {
      if (status === 'success') {
        getUserDataByName({
          body: {
            name: parsedData.receiver
          }
        }, null, null, (status, receiverData) => {
          if (status) {
              if (status) {
                vcxroom.getToken({
                  ...parsedData,
                  roomId: roomData.room.room_id
                }, (status, initiatorTokenData) => {
                  if (status === 'success') {
                    // vcxroom.getUsersInARoom(roomData.room.room_id, (status, usersList) => {
                    //   console.log(147, status, usersList);
                    //   if (status === 'success') {
                    //     if (usersList?.users?.length === 1) {
        
                    io.to(socket.id).emit(parsedData.name, {
                      token: initiatorTokenData.token,
                      role: 'initiator',
                      roomId: roomData.room.room_id,
                      socketId: socket.id,
                      otherParticipantSocketId: receiverData.socketId,
                      callType: parsedData.callType
                    });
        
                    vcxroom.getToken({
                      name: parsedData.receiver,
                      role: 'participant',
                      roomId: roomData.room.room_id,
                      user_ref: parsedData.receiver
                    }, (status, receiverTokenData) => {
                      if (status === 'success') {
                        console.log(185, initiatorTokenData, receiverTokenData);
                        createRoom({
                          body: {
                            initiatorName: parsedData.name,
                            initiatorSocketId: socket.id,
                            initiatorRoomToken: initiatorTokenData.token,
                            receiverName: parsedData.receiver,
                            receiverSocketId: receiverData.socketId,
                            receiverRoomToken: receiverTokenData.token,
                            roomId: roomData.room.room_id,
                            callType: parsedData.callType
                          }
                        }, null, null, (createRoomStatus, createdRoomData) => {
                          if (createRoomStatus) {
                            io.to(receiverData.socketId).emit(parsedData.receiver, {
                              token: receiverTokenData?.token,
                              role: 'receiver',
                              initiator: parsedData.name,
                              roomId: roomData.room.room_id,
                              socketId: receiverData.socketId,
                              otherParticipantSocketId: socket.id,
                              callType: parsedData.callType
                            });

                            sendNotification(parsedData.receiver, `Notification title`, `Notification body`, (err, response) => {

                            });
                          }
                        })                           
                      }
                    })
                    //     } else {
                    //       // res.status(200).send(tokenData);
                    //     }
                    //   }
                    // });
                  }
                });
              }
          }
        })
      }
    });
  });

  socket.on(`/receiver-accept`, (data) => {
    const parsedData = JSON.parse(data);

    console.log(213, parsedData);
    
    getRoomById({
      query: {
        id: parsedData.roomId
      } 
    }, null, null, (status, roomData) => {
      console.log(214, status, roomData);
      if (status) {
        const payload = {
          callStartTimeStamp: Date.now()
        };
        io.to(roomData.initiatorSocketId).emit(`initiator-call-start`, payload);
        io.to(roomData.receiverSocketId).emit(`receiver-call-start`, payload);
      }
    })
  })

  socket.on(`/receiver-reject`, (data) => {
    const parsedData = JSON.parse(data);
    
    vcxroom.deleteRoom(parsedData.roomId, (status) => {
      if (status) {
        getRoomById({
          query: {
            id: parsedData.roomId
          } 
        }, null, null, (getRoomStatus, roomData) => {
          deleteRoomByRoomId({
            query: {
              id: parsedData.roomId
            }
          }, null, null, (deleteRoomStatus) => {
            if (getRoomStatus && deleteRoomStatus) {
              io.to(roomData.initiatorSocketId).emit(`initiator-call-reject`);
              io.to(roomData.receiverSocketId).emit(`receiver-call-reject`);
            }
          })
        })
      }
    })
    
  })

  socket.on(`/delete-call-room-timeout`, (data) => {

    const parsedData = JSON.parse(data);

    console.log('/delete-call-room-timeout', parsedData);

    vcxroom.deleteRoom(parsedData.roomId, (status) => {
      console.log(248, status)
      if (status) {
        getRoomById({
          query: {
            id: parsedData.roomId
          }
        }, null, null, (getRoomStatus, roomData) => {
          deleteRoomByRoomId({
            query: {
              id: parsedData?.roomId
            }
          }, null, null, (deleteRoomStatus) => {
            if (getRoomStatus && deleteRoomStatus) {
              io.to(roomData.initiatorSocketId).emit(`/initiator-call-timeout`);
              io.to(roomData.receiverSocketId).emit(`/receiver-call-timeout`);
            }
          })
        })
      }
    })
  })

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  socket.on(`/delete-call-room-call-ended`, (data) => {

    console.log('/delete-call-room-call-ended', data);

    const parsedData = JSON.parse(data);

    vcxroom.deleteRoom(parsedData.roomId, (status) => {
      deleteRoomByRoomId({
        query: {
          id: parsedData?.roomId
        }
      }, null, null, (deleteRoomStatus) => {
        if (deleteRoomStatus) {
          console.log(`call end emitted`);
          io.to(parsedData?.otherParticipantSocketId).emit(`/call-ended`, {
            callEndTimeStamp: parsedData?.callEndTimeStamp
          });
        }
      })
    })
  })

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  socket.on(`/initiator-end-call`, (data) => {
    const parsedData = JSON.parse(data);
    console.log('/initiator-end-call', parsedData);

    vcxroom.deleteRoom(parsedData.roomId, (status) => {
      if (status) {
        getRoomById({
          query: {
            id: parsedData.roomId
          }
        }, null, null, (roomStatus, roomData) => {
          deleteRoomByRoomId({
            query: {
              id: parsedData?.roomId
            }
          }, null, null, (deleteRoomStatus) => {
            if (roomStatus && deleteRoomStatus) {
              io.to(roomData.initiatorSocketId).emit(`/initiator-call-ended`);
              io.to(roomData.receiverSocketId).emit(`/receiver-call-ended`);
            }
          })
        })
      }
    })
  })

  socket.on(`/mute-audio`, (data) => {
    const parsedData = JSON.parse(data);

    console.log(295, parsedData, data);

    getRoomById({
      query: {
        id: parsedData.roomId
      }
    }, null, null, (roomStatus, roomData) => {
      console.log(300, roomStatus, roomData);
      if (roomStatus) {
        if (roomData.initiatorSocketId !== socket.id) {
          io.to(roomData.initiatorSocketId).emit(`/other-participant-audio-muted`)
        } else {
          io.to(roomData.receiverSocketId).emit(`/other-participant-audio-muted`)
        }
      }
    })
  })
});

server.listen(3000, () => {
  console.log(`Server running at port 3000`);
  onListening();
})

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
//   extended: true,
// }));

// app.use(express.static('../public'));


// app.use(userRoutes.router);

// app.post('/fcm-notification', async (req, res) => {
//   const { title, body, token } = req.body;
//   sendNotification(token, title, body, res);
// })

// // Application Server Route Definitions - These functions communicate with EnableX Server API
// // Route: To get liist of all Rooms in your Application
// app.get('/api/get-all-rooms', (req, res) => {
//   vcxroom.getAllRooms((data) => {
//     res.status(200);
//     res.send(data);
//   });
// });

// // Application Server Route Definitions - These functions communicate with EnableX Server API
// // Route: To get information of a given room.
// app.get('/api/get-room/:roomName', (req, res) => {
//   const { roomName } = req.params;
//   vcxroom.getRoom(roomName, (status, data) => {
//     res.status(200);
//     res.send(data);
//   });
// });

// // Route: To get users for a Room
// app.get('/api/room/get-users', (req, res) => {
//   console.log(102);
//   const { roomId } = req?.query;

//   if (!roomId) {
//     return res.status(500).send({ message: `Room Id is required.` });
//   }

//   vcxroom.getUsersInARoom(roomId, (status, data) => {
//     res.status(200).send(data);
//   });
// });

// Route: To get Token for a Room
// app.post('/api/create-token', (req, res) => {
//   console.log(102);
//   vcxroom.getToken(req.body, (status, tokenData) => {
//     console.log(144, status, tokenData);
//     if (status === 'success') {
//       vcxroom.getUsersInARoom(req.body?.roomId, (status, usersList) => {
//         console.log(147, status, usersList);
//         if (status === 'success') {
//           if (usersList?.users?.length === 1) {
//             sendNotification(req?.body?.name, `Notification title`, `Notification body`, (err, response) => {
//               if (err) {
//                 res.status(500).send({ success: false, message: `Some error occured in sending the receiver notification.` });
//               } else {
//                 res.status(200).send({ success: true, data: response });
//               }
//             });
//           } else {
//             res.status(200).send(tokenData);
//           }
//         }
//       });
//     }
//   });
// });

// // Route: To create a Room (1to1)
// app.post('/api/create-room/', (req, res) => {
//   vcxroom.createRoom((status, data) => {
//     res.send(data);
//     res.status(200);
//   });
// });

// // Route: To create a Room (multiparty)
// app.post('/api/room/multi/', (req, res) => {
//   vcxroom.createRoomMulti((status, data) => {
//     res.send(data);
//     res.status(200);
//   });
// });

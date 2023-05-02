const mongoose = require('mongoose');
const RoomSchema = require('../models/rooms').RoomSchema;
const { sendNotification } = require('../fcm')

const createRoom = async (req, res, next, cb) => {
    try {
        const { 
            initiatorName, 
            initiatorSocketId, 
            initiatorRoomToken, 
            receiverName,
            receiverRoomToken, 
            receiverSocketId, 
            roomId, 
            callType 
        } = req.body;

        const roomDocument = await RoomSchema.create({
            initiatorName,
            initiatorSocketId,
            initiatorRoomToken,
            receiverName,
            receiverSocketId,
            receiverRoomToken,
            roomId,
            callType,
            createdAt: Date.now()
        });

        console.log(14, roomDocument)
        cb(true, roomDocument);
    } catch (err) {
        console.log(17, err);
        cb(false, null);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateRoomByRoomId = async (roomId, updateData) => {
    try {
        const updatedRoomDocument = await RoomSchema.findOneAndUpdate({roomId}, updateData, { new: true });

        console.log(30, updatedRoomDocument);
        return updatedRoomDocument;
    } catch (err) {
        console.log(33, err);
        return null;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getRoomById = async (req, res, next, cb) => {
    try {
        const { id } = req.query;

        const roomDocument = await RoomSchema.find({
            roomId: id
        });

        console.log(30, roomDocument, id);
        cb(true, roomDocument[0]);
    } catch (err) {
        console.log(33, err);
        cb(false, null);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getActiveRoomByRoomId = async (roomId) => {
    try {

        const activeRoomDocument = await RoomSchema.findOne({
            roomId
        });

        console.log(30, activeRoomDocument);
        return activeRoomDocument;
    } catch (err) {
        return null;
    }
} 


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteRoomByRoomId = async (req, res, next, cb) => {
    try {
        const { id } = req.query;

        const deleteRoomRequest = await RoomSchema.deleteOne({
            roomId: id
        });

        console.log(30, deleteRoomRequest, id);
        if (cb) cb(true);
    } catch (err) {
        console.log(33, err);
        if (cb) cb(false);
    }
}


module.exports = {
    createRoom,
    updateRoomByRoomId,
    getRoomById,
    getActiveRoomByRoomId,
    deleteRoomByRoomId
}
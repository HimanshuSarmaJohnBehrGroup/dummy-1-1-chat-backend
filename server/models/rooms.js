const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    initiatorName: { type: String, required: true },
    initiatorSocketId: { type: String, required: true },
    initiatorRoomToken: { type: String, required: true },
    receiverName: { type: String, required: true },
    receiverSocketId: { type: String, required: true },
    receiverRoomToken: { type: String, required: true },
    roomId: { type: String, required: true },
    callType: { type: String, enum: ['audio', 'video'], required: true },
    createdAt: { type: Number, required: true }
})


exports.RoomSchema = mongoose.model('Rooms', RoomSchema);
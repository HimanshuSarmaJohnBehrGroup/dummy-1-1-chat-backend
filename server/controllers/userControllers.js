const userModel = require('../models/users');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getAllUsers = async (req, res, next) => {
    try {

        const allUsers = await userModel.UserSchema.find();

        if (allUsers) {
            return allUsers;
        } else return null;

    } catch (err) {
        console.log(17, 'error');
        return null;
    }
} 

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getUserDataByName = async (req, res, next, cb) => {
    try {
        const { name } = req.body;

        if (!name) {
            cb(false, null);
        } else {
            const userDocument = await userModel.UserSchema.findOne({ name });
            console.log(12, name, userDocument.socketId);
            cb(true, userDocument);
        }

    } catch (err) {
        console.log(17, 'error');
        cb(false, null);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateFCMToken = async (req, res, next) => {
    const { id } = req?.query;
    const { fcm_token } = req.body;

    if (!id || !fcm_token) {
        return res.status(500).send({ success: false, message: `Id and fcm_token are both required.` })
    }

    const userDocument = await userModel.UserSchema.findById(id);
    userDocument.fcm_token = req.body.fcm_token;
    await userDocument.save();
    res.status(200).send({ success: true, message: `fcm_token updated successfully.` })
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateUser = async (data) => {
    try {
        const { name, socketId, fcm_token } = data;

        if (!name || !socketId) {
            // Error message...
        }

        console.log(45, name, socketId);

        await userModel.UserSchema.findOneAndUpdate({name}, {
            socketId,
            fcm_token
        });

        const updatedUser = await userModel.UserSchema.findOne({name});

        console.log(51, updatedUser);
    } catch (err) {
        console.log(53, err);
    }
}

module.exports = {
    getAllUsers,
    getUserDataByName,
    updateFCMToken,
    updateUser
}
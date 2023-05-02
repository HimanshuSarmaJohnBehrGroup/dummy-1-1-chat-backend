const userModel = require('../models/users');
const { sendNotification } = require('../fcm')

const notifyRecipient = async (req, res, next) => {
    const { recipient_name } = req?.query;

    if (!recipient_name) {
        return res.status(500).send({ success: false, message: `Recipient name is required.` })
    }

    const userDocument = await userModel.UserSchema.find({
        name: recipient_name
    });
    
    sendNotification(userDocument.fcm_token, 'Test title', 'Test body', res);
}


module.exports = {
    notifyRecipient
}
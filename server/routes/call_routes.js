const express = require('express');
const UserModel = require('../models/users');
const { notifyRecipient } = require('../controllers/callControllers');

const router = express.Router();

router.post('/create-user', async(req, res, next) => {
    
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/notify-recipient', async(req, res, next) => {
    notifyRecipient(req, res, next);
})

exports.router = router;
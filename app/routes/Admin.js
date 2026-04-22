const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/AdminController');
const auth = require('../middleware/auth');

// auth pour sécurisé la route avec le token
router.get('/users',auth, controller.getUsers);

module.exports = router;

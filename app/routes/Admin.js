const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/AdminController');
const auth = require('../middleware/auth');

// auth pour sécurisé la route avec le token
// adapté a la gestion des rôle lors de la connexion
// adapté pour vérifier le rôle
router.get('/users',auth, (req, res, next) => {
    if (req.auth.role !== 'admin') {
        return res.status(403).json({error : 'Acces refusé'});
    }
    next();
}, controller.getUsers);

module.exports = router;

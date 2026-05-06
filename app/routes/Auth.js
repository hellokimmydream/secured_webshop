const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/AuthController');
const rateLimit  = require('express-rate-limit');
const Jwt = require('jsonwebtoken');

// mis en place du rate limite 
// ex.15
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: { error: 'Trop de tentatives de connexion, réessayez dans 15 minutes' },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

router.post('/login', loginLimiter, controller.login);
router.post('/register', controller.register);

// exercice11 refresh token avec if
router.post('/refresh', (req, res) => {
    const { refreshToken} = req.body;
    if (!refreshToken) return res.status(401).json( {error: 'Token absent'});

    try{
        const payload = Jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = Jwt.sign(
            { id: payload.id },
            process.env.JWT_SECRET,
            { expiresIn: '15m'}
        );
        res.json({ token : newAccessToken});
    } catch (err) {
        res.status(403).json( {error: 'Refresh Token non valide ou expiré'});
    }
});

module.exports = router;
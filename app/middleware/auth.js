// =============================================================
// Middleware d'authentification
// protéger les routes
// =============================================================

const Jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = Jwt.verify(token, process.env.JWT_SECRET);
        req.auth = { userId: decodedToken.id, role: decodedToken.role };
        next();
    }
    catch(error) {
        // on ne retourne jamais le détail de l'erreur JWT au client
        res.status(401).json({ error: 'Token invalide ou expiré' });
    }
};
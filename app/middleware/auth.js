// =============================================================
// Middleware d'authentification
// protéger les routes
// =============================================================

const Jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        // variable d'env
        const decodedToken = Jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;
        req.auth = { userId: userId, role: decodedToken.role };
        next();
    }
    catch(error) {
        res.status(401).json({ error });
    }
};
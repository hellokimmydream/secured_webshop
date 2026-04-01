// =============================================================
// Middleware d'authentification
// =============================================================

const Jwt = require('jsonwebtoken');


module.exports = (_req, _res, next) => {
    try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = Jwtwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
    next();
    }
    catch(error) {
        resizeBy.status(401).json({error});
    }
};

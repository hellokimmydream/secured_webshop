// reçoit les données envoyées par le frontend et vérifie les identifiants en BDD

const db = require('../config/db');
// bibliothèque de hachage de mdp
const bcrypt = require('bcrypt');

module.exports = {

    // ----------------------------------------------------------
    // POST /api/auth/login
    // ici recoit email et pwd
    // repond avec message, user ou erreur
    // ----------------------------------------------------------
    login: (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

        db.query(query, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message, query: query });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }
            // pour ne jamais envoyer le mdp au client
            const {password: _pwd, ...safeUser} = user;
            res.json({ message: 'Connexion réussie', user: safeUser });
        });
    },

    // ----------------------------------------------------------
    // POST /api/auth/register
    // ----------------------------------------------------------
    register: (_req, res) => {
        res.status(501).json({ error: 'Non implémenté — TODO exercice 7' });
    }
};

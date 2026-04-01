// reçoit les données envoyées par le frontend et vérifie les identifiants en BDD

const db = require('../config/db');
// bibliothèque de hachage de mdp
const bcrypt = require('bcrypt');

// ajoute le sel
const SALT_ROUNDS = 12;

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

        // il faut rechercher l utilisateur par email uniquemant
        // db.query recoit le callback async
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'erreur serveur' });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            const user = results[0];

            // compare le mdp entré avec le hash stocké dans la db
            const isValid = await bcrypt.compare(password, user.password)
            if (!isValid) {
                return res.status(401).json({error: 'Erreur lors de la connexion'})
            }
            // pour ne jamais envoyer le mdp au client
            const {password: _pwd, ...safeUser} = user;
            res.json({ message: 'Connexion réussie', user: safeUser });
        });
    },

    // ----------------------------------------------------------
    // POST /api/auth/register
    // ----------------------------------------------------------
    register:  async (req, res) =>
    {
        const {username, email, password} = req.body;

        if(!username || !email || !password){
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        try {
            // On hashe le mot de passe avant de l'insérer en BDD
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            db.query(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, 'user'],
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(409).json({ error: 'Entrez un autre email' });
                        }
                        return res.status(500).json({ error: 'Erreur serveur' });
                    }
                    res.status(201).json({ message: 'Compte créé avec succès', userId: result.insertId });
                }
            );
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};

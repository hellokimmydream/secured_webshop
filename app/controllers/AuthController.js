// reçoit les données envoyées par le frontend et vérifie les identifiants en BDD

const db = require('../config/db');
// bibliothèque de hachage de mdp
const bcrypt = require('bcrypt');
// Implémentation du JWT
const Jwt = require('jsonwebtoken');

// ajoute le sel
const SALT_ROUNDS = 12;
const PEPPER = process.env.PEPPER;


module.exports = {

    // ----------------------------------------------------------
    // POST /api/auth/login
    // ici recoit email et pwd
    // repond avec message, user ou erreur
    // ----------------------------------------------------------
    login: (req, res) => {
        const email= req.body.email?.trim().toLowerCase();
        const password=req.body.password;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // Validation coté back
        // vérifier que l'email a bien un format valide
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email invalide' });
        }

        // limiter la longueur des champs pour prévenir les injection 
        if (email.length > 254 || password.length > 254) {
            return res.status(400).json({ error: 'Saisie trop longue' });
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
            // concatainé le mdp et pepper
            const isValid = await bcrypt.compare(password + PEPPER, user.password)
            if (!isValid) {
                return res.status(401).json({error: 'Erreur lors de la connexion'})
            }

            // tache 8, ajouter rôle
            const token = Jwt.sign(
                { id: user.id, email: user.email, role: user.role, username: user.username },
                    process.env.JWT_SECRET,
                { expiresIn: '24h' }
            )

            // pour ne jamais envoyer le mdp au client
            const { password: _pwd, ...safeUser } = user;
            res.json({ message: 'Connexion réussie', token, user: safeUser });
        });
    },

    // ----------------------------------------------------------
    // POST /api/auth/register
    // ----------------------------------------------------------
    register:  async (req, res) =>
    {
        const username= req.body.username?.trim();
        const email= req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        // Validations AVANT le try/catch
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email invalide' });
        }

        if (username.length > 30 || password.length > 128) {
            return res.status(400).json({ error: 'Saisie trop longue' });
        }

        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: 'Nom d\'utilisateur invalide' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password + PEPPER, SALT_ROUNDS);

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
            console.error(['register'], err.message);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
};

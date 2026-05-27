// reçoit les données envoyées par le frontend et vérifie les identifiants en BDD

const db = require('../config/db');
// bibliothèque de hachage de mdp
const bcrypt = require('bcrypt');
// Implémentation du JWT
const Jwt = require('jsonwebtoken');

// ajoute le sel
const SALT_ROUNDS = 12;
const PEPPER = process.env.PEPPER;

// tache 16 pour limiter les tentative de connexion
// map est une structure de données qui stocke des paires clé-valeur, où chaque clé est unique et associée à une valeur.
const tentativeEchouee = new Map();
const MAX_TENTATIVE = 5;
// sur 15 min
const DUREE_BLOQUAGE_MS = 15 * 60 * 1000;


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
        if (email.length > 180 || password.length > 180) {
            return res.status(400).json({ error: 'Saisie trop longue' });
        }

        // TACHE 16
        // verif si le compte est bloqué ou non
        const infoCompte = tentativeEchouee.get(email);
        if (infoCompte && infoCompte.blocJusqua > Date.now()) {
            // 60000 ms = 1 min, arrondit à l'entier supérieur pour afficher le nombre de minutes restantes
            // ceil pour arrondir à l'entier supérieur
            const minutesRest = Math.ceil((infoCompte.blocJusqua - Date.now()) / 60000);
            // 429 c est le code pour "Too Many Requests", utilisé pour indiquer que l'utilisateur a dépassé une limite de taux
            return res.status(429).json({
                error: `Compte temporairement bloqué. Reessayez dans ${minutesRest} minutes.`
            });
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
                // tache 16 incrémenter le compteur de tentative qui ont ratée
                const compteur = tentativeEchouee.get(email) || { tentatives: 0, blocJusqua: 0 };
                compteur.tentatives += 1;
                if (compteur.tentatives >= MAX_TENTATIVE) {
                    compteur.blocJusqua = Date.now() + DUREE_BLOQUAGE_MS;
                    // remet a 0 pour le prochain cycle de tentative
                    compteur.tentatives = 0;
                }
                tentativeEchouee.set(email, compteur);
                return res.status(401).json({error: 'Erreur lors de la connexion'})
            }
            // tache 16connexion réussie et remet le compteur à zéro
            tentativeEchouee.delete(email);

            // tache 8, ajouter rôle
            // ex. 7 et 11 sur les token JWT
            const token = Jwt.sign(
                { id: user.id, email: user.email, role: user.role, username: user.username },
                // clé pour le token mise dans .env
                    process.env.JWT_SECRET,
                    // mis a 15minutes pour utiliser le refesh token, avant définit à 24h
                { expiresIn: '15m' }
            )

            // ex.11 implémenter un refresh token
            // connexion longue durée
            const refreshToken = Jwt.sign(                
                { id: user.id, email: user.email, role: user.role, username: user.username },
                // clé pour le token refresh mise dans .env
                    process.env.JWT_REFRESH_SECRET,
                    // mis a 7jours pour le refresh token qui prend le relai du token d'accès après son expiration de 15 minutes
                { expiresIn: '7d' }
            )

            // pour ne jamais envoyer le mdp au client
            // utilisation des tokens
            const { password: _pwd, ...safeUser } = user;
            res.json({ message: 'Connexion réussie', token, refreshToken, user: safeUser });
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

        // pour un mot de passe fort
        const mdpRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
        if (!mdpRegex.test(password)){
            return res.status(400).json({
                error: 'Le mot de passe doit avoir au moins 8 caractères,une majuscule, une minuscule, un chiffre et un caractère spécial pour être validé'
            });
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

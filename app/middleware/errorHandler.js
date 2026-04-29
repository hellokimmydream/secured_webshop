// middleware de gestion centralisée des erreurs
// il bloque toutes les erreurs non ou mal gérées de l'app

module.exports = (err, req, res, next) => {
    // log l'erreur complète dans la console serveur pour le débogage
    // mais ne l'envoie pas a user
    console.error('[ERREUR]', err.message);

    // erreur parsing JSON dans body
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Format JSON invalide' });
    }

    // erreur générique pour user
    res.status(500).json({ error: 'Erreur serveur' });
};
// charge les variables d'environnement du .env de l'app
require('dotenv').config({ path: './app/.env' });

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;
const PEPPER = process.env.PEPPER;

// petite vérif pour éviter une erreur silencieuse
if (!PEPPER) {
    console.error('ERREUR : PEPPER manquant dans app/.env');
    process.exit(1);
}

async function main() {
    // mdp + poivre comme dans AuthController.js
    const hash1 = await bcrypt.hash('admin123' + PEPPER, SALT_ROUNDS);
    const hash2 = await bcrypt.hash('password1' + PEPPER, SALT_ROUNDS);

    console.log('admin123  =>', hash1);
    console.log('password1 =>', hash2);
}

main();
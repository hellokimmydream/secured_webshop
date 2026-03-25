const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

async function main() {
    const hash1 = await bcrypt.hash('admin123', SALT_ROUNDS);
    const hash2 = await bcrypt.hash('password1', SALT_ROUNDS);

    console.log('admin123  =>', hash1);
    console.log('password1 =>', hash2);
}

main();
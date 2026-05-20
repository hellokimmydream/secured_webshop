// pour pouvoir s'enregistrer sur l'app
document.addEventListener('DOMContentLoaded', () => {

    // indicateur de force du mot de passe
    // écoute chaque touche tapée dans le champ mdp
    const champMotDePasse = document.querySelector('[name="password"]');

    champMotDePasse.addEventListener('input', function() {
        const motDePasse = champMotDePasse.value;
        const indicateur = document.getElementById('password-strength');
        
        // calcule un score de 0 à 5 si critères respectés ou non
        let score = 0;
         // longueur minimale
        if (motDePasse.length >= 8)       score++;
        // au moins une majuscule
        if (/[A-Z]/.test(motDePasse))     score++;
         // au moins une minuscule
        if (/[a-z]/.test(motDePasse))     score++;
         // au moins un chiffre
        if (/\d/.test(motDePasse))        score++;
         // au moins un caractère spécial
        if (/[\W_]/.test(motDePasse))     score++;

        // tableau des niveaux selon le score obtenu
        const niveaux = [
            { texte: '',            couleur: '' },
            { texte: 'Très faible', couleur: 'red' },
            { texte: 'Faible',      couleur: 'orange' },
            { texte: 'Moyen',       couleur: 'goldenrod' },
            { texte: 'Fort',        couleur: 'blue' },
            { texte: 'Très fort',   couleur: 'green' }
        ];

        const niveau = niveaux[score];

        // affiche le niveau seulement si le champ n'est pas vide
        if (motDePasse.length > 0) {
            indicateur.textContent = 'Force : ' + niveau.texte;
            indicateur.style.color = niveau.couleur;
        } else {
            indicateur.textContent = '';
        }
    });

    // envoi du formulaire d'inscription
    // correction avec des event pour éviter le comportement par défaut du formulaire qui recharge la page car sans c est trop fragile même si ça marche la plupart du temps
    document.getElementById('register-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.querySelector('[name="userName"]').value;
        const email    = document.querySelector('[name="email"]').value;
        const password = document.querySelector('[name="password"]').value;

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Compte créé ! Vous pouvez vous connecter.');
            window.location.href = '/login';
        } else {
            alert(data.error || 'Erreur lors de l\'inscription');
        }
    });

});
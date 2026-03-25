// Navigation commune à toutes les pages
// Pour modifier le menu, éditer uniquement ce fichier
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('topbar');
    if (!nav) return;
    nav.innerHTML = `
        <header class="topbar">
            <div class="container">
                <div class="brand">Secure Shop</div>
                <nav class="menu">
                    <a href="/">Accueil</a>
                    <a href="/profile">Profil</a>
                    <a href="/login">Connexion</a>
                    <a href="/register">Inscription</a>
                </nav>
            </div>
        </header>
    `;
});

// enlevée de la barre de nav
// <a href="/admin">Admin</a>


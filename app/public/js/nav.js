// Navigation commune à toutes les pages
// Pour modifier le menu, éditer uniquement ce fichier
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('topbar');
    if (!nav) return;

    const token = localStorage.getItem('token');
    let isAdmin = false;
    let username = '';

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            isAdmin = payload.role === 'admin';
            username = payload.username || '';
        } catch {}
    }
    // afficher le lien sur page Admin seulement si le rôle est validé

// Rediriger sur page d'acceuil si /admin sans être admin
    if (window.location.pathname === '/admin' && !isAdmin) {
        window.location.href = '/';
    }

    nav.innerHTML = `
        <header class="topbar">
            <div class="container">
                <div class="brand">Secure Shop</div>
                <nav class="menu">
                    <a href="/">Accueil</a>
                    ${token ? `
                        <a href="/profile">Profil</a>
                        ${isAdmin ? '<a href="/admin">Admin</a>' : ''}
                        <span class="nav-user">👤 ${username}</span>
                        <a href="#" id="logout-btn">Déconnexion</a>
                    ` : `
                        <a href="/login">Connexion</a>
                        <a href="/register">Inscription</a>
                    `}
                </nav>
            </div>
        </header>
    `;

    // Bouton déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = '/login';
        });
    }
});
// enlevée de la barre de nav
// <a href="/admin">Admin</a>


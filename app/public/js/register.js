//pour pouvoir s'enregister sur l'app
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();

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
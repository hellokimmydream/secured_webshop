// html contenu de la page pour login 
// 1.Implémenter une page de login en frontend
document.addEventListener('DOMContentLoaded', () => {
    const login = document.getElementById('formulaire');
    if (!login) return;
    login.innerHTML = `
        <div class="login">
            <h1>Login</h1>
            <form id="login-form">
                <label for="email">
                    <i class="fas fa-envelope"></i>
                </label>
                <input type="email" name="email" placeholder="Email" id="email" required>
                <label for="password">
                    <i class="fas fa-lock"></i>
                </label>
                <input type="password" name="password" placeholder="Password" id="password" required>
                <input type="submit" value="Login">
            </form>
            <div id="login-message" class="message"></div>
        </div>
`;

// pour écouter le formulaire envoyé
document.getElementById('login-form').addEventListener('submit', async (envoyer) => {
	envoyer.preventDefault();
	const email = document.getElementById('email').value;
	const password=document.getElementById('password').value;
	const messageDiv=document.getElementById('login-message').value;

	// envoyer les données au serveur = à authController coté back
	const response = await fetch('/api/auth/login', {
		method: 'POST',
		// header contient les en-tete http a envoyer avec la requete
		// application/json type mime qui veut dire que les données sont encodée
		header: { 'Content-Type': 'application/json'},
		body: JSON.stringify({email, password})
	});

const data = await response.json();

if (response.ok){
	messageDiv.textContent='Connexion reussie';
	messageDiv.className='Message validation';
	messageDiv.style.display='block';
	// settimeout execute code après un délai donnée
	// windows.location est une propriété qui contient url actuelle et peut redirigé vers un url donné
	setTimeout(() => window.location.href = '/', 1500);
}
else {
	messageDiv.textContent='Erreur lors de la connexion';
	messageDiv.className='Message erreur';
	messageDiv.style.display='block';
}
});

});

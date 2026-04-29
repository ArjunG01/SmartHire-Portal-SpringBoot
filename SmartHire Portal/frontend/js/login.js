document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const alertContainer = document.getElementById('alert-container');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertContainer.innerHTML = '';
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await api.post('/auth/login', { username, password });
            localStorage.setItem('user', JSON.stringify(res.data));
            window.location.href = 'index.html';
        } catch (err) {
            alertContainer.innerHTML = `<div class="alert alert-danger">Invalid username or password</div>`;
            console.error(err);
        }
    });
});

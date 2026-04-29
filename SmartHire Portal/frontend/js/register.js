document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById('registerForm');
    const alertContainer = document.getElementById('alert-container');
    const roleSeeker = document.getElementById('roleSeeker');
    const roleRecruiter = document.getElementById('roleRecruiter');
    const summaryGroup = document.getElementById('summaryGroup');

    // Toggle Summary Group visibility based on role
    function updateRoleView() {
        if (roleSeeker.checked) {
            summaryGroup.style.display = 'block';
        } else {
            summaryGroup.style.display = 'none';
        }
    }

    roleSeeker.addEventListener('change', updateRoleView);
    roleRecruiter.addEventListener('change', updateRoleView);
    updateRoleView(); // Initial state

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertContainer.innerHTML = '';
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = roleSeeker.checked ? 'JOB_SEEKER' : 'RECRUITER';
        const profileSummary = document.getElementById('profileSummary').value;

        const formData = {
            username,
            email,
            password,
            role,
            profileSummary: role === 'JOB_SEEKER' ? profileSummary : ''
        };

        try {
            await api.post('/auth/register', formData);
            window.location.href = 'login.html';
        } catch (err) {
            const errorMsg = err.response && err.response.data ? err.response.data : 'Failed to register';
            alertContainer.innerHTML = `<div class="alert alert-danger">${errorMsg}</div>`;
            console.error(err);
        }
    });
});

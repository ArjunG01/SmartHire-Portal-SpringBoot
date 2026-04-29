// Global Axios instance configuration
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Global Authentication Functions
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
}

function handleLogout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    let val = urlParams.get(param);
    if (!val && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        val = hashParams.get(param);
    }
    return val;
}

// Render Navbar
document.addEventListener("DOMContentLoaded", () => {
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        const user = getUser();
        
        // Build Nav Links
        let navLinks = `
            <li class="nav-item"><a class="nav-link mx-2" href="index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link mx-2" href="about.html">About</a></li>
            <li class="nav-item"><a class="nav-link mx-2" href="jobs.html">Browse Jobs</a></li>
        `;

        if (user && user.role === 'JOB_SEEKER') {
            navLinks += `<li class="nav-item"><a class="nav-link mx-2" href="dashboard.html">Dashboard</a></li>`;
        }
        
        if (user && user.role === 'RECRUITER') {
            navLinks += `<li class="nav-item"><a class="nav-link mx-2" href="recruiter.html">Recruiter Hub</a></li>`;
        }

        // Build User Section
        let userSection = ``;
        if (user) {
            userSection = `
                <div class="d-flex align-items-center gap-3">
                    <div class="text-end d-none d-lg-block">
                        <div class="fw-bold text-dark">${user.username || 'User'}</div>
                        <div class="text-muted small" style="line-height: 1">${user.role === 'JOB_SEEKER' ? 'Job Seeker' : 'Recruiter'}</div>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" onclick="handleLogout()">Logout</button>
                </div>
            `;
        } else {
            userSection = `
                <div class="d-flex gap-2">
                    <a href="login.html">
                        <button class="btn btn-outline-primary px-4">Login</button>
                    </a>
                    <a href="register.html">
                        <button class="btn btn-primary px-4 text-white">Sign Up</button>
                    </a>
                </div>
            `;
        }

        const navbarHTML = `
            <nav class="navbar navbar-expand-lg bg-white py-3 sticky-top shadow-sm">
                <div class="container">
                    <a class="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 text-primary-custom" href="index.html">
                        <span style="font-size: 1.5rem">💼</span> SmartHire
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-toggle="collapse" data-bs-target="#basic-navbar-nav" aria-controls="basic-navbar-nav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="basic-navbar-nav">
                        <ul class="navbar-nav mx-auto fw-medium">
                            ${navLinks}
                        </ul>
                        <div class="navbar-nav">
                            ${userSection}
                        </div>
                    </div>
                </div>
            </nav>
        `;

        navbarContainer.innerHTML = navbarHTML;
    }
});

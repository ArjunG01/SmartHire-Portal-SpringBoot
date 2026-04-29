document.addEventListener("DOMContentLoaded", () => {
    // Categories data
    const categories = [
        { name: 'Engineering', icon: '💻', count: '1.2k Jobs' },
        { name: 'Marketing', icon: '📢', count: '800 Jobs' },
        { name: 'Design', icon: '🎨', count: '500 Jobs' },
        { name: 'Finance', icon: '💰', count: '300 Jobs' },
    ];

    // Render Categories
    const categoriesContainer = document.getElementById('categories-container');
    categories.forEach(cat => {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-3 mb-3';
        col.innerHTML = `
            <div class="card text-center h-100 border-0 shadow-sm hover-lift" style="background: #f8f9fa">
                <div class="card-body py-4">
                    <div class="display-4 mb-2">${cat.icon}</div>
                    <h5 class="fw-bold">${cat.name}</h5>
                    <span class="text-muted small">${cat.count}</span>
                </div>
            </div>
        `;
        categoriesContainer.appendChild(col);
    });

    // Fetch and Render Featured Jobs
    const featuredJobsContainer = document.getElementById('featuredJobsContainer');
    const loadingElem = document.getElementById('featuredJobsLoading');

    api.get('/jobs/public')
        .then(res => {
            if (loadingElem) loadingElem.remove();
            const jobs = res.data.slice(0, 6);
            if (jobs.length === 0) {
                featuredJobsContainer.innerHTML = `<div class="col-12 text-center">No jobs available.</div>`;
                return;
            }
            jobs.forEach(job => {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4 mb-4';
                col.innerHTML = `
                    <div class="card h-100 border-0 shadow-sm card-hover">
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between mb-3">
                                <div class="rounded p-2 bg-light d-flex align-items-center justify-content-center" style="width: 50px; height: 50px">
                                    <span class="fs-4">🏢</span>
                                </div>
                                <span class="badge bg-primary-subtle text-primary border border-primary-subtle align-self-start">${job.jobType}</span>
                            </div>
                            <h5 class="card-title fw-bold text-dark">${job.title}</h5>
                            <p class="text-muted small mb-2">${job.companyName}</p>
                            <p class="text-muted small mb-3">📍 ${job.location}</p>

                            <div class="mt-auto pt-3 border-top">
                                <a href="apply.html#id=${job.id}" class="fw-bold text-decoration-none text-primary">
                                    View Details &rarr;
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                featuredJobsContainer.appendChild(col);
            });
        })
        .catch(err => {
            if (loadingElem) loadingElem.textContent = 'Error loading jobs.';
            console.error(err);
        });

    // Search Form Submit
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const kw = document.getElementById('keywordInput').value;
        window.location.href = `jobs.html#keyword=${encodeURIComponent(kw)}`;
    });
});

document.addEventListener("DOMContentLoaded", () => {
    let jobs = [];
    let filters = {
        keyword: getQueryParam('keyword') || '',
        location: '',
        type: []
    };

    const jobsListContainer = document.getElementById('jobsListContainer');
    const jobsCount = document.getElementById('jobsCount');
    
    const filterKeyword = document.getElementById('filterKeyword');
    const filterLocation = document.getElementById('filterLocation');
    const typeCheckboxes = document.querySelectorAll('.filter-type');
    const resetBtn = document.getElementById('resetFilters');

    // Init from URL
    if (filters.keyword) {
        filterKeyword.value = filters.keyword;
    }

    function fetchJobs() {
        api.get('/jobs/public')
            .then(res => {
                jobs = res.data;
                applyFilters();
            })
            .catch(err => {
                console.error(err);
                jobsListContainer.innerHTML = '<div class="text-center py-5">Error loading jobs.</div>';
            });
    }

    function applyFilters() {
        let temp = [...jobs];

        if (filters.keyword) {
            const k = filters.keyword.toLowerCase();
            temp = temp.filter(j => 
                (j.title && j.title.toLowerCase().includes(k)) ||
                (j.companyName && j.companyName.toLowerCase().includes(k)) ||
                (j.skillsRequired && j.skillsRequired.toLowerCase().includes(k))
            );
        }

        if (filters.location) {
            const l = filters.location.toLowerCase();
            temp = temp.filter(j => j.location && j.location.toLowerCase().includes(l));
        }

        if (filters.type.length > 0) {
            temp = temp.filter(j => filters.type.includes(j.jobType));
        }

        renderJobs(temp);
    }

    function renderJobs(filteredJobs) {
        jobsCount.textContent = `Browse ${filteredJobs.length} open positions`;
        jobsListContainer.innerHTML = '';

        if (filteredJobs.length === 0) {
            jobsListContainer.innerHTML = `
                <div class="card border-0 shadow-sm text-center py-5">
                    <div class="card-body">
                        <h3>No jobs found</h3>
                        <p class="text-muted">Try adjusting your filters.</p>
                    </div>
                </div>
            `;
            return;
        }

        filteredJobs.forEach(job => {
            const dateStr = new Date(job.postedDate).toLocaleDateString();
            const jobHtml = `
                <div class="card border-0 shadow-sm mb-3 hover-shadow" style="transition: all 0.2s ease;">
                    <div class="card-body p-4">
                        <div class="row">
                            <div class="col-md-1 d-none d-md-block">
                                <div class="rounded bg-light d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; font-size: 1.2rem;">
                                    🏢
                                </div>
                            </div>
                            <div class="col-md-8">
                                <h5 class="fw-bold text-primary mb-1">
                                    <a href="apply.html#id=${job.id}" class="text-decoration-none">${job.title}</a>
                                </h5>
                                <div class="mb-2">
                                    <span class="text-dark fw-medium">${job.companyName}</span>
                                    <span class="mx-2 text-muted">•</span>
                                    <span class="text-muted">${job.location}</span>
                                </div>
                                <div class="d-flex gap-2">
                                    <span class="badge bg-light text-dark border fw-normal">${job.jobType}</span>
                                    <small class="text-muted align-self-center">Posted ${dateStr}</small>
                                </div>
                            </div>
                            <div class="col-md-3 text-end d-flex flex-column justify-content-center mt-3 mt-md-0">
                                <a href="apply.html#id=${job.id}">
                                    <button class="btn btn-outline-primary w-100 rounded-pill fw-medium">View Details</button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            jobsListContainer.innerHTML += jobHtml;
        });
    }

    // Event Listeners
    filterKeyword.addEventListener('input', (e) => {
        filters.keyword = e.target.value;
        applyFilters();
    });

    filterLocation.addEventListener('input', (e) => {
        filters.location = e.target.value;
        applyFilters();
    });

    typeCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (e.target.checked) {
                filters.type.push(e.target.value);
            } else {
                filters.type = filters.type.filter(t => t !== e.target.value);
            }
            applyFilters();
        });
    });

    resetBtn.addEventListener('click', () => {
        filters = { keyword: '', location: '', type: [] };
        filterKeyword.value = '';
        filterLocation.value = '';
        typeCheckboxes.forEach(cb => cb.checked = false);
        window.history.replaceState({}, document.title, window.location.pathname);
        applyFilters();
    });

    // Start
    fetchJobs();
});

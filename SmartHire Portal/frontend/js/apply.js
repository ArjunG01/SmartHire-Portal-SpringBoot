document.addEventListener("DOMContentLoaded", () => {
    const jobId = getQueryParam('id');
    const user = getUser();
    const alertContainer = document.getElementById('alert-container');
    const loadingContainer = document.getElementById('loadingContainer');
    const jobContainer = document.getElementById('jobContainer');
    const applyModalEl = document.getElementById('applyModal');
    let applyModal;
    
    if (!jobId) {
        document.body.innerHTML = '<div class="container py-5 text-center"><h2>Job ID missing</h2></div>';
        return;
    }

    // Initialize Modal
    if (applyModalEl) {
        applyModal = new bootstrap.Modal(applyModalEl);
    }

    // Load Job
    api.get(`/jobs/${jobId}`)
        .then(res => {
            const job = res.data;
            loadingContainer.style.display = 'none';
            jobContainer.style.display = 'flex'; // It's a row, but bootstrap relies on flex
            
            document.getElementById('jobTitle').textContent = job.title;
            // Update apply modal label too
            if (document.getElementById('applyModalLabel')) {
                document.getElementById('applyModalLabel').textContent = `Apply for ${job.title}`;
            }

            document.getElementById('jobCompany').textContent = job.companyName;
            document.getElementById('jobLocation').textContent = job.location;
            
            const dateStr = new Date(job.postedDate).toLocaleDateString();
            document.getElementById('jobDate').innerHTML = `📅 Posted ${dateStr}`;
            document.getElementById('jobTypeBadge').innerHTML = `💼 ${job.jobType}`;

            const statusBadge = document.getElementById('jobStatusBadge');
            if (job.status === 'FILLED' || job.status === 'CLOSED') {
                statusBadge.className = 'badge bg-danger px-3 py-2 fs-6 fw-normal';
                statusBadge.innerHTML = `🔒 Closed / Filled`;
            } else {
                statusBadge.className = 'badge bg-success px-3 py-2 fs-6 fw-normal';
                statusBadge.innerHTML = `🟢 Available`;
            }
            
            document.getElementById('jobDesc').textContent = job.description;

            const skillsContainer = document.getElementById('jobSkills');
            if (job.skillsRequired) {
                skillsContainer.innerHTML = '';
                job.skillsRequired.split(',').forEach(skill => {
                    const badge = document.createElement('span');
                    badge.className = 'badge bg-secondary me-2 mb-2 px-3 py-2 fw-normal fs-6';
                    badge.textContent = skill.trim();
                    skillsContainer.appendChild(badge);
                });
            }

            // Render Actions
            const actionContainer = document.getElementById('actionContainer');
            if (job.status === 'FILLED' || job.status === 'CLOSED') {
                actionContainer.innerHTML = `
                    <button class="btn btn-secondary btn-lg disabled px-5 rounded-pill opacity-50">
                        This position is no longer accepting applications
                    </button>
                `;
            } else if (user && user.role === 'JOB_SEEKER') {
                actionContainer.innerHTML = `
                    <button class="btn btn-primary btn-lg px-5 rounded-pill shadow-sm" id="btnOpenApply">
                        🚀 Apply for this Job
                    </button>
                `;
                document.getElementById('btnOpenApply').addEventListener('click', () => {
                    applyModal.show();
                });
            } else if (!user) {
                actionContainer.innerHTML = `
                    <button class="btn btn-outline-primary btn-lg px-5 rounded-pill" onclick="window.location.href='login.html'">
                        Login to Apply
                    </button>
                `;
            } else {
                actionContainer.innerHTML = `
                    <button class="btn btn-secondary btn-lg disabled px-5 rounded-pill opacity-50">
                        Recruiters View Only
                    </button>
                `;
            }

        })
        .catch(err => {
            console.error(err);
            loadingContainer.style.display = 'none';
            alertContainer.innerHTML = '<div class="alert alert-danger text-center">Job not found</div>';
        });

    // Handle Application Submit
    const applyForm = document.getElementById('applyForm');
    if (applyForm) {
        applyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const resumeFile = document.getElementById('resumeFile').files[0];
            if (!resumeFile) {
                alert("Please select a resume file.");
                return;
            }

            const formData = new FormData();
            formData.append('resume', resumeFile);

            try {
                const submitBtn = document.getElementById('btnSubmitApp');
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Submitting...';

                await api.post(`/applications/${jobId}/apply`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                applyModal.hide();
                alertContainer.innerHTML = '<div class="alert alert-success text-center fw-medium">Application submitted successfully! Good luck!</div>';
                
                // reset
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Application';
                applyForm.reset();
            } catch (err) {
                console.error(err);
                applyModal.hide();
                const errorMsg = err.response && err.response.data ? err.response.data : 'Failed to apply';
                alertContainer.innerHTML = `<div class="alert alert-danger text-center fw-medium">${errorMsg}</div>`;
                
                const submitBtn = document.getElementById('btnSubmitApp');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Application';
            }
        });
    }
});

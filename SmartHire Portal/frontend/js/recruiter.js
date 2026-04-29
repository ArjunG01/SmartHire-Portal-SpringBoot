document.addEventListener("DOMContentLoaded", () => {
    const user = getUser();
    if (!user || user.role !== 'RECRUITER') {
        window.location.href = 'login.html';
        return;
    }

    const viewJobsContainer = document.getElementById('viewJobsContainer');
    const viewApplicationsContainer = document.getElementById('viewApplicationsContainer');
    
    function handleRouting() {
        const appJobId = getQueryParam('viewApplications');
        if (appJobId) {
            viewJobsContainer.style.display = 'none';
            viewApplicationsContainer.style.display = 'block';
            initApplicationsView(appJobId);
        } else {
            viewJobsContainer.style.display = 'block';
            viewApplicationsContainer.style.display = 'none';
            initJobsView();
        }
    }

    handleRouting();
    window.addEventListener('hashchange', handleRouting);

    // --- JOBS VIEW LOGIC ---
    function initJobsView() {
        const myJobsList = document.getElementById('myJobsList');
        const btnOpenCreateModal = document.getElementById('btnOpenCreateModal');
        const jobForm = document.getElementById('jobForm');
        let jobModal;
        const jobModalEl = document.getElementById('jobModal');
        if (jobModalEl) {
            jobModal = new bootstrap.Modal(jobModalEl);
        }

        function fetchMyJobs() {
            api.get('/jobs/my-jobs')
                .then(res => {
                    const jobs = res.data;
                    myJobsList.innerHTML = '';
                    if (jobs.length === 0) {
                        myJobsList.innerHTML = `
                            <div class="col-12 text-center py-5">
                                <p class="lead text-muted">You haven't posted any jobs yet.</p>
                                <button class="btn btn-primary" onclick="document.getElementById('btnOpenCreateModal').click()">Create Your First Job</button>
                            </div>
                        `;
                        return;
                    }
                    
                    jobs.forEach(job => {
                        const dateStr = new Date(job.postedDate).toLocaleDateString();
                        const badgeColor = job.status === 'FILLED' ? 'secondary' : 'success';
                        const statusTxt = job.status || 'Active';
                        const vacancy = job.vacancy || 1;

                        const col = document.createElement('div');
                        col.className = 'col-md-6 col-lg-4 mb-4';
                        col.innerHTML = `
                            <div class="card h-100 border-0 shadow-sm">
                                <div class="card-body p-4 d-flex flex-column">
                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h5 class="card-title fw-bold fs-5 mb-1">${job.title}</h5>
                                            <h6 class="card-subtitle text-muted small">${job.companyName}</h6>
                                        </div>
                                        <span class="badge bg-${badgeColor} fw-normal">${statusTxt}</span>
                                    </div>

                                    <div class="mb-4 flex-grow-1">
                                        <div class="text-muted small mb-2"><strong>Location:</strong> ${job.location}</div>
                                        <div class="text-muted small mb-2"><strong>Vacancy:</strong> ${vacancy}</div>
                                        <div class="text-muted small"><strong>Posted:</strong> ${dateStr}</div>
                                    </div>

                                        <div class="d-grid gap-2">
                                            <button class="btn btn-outline-primary btn-sm btn-view-apps">View Applicants</button>
                                            <div class="d-flex gap-2">
                                                <button class="btn btn-outline-secondary btn-sm flex-grow-1 btn-edit">Edit</button>
                                                <button class="btn btn-outline-danger btn-sm btn-delete">Delete</button>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        `;

                        // Bind edit/delete/view
                        col.querySelector('.btn-view-apps').addEventListener('click', (e) => {
                            e.preventDefault();
                            window.location.hash = `viewApplications=${job.id}`;
                            handleRouting();
                        });
                        col.querySelector('.btn-edit').addEventListener('click', () => openEditModal(job));
                        col.querySelector('.btn-delete').addEventListener('click', () => deleteJob(job.id));

                        myJobsList.appendChild(col);
                    });
                })
                .catch(err => {
                    console.error(err);
                    myJobsList.innerHTML = '<div class="col-12 text-center py-5">Error loading jobs.</div>';
                });
        }

        function deleteJob(id) {
            if (!confirm("Are you sure you want to delete this job?")) return;
            api.delete(`/jobs/${id}`)
                .then(() => fetchMyJobs())
                .catch(() => alert('Failed to delete job'));
        }

        function openEditModal(job) {
            document.getElementById('jobModalTitle').textContent = 'Edit Job';
            document.getElementById('jobId').value = job.id;
            document.getElementById('jobTitle').value = job.title;
            document.getElementById('jobCompany').value = job.companyName;
            document.getElementById('jobLocation').value = job.location;
            document.getElementById('jobType').value = job.jobType;
            document.getElementById('jobVacancy').value = job.vacancy || 1;
            document.getElementById('jobStatus').value = job.status || 'OPEN';
            document.getElementById('jobDesc').value = job.description;
            document.getElementById('jobSkills').value = job.skillsRequired;
            document.getElementById('btnSubmitJob').textContent = 'Save Changes';
            jobModal.show();
        }

        btnOpenCreateModal.addEventListener('click', () => {
            document.getElementById('jobModalTitle').textContent = 'Post a New Job';
            document.getElementById('jobId').value = '';
            jobForm.reset();
            document.getElementById('jobType').value = 'Full-time';
            document.getElementById('jobStatus').value = 'OPEN';
            document.getElementById('jobVacancy').value = '1';
            document.getElementById('btnSubmitJob').textContent = 'Post Job';
            jobModal.show();
        });

        jobForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const payload = {
                title: document.getElementById('jobTitle').value,
                companyName: document.getElementById('jobCompany').value,
                location: document.getElementById('jobLocation').value,
                jobType: document.getElementById('jobType').value,
                vacancy: parseInt(document.getElementById('jobVacancy').value),
                status: document.getElementById('jobStatus').value,
                description: document.getElementById('jobDesc').value,
                skillsRequired: document.getElementById('jobSkills').value,
            };

            const jId = document.getElementById('jobId').value;
            const req = jId ? api.put(`/jobs/${jId}`, payload) : api.post('/jobs/', payload);

            req.then(() => {
                jobModal.hide();
                fetchMyJobs();
            }).catch(err => {
                console.error(err);
                alert(jId ? 'Failed to update job' : 'Failed to post job');
            });
        });

        fetchMyJobs();
    }

    // --- APPLICATIONS VIEW LOGIC ---
    function initApplicationsView(jobId) {
        const appsAlertContainer = document.getElementById('appsAlertContainer');
        const tbody = document.getElementById('applicationsTableBody');

        function fetchApplications() {
            api.get(`/applications/job/${jobId}`)
                .then(res => {
                    const apps = res.data;
                    tbody.innerHTML = '';
                    if (apps.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">No applicants found for this job yet.</td></tr>';
                        return;
                    }

                    apps.forEach(app => {
                        const dateStr = new Date(app.appliedDate).toLocaleDateString();
                        let badgeColor = 'warning';
                        if (app.status === 'ACCEPTED') badgeColor = 'success';
                        if (app.status === 'REJECTED') badgeColor = 'danger';

                        let resumeBtnHtml = `<span class="text-muted small">Not provided</span>`;
                        if (app.resumePath) {
                            resumeBtnHtml = `<button class="btn btn-outline-primary btn-sm rounded-pill px-3 btn-resume" data-path="${app.resumePath}">⬇ Download</button>`;
                        }

                        let actionsHtml = `<div class="d-flex justify-content-end gap-2">`;
                        if (app.status !== 'ACCEPTED') {
                            actionsHtml += `<button class="btn btn-success btn-sm rounded-pill px-3 btn-accept">Accept</button>`;
                        }
                        if (app.status !== 'REJECTED') {
                            actionsHtml += `<button class="btn btn-outline-danger btn-sm rounded-pill px-3 btn-reject">Reject</button>`;
                        }
                        actionsHtml += `</div>`;

                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="ps-4 fw-medium">${app.seekerName}</td>
                            <td><a href="mailto:${app.seekerEmail}" class="text-decoration-none">${app.seekerEmail}</a></td>
                            <td class="text-muted">${dateStr}</td>
                            <td>${resumeBtnHtml}</td>
                            <td><span class="badge bg-${badgeColor} px-3 py-2 fw-normal">${app.status}</span></td>
                            <td class="pe-4 text-end">${actionsHtml}</td>
                        `;

                        // Bind events
                        const btnResume = tr.querySelector('.btn-resume');
                        if (btnResume) {
                            btnResume.addEventListener('click', () => downloadResume(app.resumePath));
                        }

                        const btnAccept = tr.querySelector('.btn-accept');
                        if (btnAccept) {
                            btnAccept.addEventListener('click', () => updateStatus(app.id, 'ACCEPTED'));
                        }

                        const btnReject = tr.querySelector('.btn-reject');
                        if (btnReject) {
                            btnReject.addEventListener('click', () => updateStatus(app.id, 'REJECTED'));
                        }

                        tbody.appendChild(tr);
                    });
                })
                .catch(err => {
                    console.error(err);
                    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">Failed to load applications.</td></tr>';
                });
        }

        function updateStatus(appId, status) {
            api.put(`/applications/${appId}/status?status=${status}`)
                .then(() => {
                    appsAlertContainer.innerHTML = '<div class="alert alert-success">Status updated successfully</div>';
                    fetchApplications();
                    setTimeout(() => appsAlertContainer.innerHTML = '', 3000);
                })
                .catch(() => alert('Failed to update status'));
        }

        async function downloadResume(path) {
            try {
                const filename = path.split('_').pop();
                const response = await api.get(`/users/resume/${path}`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
            } catch (err) {
                alert("Failed to download resume");
            }
        }

        fetchApplications();
    }
});

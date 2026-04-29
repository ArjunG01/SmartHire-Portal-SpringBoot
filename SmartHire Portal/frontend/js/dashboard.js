document.addEventListener("DOMContentLoaded", () => {
    const user = getUser();
    if (!user || user.role !== 'JOB_SEEKER') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('pUsername').textContent = user.username;
    document.getElementById('pEmail').textContent = user.email || 'N/A';

    const alertContainer = document.getElementById('alert-container');
    const resumeNameTxt = document.getElementById('resumeNameTxt');
    const applicationsTableBody = document.getElementById('applicationsTableBody');
    const resumeFileInput = document.getElementById('resumeFileInput');
    const btnUpload = document.getElementById('btnUpload');
    const uploadResumeForm = document.getElementById('uploadResumeForm');

    function fetchProfile() {
        api.get('/users/profile')
            .then(res => {
                if (res.data.resumePath) {
                    resumeNameTxt.textContent = res.data.resumePath.split('_').pop();
                } else {
                    resumeNameTxt.textContent = 'No resume uploaded';
                }
                if (res.data.email) {
                    document.getElementById('pEmail').textContent = res.data.email;
                }
            })
            .catch(err => console.error(err));
    }

    function fetchApplications() {
        api.get('/applications/my-applications')
            .then(res => {
                const apps = res.data;
                applicationsTableBody.innerHTML = '';
                if (apps.length === 0) {
                    applicationsTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">You haven\'t applied to any jobs yet.</td></tr>';
                    return;
                }
                apps.forEach(app => {
                    let badgeClass = 'warning';
                    if (app.status === 'ACCEPTED') badgeClass = 'success';
                    if (app.status === 'REJECTED') badgeClass = 'danger';

                    const dateStr = new Date(app.appliedDate).toLocaleDateString();
                    
                    let extraMsg = '';
                    if (app.status === 'ACCEPTED') {
                        extraMsg = '<div class="text-success small mt-1">The recruiter will contact you via email shortly.</div><div id="techMsg-' + app.id + '" class="text-muted small mt-1"></div>';
                        
                        api.get('/jobs/' + app.jobId)
                            .then(jobRes => {
                                const job = jobRes.data;
                                if (job.skillsRequired) {
                                    document.getElementById('techMsg-' + app.id).innerHTML = `<strong>Technologies to prepare:</strong> ${job.skillsRequired}`;
                                }
                            })
                            .catch(e => console.error(e));
                    }

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="ps-4 fw-medium">${app.jobTitle}</td>
                        <td class="text-muted">${app.companyName}</td>
                        <td class="text-muted">${dateStr}</td>
                        <td class="pe-4 text-end">
                            <span class="badge bg-${badgeClass} px-3 py-2 fw-normal">${app.status}</span>
                            ${extraMsg}
                        </td>
                    `;
                    applicationsTableBody.appendChild(tr);
                });
            })
            .catch(err => {
                console.error(err);
                applicationsTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">Failed to load applications.</td></tr>';
            });
    }

    resumeFileInput.addEventListener('change', () => {
        btnUpload.disabled = !resumeFileInput.files.length;
    });

    uploadResumeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = resumeFileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            btnUpload.disabled = true;
            btnUpload.textContent = 'Uploading...';
            await api.post('/users/upload-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alertContainer.innerHTML = '<div class="alert alert-success mt-3">Resume uploaded successfully!</div>';
            fetchProfile();
            uploadResumeForm.reset();
            btnUpload.textContent = 'Upload New Resume';
        } catch (err) {
            alertContainer.innerHTML = '<div class="alert alert-danger mt-3">Failed to upload resume.</div>';
            btnUpload.disabled = false;
            btnUpload.textContent = 'Upload New Resume';
        }
    });

    fetchProfile();
    fetchApplications();
});

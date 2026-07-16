// escape user input to prevent HTML injection
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
};

// Modal handlers
const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = "flex";
    
    // Bind profile values when opening profile modal
    if (id === 'profileModal' && patient) {
        document.getElementById("prof-name").value = patient.name || "";
        document.getElementById("prof-age").value = patient.age || "";
        document.getElementById("prof-sex").value = patient.sex || "";
        document.getElementById("prof-mobile").value = patient.mobile || "";
        document.getElementById("prof-allergies").value = patient.allergies || "";
        document.getElementById("prof-meds").value = patient.meds || "";
        document.getElementById("prof-conditions").value = patient.conditions || "";
    }
};

const closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "none";
    }
};

// Close modal when clicking outside contents
window.onclick = (event) => {
    const modals = ["settingsModal", "profileModal", "loginModal", "symptomWizardModal"];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal && event.target === modal) {
            modal.style.display = "none";
        }
    });
};
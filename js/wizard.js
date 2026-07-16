// Open and reset symptom checker wizard
const openSymptomWizard = () => {
    currentWizStep = 1;
    currentSeverity = "Moderate";
    
    document.getElementById("wiz-symptoms").value = "";
    document.querySelectorAll(".wiz-assoc").forEach(cb => cb.checked = false);
    document.querySelectorAll(".wiz-flags").forEach(cb => cb.checked = false);
    document.getElementById("flags-none").checked = true;
    
    showWizardStep(1);
    openModal("symptomWizardModal");
};

const selectSeverity = (severity) => {
    currentSeverity = severity;
    document.querySelectorAll("#step-2 .choice-card").forEach(card => {
        card.classList.remove("selected");
    });
    document.getElementById(`sev-${severity}`).classList.add("selected");
};

const toggleNoFlags = (noneCheckbox) => {
    if (noneCheckbox.checked) {
        document.querySelectorAll(".wiz-flags").forEach(cb => {
            if (cb !== noneCheckbox) cb.checked = false;
        });
    }
};

document.addEventListener("change", (e) => {
    if (e.target.classList.contains("wiz-flags") && e.target.id !== "flags-none") {
        if (e.target.checked) {
            document.getElementById("flags-none").checked = false;
        }
    }
});

const showWizardStep = (step) => {
    currentWizStep = step;
    
    document.querySelectorAll(".wizard-step").forEach(el => el.classList.remove("active"));
    document.getElementById(`step-${step}`).classList.add("active");

    document.querySelectorAll(".step-dot").forEach((dot, idx) => {
        dot.className = "step-dot";
        if (idx + 1 < step) dot.classList.add("completed");
        if (idx + 1 === step) dot.classList.add("active");
    });

    const prevBtn = document.getElementById("wiz-prev-btn");
    const nextBtn = document.getElementById("wiz-next-btn");

    prevBtn.disabled = step === 1;
    
    if (step === 5) {
        nextBtn.innerHTML = '<i class="fas fa-stethoscope"></i> Check Symptoms';
        document.getElementById("wiz-summary-review").innerHTML = compileSummaryHTML();
    } else {
        nextBtn.innerHTML = 'Next';
    }
};

const wizardNext = () => {
    if (currentWizStep === 1) {
        const sympts = document.getElementById("wiz-symptoms").value.trim();
        if (!sympts) {
            alert("Please describe your symptoms briefly before proceeding.");
            return;
        }
    }
    
    if (currentWizStep < 5) {
        showWizardStep(currentWizStep + 1);
    } else {
        const compiledReport = compileSymptomReport();
        closeModal("symptomWizardModal");
        
        appendMessage(compiledReport, 'user-wrapper');
        sendRequest(compiledReport);
    }
};

const wizardPrev = () => {
    if (currentWizStep > 1) {
        showWizardStep(currentWizStep - 1);
    }
};

const compileSummaryHTML = () => {
    const symptoms = document.getElementById("wiz-symptoms").value.trim();
    const duration = document.getElementById("wiz-duration").value;
    const progression = document.querySelector('input[name="wiz-progression"]:checked')?.value || "Unchanged";
    
    const associated = [];
    document.querySelectorAll(".wiz-assoc:checked").forEach(cb => associated.push(cb.value));
    
    const redFlags = [];
    document.querySelectorAll(".wiz-flags:checked").forEach(cb => redFlags.push(cb.value));

    let html = `<p><strong>Primary Symptoms:</strong> ${symptoms}</p>`;
    html += `<p><strong>Duration:</strong> ${duration} &bull; <strong>Severity:</strong> ${currentSeverity}</p>`;
    html += `<p><strong>Progression:</strong> ${progression}</p>`;
    html += `<p><strong>Other Symptoms:</strong> ${associated.length > 3 ? associated.slice(0, 3).join(', ') + '...' : associated.join(', ')}</p>`;
    
    const hasFlags = redFlags.length > 0 && !redFlags.includes('None of these');
    const flagsColor = hasFlags ? 'var(--accent-danger)' : 'var(--text-main)';
    html += `<p style="color: ${flagsColor}"><strong>Emergency Red Flags:</strong> ${hasFlags ? redFlags.join(', ') : 'None'}</p>`;
    
    return html;
};

const compileSymptomReport = () => {
    const symptoms = document.getElementById("wiz-symptoms").value.trim();
    const duration = document.getElementById("wiz-duration").value;
    const progression = document.querySelector('input[name="wiz-progression"]:checked')?.value || "Unchanged";
    
    const associated = [];
    document.querySelectorAll(".wiz-assoc:checked").forEach(cb => associated.push(cb.value));
    
    const redFlags = [];
    document.querySelectorAll(".wiz-flags:checked").forEach(cb => redFlags.push(cb.value));
    
    let report = `### 🩺 Symptom Assessment Report\n\n`;
    report += `I would like a medical assessment based on the following symptoms:\n\n`;
    report += `* **Primary Symptoms:** ${symptoms || 'Not described'}\n`;
    report += `* **Duration:** ${duration}\n`;
    report += `* **Severity Level:** ${currentSeverity}\n`;
    report += `* **Progression of Symptoms:** ${progression}\n`;
    report += `* **Associated Symptoms:** ${associated.length > 0 ? associated.join(', ') : 'None'}\n`;
    
    const hasFlags = redFlags.length > 0 && !redFlags.includes('None of these');
    report += `* **Emergency Red Flags checked:** ${hasFlags ? redFlags.join(', ') : 'None'}\n\n`;
    
    if (hasFlags) {
        report += `⚠️ Note: The patient has checked severe warnings (${redFlags.join(', ')}). Please provide appropriate immediate caution guidance first.`;
    } else {
        report += `Please evaluate possible reasons for these symptoms, starting with the most common and likely causes first. Recommend home remedies and clinical indicators of when a physician should be consulted.`;
    }
    
    return report;
};

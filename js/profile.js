// Update sidebar patient indicator card
const updateProfileWidgets = () => {
    document.getElementById("widget-name").textContent = patient.name || "Guest Patient";
    const initial = (patient.name || "Guest").charAt(0).toUpperCase();
    document.getElementById("widget-avatar").textContent = initial;

    let summary = "";
    if (patient.age) summary += `${patient.age}yo `;
    if (patient.sex) summary += `${patient.sex} `;
    if (patient.allergies && patient.allergies !== "None") summary += `• Allergies`;
    
    document.getElementById("widget-summary").textContent = summary || "No health profile set";
};

// Save form values to localStorage
const savePatientProfile = () => {
    patient.name = document.getElementById("prof-name").value.trim() || "Guest Patient";
    patient.age = document.getElementById("prof-age").value.trim();
    patient.sex = document.getElementById("prof-sex").value;
    patient.mobile = document.getElementById("prof-mobile").value.trim();
    patient.allergies = document.getElementById("prof-allergies").value.trim() || "None";
    patient.meds = document.getElementById("prof-meds").value.trim() || "None";
    patient.conditions = document.getElementById("prof-conditions").value.trim() || "None";

    const loggedUser = localStorage.getItem("atrix_logged_in_user") || "guest";
    localStorage.setItem(`atrix_profile_${loggedUser}`, JSON.stringify(patient));
    
    updateProfileWidgets();
    closeModal("profileModal");
    alert("Patient profile updated successfully!");
};

// Format system clinical instructions
const getSystemInstruction = (profile) => {
    let instruction = `You are Atrix, a precise, professional, and empathetic medical assistant.
Your goal is to guide patients through their symptoms and medical doubts safely and objectively.
IMPORTANT GUIDELINES:
1. Ground your answers ONLY in medical science, clinical knowledge, and peer-reviewed studies.
2. DO NOT catastrophize. Avoid suggesting rare, extreme, or fatal diseases for common symptoms unless there are clear matching alarm indicators.
3. Be clear, reassuring, and structured. Use formatting like bullet points, tables, warnings, and short paragraphs.
4. When describing possible reasons for symptoms (like headache and body pain), start with the most common and likely causes (e.g., dehydration, muscle strain, viral infections like flu or cold, tension headache) before mentioning other potential causes.
5. ALWAYS check if the patient is experiencing any red flag symptoms. If they do, advise them in a bold Red Alert block to seek immediate emergency care.
6. Remember that you are an AI assistant, not a doctor. Emphasize that your guidance is for informational purposes only.`;

    if (profile && profile.age) {
        instruction += `\n\nTAILOR YOUR GUIDANCE TO THIS PATIENT PROFILE:
- Patient Name: ${profile.name}
- Age: ${profile.age || 'Not specified'}
- Biological Sex: ${profile.sex || 'Not specified'}
- Known Allergies: ${profile.allergies || 'None'}
- Current Medications: ${profile.meds || 'None'}
- Pre-existing Health Conditions: ${profile.conditions || 'None'}
If the patient's symptoms or treatments interact with their allergies, medications, or health conditions, prioritize flagging those risks immediately!`;
    }
    return instruction;
};

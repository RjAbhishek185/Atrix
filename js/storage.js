// Global state definition
let storedModel = localStorage.getItem("atrix_model");

if (!storedModel || ["gemini-3.5-flash", "gemini-3.1-pro", "gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-pro"].includes(storedModel)) {
    storedModel = "llama-3.3-70b-versatile";
    localStorage.setItem("atrix_model", "llama-3.3-70b-versatile");
}

let apiConfig = {
    key: localStorage.getItem("atrix_api_key") || "",
    model: storedModel,
    ttsEnabled: localStorage.getItem("atrix_tts") !== "false"
};

let patient = {
    name: "",
    age: "",
    sex: "",
    mobile: "",
    allergies: "None",
    meds: "None",
    conditions: "None"
};

let activeChat = "";
let history = {}; 
let activeFile = null;
let recognition = null;
let isListening = false;

let currentWizStep = 1;
let currentSeverity = "Moderate";

// Toggle warning UI based on key existence
const checkApiKeyStatus = () => {
    const bar = document.getElementById("api-warning");
    if (bar) {
        bar.style.display = apiConfig.key ? "none" : "flex";
    }
};

// Persist user configuration settings
const saveSettings = () => {
    const keyVal = document.getElementById("settings-api-key").value.trim();
    const modelVal = document.getElementById("settings-model").value;
    const ttsVal = document.getElementById("settings-tts").checked;

    apiConfig.key = keyVal;
    apiConfig.model = modelVal;
    apiConfig.ttsEnabled = ttsVal;

    localStorage.setItem("atrix_api_key", keyVal);
    localStorage.setItem("atrix_model", modelVal);
    localStorage.setItem("atrix_tts", ttsVal.toString());

    closeModal("settingsModal");
    checkApiKeyStatus();
    alert("Settings saved successfully!");
};

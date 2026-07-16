// Main Entry Point
document.addEventListener("DOMContentLoaded", () => {
    // Synchronize configuration UI elements
    const keyInput = document.getElementById("settings-api-key");
    const modelSelect = document.getElementById("settings-model");
    const ttsCheck = document.getElementById("settings-tts");

    if (keyInput) keyInput.value = apiConfig.key;
    if (modelSelect) modelSelect.value = apiConfig.model;
    if (ttsCheck) ttsCheck.checked = apiConfig.ttsEnabled;

    checkApiKeyStatus();
    loadActiveUserSession();
    initSpeechRecognition();
    loadChats();
    selectSeverity("Moderate");

    // Shortcut: Ctrl + Enter to submit message
    const msgInput = document.getElementById("message-input");
    if (msgInput) {
        msgInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault();
                const form = document.getElementById("chat-form");
                if (form) {
                    // Trigger submit event
                    const submitEvent = new Event("submit", { cancelable: true });
                    form.dispatchEvent(submitEvent);
                }
            }
        });
    }

    // Shortcut: Ctrl + K to focus search chats input
    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "k" && e.ctrlKey) {
            e.preventDefault();
            const searchInput = document.getElementById("search-history");
            if (searchInput) searchInput.focus();
        }
    });

    // Shortcut: Escape to close open modal panels
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modals = document.querySelectorAll(".modal");
            modals.forEach(m => {
                if (m.style.display === "flex" || m.style.display === "block") {
                    m.style.display = "none";
                }
            });
        }
    });

    // Dynamic filtering for sidebar chat history items
    const searchInput = document.getElementById("search-history");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const val = e.target.value.toLowerCase();
            const items = document.querySelectorAll("#history-list .history-item");
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(val) ? "block" : "none";
            });
        });
    }
});

// Process submission of user chats
const handleChatSubmit = (event) => {
    if (event) event.preventDefault();
    const input = document.getElementById("message-input");
    const text = input.value.trim();
    if (!text && !activeFile) return;

    const fileHtml = activeFile ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;"><i class="fas fa-paperclip"></i> Attached: ${activeFile.name}</div>` : "";
    appendMessage(text, 'user-wrapper', fileHtml);

    input.value = "";
    sendRequest(text);
};

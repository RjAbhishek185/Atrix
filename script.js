const chatBody = document.getElementById("chat-body");
const messageInput = document.querySelector(".message-input");
const micBtn = document.getElementById("mic-button");
const uploadBtn = document.getElementById("upload-button");
const fileInput = document.getElementById("file-input");
const sendBtn = document.querySelector(".chat-form button[type='submit']");
const historyList = document.getElementById("history-list"); //  Add history panel element

//  Replace with your Gemini 2.5 Pro API Key
const API_KEY = "AIzaSyCowaiAlyBEeJ2pTyeGnvni56Mu-J4-n1A";
const MODEL = "gemini-2.5-pro";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

const createMessageElement = (text, className) => {
    const div = document.createElement("div");
    div.className = className;
    const span = document.createElement("div");
    span.className = "message-text";
    span.innerHTML = text;
    div.appendChild(span);
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
};

const sendToGemini = async (userText, botDiv) => {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    { parts: [{ text: userText }] }
                ]
            })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error?.message || "Unknown error");

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "⚠️ No response.";
        botDiv.querySelector(".message-text").innerHTML = marked.parse(reply);
    } catch (err) {
        console.error(err);
        botDiv.querySelector(".message-text").textContent = `❌ Error: ${err.message}`;
    } finally {
        botDiv.classList.remove("thinking");
        chatBody.scrollTop = chatBody.scrollHeight;
    }
};

const addToHistory = (question) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.textContent = question;

    item.addEventListener("click", () => {
        messageInput.value = question;
        handleSend(); // resend
    });

    historyList.appendChild(item);
};

const handleSend = (e) => {
    e.preventDefault();
    const userText = messageInput.value.trim();
    if (!userText) return;

    createMessageElement(userText, "user-message");
    addToHistory(userText); //  add to history

    const botDiv = createMessageElement("...", "bot-message thinking");
    botDiv.querySelector(".message-text").innerHTML = `
        <div class="thinking-indicator">
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>
    `;

    messageInput.value = "";
    sendToGemini(userText, botDiv);
};

//  Speech recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    micBtn.addEventListener("click", () => recognition.start());
    recognition.onresult = (event) => {
        messageInput.value = event.results[0][0].transcript;
    };
}

//  File upload menu
uploadBtn.addEventListener("click", () => {
    const menu = document.createElement("div");
    menu.style.position = "absolute";
    menu.style.bottom = "70px";
    menu.style.right = "20px";
    menu.style.background = "#fff";
    menu.style.border = "1px solid #ccc";
    menu.style.borderRadius = "6px";
    menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    menu.style.zIndex = "1000";
    menu.innerHTML = `
        <div style="padding: 8px; cursor: pointer;" id="camera-option">📸 Use Camera</div>
        <div style="padding: 8px; cursor: pointer;" id="device-option">📁 Upload from Device</div>
    `;
    document.body.appendChild(menu);

    document.getElementById("camera-option").onclick = () => {
        fileInput.setAttribute("accept", "image/*");
        fileInput.setAttribute("capture", "environment");
        fileInput.click();
        menu.remove();
    };

    document.getElementById("device-option").onclick = () => {
        fileInput.removeAttribute("capture");
        fileInput.setAttribute("accept", "*/*");
        fileInput.click();
        menu.remove();
    };

    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && e.target !== uploadBtn) {
            menu.remove();
        }
    }, { once: true });
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
        createMessageElement(`📎 You uploaded: ${file.name}`, "user-message");
        setTimeout(() => {
            createMessageElement("✅ File received. Thanks!", "bot-message");
        }, 500);
    }
});

//  Send on button click / Enter
sendBtn.addEventListener("click", handleSend);
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend(e);
});

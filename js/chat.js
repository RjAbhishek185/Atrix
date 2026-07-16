// Render message boxes in chat area
const appendMessage = (text, className, fileHtml = "", sources = null) => {
    const chatBody = document.getElementById("chat-body");
    const wrapper = document.createElement("div");
    wrapper.className = `message-wrapper ${className}`;

    const isBot = className.includes("bot-wrapper");
    const metaIcon = isBot ? "fa-robot" : "fa-user";
    const metaText = isBot ? "Atrix Assistant" : (patient.name || "Patient");

    let metaHtml = `<div class="message-meta"><i class="fas ${metaIcon}"></i> ${metaText}</div>`;
    let bodyHtml = `<div class="message-box">${isBot ? marked.parse(text) : escapeHtml(text)}</div>`;

    let sourcesHtml = "";
    if (isBot && sources && sources.length > 0) {
        sourcesHtml = `
            <div class="sources-container">
                <div class="sources-title"><i class="fas fa-check-double"></i> References</div>
                <div class="sources-list">
                    ${sources.map((src, idx) => `
                        <a href="${src.uri}" target="_blank" class="source-link">
                            <span>[${idx + 1}] ${src.title}</span>
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    let speechHtml = "";
    if (isBot) {
        speechHtml = `
            <div class="speech-control">
                <button type="button" class="speech-btn" onclick="speak(this, \`${text.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)" title="Listen to response">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
    }

    wrapper.innerHTML = metaHtml + bodyHtml + fileHtml + sourcesHtml + speechHtml;
    chatBody.appendChild(wrapper);
    chatBody.scrollTop = chatBody.scrollHeight;
    return wrapper;
};

// Load chat session list into sidebar
const loadChats = () => {
    const savedSessions = localStorage.getItem("atrix_chat_sessions");
    const list = document.getElementById("history-list");
    list.innerHTML = "";

    if (savedSessions) {
        history = JSON.parse(savedSessions);
    } else {
        history = {};
    }

    Object.keys(history).reverse().forEach(sessionId => {
        const session = history[sessionId];
        const item = document.createElement("div");
        item.className = "history-item";
        item.textContent = session.title;
        item.title = session.title;

        if (sessionId === activeChat) {
            item.style.borderColor = "var(--accent-primary)";
            item.style.color = "white";
        }

        item.addEventListener("click", () => loadSessionChat(sessionId));
        list.appendChild(item);
    });
};

const saveChat = () => {
    localStorage.setItem("atrix_chat_sessions", JSON.stringify(history));
};

const startNewChat = () => {
    activeChat = "";
    const chatBody = document.getElementById("chat-body");
    chatBody.innerHTML = `
      <div class="message-wrapper bot-wrapper">
        <div class="message-meta">
          <i class="fas fa-robot"></i> Atrix Assistant &bull; Medical Assistant
        </div>
        <div class="message-box">
          <p>👋 Hello, I am <strong>Atrix</strong>, your medical assistant.</p>
          <p>I can help guide you through common symptoms and medical doubts. Unlike general search engines, my responses are tailored to be precise and are grounded in **medical publications and guidelines** (cites will be listed below when used).</p>
          <p>How can I assist you with your health today? You can type your query below, upload a report, or use the <strong>Symptom Assessment</strong> tool at the top to complete a structured assessment.</p>
        </div>
      </div>
    `;
    loadChats(); 
};

const loadSessionChat = (sessionId) => {
    activeChat = sessionId;
    const session = history[sessionId];
    const chatBody = document.getElementById("chat-body");
    chatBody.innerHTML = "";

    session.messages.forEach(msg => {
        if (msg.role === 'user') {
            const fileStr = msg.fileName ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;"><i class="fas fa-paperclip"></i> Attached: ${msg.fileName}</div>` : "";
            appendMessage(msg.text, 'user-wrapper', fileStr);
        } else if (msg.role === 'model') {
            appendMessage(msg.text, 'bot-wrapper', "", msg.sources);
        }
    });

    loadChats(); 
};

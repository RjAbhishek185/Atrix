// Clean search terms from symptom description
const extractKeywords = (text) => {
    const stopWords = new Set(["hello", "please", "what", "causes", "reasons", "about", "having", "with", "from", "some", "this", "that", "treatment", "cure", "help", "atrix", "symptom", "checker", "report", "having", "have", "doctor", "assessment"]);
    const words = text.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));
    return words.length > 0 ? words.slice(0, 4).join(" AND ") : "headache pain";
};

// Fetch clinical articles from PubMed API
const fetchPubMedContext = async (keywordQuery) => {
    try {
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(keywordQuery)}&retmode=json&retmax=4`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        const idList = searchData.esearchresult?.idlist || [];
        
        if (idList.length === 0) return { context: "", sources: [] };
        
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json`;
        const summaryRes = await fetch(summaryUrl);
        const summaryData = await summaryRes.json();
        
        const sources = [];
        let contextText = "AUTHENTIC MEDLINE/PUBMED CLINICAL PUBLICATIONS CONTEXT:\n";
        
        idList.forEach(id => {
            const doc = summaryData.result?.[id];
            if (doc) {
                const title = doc.title || "PubMed Reference";
                const journal = doc.source || "NCBI Medline";
                const pubDate = doc.pubdate || "";
                const url = `https://pubmed.ncbi.nlm.nih.gov/${id}/`;
                
                sources.push({ uri: url, title: `${title} (${journal}, ${pubDate})` });
                contextText += `- Publication: "${title}" published in ${journal} (${pubDate}). URL: ${url}\n`;
            }
        });
        
        return { context: contextText, sources: sources };
    } catch (err) {
        console.error("PubMed search failed:", err);
        return { context: "", sources: [] };
    }
};

// Post prompt payload to Groq API endpoint
const sendRequest = async (userText) => {
    if (!apiConfig.key) {
        alert("Please set up your Groq API Key in Settings to consult the assistant.");
        openModal("settingsModal");
        return;
    }

    const keywordQuery = extractKeywords(userText);
    const pubmedData = await fetchPubMedContext(keywordQuery);

    let messagesHistory = [];
    const sysInstruction = getSystemInstruction(patient);
    let finalSystemPrompt = sysInstruction;
    if (pubmedData.context) {
        finalSystemPrompt += "\n\n" + pubmedData.context;
    }
    
    messagesHistory.push({
        role: "system",
        content: finalSystemPrompt
    });

    if (activeChat && history[activeChat]) {
        history[activeChat].messages.forEach(msg => {
            messagesHistory.push({
                role: msg.role === "model" ? "assistant" : "user",
                content: msg.text
            });
        });
    }

    let userContent = userText;
    if (activeFile) {
        userContent += `\n[Uploaded Document name: ${activeFile.name}]`;
    }
    
    messagesHistory.push({
        role: "user",
        content: userContent
    });

    const thinkingWrapper = appendMessage("...", "bot-wrapper thinking");
    thinkingWrapper.querySelector(".message-box").innerHTML = `
        <div class="thinking-indicator">
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>
    `;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiConfig.key}`
            },
            body: JSON.stringify({
                model: apiConfig.model,
                messages: messagesHistory,
                temperature: 0.3,
                max_tokens: 1500
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Unknown error occurred.");

        let reply = data.choices?.[0]?.message?.content?.trim() || "⚠️ Unable to retrieve a response from Groq.";

        if (apiConfig.model.includes("deepseek-r1")) {
            const thinkMatch = reply.match(/<think>([\s\S]*?)<\/think>/);
            if (thinkMatch) {
                const thinkingText = thinkMatch[1].trim();
                const actualAnswer = reply.replace(/<think>[\s\S]*?<\/think>/, "").trim();
                reply = `> *Thought Process:*\n> ${thinkingText.split("\n").join("\n> ")}\n\n${actualAnswer}`;
            }
        }

        thinkingWrapper.remove();

        if (!activeChat) {
            activeChat = "session_" + Date.now();
            history[activeChat] = {
                title: userText.length > 35 ? userText.substring(0, 35) + "..." : userText,
                messages: []
            };
        }

        history[activeChat].messages.push({
            role: "user",
            text: userText,
            fileName: activeFile ? activeFile.name : null
        });

        history[activeChat].messages.push({
            role: "model",
            text: reply,
            sources: pubmedData.sources
        });

        saveChat();
        loadChats(); 

        appendMessage(reply, 'bot-wrapper', "", pubmedData.sources);

        if (apiConfig.ttsEnabled) {
            const lastBotMsg = document.querySelector(".bot-wrapper:last-child .speech-btn");
            if (lastBotMsg) {
                speak(lastBotMsg, reply);
            }
        }

    } catch (err) {
        console.error(err);
        thinkingWrapper.querySelector(".message-box").textContent = `❌ API Error: ${err.message}`;
        thinkingWrapper.classList.remove("thinking");
    } finally {
        removeSelectedFile();
    }
};

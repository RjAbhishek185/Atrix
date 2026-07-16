// Listen to voice input (Speech to Text)
const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onstart = () => {
            isListening = true;
            document.getElementById("mic-button").classList.add("listening");
        };

        recognition.onend = () => {
            isListening = false;
            document.getElementById("mic-button").classList.remove("listening");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById("message-input");
            input.value = (input.value + " " + transcript).trim();
        };

        recognition.onerror = (err) => {
            console.error("Speech recognition error:", err.error);
            isListening = false;
            document.getElementById("mic-button").classList.remove("listening");
        };
    }
};

const toggleVoiceDictation = () => {
    if (!recognition) {
        alert("Speech-to-Text dictation is not supported in this browser.");
        return;
    }
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
};

// Playback voice synthesis (Text to Speech)
const speak = (btn, text) => {
    if (!('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (btn.classList.contains("speaking")) {
            btn.classList.remove("speaking");
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';
            return;
        }
    }

    document.querySelectorAll(".speech-btn").forEach(b => {
        b.classList.remove("speaking");
        b.innerHTML = '<i class="fas fa-volume-up"></i>';
    });

    const clean = text
        .replace(/[*#`_\-]/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') 
        .replace(/:/g, ',');

    const utterance = new SpeechSynthesisUtterance(clean);
    
    utterance.onend = () => {
        btn.classList.remove("speaking");
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
    };

    utterance.onerror = () => {
        btn.classList.remove("speaking");
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
    };

    btn.classList.add("speaking");
    btn.innerHTML = '<i class="fas fa-stop"></i>';
    window.speechSynthesis.speak(utterance);
};

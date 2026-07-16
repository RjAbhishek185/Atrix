// Toggle attachment source popup dropdown
const toggleUploadMenu = (e) => {
    e.stopPropagation();
    
    let menu = document.querySelector(".upload-menu");
    if (menu) {
        menu.remove();
        return;
    }

    menu = document.createElement("div");
    menu.className = "upload-menu";
    menu.innerHTML = `
        <div class="upload-menu-item" onclick="selectUploadSource('camera')">
            <i class="fas fa-camera"></i> Use Camera
        </div>
        <div class="upload-menu-item" onclick="selectUploadSource('device')">
            <i class="fas fa-folder-open"></i> Upload from Device
        </div>
    `;
    
    document.body.appendChild(menu);

    const btnRect = document.getElementById("upload-button").getBoundingClientRect();
    menu.style.bottom = `${window.innerHeight - btnRect.top + 8}px`;
    menu.style.left = `${btnRect.left}px`;

    document.addEventListener("click", () => {
        if (menu) menu.remove();
    }, { once: true });
};

const selectUploadSource = (source) => {
    const input = document.getElementById("file-input");
    if (source === 'camera') {
        input.setAttribute("accept", "image/*");
        input.setAttribute("capture", "environment");
    } else {
        input.removeAttribute("capture");
        input.setAttribute("accept", "image/*,application/pdf,text/plain");
    }
    input.click();
};

const handleFileSelected = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64Data = e.target.result.split(',')[1];
        activeFile = {
            mimeType: file.type,
            data: base64Data,
            name: file.name
        };
        
        const previewBar = document.getElementById("file-preview-bar");
        const previewName = document.getElementById("file-preview-name");
        previewName.textContent = file.name;
        previewBar.style.display = "flex";
    };
    reader.readAsDataURL(file);
};

const removeSelectedFile = () => {
    activeFile = null;
    document.getElementById("file-input").value = "";
    document.getElementById("file-preview-bar").style.display = "none";
};

// Active login session loading and validation
const loadActiveUserSession = () => {
    const loggedUser = localStorage.getItem("atrix_logged_in_user");
    const authBtn = document.getElementById("auth-btn");
    
    if (loggedUser) {
        authBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout (${loggedUser})`;
        authBtn.onclick = handleAuthLogout;
        
        const profStr = localStorage.getItem(`atrix_profile_${loggedUser}`);
        if (profStr) {
            patient = JSON.parse(profStr);
        } else {
            resetProfileToGuest(loggedUser);
        }
    } else {
        authBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
        authBtn.onclick = () => openModal("loginModal");
        resetProfileToGuest("Guest Patient");
    }
    updateProfileWidgets();
};

const resetProfileToGuest = (fallbackName) => {
    patient = {
        name: fallbackName || "Guest Patient",
        age: "",
        sex: "",
        mobile: "",
        allergies: "None",
        meds: "None",
        conditions: "None"
    };
};

const handleAuthSignup = () => {
    const user = document.getElementById("signup-user").value.trim();
    const name = document.getElementById("signup-name").value.trim();
    const pass = document.getElementById("signup-pass").value;

    if (!user || !name || !pass) {
        alert("Please fill in all fields.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("atrix_users") || "{}");
    if (users[user]) {
        alert("Username already exists.");
        return;
    }

    users[user] = pass;
    localStorage.setItem("atrix_users", JSON.stringify(users));

    const initProf = {
        name: name,
        age: "",
        sex: "",
        mobile: "",
        allergies: "None",
        meds: "None",
        conditions: "None"
    };
    localStorage.setItem(`atrix_profile_${user}`, JSON.stringify(initProf));

    alert("Registration complete! You can now log in.");
    toggleAuthView('login');
};

const handleAuthLogin = () => {
    const user = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value;

    let users = JSON.parse(localStorage.getItem("atrix_users") || "{}");
    if (!users[user] || users[user] !== pass) {
        alert("Invalid username or password.");
        return;
    }

    localStorage.setItem("atrix_logged_in_user", user);
    loadActiveUserSession();
    closeModal("loginModal");
    startNewChat(); 
    alert(`Welcome back, ${user}!`);
};

const handleAuthLogout = () => {
    localStorage.removeItem("atrix_logged_in_user");
    loadActiveUserSession();
    startNewChat(); 
    alert("Logged out successfully.");
};

// Toggle between signin and signup sub-views
const toggleAuthView = (view) => {
    if (view === 'signup') {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("signup-section").style.display = "block";
    } else {
        document.getElementById("login-section").style.display = "block";
        document.getElementById("signup-section").style.display = "none";
    }
};

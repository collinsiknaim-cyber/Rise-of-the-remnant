
        // Function to apply saved settings to any page
function applyGlobalSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('bibleSettings')) || {
        dark: false,
        fontSize: 16
    };

    // Apply Dark Mode
    if (savedSettings.dark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Apply Font Size to the body (affects all text)
    document.body.style.fontSize = savedSettings.fontSize + 'px';
}

// Run immediately when the script loads
applyGlobalSettings();
document.addEventListener('DOMContentLoaded', () => {
    // Query the active tab to send a message to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        
        // Check if the tab is valid to avoid errors on chrome:// pages
        if (activeTab.id) {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            }).then(() => {
                chrome.tabs.sendMessage(activeTab.id, { type: 'GET_PAGE_DETAILS' }, (response) => {
                    if (chrome.runtime.lastError) {
                        // Handle the case where the content script is not available
                        console.error(chrome.runtime.lastError.message);
                        document.getElementById('event-title').value = 'Could not get page title';
                        return;
                    }
                    if (response && response.title) {
                        console.log("Popup received details:", response);
                        document.getElementById('event-title').value = response.title;
                    }
                });
            });
        }
    });

    // Form submission logic
    document.getElementById('event-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // Placeholder for API call
        document.getElementById('status').textContent = 'Connecting to Google...';
    });
});
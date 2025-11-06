// Function to handle messages from the background script
function handleBackgroundMessages(request, sender, sendResponse) {
    const statusDiv = document.getElementById('status');
    if (request.type === 'EVENT_ADDED') {
        statusDiv.innerHTML = `Success! <a href="${request.link}" target="_blank">View Event</a>`;
    } else if (request.type === 'API_ERROR') {
        statusDiv.textContent = `Error: ${request.message}`;
    }
}

// Add the listener when the popup loads
chrome.runtime.onMessage.addListener(handleBackgroundMessages);

document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.id) {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            }).then(() => {
                chrome.tabs.sendMessage(activeTab.id, { type: 'GET_PAGE_DETAILS' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                        return;
                    }
                    if (response && response.title) {
                        document.getElementById('event-title').value = response.title;
                        // Set a default date/time for now
                        const now = new Date();
                        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                        document.getElementById('event-datetime').value = now.toISOString().slice(0,16);
                    }
                });
            });
        }
    });

    document.getElementById('event-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('event-title').value;
        const dateTime = document.getElementById('event-datetime').value;

        if (title && dateTime) {
            document.getElementById('status').textContent = 'Adding event...';
            // Send event details to background script
            chrome.runtime.sendMessage({
                type: 'ADD_EVENT',
                details: {
                    title: title,
                    dateTime: new Date(dateTime).toISOString()
                }
            });
        }
    });
});
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
            // We still inject the script to make sure it's running
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            }).then(() => {
                // Then we send the message to get the details
                chrome.tabs.sendMessage(activeTab.id, { type: 'GET_PAGE_DETAILS' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error getting page details:", chrome.runtime.lastError.message);
                        return;
                    }

                    if (response) {
                        console.log("Popup received details:", response);
                        document.getElementById('event-title').value = response.title || '';

                        // The datetime-local input requires a specific format: "YYYY-MM-DDTHH:mm"
                        let inputDateTime = '';
                        if (response.datetime) {
                            try {
                                const date = new Date(response.datetime);
                                // Adjust for timezone offset to display correctly in the user's local time
                                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                                inputDateTime = date.toISOString().slice(0, 16);
                            } catch (e) {
                                console.error("Could not parse date:", e);
                            }
                        }
                        document.getElementById('event-datetime').value = inputDateTime;
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
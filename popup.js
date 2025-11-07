// Function to format a date string or Date object for a datetime-local input
function formatDateTimeForInput(date) {
    if (!date) return '';
    try {
        const d = new Date(date);
        // Adjust for timezone offset to display correctly in the user's local time
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    } catch (e) {
        console.error("Could not format date:", date, e);
        return '';
    }
}

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
                        console.error("Error getting page details:", chrome.runtime.lastError.message);
                        return;
                    }

                    if (response) {
                        console.log("Popup received details:", response);
                        document.getElementById('event-title').value = response.title || '';
                        
                        // Populate the new fields
                        document.getElementById('event-location').value = response.location || '';
                        document.getElementById('event-description').value = response.description || '';

                        // Set start time
                        document.getElementById('event-start-datetime').value = formatDateTimeForInput(response.startDatetime);

                        // Set end time - if not found, default to 1 hour after start
                        let endTime = response.endDatetime;
                        if (!endTime && response.startDatetime) {
                            const startDate = new Date(response.startDatetime);
                            endTime = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
                        }
                        document.getElementById('event-end-datetime').value = formatDateTimeForInput(endTime);
                    }
                });
            });
        }
    });

    document.getElementById('event-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Gather all the data from the form
        const eventDetails = {
            title: document.getElementById('event-title').value,
            startDateTime: new Date(document.getElementById('event-start-datetime').value).toISOString(),
            endDateTime: new Date(document.getElementById('event-end-datetime').value).toISOString(),
            location: document.getElementById('event-location').value,
            description: document.getElementById('event-description').value
        };

        if (eventDetails.title && eventDetails.startDateTime) {
            document.getElementById('status').textContent = 'Adding event...';
            // Send all details to the background script
            chrome.runtime.sendMessage({
                type: 'ADD_EVENT',
                details: eventDetails
            });
        }
    });
});


// Function and its listener handle messages from the background script
chrome.runtime.onMessage.addListener(handleBackgroundMessages);
function handleBackgroundMessages(request, sender, sendResponse) {
    const statusDiv = document.getElementById('status');
    if (request.type === 'EVENT_ADDED') {
        statusDiv.innerHTML = `Success! <a href="${request.link}" target="_blank">View Event</a>`;
    } else if (request.type === 'API_ERROR') {
        statusDiv.textContent = `Error: ${request.message}`;
    }
}
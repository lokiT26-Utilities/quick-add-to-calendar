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

// This function takes the text content of an ICS file and populates the form
function parseIcsContent(icsContent) {
    try {
        const jcalData = ICAL.parse(icsContent);
        const vcalendar = new ICAL.Component(jcalData);
        const vevent = vcalendar.getFirstSubcomponent('vevent');
        
        if (vevent) {
            const event = new ICAL.Event(vevent);

            console.log("Parsed ICS Event:", event);

            // Populate the form with the parsed data
            document.getElementById('event-title').value = event.summary || '';
            document.getElementById('event-location').value = event.location || '';
            document.getElementById('event-description').value = event.description || '';
            
            // ICAL.js gives us an ICAL.Time object. We convert it to a JS Date.
            document.getElementById('event-start-datetime').value = formatDateTimeForInput(event.startDate.toJSDate());
            document.getElementById('event-end-datetime').value = formatDateTimeForInput(event.endDate.toJSDate());

            document.getElementById('status').textContent = 'ICS file parsed successfully!';
        } else {
            throw new Error("No VEVENT found in the ICS file.");
        }
    } catch (error) {
        console.error("Error parsing ICS file:", error);
        document.getElementById('status').textContent = 'Error: Could not parse ICS file.';
    }
}

// This function handles the file selection (from drop or click)
function handleFileSelect(file) {
    if (file && file.type === 'text/calendar') {
        const reader = new FileReader();
        // Set up the reader to call our parser when the file is loaded
        reader.onload = (e) => {
            let icsContent = e.target.result;

            // --- THIS IS THE FIX ---
            // Normalize all line endings to the standard CRLF (\r\n) before parsing.
            icsContent = icsContent.replace(/(\r\n|\n|\r)/g, "\r\n");
            
            parseIcsContent(icsContent);
        };
        // Read the file as plain text
        reader.readAsText(file);
    } else {
        document.getElementById('status').textContent = 'Please select a valid .ics file.';
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

    // EVENT LISTENERS FOR THE DROP ZONE
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('ics-file-input');

    // Clicking the drop zone opens the file dialog
    dropZone.addEventListener('click', () => fileInput.click());

    // File dialog selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Drag and Drop listeners
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.stopPropagation();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
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
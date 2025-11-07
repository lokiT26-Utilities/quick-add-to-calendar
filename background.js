// This function gets an auth token and then calls the Google Calendar API
function addEventToCalendar(eventDetails) {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
            console.error("Could not get auth token:", chrome.runtime.lastError);
            // Inform the popup that authentication failed
            chrome.runtime.sendMessage({ type: 'API_ERROR', message: 'Authentication failed.' });
            return;
        }

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Build the event object with all the new details
        const event = {
            'summary': eventDetails.title,
            'location': eventDetails.location,
            'description': eventDetails.description,
            'start': {
                'dateTime': eventDetails.startDateTime,
                'timeZone': timeZone,
            },
            'end': {
                'dateTime': eventDetails.endDateTime,
                'timeZone': timeZone,
            },
            // More fields like attendees or reminders can be added here later
        };

        fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("API Error:", data.error);
                chrome.runtime.sendMessage({ type: 'API_ERROR', message: data.error.message });
            } else {
                console.log("Event created:", data);
                chrome.runtime.sendMessage({ type: 'EVENT_ADDED', link: data.htmlLink });
            }
        })
        .catch(error => {
            console.error("Fetch Error:", error);
            chrome.runtime.sendMessage({ type: 'API_ERROR', message: 'Network error.' });
        });
    });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'ADD_EVENT') {
        addEventToCalendar(request.details);
    }
});
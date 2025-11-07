// Function to find the date and time using regular expressions (a simple approach)
function findDateTimeOnPage() {
    const bodyText = document.body.innerText;

    // Regex for patterns like "January 5, 2024", "Jan 5 2024", "5 Jan 2024", "2024-01-05"
    // This is a simplified regex and can be improved.
    const dateRegex = /(?:(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sep|October|Oct|November|Nov|December|Dec)\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})/i;
    
    // Regex for patterns like "7:00 PM", "07:00", "7pm"
    const timeRegex = /\d{1,2}:\d{2}\s?(?:AM|PM)?|\d{1,2}\s?(?:AM|PM)/i;

    const dateMatch = bodyText.match(dateRegex);
    const timeMatch = bodyText.match(timeRegex);

    if (dateMatch) {
        // We have a date, let's try to combine it with a time
        const dateString = dateMatch[0];
        const timeString = timeMatch ? timeMatch[0] : '12:00 PM'; // Default to noon if no time found
        
        // Attempt to create a valid Date object
        const potentialDate = new Date(`${dateString} ${timeString}`);
        
        // Check if the date is valid. If not, return null.
        if (!isNaN(potentialDate.getTime())) {
            return potentialDate.toISOString();
        }
    }
    
    return null; // Return null if no valid date was found
}


// The main function that gets called by the popup
function getPageDetails() {
    // --- STRATEGY 1: Look for JSON-LD Structured Data ---
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
        try {
            const data = JSON.parse(script.textContent);
            // Look for an object with "@type" set to "Event"
            if (data && data['@type'] && (data['@type'].includes('Event') || data['@type'].includes('event'))) {
                console.log("Found Event in JSON-LD:", data);
                return {
                    title: data.name,
                    // startDate can be an object or just a string
                    datetime: data.startDate?.['@value'] || data.startDate, 
                    foundBy: "JSON-LD"
                };
            }
        } catch (e) {
            console.warn("Could not parse JSON-LD script.", e);
        }
    }

    // --- STRATEGY 2: Look for Meta Tags (Less common for dates, good for titles) ---
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const pageTitle = ogTitle ? ogTitle.content : document.title;


    // --- STRATEGY 3: Heuristics and DOM Scraping ---
    // Try to find the most prominent heading on the page
    const h1 = document.querySelector('h1');
    const heuristicTitle = h1 ? h1.innerText : pageTitle;

    // Use our function to find a date in the body text
    const heuristicDateTime = findDateTimeOnPage();

    console.log("Falling back to Heuristics.");
    return {
        title: heuristicTitle,
        datetime: heuristicDateTime,
        foundBy: "Heuristics"
    };
}


// Listen for a message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PAGE_DETAILS') {
        const details = getPageDetails();
        sendResponse(details);
    }
});
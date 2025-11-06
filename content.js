// This script runs on the webpage
console.log("Calendar Extension content script loaded.");

// Listen for a message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PAGE_DETAILS') {
        console.log("Content script received message.");

        const pageDetails = {
            title: document.title,
        };
        sendResponse(pageDetails);
    }
});
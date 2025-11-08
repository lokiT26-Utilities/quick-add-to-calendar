# Contributing to Quick Add to Calendar

First off, thank you for considering contributing! We welcome any help you can offer, from fixing bugs to suggesting new features. Every contribution is appreciated.

This document provides guidelines to help you get started.

## How Can I Contribute?

-   **Reporting Bugs:** If you find a bug, please [open an issue](https://github.com/lokiT26-Utilities/quick-add-to-calendar/issues) and provide as much detail as possible, including the website where the bug occurred and steps to reproduce it.
-   **Suggesting Enhancements:** Have an idea for a new feature or an improvement to an existing one? Feel free to [open an issue](https://github.com/lokiT26-Utilities/quick-add-to-calendar/issues) to discuss it.
-   **Pull Requests:** If you're ready to contribute code, that's fantastic! Please follow the steps below to set up your development environment.

## Setting Up Your Development Environment

To ensure you can test your changes, you'll need to set up the extension with your own fork and get authorized to use the Google Calendar API for this project.

### Step 1: Fork & Clone the Repository

1.  **Fork** this repository to your own GitHub account.
2.  **Clone** your fork to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/quick-add-to-calendar.git
    cd quick-add-to-calendar
    ```

### Step 2: Load the Extension in Your Browser

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **"Developer mode"** in the top-right corner.
3.  Click the **"Load unpacked"** button and select the project folder you just cloned.
4.  The extension will be loaded, and you will see its unique **Extension ID** on the card. Keep this ID handy.

### Step 3: Getting API Access (Important!)

This extension uses the Google Calendar API, which requires authorization. Since the official app is not yet published and verified by Google, you need to be added to the list of authorized test users to develop and test your changes.

1.  **Open an Issue:**
    -   Go to the [Issues tab](https://github.com/lokiT26-Utilities/quick-add-to-calendar/issues) of the main repository.
    -   Create a new issue with the title "Request to be added as a Test User".
    -   In the body of the issue, please provide:
        -   The **Google Account Email** you will use for testing (e.g., `your.email@gmail.com`).
        -   The **Extension ID** from Step 2.4. (This is for potential future configuration needs).

2.  **Wait for Confirmation:**
    -   Ping the project maintainer (`@lokiT26`). I will add your email to the Google Cloud project's test user list.
    -   Once I confirm in the issue that you've been added, you can proceed.

### Step 4: Making and Testing Your Changes

1.  Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b feature/my-awesome-feature
    ```
2.  Make your code changes.
3.  After making changes, go back to `chrome://extensions` and click the "reload" icon for the extension to apply them.
4.  Test the functionality. When you use the "Add to Google Calendar" button for the first time, you should now be able to successfully complete the Google sign-in and consent flow.

### Step 5: Submitting a Pull Request

1.  Once you are happy with your changes, commit them with a descriptive message. We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
    ```bash
    git commit -m "feat: Add support for parsing event locations"
    ```
2.  Push your branch to your fork:
    ```bash
    git push origin feature/my-awesome-feature
    ```
3.  Go to the original repository on GitHub and open a Pull Request. Provide a clear description of the changes you've made.

Thank you again for your contribution!
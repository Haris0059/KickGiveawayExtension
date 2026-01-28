# Kick Giveaway Extension

A simple browser extension for running giveaways on the streaming platform Kick.com.
This extension allows a streamer to set a keyword for a giveaway. Viewers can enter the giveaway by typing the keyword in the chat. The extension will collect all unique users who have entered and then randomly select a winner.

## Features

- **Simple Interface:** Easy to set up and manage your giveaway from the extension popup.
- **Keyword Detection:** Automatically detects entries in the chat based on a custom keyword.
- **Unique User Entry:** Only one entry per user is counted.
- **Random Winner Selection:** Fairly draw a winner from all participants.
- **Real-time Updates:** See the number of participants update in real-time.

## Preview
![alt text](/images/preview.png)

## Installation

This is a simple browser extension and does not require any build process. To run the extension, you need to load it into your browser as an unpacked extension.

### Google Chrome

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** in the top right corner.
3.  Click **Load unpacked** and select the directory where you downloaded the extension files.

### Mozilla Firefox

1.  Open Firefox and navigate to `about:debugging`.
2.  Click **This Firefox** and then **Load Temporary Add-on...**.
3.  Select the `manifest.json` file from the extension's directory.

## How to Use

1.  **Install the extension** following the instructions above.
2.  Go to a stream on **Kick.com**.
3.  **Click the extension icon** in your browser's toolbar to open the popup.
4.  **Set the keyword** that viewers need to type in the chat (e.g., `!enter`).
5.  **Set the prize** or award for the giveaway.
6.  Click **Start** to begin the giveaway.
7.  The extension will now **collect entries** from the chat. You can see the number of participants in the popup.
8.  When you are ready, click **Get a Winner** to randomly select a winner.
9.  The winner's name will be displayed in the popup.
10. Click **Reset a list** to clear the current giveaway and start a new one.

## Technologies Used

-   HTML5
-   CSS3
-   JavaScript (ES6)
-   Chrome Extension Manifest V3

## Support

If you find this extension helpful, consider giving it a ⭐ on GitHub!  
Contributions and feedback are welcome.

---

_This README was generated with the assistance of an AI tool._

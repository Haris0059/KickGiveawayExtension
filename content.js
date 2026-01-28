let enrolledUsers = [];
let giveawayStarted = false;
let keyword = '';
let observer = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    keyword = request.keyword;
    giveawayStarted = true;
    enrolledUsers = [];
    scrapeAllMessages();
    observeChat();
    chrome.storage.local.set({ enrolledUsers, giveawayState: 'started' });
  } else if (request.action === 'finish') {
    giveawayStarted = false;
    if(observer) {
        observer.disconnect();
        observer = null;
    }
    if (enrolledUsers.length > 0) {
      const winner = enrolledUsers[Math.floor(Math.random() * enrolledUsers.length)];
      chrome.runtime.sendMessage({ action: 'announceWinner', winner });
      chrome.storage.local.set({ winner, giveawayState: 'finished' });
    }
  } else if (request.action === 'reset') {
    giveawayStarted = false;
    enrolledUsers = [];
    keyword = '';
    if(observer) {
        observer.disconnect();
        observer = null;
    }
    chrome.storage.local.set({ enrolledUsers: [], giveawayState: 'idle', winner: null });
  }
});




function scrapeAllMessages() {
    const chatroomMessages = document.getElementById('chatroom-messages');
    if (!chatroomMessages) return;

    let index = Math.max(...Array.from(chatroomMessages.querySelectorAll('[data-index]')).map(d => +d.dataset.index));
    const newEnrolledUsers = new Set(enrolledUsers);
    let usersAdded = false;

    while (true) {
        const div = chatroomMessages.querySelector(`[data-index="${index}"]`);
        if (!div) break;

        const usernameBtn = div.querySelector('button[title]');
        const messageSpan = div.querySelector('span.font-normal');

        if (usernameBtn && messageSpan) {
            const username = usernameBtn.getAttribute('title');
            const message = messageSpan.textContent.trim();

            if (message === keyword && !newEnrolledUsers.has(username)) {
                newEnrolledUsers.add(username);
                usersAdded = true;
            }
        }
        index--;
        if (index < 0) break; // Prevent infinite loop if data-index goes negative
    }

    if (usersAdded) {
        enrolledUsers = Array.from(newEnrolledUsers);
        chrome.runtime.sendMessage({ action: 'updateUsers', users: enrolledUsers, count: enrolledUsers.length });
        chrome.storage.local.set({ enrolledUsers });
    }
}


function observeChat() {
  const targetElement = document.getElementById('chatroom-messages'); // Target the chatroom-messages div directly
  if (!targetElement) return;

  // Disconnect any existing observer to prevent duplicates
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver(mutations => {
    if (!giveawayStarted) {
      observer.disconnect();
      observer = null;
      return;
    }
    // Instead of processing individual nodes, re-scrape all messages
    // whenever new nodes are added, as the `scrapeAllMessages` function
    // now handles the full logic of finding new users.
    let newNodesAdded = false;
    for (let mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        newNodesAdded = true;
        break;
      }
    }

    if (newNodesAdded) {
      scrapeAllMessages();
    }
  });

  const options = {
    childList: true,
    subtree: true,
  };
  observer.observe(targetElement, options);
}

// The script can be re-injected, so restore state
chrome.storage.local.get(['giveawayState', 'keyword', 'enrolledUsers'], (result) => {
  if (result.giveawayState === 'started') {
    giveawayStarted = true;
    keyword = result.keyword;
    enrolledUsers = result.enrolledUsers || [];
    // Don't auto-start scraping, wait for popup command
    // But do update the popup with the stored users
    chrome.runtime.sendMessage({ action: 'updateUsers', users: enrolledUsers, count: enrolledUsers.length });
    // Re-establish observer if giveaway was started before re-injection
    observeChat();
  }
});


document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('start-btn');
  const drawBtn = document.getElementById('draw-btn');
  const resetBtn = document.getElementById('reset-btn');
  const keywordInput = document.getElementById('keyword');
  const awardInput = document.getElementById('award');
  const userCount = document.getElementById('user-count');
  const participantsBox = document.getElementById('participants-box');
  const winnerDisplay = document.getElementById('winner-display');
  const winnerName = document.getElementById('winner-name');
  const closeBtn = document.getElementById('close-btn');

  closeBtn.addEventListener('click', () => {
    window.close();
  });

  startBtn.addEventListener('click', () => {
    const keyword = keywordInput.value;
    const award = awardInput.value;
    if (keyword && award) {
      chrome.storage.local.set({ giveawayState: 'started', keyword, award, enrolledUsers: [], winner: null });
      winnerDisplay.style.display = 'none';
      participantsBox.innerHTML = '<p class="placeholder-text">Čekam prve prijave...</p>';
      userCount.textContent = '0';
      startBtn.disabled = true;
      drawBtn.disabled = false;
      resetBtn.disabled = false;
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        // It's better to ensure the content script is there before sending a message.
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }).then(() => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'start', keyword });
        });
      });
    }
  });

  drawBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'finish' });
    });
  });

  resetBtn.addEventListener('click', () => {
    chrome.storage.local.set({ giveawayState: 'idle', keyword: '', award: '', enrolledUsers: [], winner: null });
    keywordInput.value = '';
    awardInput.value = '';
    userCount.textContent = '0';
    participantsBox.innerHTML = '<p class="placeholder-text">Waiting for users...</p>';
    winnerDisplay.style.display = 'none';
    startBtn.disabled = false;
    drawBtn.disabled = true;
    resetBtn.disabled = true;
     chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'reset' });
    });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateUsers') {
      userCount.textContent = request.count;
      if (request.users.length > 0) {
        participantsBox.innerHTML = '';
        request.users.forEach(user => {
          const userElement = document.createElement('div');
          userElement.className = 'participant-item';
          userElement.textContent = user;
          participantsBox.appendChild(userElement);
        });
      } else {
        participantsBox.innerHTML = '<p class="placeholder-text">Waiting for users...</p>';
      }
    }
    if (request.action === 'announceWinner') {
      winnerName.textContent = request.winner;
      winnerDisplay.style.display = 'block';
      startBtn.disabled = false;
      drawBtn.disabled = true;
      chrome.storage.local.set({ giveawayState: 'finished', winner: request.winner });
    }
  });

  // Restore popup state
  chrome.storage.local.get(['giveawayState', 'keyword', 'award', 'enrolledUsers', 'winner'], (result) => {
    keywordInput.value = result.keyword || '';
    awardInput.value = result.award || '';
    const users = result.enrolledUsers || [];
    userCount.textContent = users.length;

    if(users.length > 0){
        participantsBox.innerHTML = '';
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'participant-item';
            userElement.textContent = user;
            participantsBox.appendChild(userElement);
        });
    }

    if (result.giveawayState === 'started') {
        startBtn.disabled = true;
        drawBtn.disabled = false;
        resetBtn.disabled = false;
    } else {
        startBtn.disabled = false;
        drawBtn.disabled = true;
        resetBtn.disabled = true;
    }

    if (result.winner) {
        winnerName.textContent = result.winner;
        winnerDisplay.style.display = 'block';
        drawBtn.disabled = true;
        resetBtn.disabled = false;
    } else {
        winnerDisplay.style.display = 'none';
    }
  });
});

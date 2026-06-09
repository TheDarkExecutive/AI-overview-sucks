// popup.js
const toggle = document.getElementById('mainToggle');
const statusLine = document.getElementById('statusText');
const valText = document.getElementById('valText');

chrome.storage.sync.get(['noAIOverview'], (result) => {
  const enabled = result.noAIOverview !== false;
  toggle.checked = enabled;
  updateUI(enabled);
});

toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ noAIOverview: enabled });
  updateUI(enabled);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.url && tab.url.includes('google.com/search')) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE', enabled });
    }
  });
});

function updateUI(enabled) {
  if (enabled) {
    valText.textContent = 'enabled';
    statusLine.classList.remove('off');
  } else {
    valText.textContent = 'disabled';
    statusLine.classList.add('off');
  }
}
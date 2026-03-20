// No AI Overview - content.js
// Runs on every Google Search page

const SELECTORS = [
  // Primary div with data-hveid attribute (as seen in your screenshot)
  'div[data-hveid="CAsQBQ"]',
  'div[data-hveid="CAsQBQg"]',
  // Generic AI overview container selectors
  '[data-attrid="wa:/description"]',
  '.XqIXXd',           // AI overview wrapper
  '.YzVZne',           // AI overview card
  '.I6TXqe',           // SGE block
  'div.sATSHe',        // AI overview panel
  '[jsname="yEVEwb"]', // Known AI overview jsname
  'block-component[data-block="AIOverview"]',
  // Catch-all: any element with class containing 'ai-overview'
];

let enabled = true;

// Load toggle state from storage
chrome.storage.sync.get(['noAIOverview'], (result) => {
  enabled = result.noAIOverview !== false; // default ON (removing AI overview)
  if (enabled) removeAIOverview();
});

function removeAIOverview() {
  // Try each selector
  SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Also scan by data-hveid attribute pattern (catches dynamic values)
  document.querySelectorAll('div[data-hveid]').forEach(el => {
    const text = el.innerText || '';
    const hasAILabel =
      el.querySelector('[aria-label*="AI"]') ||
      el.querySelector('[aria-label*="Overview"]') ||
      el.querySelector('[data-attrid*="ai"]') ||
      el.querySelector('.fzMkFd') || // "AI Overview" heading class
      el.querySelector('.e3Ojpf') || // SGE container
      (text.includes('AI Overview') && el.children.length > 0);

    if (hasAILabel) el.remove();
  });

  // Target the specific heading text "AI Overview"
  document.querySelectorAll('h1, h2, h3, [role="heading"]').forEach(heading => {
    if (heading.textContent.trim() === 'AI Overview') {
      // Remove the parent container
      let parent = heading.parentElement;
      for (let i = 0; i < 6; i++) {
        if (!parent) break;
        // Walk up until we find a sizeable block
        if (parent.clientHeight > 80 || parent.dataset.hveid) {
          parent.remove();
          break;
        }
        parent = parent.parentElement;
      }
    }
  });
}

// Observe DOM mutations (Google loads content dynamically)
const observer = new MutationObserver(() => {
  if (enabled) removeAIOverview();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// Listen for toggle messages from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TOGGLE') {
    enabled = msg.enabled;
    if (enabled) {
      removeAIOverview();
    } else {
      // Reload page to restore AI overview (easiest approach)
      window.location.reload();
    }
  }
});

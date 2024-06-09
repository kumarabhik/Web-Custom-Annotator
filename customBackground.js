chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ highlightColor: '#ffff00' });
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  });
  chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (command === 'highlight') {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: highlightSelectedText
        });
      } else if (command === 'add_note') {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: promptForNote
        });
      }
    });
  });
  
  function highlightSelectedText() {
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
      chrome.storage.local.get(['highlightColor'], function(result) {
        const highlightColor = result.highlightColor || '#ffff00';
        const span = document.createElement('span');
        span.style.backgroundColor = highlightColor;
        span.className = 'annotation';
        span.textContent = selectedText;
  
        const range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        range.insertNode(span);
      });
    }
  }
  
  function promptForNote() {
    const note = prompt("Enter your note:");
    if (note) {
      chrome.runtime.sendMessage({ type: 'saveNote', note });
    }
  }
    
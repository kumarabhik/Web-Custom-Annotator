
let selectedText = '';
let currentPageUrl = window.location.href;

document.addEventListener('mouseup', (event) => {
  selectedText = window.getSelection().toString();
  if (selectedText.length > 0) {
    chrome.storage.local.get(['highlightColor', 'annotations'], function(result) {
      const highlightColor = result.highlightColor || '#ffff00';
      const annotations = result.annotations || {};

      const span = document.createElement('span');
      span.style.backgroundColor = highlightColor;
      span.className = 'annotation';
      span.textContent = selectedText;

      const range = window.getSelection().getRangeAt(0);
      range.deleteContents();
      range.insertNode(span);

      const newAnnotation = {
        text: selectedText,
        color: highlightColor,
        url: currentPageUrl,
        position: {
          start: range.startOffset,
          end: range.endOffset,
          parentXPath: getXPath(range.startContainer.parentNode)
        }
      };

      if (!annotations[currentPageUrl]) {
        annotations[currentPageUrl] = [];
      }
      annotations[currentPageUrl].push(newAnnotation);

      chrome.storage.local.set({ annotations });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'saveNote') {
    const notes = document.createElement('div');
    notes.className = 'annotation-note';
    notes.textContent = request.note;
    document.body.appendChild(notes);

    chrome.storage.local.get(['annotations'], function(result) {
      const annotations = result.annotations || {};
      if (!annotations[currentPageUrl]) {
        annotations[currentPageUrl] = [];
      }
      annotations[currentPageUrl].push({
        note: request.note,
        url: currentPageUrl
      });
      chrome.storage.local.set({ annotations });
      sendResponse({ status: 'note saved' });
    });
  }
});

function getXPath(element) {
  if (element.id !== '') {
    return 'id("' + element.id + '")';
  }
  if (element === document.body) {
    return element.tagName;
  }
  let ix = 0;
  const siblings = element.parentNode.childNodes;
  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i];
    if (sibling === element) {
      return getXPath(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
    }
    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
      ix++;
    }
  }
  return null;
}

function highlightSavedAnnotations() {
  chrome.storage.local.get(['annotations'], function(result) {
    const annotations = result.annotations || {};
    if (annotations[currentPageUrl]) {
      annotations[currentPageUrl].forEach(annotation => {
        if (annotation.text) {
          const range = document.createRange();
          const parent = document.evaluate(annotation.position.parentXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          range.setStart(parent.childNodes[0], annotation.position.start);
          range.setEnd(parent.childNodes[0], annotation.position.end);

          const span = document.createElement('span');
          span.style.backgroundColor = annotation.color;
          span.className = 'annotation';
          span.textContent = annotation.text;

          range.deleteContents();
          range.insertNode(span);
        } else if (annotation.note) {
          const notes = document.createElement('div');
          notes.className = 'annotation-note';
          notes.textContent = annotation.note;
          document.body.appendChild(notes);
        }
      });
    }
  });
}

highlightSavedAnnotations();

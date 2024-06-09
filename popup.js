document.getElementById('custom-highlight-btn').addEventListener('click', () => {
  const customHighlightColor = document.getElementById('custom-highlight-color').value;
  chrome.storage.local.set({ customHighlightColor });
});

document.getElementById('save-custom-note-btn').addEventListener('click', () => {
  const customNote = document.getElementById('custom-note').value;
  chrome.tabs.query({ active: true, currentWindow: true }, (customTabs) => {
      chrome.tabs.sendMessage(customTabs[0].id, { type: 'saveCustomNote', customNote }, (customResponse) => {
          if (customResponse.status === 'note saved') {
              document.getElementById('custom-note').value = '';
              displayCustomAnnotations();
          }
      });
  });
});

document.getElementById('custom-search-btn').addEventListener('click', () => {
  const customQuery = document.getElementById('custom-search').value.toLowerCase();
  displayCustomAnnotations(customQuery);
});

function displayCustomAnnotations(customQuery = '') {
  chrome.storage.local.get(['customAnnotations'], function(customResult) {
      const customAnnotationsList = document.getElementById('custom-annotations-list');
      customAnnotationsList.innerHTML = '';
      const customAnnotations = customResult.customAnnotations || {};
      Object.keys(customAnnotations).forEach(customPageUrl => {
          customAnnotations[customPageUrl].forEach(customAnnotation => {
              if (customAnnotation.text && customAnnotation.text.toLowerCase().includes(customQuery) || customAnnotation.note && customAnnotation.note.toLowerCase().includes(customQuery)) {
                  const customAnnotationItem = document.createElement('div');
                  customAnnotationItem.className = 'custom-annotation-item';
                  customAnnotationItem.textContent = customAnnotation.text || customAnnotation.note;
                  customAnnotationsList.appendChild(customAnnotationItem);
              }
          });
      });
  });
}

function getCode() {
  let code = document.getElementsByClassName('CodeMirror-code');
  if (code.length > 0) {
    code = code[0]
  }

  const lines = code.getElementsByClassName('CodeMirror-line');

  const linesContent = []
  for (let i = 0; i < lines.length; i++) {
    linesContent.push(lines[i].innerText);
  }

  return linesContent.join('\n');
}

function getLanguage() {
  const codeArea = document.querySelector('[data-cy="code-area"]');

  return codeArea.getElementsByClassName('ant-select-selection-selected-value')[0].innerText;
}

function getQuestionInfo() {
  const title = document.querySelector('[data-cy="question-title"]').innerText;

  const titleSplit = title.split('.').map(v => v.trim())

  const difficulty = document.querySelector('[diff]').innerText

  return { questionNumber: titleSplit[0], questionTitle: titleSplit[1], difficulty }
}

function getLeetCodeDetails() {
  return { questionInfo: getQuestionInfo(), language: getLanguage(), code: getCode() }
}

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.info) {
    const details = getLeetCodeDetails()
    sendResponse(details)
  }
});

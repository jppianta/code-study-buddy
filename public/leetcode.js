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

function getDescription(title) {
  return `# ${title}\n` + document.querySelector('[data-key="description-content"]')
    .firstElementChild.children[1]
    .firstElementChild
    .innerHTML;
}

function getLanguage() {
  const codeArea = document.querySelector('[data-cy="code-area"]');

  return codeArea.getElementsByClassName('ant-select-selection-selected-value')[0].innerText;
}

function getQuestionInfo() {
  const title = document.querySelector('[data-cy="question-title"]').innerText;

  const titleSplit = title.split('.').map(v => v.trim())

  const difficulty = document.querySelector('[diff]').innerText

  return { questionTitle: titleSplit[1], difficulty, description: getDescription(title) }
}

function getDetails() {
  return { questionInfo: getQuestionInfo(), language: getLanguage(), code: getCode(), platform: 'Leetcode' }
}

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.info) {
    sendResponse(getDetails)
  }
});

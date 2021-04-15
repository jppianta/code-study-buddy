function getCode() {
  const overlays = document.getElementsByClassName('view-overlays')[0].children;
  const code = document.getElementsByClassName('view-lines')[0];
  const lines = code.children;

  const linesContent = []
  for (let i = 0; i < lines.length; i++) {
    if (!overlays[i].firstElementChild || !overlays[i].firstElementChild.classList.contains('read-only')) {
      linesContent.push(lines[i].innerText);
    }
  }

  return linesContent.join('\n');
}

function getDescription(title) {
  const tags = document.getElementsByClassName('challenge-body-html')[0];

  const htmlText = removeStyleTags(tags.innerHTML.replaceAll('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'));
  const description = replaceSvg(htmlText)
  description.htmlText = `# ${title}\n` + description.htmlText
  return description
}

function removeStyleTags(htmlText) {
  const startTags = indexOfAll(htmlText, '<style');
  const endTags = indexOfAll(htmlText, '</style>').map(i => i + '</style>'.length);

  let acc = 0;
  htmlText = htmlText.split('')
  for (let x = 0; x < startTags.length; x++) {
    const start = startTags[x];
    const end = endTags[x];
    const length = end - start;

    htmlText.splice(start - acc, length);
    acc += length;
  }

  return htmlText.join('');
}

function indexOfAll(text, word) {
  const idxs = [];

  for (let i = 0; i < text.length - word.length; i++) {
    if (text.slice(i, i + word.length) === word) {
      idxs.push(i);
    }
  }

  return idxs;
}

function replaceSvg(htmlText) {
  const svgs = [];

  const startTags = indexOfAll(htmlText, '<svg');
  const endTags = indexOfAll(htmlText, '</svg>').map(i => i + '</svg>'.length);

  let acc = 0;
  htmlText = htmlText.split('')
  for (let x = 0; x < startTags.length; x++) {
    const start = startTags[x];
    const end = endTags[x];
    const length = end - start;

    const imagePath = `<img src="./assets/svg-${svgs.length}.svg" />`;

    console.log(htmlText.slice(start - acc, end - acc).join(''),
    htmlText.slice(start - acc, end - acc).join('') !== '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;"><defs id="MathJax_SVG_glyphs"></defs></svg>'
    )
    if (htmlText.slice(start - acc, end - acc).join('') !== '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;"><defs id="MathJax_SVG_glyphs"></defs></svg>') {
      const svg = htmlText.splice(start - acc, length, ...imagePath.split(''));
      acc += length - imagePath.length;
      svgs.push({ name: `svg-${svgs.length}.svg`, content: svg.join('') })
    } else {
      htmlText.splice(start - acc, length);
      acc += length
    }
  }

  htmlText = htmlText.join('')

  return { htmlText, svgs }
}

function getLanguage() {
  const selector = document.getElementsByClassName('select-language')[0]

  return selector.innerText;
}

function getQuestionInfo() {
  const title = document.getElementsByClassName('challenge-page-label-wrapper')[0].innerText;

  const difficultyBlock = document.getElementsByClassName('sidebar-problem-difficulty')[0];

  const difficulty = difficultyBlock.children[1].children[1].innerText;

  const description = getDescription(title);

  return { questionTitle: title, difficulty, description: description.htmlText, assets: description.svgs }
}

function getDetails() {
  return { questionInfo: getQuestionInfo(), language: getLanguage(), code: getCode(), platform: 'Hackerrank' }
}

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.info) {
    sendResponse(getDetails())
  }
});

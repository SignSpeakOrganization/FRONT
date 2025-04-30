document.getElementById('open-options').addEventListener('click', () => {
    const url = chrome.runtime.getURL("./parameters/option.html");
    chrome.tabs.create({ url });
  });
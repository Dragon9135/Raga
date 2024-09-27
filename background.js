(async () => {
  const popularUserscripts = await fetch('https://minions.raga.pw/userscripts', { cache: 'no-store' })
    .then((result) => result.json())
    .catch(() => {});
  if (popularUserscripts) {
    chrome.storage.local.get('userscripts', async (storage) => {
      if (storage && Object.prototype.hasOwnProperty.call(storage, 'userscripts')) {
        await Promise.all(Object.keys(storage.userscripts).map((ident) => {
          const installedUserscript = storage.userscripts[ident];
          const availableUserscript = popularUserscripts.find((popularUserscript) => popularUserscript.ident === ident);
          if (availableUserscript && availableUserscript.version !== installedUserscript.version) {
            return fetch(availableUserscript.url, { cache: 'no-store' })
              .then((result) => result.text())
              .then((content) => {
                installedUserscript.version = availableUserscript.version;
                installedUserscript.url = availableUserscript.url;
                installedUserscript.content = content;
              })
              .catch(() => {
                availableUserscript.version = installedUserscript.version;
                availableUserscript.url = installedUserscript.url;
              });
          }
          return Promise.resolve();
        }))
          .then(() => new Promise((resolve) => {
            chrome.storage.local.set({ userscripts: storage.userscripts }, resolve);
          }));
      }
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'openSettings') {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL('layout/settings.html') });
          });
        } else if (message.action === 'getPopularUserscripts') {
          sendResponse({ popularUserscripts });
        }
        return true;
      });
    });
  }
})();

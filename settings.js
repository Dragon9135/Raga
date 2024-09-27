window.onload = () => {
  chrome.runtime.sendMessage({ action: 'getPopularUserscripts' }, (response) => {
    if (!chrome.runtime.lastError) {
      let installedUserscripts = {};
      chrome.storage.local.get('userscripts', (storage) => {
        if (storage && Object.prototype.hasOwnProperty.call(storage, 'userscripts')) {
          installedUserscripts = storage.userscripts;
        }
        const table = document.querySelector('table tbody');
        response.popularUserscripts.forEach((popularUserscript) => {
          const newRow = table.insertRow(-1);
          Object.keys(popularUserscript).forEach((key) => {
            if (key !== 'ident') {
              const newCell = newRow.insertCell(-1);
              newCell.appendChild(document.createTextNode(popularUserscript[key]));
            } else {
              const newCell = newRow.insertCell(-1);
              const newButton = document.createElement('button');
              if (!Object.prototype.hasOwnProperty.call(installedUserscripts, popularUserscript[key])) {
                newButton.className = 'green';
                newButton.innerHTML = 'Install';
              } else {
                newButton.className = 'red';
                newButton.innerHTML = 'Uninstall';
              }
              newButton.onclick = async () => {
                if (newButton.className === 'green' && newButton.innerHTML === 'Install') {
                  installedUserscripts[popularUserscript[key]] = await fetch(popularUserscript.url, { cache: 'no-store' })
                    .then((result) => result.text())
                    .then((content) => ({
                      version: popularUserscript.version,
                      url: popularUserscript.url,
                      content,
                    }))
                    .catch(() => {});
                  if (installedUserscripts[popularUserscript[key]]) {
                    newButton.className = 'red';
                    newButton.innerHTML = 'Uninstall';
                  } else {
                    delete installedUserscripts[popularUserscript[key]];
                  }
                } else {
                  delete installedUserscripts[popularUserscript[key]];
                  newButton.className = 'green';
                  newButton.innerHTML = 'Install';
                }
                if (Object.keys(installedUserscripts).length) {
                  chrome.storage.local.set({ userscripts: installedUserscripts });
                } else {
                  chrome.storage.local.remove('userscripts');
                }
              };
              newCell.appendChild(newButton);
            }
          });
        });
      });
    }
  });
};

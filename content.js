chrome.storage.local.get('userscripts', (storage) => {
  if (!storage || !Object.prototype.hasOwnProperty.call(storage, 'userscripts')) {
    window.onload = async () => {
      const element = document.createElement('div');
      element.id = 'no-userscripts';
      element.innerHTML = 'Raga Minions has no userscripts installed, click here to install some';
      element.onclick = () => chrome.runtime.sendMessage({ action: 'openSettings' });
      document.body.appendChild(element);
    };
  } else {
    Object.keys(storage.userscripts).forEach((ident) => {
      const Loader = eval(`(${storage.userscripts[ident].content})`);
      const loader = new Loader();
      loader.init();
    });
  }
});

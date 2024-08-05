// Remember closing an alert
document
  .querySelectorAll('sl-alert[data-local-storage-key]')
  .forEach(async (alert) => {
    if (!(alert instanceof HTMLElement)) return

    if (localStorage.getItem(alert.dataset.localStorageKey) !== 'closed') {
      alert.style.display = 'block'
    }

    alert.addEventListener('sl-hide', () => {
      localStorage.setItem(alert.dataset.localStorageKey, 'closed')
    })
  })

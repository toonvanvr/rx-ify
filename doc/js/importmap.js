const script = document.createElement('script')
const url = new URL(window.location.href)
script.type = 'importmap'
script.textContent = JSON.stringify(
  {
    imports: {
      '@toonvanvr/rx-ify':
        url.hostname === 'localhost' || url.searchParams.has('dev')
          ? '/lib/dist/esm/index.js'
          : 'https://cdn.jsdelivr.net/npm/@toonvanvr/rx-ify@1.0.0-alpha.8/+esm',
      'rxjs': 'https://cdn.jsdelivr.net/npm/rxjs@7.8.1/+esm',
    },
  },
  null,
  2,
)
document.currentScript?.after(script)

// Smartsupp live chat widget. Loaded on demand from the app (not index.html) because the public
// site and the admin console share one index.html, and the console must never show the chat.
// The loader is injected the first time a public page asks for it; after that, moving between
// public pages and #/admin (localhost) only shows or hides the widget.
import { SMARTSUPP_KEY } from '../config/brand';

type SmartsuppFn = ((...args: unknown[]) => void) & { _: unknown[][] };

declare global {
  interface Window {
    _smartsupp?: { key?: string };
    smartsupp?: SmartsuppFn;
  }
}

let loaded = false;

function loadSmartsupp() {
  if (loaded || typeof window === 'undefined' || !SMARTSUPP_KEY) return;
  loaded = true;

  window._smartsupp = window._smartsupp || {};
  window._smartsupp.key = SMARTSUPP_KEY;

  if (!window.smartsupp) {
    // Queue calls made before loader.js arrives; the loader replays them.
    const queue = function (...args: unknown[]) {
      queue._.push(args);
    } as SmartsuppFn;
    queue._ = [];
    window.smartsupp = queue;
  }

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.charset = 'utf-8';
  script.async = true;
  script.src = 'https://www.smartsuppchat.com/loader.js?';
  document.head.appendChild(script);
}

export function setLiveChatVisible(visible: boolean) {
  if (typeof window === 'undefined') return;
  if (visible) {
    loadSmartsupp();
    window.smartsupp?.('chat:show');
  } else if (loaded) {
    window.smartsupp?.('chat:hide');
  }
}

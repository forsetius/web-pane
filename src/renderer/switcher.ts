declare global {
  interface Window {
    switcher: {
      onUpdate: (
        cb: (d: {
          items: { id: string; title: string; iconDataUrl?: string }[];
          focusedId: string;
          dark: boolean;
          timeoutMs: number;
          i18n: { hint: string };
        }) => void,
      ) => void;
      onNudge: (cb: (dir: 1 | -1) => void) => void;
      onClose: (cb: (d: { commit: boolean }) => void) => void;
      commit: (id: string | undefined) => void;
      cancel: () => void;
      requestResize: (height: number) => void;
    };
  }
}

interface Item {
  id: string;
  title: string;
  iconDataUrl?: string;
}

const state: {
  items: Item[];
  index: number;
  timer: number | null;
  timeoutMs: number;
  i18n: { hint: string };
} = {
  items: [],
  index: 0,
  timer: null,
  timeoutMs: 1500,
  i18n: { hint: '' },
};

function defaultIconDataUrl(): string {
  const svg = encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4da3ff"/><stop offset="1" stop-color="#8f7dff"/></linearGradient></defs><rect width="56" height="56" rx="12" fill="#2b2f36"/><circle cx="28" cy="28" r="16" fill="url(#g)"/></svg>',
  );
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

function setHint(text: string): void {
  const hint = document.getElementById('hint');
  if (hint) hint.textContent = text;
}

function resetTimer(): void {
  if (state.timer !== null) window.clearTimeout(state.timer);
  state.timer = window.setTimeout(() => {
    finish(true);
  }, state.timeoutMs);
}

function measureAndResize(): void {
  const tray = document.getElementById('tray');
  if (!tray) return;
  const rect = tray.getBoundingClientRect();
  const desired = Math.ceil(rect.height + 24 + 28 + 20);
  if (Number.isFinite(desired) && desired > 0) {
    window.switcher.requestResize(desired);
  }
}

function render(): void {
  const tray = document.getElementById('tray');
  if (!tray) return;
  tray.innerHTML = '';

  state.items.forEach((it, i) => {
    const el = document.createElement('div');
    el.className = `item${i === state.index ? ' active' : ''}`;
    el.setAttribute('role', 'option');
    el.setAttribute('aria-selected', i === state.index ? 'true' : 'false');

    const icon = document.createElement('div');
    icon.className = 'icon';
    const img = document.createElement('img');
    img.alt = '';
    img.src = it.iconDataUrl ?? defaultIconDataUrl();
    icon.appendChild(img);

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = it.title || it.id;

    el.appendChild(icon);
    el.appendChild(title);
    el.addEventListener('click', () => {
      state.index = i;
      finish(true);
    });
    el.addEventListener('mousemove', resetTimer);
    tray.appendChild(el);
  });

  requestAnimationFrame(measureAndResize);
  resetTimer();
}

function setFromPayload(data: {
  items: Item[];
  focusedId: string;
  timeoutMs: number;
  i18n: { hint: string };
}): void {
  state.items = data.items;
  state.timeoutMs = data.timeoutMs;
  state.i18n = { hint: 'Help' };
  setHint(state.i18n.hint);

  const idx = state.items.findIndex((i) => i.id === data.focusedId);
  state.index = idx >= 0 ? idx : 0;
  render();
}

function finish(commit: boolean): void {
  const chosen =
    commit && state.items[state.index]
      ? state.items[state.index]!.id
      : undefined;
  window.switcher.commit(chosen);
}

window.switcher.onUpdate(setFromPayload);
window.switcher.onNudge((dir) => {
  if (!state.items.length) return;
  const len = state.items.length;
  state.index = (state.index + (dir === -1 ? -1 : 1) + len) % len;
  render();
});
window.switcher.onClose(({ commit }) => {
  finish(commit);
});

window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.code === 'Tab') {
    e.preventDefault();
    const dir: 1 | -1 = e.shiftKey ? -1 : 1;
    const len = state.items.length;
    state.index = (state.index + (dir === -1 ? -1 : 1) + len) % len;
    render();
  } else if (e.code === 'Escape') {
    e.preventDefault();
    finish(false);
  }
  resetTimer();
});

window.addEventListener('mousemove', resetTimer);
window.addEventListener('keyup', (e: KeyboardEvent) => {
  if (e.key === 'Control' || e.key === 'Meta') finish(true);
});

window.addEventListener('resize', () => {
  requestAnimationFrame(measureAndResize);
});

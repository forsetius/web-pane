import type { OpenViewWindowTranslations } from '../types/TranslationStrings.js';
import { DotPath } from '../types/ConfigTypes.js';
import { getTyped } from '../utils/object.js';
import { OpenViewPaneChoice } from '../types/OpenView.js';
import { PanesInfo } from '../types/PanesInfo.js';

let panesCache: PanesInfo | undefined = undefined;

function el<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T;
}

function clearErrors() {
  ['openViewUrl', 'openViewId', 'paneExistingSelect', 'paneNewName'].forEach(
    (id) => {
      el(id).classList.remove('is-invalid');
    },
  );
}

function applyFieldErrors(list: { fieldId: string }[]) {
  for (const e of list) {
    el(e.fieldId).classList.add('is-invalid');
  }
}

async function setupTranslations() {
  const t = await window.i18n.bundle();

  const translations: Record<string, DotPath<OpenViewWindowTranslations>> = {
    docTitle: 'title',
    openViewTitle: 'title',
    openViewUrlLabel: 'url.label',
    openViewUrlError: 'url.error',
    openViewMoreToggle: 'more',
    openViewId_label: 'id.label',
    openViewIdError: 'id.error',
    paneChoice_label: 'pane.title',
    paneChoice_current_label: 'pane.current',
    paneChoice_existing_label: 'pane.existing',
    paneExistingError: 'pane.existingError',
    paneChoice_new_label: 'pane.new',
    paneNewNameError: 'pane.newError',
    btnCancel: 'command.cancel',
    btnSubmit: 'command.open',
  };
  for (const [id, translationKey] of Object.entries(translations)) {
    const value = getTyped(t, `windows.openView.${translationKey}`) as unknown;
    el(id).textContent = typeof value === 'string' ? value : '';
  }

  const placeholderTranslations: Record<
    string,
    DotPath<OpenViewWindowTranslations>
  > = {
    openViewId: 'id.placeholder',
    paneNewName: 'pane.newPlaceholder',
  };
  for (const [id, translationKey] of Object.entries(placeholderTranslations)) {
    const value = getTyped(t, `windows.openView.${translationKey}`) as unknown;
    el<HTMLInputElement>(id).placeholder =
      typeof value === 'string' ? value : '';
  }
}

function setupPaneSection(info: PanesInfo) {
  const wrap = document.getElementById('paneExistingWrap')!;
  const rExist = document.getElementById(
    'paneChoice_existing',
  ) as HTMLInputElement;
  const sel = document.getElementById(
    'paneExistingSelect',
  ) as HTMLSelectElement;
  sel.innerHTML = '';
  const others = info.panes.filter((p) => p !== info.current);
  for (const name of others) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  }
  const hasMany = info.panes.length > 1;
  wrap.style.display = hasMany ? '' : 'none';
  rExist.disabled = !hasMany;
  sel.disabled = !hasMany;

  const rCurr = document.getElementById(
    'paneChoice_current',
  ) as HTMLInputElement;
  const rNew = document.getElementById('paneChoice_new') as HTMLInputElement;
  const newName = document.getElementById('paneNewName') as HTMLInputElement;
  const toggle = () => {
    sel.disabled = !(rExist.checked && hasMany);
    newName.disabled = !rNew.checked;
  };
  [rCurr, rExist, rNew].forEach((r) => {
    r.addEventListener('change', toggle);
  });
  toggle();
}

function collectCandidate() {
  const url = el<HTMLInputElement>('openViewUrl').value;
  const id = el<HTMLInputElement>('openViewId').value || undefined;

  const rCurr = el<HTMLInputElement>('paneChoice_current');
  const rExist = el<HTMLInputElement>('paneChoice_existing');
  const sel = el<HTMLSelectElement>('paneExistingSelect');
  const newNm = el<HTMLInputElement>('paneNewName');

  return {
    url,
    id,
    pane: {
      paneChoice: rCurr.checked
        ? OpenViewPaneChoice.CURRENT
        : rExist.checked
          ? OpenViewPaneChoice.EXISTING
          : OpenViewPaneChoice.NEW,
      paneExistingName: sel.disabled ? undefined : sel.value || undefined,
      paneNewName: newNm.disabled ? undefined : newNm.value || undefined,
    },
  };
}

function validateForm(showErrors: boolean): boolean {
  if (!panesCache) return false;

  const candidate = collectCandidate();
  const result = window.openView.validate(candidate, panesCache);

  const submitBtn = el<HTMLButtonElement>('btnSubmit');

  if (result.ok) {
    clearErrors();
    submitBtn.disabled = false;
    return true;
  } else {
    if (showErrors) {
      clearErrors();
      applyFieldErrors(result.fieldErrors);
    }
    submitBtn.disabled = true;
    return false;
  }
}

function wireLiveValidation() {
  const url = el<HTMLInputElement>('openViewUrl');
  const id = el<HTMLInputElement>('openViewId');
  const sel = el<HTMLSelectElement>('paneExistingSelect');
  const newNm = el<HTMLInputElement>('paneNewName');
  const rads = [
    el<HTMLInputElement>('paneChoice_current'),
    el<HTMLInputElement>('paneChoice_existing'),
    el<HTMLInputElement>('paneChoice_new'),
  ];

  const softCheck = () => void validateForm(false);

  url.addEventListener('input', softCheck);
  id.addEventListener('input', softCheck);
  sel.addEventListener('change', softCheck);
  newNm.addEventListener('input', softCheck);
  rads.forEach((r) => {
    r.addEventListener('change', softCheck);
  });

  [url, id, sel, newNm, ...rads].forEach((elem) => {
    elem.addEventListener('blur', () => void validateForm(true));
  });
}

function resetFormUi() {
  el<HTMLFormElement>('openViewForm').reset();
  clearErrors();
  el<HTMLButtonElement>('btnSubmit').disabled = true;
}

async function refreshPanes() {
  panesCache = await window.openView.getPanes();

  setupPaneSection(panesCache);
  validateForm(false);
  setTimeout(() => {
    el<HTMLInputElement>('openViewUrl').focus();
  }, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  void (async () => {
    await setupTranslations();

    void refreshPanes();
    wireLiveValidation();
    window.dialog.onShow(() => {
      void setupTranslations();
      resetFormUi();
      void refreshPanes();
    });

    setTimeout(() => {
      el<HTMLFormElement>('openViewUrl').focus();
    }, 0);

    const close = () => {
      window.close();
    };
    el('btnClose').addEventListener('click', close);
    el('btnCancel').addEventListener('click', close);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.close();
    });

    const form = el<HTMLFormElement>('openViewForm');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      clearErrors();

      const result = window.openView.validate(collectCandidate(), panesCache!);

      if (!result.ok) {
        applyFieldErrors(result.fieldErrors);
        return;
      }

      window.openView.openUrl(result.data);
      window.close();
    });
  })();
});

import type { NewPaneWindowTranslations } from '../types/TranslationStrings.js';
import { DotPath } from '../types/ConfigTypes.js';
import { getTyped } from '../utils/object.js';
import { el } from '../utils/dom.js';

let panesCache: string[] | undefined = undefined;

function clearErrors() {
  el('newPaneId').classList.remove('is-invalid');
}

function applyFieldErrors(list: { fieldId: string }[]) {
  for (const e of list) {
    el(e.fieldId).classList.add('is-invalid');
  }
}

async function setupTranslations() {
  const t = await window.i18n.bundle();

  const translations: Record<string, DotPath<NewPaneWindowTranslations>> = {
    docTitle: 'title',
    newPaneTitle: 'title',
    newPaneIdLabel: 'id.label',
    newPaneIdError: 'id.error',
    btnCancel: 'command.cancel',
    btnSubmit: 'command.open',
  };
  for (const [id, translationKey] of Object.entries(translations)) {
    const value = getTyped(t, `windows.newPane.${translationKey}`) as unknown;
    el(id).textContent = typeof value === 'string' ? value : '';
  }

  el<HTMLInputElement>('newPaneId').placeholder = getTyped(
    t,
    'windows.newPane.id.placeholder',
  );
}

function collectCandidate() {
  const id = el<HTMLInputElement>('newPaneId').value || undefined;

  return { id };
}

function validateForm(showErrors: boolean): boolean {
  if (!panesCache) return false;

  const candidate = collectCandidate();
  const result = window.newPane.validate(candidate, panesCache);

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
  const id = el<HTMLInputElement>('newPaneId');

  const softCheck = () => void validateForm(false);

  id.addEventListener('input', softCheck);
  id.addEventListener('blur', () => void validateForm(true));
}

function resetFormUi() {
  el<HTMLFormElement>('newPaneForm').reset();
  clearErrors();
  el<HTMLButtonElement>('btnSubmit').disabled = true;
}

async function refreshPanes() {
  panesCache = await window.newPane.getPanes();

  validateForm(false);
  setTimeout(() => {
    el<HTMLInputElement>('newPaneId').focus();
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
      el<HTMLFormElement>('newPaneId').focus();
    }, 0);

    const close = () => {
      window.close();
    };
    el('btnClose').addEventListener('click', close);
    el('btnCancel').addEventListener('click', close);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.close();
    });

    const form = el<HTMLFormElement>('newPaneForm');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      clearErrors();

      const result = window.newPane.validate(collectCandidate(), panesCache!);

      if (!result.ok) {
        applyFieldErrors(result.fieldErrors);
        return;
      }

      window.newPane.createPane(result.data.id);
      window.close();
    });
  })();
});

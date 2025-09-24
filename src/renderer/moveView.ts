import type { MoveViewWindowTranslations } from '../types/TranslationStrings.js';
import { DotPath } from '../types/ConfigTypes.js';
import { getTyped } from '../utils/object.js';
import { MoveViewPaneChoice } from '../types/MoveView.js';
import { PanesInfo } from '../types/PanesInfo.js';
import { ValidationError } from '../types/validation.js';

let panesCache: PanesInfo | undefined = undefined;

function el<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T;
}

function clearErrors() {
  ['paneExistingSelect', 'paneNewName'].forEach((id) => {
    el(id).classList.remove('is-invalid');
  });
}

function applyFieldErrors(list: ValidationError[]) {
  for (const e of list) {
    el(e.fieldId).classList.add('is-invalid');
  }
}

async function setupTranslations() {
  const t = await window.i18n.bundle();

  const translations: Record<string, DotPath<MoveViewWindowTranslations>> = {
    docTitle: 'title',
    moveViewTitle: 'title',
    paneChoice_existing_label: 'pane.existing',
    paneExistingError: 'pane.existingError',
    paneChoice_new_label: 'pane.new',
    paneNewNameError: 'pane.newError',
    btnCancel: 'command.cancel',
    btnSubmit: 'command.open',
  };
  for (const [id, translationKey] of Object.entries(translations)) {
    const value = getTyped(t, `windows.moveView.${translationKey}`) as unknown;
    el(id).textContent = typeof value === 'string' ? value : '';
  }

  el<HTMLInputElement>('paneNewName').placeholder = getTyped(
    t,
    `windows.moveView.pane.newPlaceholder`,
  );
}

function setupPaneSection(info: PanesInfo) {
  // const wrap = document.getElementById('paneExistingWrap')!;
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
  rExist.disabled = !hasMany;
  sel.disabled = !hasMany;

  const rNew = document.getElementById('paneChoice_new') as HTMLInputElement;
  const newName = document.getElementById('paneNewName') as HTMLInputElement;
  const toggle = () => {
    sel.disabled = !(rExist.checked && hasMany);
    newName.disabled = !rNew.checked;
  };
  [rExist, rNew].forEach((r) => {
    r.addEventListener('change', toggle);
  });
  toggle();
}

function collectCandidate() {
  const rExist = el<HTMLInputElement>('paneChoice_existing');
  const sel = el<HTMLSelectElement>('paneExistingSelect');
  const newNm = el<HTMLInputElement>('paneNewName');

  const type = rExist.checked
    ? MoveViewPaneChoice.EXISTING
    : MoveViewPaneChoice.NEW;

  return {
    toPaneId: type === MoveViewPaneChoice.EXISTING ? sel.value : newNm.value,
  };
}

function validateForm(showErrors: boolean): boolean {
  if (!panesCache) return false;

  const candidate = collectCandidate();
  const result = window.moveView.validate(candidate, panesCache);

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
  const sel = el<HTMLSelectElement>('paneExistingSelect');
  const newNm = el<HTMLInputElement>('paneNewName');
  const rads = [
    el<HTMLInputElement>('paneChoice_existing'),
    el<HTMLInputElement>('paneChoice_new'),
  ];

  const softCheck = () => void validateForm(false);

  sel.addEventListener('change', softCheck);
  newNm.addEventListener('input', softCheck);
  rads.forEach((r) => {
    r.addEventListener('change', softCheck);
  });

  [sel, newNm, ...rads].forEach((elem) => {
    elem.addEventListener('blur', () => void validateForm(true));
  });
}

function resetFormUi() {
  el<HTMLFormElement>('moveViewForm').reset();
  clearErrors();
  el<HTMLButtonElement>('btnSubmit').disabled = true;
}

async function refreshPanes() {
  panesCache = await window.moveView.getPanes();

  setupPaneSection(panesCache);
  validateForm(false);
  setTimeout(() => {
    el<HTMLInputElement>('paneNewName').focus();
  }, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  void (async () => {
    await setupTranslations();

    void refreshPanes();
    wireLiveValidation();
    window.dialog.onShow(() => {
      resetFormUi();
      void refreshPanes();
    });

    setTimeout(() => {
      el<HTMLFormElement>('paneNewName').focus();
    }, 0);

    const close = () => {
      window.close();
    };
    el('btnClose').addEventListener('click', close);
    el('btnCancel').addEventListener('click', close);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.close();
    });

    const form = el<HTMLFormElement>('moveViewForm');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      clearErrors();

      const result = window.moveView.validate(collectCandidate(), panesCache!);

      if (!result.ok) {
        applyFieldErrors(result.fieldErrors);
        return;
      }

      window.moveView.doMoveView(result.data.toPaneId);
      window.close();
    });
  })();
});

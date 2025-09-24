import { TranslationStrings } from '../types/TranslationStrings.js';

export const translations: TranslationStrings = {
  error: {
    error: 'Błąd',
    unknown: 'Nieznany błąd',
    url: {
      invalid: 'Niepoprawny adres URL',
      nonEmpty: 'Wymagany niepusty adres URL',
      notHttp: 'Dozwolone tylko protokoły HTTP(S)',
    },
  },
  menu: {
    backward: 'Wstecz',
    closeView: 'Zamknij stronę',
    closePane: 'Zamknij okienko',
    forceReload: 'Wymuś przeładowanie',
    forward: 'Dalej',
    minimize: 'Minimalizuj',
    preferences: 'Preferencje',
    quit: 'Zakończ',
    reload: 'Przeładuj',
    resetZoom: 'Zresetuj powiększenie',
    view: 'Widok',
    zoomIn: 'Powiększ',
    zoomOut: 'Pomniejsz',
    pane: 'Okienko',
    newPane: 'Nowe okienko',
    switchPane: 'Przełącz okienko',
    minimizeAll: 'Zminimalizuj wszystkie',
    page: 'Strona',
    openView: 'Otwórz stronę',
    switchView: 'Przełącz stronę',
    moveViewToPane: 'Przenieś do okienka...',
    help: 'Pomoc',
    instruction: 'Instrukcja',
    about: 'O Web-pane',
  },
  windows: {
    about: {
      title: 'O Web-pane',
    },
    newPane: {
      title: 'Nowe okienko',
      id: {
        label: 'ID',
        placeholder: 'np. example-com',
        error: 'Nieprawidłowe ID.',
      },
      command: {
        cancel: 'Anuluj',
        open: 'Otwórz',
      },
    },
    openView: {
      title: 'Otwórz widok',
      url: {
        label: 'Adres URL',
        placeholder: 'https://example.com',
        error: 'Nieprawidłowy adres URL.',
      },
      more: 'więcej...',
      id: {
        label: 'ID',
        placeholder: 'np. example-com',
        error: 'Nieprawidłowe ID.',
      },
      pane: {
        title: 'Gdzie otworzyć?',
        current: 'w tym okienku',
        existing: 'w okienku:',
        existingError: 'Wybierz okienko z listy.',
        new: 'w nowym okienku',
        newPlaceholder: 'np. praca',
        newError: 'Podaj nazwę nowego okienka.',
      },
      command: {
        cancel: 'Anuluj',
        open: 'Otwórz',
      },
    },
    preferences: {
      title: 'Preferencje',
      showAppMenu: 'Pokaż menu aplikacji',
      showWindowFrame: 'Pokaż ramki okien',
      windowReloadNeededHint: 'Zmiana tej opcji spowoduje odtworzenie okien.',
      showInWindowList: 'Pokaż na liście okien',
      close: 'Zamknij',
      language: 'Język',
      polish: 'Polski',
      english: 'Angielski',
    },
    switcher: {
      hint: 'Trzymaj Ctrl, naciskaj Tab / Shift+Tab. Puść Ctrl, aby wybrać.',
    },
    moveView: {
      title: 'Przenieś widok',
      pane: {
        existing: 'do okienka:',
        existingError: 'Wybierz okienko z listy.',
        new: 'do nowego okienka',
        newPlaceholder: 'np. praca',
        newError: 'Podaj nazwę nowego okienka.',
      },
      command: {
        cancel: 'Anuluj',
        open: 'Otwórz',
      },
    },
  },
};

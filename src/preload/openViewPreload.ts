import { contextBridge, ipcRenderer } from 'electron';
import { z } from 'zod';
import { makeId } from '../utils/makeId.js';
import './commonDialogPreload.cjs';
import { OpenViewPaneChoice, OpenViewPayload } from '../types/OpenView.js';

contextBridge.exposeInMainWorld('openView', {
  getPanes: async (): Promise<{ current: string; panes: string[] }> => {
    return ipcRenderer.invoke('app:list-panes');
  },
  openUrl: (payload: OpenViewPayload) => {
    ipcRenderer.send('app:open-url', payload);
  },
  validate: (candidate: Candidate, panesInfo: PanesInfo): ValidateResult => {
    return validateWithPanes(candidate, panesInfo);
  },
});

type PanesInfo = { current: string; panes: string[] };

type Candidate = {
  url: string;
  id: string | undefined;
  pane: {
    paneChoice: string;
    paneExistingName: string | undefined;
    paneNewName: string | undefined;
  };
};

type Payload = { url: string; id: string; paneName: string };

type ValidateOk = { ok: true; data: Payload };
type ValidateErr = {
  ok: false;
  fieldErrors: { fieldId: string; messageKey: string }[];
};
type ValidateResult = ValidateOk | ValidateErr;

const UrlField = z
  .string()
  .trim()
  .min(7, { message: 'required' })
  .refine(
    (v) => {
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'invalid_url' },
  );

const PaneChoiceSchema = z.object({
  paneChoice: z.enum(OpenViewPaneChoice),
  paneExistingName: z.string().trim().optional(),
  paneNewName: z.string().trim().optional(),
});

const CandidateSchema = z
  .object({
    url: UrlField,
    id: z.string().trim().optional(),
    pane: PaneChoiceSchema,
  })
  .transform(({ url, id, pane }) => {
    const normalizedUrl = new URL(url).toString();
    const finalId = id && id.length > 0 ? id : makeId(normalizedUrl);
    return { url: normalizedUrl, id: finalId, pane };
  });

function validateWithPanes(
  input: Candidate,
  panesInfo: PanesInfo,
): ValidateResult {
  const base = CandidateSchema.safeParse(input);
  if (!base.success) {
    const errs = base.error.issues.map((iss) => {
      const field = String(iss.path[0] ?? 'url');
      return {
        fieldId: field === 'id' ? 'openViewId' : 'openViewUrl',
        messageKey: iss.message,
      };
    });
    return { ok: false, fieldErrors: errs };
  }

  const { url, id, pane } = base.data;
  const { current, panes } = panesInfo;

  if (pane.paneChoice === OpenViewPaneChoice.CURRENT) {
    return { ok: true, data: { url, id, paneName: current } };
  }

  if (pane.paneChoice === OpenViewPaneChoice.EXISTING) {
    const sel = pane.paneExistingName?.trim();
    if (!sel || !panes.includes(sel)) {
      return {
        ok: false,
        fieldErrors: [
          { fieldId: 'paneExistingSelect', messageKey: 'required' },
        ],
      };
    }
    return { ok: true, data: { url, id, paneName: sel } };
  }

  // OpenViewPaneChoice.NEW
  const name = pane.paneNewName?.trim() ?? '';
  if (!name) {
    return {
      ok: false,
      fieldErrors: [{ fieldId: 'paneNewName', messageKey: 'required' }],
    };
  }
  if (panes.includes(name)) {
    return {
      ok: false,
      fieldErrors: [{ fieldId: 'paneNewName', messageKey: 'already_exists' }],
    };
  }

  return { ok: true, data: { url, id, paneName: name } };
}

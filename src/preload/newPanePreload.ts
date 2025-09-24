import { contextBridge, ipcRenderer } from 'electron';
import { z } from 'zod';
import './commonDialogPreload.cjs';
import { PanesInfo } from '../types/PanesInfo.js';
import { ValidationResult } from '../types/validation.js';

type Candidate = { id: string | undefined };
type Payload = { id: string };

contextBridge.exposeInMainWorld('newPane', {
  createPane: (id: string) => {
    ipcRenderer.send('app:new-pane', { id });
  },
  getPanes: async (): Promise<string[]> => {
    const panesInfo = (await ipcRenderer.invoke('app:list-panes')) as PanesInfo;

    return panesInfo.panes;
  },
  validate: (
    candidate: Candidate,
    panes: string[],
  ): ValidationResult<Payload> => {
    return validate(candidate, panes);
  },
});

const CandidateSchema = z.object({
  id: z.string().trim().min(1),
});

function validate(
  input: Candidate,
  panes: string[],
): ValidationResult<Payload> {
  const base = CandidateSchema.refine((vals) => !panes.includes(vals.id), {
    message: 'already_exists',
  }).safeParse(input);

  if (!base.success) {
    const errs = base.error.issues.map((iss) => {
      return {
        fieldId: 'newPaneId',
        message: iss.message,
      };
    });
    return { ok: false, fieldErrors: errs };
  }

  return { ok: true, data: { id: base.data.id } };
}

import { contextBridge, ipcRenderer } from 'electron';
import { z } from 'zod';
import './commonDialogPreload.cjs';
import { PanesInfo } from '../types/PanesInfo.js';
import { MoveViewPayload } from '../types/MoveView.js';
import { ValidationResult } from '../types/validation.js';

contextBridge.exposeInMainWorld('moveView', {
  getPanes: async (): Promise<{ current: string; panes: string[] }> => {
    return ipcRenderer.invoke('app:list-panes');
  },
  doMoveView: (toPaneId: string) => {
    ipcRenderer.send('app:move-view', toPaneId);
  },
  validate: (
    candidate: Candidate,
    panesInfo: PanesInfo,
  ): ValidationResult<MoveViewPayload> => {
    return validate(candidate, panesInfo);
  },
});

const CandidateSchema = z.object({
  toPaneId: z.string().trim().min(1),
});
type Candidate = z.infer<typeof CandidateSchema>;

function validate(
  input: Candidate,
  panesInfo: PanesInfo,
): ValidationResult<MoveViewPayload> {
  const base = CandidateSchema.safeParse(input);
  if (!base.success) {
    const errs = base.error.issues.map((iss) => {
      return {
        fieldId: 'paneNewName',
        message: iss.message,
      };
    });
    return { ok: false, fieldErrors: errs };
  }

  const { toPaneId } = base.data;
  const { current } = panesInfo;

  if (toPaneId === current) {
    return {
      ok: false,
      fieldErrors: [
        { fieldId: 'paneNewName', message: 'current_pane_invalid' },
      ],
    };
  }

  return { ok: true, data: { toPaneId } };
}

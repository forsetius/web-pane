export type ValidationResult<Payload> =
  | { ok: true; data: Payload }
  | { ok: false; fieldErrors: ValidationError[] };

export interface ValidationError {
  fieldId: string;
  message: string;
}

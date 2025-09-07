import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';

export function fromZodError(error: ZodError) {
  return fromError(error, {
    prefix: ' - ',
    prefixSeparator: '',
    issueSeparator: '\n - ',
  });
}

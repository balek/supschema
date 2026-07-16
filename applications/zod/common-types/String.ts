import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { z } from 'zod';
import { applyDataValueMeta, ZodExtension } from '../base.js';

declare module '@supschema/common-types/String.js' {
  interface String extends ZodExtension<z.ZodString> {}
}

extend(S.String, {
  get $zod() {
    let stringSchema = z.string();

    if (this.minLength !== undefined) stringSchema = stringSchema.min(this.minLength);
    if (this.maxLength !== undefined) stringSchema = stringSchema.max(this.maxLength);
    if (this.pattern !== undefined) stringSchema = stringSchema.regex(new RegExp(this.pattern));

    return applyDataValueMeta(this, stringSchema);
  },
});

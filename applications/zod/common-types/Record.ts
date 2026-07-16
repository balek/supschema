import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { applyDataValueMeta, ZodExtended, ZodExtension } from '../base.js';
import { z } from 'zod';

declare module '@supschema/common-types/Record.js' {
  interface Record<K, V> extends ZodExtension<
    K extends ZodExtended<infer ZK>
      ? ZK extends z.core.$ZodRecordKey
        ? V extends ZodExtended<infer ZV>
          ? z.ZodRecord<ZK, ZV>
          : never
        : never
      : never
  > {}
}

type ExtendedRecord = S.Record<S.String & ZodExtended, S.DataValue & ZodExtended>;
extend(S.Record, {
  get $zod(): ExtendedRecord['$zod'] | undefined {
    if (!this.keys.$zod || !this.values.$zod) return;
    return applyDataValueMeta(this, z.record(this.keys.$zod, this.values.$zod));
  },
} as ThisType<ExtendedRecord>);

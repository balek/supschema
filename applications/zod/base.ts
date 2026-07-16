import { S } from '@supschema/common-types';
import { z } from 'zod';

export interface ZodExtension<T extends z.ZodType | undefined = z.ZodType | undefined> {
  $zod: T;
}
export interface ZodExtended<T extends z.ZodType = z.ZodType> extends ZodExtension<T> {}

export const applyDataValueMeta = <T extends z.ZodType>(schema: S.DataValue, zodSchema: T): T => {
  if (!schema.title && !schema.description && !schema.deprecated) return zodSchema;
  return zodSchema.meta({ title: schema.title, description: schema.description, deprecated: schema.deprecated });
};

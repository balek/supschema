import Numeric from '@supschema/common-types/numeric/Numeric.js';
import z from 'zod';
import { applyDataValueMeta } from '../../base.js';

export const applyNumericConstraints = <Z extends z.ZodNumber>(schema: Numeric, zodSchema: Z): Z => {
  let result = zodSchema;

  if (schema.minimum !== undefined) result = result.gte(schema.minimum);
  if (schema.maximum !== undefined) result = result.lte(schema.maximum);
  if (schema.exclusiveMinimum !== undefined) result = result.gt(schema.exclusiveMinimum);
  if (schema.exclusiveMaximum !== undefined) result = result.lt(schema.exclusiveMaximum);
  if (schema.multipleOf !== undefined) result = result.multipleOf(schema.multipleOf);

  return applyDataValueMeta(schema, result);
};

export const applyBigIntConstraints = <Z extends z.ZodBigInt>(schema: Numeric, zodSchema: Z): Z => {
  let result = zodSchema;

  if (schema.minimum !== undefined) result = result.gte(BigInt(schema.minimum));
  if (schema.maximum !== undefined) result = result.lte(BigInt(schema.maximum));
  if (schema.exclusiveMinimum !== undefined) result = result.gt(BigInt(schema.exclusiveMinimum));
  if (schema.exclusiveMaximum !== undefined) result = result.lt(BigInt(schema.exclusiveMaximum));
  if (schema.multipleOf !== undefined) result = result.multipleOf(BigInt(schema.multipleOf));

  return applyDataValueMeta(schema, result);
};

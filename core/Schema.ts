export interface Schema {}

export type SchemaOptions<S extends Schema> = {
  [K in keyof S as K extends `$${string}` ? never : K]: S[K];
};

export interface SchemaType<S extends Schema = any, Args extends any[] = any[]> {
  (...args: Args): S;
  prototype: S;
  importMeta: ImportMeta;
  getConstructorArgs: (opts: SchemaOptions<S>) => Args;
}

export const defineConstructor = <S extends Schema, A extends unknown[]>(fn: (...args: A) => SchemaOptions<S>) =>
  fn as (...args: A) => S;

export function createType<S extends Schema>(
  importMeta: ImportMeta,
  parentType: SchemaType,
): SchemaType<S, [opts?: SchemaOptions<S>]>;

export function createType<Fn extends (...args: any[]) => Schema>(
  importMeta: ImportMeta,
  parentType: SchemaType,
  fn: Fn,
  getConstructorArgs: (opts: SchemaOptions<ReturnType<Fn>>) => Parameters<Fn>,
): Fn & SchemaType<ReturnType<Fn>, Parameters<Fn>>;

export function createType(
  importMeta: ImportMeta,
  parentType: SchemaType,
  fn = (opts = {}) => opts,
  getConstructorArgs = (s: any) => (Object.keys(s).length ? [{ ...s }] : []),
) {
  function constructorFn(...args: any[]) {
    const schema = fn(...args) as Schema;
    Object.setPrototypeOf(schema, constructorFn.prototype);
    return schema;
  }
  Object.defineProperty(constructorFn, 'name', {
    value:
      importMeta.url
        .replace(/\.[^/.]+$/, '')
        .split('/')
        .findLast((s) => s !== 'index') ?? 'Schema',
  });
  if (parentType) Object.setPrototypeOf(constructorFn.prototype, parentType.prototype);

  const type = Object.assign(constructorFn, { importMeta, getConstructorArgs });

  return type;
}

export const getSchemaType = <S extends Schema>(schema: S): SchemaType<S> => schema.constructor as SchemaType<S>;

export const extend = <S extends Schema>(
  type: SchemaType<S>,
  ext: Partial<S> & ThisType<S>,
  opts?: { memoGetters?: boolean },
) =>
  Object.defineProperties(
    type.prototype,
    Object.fromEntries(
      Object.entries(Object.getOwnPropertyDescriptors(ext)).map(([key, descriptor]) => [
        key,
        descriptor.get && opts?.memoGetters !== false
          ? {
              get: function () {
                const v = descriptor.get?.call(this);
                Object.defineProperty(this, key, { value: v });
                return v;
              },
              configurable: true,
            }
          : descriptor,
      ]),
    ),
  );

export const Schema = createType<Schema>(import.meta, undefined as never);
export default Schema;

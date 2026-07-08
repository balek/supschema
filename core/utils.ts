export type Evaluate<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type ConstructorFn = ((...args: any[]) => object) | (new () => object);
export const findDescriptorInPrototypeChain = <T extends object, K extends keyof T>(
  self: T,
  key: K,
  stopAtConstructor?: ConstructorFn,
) => {
  let proto = self;

  while (proto && proto !== stopAtConstructor?.prototype) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, key);
    if (descriptor) return descriptor;
    proto = Object.getPrototypeOf(proto);
  }
};

export const getSuper = <T extends object, K extends keyof T>(
  self: T,
  key: K,
  startingAncestorConstructor?: ConstructorFn,
): any extends T[K] ? never : T[K] | undefined => {
  const descriptor =
    findDescriptorInPrototypeChain(
      Object.getPrototypeOf(startingAncestorConstructor?.prototype ?? Object.getPrototypeOf(self)),
      key,
    ) ?? {};
  return descriptor.get ? descriptor.get.call(self) : descriptor.value;
};

export const callSuper = <K extends string, Args extends any[], T extends { [key in K]: (...args: Args) => any }>(
  self: T,
  key: K,
  startingAncestorConstructor: ConstructorFn,
  ...args: Args
): any extends T[K] ? never : ReturnType<T[K]> | undefined =>
  (getSuper(self, key, startingAncestorConstructor) as any)?.apply(self, args);

export class InferExtension<T> {
  // oxlint-disable-next-line no-unused-private-class-members
  readonly #type = undefined as T;
  default?: T;
}

export type Infer<P> = P extends InferExtension<infer T> ? T : never;

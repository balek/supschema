import { computed } from '@vue/reactivity';

export abstract class Registry {
  abstract register(...args: unknown[]): unknown;
  abstract merge(another: this): void;
  abstract clear(): void;
  abstract isEqual(another: this): boolean;
}

type RegistryMap = Map<new () => Registry, Registry>;

/**
 * Active registry map for the current execution scope.
 */
export let currentRegistries: Map<new () => Registry, Registry> = new Map();

/**
 * Temporarily swap in a registry map for the duration of a callback.
 */
export const withRegistries = <T>(map: RegistryMap, fn: () => T) => {
  const previousRegistries = currentRegistries;
  currentRegistries = map;

  const res = fn();

  currentRegistries = previousRegistries;

  return res;
};

/**
 * Retrieve the currently active registry instance for a specific registry class.
 */
export const getRegistry = <R extends Registry>(registryClass: new () => R): R => {
  const registry = currentRegistries.get(registryClass);
  if (!registry) throw new Error('Registry is requested but not set');
  return registry as R;
};

/**
 * A registry wrapper that records writes into a separate change set while
 * forwarding them to the original registry as well.
 */
type TrackingRegistry<R extends Registry = Registry> = R & { _changesRegistry?: R; _initChangesRegistry(): R };
export const createTrackingRegistry = <R extends Registry>(r: R): TrackingRegistry<R> =>
  Object.assign(Object.create(r), {
    _changesRegistry: undefined,
    _initChangesRegistry() {
      if (!this._changesRegistry) {
        const cls = r.constructor as new () => R;
        this._changesRegistry = new cls();
      }
      return this._changesRegistry;
    },
    register(...args) {
      this._initChangesRegistry().register(...args);
      return r.register(...args);
    },
    merge(...args) {
      this._initChangesRegistry().merge(...args);
      return r.merge(...args);
    },
  } as TrackingRegistry<R>);

type TrackingRegistryMap = Map<new () => Registry, TrackingRegistry>;

/**
 * Save current registries and restore them on each computed run. Track all registry changes
 * and merge those changes back into the real registries when computed value is read.
 */
export const computedWithRegistries = <T>(fn: () => T) => {
  const computedRegistries = currentRegistries;
  const c = computed<{ result: T; changesRegistries: RegistryMap }>((previous) => {
    const trackingRegistries: TrackingRegistryMap = new Map();
    for (const [cls, registry] of computedRegistries) {
      trackingRegistries.set(cls, createTrackingRegistry(registry));
    }

    const result = withRegistries(trackingRegistries, fn);

    const changesRegistries: RegistryMap = new Map();
    for (const [cls, registry] of trackingRegistries) {
      if (!registry._changesRegistry) continue;
      changesRegistries.set(cls, registry._changesRegistry);
    }

    const reusePrevious =
      previous?.changesRegistries.size === changesRegistries.size &&
      [...previous.changesRegistries.entries()].every(([cls, r]) => changesRegistries.get(cls)?.isEqual(r));

    return { result, changesRegistries: reusePrevious ? previous.changesRegistries : changesRegistries };
  });

  return {
    get value() {
      const { result, changesRegistries } = c.value;
      for (const [cls, changes] of changesRegistries.entries()) {
        getRegistry(cls).merge(changes);
      }
      return result;
    },
  };
};

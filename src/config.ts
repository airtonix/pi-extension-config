import nconf from 'nconf';
import { homedir } from 'os';
import path from 'path';
import EventEmitter from 'events';
import { MigrationResult, runMigrations, type Migration } from './migrations.ts';

// eslint-disable-next-line no-unused-vars
export type ConfigParseFn<TConfig> = (config: unknown) => TConfig | Promise<TConfig>;

type ConfigSetEvent = {
  key: string;
  target: 'home' | 'project';
  previousValue: unknown;
  nextValue: unknown;
};

type ConfigSavingEvent = {
  target: 'home' | 'project';
};

type ConfigSavedEvent = {
  target: 'home' | 'project';
  persistedKeys: string[];
};

type ConfigSaveFailedEvent = {
  target: 'home' | 'project';
  error: unknown;
};

export class ConfigEventEmitter<T> extends EventEmitter<{
  MigrationFailed: [MigrationResult<unknown>];
  MigrationApplied: [MigrationResult<unknown>];
  MigrationNoop: [MigrationResult<unknown>];
  ConfigLoading: [];
  ConfigLoaded: [LoadedConfigState<T>];
  ConfigLoadFailed: [unknown];
  ConfigParseFailed: [unknown];
  ConfigSet: [ConfigSetEvent];
  ConfigReloading: [];
  ConfigReloaded: [LoadedConfigState<T>];
  ConfigReloadFailed: [unknown];
  ConfigSaving: [ConfigSavingEvent];
  ConfigSaved: [ConfigSavedEvent];
  ConfigSaveFailed: [ConfigSaveFailedEvent];
}> {}

export type CreateConfigServiceOptions<TConfig> = {
  defaults?: Partial<TConfig>;
  parse?: ConfigParseFn<TConfig>;
  migrations?: Migration[];
  versionKey?: string;
  exposeVersion?: boolean;
};

/* eslint-disable no-unused-vars */
export type ConfigService<TConfig> = {
  readonly config: TConfig;
  readonly ready: Promise<void>;
  set(key: string, value: unknown, target?: 'home' | 'project'): Promise<void>;
  reload(): Promise<void>;
  save(target?: 'home' | 'project'): Promise<void>;
  events: ConfigEventEmitter<TConfig>;
};

type NconfStore = {
  set?(key: string, value: unknown): unknown;
  saveSync?(): unknown;
  save?(value: unknown, callback: (error?: Error | null) => void): void;
};
/* eslint-enable no-unused-vars */

type NconfProviderWithStores = nconf.Provider & {
  stores?: Record<string, NconfStore>;
};

type LoadedConfigState<TConfig> = {
  config: TConfig;
  persistedConfig: Record<string, unknown>;
};

const DEFAULT_VERSION_KEY = '__configVersion';

function toRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return { ...(value as Record<string, unknown>) };
}

function cloneValue<TValue>(value: TValue): TValue {
  if (typeof globalThis.structuredClone === 'function') {
    try {
      return globalThis.structuredClone(value);
    } catch {
      return value;
    }
  }

  return value;
}

function maybeHideVersion<TConfig>(
  config: TConfig,
  versionKey: string,
  exposeVersion: boolean
): TConfig {
  if (exposeVersion) {
    return config;
  }

  if (config === null || typeof config !== 'object' || Array.isArray(config)) {
    return config;
  }

  const configObject = config as Record<string, unknown>;
  if (!(versionKey in configObject)) {
    return config;
  }

  const withoutVersion = { ...configObject };
  delete withoutVersion[versionKey];
  return withoutVersion as TConfig;
}

async function discoverGitRoot(): Promise<string | null> {
  try {
    const root = await Bun.$`git rev-parse --show-toplevel`.text();
    const trimmedRoot = root.trim();
    if (trimmedRoot.length === 0) {
      return null;
    }

    return trimmedRoot;
  } catch {
    return null;
  }
}

export async function createConfigService<TConfig = Record<string, unknown>>(
  name: string,
  options?: CreateConfigServiceOptions<TConfig>
): Promise<ConfigService<TConfig>> {
  const events = new ConfigEventEmitter<TConfig>();
  const appname = name;
  const envprefix = appname.toUpperCase().replace(/-/g, '_') + '_';
  const versionKey = options?.versionKey ?? DEFAULT_VERSION_KEY;
  const exposeVersion = options?.exposeVersion ?? false;

  const provider = new nconf.Provider();

  // Env
  provider.env({
    separator: '__',
    match: new RegExp(`^${envprefix}`),
  });

  const root = await discoverGitRoot();

  // Files
  // The local config file is stored in the git root directory under .pi/<app>.config.json
  provider.file('project', {
    file: path.join(root || process.cwd(), '.pi', `${appname}.config.json`),
  });

  // The main config file is stored in the user's home directory under .pi/agent/<app>.config.json
  provider.file('home', {
    file: path.join(homedir(), '.pi', 'agent', `${appname}.config.json`),
  });

  provider.load();

  const loadConfig = async (): Promise<LoadedConfigState<TConfig>> => {
    events.emit('ConfigLoading');

    try {
      const rawConfig = toRecord(provider.get());
      const migrations = options?.migrations ?? [];
      let persistedConfig = { ...rawConfig };

      if (migrations.length > 0) {
        const migrationInput = { ...rawConfig };
        const currentVersionValue = migrationInput[versionKey];
        const currentVersion = currentVersionValue === undefined ? 0 : Number(currentVersionValue);
        delete migrationInput[versionKey];

        const migrationResult = await runMigrations({
          config: migrationInput,
          currentVersion,
          migrations,
        });

        if (migrationResult.status === 'failed') {
          if (migrationResult.failure) {
            events.emit('MigrationFailed', migrationResult);
            throw new Error(
              `Migration failed at ${migrationResult.failure.migrationId} (${migrationResult.failure.fromVersion} -> ${migrationResult.failure.toVersion}): ${migrationResult.failure.message}`
            );
          }

          events.emit('MigrationFailed', migrationResult);
          throw new Error('Migration failed');
        }

        if (migrationResult.status === 'migrated') {
          events.emit('MigrationApplied', migrationResult);
        }

        if (migrationResult.status === 'noop') {
          events.emit('MigrationNoop', migrationResult);
        }

        const migratedConfig = toRecord(migrationResult.config);
        persistedConfig = {
          ...migratedConfig,
          [versionKey]: migrationResult.finalVersion,
        };
      }

      const mergedForParse: unknown = {
        ...toRecord(options?.defaults),
        ...persistedConfig,
      };

      let parsedConfig: TConfig;
      try {
        parsedConfig = options?.parse
          ? await options.parse(mergedForParse)
          : (mergedForParse as TConfig);
      } catch (error) {
        events.emit('ConfigParseFailed', error);
        throw error;
      }

      const output = {
        config: maybeHideVersion(parsedConfig, versionKey, exposeVersion),
        persistedConfig,
      };

      events.emit('ConfigLoaded', output);
      return output;
    } catch (error) {
      events.emit('ConfigLoadFailed', error);
      throw error;
    }
  };

  let loadedConfig: LoadedConfigState<TConfig> = {
    config: maybeHideVersion(toRecord(options?.defaults) as TConfig, versionKey, exposeVersion),
    persistedConfig: {},
  };
  let config = cloneValue(loadedConfig.config);
  let persistedConfig = { ...loadedConfig.persistedConfig };

  async function hydrateFromDisk(): Promise<void> {
    provider.load();
    loadedConfig = await loadConfig();
    config = cloneValue(loadedConfig.config);
    persistedConfig = { ...loadedConfig.persistedConfig };
  }

  const ready = new Promise<void>((resolve, reject) => {
    globalThis.setTimeout(() => {
      void hydrateFromDisk().then(resolve).catch(reject);
    }, 0);
  });
  void ready.catch(() => undefined);

  async function ensureReady(): Promise<void> {
    await ready;
  }

  async function set(
    key: string,
    value: unknown,
    target: 'home' | 'project' = 'project'
  ): Promise<void> {
    await ensureReady();

    const store = (provider as NconfProviderWithStores).stores?.[target];
    if (!store || typeof store.set !== 'function') {
      throw new Error(`Config target '${target}' does not support setting keys.`);
    }

    const previousValue = persistedConfig[key];
    store.set(key, value);
    loadedConfig = await loadConfig();
    config = cloneValue(loadedConfig.config);
    persistedConfig = { ...loadedConfig.persistedConfig };
    events.emit('ConfigSet', {
      key,
      target,
      previousValue,
      nextValue: value,
    });
  }

  async function reload(): Promise<void> {
    await ensureReady();
    events.emit('ConfigReloading');

    try {
      await hydrateFromDisk();
      events.emit('ConfigReloaded', loadedConfig);
    } catch (error) {
      events.emit('ConfigReloadFailed', error);
      throw error;
    }
  }

  async function save(target: 'home' | 'project' = 'home'): Promise<void> {
    await ensureReady();
    events.emit('ConfigSaving', { target });

    try {
      const store = (provider as NconfProviderWithStores).stores?.[target];
      if (!store) {
        throw new Error(`Unknown config target: ${target}`);
      }

      if (typeof store.set === 'function') {
        for (const [key, value] of Object.entries(persistedConfig)) {
          store.set(key, value);
        }
      }

      if (typeof store.saveSync === 'function') {
        store.saveSync();
        await reload();
        events.emit('ConfigSaved', { target, persistedKeys: Object.keys(persistedConfig) });
        return;
      }

      if (typeof store.save === 'function') {
        await new Promise<void>((resolve, reject) => {
          store.save?.(undefined, (error?: Error | null) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });
        await reload();
        events.emit('ConfigSaved', { target, persistedKeys: Object.keys(persistedConfig) });
        return;
      }

      throw new Error(`Config target '${target}' does not support saving.`);
    } catch (error) {
      events.emit('ConfigSaveFailed', { target, error });
      throw error;
    }
  }
  return {
    get config() {
      return cloneValue(config);
    },
    ready,
    set,
    reload,
    save,
    events,
  };
}

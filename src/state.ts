import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * State persisted between monitoring runs
 */
export interface State {
  hash: string;
  lastCheck: string;
  url: string;
}

const DATA_DIR = './data';
const STATE_FILE = 'state.json';

/**
 * Gets the full path to the state file
 */
function getStatePath(): string {
  return join(DATA_DIR, STATE_FILE);
}

/**
 * Loads the previous hash from the state file.
 * @returns The previous hash, or null if no state exists
 */
export function loadState(): string | null {
  const statePath = getStatePath();

  if (!existsSync(statePath)) {
    return null;
  }

  try {
    const content = readFileSync(statePath, 'utf-8');
    const state: State = JSON.parse(content);
    return state.hash;
  } catch {
    // Corrupted state file, treat as first run
    return null;
  }
}

/**
 * Saves the current hash to the state file.
 * @param hash - The current MD5 hash
 * @param url - The URL being monitored
 */
export function saveState(hash: string, url: string): void {
  const statePath = getStatePath();
  const dir = dirname(statePath);

  // Ensure data directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const state: State = {
    hash,
    lastCheck: new Date().toISOString(),
    url,
  };

  writeFileSync(statePath, JSON.stringify(state, null, 2));
}

/**
 * Loads the full state object.
 * @returns The full state object, or null if no state exists
 */
export function loadFullState(): State | null {
  const statePath = getStatePath();

  if (!existsSync(statePath)) {
    return null;
  }

  try {
    const content = readFileSync(statePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameContext } from './types';

const GAME_STATE_KEY = 'finska_game_state';
const MACHINE_STATE_KEY = 'finska_machine_value';

export interface SavedState {
  context: GameContext;
  machineValue: string; // serialised machine state value
}

export async function saveState(
  context: GameContext,
  machineValue: any,
): Promise<void> {
  try {
    const data: SavedState = {
      context,
      machineValue: JSON.stringify(machineValue),
    };
    await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export async function loadState(): Promise<SavedState | null> {
  try {
    const raw = await AsyncStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedState;
    data.machineValue = JSON.parse(data.machineValue);
    return data;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GAME_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}

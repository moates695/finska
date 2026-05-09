import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage, loadable } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, ThemeType, Theme } from '@/styles/theme';

const storage = createJSONStorage<any>(() => AsyncStorage);

/** Stored theme type string — avoids serialising the full Theme object. */
export const themeTypeAtom = atomWithStorage<ThemeType>(
  'finska_theme_type',
  'light',
  storage,
);

/** Derived full theme object from the stored type. */
const themeBaseAtom = atom<Promise<Theme>>(async (get) => {
  const type = await get(themeTypeAtom);
  return themes[type] ?? themes.light;
});

const loadableThemeAtom = loadable(themeBaseAtom);

/** Synchronous theme atom — returns light as fallback while loading. */
export const themeAtom = atom<Theme>((get) => {
  const loadableTheme = get(loadableThemeAtom);
  if (loadableTheme.state === 'hasData') return loadableTheme.data;
  return themes.light;
});

/** Whether to use the device's colour scheme instead of the stored choice. */
export const useDeviceThemeAtom = atomWithStorage<boolean>(
  'finska_use_device_theme',
  false,
  storage,
);

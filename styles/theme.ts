type Color = `#${string}` | 'transparent'

export interface Theme {
  primaryBackground: Color,
  paleComponent: Color,
  brightComponent: Color,
  listColorA: Color,
  listColorB: Color,
  participantListItem: Color
}

export type ThemeType = 'light' | 'dark' | 'sand' | 'midnight';

export const themes: Record<ThemeType, Theme> = {
  light: {
    primaryBackground: '#ffffff',
    paleComponent: '#aeaeaeff',
    brightComponent: '#b5ffffff',
    listColorA: '#9afaff7a',
    listColorB: '#9affbf7a',
    participantListItem: '#ffca7aff',
  },
  dark: {
    primaryBackground: '#0b0b0bff',
    paleComponent: '#373737ff',
    brightComponent: '#000e3eff',
    listColorA: '#9afaff7a',
    listColorB: '#9affbf7a',
    participantListItem: '#ffca7aff',
  },
  sand: {
    primaryBackground: '#ffedaaff',
    paleComponent: '#e2d298ff',
    brightComponent: '#ffa500',
    listColorA: '#9afaff7a',
    listColorB: '#9affbf7a',
    participantListItem: '#ffca7aff',
  },
  midnight: {
    primaryBackground: '#ffedaaff',
    paleComponent: '#e2d298ff',
    brightComponent: '#ffa500',
    listColorA: '#9afaff7a',
    listColorB: '#9affbf7a',
    participantListItem: '#ffca7aff',
  }
}
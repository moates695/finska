type Color = `#${string}` | 'transparent'

export interface Theme {
  primaryBackground: Color,
  paleComponent: Color,
  brightComponent: Color,
  listColorA: Color,
  listColorB: Color,
  participantListItem: Color
  pinSelected: Color
  pinNotSelected: Color
  text: Color
}

export type ThemeType = 'light' | 'dark' | 'sand' | 'midnight';

// todo go through each component and add all necessary color types above
// todo then make each color way

export const themes: Record<ThemeType, Theme> = {
  light: {
    primaryBackground: '#ffffff',
    paleComponent: '#aeaeaeff',
    brightComponent: '#b5ffffff',
    listColorA: '#9afaff7a',
    listColorB: '#9affbf7a',
    participantListItem: '#ffca7aff',
    pinSelected: '#3fec00ff',
    pinNotSelected: '#ffedaaff',
    text: '#000000',
  },
  dark: {
    primaryBackground: '#0b0b0bff',
    paleComponent: '#373737ff',
    brightComponent: '#000e3eff',
    listColorA: '#9afaff7a',
    listColorB: '#9affbf7a',
    participantListItem: '#ffca7aff',
    pinSelected: '#3fec00ff',
    pinNotSelected: '#ffedaaff',
    text: '#ffffff',
  },
  sand: {
    primaryBackground: '#ffedaaff',
    paleComponent: '#e2d298ff',
    brightComponent: '#ffa500',
    listColorA: '#9afaff7a',
    listColorB: '#9affbf7a',
    participantListItem: '#ffca7aff',
    pinSelected: '#3fec00ff',
    pinNotSelected: '#ffedaaff',
    text: '#000000',
  },
  midnight: { // todo
    primaryBackground: '#ffedaaff',
    paleComponent: '#e2d298ff',
    brightComponent: '#ffa500',
    listColorA: '#9afaff7a',
    listColorB: '#9affbf7a',
    participantListItem: '#ffca7aff',
    pinSelected: '#3fec00ff',
    pinNotSelected: '#ffedaaff',
    text: '#ffffff',
  }
}
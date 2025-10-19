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
  border: Color
  errorText: Color
  submit: Color
  disabledButton: Color
  staticButton: Color
  missButton: Color
  selectedBox: Color
  dropdownBackground: Color
  dropdownSelectedText: Color
  dropdownText: Color
  modalBackdrop: Color
  switchTrackOn: Color
  switchTrackOff: Color
  switchThumbOn: Color
  switchThumbOff: Color
  switchIosBackground: Color
  pinOutline: Color
  pinWinOutline: Color
  eliminatedSeperator: Color
  canWinSeperator: Color
  scoreboardCurrentOutline: Color
  scoreboardOutline: Color
  scoreboardEliminatedText: Color
  placeHolderText: Color
}

export type ThemeType = 'light' | 'dark' | 'sand';

// todo go through each component and add all necessary color types above
// todo then make each color way


export const themes: Record<ThemeType, Theme> = {
  light: {
    primaryBackground: '#ffffff',
    paleComponent: '#afd2d5ff',
    brightComponent: '#b5ffffff',
    listColorA: '#9afaff7a',
    listColorB: '#9affbf7a',
    participantListItem: '#afd2d5ff',
    pinSelected: '#3fec00ff',
    pinNotSelected: '#afd2d5ff',
    text: '#000000',
    border: '#000000',
    errorText: '#ff0000ff',
    submit: '#16bd00ff',
    disabledButton: '#000000',
    staticButton: '#000000',
    missButton: '#ff0000ff',
    selectedBox: '#ffffff',
    dropdownBackground: '#ffffff',
    dropdownSelectedText: '#3fec00ff',
    dropdownText: '#000000',
    modalBackdrop: '#00000099',
    switchTrackOn: '#b4fcac',
    switchTrackOff: '#767577',
    switchThumbOn: '#1aff00',
    switchThumbOff: '#f4f3f4',
    switchIosBackground: '#3e3e3e',
    pinOutline: '#ffffff',
    pinWinOutline: '#00fff7ff',
    eliminatedSeperator: '#ff0000ff',
    canWinSeperator: '#ffffff',
    scoreboardCurrentOutline: '#ffffff',
    scoreboardOutline: 'transparent',
    scoreboardEliminatedText: '#ff0000ff',
    placeHolderText: '#2c2c2cff',
  },
  dark: {
    primaryBackground: '#181818ff',
    paleComponent: '#2a2a2aff',
    brightComponent: '#5d5d5dff',
    listColorA: '#4398ffbc',
    listColorB: '#fea035b8',
    participantListItem: '#2a2a2aff',
    pinSelected: '#ffa600ff',
    pinNotSelected: '#2a2a2aff',
    text: '#dfdfdfff',
    border: '#ddddddff',
    errorText: '#ff0000ff',
    submit: '#3fec00ff',
    disabledButton: '#ddddddff',
    staticButton: '#ddddddff',
    missButton: '#ff0000ff',
    selectedBox: '#dfdfdfff',
    dropdownBackground: '#ffffff',
    dropdownSelectedText: '#3fec00ff',
    dropdownText: '#ffffff',
    modalBackdrop: '#00000099',
    switchTrackOn: '#b4fcac',
    switchTrackOff: '#767577',
    switchThumbOn: '#1aff00',
    switchThumbOff: '#f4f3f4',
    switchIosBackground: '#3e3e3e',
    pinOutline: '#ffffff',
    pinWinOutline: '#ff0000ff',
    eliminatedSeperator: '#ff0000ff',
    canWinSeperator: '#ffffff',
    scoreboardCurrentOutline: '#ffffff',
    scoreboardOutline: 'transparent',
    scoreboardEliminatedText: '#ff0000ff',
    placeHolderText: '#6f6f6fff',
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
    border: '#000000',
    errorText: '#ff0000ff',
    submit: '#00ce0eff',
    disabledButton: '#000000',
    staticButton: '#000000',
    missButton: '#ff0000ff',
    selectedBox: '#ffffff',
    dropdownBackground: '#ffffff',
    dropdownSelectedText: '#3fec00ff',
    dropdownText: '#000000',
    modalBackdrop: '#00000099',
    switchTrackOn: '#b4fcac',
    switchTrackOff: '#767577',
    switchThumbOn: '#1aff00',
    switchThumbOff: '#f4f3f4',
    switchIosBackground: '#3e3e3e',
    pinOutline: '#ffffff',
    pinWinOutline: '#ffa500',
    eliminatedSeperator: '#ff0000ff',
    canWinSeperator: '#ffffff',
    scoreboardCurrentOutline: '#ffffff',
    scoreboardOutline: 'transparent',
    scoreboardEliminatedText: '#ff0000ff',
    placeHolderText: '#2c2c2cff',
  }
}
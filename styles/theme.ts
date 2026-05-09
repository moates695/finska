type Color = `#${string}` | 'transparent'

export type ThemeType = 'light' | 'dark';

export interface Theme {
  type: ThemeType
  primaryBackground: Color,
  paleComponent: Color,
  brightComponent: Color,
  brightComponentSeperate: Color,
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
  removeMemberButton: Color
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


export const themes: Record<ThemeType, Theme> = {
  light: {
    type: 'light',
    primaryBackground: '#f5f6f8',
    paleComponent: '#e6e9ee',
    brightComponent: '#dde3ec',
    brightComponentSeperate: '#a8b6cc',
    listColorA: '#dfe7f5',
    listColorB: '#e8e3f5',
    participantListItem: '#c8d2e0',
    pinSelected: '#7aa8e6',
    pinNotSelected: '#ffffff',
    text: '#1a2233',
    border: '#9aa3b1',
    errorText: '#c0392b',
    submit: '#3d8b5a',
    disabledButton: '#a9b0bc',
    staticButton: '#3a4254',
    missButton: '#c0392b',
    removeMemberButton: '#d97706',
    selectedBox: '#ffffff',
    dropdownBackground: '#ffffff',
    dropdownSelectedText: '#1a2233',
    dropdownText: '#1a2233',
    modalBackdrop: '#0b1220aa',
    switchTrackOn: '#9bc7a5',
    switchTrackOff: '#c5cbd6',
    switchThumbOn: '#3d8b5a',
    switchThumbOff: '#f5f6f8',
    switchIosBackground: '#c5cbd6',
    pinOutline: '#9aa3b1',
    pinWinOutline: '#3d8b5a',
    eliminatedSeperator: '#c0392b',
    canWinSeperator: '#3d8b5a',
    scoreboardCurrentOutline: '#3a4254',
    scoreboardOutline: 'transparent',
    scoreboardEliminatedText: '#a04032',
    placeHolderText: '#7c8595',
  },
  dark: {
    type: 'dark',
    primaryBackground: '#0f1115',
    paleComponent: '#1a1d24',
    brightComponent: '#262a35',
    brightComponentSeperate: '#333845',
    listColorA: '#23344a',
    listColorB: '#3a2e2a',
    participantListItem: '#323847',
    pinSelected: '#d4a056',
    pinNotSelected: '#1a1d24',
    text: '#e6e8ed',
    border: '#444a58',
    errorText: '#e07a6e',
    submit: '#7fb27e',
    disabledButton: '#5b606f',
    staticButton: '#c2c6cf',
    missButton: '#e07a6e',
    removeMemberButton: '#e0954e',
    selectedBox: '#262a35',
    dropdownBackground: '#262a35',
    dropdownSelectedText: '#e6e8ed',
    dropdownText: '#e6e8ed',
    modalBackdrop: '#000000bb',
    switchTrackOn: '#5b8c5c',
    switchTrackOff: '#4a4f5b',
    switchThumbOn: '#d4a056',
    switchThumbOff: '#c2c6cf',
    switchIosBackground: '#3e3e3e',
    pinOutline: '#5b606f',
    pinWinOutline: '#d4a056',
    eliminatedSeperator: '#e07a6e',
    canWinSeperator: '#d4a056',
    scoreboardCurrentOutline: '#d4a056',
    scoreboardOutline: 'transparent',
    scoreboardEliminatedText: '#e07a6e',
    placeHolderText: '#6a6f7d',
  },
}

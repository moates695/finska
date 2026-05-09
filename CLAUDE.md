# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Finska Tracker is a React Native + Expo mobile scoring app for the Finnish throwing game Finska (Mölkky). Players throw at numbered pins to reach exactly 50 points. The app tracks scores, turn order, eliminations, and supports teams. On-device only, no backend.

## Build & Development Commands

```bash
npm start          # Start Expo dev server (tunnel mode)
npm run android    # Run on Android
npm run ios        # Run on iOS
npm test           # Run all Jest tests
npx jest tests/game_logic.test.ts     # Run a single test file
npx jest --testNamePattern="pattern"  # Run tests matching a pattern
```

EAS is used for native builds (configured in eas.json).

## Architecture

### State Machine (XState v5)

The game is modelled as a single XState machine (`store/machine.ts`). The machine's **context** holds all game data. Components send events and select state to render.

**States:** `idle` → `setup` → `playing` (with sub-states: `awaitingTurn`, `won`, `gameOver`, `finishing`) → `settings` (accessible from setup and playing via `return_to` context).

Machine state determines which screen renders in `App.tsx` — no navigation library or screen atom.

### Pure Game Logic (`store/game_logic.ts`)

All game state transformations are pure functions (e.g. `submitTurn`, `missTurn`, `addPlayer`, `editScore`, `cycleStanding`). These return partial context updates consumed by XState `assign` actions. Fully testable without XState or React.

### Centralised Validation (`store/validation.ts`)

Single module for all validation: `isNameTaken`, `validateNewPlayer`, `validateNewTeam`, `validateMemberName`, `validateRules`, `isGameValid`, `canWinThisTurn`. Components call these directly for real-time feedback; the machine uses them as guards.

### Data Model (`store/types.ts`)

- `GameContext` — participants, scores, rules, turn order, member order
- `GameRules` — target_score, reset_score, elimination_count, etc.
- Rules are a sub-object of context; model uses snake_case for properties
- Events are a union type `GameEvent`

### Persistence (`store/persistence.ts`)

Machine snapshot saved to AsyncStorage on every state transition. Restored on app start to `idle` state so user can choose to continue.

### Theme (`store/theme.ts`)

Jotai atoms separate from the game machine:
- `themeTypeAtom` stores `'light' | 'dark'` string (not the full object)
- `themeAtom` derives the full theme from `styles/theme.ts`
- `useDeviceThemeAtom` for device theme preference

### Game Rules

- 1 pin knocked down → score = pin number (1–12)
- Multiple pins knocked down → score = count of pins
- Exceeding target (default 50) resets to `reset_score` (default 25)
- 3 consecutive misses → elimination (all configurable)
- Successful hit resets miss count
- Winner resets to `elimination_reset_score` on continue (not `reset_score`)
- Participants can be individual players or teams with rotating member throws

## Component Structure

```
components/
  screens/       — IdleScreen, SetupScreen, PlayScreen, SettingsScreen
  game/          — Scoreboard (with edit mode), UpNext (with member swap), PinMap
  shared/        — ParticipantForm, ParticipantList, StatusDot, Dropdown, LoadingScreen
  modals/        — GameEndModal, ConfirmModal
```

Components receive the XState actor as a prop and use `useSelector(actor, ...)` to read state and `actor.send(...)` to dispatch events. Theme via `useAtomValue(themeAtom)`.

## Code Style

- TypeScript path alias: `@/*` maps to project root
- Components use PascalCase filenames; store files use snake_case
- Game model uses snake_case for properties
- Icons from `@expo/vector-icons`
- `react-native-easy-grid` for grid layout in UpNext

## Testing

Jest with `jest-expo` preset. Test files in `tests/`:
- `game_logic.test.ts` — pure function tests (no framework deps)
- `validation.test.ts` — validation function tests
- `machine.test.ts` — XState state transition tests

Mocks for AsyncStorage and expo-crypto in `jest.setup.js`. Use object syntax for nested state matching: `matches({ playing: 'won' })` not `matches('playing.won')`.

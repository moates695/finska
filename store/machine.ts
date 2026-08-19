import { setup, assign } from 'xstate';
import {
  GameContext,
  GameEvent,
  initialContext,
  initialRules,
} from './types';
import {
  addPlayer,
  addTeam,
  removeParticipant,
  removeMember,
  addMember,
  renameParticipant,
  startGame,
  submitTurn,
  missTurn,
  skipTurn,
  editScore,
  editMisses,
  cycleStanding,
  swapTeamMember,
  winContinue,
  loseReset,
  updateRules,
  getWinnerId,
} from './game_logic';
import { isGameValid } from './validation';

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  guards: {
    hasEnoughParticipants: ({ context }) => isGameValid(context),
    hasSavedGame: ({ context }) => context.has_started && context.turn_order.length >= 2,

    // Round-ending invariants. Every turn action and mid-game edit is checked
    // against these rather than each event re-deriving the outcome for itself.
    gameHasWinner: ({ context }) => getWinnerId(context) !== null,
    gameIsUnplayable: ({ context }) => !isGameValid(context),

    returnToSetup: ({ context }) => context.return_to === 'setup',
  },
  actions: {
    resetGame: assign(() => ({
      ...initialContext,
      rules: { ...initialRules },
    })),

    setReturnSetup: assign({ return_to: 'setup' as const }),
    setReturnPlaying: assign({ return_to: 'playing' as const }),

    addPlayer: assign(({ context, event }) => {
      if (event.type !== 'ADD_PLAYER') return {};
      return addPlayer(context, event.name);
    }),

    addTeam: assign(({ context, event }) => {
      if (event.type !== 'ADD_TEAM') return {};
      return addTeam(context, event.name, event.members);
    }),

    addParticipant: assign(({ context, event }) => {
      if (event.type !== 'ADD_PARTICIPANT') return {};
      if (event.isTeam && event.members) {
        return addTeam(context, event.name, event.members);
      }
      return addPlayer(context, event.name);
    }),

    removeParticipantAction: assign(({ context, event }) => {
      if (event.type !== 'REMOVE_PARTICIPANT' && event.type !== 'REMOVE_PARTICIPANT_MIDGAME')
        return {};
      return removeParticipant(context, event.id);
    }),

    removeMember: assign(({ context, event }) => {
      if (event.type !== 'REMOVE_MEMBER') return {};
      return removeMember(context, event.teamId, event.memberId);
    }),

    addMember: assign(({ context, event }) => {
      if (event.type !== 'ADD_MEMBER') return {};
      return addMember(context, event.teamId, event.name);
    }),

    renameParticipant: assign(({ context, event }) => {
      if (event.type !== 'RENAME') return {};
      return renameParticipant(context, event.id, event.newName, event.teamId);
    }),

    startGame: assign(({ context, event }) => {
      if (event.type !== 'START_GAME') return {};
      return startGame(context, event.shuffle);
    }),

    submitTurn: assign(({ context, event }) => {
      if (event.type !== 'SUBMIT_TURN') return {};
      const result = submitTurn(context, event.pins);
      return result.updates;
    }),

    missTurn: assign(({ context }) => {
      const result = missTurn(context);
      return result.updates;
    }),

    skipTurn: assign(({ context }) => {
      const result = skipTurn(context);
      return result.updates;
    }),

    swapMember: assign(({ context, event }) => {
      if (event.type !== 'SWAP_MEMBER') return {};
      return swapTeamMember(context, event.teamId, event.memberId);
    }),

    editScore: assign(({ context, event }) => {
      if (event.type !== 'EDIT_SCORE') return {};
      const result = editScore(context, event.id, event.score);
      return result.updates;
    }),

    editMisses: assign(({ context, event }) => {
      if (event.type !== 'EDIT_MISSES') return {};
      const result = editMisses(context, event.id, event.misses);
      return result.updates;
    }),

    cycleStanding: assign(({ context, event }) => {
      if (event.type !== 'CYCLE_STANDING') return {};
      const result = cycleStanding(context, event.id);
      return result.updates;
    }),

    winContinue: assign(({ context }) => {
      return winContinue(context);
    }),

    loseReset: assign(({ context }) => {
      return loseReset(context);
    }),

    updateRules: assign(({ context, event }) => {
      if (event.type !== 'UPDATE_RULES') return {};
      return updateRules(context, event.rules);
    }),
  },
}).createMachine({
  id: 'finska',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {
      on: {
        CONTINUE_GAME: {
          target: 'playing',
          guard: 'hasSavedGame',
        },
        NEW_GAME: {
          target: 'setup',
          actions: 'resetGame',
        },
      },
    },

    setup: {
      on: {
        ADD_PLAYER: { actions: 'addPlayer' },
        ADD_TEAM: { actions: 'addTeam' },
        REMOVE_PARTICIPANT: { actions: 'removeParticipantAction' },
        REMOVE_MEMBER: { actions: 'removeMember' },
        ADD_MEMBER: { actions: 'addMember' },
        RENAME: { actions: 'renameParticipant' },
        OPEN_SETTINGS: {
          target: 'settings',
          actions: 'setReturnSetup',
        },
        START_GAME: {
          target: 'playing',
          guard: 'hasEnoughParticipants',
          actions: 'startGame',
        },
      },
    },

    playing: {
      initial: 'awaitingTurn',
      states: {
        awaitingTurn: {
          // The round ends here and nowhere else. Whatever moved the context —
          // a throw, a mid-game edit, a rules change on the way back from
          // settings, a restored snapshot — is judged by the same two
          // invariants, so no event can quietly leave the game unplayable.
          always: [
            { guard: 'gameHasWinner', target: 'won' },
            { guard: 'gameIsUnplayable', target: 'gameOver' },
          ],
          on: {
            SUBMIT_TURN: { actions: 'submitTurn' },
            MISS_TURN: { actions: 'missTurn' },
            SKIP_TURN: { actions: 'skipTurn' },
            SWAP_MEMBER: { actions: 'swapMember' },
            EDIT_SCORE: { actions: 'editScore' },
            EDIT_MISSES: { actions: 'editMisses' },
            CYCLE_STANDING: { actions: 'cycleStanding' },
            ADD_PARTICIPANT: { actions: 'addParticipant' },
            REMOVE_PARTICIPANT_MIDGAME: { actions: 'removeParticipantAction' },
            REMOVE_MEMBER: { actions: 'removeMember' },
            ADD_MEMBER: { actions: 'addMember' },
            RENAME: { actions: 'renameParticipant' },
            OPEN_SETTINGS: {
              target: '#finska.settings',
              actions: 'setReturnPlaying',
            },
            FINISH_GAME: 'finishing',
          },
        },

        won: {
          on: {
            CONTINUE: {
              target: 'awaitingTurn',
              actions: 'winContinue',
            },
            FINISH: {
              target: '#finska.idle',
              actions: 'resetGame',
            },
          },
        },

        gameOver: {
          on: {
            RESET: {
              target: 'awaitingTurn',
              actions: 'loseReset',
            },
            FINISH: {
              target: '#finska.idle',
              actions: 'resetGame',
            },
          },
        },

        finishing: {
          on: {
            CONFIRM: {
              target: '#finska.idle',
              actions: 'resetGame',
            },
            CANCEL: 'awaitingTurn',
          },
        },
      },
    },

    settings: {
      on: {
        UPDATE_RULES: { actions: 'updateRules' },
        // Returning to play re-enters awaitingTurn, whose invariants re-route to
        // won/gameOver if the new rules produced either.
        GO_BACK: [
          { guard: 'returnToSetup', target: 'setup' },
          { target: 'playing.awaitingTurn' },
        ],
      },
    },
  },
});

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
  countPins,
  getCurrentPlayerScore,
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

    isWinningScore: ({ context, event }) => {
      if (event.type !== 'SUBMIT_TURN') return false;
      const score = countPins(context.rules, event.pins) + getCurrentPlayerScore(context);
      return score === context.rules.target_score;
    },

    gameBecomesInvalid: ({ context }) => {
      const result = missTurn(context);
      return !isGameValid({ ...context, ...result.updates });
    },

    skipCausesGameOver: ({ context }) => {
      if (!context.rules.skip_is_miss) return false;
      const result = missTurn(context);
      return !isGameValid({ ...context, ...result.updates });
    },

    editScoreWins: ({ context, event }) => {
      if (event.type !== 'EDIT_SCORE') return false;
      if (event.score !== context.rules.target_score) return false;
      return context.state[event.id]?.standing === 'playing';
    },

    standingChangeInvalidates: ({ context, event }) => {
      if (event.type !== 'CYCLE_STANDING') return false;
      const result = cycleStanding(context, event.id);
      return result.event === 'gameOver';
    },

    editMissesInvalidates: ({ context, event }) => {
      if (event.type !== 'EDIT_MISSES') return false;
      const result = editMisses(context, event.id, event.misses);
      return result.event === 'gameOver';
    },

    removalInvalidates: ({ context, event }) => {
      if (event.type !== 'REMOVE_PARTICIPANT' && event.type !== 'REMOVE_PARTICIPANT_MIDGAME')
        return false;
      const updates = removeParticipant(context, event.id);
      const after = { ...context, ...updates };
      return after.has_started && !isGameValid(after);
    },

    removeMemberInvalidates: ({ context, event }) => {
      if (event.type !== 'REMOVE_MEMBER') return false;
      const updates = removeMember(context, event.teamId, event.memberId);
      const after = { ...context, ...updates };
      return after.has_started && !isGameValid(after);
    },

    returnToSetup: ({ context }) => context.return_to === 'setup',
    returnToPlaying: ({ context }) => context.return_to === 'playing',
    returnToPlayingInvalid: ({ context }) =>
      context.return_to === 'playing' && context.has_started && !isGameValid(context),
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
          on: {
            SUBMIT_TURN: [
              {
                guard: 'isWinningScore',
                target: 'won',
                actions: 'submitTurn',
              },
              { actions: 'submitTurn' },
            ],
            MISS_TURN: [
              {
                guard: 'gameBecomesInvalid',
                target: 'gameOver',
                actions: 'missTurn',
              },
              { actions: 'missTurn' },
            ],
            SKIP_TURN: [
              {
                guard: 'skipCausesGameOver',
                target: 'gameOver',
                actions: 'skipTurn',
              },
              { actions: 'skipTurn' },
            ],
            SWAP_MEMBER: { actions: 'swapMember' },
            EDIT_SCORE: [
              {
                guard: 'editScoreWins',
                target: 'won',
                actions: 'editScore',
              },
              { actions: 'editScore' },
            ],
            EDIT_MISSES: [
              {
                guard: 'editMissesInvalidates',
                target: 'gameOver',
                actions: 'editMisses',
              },
              { actions: 'editMisses' },
            ],
            CYCLE_STANDING: [
              {
                guard: 'standingChangeInvalidates',
                target: 'gameOver',
                actions: 'cycleStanding',
              },
              { actions: 'cycleStanding' },
            ],
            ADD_PARTICIPANT: { actions: 'addParticipant' },
            REMOVE_PARTICIPANT_MIDGAME: [
              {
                guard: 'removalInvalidates',
                target: 'gameOver',
                actions: 'removeParticipantAction',
              },
              { actions: 'removeParticipantAction' },
            ],
            REMOVE_MEMBER: [
              {
                guard: 'removeMemberInvalidates',
                target: 'gameOver',
                actions: 'removeMember',
              },
              { actions: 'removeMember' },
            ],
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
        GO_BACK: [
          { guard: 'returnToSetup', target: 'setup' },
          { guard: 'returnToPlayingInvalid', target: 'playing.gameOver' },
          { guard: 'returnToPlaying', target: 'playing.awaitingTurn' },
        ],
      },
    },
  },
});

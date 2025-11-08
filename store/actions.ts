import { PrimitiveAtom, useSetAtom } from "jotai";
import { completeStateAtom, Game, gameAtom, gameIsValid, GameState, initialGame, initialParticipantState, isPlayerAtom, newMemberNameAtom, newMemberNamesAtom, newNameAtom, ParticipantStanding, ParticipantState, screenAtom, selectedPinsAtom, showCompleteModalAtom, showConfirmSaveSettingsAtom, Team, tempGameAtom } from "./general";
import { v4 as uuidv4 } from 'uuid';
import * as Crypto from 'expo-crypto';
import { atom } from 'jotai';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { Dispatch, SetStateAction } from "react";
import _ from "lodash";

export const isPlayerNameTakenAtom = atom(async (get): Promise<boolean> => {
  const newName = get(newNameAtom);

  let existing = await get(getExistingGameNamesAtom);
  return name_is_taken(existing, newName);
});

export const isTeamNameTakenAtom = atom(async (get): Promise<boolean> => {
    const newName = get(newNameAtom);
    const newMemberName = get(newMemberNameAtom);
    const newMemberNames = get(newMemberNamesAtom);

    let existing = await get(getExistingGameNamesAtom);
    existing = existing.concat([newMemberName]).concat(newMemberNames);
    return name_is_taken(existing, newName);
  }
)

export const isMemberNameTakenAtom = atom(async (get): Promise<boolean> => {
    const newName = get(newNameAtom);
    const newMemberName = get(newMemberNameAtom);
    const newMemberNames = get(newMemberNamesAtom);

    let existing = await get(getExistingGameNamesAtom);
    existing = existing.concat([newName]).concat(newMemberNames);
    return name_is_taken(existing, newMemberName);
  }
)

export const addPlayerAtom = atom(
  null, 
  async (get, set): Promise<string | undefined> => {
    const game = await get(gameAtom);
    let newName = get(newNameAtom);
    newName = newName.trim();
    
    const isPlayerNameTaken = await get(isPlayerNameTakenAtom);
    if (newName === '' || isPlayerNameTaken) return;

    const id = await Crypto.randomUUID();
    set(gameAtom, {
      ...game,
      players: {
        ...game.players,
        [id]: newName
      },
      state: {
        ...game.state,
        [id]: {...initialParticipantState}
      },
      up_next: [...game.up_next, id]
    });
    set(newNameAtom, '');

    return id;
  }
);

export const addMemberNameAtom = atom(
  null, 
  async (get, set) => {
    let newMemberName = get(newMemberNameAtom);
    newMemberName = newMemberName.trim();

    const isMemberNameTaken = await get(isMemberNameTakenAtom);

    if (newMemberName === '' || isMemberNameTaken) return;
    
    const newMemberNames = get(newMemberNamesAtom);
    set(newMemberNamesAtom, [
      ...newMemberNames,
      newMemberName
    ])
    set(newMemberNameAtom, '');
  }
);

export const addTeamAtom = atom(
  null, 
  async (get, set): Promise<string | undefined> => {
    const game = await get(gameAtom);
    
    let newTeamName = get(newNameAtom);
    newTeamName = newTeamName.trim();
    const isTeamNameTaken =  await get(isTeamNameTakenAtom);
    if (newTeamName === '' || isTeamNameTaken) return;

    let newMemberName = get(newMemberNameAtom);
    newMemberName = newMemberName.trim();
    const isMemberNameTaken = await get(isMemberNameTakenAtom);
    if (newMemberName !== '' && isMemberNameTaken) return;
    
    const newMemberNames = get(newMemberNamesAtom);
    if (newMemberName !== '') {
      newMemberNames.push(newMemberName);
    }
    if (newMemberNames.length === 0) return;

    const membersEntries = await Promise.all(
      newMemberNames.map(async (name) => {
        return [await Crypto.randomUUID(), name] as const;
      })
    );

    const members = Object.fromEntries(membersEntries);

    const team: Team = {
      name: newTeamName,
      members
    }

    const up_next_members = Object.keys(members);

    const id = await Crypto.randomUUID()
    set(gameAtom, {
      ...game,
      teams: {
        ...game.teams,
        [id]: team
      },
      state: {
        ...game.state,
        [id]: {...initialParticipantState}
      },
      up_next: [...game.up_next, id],
      up_next_members: {
        ...game.up_next_members,
        [id]: up_next_members
      }
    });
    set(newNameAtom, '');
    set(newMemberNameAtom, '');
    set(newMemberNamesAtom, []);

    return id;
  }
);

export const isSubmitNewParticipantDisabledAtom = atom(
  async (get): Promise<boolean> => {
    const isPlayer = get(isPlayerAtom);
    const newName = get(newNameAtom);

    if (newName.trim() === '') return true;

    if (isPlayer) {
      return await get(isPlayerNameTakenAtom);
    }

    const newMember = get(newMemberNameAtom);
    const isMemberNameTaken = await get(isMemberNameTakenAtom);

    if (newMember.trim() !== '' && isMemberNameTaken) return true; 
    
    const tempNewMembers = [...get(newMemberNamesAtom)];
    if (newMember.trim() !== '') {
      tempNewMembers.push(newMember);
    }
    if (tempNewMembers.length < 2) return true;

    return false;
  }
)

export const isAddMemberDisabledAtom = atom(
  async (get): Promise<boolean> => {
    const newMemberName = get(newMemberNameAtom);
    if (newMemberName.trim() === '') return true;
    const isMemberNameTaken = await get(isMemberNameTakenAtom);
    const newName = get(newNameAtom);
    return isMemberNameTaken || newName.trim().toLowerCase() === newMemberName.trim().toLowerCase();
  }
)

export const getExistingGameNamesAtom = atom(
  async (get): Promise<string[]> => {
    const game = await get(gameAtom);
    let existing = Object.values(game.players);
    for (const team of Object.values(game.teams)) {
      existing.push(team.name);
      existing = existing.concat(Object.values(team.members));
    }
    return existing;
  }
)

export const name_is_taken = (list: string[], name: string): boolean => {
  return list.some((item) => {
    return item.trim().toLowerCase() === name.trim().toLowerCase()
  });
};

export const submitTurnAtom = atom(
  null,
  async (get, set) => {
    const game = await get(gameAtom);
    const id = game.up_next[0];

    const count = await get(countPinsAtom);
    let newScore = count + game.state[id].score;
    if (newScore === game.target_score) {
      set(completeStateAtom, 'win');
      set(showCompleteModalAtom, true);
    } else if (newScore > game.target_score) {
      newScore = game.reset_score;
    }

    const tempState = {...game.state};
    
    tempState[id] = {
      ...tempState[id],
      score: newScore
    };

    const index = await get(cycleThroughAtom(tempState));
    const up_next_members = await get(cycleThroughMembersAtom(id)); 

    set(gameAtom, {
      ...game,
      state: tempState,
      up_next: [...game.up_next.slice(index), ...game.up_next.slice(0, index)],
      up_next_members
    })
    set(selectedPinsAtom, new Set());
  }
)

export const skipTurnAtom = atom(
  null,
  async (get, set) => {
    const game = await get(gameAtom);

    if (game.skip_is_miss) {
      await set(missTurnAtom);
      return;
    } 

    const id = game.up_next[0];

    const tempState = {...game.state};

    const index = await get(cycleThroughAtom(tempState));
    const up_next_members = await get(cycleThroughMembersAtom(id)); 

    set(gameAtom, {
      ...game,
      state: tempState,
      up_next: [...game.up_next.slice(index), ...game.up_next.slice(0, index)],
      up_next_members
    })
    set(selectedPinsAtom, new Set());
  }
)

export const missTurnAtom = atom(
  null,
  async (get, set) => {
    const game = await get(gameAtom);
    const id = game.up_next[0];
        
    const tempState = {...game.state};
    const num_misses = game.state[id].num_misses + 1;
    let standing: ParticipantStanding = 'playing';
    if (num_misses >= game.elimination_count) {
      standing = 'eliminated';
    }

    tempState[id] = {
      ...tempState[id],
      num_misses,
      standing
    }

    const index = await get(cycleThroughAtom(tempState));
    const up_next_members = await get(cycleThroughMembersAtom(id)); 

    if (!gameIsValid(tempState)) {
      set(completeStateAtom, 'default');
      set(showCompleteModalAtom, true);
    }

    set(gameAtom, {
      ...game,
      state: tempState,
      up_next: [...game.up_next.slice(index), ...game.up_next.slice(0, index)],
      up_next_members
    })
    set(selectedPinsAtom, new Set());
  }
)

export const countPinsAtom = atom(
  async (get): Promise<number> => {
    const game = await get(gameAtom);
    const selectedPins = get(selectedPinsAtom);

    if (game.use_pin_value) {
      return [...selectedPins].reduce((a, b) => a + b, 0);
    }

    if (selectedPins.size === 1) {
      return [...selectedPins][0];
    }
    return selectedPins.size;
  }
)

const cycleThroughAtom = (state: GameState) => atom(
  async (get): Promise<number> => {
    const game = await get(gameAtom); 

    let index = 1;
    for (const [i, id] of game.up_next.slice(1).entries()) {
      if (game.state[id].standing === 'playing') {
        index = i + 1;
        break;
      } else if (game.state[id].standing === 'eliminated') {
        state[id].eliminated_turns++;
        if (game.elimination_reset_turns && state[id].eliminated_turns >= game.elimination_reset_turns) {
          state[id].score = game.elimination_reset_score;
          state[id].standing = 'playing';
          state[id].num_misses = 0;
          state[id].eliminated_turns = 0;
        }
      }
    }

    return index;
  }
)

const cycleThroughMembersAtom = (id: string) => atom(
  async (get): Promise<Record<string, string[]>> => {
    const game = await get(gameAtom); 
    
    let up_next_members = {...game.up_next_members};
    if (!(id in game.teams)) return up_next_members;
    up_next_members = {
      ...up_next_members,
      [id]: [...up_next_members[id].slice(1), up_next_members[id][0]]
    }
    return up_next_members;
  }
)

export const winContinueAtom = atom(
  null,
  async (get, set) => {
    const game = await get(gameAtom);
    const tempState = {...game.state};
    for (const [id, state] of Object.entries(tempState)) {
      if (state.score < game.target_score) continue;
      tempState[id].score = game.reset_score;
    }

    await set(gameAtom, {
      ...game,
      state: tempState
    });
  }
)

export const loseResetAtom = atom(
  null,
  async (get, set) => {
    const game = await get(gameAtom);
    const tempState = {...game.state};
    for (const [id, state] of Object.entries(tempState)) {
      tempState[id].score = 0;
      tempState[id].eliminated_turns = 0;
      tempState[id].num_misses = 0;
      if (state.standing === 'paused') continue;
      tempState[id].standing = 'playing';
    }

    await set(gameAtom, {
      ...game,
      state: tempState
    });
  }
)

export const saveGameAtom = atom(
  null,
  async (get, set) => {
    set(screenAtom, 'game setup');
    await set(gameAtom, {...initialGame});
  }
)

export const handleChangeScore = (
  text: string,
  set: Dispatch<SetStateAction<string>>, 
  setError: Dispatch<SetStateAction<string | null>>,
  allowEmpty: boolean = false
) => {
  try {
    if (!allowEmpty && text === '') {
      set('');
      setError('invalid score');
      return;
    };
    if (allowEmpty && (text === '' || text === '-' || text === '0')) {
      set('');
      setError(null);
      return;
    }
    let num = Math.abs(parseInt(text));
    if (!num) throw new Error(`bad num '${num}'`);
    set(num.toString());
    setError(null);
  } catch (error) {
    console.log(error);
    setError('invalid score');
  }
};

export const handleChangeReset = (
  text: string, 
  setter: Dispatch<SetStateAction<string>>, 
  setError: Dispatch<SetStateAction<string | null>>,
  targetScore: string,
  tooBigError: string,
) => {
  try {
    if (text === '' || text === '-') {
      setter(text);
      setError('invalid reset score');
      return;
    };
    let num = parseInt(text);
    if (!num && num !== 0) throw new Error(`bad num '${num}'`);
    setter(num.toString());
    if (num >= parseInt(targetScore)) {
      setError(tooBigError);
    } else {
      setError(null);
    }
  } catch (error) {
    console.log(error);
    setError('invalid reset score');
  }
};

// todo if game state is going to be altered, ask to confirm?
export const handleSaveAtom = atom(
  null,
  async (get, set,
    targetScore: string,
    resetScore: string,
    eliminationMissCount: string,
    eliminationResetScore: string,
    eliminationTurns: string,
    skipIsMiss: boolean,
    usePinValue: boolean,
  ) => {
    const game = await get(gameAtom);
    
    const tempTarget = convertString(targetScore, game.target_score, false);
    const tempReset = convertString(resetScore, game.reset_score, true);
    const tempElimMissCount = convertString(eliminationMissCount, game.elimination_count, false);
    const tempElimResetScore = convertString(eliminationResetScore, game.elimination_reset_score, true);

    if (tempReset >= tempTarget || tempElimResetScore >= tempTarget) return;
    
    let tempElimTurns: number | null = game.elimination_reset_turns;
    if (eliminationTurns === '') {
      tempElimTurns = null;
    } else {
      try {
        const num = parseInt(eliminationTurns);
        if (Number.isNaN(num)) throw Error('could not convert turns to int');
        else if (num <= 0) throw Error('invalid elimination turns');
        tempElimTurns = num;
      } catch (error) {
        console.log(error);
      }
    }

    let tempGame = _.cloneDeep(game); 
    let stateChanged = false;

    for (const [id, currState] of Object.entries(game.state)) {
      const tempState = tempGame.state[id];

      if (currState.score >= tempTarget) {
        tempState.score = tempReset;
        stateChanged = true;
      }

      if (currState.standing === 'paused') {
        continue;
      } else if (currState.standing === 'playing') {
        if (currState.num_misses < tempElimMissCount) continue;
        tempState.standing = 'eliminated';
        tempState.eliminated_turns = 0;
        tempState.num_misses = tempElimMissCount;
        stateChanged = true;
      } else {
        if (currState.num_misses >= tempElimMissCount && (tempElimTurns !== null && currState.eliminated_turns < tempElimTurns)) continue;
        tempState.standing = 'playing';
        tempState.score = tempElimResetScore;
        tempState.eliminated_turns = 0;
        tempState.num_misses = 0;
        stateChanged = true;
      }
    }

    tempGame = {
      ...tempGame,
      target_score: tempTarget,
      reset_score: tempReset,
      elimination_count: tempElimMissCount,
      elimination_reset_score: tempElimResetScore,
      elimination_reset_turns: tempElimTurns,
      skip_is_miss: skipIsMiss,
      use_pin_value: usePinValue
    }

    if (!stateChanged) {
      set(gameAtom, tempGame);
    } else {
      set(tempGameAtom, tempGame);
      set(showConfirmSaveSettingsAtom, true);
    }
    
  }
);

const convertString = (text: string, base: number, allowNegative: boolean): number => {
  const tempNum = parseInt(text);
  if (Number.isNaN(tempNum)) return base;
  else if (!allowNegative && tempNum < 0) return base;
  return tempNum;
};

export const handleCancelAtom = atom(
  null,
  async(get, set) => {
    set(showConfirmSaveSettingsAtom, false);
    set(tempGameAtom, null);
  }
)

export const handleConfirmAtom = atom(
  null,
  async(get, set) => {
    const tempGame = get(tempGameAtom);

    if (tempGame !== null) {
      set(gameAtom, tempGame);
    }

    set(showConfirmSaveSettingsAtom, false);
    set(tempGameAtom, null);
  }
)

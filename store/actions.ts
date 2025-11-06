import { PrimitiveAtom, useSetAtom } from "jotai";
import { completeStateAtom, Game, gameAtom, gameIsValid, GameState, initialParticipantState, isPlayerAtom, newMemberNameAtom, newMemberNamesAtom, newNameAtom, ParticipantStanding, ParticipantState, selectedPinsAtom, showCompleteModalAtom, Team } from "./general";
import { v4 as uuidv4 } from 'uuid';
import * as Crypto from 'expo-crypto';
import { atom } from 'jotai';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

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

    const count = await get(countPins);
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

    const index = await get(cycleThrough(tempState));
    const up_next_members = await get(cycleThroughMembers(id)); 

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

    const index = await get(cycleThrough(tempState));
    const up_next_members = await get(cycleThroughMembers(id)); 

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

    const index = await get(cycleThrough(tempState));
    const up_next_members = await get(cycleThroughMembers(id)); 

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

export const countPins = atom(
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

const cycleThrough = (state: GameState) => atom(
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

const cycleThroughMembers = (id: string) => atom(
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

    set(gameAtom, {
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

    set(gameAtom, {
      ...game,
      state: tempState
    });
  }
)
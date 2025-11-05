import { PrimitiveAtom, useSetAtom } from "jotai";
import { Game, gameAtom, initialParticipantState, isPlayerAtom, newMemberNameAtom, newMemberNamesAtom, newNameAtom, Team } from "./general";
import 'react-native-get-random-values';
import { atom } from 'jotai';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export const isPlayerNameTakenAtom = atom(async (get): Promise<boolean> => {
  const newName = get(newNameAtom);

  let existing = await get(getExistingGameNames)
  return name_is_taken(existing, newName);
});

export const isTeamNameTakenAtom = atom(async (get): Promise<boolean> => {
    const newName = get(newNameAtom);
    const newMemberName = get(newMemberNameAtom);
    const newMemberNames = get(newMemberNamesAtom);

    let existing = await get(getExistingGameNames);
    existing = existing.concat([newMemberName]).concat(newMemberNames);
    return name_is_taken(existing, newName);
  }
)

export const isMemberNameTakenAtom = atom(async (get): Promise<boolean> => {
    const newName = get(newNameAtom);
    const newMemberName = get(newMemberNameAtom);
    const newMemberNames = get(newMemberNamesAtom);

    let existing = await get(getExistingGameNames);
    existing = existing.concat([newName]).concat(newMemberNames);
    return name_is_taken(existing, newMemberName);
  }
)

export const addPlayerAtom = atom(
  null, 
  async (get, set) => {
    const game = await get(gameAtom);
    let newName = get(newNameAtom);
    newName = newName.trim();
    
    const isPlayerNameTaken = await get(isPlayerNameTakenAtom);

    if (newName === '' || isPlayerNameTaken) return;

    const id = crypto.randomUUID();
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
    if (newMemberNames.length < 2) return;

    const members = Object.fromEntries(
      newMemberNames.map((name) => [ crypto.randomUUID(), name])
    )

    const team: Team = {
      name: newTeamName,
      members
    }

    const up_next_members = Object.keys(members);

    const id = crypto.randomUUID();
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
    return id;
  }
);

export const isSubmitNewParticipantDisabled = atom(async (get): Promise<boolean> => {
    const isPlayer = get(isPlayerAtom);
    const newName = get(newNameAtom);

    if (newName.trim() === '') return true;

    if (isPlayer) {
      return await get(isPlayerNameTakenAtom);
    }

    const newMember = get(newMemberNameAtom);
    const isMemberNameTaken = await get(isMemberNameTakenAtom);

    if (newMember.trim() !== '' && isMemberNameTaken) return true; 
    
    const newMembers = get(newMemberNamesAtom);
    if (newMember.trim() !== '') {
      newMembers.push(newMember);
    }
    if (newMembers.length < 2) return true

    return false;
  }
)

export const getExistingGameNames = atom(async (get): Promise<string[]> => {
  const game = await get(gameAtom);
  let existing = Object.values(game.players);
  for (const team of Object.values(game.teams)) {
    existing.push(team.name);
    existing = existing.concat(Object.values(team.members));
  }
  return existing;
})

export const name_is_taken = (list: string[], name: string): boolean => {
  return list.some((item) => {
    return item.trim().toLowerCase() === name.trim().toLowerCase()
  });
};

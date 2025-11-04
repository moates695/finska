import { PrimitiveAtom, useSetAtom } from "jotai";
import { Game, gameAtom, initialParticipantState, isPlayerAtom, newMemberNameAtom, newMemberNamesAtom, newNameAtom } from "./general";
import * as Crypto from 'expo-crypto';
import { atom } from 'jotai';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export const addPlayerAtom = atom(
  null, 
  async (get, set) => {
    const game = await get(gameAtom);
    let newName = await get(newNameAtom);
    newName = newName.trim();
    if (newName === '') return;

    const id = Crypto.randomUUID();
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

    // return id;
  }
);

export const isPlayerNameTakenAtom = atom(
  null, 
  async (get, set): Promise<boolean> => {
    const game = await get(gameAtom);
    const newName = await get(newNameAtom);

    let existing = getExistingGameNames(game);
    return list_contains(existing, newName);
  }
)

export const isTeamNameTaken = atom(
  null, 
  async (get, set): Promise<boolean> => {
    const game = await get(gameAtom);
    const newName = await get(newNameAtom);
    const newMemberNames = await get(newMemberNamesAtom);

    let existing = getExistingGameNames(game).concat(newMemberNames);
    return list_contains(existing, newName);
  }
)

export const isMemberNameTaken = atom(
  null, 
  async (get, set): Promise<boolean> => {
    const game = await get(gameAtom);
    const newName = await get(newNameAtom);
    const newMemberName = await get(newMemberNameAtom);
    const newMemberNames = await get(newMemberNamesAtom);

    let existing = getExistingGameNames(game).concat([newName]).concat(newMemberNames);
    return list_contains(existing, newMemberName);
  }
)

export const isSubmitDisabled = atom(
  null, 
  async (get, set): Promise<boolean> => {
    const isPlayer = get(isPlayerAtom);
    const newName = await get(newNameAtom);

    if (newName.trim() === '') return true;

    if (isPlayer) {
      const isPlayerNameTaken = useSetAtom(isPlayerNameTakenAtom);
      return await isPlayerNameTaken()
    }

    // todo team logic
    const newMember = await get(newMemberNameAtom);
    const newMembers = await get(newMemberNamesAtom);

    // if (newMember.trim() !== '' && ) {
    //   newMembers.push(newMember);
    // }

    return false;
  }
)


// export const addTeam = atom(
//   null,
//   async (get, set, teamName: string) => {
//     const game = await get(gameAtom);
//     const newName = await get(newNameAtom);
//     const newMemberName = await get(newMemberNameAtom);
//     const newMemberNames = await get(newMemberNamesAtom);
//   }
// )

const getExistingGameNames = (game: Game): string[] => {
  let existing = Object.values(game);
  for (const team of Object.values(game.teams)) {
    existing.push(team.name);
    existing.concat(team.members);
  }
  return existing;
};

const list_contains = (list: string[], name: string): boolean => {
  return list.some((item) => {
    item.trim().toLowerCase() === name.trim().toLowerCase()
  });
};

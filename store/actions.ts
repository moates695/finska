import { PrimitiveAtom } from "jotai";
import { gameAtom, initialParticipantState } from "./general";
import * as Crypto from 'expo-crypto';
// type atomSet =  <T>(atom: PrimitiveAtom<T>, update: T | ((prev: T) => T)) => void;
import { atom } from 'jotai';

// export const addPlayer = (gameAtom: any, setGameAtom: any, player_name: string): string => {
//   const id = Crypto.randomUUID();
//   setGameAtom((prev: any) => ({
//     ...prev,
//     players: {
//       ...prev.players,
//       [id]: player_name
//     },
//     state: {
//       ...prev.state,
//       [id]: {...initialParticipantState}
//     },
//     up_next: [...prev.up_next, id]
//   }))
//   return id;
// }; 

export const addPlayer = atom(
  null, 
  async (get, set, name: string) => {
    const game = await get(gameAtom);

    const id = Crypto.randomUUID();
    set(gameAtom, {
      ...game,
      players: {
        ...game.players,
        [id]: name
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

export const addTeam = (gameAtom: any, setGameAtom: any, teamName: string, members: string[]): string => {
  const teamId = Crypto.randomUUID();

  return teamId;
};

export const isNameValid = (gameAtom: any, name: string): boolean => {
  return false;
};

// export const isPlayerNameTaken = (gameAtom: any, newNameAtom: any, name: string): boolean => {

//   return false;
// };

// export const isPlayerNameTaken = atom((get) => {
//   const game = get(gameAtom);
  
// }); 
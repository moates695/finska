import { PrimitiveAtom } from "jotai";
import { initialParticipantState } from "./general";
import * as Crypto from 'expo-crypto';
// type atomSet =  <T>(atom: PrimitiveAtom<T>, update: T | ((prev: T) => T)) => void;

export const addPlayer = (gameAtom: any, setGameAtom: any, player_name: string): string => {
  const id = Crypto.randomUUID();
  // setGameAtom({
  //   ...gameAtom,
  //   players: {
  //     ...gameAtom.players,
  //     [id]: player_name
  //   },
  //   state: {
  //     ...gameAtom.state,
  //     [id]: {...initialParticipantState}
  //   },
  //   up_next: [...gameAtom.up_next, id]
  // });
  setGameAtom((prev: any) => ({
    ...prev,
    players: {
      ...prev.players,
      [id]: player_name
    },
    state: {
      ...prev.state,
      [id]: {...initialParticipantState}
    },
    up_next: [...prev.up_next, id]
  }))
  return id;
}; 
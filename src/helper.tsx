import { PlayerState } from "./gameSlice";

export function checkInvalidName(name: string, players: PlayerState[]) {
  let found = false;
  players.forEach((player) => {
    if (player.name === name) {
      found = true;
    }
  });
  if (found || name === '') {
    return true;
  } else {
    return false;
  }
}
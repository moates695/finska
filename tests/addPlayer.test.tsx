import { getDefaultStore } from 'jotai'
// import { addPlayer } from '../store/actions'
import { gameAtom, initialGame } from '@/store/general'
import { addPlayer } from '@/store/actions';

describe('addPlayer', () => {
  it('updates for valid player', async () => {
    const store = getDefaultStore();

    store.set(gameAtom, {...initialGame});

    const game = await store.get(gameAtom);
    const setGame = (update: any) => store.set(gameAtom, update);
    
    const newName = "new_player";
    const newId = await store.set(addPlayer, newName);

    const updatedGame = await store.get(gameAtom);
    const newLength = Object.keys(updatedGame.players).length;

    expect(newLength).toBe(1);

    expect(updatedGame.players).toEqual({
      [newId]: newName,
    });
  })
});
import { getDefaultStore, useSetAtom, WritableAtom } from 'jotai'
// import { addPlayer } from '../store/actions'
import { Game, gameAtom, initialGame, isPlayerAtom, newMemberNameAtom, newMemberNamesAtom, newNameAtom } from '@/store/general'
import { addMemberNameAtom, addPlayerAtom, addTeamAtom, getExistingGameNamesAtom, isAddMemberDisabledAtom, isMemberNameTakenAtom, isPlayerNameTakenAtom, isSubmitNewParticipantDisabledAtom, isTeamNameTakenAtom, name_is_taken as nameIsTaken } from '@/store/actions';

describe('app participants', () => {
  it('get existing names', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {...initialGame});

    expect(await store.get(getExistingGameNamesAtom)).toEqual([]);

    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id0': 'player1',
        'id1': 'player2',
      },
      teams: {
        'id2': {
          name: 'team1',
          members: {
            'id3': 'member1',
            'id4': 'member2'
          }
        },
        'id5': {
          name: 'team2',
          members: {}
        }
      }
    })
    expect(await store.get(getExistingGameNamesAtom)).toEqual([
      'player1',
      'player2',
      'team1',
      'member1',
      'member2',
      'team2'
    ]);

  })
  
  it('name is taken', async () => {
    expect(nameIsTaken([], 'player1')).toBe(false);
    expect(nameIsTaken([' player1 '], 'player1')).toBe(true);
    expect(nameIsTaken(['Player1'], ' player1 ')).toBe(true);
    expect(nameIsTaken([' player1 '], ' Player1 ')).toBe(true);
    expect(nameIsTaken(['player2','player0'], 'player1')).toBe(false);
  })

  it('player name is taken', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {...initialGame});

    expect(await store.get(isPlayerNameTakenAtom)).toBe(false);

    store.set(newNameAtom, '    ');
    expect(await store.get(isPlayerNameTakenAtom)).toBe(false);

    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id0': 'player1'
      },
      teams: {
        'id1': {
          name: 'team1',
          members: {
            'id2': 'member1'
          }
        }
      }
    });

    for (const name of ['Player1','Team1','Member1']) {
      store.set(newMemberNameAtom, name);
      expect(await store.get(isMemberNameTakenAtom)).toBe(true);
    }

    store.set(newNameAtom, 'player2');
    expect(await store.get(isPlayerNameTakenAtom)).toBe(false);
  })

  it('team member name is taken', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {...initialGame});

    expect(await store.get(isMemberNameTakenAtom)).toBe(false);

    store.set(newMemberNameAtom, '    ');
    expect(await store.get(isMemberNameTakenAtom)).toBe(false);

    store.set(newMemberNamesAtom, ['member1']);
    
    store.set(newMemberNameAtom, 'member1');
    expect(await store.get(isMemberNameTakenAtom)).toBe(true);

    store.set(newMemberNameAtom, 'Member1');
    expect(await store.get(isMemberNameTakenAtom)).toBe(true);

    store.set(newMemberNameAtom, 'member2');
    expect(await store.get(isMemberNameTakenAtom)).toBe(false);

    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id0': 'player1'
      },
      teams: {
        'id1': {
          name: 'team1',
          members: {
            'id2': 'member1',
            'id3': 'member2'
          }
        }
      }
    });
    store.set(newNameAtom, 'team2');
    store.set(newMemberNamesAtom, ['member3']);

    for (const name of ['Player1','Team1','Member1','Member2','Team2','Member3']) {
      store.set(newMemberNameAtom, name);
      expect(await store.get(isMemberNameTakenAtom)).toBe(true);
    }

    store.set(newMemberNameAtom, 'member4');
    expect(await store.get(isMemberNameTakenAtom)).toBe(false);
  })

  it('team name is taken', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {...initialGame});

    expect(await store.get(isTeamNameTakenAtom)).toBe(false);

    store.set(newNameAtom, '    ');
    expect(await store.get(isTeamNameTakenAtom)).toBe(false);

    store.set(newMemberNamesAtom, ['member1']);

    store.set(newNameAtom, 'member1');
    expect(await store.get(isTeamNameTakenAtom)).toBe(true);

    store.set(newNameAtom, 'Member1');
    expect(await store.get(isTeamNameTakenAtom)).toBe(true);

    store.set(newNameAtom, 'team1');
    expect(await store.get(isTeamNameTakenAtom)).toBe(false);

    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id0': 'player1'
      },
      teams: {
        'id1': {
          name: 'team1',
          members: {
            'id2': 'member1',
            'id3': 'member2'
          }
        }
      }
    });
    store.set(newMemberNamesAtom, ['member3']);

    for (const name of ['Player1','Team1','Member1','Member2','Member3']) {
      store.set(newNameAtom, name);
      expect(await store.get(isTeamNameTakenAtom)).toBe(true);
    }

    store.set(newNameAtom, 'team2');
    expect(await store.get(isTeamNameTakenAtom)).toBe(false);
  })

  it('add players', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {...initialGame});
    store.set(newNameAtom, '');
    store.set(newMemberNameAtom, '');
    store.set(newMemberNamesAtom, []);

    store.set(newNameAtom, '   ');
    await store.set(addPlayerAtom);
    let game = await store.get(gameAtom);
    expect(Object.values(game.players)).toEqual([]);

    store.set(newNameAtom, 'player1');
    await store.set(addPlayerAtom);
    game = await store.get(gameAtom);
    expect(Object.values(game.players)).toEqual(['player1']);

    store.set(newNameAtom, 'Player1');
    await store.set(addPlayerAtom);
    game = await store.get(gameAtom);
    expect(Object.values(game.players)).toEqual(['player1']);
    expect(store.get(newNameAtom)).toBe('Player1');

    store.set(newNameAtom, ' Player2 ');
    await store.set(addPlayerAtom);
    game = await store.get(gameAtom);
    expect(Object.values(game.players)).toEqual(['player1','Player2']);
    expect(store.get(newNameAtom)).toBe('');

    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id0': 'player1',
        'id1': 'Player2'
      },
      teams: {
        'id2': {
          name: 'team1',
          members: {
            'id3': 'member1',
            'id4': 'member2'
          }
        }
      }
    })

    for (const name of ['Player1','player2','Team1','MEmber1','member2']) {
      store.set(newNameAtom, name);
      await store.set(addPlayerAtom);
      game = await store.get(gameAtom);
      expect(game.players).toEqual({
        'id0': 'player1',
        'id1': 'Player2'
      });
    }

    store.set(newMemberNameAtom, 'player3');
    store.set(newNameAtom, ' player3 ');
    await store.set(addPlayerAtom);
    game = await store.get(gameAtom);
    expect(Object.values(game.players)).toEqual(['player1','Player2','player3']);

    store.set(newMemberNamesAtom, ['player4']);
    store.set(newNameAtom, ' player4 ');
    await store.set(addPlayerAtom);
    game = await store.get(gameAtom);
    expect(Object.values(game.players)).toEqual(['player1','Player2','player3','player4']);

  })

  it('add team members', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {...initialGame});
    store.set(newNameAtom, '');
    store.set(newMemberNameAtom, '');
    store.set(newMemberNamesAtom, []);

    store.set(newMemberNameAtom, '    ');
    await store.set(addMemberNameAtom);
    expect(store.get(newMemberNamesAtom)).toEqual([]);

    store.set(newMemberNameAtom, ' Member1 ');
    await store.set(addMemberNameAtom);
    expect(store.get(newMemberNamesAtom)).toEqual(['Member1']);

    store.set(newMemberNameAtom, ' member1 ');
    await store.set(addMemberNameAtom);
    expect(store.get(newMemberNamesAtom)).toEqual(['Member1']);
    
    store.set(newNameAtom, ' Member 2 ');
    store.set(newMemberNameAtom, ' member 2 ');
    await store.set(addMemberNameAtom);
    expect(store.get(newMemberNamesAtom)).toEqual(['Member1']);

    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id0': 'player1',
        'id1': 'Player2'
      },
      teams: {
        'id2': {
          name: 'team1',
          members: {
            'id3': 'member5',
            'id4': 'member6'
          }
        }
      }
    });

    for (const name of [' Player1 ','player2 ','Team1','member5','member6','member1']) {
      store.set(newMemberNameAtom, name);
      await store.set(addMemberNameAtom);
      expect(store.get(newMemberNamesAtom)).toEqual(['Member1']);
    }
    
    store.set(newMemberNameAtom, ' member 4 ');
    await store.set(addMemberNameAtom);
    expect(store.get(newMemberNamesAtom)).toEqual(['Member1','member 4']);

  })

  it('add teams', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {...initialGame});
    store.set(newNameAtom, '');
    store.set(newMemberNameAtom, '');
    store.set(newMemberNamesAtom, []);

    store.set(newNameAtom, ' Member1 ');
    store.set(newMemberNameAtom, 'member0');
    store.set(newMemberNamesAtom, ['member1']);
    await store.set(addTeamAtom);
    let game = await store.get(gameAtom);
    game = await store.get(gameAtom);
    expect(game.teams).toEqual({});
    expect(store.get(newNameAtom)).toBe(' Member1 ');
    expect(store.get(newMemberNameAtom)).toBe('member0');
    expect(store.get(newMemberNamesAtom)).toEqual(['member1']);

    store.set(newNameAtom, ' team1 ');
    store.set(newMemberNameAtom, 'member0');
    store.set(newMemberNamesAtom, ['member1','member2']);
    const id1 = await store.set(addTeamAtom);
    expect(id1).toBeDefined();
    game = await store.get(gameAtom);
    const team1 = game.teams[id1!];
    expect(team1.name).toEqual('team1');
    expect(Object.values(team1.members)).toEqual(['member1','member2','member0']);
    expect(store.get(newNameAtom)).toBe('');
    expect(store.get(newMemberNameAtom)).toBe('');
    expect(store.get(newMemberNamesAtom)).toEqual([]);

    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id0': 'player1',
        'id1': 'Player2'
      },
      teams: {
        ...game.teams
      }
    });

    for (const teamName of [' Player1 ','Team1']) {
      store.set(newNameAtom, teamName);
      store.set(newMemberNameAtom, '');
      store.set(newMemberNamesAtom, ['member5','member6']);

      const tempId = await store.set(addTeamAtom);
      expect(tempId).toBeUndefined();
      game = await store.get(gameAtom);
      expect(Object.values(game.teams).length).toBe(1);
    }

    for (const memberName of [' Player1 ','Team1']) {
      store.set(newNameAtom, 'team2');
      store.set(newMemberNameAtom, memberName);
      store.set(newMemberNamesAtom, ['member5','member6']);

      const tempId = await store.set(addTeamAtom);
      expect(tempId).toBeUndefined();
      game = await store.get(gameAtom);
      expect(Object.values(game.teams).length).toBe(1);
    }

    store.set(newNameAtom, 'team2');
    store.set(newMemberNameAtom, 'member7');
    store.set(newMemberNamesAtom, ['member5','member6']);

    const id2 = await store.set(addTeamAtom);
    expect(id2).toBeDefined();
    game = await store.get(gameAtom);
    const team2 = game.teams[id2!];
    expect(team2.name).toEqual('team2');
    expect(Object.values(team2.members)).toEqual(['member5','member6','member7']);

  })

  it('is add member disabled', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {...initialGame});
    store.set(newNameAtom, '');
    store.set(newMemberNameAtom, '');
    store.set(newMemberNamesAtom, []);

    expect(await store.get(isAddMemberDisabledAtom)).toBe(true);

    store.set(newNameAtom, 'team1');
    expect(await store.get(isAddMemberDisabledAtom)).toBe(true);

    store.set(newMemberNameAtom, 'member1');
    expect(await store.get(isAddMemberDisabledAtom)).toBe(false);

    store.set(newMemberNameAtom, 'team1');
    expect(await store.get(isAddMemberDisabledAtom)).toBe(true);

    store.set(newMemberNameAtom, 'member1');
    await store.set(addMemberNameAtom);

    store.set(newMemberNameAtom, 'member1');
    expect(await store.get(isAddMemberDisabledAtom)).toBe(true);

    store.set(newMemberNameAtom, 'member2');
    expect(await store.get(isAddMemberDisabledAtom)).toBe(false);
  })

  it('is add participant disabled', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {...initialGame});
    store.set(isPlayerAtom, true);
    store.set(newNameAtom, '');
    store.set(newMemberNameAtom, '');
    store.set(newMemberNamesAtom, []);

    expect(await store.get(isSubmitNewParticipantDisabledAtom)).toBe(true);

    store.set(newNameAtom, 'player1');
    expect(await store.get(isSubmitNewParticipantDisabledAtom)).toBe(false);

    await store.set(addPlayerAtom);
    store.set(newNameAtom, 'player1');
    expect(await store.get(isSubmitNewParticipantDisabledAtom)).toBe(true);

    store.set(newNameAtom, 'player2');
    expect(await store.get(isSubmitNewParticipantDisabledAtom)).toBe(false);

    store.set(isPlayerAtom, false);
    store.set(newNameAtom, 'team1');
    expect(await store.get(isSubmitNewParticipantDisabledAtom)).toBe(true);

    store.set(newNameAtom, 'team1');
    store.set(newMemberNameAtom, 'member1');
    expect(await store.get(isSubmitNewParticipantDisabledAtom)).toBe(true);

    store.set(newMemberNamesAtom, ['member2'])
    expect(await store.get(isSubmitNewParticipantDisabledAtom)).toBe(false);

    store.set(newMemberNameAtom, 'team1');
    expect(await store.get(isSubmitNewParticipantDisabledAtom)).toBe(true);

    store.set(newNameAtom, 'member1');
    store.set(newMemberNameAtom, 'member1');
    expect(await store.get(isSubmitNewParticipantDisabledAtom)).toBe(true);

    store.set(isPlayerAtom, true);
    store.set(newNameAtom, 'member1');
    expect(await store.get(isSubmitNewParticipantDisabledAtom)).toBe(false);

  })
});

import { getDefaultStore, useSetAtom, WritableAtom } from 'jotai'
// import { addPlayer } from '../store/actions'
import { Game, gameAtom, initialGame, isPlayerAtom, newMemberNameAtom, newMemberNamesAtom, newNameAtom } from '@/store/general'
import { addMemberNameAtom, addPlayerAtom, addTeamAtom, getExistingGameNamesAtom, isAddMemberDisabledAtom, isMemberNameTakenAtom, isPlayerNameTakenAtom, isSubmitNewParticipantDisabledAtom, isTeamNameTakenAtom, name_is_taken as nameIsTaken } from '@/store/actions';

describe('settings', () => {
  it('settings change', async () => {

  })
})
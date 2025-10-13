import { gameAtom, isNameInputFocusedAtom, newMemberNameAtom, newMemberNameErrorAtom, newNameAtom, newNameErrorAtom, Team } from "@/store/general";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { unwrap } from "jotai/utils";

export default function ParticipantList() {
  const [game, setGame] = useAtom(gameAtom);
  const [newName, ] = useAtom(newNameAtom);
  const [newMemberName, ] = useAtom(newMemberNameAtom);
  const [, setNewNameError] = useAtom(newNameErrorAtom);
  const [, setNewMemberNameError] = useAtom(newMemberNameErrorAtom);
  const [isNameInputFocused, ] = useAtom(isNameInputFocusedAtom);
  const [showEdit, setShowEdit] = useState<boolean>(false);

  const removePlayer = (id: string) => {
    const { [id]: removedName, ...rest } = game.players;

    const stateIndex = game.state.length - 1;
    const currentState = {...game.state[stateIndex]};
    currentState.up_next = currentState.up_next.filter(_id => _id !== id);

    setGame({
      ...game,
      players: rest,
      state: game.state.map((state, index) => {
        return index !== stateIndex ? state : currentState;
      })
    })
    propogateRemovedNames([removedName]);
  };

  const removeTeam = (id: string) => {
    const { [id]: removedTeam, ...restTeams} = game.teams;
    
    const stateIndex = game.state.length - 1;
    const currentState = {...game.state[stateIndex]};
    currentState.up_next = currentState.up_next.filter(_id => _id !== id);
    
    const { [id]: removedUpNextMembers, ...restUpNextMembers } = currentState.up_next_members;
    currentState.up_next_members = restUpNextMembers;

    setGame({
      ...game,
      teams: restTeams,
      state: game.state.map((state, index) => {
        return index !== stateIndex ? state : currentState
      })
    })

    const removedNames = [removedTeam.name].concat(Object.values(removedTeam.members));
    propogateRemovedNames(removedNames);
  };

  const removeMember = (teamId: string, memberId: string) => {
    const { [memberId]: removedMember, ...restMembers } = game.teams[teamId].members;
    if (Object.keys(restMembers).length === 0) {
      removeTeam(teamId);
      return;
    }

    const stateIndex = game.state.length - 1;
    const currentState = {...game.state[stateIndex]};
    currentState.up_next_members = {
      ...currentState.up_next_members,
      [teamId]: currentState.up_next_members[teamId].filter(tempId => tempId !== memberId)
    }

    setGame({
      ...game,
      teams: {
        ...game.teams,
        [teamId]: {
          ...game.teams[teamId],
          members: restMembers
        }
      },
      state: game.state.map((state, index) => {
        return index !== stateIndex ? state : currentState
      })
    });
    propogateRemovedNames([removedMember]);
  };

  // todo see if can move this to addParticpant comp ???
  const propogateRemovedNames = (names: string[]) => {
    for (const name of names) {
      const lowerName = name.toLowerCase();
      if (lowerName === newName.toLowerCase()) {
        setNewNameError(null);
      }
      if (lowerName === newMemberName.toLowerCase()) {
        setNewMemberNameError(null);
      }
    }
  };

  return (
      <View
        style={[
          {
            backgroundColor: 'orange',
            width: 350,
            borderRadius: 20,
            padding: 20,
            gap: 10,
            marginBottom: 100,
            maxHeight: 500,
          },
          isNameInputFocused && {
            position: isNameInputFocused ? 'absolute' : 'relative',
            top: 60,
            maxHeight: 350,
          }
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            // alignContent: 'flex-start',
          }}
        >
          <Text>Current players</Text>
          <TouchableOpacity
            onPress={() => setShowEdit(!showEdit)}
          >
            <MaterialIcons 
              name="edit-note"
              size={24} 
              color="black"
              style={{marginTop: -4}}
            />
          </TouchableOpacity>
        </View>
        <ScrollView 
          style={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}
          horizontal={false}
        >
        {game.state.at(-1)!.up_next.map((id, i) => {
          if (id in game.players) {
            return (
              <View 
                key={i}
                style={styles.row}
              >
                <Text>{game.players[id]}</Text>
                <Feather 
                  name="delete" 
                  size={24} 
                  color="black"
                  onPress={() => removePlayer(id)} 
                  style={{
                    opacity: showEdit ? 1 : 0
                  }}
                  disabled={!showEdit}
                />
              </View>
            )
          }

          const team: Team = game.teams[id];
          const up_next_ids = game.state.at(-1)!.up_next_members[id];
          return (
            <View key={i}>
              <View
                style={styles.row}
              >
                <Text>{team.name}</Text>
                <Feather 
                    name="delete" 
                    size={24} 
                    color="black"
                    onPress={() => removeTeam(id)} 
                    style={{
                      opacity: showEdit ? 1 : 0
                    }}
                    disabled={!showEdit}
                  />
              </View>
              <View>
                {up_next_ids.map((memberId, j) => {
                  return (
                    <View
                      key={j}
                      style={styles.row}
                    >
                      <Text 
                        key={j}
                        style={{
                          paddingLeft: 20
                        }}
                      >
                        {team.members[memberId]}
                      </Text>
                      <Ionicons 
                        name="remove-circle-outline"  
                        size={24} 
                        color="white"
                        onPress={() => removeMember(id, memberId)} 
                        style={{
                          color: 'black',
                          marginRight: 30,
                          opacity: showEdit ? 1 : 0
                        }}
                        disabled={!showEdit}
                      />
                    </View>
                  )
                })}
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
    
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
})
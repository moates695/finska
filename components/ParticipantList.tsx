import { gameAtom, isNameInputFocusedAtom, newMemberNameAtom, newMemberNameErrorAtom, newNameAtom, newNameErrorAtom, Team } from "@/store/general";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function ParticipantList() {
  const [game, setGame] = useAtom(gameAtom);
  const [newName, setNewName] = useAtom(newNameAtom);
  const [newMemberName, setNewMemberName] = useAtom(newMemberNameAtom);
  const [newNameError, setNewNameError] = useAtom(newNameErrorAtom);
  const [newMemberNameError, setNewMemberNameError] = useAtom(newMemberNameErrorAtom);
  const [isNameInputFocused, setIsNameInputFocused] = useAtom(isNameInputFocusedAtom);
  const [showEdit, setShowEdit] = useState<boolean>(false);

  const removePlayer = (id: string) => {
    const { [id]: removedName, ...rest } = game.players;
    setGame({
      ...game,
      players: rest,
      up_next: game.up_next.filter(tempId => tempId !== id)
    })
    propogateRemovedNames([removedName]);
  };

  const removeTeam = (id: string) => {
    const { [id]: removedTeam, ...restTeams} = game.teams;
    const { [id]: _, ...restUpNextMembers} = game.up_next_members;
    setGame({
      ...game,
      teams: restTeams,
      up_next: game.up_next.filter(tempId => tempId !== id),
      up_next_members: restUpNextMembers
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
    setGame({
      ...game,
      teams: {
        ...game.teams,
        [teamId]: {
          ...game.teams[teamId],
          members: restMembers
        }
      },
      up_next_members: {
        ...game.up_next_members,
        [teamId]: game.up_next_members[teamId].filter(tempId => tempId !== memberId)
      }
    });
    propogateRemovedNames([removedMember]);
  };

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
        {game.up_next.map((id, i) => {
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
          const up_next_ids = game.up_next_members[id];
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
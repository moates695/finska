import { gameAtom, getDistinctUpNext, isNameInputFocusedAtom, isPlayerAtom, newMemberNameAtom, newMemberNameErrorAtom, newNameAtom, newNameErrorAtom, Team } from "@/store/general";
import { useAtom } from "jotai";
import React, { useMemo, useState } from "react";
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
  const [isPlayer,] = useAtom(isPlayerAtom); //? remember last choice? (global state, no load in)
  
  const [showEdit, setShowEdit] = useState<boolean>(false);

  // const allUpNext = useMemo(() => {
  //   return Object.values(getDistinctUpNext(game)).flat();
  // }, [game.up_next]);

  const removePlayer = (id: string) => {
    const { [id]: _, ...restPlayers } = game.players;
    const { [id]: __, ...restState } = game.state;

    setGame({
      ...game,
      players: restPlayers,
      state: restState,
      up_next: game.up_next.filter(tempId => tempId !== id)
    });
  };

  const removeTeam = (id: string) => {
    const { [id]: _, ...restTeams} = game.teams;
    const { [id]: __, ...restState } = game.state;   
    const { [id]: ___, ...restUpNextMembers } = game.up_next_members;

    setGame({
      ...game,
      teams: restTeams,
      state: restState,
      up_next: game.up_next.filter(tempId => tempId !== id),
      up_next_members: restUpNextMembers,
    });
  };

  const removeMember = (teamId: string, memberId: string) => {
    const { [memberId]: _, ...restMembers } = game.teams[teamId].members;
    if (Object.keys(restMembers).length === 0) {
      removeTeam(teamId);
      return;
    }

    setGame({
      ...game,
      up_next_members: {
        ...game.up_next_members,
        [teamId]: game.up_next_members[teamId].filter(id => id !== memberId)
      }
    });
  };

  return (
    <View
      style={{
        backgroundColor: 'orange',
        width: 350,
        borderRadius: 20,
        padding: 20,
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text>Player list</Text>
        <TouchableOpacity
          onPress={() => setShowEdit(!showEdit)}
          disabled={game.up_next.length === 0}
        >
          <MaterialIcons
            name="edit-note"
            size={24}
            color="black"
            style={{marginTop: -6, padding: 2}}      
          />
        </TouchableOpacity>
      </View>
      {game.up_next.length === 0 &&
        <Text
          style={{
            textAlign: 'center'
          }}
        >
          add players/teams to get going!
        </Text>
      }
      <ScrollView 
        style={{flexGrow: 1}}
        showsVerticalScrollIndicator={true}
        horizontal={false}
      >
      {game.up_next.map((id, i) => {
        if (id in game.players) {
          return (
            <View 
              key={i}
              style={[
                styles.row,
                {
                  backgroundColor: i % 2 ? 'transparent' : '#ffca7aff',
                  borderRadius: 10,
                  padding: 2,
                  paddingLeft: 10,
                  paddingRight: 10,
                  marginBottom: 5,
                }
              ]}
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
        return (
          <View 
            key={i}
            style={[
              {
                backgroundColor: i % 2 ? 'transparent' : '#ffca7aff',
                borderRadius: 10,
                padding: 2,
                paddingLeft: 10,
                paddingRight: 10,
                marginBottom: 5,
              }
            ]}  
          >
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
              {game.up_next_members[id].map((memberId, j) => {
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
                )})
              }
            </View>
          </View>
        )})
      }
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
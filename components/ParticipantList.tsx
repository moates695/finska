import { gameAtom, Team } from "@/store/general";
import { useAtom } from "jotai";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from "@expo/vector-icons";

export default function ParticipantList() {
  const [game, setGame] = useAtom(gameAtom);

  const removePlayer = (id: string) => {
    const { [id]: _, ...rest } = game.players;
    setGame({
      ...game,
      players: rest,
      up_next: game.up_next.filter(tempId => tempId !== id)
    })
  };

  const removeTeam = (id: string) => {
    const { [id]: removed1, ...restTeams} = game.teams;
    const { [id]: removed2, ...restUpNextMembers} = game.up_next_members;
    setGame({
      ...game,
      teams: restTeams,
      up_next: game.up_next.filter(tempId => tempId !== id),
      up_next_members: restUpNextMembers
    })
  };

  const removeMember = (teamId: string, memberId: string) => {
    const { [memberId]: removed1, ...restMembers } = game.teams[teamId].members;
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
                      }}
                    />
                  </View>
                )
              })}
            </View>
          </View>
        )
      })}
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
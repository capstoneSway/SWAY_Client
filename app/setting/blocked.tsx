import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const blockedUsers = [
  {
    id: "1",
    name: "Fàn Bīngbīng",
    country: "🇨🇳",
    image: require("@/assets/images/default_profile.png"),
  },
  {
    id: "2",
    name: "Eva",
    country: "🇫🇷",
    image: require("@/assets/images/default_profile.png"),
  },
  {
    id: "3",
    name: "Kristen",
    country: "🇺🇸",
    image: require("@/assets/images/default_profile.png"),
  },
];

const [users, setUsers] = useState(blockedUsers);

const confirmUnblock = (id: string, name: string) => {
  Alert.alert("Unblock User", `Do you really want to unblock ${name}?`, [
    { text: "Cancel", style: "cancel" },
    {
      text: "Unblock",
      style: "destructive",
      onPress: () => {
        setUsers((prev) => prev.filter((user) => user.id !== id));
      },
    },
  ]);
};

export default function BlockedUserScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: (typeof blockedUsers)[0] }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Image source={item.image} style={styles.avatar} />
        <Text style={styles.name}>
          {item.name} <Text style={styles.country}>{item.country}</Text>
        </Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="close" size={24} color="#111" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked User List</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "500" },
  country: { fontSize: 14 },
});

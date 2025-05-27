import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Switch,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/color";

const RESTRICTION_ITEMS = [
  { key: "restriction", label: "Restriction History", icon: "chevron-forward" },
  { key: "blocked", label: "Blocked User List", icon: "chevron-forward" },
  { key: "guidelines", label: "Community Guidelines", icon: "open-outline" },
];

export default function MyProfileScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("Kristen");
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [switches, setSwitches] = useState({
    posts: true,
    comments: true,
    meetups: true,
    chats: true,
  });
  const [feedback, setFeedback] = useState("");

  const onToggle = (key: keyof typeof switches) => {
    setSwitches((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const changeProfile = () => {
    // TODO: open image picker and update profileUri
  };

  const renderMenuItem = ({
    item,
  }: {
    item: (typeof RESTRICTION_ITEMS)[0];
  }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        /* TODO: navigate */
      }}
    >
      <Text style={styles.rowText}>{item.label}</Text>
      <Ionicons name={item.icon as any} size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      */}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Profile Section: avatar & name left-aligned */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={
              profileUri
                ? { uri: profileUri }
                : require("@/assets/images/default_profile.png")
            }
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.avatarOverlay}
            onPress={changeProfile}
          >
            <Ionicons name="camera-outline" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.nameWrapper}>
          <Text style={styles.flag}>🇺🇸</Text>
          <Text style={styles.name}>{name}</Text>
          <TouchableOpacity
            onPress={() => {
              /* TODO: edit name */
            }}
          >
            <Ionicons
              name="pencil"
              size={18}
              color="#333"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community</Text>
        <FlatList
          data={RESTRICTION_ITEMS}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.key}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <View style={styles.row}>
          <Text style={styles.rowText}>Posts</Text>
          <Switch
            value={switches.posts}
            onValueChange={() => onToggle("posts")}
            trackColor={{ true: colors.PURPLE_300 }}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowText}>Comments</Text>
          <Switch
            value={switches.comments}
            onValueChange={() => onToggle("comments")}
            trackColor={{ true: colors.PURPLE_300 }}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowText}>Meetups</Text>
          <Switch
            value={switches.meetups}
            onValueChange={() => onToggle("meetups")}
            trackColor={{ true: colors.PURPLE_300 }}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowText}>Meetup Chats</Text>
          <Switch
            value={switches.chats}
            onValueChange={() => onToggle("chats")}
            trackColor={{ true: colors.PURPLE_300 }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            /* TODO: log out */
          }}
        >
          <Text style={[styles.rowText, { color: "#E53935" }]}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            /* TODO: delete account */
          }}
        >
          <Text style={[styles.rowText, { color: "#E53935" }]}>
            Delete account
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          /* TODO: save changes */
        }}
      >
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#eee" },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  nameWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  flag: { fontSize: 40 },
  name: { fontSize: 24, fontWeight: "500", marginLeft: 8 },

  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.BLACK,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowText: { fontSize: 14 },
  separator: { height: 1, backgroundColor: "#eee" },

  saveButton: {
    backgroundColor: "#6F4AE2",
    margin: 16,
    borderRadius: 8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

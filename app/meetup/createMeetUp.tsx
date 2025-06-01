import { addCard } from "@/constants/cards";
import { categoryImages } from "@/constants/categoryImages";
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import createLightningMeetUp from "../api/createMeetUp";
import fetchUserInfo from "../api/fetchUserInfo";

const CATEGORY_OPTIONS = ["Travel", "Foodie", "WorkOut", "Others"];
const GENDER_OPTIONS = ["All", "Female", "Male"];
const PARTICIPANT_COUNTS = [2, 3, 4, 5, 6];

const uniqueParticipantsStrict = (participants, hostId) => {
  const filtered = participants.filter((p) => p.id !== hostId);
  const uniqueMap = new Map();
  for (const p of filtered) {
    if (!uniqueMap.has(p.id)) uniqueMap.set(p.id, p);
  }
  return Array.from(uniqueMap.values());
};

export default function CreateMeetUp() {
  const [userGender, setUserGender] = useState(null);
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  const [token, setToken] = useState(null);
  const [category, setCategory] = useState("Travel");
  const [gender, setGender] = useState("All");
  const [count, setCount] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(true);

  useEffect(() => {
    const loadTokenAndUser = async () => {
      try {
        const jwt = await AsyncStorage.getItem("@jwt");
        setToken(jwt);

        if (jwt) {
          const user = await fetchUserInfo(jwt);
          if (user?.gender) {
            const capitalizedGender =
              user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
            setUserGender(capitalizedGender);
          }
        }
      } catch (e) {
        console.error("❌ 유저 정보 불러오기 실패:", e);
      }
    };

    loadTokenAndUser();
  }, []);

  const isPostDisabled =
    !category || !gender || !title.trim() || !content.trim();

  const onPost = async () => {
    const images = categoryImages[category] || [];
    const randomImage = images[Math.floor(Math.random() * images.length)] || "";

    if (isPostDisabled || !token) {
      Alert.alert("로그인 필요", "먼저 로그인을 해주세요.");
      return;
    }

    const postData = {
      title: title.trim(),
      content: content.trim(),
      max_participant: count,
      gender: gender.toLowerCase(),
      category: category.toLowerCase(),
      background_pic: randomImage,
    };

    try {
      const response = await createLightningMeetUp(token, postData);
      const filteredParticipants = uniqueParticipantsStrict(
        response.participants || [],
        response.host?.id
      );
      const totalParticipantsCount =
        filteredParticipants.length + (response.host ? 1 : 0);

      addCard({
        id: response.id || Date.now(),
        title: title.trim(),
        tag: category,
        status: "register",
        participants: `${totalParticipantsCount}/${count}`,
        meetupTime: date.toISOString(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        content: content.trim(),
        gender,
        participantAvatars: filteredParticipants,
        image: response.background_pic,
      });

      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Failed to create the meetup. Please try again.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ backgroundColor: colors.WHITE }}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={{ paddingLeft: 4, zIndex: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.BLACK} />
          </Pressable>

          <Text style={styles.headerTitle}>Open New Meet Up</Text>

          <Pressable
            onPress={() => {
              if (pressed || isPostDisabled) return;
              setPressed(true);
              setTimeout(() => setPressed(false), 1000);
              onPost();
            }}
            disabled={isPostDisabled || pressed}
            style={{ paddingRight: 16 }}
          >
            <Text
              style={{
                color: isPostDisabled ? colors.GRAY_600 : colors.PURPLE_300,
                fontWeight: "600",
                opacity: isPostDisabled ? 0.5 : 1,
                fontSize: 16,
              }}
            >
              Post
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Pressable onPress={() => setShowOptions(true)}>
          <Text style={styles.categoryLabel}>Select a category</Text>
        </Pressable>
        <View style={styles.divider} />

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Type meet up title here!"
          placeholderTextColor={colors.GRAY_600}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Content</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Please write a description of the meet up here"
          placeholderTextColor={colors.GRAY_600}
          value={content}
          onChangeText={setContent}
          multiline
        />
      </ScrollView>

      <Modal
        visible={showOptions}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "#00000066" },
            ]}
            onPress={() => setShowOptions(false)}
          />

          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Category</Text>
            <View style={styles.row}>
              {CATEGORY_OPTIONS.map((opt) => {
                const sel = opt === category;
                return (
                  <Pressable
                    key={opt}
                    style={[
                      styles.chipFixed,
                      styles.chip,
                      sel && styles.chipSelected,
                    ]}
                    onPress={() => setCategory(opt)}
                  >
                    <Text style={[styles.chipText, sel && styles.chipTextSel]}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.modalTitle}>Gender</Text>
            <Text style={[styles.descriptionText, { color: colors.GRAY_600 }]}>
              * Creating chat rooms for the opposite gender is not allowed for
              safety and matching purposes.
            </Text>
            <View style={styles.row}>
              {GENDER_OPTIONS.map((opt) => {
                const sel = opt === gender;
                const isDisabled =
                  opt !== "All" && userGender && opt !== userGender;
                return (
                  <Pressable
                    key={opt}
                    disabled={isDisabled}
                    style={[
                      styles.chipFixed,
                      styles.chip,
                      sel && styles.chipSelected,
                      isDisabled && { opacity: 0.3 },
                    ]}
                    onPress={() => {
                      if (!isDisabled) setGender(opt);
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        sel && styles.chipTextSel,
                        isDisabled && { color: colors.GRAY_500 },
                      ]}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.modalTitle}>Number of Participants</Text>
            <View style={styles.row}>
              {PARTICIPANT_COUNTS.map((n) => {
                const sel = n === count;
                return (
                  <Pressable
                    key={n}
                    style={[styles.chip, sel && styles.chipSelected]}
                    onPress={() => setCount(n)}
                  >
                    <Text style={[styles.chipText, sel && styles.chipTextSel]}>
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.modalTitle}>Meeting Date</Text>
            <Text style={[styles.descriptionText, { color: colors.GRAY_600 }]}>
              * This is the meeting date. After it passes, the event expires and
              chat ends. Chat is available for 24 hours from creation.
            </Text>
            <Pressable
              style={styles.dateBox}
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.dateText}>
                {`${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
                  2,
                  "0"
                )}.${String(date.getDate()).padStart(2, "0")}`}
              </Text>
              <Image
                source={require("../../assets/images/calendar_icon.png")}
                style={styles.calendarIcon}
              />
            </Pressable>

            <DateTimePickerModal
              isVisible={showPicker}
              mode="date"
              display="inline"
              minimumDate={new Date()}
              onConfirm={(d) => {
                setShowPicker(false);
                setDate(d);
              }}
              onCancel={() => setShowPicker(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.WHITE },
  contentContainer: { padding: 16, paddingBottom: 40, paddingHorizontal: 20 },

  header: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 4,
    marginBottom: -30,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    paddingBottom: 8,
    top: 16,
  },

  categoryLabel: {
    fontSize: 18,
    fontWeight: "300",
    color: colors.BLACK,
    marginBottom: 12,
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: colors.GRAY_200,
    marginBottom: 16,
    marginHorizontal: -20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: colors.GRAY_700,
  },
  input: {
    backgroundColor: colors.GRAY_100,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: colors.BLACK,
  },
  textArea: {
    backgroundColor: colors.GRAY_100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: "top",
    marginBottom: 16,
    color: colors.BLACK,
    minHeight: 155,
  },

  modalContent: {
    maxHeight: "60%",
    minHeight: "55%",
    backgroundColor: colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 32,
    paddingTop: 40,
    overflow: "hidden",
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
    color: colors.BLACK,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  chip: {
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.PURPLE_100,
    paddingHorizontal: 10,
    justifyContent: "center",
    marginRight: 12,
    marginBottom: 12,
  },
  chipFixed: {
    width: 80,
    alignItems: "center",
  },
  chipSelected: {
    backgroundColor: colors.PURPLE_300,
  },
  chipText: {
    fontSize: 14,
    color: colors.PURPLE_300,
  },
  chipTextSel: {
    color: colors.WHITE,
  },

  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.GRAY_300,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: 120,
  },
  dateText: {
    fontSize: 14,
    color: colors.BLACK,
  },
  calendarIcon: {
    width: 16,
    height: 16,
    marginLeft: 8,
  },

  descriptionText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
});

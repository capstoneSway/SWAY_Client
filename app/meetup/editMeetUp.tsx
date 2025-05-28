// app/meetup/editMeetUp.tsx
// ✅ 번개모임 수정 화면
// ✅ 인원 수 1은 비활성화 처리됨
// ✅ 모든 필드가 기존과 동일하거나 변경 없음 시 update 버튼 비활성화

import { categoryImages } from "@/constants/categoryImages";
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import updateLightningMeetUp from "../api/updateLightning";

const CATEGORY_OPTIONS = ["Travel", "Foodie", "WorkOut", "Others"];
const GENDER_OPTIONS = ["All", "Female", "Male"];
const PARTICIPANT_COUNTS = [1, 2, 3, 4, 5, 6];

export default function EditMeetUp() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [token, setToken] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // 원본 데이터 저장용
  const [originalData, setOriginalData] = useState<{
    category: string | null;
    gender: string | null;
    max_participant: number | null;
    title: string;
    content: string;
    meeting_date: Date;
  } | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const jwt = await AsyncStorage.getItem("@jwt");
      setToken(jwt);
    };
    loadToken();
  }, []);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await axios.get(
          `https://port-0-sway-server-mam72goke080404a.sel4.cloudtype.app/lightning/${id}/`
        );
        const data = res.data;
        const cat = data.category ? capitalize(data.category) : "Travel";
        const gen = data.gender ? capitalize(data.gender) : "All";
        const maxP = data.max_participant || 5;
        const t = data.title || "";
        const c = data.content || "";
        const d = data.meeting_date ? new Date(data.meeting_date) : new Date();

        setCategory(cat);
        setGender(gen);
        setCount(maxP);
        setTitle(t);
        setContent(c);
        setDate(d);
        setShowOptions(false);

        // 원본 데이터 저장
        setOriginalData({
          category: cat,
          gender: gen,
          max_participant: maxP,
          title: t,
          content: c,
          meeting_date: d,
        });
      } catch (error) {
        Alert.alert("오류", "모임 정보를 불러오는데 실패했습니다.");
      }
    })();
  }, [id]);

  // 변경 사항 없는지 확인
  const isDataUnchanged = () => {
    if (!originalData) return false;
    return (
      originalData.category === category &&
      originalData.gender === gender &&
      originalData.max_participant === count &&
      originalData.title === title.trim() &&
      originalData.content === content.trim() &&
      originalData.meeting_date.getTime() === date.getTime()
    );
  };

  // 필수 입력 + 변경 감지 여부 체크
  const isUpdateDisabled =
    !category ||
    !gender ||
    count === null ||
    !title.trim() ||
    !content.trim() ||
    isDataUnchanged();

  const onUpdate = async () => {
    if (isUpdateDisabled) return;
    if (!token) {
      Alert.alert("로그인 필요", "먼저 로그인을 해주세요.");
      return;
    }
    const images = categoryImages[category] || [];
    const randomImage = images[Math.floor(Math.random() * images.length)] || "";

    const updateData = {
      title: title.trim(),
      content: content.trim(),
      max_participant: count,
      gender: gender.toLowerCase(),
      category: category.toLowerCase(),
      background_pic: randomImage,
      meeting_date: date.toISOString(),
    };

    try {
      await updateLightningMeetUp(id!, token, updateData);
      Alert.alert("Success", "The meetup has been updated.");
      router.replace(`/meetup/${id}`);
    } catch (error) {
      Alert.alert("Error", "Failed to update the meetup. Please try again.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ backgroundColor: colors.WHITE }}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push("/(tabs)?tab=current")}
            style={{ paddingLeft: 4, zIndex: 10 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.BLACK}
              style={{ paddingBottom: 16 }}
            />
          </Pressable>

          <Text style={styles.headerTitle}>Edit Meet Up</Text>

          <Pressable
            onPress={onUpdate}
            disabled={isUpdateDisabled}
            style={{ paddingRight: 16, paddingBottom: 16 }}
          >
            <Text
              style={{
                color: isUpdateDisabled ? colors.GRAY_600 : colors.PURPLE_300,
                fontWeight: "600",
                opacity: isUpdateDisabled ? 0.5 : 1,
                fontSize: 16,
                paddingBottom: 4,
              }}
            >
              Update
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
              {CATEGORY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.chipFixed,
                    styles.chip,
                    opt === category && styles.chipSelected,
                  ]}
                  onPress={() => setCategory(opt)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      opt === category && styles.chipTextSel,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalTitle}>Gender</Text>
            <View style={styles.row}>
              {GENDER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.chipFixed,
                    styles.chip,
                    opt === gender && styles.chipSelected,
                  ]}
                  onPress={() => setGender(opt)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      opt === gender && styles.chipTextSel,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalTitle}>Number of Participants</Text>
            <View style={styles.row}>
              {PARTICIPANT_COUNTS.map((n) => (
                <Pressable
                  key={n}
                  style={[
                    styles.chip,
                    n === count && styles.chipSelected,
                    n === 1 && { opacity: 0.3 },
                  ]}
                  disabled={n === 1}
                  onPress={() => setCount(n)}
                >
                  <Text
                    style={[styles.chipText, n === count && styles.chipTextSel]}
                  >
                    {n}
                  </Text>
                </Pressable>
              ))}
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

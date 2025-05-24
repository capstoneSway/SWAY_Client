// app/meetup/createMeetUp.tsx

import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

const CATEGORY_OPTIONS = ["Travel", "Foodie", "WorkOut", "Others"];
const GENDER_OPTIONS = ["All", "Female", "Male"];
const PARTICIPANT_COUNTS = [2, 3, 4, 5, 6];

export default function CreateMeetUp() {
  const router = useRouter();

  const [category, setCategory] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(true);

  const onPost = () => {
    if (
      !category ||
      !gender ||
      count === null ||
      !title.trim() ||
      !content.trim()
    ) {
      return;
    }
    console.log({ category, gender, count, title, content, date });
    router.back();
  };

  const isPostDisabled =
    !category || !gender || count === null || !title.trim() || !content.trim();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ backgroundColor: colors.WHITE }}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={{ paddingLeft: 4, zIndex: 10 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.BLACK}
              style={{ paddingBottom: 16 }}
            />
          </Pressable>

          <Text style={styles.headerTitle}>Open New Meet Up</Text>

          <Pressable
            onPress={onPost}
            disabled={isPostDisabled}
            style={{ paddingRight: 16, paddingBottom: 16 }}
          >
            <Text
              style={{
                color: isPostDisabled ? colors.GRAY_600 : colors.PURPLE_300,
                fontWeight: "600",
                opacity: isPostDisabled ? 0.5 : 1,
                fontSize: 16,
                paddingBottom: 4,
              }}
            >
              Post
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ─ 메인 폼 ─ */}
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

      {/* ─ 옵션 모달 ─ */}
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
            {/* Category */}
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

            {/* Gender */}
            <Text style={styles.modalTitle}>Gender</Text>
            <View style={styles.row}>
              {GENDER_OPTIONS.map((opt) => {
                const sel = opt === gender;
                return (
                  <Pressable
                    key={opt}
                    style={[
                      styles.chipFixed,
                      styles.chip,
                      sel && styles.chipSelected,
                    ]}
                    onPress={() => setGender(opt)}
                  >
                    <Text style={[styles.chipText, sel && styles.chipTextSel]}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Number of Participants */}
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

            {/* Meeting Date */}
            <Text style={styles.modalTitle}>Meeting Date</Text>
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

            {/* Date Picker */}
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
    paddingTop: 64,
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
});

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/axios";
import { colors } from "@/constants/color";

const CATEGORY_OPTIONS = [
  { label: "Bug Report", value: "bug" },
  { label: "Suggestion", value: "suggestion" },
  { label: "Other", value: "other" },
];

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState("bug");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      const token = await AsyncStorage.getItem("@jwt");
      if (!token) throw new Error("Token not found");

      const res = await api.post(
        "/mypage/settings/feedback/",
        {
          feedback_type: selectedType,
          title,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Thank you!", "Your feedback has been submitted.");
      navigation.goBack();
    } catch (error: any) {
      console.error(
        "❌ Feedback submit failed:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Could not send feedback.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!(title.trim() && content.trim())}
        >
          <Text
            style={[
              styles.sendButton,
              {
                color:
                  title.trim() && content.trim()
                    ? colors.PURPLE_300
                    : colors.GRAY_500,
              },
            ]}
          >
            Send
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORY_OPTIONS.map((item) => {
            const isSelected = selectedType === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.categoryButton,
                  isSelected && styles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedType(item.value)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Write Here!"
          placeholderTextColor="#aaa"
        />

        {/* Content */}
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={styles.textArea}
          value={content}
          onChangeText={setContent}
          placeholder="We’d love to hear your feedback!"
          placeholderTextColor="#aaa"
          multiline
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  sendButton: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.GRAY_500,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 20,
    marginBottom: 8,
    color: "#222",
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: colors.PURPLE_100,
    borderRadius: 16,
  },
  categoryButtonSelected: {
    backgroundColor: colors.PURPLE_300,
  },
  categoryText: {
    fontSize: 14,
    color: colors.BLACK,
  },
  categoryTextSelected: {
    color: colors.WHITE,
    fontWeight: "500",
  },
  input: {
    borderRadius: 8,
    backgroundColor: colors.GRAY_100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    borderRadius: 8,
    backgroundColor: colors.GRAY_100,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: "top",
  },
});

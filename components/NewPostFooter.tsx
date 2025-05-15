<<<<<<< HEAD
import { useFormContext } from "react-hook-form";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "@/constants/color";
import { useRouter } from "expo-router";

export default function NewPostFooter() {
  const router = useRouter();
  const { watch } = useFormContext();

  const title = watch("title");
  const description = watch("description");
  const isFormValid = title?.trim() && description?.trim();

  const handlePost = () => {
    if (!isFormValid) return;

    console.log("📮 POST SUBMIT:", { title, description });
    router.back();
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.postButton, !isFormValid && styles.disabledButton]}
        onPress={handlePost}
        disabled={!isFormValid}
      >
        <Text
          style={[styles.postButtonText, !isFormValid && styles.disabledText]}
        >
          Post
        </Text>
      </TouchableOpacity>
=======
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function NewPostFooter() {
  const inset = useSafeAreaInsets();

  const handleOpenImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
    });

    if (result.canceled) {
      return;
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: inset.bottom }]}>
      <Pressable style={styles.footerIcon} onPress={handleOpenImagePick}>
        <Ionicons name={"camera"} size={20} color={colors.BLACK} />
      </Pressable>
>>>>>>> 4a7f9093a90f01d2518441b4d62a9c997eca11a5
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
    padding: 16,
    backgroundColor: colors.WHITE,
  },
  postButton: {
    backgroundColor: colors.PURPLE_300,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  postButtonText: {
    color: colors.WHITE,
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: colors.GRAY_300,
  },
  disabledText: {
    color: colors.GRAY_500,
  },
});
=======
  container: {
    width: "100%",
    paddingTop: 12,
    bottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.WHITE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.GRAY_300,
    flexDirection: "row",
    gap: 10,
  },
  footerIcon: {
    backgroundColor: colors.GRAY_100,
    padding: 10,
    borderRadius: 5,
  },
});

export default NewPostFooter;
>>>>>>> 4a7f9093a90f01d2518441b4d62a9c997eca11a5

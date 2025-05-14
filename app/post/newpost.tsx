import DescriptionInput from "@/components/DescriptionInput";
import TitleInput from "@/components/TitleInput";
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type FormValues = {
  title: string;
  description: string;
};

export default function NewPostScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const postForm = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const { watch } = postForm;
  const title = watch("title");
  const description = watch("description");
  const isFormValid = title?.trim() && description?.trim();

  const handleSubmit = () => {
    if (!isFormValid) return;
    console.log("📮 POST SUBMIT", { title, description });
    router.back();
  };

  return (
    <FormProvider {...postForm}>
      {/* 커스텀 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.BLACK} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>New Post</Text>

        <TouchableOpacity disabled={!isFormValid} onPress={handleSubmit}>
          <Text
            style={[
              styles.headerPost,
              !isFormValid && styles.headerPostDisabled,
            ]}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>

      {/* 입력 폼 */}
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <TitleInput />
        <DescriptionInput />
        {/* <ImageUploadBar /> 나중에 이미지 업로드 들어올 자리 */}
      </KeyboardAwareScrollView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_200,
    backgroundColor: colors.WHITE,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.BLACK,
  },
  headerPost: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.PURPLE_300,
  },
  headerPostDisabled: {
    color: colors.GRAY_400,
  },
  container: {
    margin: 16,
    gap: 16,
  },
});

import { createPost, updatePost } from "@/app/api/board";
import DescriptionInput from "@/components/DescriptionInput";
import TitleInput from "@/components/TitleInput";
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

// 타입 정의
type FormValues = {
  title: string;
  description: string;
};

export default function NewPostScreen() {
  const router = useRouter();
  const {
    id,
    edit,
    title: initTitle,
    description: initDescription,
  } = useLocalSearchParams();

  const isEdit = edit === "true";

  const postForm = useForm<FormValues>({
    defaultValues: { title: "", description: "" },
  });

  const { watch, setValue } = postForm;
  const title = watch("title");
  const description = watch("description");
  const isFormValid = Boolean(title.trim() && description.trim());

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const animatedBottom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEdit && initTitle && initDescription) {
      setValue("title", String(initTitle));
      setValue("description", String(initDescription));
    }
  }, [isEdit, initTitle, initDescription]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates?.height ?? 0;
      Animated.timing(animatedBottom, {
        toValue: height,
        duration: Platform.OS === "ios" ? e.duration ?? 250 : 100,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(animatedBottom, {
        toValue: 0,
        duration: Platform.OS === "ios" ? e.duration ?? 250 : 100,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      if (isEdit && id) {
        await updatePost(Number(id), title, description);
        Alert.alert("Updated", "Post updated successfully.", [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/board"),
          },
        ]);
      } else {
        await createPost(title, description, selectedImages);
        router.push("/(tabs)/board");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to submit post.");
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...newUris]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FormProvider {...postForm}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <SafeAreaView style={styles.headerContainer} edges={["top"]}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={24} color={colors.BLACK} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                  {isEdit ? "Edit Post" : "New Post"}
                </Text>

                <TouchableOpacity
                  disabled={!isFormValid}
                  onPress={handleSubmit}
                >
                  <Text
                    style={[
                      styles.headerPost,
                      !isFormValid && styles.headerPostDisabled,
                    ]}
                  >
                    {isEdit ? "Update" : "Post"}
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            <KeyboardAvoidingView
              style={styles.wrapper}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
              <KeyboardAwareScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.label}>Title</Text>
                <View style={styles.inputWrapper}>
                  <TitleInput />
                </View>

                <Text style={styles.label}>Content</Text>
                <View style={styles.inputWrapper}>
                  <DescriptionInput />
                </View>

                {selectedImages.length > 0 && (
                  <View style={styles.imagePreviewRow}>
                    {selectedImages.map((uri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                )}
              </KeyboardAwareScrollView>
            </KeyboardAvoidingView>

            <Animated.View
              style={[styles.inputBar, { bottom: animatedBottom }]}
            >
              <Pressable onPress={takePhoto}>
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={colors.BLACK}
                />
              </Pressable>

              <Pressable
                onPress={pickImageFromGallery}
                style={{ marginLeft: 16 }}
              >
                <Ionicons name="image-outline" size={24} color={colors.BLACK} />
              </Pressable>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </FormProvider>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: { backgroundColor: colors.WHITE },
  wrapper: { flex: 1, backgroundColor: colors.WHITE },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_200,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: colors.BLACK },
  headerPost: { fontSize: 16, fontWeight: "bold", color: colors.PURPLE_300 },
  headerPostDisabled: { color: colors.GRAY_300 },
  container: { padding: 16, gap: 12, paddingBottom: 100 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  inputWrapper: {
    backgroundColor: colors.GRAY_100,
    borderRadius: 8,
    padding: 12,
  },
  imagePreviewRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  thumbnail: { width: 80, height: 80, borderRadius: 8 },
  inputBar: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: colors.WHITE,
  },
});

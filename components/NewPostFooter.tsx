import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NewPostFooter() {
  const router = useRouter();
  const { watch } = useFormContext();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const title = watch("title");
  const description = watch("description");
  const isFormValid = title?.trim() && description?.trim();

  const handlePost = () => {
    if (!isFormValid) return;

    console.log("📮 POST SUBMIT:", {
      title,
      description,
      image: selectedImage,
    });
    router.back();
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <View>
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.preview} />
      )}

      <View style={styles.footer}>
        <View style={styles.iconRow}>
          <Pressable onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color={colors.BLACK} />
          </Pressable>

          <Pressable onPress={pickImageFromGallery} style={{ marginLeft: 16 }}>
            <Ionicons name="image-outline" size={24} color={colors.BLACK} />
          </Pressable>
        </View>

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.GRAY_200,
    padding: 16,
    backgroundColor: colors.WHITE,
  },
  iconRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    margin: 16,
    alignSelf: "center",
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

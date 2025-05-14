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

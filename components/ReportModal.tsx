import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { colors } from "@/constants/color";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  targetType: "post" | "comment";
}

export default function ReportModal({
  visible,
  onClose,
  onSubmit,
  targetType,
}: ReportModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (reason.trim()) {
      console.log("📤 ReportModal reason value:", reason); 
      onSubmit(reason);
      setReason("");
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {targetType === "post" ? "Post" : "Comment"} Report 
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Please enter the reason for reporting"
            placeholderTextColor={colors.GRAY_500}
            multiline
            value={reason}
            onChangeText={setReason}
          />
          <View style={styles.buttonRow}>
            <Pressable onPress={onClose} style={styles.cancel}>
              <Text style={{ color: colors.GRAY_700 }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSubmit} style={styles.submit}>
              <Text style={{ color: colors.WHITE }}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // colors에 해당 투명도 색이 없으므로 예외적으로 사용
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: colors.WHITE,
    width: "85%",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.BLACK,
    marginBottom: 10,
  },
  input: {
    borderColor: colors.GRAY_300,
    borderWidth: 1,
    borderRadius: 6,
    height: 100,
    textAlignVertical: "top",
    padding: 10,
    color: colors.BLACK,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancel: {
    marginRight: 15,
    padding: 10,
  },
  submit: {
    backgroundColor: colors.PURPLE_300,
    padding: 10,
    borderRadius: 6,
  },
});

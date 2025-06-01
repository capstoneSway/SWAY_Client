import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/color";

interface EditNicknameModalProps {
  visible: boolean;
  onClose: () => void;
  nickname: string;
  onChangeNickname: (text: string) => void;
  onSubmit: () => void;
  checkResult: boolean | null; // 추가: 닉네임 중복 여부 (null = 체크 전, true = 가능, false = 중복)
  onCheckNickname: () => void; // 추가: 중복 확인 핸들러
}

const EditNicknameModal = ({
  visible,
  onClose,
  nickname,
  onChangeNickname,
  onSubmit,
  checkResult,
  onCheckNickname,
}: EditNicknameModalProps) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Nickname</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.input,
              checkResult === true && styles.inputAvailable,
              checkResult === false && styles.inputTaken,
            ]}
            value={nickname}
            onChangeText={onChangeNickname}
            placeholder="Enter new nickname here"
            placeholderTextColor={colors.GRAY_500}
          />

          {/* 중복 확인 결과 메시지 */}
          {checkResult !== null && (
            <Text
              style={{
                marginBottom: 10,
                fontSize: 14,
                color: checkResult ? colors.PURPLE_300 : colors.RED_500, // 보라 / 빨강
              }}
            >
              {checkResult
                ? "This nickname is available."
                : "This nickname is already taken."}
            </Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.checkButton}
              onPress={onCheckNickname}
            >
              <Text style={styles.checkButtonText}>Check</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                checkResult !== true && styles.submitButtonDisabled,
              ]}
              onPress={onSubmit}
              disabled={checkResult !== true}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  checkResult !== true && styles.submitButtonDisabled,
                ]}
              >
                Change
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditNicknameModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "80%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.BLACK,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.GRAY_300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  inputAvailable: {
    borderColor: colors.PURPLE_300,
    backgroundColor: "#F6F2FF",
  },
  inputTaken: {
    borderColor: "#F66",
    backgroundColor: "#FFECEC",
  },
  status: {
    fontSize: 13,
    marginBottom: 12,
  },
  statusAvailable: {
    color: colors.PURPLE_300,
  },
  statusTaken: {
    color: "#F00",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
  },
  checkButton: {
    flex: 1,
    backgroundColor: colors.GRAY_200,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  checkButtonText: {
    color: colors.BLACK,
    fontWeight: "500",
    textAlign: "center",
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.PURPLE_300,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: colors.WHITE,
    fontWeight: "600",
    textAlign: "center",
  },
  submitButtonDisabled: {
    flex: 1,
    backgroundColor: colors.GRAY_200,
    borderRadius: 8,
  },

  submitButtonTextDisabled: {
    color: colors.BLACK,
    textAlign: "center",
    fontWeight: "500",
  },
});

import { colors } from "@/constants/color";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { StyleSheet, TextInput } from "react-native";

function DescriptionInput() {
  const { control } = useFormContext();

  return (
    <Controller
      name="description"
      control={control}
      rules={{
        validate: (data: string) => {
          if (data.length < 5) {
            return "Please write content";
          }
        },
      }}
      render={({ field: { onChange, value } }) => (
        <TextInput
          style={styles.input}
          placeholder="Please follow our community guidelines when you are posting"
          placeholderTextColor={colors.GRAY_400}
          onChangeText={onChange}
          value={value}
          multiline
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.GRAY_100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.BLACK,
    textAlignVertical: "top", // for multiline alignment
    minHeight: 120,
  },
});

export default DescriptionInput;

import { colors } from "@/constants/color";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { StyleSheet, TextInput } from "react-native";

function TitleInput() {
  const { control, setFocus } = useFormContext();

  return (
    <Controller
      name="title"
      control={control}
      rules={{
        validate: (data: string) => {
          if (data.length <= 0) {
            return "Please write content";
          }
        },
      }}
      render={({ field: { onChange, value } }) => (
        <TextInput
          style={styles.input}
          placeholder="Enter your title here"
          placeholderTextColor={colors.GRAY_400}
          returnKeyType="next"
          autoFocus
          onChangeText={onChange}
          value={value}
          onSubmitEditing={() => setFocus("description")}
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
    paddingVertical: 0,
    fontSize: 14,
    color: colors.BLACK,
  },
});

export default TitleInput;

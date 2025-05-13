import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import InputField from "./InputField";

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
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <InputField
          autoFocus
          label="Title"
          placeholder="Enter your title here"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => setFocus("description")}
          value={value}
          onChangeText={onChange}
          error={error?.message}
        />
      )}
    />
  );
}

export default TitleInput;

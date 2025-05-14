import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import InputField from "./InputField";

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
      render={({ field: { ref, onChange, value }, fieldState: { error } }) => (
        <InputField
          ref={ref}
          label="Content"
          placeholder="Please follow our community guidelines when you are posting"
          returnKeyType="next"
          value={value}
          onChangeText={onChange}
          error={error?.message}
          multiline
        />
      )}
    />
  );
}

export default DescriptionInput;

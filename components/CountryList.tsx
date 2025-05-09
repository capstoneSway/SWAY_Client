import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors } from "@/constants/color";

//props부터
interface CountryListItemProps {
  flag: string; //국기
  name: string;
  selected: boolean;
  onPress: () => void;
}

// 개별 국가를 행을 나타내는 컴포넌트
const CountryListItem: React.FC<CountryListItemProps> = ({
  flag,
  name,
  selected,
  onPress,
}) => {
  return (
    <Pressable
      // 선택한다면 프레임 변화
      style={[styles.container, selected && styles.selectedFrame]}
      onPress={onPress}
    >
      <Text style={styles.flag}>{flag}</Text>

      {/* 선택한다면 fontWeight */}
      <Text style={[styles.name, selected && styles.selectedName]}>{name}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8, // 아이템 간 간격
    backgroundColor: colors.WHITE, // 찐배경
  },

  selectedFrame: {
    backgroundColor: colors.GRAY_100, // 회색 배경
  },

  flag: {
    fontSize: 24,
    marginRight: 16, // 국가명이랑 간격
  },

  name: {
    fontSize: 16,
    color: colors.BLACK,
  },

  selectedName: {
    fontWeight: "bold",
  },
});

export default CountryListItem;

import { colors } from "@/constants/color";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

//props부터
interface CurrencyListItemntrProps {
  flag: ImageSourcePropType;
  code: string;
  name: string;
  selected: boolean;
  onPress: () => void;
}

// 개별 국가를 행을 나타내는 컴포넌트
const CurrencyListItem: React.FC<CurrencyListItemntrProps> = ({
  flag,
  code,
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
      <Image source={flag} style={styles.flag} />

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
  code: {
    fontSize: 16,
    color: colors.BLACK,
    marginRight: 12,
  },

  flag: {
    width: 32,
    height: 32,
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

export default CurrencyListItem;

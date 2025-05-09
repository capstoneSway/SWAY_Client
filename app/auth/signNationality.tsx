import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput } from "react-native";
import { countries } from "@/constants/country"; // 국가 데이터 가져오기
import CountryListItem from "@/components/CountryList"; // 개별 국가 아이템 컴포넌트
import FixedBottomCTA from "@/components/FixedBottomCTA"; // 하단 고정 버튼 컴포넌트
import { colors } from "@/constants/color";

export default function SignNationality() {
  // 골랐으면 담고 아니면 없고
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [search, setSearch] = useState(""); // 검색으로 받을 로마자

  // 검색어 필터링된 국가 반환 용도. 소문자가 편할 듯.
  const filteredCountries = countries.filter(
    (country) => country.name.toLowerCase().includes(search.toLowerCase()) // 소문자로 소문자를 필터링.
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where are you from?</Text>
      <Text style={styles.subtitle}>Select your nationality to continue</Text>

      {/* 검색 필드 */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor={colors.GRAY_600}
        autoCapitalize="none"
        spellCheck={false}
        autoCorrect={false}
        value={search}
        onChangeText={setSearch}
      />

      {/* 국가 목록 */}
      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.code} // 각 국가의 고유 코드로 key 설정
        renderItem={({ item }) => (
          <CountryListItem
            flag={item.flag}
            name={item.name}
            selected={selectedCountry === item.code}
            onPress={() => setSelectedCountry(item.code)}
          />
        )}
        contentContainerStyle={styles.listContainer} // 목록 스타일
      />

      {/* 완료 버튼 */}
      <FixedBottomCTA
        label="Done"
        enabled={selectedCountry !== null} // 선택된 국가가 있을 때만 활성화
        onPress={() => console.log("Selected country:", selectedCountry)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.BLACK,
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: colors.BLACK,
    marginBottom: 16,
    textAlign: "center",
  },
  // 검색 입력 필드 스타일
  searchInput: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.GRAY_100,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.GRAY_700,
  },

  listContainer: {
    paddingBottom: 80, // 버튼 영역 확보
  },
});

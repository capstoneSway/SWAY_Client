import CountryListItem from "@/components/CountryList";
import FixedBottomCTA from "@/components/FixedBottomCTA";
import { colors } from "@/constants/color";
import { countries } from "@/constants/country";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { setNationality } from "../api/setNationality";

export default function SignNationality() {
  const insets = useSafeAreaInsets();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // 필터링된 국가 목록
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  // 국적 제출
  const handleSubmitNationality = async () => {
    if (!selectedCountry) return;
    const country = countries.find((c) => c.code === selectedCountry);
    if (!country) return;
    const nationality = country.name;

    try {
      // 백엔드에 PATCH 요청으로 nationality 전송
      await setNationality(nationality);
      // 로컬 스토리지에도 저장
      await AsyncStorage.setItem("userNationality", nationality);
      // 메인 화면으로 이동
      router.replace("../(tabs)");
    } catch (error) {
      console.error("내셔널리티 설정 중 오류:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Where are you from?</Text>
      <Text style={styles.subtitle}>Select your nationality to continue</Text>

      {/* 검색 필드 */}
      <View style={styles.searchContainer}>
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
        <Feather
          name="search"
          size={24}
          color={colors.GRAY_600}
          style={styles.searchIcon}
        />
      </View>

      {/* 국가 목록 */}
      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <CountryListItem
            flag={item.flag}
            name={item.name}
            selected={selectedCountry === item.code}
            onPress={() => setSelectedCountry(item.code)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* 완료 버튼 */}
      <FixedBottomCTA
        label="Done"
        enabled={!!selectedCountry}
        onPress={handleSubmitNationality}
        style={styles.bottomCTA}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  searchContainer: {
    position: "relative",
    width: "90%",
    marginBottom: 16,
    left: 20,
  },
  searchIcon: {
    position: "absolute",
    right: 16,
    top: 20,
    width: 24,
    height: 24,
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
  searchInput: {
    width: "100%",
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.GRAY_100,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.GRAY_700,
  },
  listContainer: {
    paddingHorizontal: 36,
    paddingVertical: 26,
    marginBottom: 16,
    width: "100%",
    alignItems: "stretch",
    backgroundColor: colors.WHITE,
    overflow: "visible",
  },
  bottomCTA: {
    position: "relative",
    top: 34,
    width: "100%",
    alignSelf: "center",
  },
});

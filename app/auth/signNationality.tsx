import CountryListItem from "@/components/CountryList";
import FixedBottomCTA from "@/components/FixedBottomCTA";
import { colors } from "@/constants/color";
import { countries } from "@/constants/country";
import { saveNationalityToStorage } from "@/utils/saveNationality";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function SignNationality() {
  const insets = useSafeAreaInsets();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [search, setSearch] = useState(""); // 검색어

  // 검색어 필터링된 국가 반환
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  //  사용자 정보 가져오기
  const fetchKakaoUserInfo = async (accessToken: string) => {
    try {
      const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("카카오 사용자 정보:", response.data);
      return response.data;
    } catch (error) {
      console.error("카카오 사용자 정보 가져오기 실패:", error);
      return null;
    }
  };

  //  국적 선택
  const handleSubmitNationality = async () => {
    if (selectedCountry) {
      try {
        await saveNationalityToStorage(selectedCountry);
        console.log("국적 저장 성공:", selectedCountry);

        // 로컬 스토리지에서 카카오 토큰 가져오기
        const tokenDataString = await AsyncStorage.getItem("kakaoTokenData");
        const tokenData = tokenDataString ? JSON.parse(tokenDataString) : null;

        if (!tokenData?.accessToken) {
          console.error("액세스 토큰이 없습니다.");
          return;
        }

        // 카카오 사용자 정보 가져오기
        const kakaoUserInfo = await fetchKakaoUserInfo(tokenData.accessToken);
        console.log("받아온 사용자 정보:", kakaoUserInfo);
      } catch (error) {
        console.error("국적 저장 중 오류:", error);
      }
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
        enabled={selectedCountry !== null}
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

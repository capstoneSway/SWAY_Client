import {
  createMemo,
  deleteMemo as deleteMemoApi,
  fetchAllMemos,
  MemoDTO,
} from "@/app/api/memo";
import { getHistory } from "@/app/api/rate";
import { parseCurrencyCode } from "@/app/api/utils";
import CurrencyListItem from "@/components/CurrencyList";
import { colors } from "@/constants/color";
import { currencies } from "@/constants/currency";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// 100단위 환산이 필요한 통화
const SPECIAL_UNIT: Record<string, number> = {
  JPY: 100, // 100엔 단위
  IDR: 100, // 100루피아 단위
};

// 차트용 7일 라벨 생성
const labels7 = (() => {
  const arr: string[] = [];
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    arr.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return arr;
})();

export default function CurrencyScreen() {
  // 모달 / 선택 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selecting, setSelecting] = useState<"from" | "to">("from");

  // currencies 배열에서 검색어로 필터링
  const filteredCurrencies =
    searchText.trim().length > 0
      ? currencies.filter(
          (item) =>
            item.code.toLowerCase().includes(searchText.toLowerCase()) ||
            item.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : currencies;

  // 초기 선택 통화
  const [fromCur, setFromCur] = useState(
    currencies.find((c) => c.code === "KRW") ?? currencies[0]
  );
  const [toCur, setToCur] = useState(
    currencies.find((c) => c.code === "AED") ?? currencies[1] ?? currencies[0]
  );

  // 금액 & 메모 상태
  const [fromAmt, setFromAmt] = useState("");
  const [toAmt, setToAmt] = useState("" as string);
  const [memoModalVisible, setMemoModalVisible] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [memos, setMemos] = useState<MemoDTO[]>([]);

  // 차트 & 환율
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [{ data: [] as number[] }],
  });
  const [currentRate, setCurrentRate] = useState(0);

  // 1) fromCur, toCur 변경 시 백에서 today+history 불러와서 rate 계산
  useEffect(() => {
    (async () => {
      try {
        const [
          { today: fRawToday, history: fHist },
          { today: tRawToday, history: tHist },
        ] = await Promise.all([
          getHistory(fromCur.code),
          getHistory(toCur.code),
        ]);

        // === 9:30 전엔 전날 rate 쓰기 ===
        const now = new Date();
        const threshold = new Date();
        threshold.setHours(9, 30, 0, 0);
        const isBeforePub = now < threshold;

        // fromCur rate 결정: today 없으면 어제 날짜로 찾아오기
        let fRate = fRawToday?.rate ?? 0;
        if (isBeforePub || !fRawToday) {
          // 어제 날짜 문자열 구하기
          const y = new Date(now);
          y.setDate(y.getDate() - 1);
          const yStr = y.toISOString().slice(0, 10); // "YYYY-MM-DD"
          // 히스토리에서 어제 항목 찾기
          const prev = fHist.find((h) => h.date === yStr);
          fRate = prev?.rate ?? fRate;
        }

        // toCur rate 결정: today 없으면 어제 날짜로
        let tRate = tRawToday?.rate ?? 0;
        if (isBeforePub || !tRawToday) {
          const y = new Date(now);
          y.setDate(y.getDate() - 1);
          const yStr = y.toISOString().slice(0, 10);
          const prev = tHist.find((h) => h.date === yStr);
          tRate = prev?.rate ?? tRate;
        }

        // 오늘 환율 (1 fromCur = x toCur)
        const todayRate = fRate / tRate;
        setCurrentRate(todayRate);

        // 7일치 히스토리 비율로 변환
        const labels = fHist.map((h) =>
          new Date(h.date).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
          })
        );
        const data = fHist.map((h) => {
          const match = tHist.find((t) => t.date === h.date);
          return match ? h.rate / match.rate : h.rate / tRate;
        });
        setChartData({ labels, datasets: [{ data }] });
      } catch (e) {
        console.error("환율 API 로드 실패", e);
        Alert.alert(
          "Currency rate Load Error",
          "Unable to Load Currency rate. Please check your connection and try again"
        );
      }
    })();
  }, [fromCur, toCur]);

  // 2) fromAmt 입력 시 toAmt 자동 계산
  useEffect(() => {
    if (!fromAmt) {
      setToAmt("");
      return;
    }
    const n = parseFloat(fromAmt) || 0;
    setToAmt((n * currentRate).toFixed(2));
  }, [fromAmt, currentRate]);

  // 3) 백엔드에서 메모 불러와 세팅
  useEffect(() => {
    (async () => {
      try {
        const all = await fetchAllMemos();
        //console.log("📥 fetchAllMemos 응답:", all);
        setMemos(all);
      } catch (e) {
        console.error("메모 로드 실패", e);
        Alert.alert(
          "Memo Load Error",
          "Unable to fetch your memos. Please check your connection and try again"
        );
      }
    })();
  }, []);

  // 메모 핸들러
  const saveMemo = async () => {
    if (!memoText.trim()) return;
    try {
      // 서버에 POST
      const created = await createMemo(
        fromCur.code,
        parseFloat(fromAmt) || 0,
        parseFloat(toAmt) || 0,
        toCur.code,
        currentRate,
        memoText.trim()
      );
      setMemos((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return [created, ...list];
      });
    } catch (e) {
      console.error("메모 저장 실패", e);
    }
    setMemoText("");
    setMemoModalVisible(false);
  };

  const deleteMemo = async (id: number) => {
    try {
      await deleteMemoApi(id);
      setMemos((prev) => prev.filter((m) => m.id !== id));
    } catch (e: any) {
      console.error("[DEBUG] deleteMemo error ▶", {
        message: e.message,
        status: e.response?.status,
        response: e.response?.data,
        configUrl: e.config?.url,
        configHeaders: e.config?.headers,
      });
      Alert.alert(
        "Delete Error",
        "Unable to delete this memo. Please try again."
      );
    }
  };

  // 셀렉터 시트 열기
  const openSheet = (which: "from" | "to") => {
    setSelecting(which);
    setSearchText("");
    setModalVisible(true);
  };

  // 통화 교환
  const swap = () => {
    setFromCur(toCur);
    setToCur(fromCur);
    setFromAmt(toAmt);
  };

  // === Last Update 표시용 날짜 계산 ===
  const now = new Date();
  const threshold = new Date();
  threshold.setHours(9, 30, 0, 0); // 당일 오전 9:30
  const isBeforePub = now < threshold; // 아직 업데이트 전 여부
  // 오전 9:30 전엔 전날, 그 이후엔 오늘
  const displayDate = isBeforePub
    ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
    : now;
  // toLocaleDateString 포맷
  const displayDateStr = displayDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ─ 렌더 ─
  return (
    <SafeAreaView style={[styles.container, { flex: 1 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>SWAY</Text>
        <Text style={styles.headerTitle}>Currency</Text>
        <TouchableOpacity onPress={() => router.push("/notification")}>
          <Ionicons name="notifications-outline" size={24} />
        </TouchableOpacity>
      </View>
      {/* 카드 */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View>
          {/* 상단 카드 */}
          <View style={styles.card}>
            <Text style={styles.update}>Last Update: {displayDateStr}</Text>

            {/* 7일치 차트 */}
            {(() => {
              const rates = chartData.datasets[0].data;
              // 모든 값이 유한 숫자인지 검사
              const isValid =
                rates.length > 0 && rates.every((v) => Number.isFinite(v));

              if (isValid) {
                return (
                  <LineChart
                    data={chartData}
                    width={SCREEN_W * 0.86}
                    height={180}
                    chartConfig={{
                      backgroundGradientFrom: colors.PURPLE_100,
                      backgroundGradientTo: colors.PURPLE_100,
                      color: () => colors.PURPLE_300,
                      labelColor: () => "rgba(0,0,0,0.3)",
                      propsForDots: { r: "4", stroke: colors.PURPLE_300 },
                    }}
                    withInnerLines={false}
                    withOuterLines={false}
                    style={{ borderRadius: 12, marginBottom: 12 }}
                  />
                );
              } else {
                return (
                  <View
                    style={{
                      width: SCREEN_W * 0.86,
                      height: 180,
                      borderRadius: 12,
                      backgroundColor: colors.PURPLE_100,
                      marginBottom: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text>Loading Chart Data…</Text>
                  </View>
                );
              }
            })()}

            {/* 환율 텍스트 */}
            <Text style={styles.rateText}>
              {(() => {
                const { code: fC, unit: defFU } = parseCurrencyCode(
                  fromCur.code
                );
                const { code: tC, unit: defTU } = parseCurrencyCode(toCur.code);
                // SPECIAL_UNIT 우선 적용
                const fU = SPECIAL_UNIT[fC] ?? defFU;
                const tU = SPECIAL_UNIT[tC] ?? defTU;

                // 왼쪽/오른쪽 단위 문자열 생성
                const leftUnit = fU > 1 ? `${fU} ${fC}` : `1 ${fC}`;
                const rightUnit = tU > 1 ? ` ${tC}` : `${tC}`;
                const displayedRate = fU > 1 ? currentRate * fU : currentRate;

                return `${leftUnit} = ${displayedRate.toFixed(4)} ${rightUnit}`;
              })()}
            </Text>

            {/* 입력부 */}
            <View style={styles.inputArea}>
              {/* From */}
              <View style={[styles.inputBox, styles.inputBoxTop]}>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.GRAY_300}
                  keyboardType="numeric"
                  value={fromAmt}
                  onChangeText={setFromAmt}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => openSheet("from")}
                >
                  <Image source={fromCur.flag} style={styles.flagIcon} />
                  <Text style={styles.selectorText}>{fromCur.code}</Text>
                  <Ionicons name="chevron-down" size={16} />
                </TouchableOpacity>
              </View>

              {/* Swap */}
              <View style={styles.swapWrapper}>
                <TouchableOpacity onPress={swap} style={styles.swapButton}>
                  <Ionicons
                    name="swap-vertical"
                    size={28}
                    color={colors.WHITE}
                    style={styles.swapIconThick}
                  />
                </TouchableOpacity>
              </View>

              {/* To */}
              <View style={[styles.inputBox, styles.inputBoxBottom]}>
                <TextInput
                  style={styles.input}
                  value={toAmt}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => openSheet("to")}
                >
                  <Image source={toCur.flag} style={styles.flagIcon} />
                  <Text style={styles.selectorText}>{toCur.code}</Text>
                  <Ionicons name="chevron-down" size={16} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                Keyboard.dismiss();
                setMemoModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>Memo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* 메모 리스트 */}
      <FlatList<MemoDTO>
        data={memos}
        keyExtractor={(memo) => memo.id.toString()}
        style={{ flex: 1, width: SCREEN_W * 0.9, alignSelf: "center" }}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <View style={styles.memoCard}>
            <View style={styles.memoHeader}>
              <Text style={styles.memoDate}>{item.date}</Text>
              <TouchableOpacity onPress={() => deleteMemo(item.id)}>
                <Ionicons name="close" size={20} color={colors.GRAY_600} />
              </TouchableOpacity>
            </View>
            <Text style={styles.memoText}>{item.content}</Text>
            <Text style={styles.memoRate}>
              {item.from_amount} {item.from_currency} → {item.to_amount}
              {item.to_currency} (@
              {item.exchange_rate.toFixed(4)})
            </Text>
          </View>
        )}
      />

      {/* 통화선택 모달 */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        {/* 반투명 백드롭 */}
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* 하단 바텀 시트 */}
        <View style={styles.sheet}>
          {/* 헤더 */}
          <View>
            <Text style={styles.sheetTitle}>Select currency</Text>
          </View>

          {/* 검색창 */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={colors.GRAY_500} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.GRAY_300}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* 리스트 */}
          <FlatList
            data={filteredCurrencies}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <CurrencyListItem
                flag={item.flag}
                code={item.code}
                name={item.name}
                selected={
                  selecting === "from"
                    ? item.code === fromCur.code
                    : item.code === toCur.code
                }
                onPress={() => {
                  if (selecting === "from") setFromCur(item);
                  else setToCur(item);
                  setModalVisible(false);
                }}
              />
            )}
          />

          {/* 취소 버튼 */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 메모 작성 모달 */}
      <Modal
        visible={memoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMemoModalVisible(false)}
      >
        <View style={styles.memoOverlay}>
          <TouchableWithoutFeedback onPress={() => setMemoModalVisible(false)}>
            <View style={styles.overlayTouchable} />
          </TouchableWithoutFeedback>
          <View style={styles.memoSheet}>
            <View style={styles.memoHeader}>
              <Text style={styles.sheetTitle}>Write Memo</Text>
              <TouchableOpacity onPress={() => setMemoModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.GRAY_600} />
              </TouchableOpacity>
            </View>
            <Text style={styles.memoRate}>
              {fromAmt || "0.00"} {fromCur.code} → {toAmt || "0.00"}{" "}
              {toCur.code}
            </Text>
            <TextInput
              style={styles.memoInput}
              placeholder="Enter your memo here"
              placeholderTextColor={colors.GRAY_300}
              value={memoText}
              onChangeText={setMemoText}
            />
            <TouchableOpacity style={styles.memoDoneButton} onPress={saveMemo}>
              <Text style={styles.memoDoneText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 스타일
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.WHITE },
  card: {
    width: SCREEN_W * 0.9,
    alignSelf: "center",
    borderRadius: 16,
    backgroundColor: colors.PURPLE_100,
    padding: 16,
    marginVertical: 20,
  },
  update: { fontSize: 12, color: colors.GRAY_600, marginBottom: 20 },
  rateText: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  inputArea: { width: "100%", position: "relative", marginBottom: 32 },
  inputBox: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: colors.WHITE,
    alignItems: "center",
    paddingHorizontal: 12,
    height: 48,
  },
  inputBoxTop: { borderRadius: 8, marginBottom: 10 },
  inputBoxBottom: { borderRadius: 8 },
  input: { flex: 1, fontSize: 16 },
  selector: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  selectorText: { fontSize: 16, marginRight: 4 },
  flagIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  swapWrapper: {
    position: "absolute",
    top: 35,
    left: (SCREEN_W * 0.9) / 2 - 35,
    zIndex: 10,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.PURPLE_100,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({ android: { elevation: 4 } }),
  },
  swapIconThick: { transform: [{ scale: 1.1 }] },
  button: {
    width: "100%",
    backgroundColor: colors.PURPLE_300,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: -5,
  },
  buttonText: { color: colors.WHITE, textAlign: "center", fontWeight: "bold" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: "60%",
    backgroundColor: colors.WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    overflow: "hidden",
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.GRAY_100,
    marginHorizontal: 16,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    height: 30,
    fontSize: 16,
    color: colors.BLACK,
  },
  sheetClose: { padding: 12, alignItems: "center" },
  cancelButton: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: colors.GRAY_200,
  },
  cancelText: {
    fontSize: 16,
    color: colors.GRAY_600,
  },
  memoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  memoSheet: {
    width: SCREEN_W * 0.83,
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
  },
  memoInput: {
    height: 40,
    borderColor: colors.GRAY_300,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  memoDoneButton: {
    backgroundColor: colors.PURPLE_300,
    paddingVertical: 12,
    borderRadius: 8,
  },
  memoDoneText: {
    color: colors.WHITE,
    textAlign: "center",
    fontWeight: "bold",
  },
  memoCard: {
    backgroundColor: "#fbfbfb",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignSelf: "center",
    width: SCREEN_W * 0.9,
  },
  memoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  memoDate: { fontSize: 14, color: colors.GRAY_600 },
  memoText: { fontSize: 16, marginBottom: 4 },
  memoRate: { fontSize: 14, color: colors.GRAY_600 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_300,
  },
  logoText: {
    fontSize: 23,
    fontWeight: "bold",
    color: colors.PURPLE_300,
    fontFamily: "GasoekOne",
  },
  headerTitle: {
    position: "absolute",
    left: SCREEN_W / 2 - 40,
    fontSize: 18,
    fontWeight: "600",
  },
});

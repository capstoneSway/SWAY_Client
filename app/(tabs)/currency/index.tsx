import { getHistory } from "@/app/api/rate";
import { fillMissingDates, parseCurrencyCode } from "@/app/api/utils";
import CurrencyListItem from "@/components/CurrencyList";
import { colors } from "@/constants/color";
import { currencies } from "@/constants/currency";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { countries } from "@/constants/country";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const SPECIAL_UNIT: Record<string, number> = {
  JPY: 100, // 100엔 단위
  IDR: 100, // 100루피아 단위
};

// ==== 수정: API 호출 대신 고정 예시 환율
const rawQuotes = {
  KRWUSD: 0.000715,
  KRWEUR: 0.000638,
  KRWCAD: 0.000998,
  KRWAUD: 0.001115,
};

// ==== 수정: 1 외화당 KRW 환율 계산 (역수)
const dummyRates: Record<"USD" | "EUR" | "CAD" | "AUD" | "KRW", number> = {
  KRW: 1,
  USD: parseFloat((1 / rawQuotes.KRWUSD).toFixed(3)),
  EUR: parseFloat((1 / rawQuotes.KRWEUR).toFixed(3)),
  CAD: parseFloat((1 / rawQuotes.KRWCAD).toFixed(3)),
  AUD: parseFloat((1 / rawQuotes.KRWAUD).toFixed(3)),
};

// ==== 수정: 차트용 7일 라벨 생성
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

// ==== 수정: 차트용 더미 히스토리 (기존대로 남겨둠)
const dummyHistories: Record<
  "USD" | "EUR" | "CAD" | "AUD",
  { date: string; rate: number }[]
> = {
  USD: labels7.map((d) => ({ date: d, rate: dummyRates.USD })),
  EUR: labels7.map((d) => ({ date: d, rate: dummyRates.EUR })),
  CAD: labels7.map((d) => ({ date: d, rate: dummyRates.CAD })),
  AUD: labels7.map((d) => ({ date: d, rate: dummyRates.AUD })),
};

// 환율 계산 헬퍼
const getRate = (from: keyof typeof dummyRates, to: keyof typeof dummyRates) =>
  dummyRates[from] / dummyRates[to];

type Memo = {
  id: string;
  date: string;
  rate: number;
  fromCode: string;
  toCode: string;
  fromAmt: string;
  toAmt: string;
  text: string;
};

export default function CurrencyScreen() {
  // 기본 상태 선언
  const [modalVisible, setModalVisible] = useState(false);
  const [selecting, setSelecting] = useState<"from" | "to">("from");
  // ① dummyRates 키 목록 (['USD','EUR','CAD','AUD'])
  const supportedCodes = Object.keys(dummyRates) as (keyof typeof dummyRates)[];
  const supportedCurrencies = countries.filter((c) =>
    supportedCodes.includes(c.code as keyof typeof dummyRates)
  );

  // ③ 초기 상태도 이 배열 안에서 꺼내기
  const [fromCur, setFromCur] = useState(supportedCurrencies[0]);
  const [toCur, setToCur] = useState(supportedCurrencies[1]);

  const [fromAmt, setFromAmt] = useState("");
  const [toAmt, setToAmt] = useState("" as string);
  const [memoModalVisible, setMemoModalVisible] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);

  // ==== 수정: 초기 chartData, currentRate 설정 (fromCur ↔ toCur 기반)
  const initialFrom = parseCurrencyCode(fromCur.code)
    .code as keyof typeof dummyRates;
  const initialTo = parseCurrencyCode(toCur.code)
    .code as keyof typeof dummyRates;
  const initialRate = getRate(initialFrom, initialTo);

  const [chartData, setChartData] = useState({
    labels: labels7,
    datasets: [{ data: labels7.map(() => initialRate) }],
  });
  const [currentRate, setCurrentRate] = useState(initialRate);

  // 셀렉터 시트 열기
  const openSheet = (which: "from" | "to") => {
    setSelecting(which);
    setModalVisible(true);
  };

  // 통화 교환
  const swap = () => {
    setFromCur(toCur);
    setToCur(fromCur);
    setFromAmt(toAmt);
  };

  // ==== 수정: fromCur 또는 toCur 변경 시 차트+환율 동시 업데이트
  useEffect(() => {
    const f = parseCurrencyCode(fromCur.code).code as keyof typeof dummyRates;
    const t = parseCurrencyCode(toCur.code).code as keyof typeof dummyRates;
    const rate = getRate(f, t);
    setCurrentRate(rate);
    setChartData({
      labels: labels7,
      datasets: [{ data: labels7.map(() => rate) }],
    });
  }, [fromCur, toCur]);

  // 금액 변환 로직
  useEffect(() => {
    if (!fromAmt) {
      setToAmt("");
      return;
    }
    setToAmt((parseFloat(fromAmt) * currentRate).toFixed(2));
  }, [fromAmt, currentRate]);

  // AsyncStorage 기반 메모 로딩/저장 (기존 유지)
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("@currency_memos");
        if (stored) setMemos(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("@currency_memos", JSON.stringify(memos));
  }, [memos]);

  // 메모 저장/삭제 핸들러 (기존 유지)
  const saveMemo = () => {
    if (!memoText.trim()) return;
    const saved: Memo = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      rate: currentRate,
      fromCode: fromCur.code,
      toCode: toCur.code,
      fromAmt: fromAmt || "0.00",
      toAmt: toAmt || "0.00",
      text: memoText.trim(),
    };
    setMemos([saved, ...memos]);
    setMemoText("");
    setMemoModalVisible(false);
  };

  const deleteMemo = (id: string) => setMemos(memos.filter((m) => m.id !== id));

  // ─ render ─
  return (
    <SafeAreaView style={[styles.container, { flex: 1 }]}>
      {/* 카드 */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View>
          {/* 상단 카드 */}
          <View style={styles.card}>
            <Text style={styles.update}>
              Last Update:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

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
                    <Text>차트 데이터를 불러오는 중…</Text>
                  </View>
                );
              }
            })()}

            {/* 환율 텍스트 */}
            <Text style={styles.rateText}>
              {(() => {
                const { code: fC, unit: defaultFU } = parseCurrencyCode(
                  fromCur.code
                );
                const { code: tC, unit: defaultTU } = parseCurrencyCode(
                  toCur.code
                );
                // SPECIAL_UNIT 우선 적용
                const fU = SPECIAL_UNIT[fC] ?? defaultFU;
                const tU = SPECIAL_UNIT[tC] ?? defaultTU;

                // 왼쪽/오른쪽 단위 문자열 생성
                const leftUnit = fU > 1 ? `${fU} ${fC}` : `1 ${fC}`;
                const rightUnit = tU > 1 ? `${tU} ${tC}` : `${tC}`;

                return `${leftUnit} = ${currentRate.toFixed(4)} ${rightUnit}`;
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
      <FlatList
        data={memos}
        keyExtractor={(i) => i.id}
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
            <Text style={styles.memoText}>{item.text}</Text>
            <Text style={styles.memoRate}>
              {item.fromAmt} {item.fromCode} → {item.toAmt} {item.toCode}
              {/* (환율: 1 {item.fromCode} = {item.rate.toFixed(2)} {item.toCode}) */}
            </Text>
          </View>
        )}
      />

      {/* 통화선택 모달 */}
      {/* 통화선택 바텀시트 */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        {/* 반투명 백드롭 */}
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* 하단 바텀 시트 */}
        <View style={styles.sheetContainer}>
          {/* 헤더 */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select currency</Text>
          </View>

          {/* 리스트 */}
          <FlatList
            data={supportedCurrencies} // <-- 4개 통화만
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

// ─── 스타일 ───────────────────────────────────────────────────────────
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
    maxHeight: SCREEN_H * 0.6,
    backgroundColor: colors.WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 10,
  },
  sheetClose: { padding: 12, alignItems: "center" },
  closeText: { fontSize: 16, color: colors.GRAY_600 },
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
  sheetContainer: {
    backgroundColor: colors.WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
  },
  sheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: colors.GRAY_200,
    alignItems: "center",
  },
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
});

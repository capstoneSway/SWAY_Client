import { getHistory, getRate } from "@/app/api/rate";
import { fillMissingDates, parseCurrencyCode } from "@/app/api/utils";
import CurrencyListItem from "@/components/CurrencyList";
import { colors } from "@/constants/color";
import { currencies } from "@/constants/currency";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const MEMO_KEY = "@currency_memos";
const normalizeCode = (code: string) => code.split("(")[0];

// ─── 0. JPY/IDR 100단위 예외 설정 ───────────────────────────────────────────────
const SPECIAL_UNIT: Record<string, number> = {
  JPY: 100, // 100엔 단위
  IDR: 100, // 100루피아 단위
};

// ─── 메모 데이터 타입 정의 ────────────────────────────────────────────────────────
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

// ─── CurrencyScreen 컴포넌트 ───────────────────────────────────────────────────
export default function CurrencyScreen() {
  // 기본 상태 선언 ─
  const [modalVisible, setModalVisible] = useState(false);
  const [selecting, setSelecting] = useState<"from" | "to">("from");
  const [fromCur, setFromCur] = useState(currencies[0]);
  const [toCur, setToCur] = useState(currencies[1]);
  const [fromAmt, setFromAmt] = useState("");
  const [toAmt, setToAmt] = useState("");
  const [currentRate, setCurrentRate] = useState<number>(0);

  const [memoModalVisible, setMemoModalVisible] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);

  // 차트 데이터 ─
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [{ data: [] as number[] }],
  });

  // 유틸/핸들러 함수 ─
  const openSheet = (w: "from" | "to") => {
    setSelecting(w);
    setModalVisible(true);
  };
  const swap = () => {
    setFromCur(toCur);
    setToCur(fromCur);
    setFromAmt(toAmt);
    setToAmt(fromAmt);
  };
  const onSelectCurrency = (item: (typeof currencies)[0]) => {
    selecting === "from" ? setFromCur(item) : setToCur(item);
    setModalVisible(false);
  };
  const saveMemo = () => {
    if (!memoText.trim()) return;
    const rate = chartData.datasets[0].data.slice(-1)[0] ?? 0;
    setMemos([
      {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        rate,
        fromCode: fromCur.code,
        toCode: toCur.code,
        fromAmt: fromAmt || "0.00",
        toAmt: toAmt || "0.00",
        text: memoText,
      },
      ...memos,
    ]);
    setMemoText("");
    setMemoModalVisible(false);
  };
  const deleteMemo = (id: string) => setMemos(memos.filter((m) => m.id !== id));

  // ─ effects ─
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // ① 원시 코드와 단위를 분리
        const { code: baseCode, unit: baseUnit } = parseCurrencyCode(
          fromCur.code
        );
        const chartUnit = SPECIAL_UNIT[baseCode] ?? baseUnit;

        // API 호출 (today + history)
        const res = await getHistory(baseCode);
        const today = res.data.today;
        const history = res.data.history;

        const endDate = today.date; // "2025-05-14"
        const sd = new Date(endDate);
        sd.setDate(sd.getDate() - 6);
        const startDate = sd.toISOString().slice(0, 10); // "2025-05-08"

        // ② 누락일 채우기 (utils.fillMissingDates)
        const { dates, rates } = fillMissingDates(
          [...history, { date: today.date, rate: today.rate }],
          startDate,
          endDate
        );

        // ③ 차트용 데이터: 날짜 레이블, 환율 데이터
        setChartData({
          labels: dates.map((d) => {
            const [y, m, dd] = d.split("-");
            return `${+m}/${+dd}`;
          }),
          datasets: [
            {
              data: rates.map((r) => r * chartUnit),
            },
          ],
        });
      } catch (e) {
        console.warn("히스토리 조회 실패", e);
      }
    };

    loadHistory();
  }, [fromCur]);

  useEffect(() => {
    const loadRateOnly = async () => {
      try {
        // 코드와 단위를 분리
        const { code: fromCode, unit: defaultFromUnit } = parseCurrencyCode(
          fromCur.code
        );
        const { code: toCode, unit: defaultToUnit } = parseCurrencyCode(
          toCur.code
        );

        const fromUnit = SPECIAL_UNIT[fromCode] ?? defaultFromUnit;
        const toUnit = SPECIAL_UNIT[toCode] ?? defaultToUnit;

        // API 호출: 1 fromCode → KRW, 1 toCode → KRW
        const resFrom = await getRate(fromCode);
        const resTo = await getRate(toCode);
        const rateFrom = resFrom.data.today.rate;
        const rateTo = resTo.data.today.rate;

        // displayRate = (rateFrom * fromUnit) / (rateTo * toUnit)
        // ex) 100 JPY → KRW, 1 USD → KRW 등을 단위에 맞춰 계산
        const displayRate = (rateFrom * fromUnit) / (rateTo * toUnit);

        setCurrentRate(displayRate);
        // → fromAmt와 관계없이 항상 환율 텍스트를 업데이트
      } catch (e) {
        console.warn("환율 조회 실패", e);
      }
    };
    loadRateOnly();
  }, [fromCur, toCur]);

  // ─── ② 입력값(fromAmt) 변경 시 ToAmount 계산 ─────────────────────────────────────
  useEffect(() => {
    if (!fromAmt) {
      // 입력값이 없으면 toAmt는 빈 문자열로
      setToAmt("");
      return;
    }
    // currentRate가 준비된 이후에만 계산
    setToAmt((parseFloat(fromAmt) * currentRate).toFixed(2));
  }, [fromAmt, currentRate]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(MEMO_KEY);
        if (stored) setMemos(JSON.parse(stored));
      } catch (e) {
        console.warn("Failed to load memos:", e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(MEMO_KEY, JSON.stringify(memos));
      } catch (e) {
        console.warn("Failed to save memos:", e);
      }
    })();
  }, [memos]);

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
                  <Image source={fromCur.flag} style={styles.selectorFlag} />
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
                  <Image source={toCur.flag} style={styles.selectorFlag} />
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
              {item.fromAmt} {item.fromCode} → {item.toAmt} {item.toCode} (@
              {item.rate.toFixed(2)})
            </Text>
          </View>
        )}
      />

      {/* 통화선택 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Select currency</Text>
              <FlatList
                data={currencies}
                keyExtractor={(c) => c.code}
                renderItem={({ item }) => (
                  <CurrencyListItem
                    flag={item.flag}
                    code={item.code}
                    name={`${item.code} – ${item.name}`}
                    selected={
                      selecting === "from"
                        ? item.code === fromCur.code
                        : item.code === toCur.code
                    }
                    onPress={() => onSelectCurrency(item)}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.sheetClose}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
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
  selectorFlag: {
    width: 24,
    height: 24,
    marginRight: 6,
    resizeMode: "contain",
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
});

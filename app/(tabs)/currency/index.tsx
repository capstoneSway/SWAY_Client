import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import CountryListItem from "@/components/CountryList";
import { countries } from "@/constants/country";
import { colors } from "@/constants/color";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const MEMO_KEY = "@currency_memos";

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
  const [fromCur, setFromCur] = useState(countries[0]);
  const [toCur, setToCur] = useState(countries[1]);
  const [fromAmt, setFromAmt] = useState("");
  const [toAmt, setToAmt] = useState("");

  const [memoModalVisible, setMemoModalVisible] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);

  // 차트용 더미 ─
  const last7 = () => {
    const arr: string[] = [];
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      arr.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return arr;
  };
  const [chartData, setChartData] = useState({
    labels: last7(),
    datasets: [{ data: [190, 200, 180, 210, 180, 180, 190] }],
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
  const onSelectCurrency = (item: (typeof countries)[0]) => {
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
    const fetchTS = async () => {
      const end = new Date(),
        start = new Date(end);
      start.setDate(end.getDate() - 6);
      const fmt = (d: Date) => d.toISOString().split("T")[0];
      try {
        const res = await fetch(
          `https://api.exchangerate.host/timeseries?start_date=${fmt(
            start
          )}&end_date=${fmt(end)}&base=${fromCur.code}&symbols=${toCur.code}`
        );
        const json = await res.json();
        const days = Object.keys(json.rates).sort();
        setChartData({
          labels: days.map((d) => {
            const [, m, day] = d.split("-");
            return `${+m}/${+day}`;
          }),
          datasets: [{ data: days.map((d) => json.rates[d][toCur.code]) }],
        });
      } catch (e) {
        console.warn("timeseries fetch fail", e);
      }
    };
    fetchTS();
  }, [fromCur, toCur]);

  useEffect(() => {
    if (!fromAmt) return setToAmt("");
    const rate = chartData.datasets[0].data.slice(-1)[0] ?? 0;
    setToAmt((parseFloat(fromAmt) * rate).toFixed(2));
  }, [fromAmt, chartData]);

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

            <Text style={styles.rateText}>
              1 {fromCur.code} ={" "}
              {chartData.datasets[0].data.slice(-1)[0]?.toFixed(2) ?? "--"}{" "}
              {toCur.code}
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
                  <Text style={styles.selectorText}>
                    {fromCur.flag} {fromCur.code}
                  </Text>
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
                  <Text style={styles.selectorText}>
                    {toCur.flag} {toCur.code}
                  </Text>
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
                data={countries}
                keyExtractor={(c) => c.code}
                renderItem={({ item }) => (
                  <CountryListItem
                    flag={item.flag}
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

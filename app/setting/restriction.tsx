import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { colors } from "@/constants/color";
import { api } from "../api/axios";

type RestrictionItem = {
  date: string;
  reason: string;
  penalty: string;
  icon: string;
  color: string;
};

export default function RestrictionHistoryScreen() {
  const navigation = useNavigation();

  const [records, setRecords] = useState<RestrictionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestrictions = async () => {
      try {
        const res = await api.get("/mypage/settings/restrictions/");
        const mapped = res.data.map((item: any) => ({
          date: new Date(item.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          reason:
            item.reason === "profanity"
              ? "Inappropriate language"
              : item.reason,
          penalty:
            item.restriction_type_display +
            ` (${item.duration_days} day${item.duration_days > 1 ? "s" : ""})`,
          icon:
            item.restriction_type === "board_ban"
              ? "close-circle-outline"
              : "warning-outline",
          color:
            item.restriction_type === "board_ban"
              ? colors.RED_500
              : colors.YELLOW_500,
        }));
        setRecords(mapped);
      } catch (err) {
        console.error("제재 기록 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestrictions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restriction History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require("@/assets/images/restriction_warning.png")} // ← 예시 이미지 위치
          style={styles.warningImage}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>
          Your account has been restricted due to guideline violations.
        </Text>

        {records.map((record, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.date}>{record.date}</Text>
            <Text style={styles.reason}>{record.reason}</Text>
            <View style={styles.penaltyRow}>
              <Ionicons
                name={record.icon as any}
                size={16}
                color={record.color}
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: record.color }}>{record.penalty}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 60,
  },
  warningImage: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginVertical: 20,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
    color: "#444",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  date: { fontSize: 12, color: "#888" },
  reason: { fontSize: 14, fontWeight: "500", marginTop: 4 },
  penaltyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
});

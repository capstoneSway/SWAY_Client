import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

        const mapped = res.data.map((item: any) => {
          const createdAt = new Date(item.created_at);
          const expiredAt = new Date(createdAt);
          expiredAt.setDate(expiredAt.getDate() + item.duration_days);

          const now = new Date();
          const isExpired = now > expiredAt;

          return {
            date: createdAt.toLocaleDateString("en-US", {
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
              ` (${item.duration_days} day${
                item.duration_days > 1 ? "s" : ""
              })`,
            icon: isExpired
              ? "checkmark-circle-outline"
              : item.restriction_type === "board_ban"
              ? "close-circle-outline"
              : "warning-outline",
            color: isExpired
              ? "#28a745" // ✅ 초록색 (제재 만료됨)
              : item.restriction_type === "board_ban"
              ? colors.RED_500
              : colors.YELLOW_500,
          };
        });

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
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restriction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 고정 상단 안내 영역 */}
      <View style={styles.fixedTop}>
        <Image
          source={require("@/assets/images/restriction_warning.png")}
          style={styles.warningImage}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>
          Your account has been restricted due to guideline violations.
        </Text>
      </View>

      {/* 제재 기록 목록 (스크롤) */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.PURPLE_300}
            style={{ marginTop: 40 }}
          />
        ) : records.length === 0 ? (
          <Text style={styles.noRecords}>No restriction history found.</Text>
        ) : (
          records.map((record, index) => (
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
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
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
  fixedTop: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: colors.WHITE,
  },
  warningImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#444",
  },
  scrollArea: {
    flex: 1,
    backgroundColor: "#fbfbfb",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.BLACK,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  date: {
    fontSize: 12,
    color: colors.GRAY_600,
  },
  reason: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  penaltyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  noRecords: {
    textAlign: "center",
    color: colors.GRAY_700,
    fontSize: 14,
    marginTop: 40,
  },
});

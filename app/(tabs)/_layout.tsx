// app/(tabs)/_layout.tsx

import { Tabs } from "expo-router";
import React from "react";

import { colors } from "@/constants/color";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // 모든 탭에서 기본 헤더 제거
        tabBarActiveTintColor: colors.PURPLE_600,
        tabBarInactiveTintColor: colors.GRAY_500,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="board"
        options={{
          title: "Board",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="currency"
        options={{
          title: "Currency",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="currency-krw"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "My Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.WHITE,
    borderTopColor: colors.GRAY_200,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
});

import { Tabs } from "expo-router";
import React from "react";

import { colors } from "@/constants/color";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_BASE_HEIGHT = 50;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.PURPLE_600,
        tabBarInactiveTintColor: colors.GRAY_500,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: colors.WHITE,
          borderTopColor: colors.GRAY_200,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingHorizontal: 16,
          justifyContent: "center",
          height: TAB_BAR_BASE_HEIGHT + insets.bottom,
          bottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          headerTitleAlign: "center",
          headerLeft: () => (
            <Image
              source={require("@/assets/images/SWAY.png")}
              style={{
                width: 56,
                height: 16,
                marginLeft: 4,
                resizeMode: "contain",
              }}
            />
          ),
          headerRight: () => (
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.GRAY_700}
              style={{ marginRight: 16 }}
            />
          ),
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="board"
        options={{
          title: "Board",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="currency"
        options={{
          title: "Currency",
          headerShown: false,
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
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

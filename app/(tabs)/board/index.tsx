import { fetchBoardList } from "@/app/api/board";
import FeedItem from "@/components/FeedItem";
import { colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function BoardScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchBoardList();
        setPosts(data);
      } catch (error) {
        console.error("❌ 게시글 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.PURPLE_300} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <FeedItem post={item} />}
          ListEmptyComponent={
            <Text style={{ padding: 16 }}>게시글이 없습니다.</Text>
          }
        />
      )}

      <Pressable
        style={styles.writeButton}
        onPress={() => router.push("/post/newpost")}
      >
        <Ionicons name="pencil" size={32} color={colors.WHITE} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  writeButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: colors.PURPLE_300,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.5,
    elevation: 2,
    zIndex: 10,
  },
});

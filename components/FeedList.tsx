import { fetchBoardList } from "@/app/api/board";
import { colors } from "@/constants/color";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import FeedItem from "./FeedItem";

export default function FeedList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchBoardList();
      setPosts(data);
    };
    load();
  }, []);

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <FeedItem post={item} />}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.contentContainer}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 12,
    backgroundColor: colors.WHITE,
  },
});

import { fetchBoardList } from "@/app/api/board";
import { colors } from "@/constants/color";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
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
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <FeedItem post={item} />}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  contentContainer: {
    paddingBottom: 12,
  },
});

import { colors } from "@/constants/color";
import React from "react";
import { StyleSheet, FlatList} from "react-native";
import FeedItem from "./FeedItem";


const dummyData = [
  {
    id: 1,
    userId: 1,
    title: "Fair rent fair near HUFS?",
    description:
      "I rent a studio through a real estate agent, but I'm not sure the rent fee is fair enough. How much do you pay?",
    createdAt: "2025-05-10",
    author: {
      id: 1,
      nickname: "Fàn Bīngbīng",
      imageUri: "",
    },
    imageUris: [],
    likes: [],
    commentCount: 1,
    comments: [],
  },
  {
    id: 2,
    userId: 1,
    title: "Fair rent fair near HUFS?",
    description:
      "I rent a studio through a real estate agent, but I'm not sure the rent fee is fair enough. How much do you pay?",
    createdAt: "2025-05-11",
    author: {
      id: 1,
      nickname: "Fàn Bīngbīng",
      imageUri: "",
    },
    imageUris: [],
    likes: [],
    commentCount: 1,
    comments: [],
  },
];

function FeedList() {
  return (
    <FlatList
      data={dummyData}
      renderItem={( {item} ) => <FeedItem post={item} />}
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

export default FeedList;

import { colors } from "@/constants/color";
import Post from "@/type/types";
import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react"; // useState 추가
import { Pressable, StyleSheet, Text, View } from "react-native";
import Profile from "./Profile";

interface FeedItemProps {
  post: Post;
  isDetail?: boolean;
}

const FeedItem = ({ post, isDetail = false }: FeedItemProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const ContainerComponent = isDetail ? View : Pressable;

  const handlePressFeed = () => {
    console.log("Feed item pressed!");
  };

  return (
    <ContainerComponent style={styles.container} onPress={handlePressFeed}>
      <View style={styles.contentContainer}>
        <Profile
          imageUri={post.author.imageUri}
          nickname={post.author.nickname}
          createdAt={post.createdAt}
        />
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>
      <View style={styles.menuContainer}>
        <Pressable style={styles.menu} onPress={() => setIsLiked(!isLiked)}>
          <AntDesign
            name={isLiked ? "heart" : "hearto"}
            size={20}
            color={isLiked ? colors.RED_500 : colors.BLACK}
          />
          <Text style={isLiked ? styles.activeMenuText : styles.menuText}>
            {isLiked ? post.likes.length + 1 : post.likes.length}
          </Text>
        </Pressable>

        <Pressable style={styles.menu}>
          <FontAwesome6 name="comment" size={20} color={colors.BLACK} />
          <Text style={styles.menuText}>{post.comments}</Text>
        </Pressable>

        <Pressable
          style={styles.menu}
          onPress={() => setIsBookmarked(!isBookmarked)}
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isBookmarked ? colors.PURPLE_300 : colors.BLACK}
          />
          <Text style={styles.menuText}></Text>
        </Pressable>
      </View>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 12,
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopColor: colors.GRAY_300,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  title: {
    fontSize: 16,
    color: colors.BLACK,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.BLACK,
    marginBottom: 14,
  },
  menu: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    width: "33%",
    marginHorizontal: 4,
  },
  menuText: {
    fontSize: 14,
    color: colors.GRAY_700,
  },
  activeMenuText: {
    fontWeight: "600",
    color: colors.RED_500,
  },
});

export default FeedItem;

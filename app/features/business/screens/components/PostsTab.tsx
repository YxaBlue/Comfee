// components/PostsTab.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useCafePosts } from "../../../../../hooks/useCafePosts";

const CAFE_ID = 4; // same hardcoded ID you're using elsewhere

export default function PostsTab() {
  const { posts, loading, error, likePost } = useCafePosts(CAFE_ID);
  const [modalVisible, setModalVisible] = useState(false);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8C6D4F" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Failed to load posts.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {posts.length === 0 && (
          <Text style={styles.text}>No posts yet. Add your first one!</Text>
        )}

        {posts.map((post) => (
          <View key={post.id} style={styles.postCont}>
            <View style={styles.postDetails}>
              <Text style={styles.postDate}>
                {new Date(post.created_at).toLocaleString()}
              </Text>
              <Text style={styles.postCaption}>{post.caption}</Text>
            </View>

            {post.photo_url && (
              <Image
                source={{ uri: post.photo_url }}
                style={styles.postPhoto}
                resizeMode="cover"
              />
            )}

            <TouchableOpacity
              style={styles.postLike}
              onPress={() => likePost(post.id, post.likes)}
            >
              <MaterialIcons
                name="thumb-up-off-alt"
                size={20}
                color="#8C6D4F"
                style={{ marginLeft: 15 }}
              />
              <Text style={{ marginLeft: 5, color: "#8C6D4F" }}>
                {post.likes}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: {
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
    fontSize: 14,
  },
  postCont: {
    width: "100%",
    backgroundColor: "#FFFAF3",
    marginTop: 10,
    borderRadius: 8,
    paddingBottom: 40, // space for the like button
  },
  postDetails: {
    flexDirection: "column",
    padding: 10,
    marginLeft: 15,
    marginTop: 10,
  },
  postDate: {
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
    fontSize: 12,
    marginBottom: 5,
  },
  postCaption: {
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
    fontSize: 14,
    paddingRight: 10,
  },
  postPhoto: {
    width: "90%",
    height: 115,
    marginTop: 10,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 5,
  },
  postLike: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});

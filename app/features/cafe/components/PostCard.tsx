import {
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

type Post = {
  id: string;
  caption: string;
  dateCreated: string;
  imageURL: string[];
  likes: number;
};

export function PostCard({ post }: { post: Post }) {
  const imageCount = post.imageURL.length;
  return (
    <View style={postCardStyles.container}>
      {imageCount === 1 && (
        <Image
          source={{ uri: post.imageURL[0] }}
          style={postCardStyles.imageSingle}
          resizeMode="cover"
        />
      )}
      {imageCount === 2 && (
        <View style={postCardStyles.imageRow}>
          {post.imageURL.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              style={postCardStyles.imageHalf}
              resizeMode="cover"
            />
          ))}
        </View>
      )}
      {imageCount >= 3 && (
        <View style={postCardStyles.imageGrid3}>
          <Image
            source={{ uri: post.imageURL[0] }}
            style={postCardStyles.imageGrid3Main}
            resizeMode="cover"
          />
          <View style={postCardStyles.imageGrid3Sub}>
            <Image
              source={{ uri: post.imageURL[1] }}
              style={postCardStyles.imageGrid3SubItem}
              resizeMode="cover"
            />
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: post.imageURL[2] }}
                style={[
                  postCardStyles.imageGrid3SubItem,
                  imageCount > 3 && { opacity: 0.4 },
                ]}
                resizeMode="cover"
              />
              {imageCount > 3 && (
                <View style={postCardStyles.moreOverlay}>
                  <Text style={postCardStyles.moreText}>+{imageCount - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
      <View style={postCardStyles.body}>
        <Text style={postCardStyles.caption}>{post.caption}</Text>
        <View style={postCardStyles.footer}>
          <Text style={postCardStyles.date}>
            {new Date(post.dateCreated).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <View style={postCardStyles.likesRow}>
            <MaterialIcons name="thumb-up-off-alt" size={16} color="#8C6D4F" />
            <Text style={postCardStyles.likesCount}>{post.likes}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}


const postCardStyles = StyleSheet.create({
  container: {
    backgroundColor: "#E6D6BE",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  imageSingle: { width: "100%", height: 200, backgroundColor: "#C8A97A" },
  imageRow: { flexDirection: "row" },
  imageHalf: { flex: 1, height: 160, backgroundColor: "#C8A97A" },
  imageGrid3: { flexDirection: "row", height: 180 },
  imageGrid3Main: { flex: 2, height: "100%", backgroundColor: "#C8A97A" },
  imageGrid3Sub: { flex: 1, flexDirection: "column" },
  imageGrid3SubItem: { flex: 1, backgroundColor: "#BFA080" },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  body: { padding: 10 },
  caption: { fontSize: 13, color: "#4A3220", lineHeight: 19, marginBottom: 8 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 11, color: "#8C6D4F" },
  likesRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  likesCount: { fontSize: 12, color: "#8C6D4F" },
});
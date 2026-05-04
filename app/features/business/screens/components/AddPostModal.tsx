// components/AddPostModal.tsx
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    caption: string,
    imageUri?: string,
  ) => Promise<{ error: string | null }>;
};

export default function AddPostModal({ visible, onClose, onSubmit }: Props) {
  const [caption, setCaption] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      Alert.alert("Caption required", "Please write something for your post.");
      return;
    }
    setSubmitting(true);
    const { error } = await onSubmit(caption.trim(), imageUri ?? undefined);
    setSubmitting(false);

    if (error) {
      Alert.alert("Failed to post", error);
    } else {
      setCaption("");
      setImageUri(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>New Post</Text>

          <TextInput
            style={styles.input}
            placeholder="Write a caption..."
            placeholderTextColor="#A08060"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={300}
          />

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
              <>
                <MaterialIcons name="add-a-photo" size={24} color="#8C6D4F" />
                <Text style={styles.imagePickerText}>Add Photo (optional)</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.postBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.postText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFAF3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E9D0A2",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
    fontSize: 14,
    textAlignVertical: "top",
  },
  imagePicker: {
    height: 100,
    borderRadius: 8,
    backgroundColor: "#FAF2E6",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
  },
  imagePickerText: {
    color: "#8C6D4F",
    fontSize: 13,
    fontFamily: "SourceSerifPro-Regular",
  },
  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9D0A2",
    alignItems: "center",
  },
  cancelText: {
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
  postBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#8C6D4F",
    alignItems: "center",
  },
  postText: {
    color: "#fff",
    fontFamily: "SourceSerifPro-Regular",
    fontWeight: "600",
  },
});

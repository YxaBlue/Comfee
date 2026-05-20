import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Page2MenuProps {
  menuUris: string[];
  onPickMenuImages: () => void;
  onRemoveMenuImage: (index: number) => void;
}

const windowWidth = Dimensions.get("window").width - 32;

export default function Page2Menu({
  menuUris,
  onPickMenuImages,
  onRemoveMenuImage,
}: Page2MenuProps) {
  const [menuPreviewVisible, setMenuPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewCarouselRef = useRef<ScrollView | null>(null);
  const modalCarouselRef = useRef<ScrollView | null>(null);

  const openPreviewAt = (index: number) => {
    setPreviewIndex(index);
    setMenuPreviewVisible(true);
  };

  const closePreview = () => setMenuPreviewVisible(false);

  useEffect(() => {
    if (menuPreviewVisible && modalCarouselRef.current) {
      setTimeout(() => {
        try {
          modalCarouselRef.current?.scrollTo({
            x: previewIndex * windowWidth,
            animated: false,
          } as any);
        } catch {
          // ignore
        }
      }, 50);
    }
  }, [menuPreviewVisible, previewIndex]);

  return (
    <>
      <Text
        style={{
          fontSize: 14,
          color: "#A26F3B",
          fontFamily: "SourceSerifPro-Bold",
          marginBottom: 8,
          marginTop: 8,
        }}
      >
        Menu Images
      </Text>

      {menuUris.length > 0 ? (
        <>
          <View
            style={{
              height: 220,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "#000",
            }}
          >
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={(r) => {
                previewCarouselRef.current = r;
              }}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / windowWidth,
                );
                setPreviewIndex(idx);
              }}
            >
              {menuUris.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.95}
                  onPress={() => openPreviewAt(idx)}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: windowWidth, height: 220 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View
              style={{
                position: "absolute",
                bottom: 8,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF7ED" }}>
                {previewIndex + 1} / {menuUris.length}
              </Text>
            </View>
          </View>

          <Modal
            visible={menuPreviewVisible}
            animationType="slide"
            onRequestClose={closePreview}
          >
            <View style={{ flex: 1, backgroundColor: "#000" }}>
              <View
                style={{
                  position: "absolute",
                  top: 40,
                  right: 16,
                  zIndex: 10,
                }}
              >
                <TouchableOpacity onPress={closePreview}>
                  <MaterialIcons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                ref={(r) => {
                  modalCarouselRef.current = r;
                }}
                contentOffset={{ x: previewIndex * windowWidth, y: 0 }}
              >
                {menuUris.map((uri, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: windowWidth,
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: windowWidth, height: "80%" }}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          </Modal>
        </>
      ) : (
        <View
          style={{
            height: 220,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#FFF7ED",
            borderWidth: 1,
            borderColor: "#E9D0A2",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#8C6D4F" }}>No menu images yet</Text>
        </View>
      )}

      <View style={{ height: 12 }} />
      <Text style={{ color: "#6B4F2E", marginBottom: 8 }}>
        Upload up to 5 images to display as your menu.
      </Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const uri = menuUris[idx];
          return (
            <View
              key={idx}
              style={{
                width: 90,
                height: 90,
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: "#FFF7ED",
                borderWidth: 1,
                borderColor: "#E9D0A2",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {uri ? (
                <>
                  <TouchableOpacity
                    onPress={() => openPreviewAt(idx)}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onRemoveMenuImage(idx)}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "#C0392B",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={onPickMenuImages}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons
                    name="add-photo-alternate"
                    size={28}
                    color="#B08354"
                  />
                  <Text style={{ fontSize: 11, color: "#8C6D4F" }}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </>
  );
}
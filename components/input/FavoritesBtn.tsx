import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Animated,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

import { supabase } from "@/app/shared/lib/supabaseClient";
import { MaterialIcons } from "@expo/vector-icons";


export function FavoriteButton({
  cafeId,
  userId,
  onToggle,
}: {
  cafeId: string;
  userId: string;
  onToggle?: (isFavorited: boolean) => void;
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!userId || !cafeId) return;
    (async () => {
      try {
        const { data } = await supabase
          .from("favorite_cafes")
          .select("id")
          .eq("user_id", userId)
          .eq("cafe_id", Number(cafeId))
          .maybeSingle();
        if (data) {
          setIsFavorited(true);
          setFavoriteId(data.id);
        }
      } catch (err) {
        console.error("Failed to check favorite status:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, cafeId]);

  const handleToggle = async () => {
    if (toggling || !userId) return;
    setToggling(true);

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true, speed: 50 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();

    const wasLiked = isFavorited;
    setIsFavorited(!wasLiked);
    onToggle?.(!wasLiked);

    try {
      if (wasLiked && favoriteId) {
        const { error } = await supabase
          .from("favorite_cafes")
          .delete()
          .eq("id", favoriteId);
        if (error) throw error;
        setFavoriteId(null);
      } else {
        const { data, error } = await supabase
          .from("favorite_cafes")
          .insert({ user_id: userId, cafe_id: Number(cafeId) })
          .select("id")
          .single();
        if (error) throw error;
        setFavoriteId(data.id);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setIsFavorited(wasLiked);
      onToggle?.(wasLiked);
    } finally {
      setToggling(false);
    }
  };

  if (loading) return null;

  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={toggling || !userId}
      activeOpacity={0.8}
      style={favStyles.btn}
      accessibilityRole="button"
      accessibilityLabel={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <MaterialIcons
          name={isFavorited ? "favorite" : "favorite-border"}
          size={18}
          color={isFavorited ? "#C0392B" : "#8C6D4F"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}


const favStyles = StyleSheet.create({
  btn: { padding: 4 },
});

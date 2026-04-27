// import { useEffect, useState } from "react";

// import { getProfile } from "@/app/features/profile/services/profileService";
// import { supabase } from "@/app/shared/lib/supabaseClient";
// import TopBar from "@/components/TopBar";
// import { MaterialIcons } from "@expo/vector-icons";
// //import { useRouter } from "expo-router";
// import { RootStackParamList } from "@/App";
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// import {
//   FlatList,
//   Image,
//   ImageBackground,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// type NavProps = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

// export default function CafeCard() {
//   const navigation = useNavigation<NavProps>();
//   const [search, setSearch] = useState("");
//   const [profile, setProfile] = useState<any>(null);

//   const filter = [
//     "Near Me",
//     "Wifi",
//     "Ambiance",
//     "Quality",
//     "Service",
//     "Affordable",
//   ];

//   const cafes = [
//     {
//       id: "1",
//       name: "Ilya Rozy Cafe",
//       location: "Mactan, Lapu-Lapu City",
//       rating: 4.5,
//     },
//     {
//       id: "2",
//       name: "Hollander Cafe",
//       location: "Mactan, Lapu-Lapu City",
//       rating: 4.2,
//     },
//     {
//       id: "3",
//       name: "Ilya Rozy Cafe",
//       location: "Mactan, Lapu-Lapu City",
//       rating: 4.8,
//     },
//     {
//       id: "4",
//       name: "Ilya Rozy Cafe",
//       location: "Mactan, Lapu-Lapu City",
//       rating: 4.6,
//     },
//     {
//       id: "5",
//       name: "Ilya Rozy Cafe",
//       location: "Mactan, Lapu-Lapu City",
//       rating: 4.7,
//     },
//   ];

//   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const {
//           data: { session },
//         } = await supabase.auth.getSession();

//         if (!session?.user) return;

//         const data = await getProfile(session.user.id);
//         setProfile(data);
//       } catch (error) {
//         console.error("Failed to load dashboard profile:", error);
//       }
//     };

//     fetchProfile();
//   }, []);

//   return (
//     <ImageBackground
//       source={require("../../../../assets/images/bg1.png")}
//       style={styles.background}
//       resizeMode="cover"
//     >
//       <TopBar navigation={navigation} profilePicture={profile?.profile_picture} />
//       <View style={styles.rectangle3}>
//         <Text style={styles.locText1}>Location</Text>
//         <Text style={styles.locText2}>Montreal, Canada </Text>
//         <MaterialIcons
//           name="keyboard-arrow-down"
//           size={20}
//           color="#4B2C11"
//           style={{ marginLeft: 125, marginTop: 4 }}
//         />
//       </View>

//       <View style={[styles.searchBar, styles.androidShadow]}>
//         <MaterialIcons name="search" size={24} color="#C8AA7A" />

//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search cafe"
//           placeholderTextColor="#C8AA7A"
//           value={search}
//           onChangeText={setSearch}
//         />

//         <Pressable
//           onPress={() => navigation.navigate("Filter" as never)}
//           hitSlop={10}
//           style={styles.filterTrigger}
//         >
//           <MaterialIcons name="tune" size={22} color="#C8AA7A" />
//         </Pressable>
//       </View>

//       <View style={styles.filterHolder}>
//         <FlatList
//           data={filter}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={({ item, index }) => (
//             <Pressable
//               onPress={() => setSelectedIndex(index)}
//               style={[
//                 styles.filter,
//                 {
//                   backgroundColor:
//                     selectedIndex === index ? "#A97C4E" : "#E9D0A2",
//                 },
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.filterText,
//                   {
//                     color: selectedIndex === index ? "#FFFAF3" : "#A97C4E",
//                   },
//                 ]}
//               >
//                 {item}
//               </Text>
//             </Pressable>
//           )}
//         />
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{ paddingBottom: 20 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.promo}>
//           <Text style={styles.promoText}>Today’s Special Promo</Text>
//         </View>

//         <Text style={styles.labelText}>Featured Cafés</Text>

//         <View style={{ marginTop: 3 }}>
//           <FlatList
//             data={cafes}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <View style={styles.cafeHolder}>
//                 {/* Empty space will push the bottom row down */}
//                 <View style={{ flex: 1 }} />

//                 {/* Bottom row */}
//                 <View style={styles.cafeText}>
//                   <View>
//                     <Text style={styles.cafeName}>{item.name}</Text>
//                     <View style={styles.locationRow}>
//                       <MaterialIcons
//                         name="location-on"
//                         size={7}
//                         color="#E9D0A2"
//                       />
//                       <Text style={styles.location}>{item.location}</Text>
//                     </View>
//                   </View>
//                   <Text style={styles.rating}> {item.rating}</Text>
//                 </View>
//               </View>
//             )}
//           />
//         </View>
//         <Text style={styles.labelText}>Discover More</Text>

//         <View style={{ marginTop: 3 }}>
//           <FlatList
//             data={cafes}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <View style={styles.cafeHolder}>
//                 {/* Empty space will push the bottom row down */}
//                 <View style={{ flex: 1 }} />

//                 {/* Bottom row */}
//                 <View style={styles.cafeText}>
//                   <View>
//                     <Text style={styles.cafeName}>{item.name}</Text>
//                     <View style={styles.locationRow}>
//                       <MaterialIcons
//                         name="location-on"
//                         size={7}
//                         color="#E9D0A2"
//                       />
//                       <Text style={styles.location}>{item.location}</Text>
//                     </View>
//                   </View>
//                   <Text style={styles.rating}> {item.rating}</Text>
//                 </View>
//               </View>
//             )}
//           />
//         </View>
//       </ScrollView>
//     </ImageBackground>
//   );
// }

// //styles - format
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F3E6CF",
//   },

//   background: {
//     flex: 1,
//     width: "100%",
//     height: "100%",
//   },

//   rectangle3: {
//     backgroundColor: "#E9D6B9",
//     borderRadius: 0,
//     padding: 0,
//     marginBottom: 20,
//     width: "100%",
//     height: 88,
//   },

//   locText1: {
//     top: "25%",
//     fontSize: 9,
//     color: "#4B2C11",
//     marginLeft: 25,
//   },

//   locText2: {
//     top: "25%",
//     fontSize: 12,
//     color: "#4B2C11",
//     marginLeft: 25,
//     fontWeight: "bold",
//   },

//   searchBar: {
//     position: "absolute",
//     backgroundColor: "#FFFAF3",
//     borderRadius: 15,
//     top: 135,
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "center",
//     width: "75%",
//     height: 46,
//     shadowColor: "#E9D6B9",
//     shadowOffset: { width: 0, height: 4 },
//     elevation: 20,
//     paddingHorizontal: 10,
//   },

//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: "#4B2C11",
//     marginLeft: 8,
//   },

//   filterTrigger: {
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 4,
//   },

//   filter: {
//     backgroundColor: "#E9D6B9",
//     borderRadius: 8,
//     paddingHorizontal: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 10,
//     height: 31,
//   },

//   filterHolder: {
//     marginTop: 15,
//     paddingLeft: 10,
//   },

//   filterText: {
//     color: "#C8AA7A",
//     fontWeight: "500",
//     fontSize: 11,
//   },

//   promo: {
//     width: "90%",
//     height: 131,
//     backgroundColor: "#966A0C",
//     borderRadius: 8,
//     marginVertical: 8,
//     alignSelf: "center",
//     marginTop: 15,
//     position: "relative", // make container relative
//     padding: 10,
//   },

//   promoText: {
//     position: "absolute",
//     color: "#E9D6B9",
//     fontWeight: "bold",
//     bottom: 10,
//     fontSize: 15,
//     left: 15,
//   },

//   labelText: {
//     color: "#4B2C11",
//     fontWeight: "bold",
//     fontSize: 18,
//     marginLeft: 15,
//     top: 5,
//   },

//   cafeHolder: {
//     width: 143,
//     height: 136,
//     backgroundColor: "#FFFAF3",
//     borderRadius: 10,
//     padding: 10,
//     margin: 10,
//     alignItems: "flex-start",
//     shadowColor: "#A97C4E",
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 4,
//     elevation: 20,
//   },

//   cafeText: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-end",
//     width: "100%",
//   },

//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center", // vertically centers icon & text
//     marginTop: 2, // optional spacing from name
//   },

//   cafeName: {
//     fontSize: 11,
//     color: "#4B2C11",
//     fontWeight: 600,
//     marginBottom: 0,
//   },

//   location: {
//     fontSize: 7,
//     color: "#E9D0A2",
//     fontWeight: "400",
//     marginBottom: 0,
//     marginLeft: 2,
//   },

//   rating: {
//     fontSize: 12,
//     color: "#4B2C11",
//     marginBottom: 0,
//     fontWeight: 400,
//   },
// });

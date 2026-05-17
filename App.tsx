import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { useEffect, useRef } from "react";

import { supabase } from "@/app/shared/lib/supabaseClient";
import CreateAccountScreen from "./app/features/auth/screens/CreateAccount";
import ForgotPasswordScreen from "./app/features/auth/screens/ForgotPassword";
import LoginScreen from "./app/features/auth/screens/Login";
import ResetPasswordScreen from "./app/features/auth/screens/ResetPassword";
import BusinessNavigation from "./app/features/business/screens/BusinessNavigation";
import BusinessProfile from "./app/features/business/screens/BusinessProfile";
import OwnerVerificationScreen from "./app/features/business/screens/OwnerVerification";
import CafeProfileScreen from "./app/features/cafe/screens/cafeProfile";
import Dashboard from "./app/features/cafe/screens/Dashboard";
import FilteredCafes from "./app/features/cafe/screens/DashboardFilter";
import FilterScreen from "./app/features/cafe/screens/Filter";
import SearchScreen from "./app/features/cafe/screens/Search";
import WriteReviewFEScreen from "./app/features/cafe/screens/write-review-FE";
import { FilterSelectionState } from "./app/features/cafe/services/filtering";
import ProfileScreen from "./app/features/profile/screens/Profile";
import ChangePasswordScreen from "./app/features/settings/screens/ChangePassword";
import SettingsScreen from "./app/features/settings/screens/Settings";
import SubmitCafeScreen from "./app/features/settings/screens/SubmitCafe";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

console.log(Linking.createURL("/"));

export type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Profile: { userId?: string } | undefined;
  Settings: undefined;
  ChangePassword: undefined;
  SubmitCafe: undefined;
  OwnerVerification: undefined;
  EditProfile: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Dashboard: undefined;
  Filter:
    | {
        query?: string;
        city?: string;
        selectedFilters?: FilterSelectionState;
        userCoords?: { latitude: number; longitude: number };
      }
    | undefined;
  Search: {
    query?: string;
    city?: string;
    selectedFilters?: FilterSelectionState;
    userCoords?: { latitude: number; longitude: number };
  };
  FilteredCafes: { filterType: string };
  BusinessNavigation: undefined;
  BusinessProfile: { cafeId?: string } | undefined;
  CafeProfile: { cafeId: string };
  WriteReviewFE:
    | {
        cafeName?: string;
        cafeId: number;
        initialRating?: number;
        reviewId?: number;
        username?: string;
        avatarURL?: string;
        onReviewPosted?: () => void;
      }
    | undefined;
};

const linking = {
  prefixes: [
    "comfeeproject://",
    "exp+ComfeeProject://",
    Linking.createURL("/"),
  ],
  config: {
    screens: {
      ResetPassword: "reset-password",
      Login: "login",
      CreateAccount: "create-account",
      ForgotPassword: "forgot-password",
    },
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function isRecoveryUrl(url: string): boolean {
  try {
    const fullUrl = decodeURIComponent(url);
    const hash = url.split("#")[1] ?? "";
    const hashParams = new URLSearchParams(hash);
    if (hashParams.get("type") === "recovery") return true;

    const query = url.split("?")[1]?.split("#")[0] ?? "";
    const queryParams = new URLSearchParams(query);
    if (queryParams.get("type") === "recovery") return true;
  } catch {
    // ignore malformed URLs
  }
  return false;
}

export default function App() {
  const [fontsLoaded, error] = useFonts({
    "SourceSerifPro-Regular": require("./assets/fonts/SourceSerifPro-Regular.otf"),
    "SourceSerifPro-Bold": require("./assets/fonts/SourceSerifPro-Bold.otf"),
    "SourceSerifPro-Semibold": require("./assets/fonts/SourceSerifPro-Semibold.otf"),
  });

  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  const isRecoveryFlow = useRef(false);

  // Hide splash screen once fonts are ready
  useEffect(() => {
    if (fontsLoaded || error) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  useEffect(() => {
    let isMounted = true;
    let initialRouteSynced = false;

    const bootstrapRecoveryFromUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && isRecoveryUrl(initialUrl)) {
          isRecoveryFlow.current = true;
        }
      } catch {
        // not critical
      }
    };

    const syncInitialRoute = async () => {
      await bootstrapRecoveryFromUrl();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted || !navigationRef.current) return;
      if (initialRouteSynced) return;
      initialRouteSynced = true;

      if (isRecoveryFlow.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: "ResetPassword" }],
        });
        return;
      }

      navigationRef.current.reset({
        index: 0,
        routes: [{ name: session ? "Dashboard" : "Login" }],
      });
    };

    syncInitialRoute();

    const linkingSub = Linking.addEventListener("url", ({ url }) => {
      console.log("incoming URL:", url);
      if (isRecoveryUrl(url)) {
        isRecoveryFlow.current = true;
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "ResetPassword" }],
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === "INITIAL_SESSION") return;

      const currentRoute = navigationRef.current?.getCurrentRoute()?.name;

      if (event === "PASSWORD_RECOVERY") {
        isRecoveryFlow.current = true;
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "ResetPassword" }],
        });
        return;
      }

      if (event === "SIGNED_IN" && session) {
        if (isRecoveryFlow.current) return;

        const url = await Linking.getInitialURL();

        if (url && isRecoveryUrl(url)) {
          isRecoveryFlow.current = true;
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: "ResetPassword" }],
          });
          return;
        }
        const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
        if (currentRoute === "ResetPassword") return;

        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        });
        return;
      }

      if (event === "USER_UPDATED") {
        isRecoveryFlow.current = false;
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
        return;
      }

      if (event === "SIGNED_OUT") {
        isRecoveryFlow.current = false;
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    });

    return () => {
      isMounted = false;
      linkingSub.remove();
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded && !error) return null;

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="SubmitCafe" component={SubmitCafeScreen} />
        <Stack.Screen
          name="OwnerVerification"
          component={OwnerVerificationScreen}
        />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Filter" component={FilterScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="FilteredCafes" component={FilteredCafes} />
        <Stack.Screen
          name="BusinessNavigation"
          component={BusinessNavigation}
        />
        <Stack.Screen name="BusinessProfile" component={BusinessProfile} />
        <Stack.Screen name="CafeProfile" component={CafeProfileScreen} />
        <Stack.Screen name="WriteReviewFE" component={WriteReviewFEScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useRef } from "react";

import { supabase } from "@/app/shared/lib/supabaseClient";
import CreateAccountScreen from "./app/features/auth/screens/CreateAccount";
import ForgotPasswordScreen from "./app/features/auth/screens/ForgotPassword";
import LoginScreen from "./app/features/auth/screens/Login";
import ResetPasswordScreen from "./app/features/auth/screens/ResetPassword";
import BusinessProfile from "./app/features/business/screens/BusinessProfile";
import CafeCard from "./app/features/cafe/screens/CafeCard";
import FilteredCafes from "./app/features/cafe/screens/DashboardFilter";
import FilterScreen from "./app/features/cafe/screens/Filter";
import SearchScreen from "./app/features/cafe/screens/Search";
import ProfileScreen from "./app/features/profile/screens/Profile";
import ChangePasswordScreen from "./app/features/settings/screens/ChangePassword";
import SettingsScreen from "./app/features/settings/screens/Settings";

export type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Profile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  EditProfile: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Dashboard: undefined;
  Filter: undefined;
  Search: { query: string };
  FilteredCafes: { filterType: string };
  ProfileBusi: undefined;
};

const linking = {
  prefixes: ["yourapp://", "exp://"],
  config: {
    screens: {
      ResetPassword: "reset-password",
      Login: "login",
      CreateAccount: "create-account",
      ForgotPassword: "forgot-password",
    },
  },
};

const PUBLIC_ROUTES: (keyof RootStackParamList)[] = [
  "Login",
  "CreateAccount",
  "ForgotPassword",
  "ResetPassword",
];

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    let isMounted = true;

    const syncInitialRoute = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted || !navigationRef.current) return;

      navigationRef.current.reset({
        index: 0,
        routes: [{ name: session ? "Dashboard" : "Login" }],
      });
    };

    syncInitialRoute();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        });
        return;
      }

      if (event !== "SIGNED_OUT" && session) return;

      const currentRoute = navigationRef.current?.getCurrentRoute()?.name as
        | keyof RootStackParamList
        | undefined;

      if (currentRoute && PUBLIC_ROUTES.includes(currentRoute)) return;

      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Dashboard" component={CafeCard} />
        <Stack.Screen name="Filter" component={FilterScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="FilteredCafes" component={FilteredCafes} />
        <Stack.Screen name="ProfileBusi" component={BusinessProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

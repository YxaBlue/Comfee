import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CreateAccountScreen from "./app/features/auth/screens/CreateAccount";
import ForgotPasswordScreen from "./app/features/auth/screens/ForgotPassword";
import LoginScreen from "./app/features/auth/screens/Login";
import ResetPasswordScreen from "./app/features/auth/screens/ResetPassword";
import ProfileScreen from "./app/features/profile/screens/Profile";
import SettingsScreen from "./app/features/profile/screens/Settings-FE";

export type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

const linking = {
  prefixes: ["yourapp://", "exp://"],
  // config: {
  //   screens: {
  //     ResetPassword: "reset-password",
  //     Login: "login",
  //     CreateAccount: "create-account",
  //     ForgotPassword: "forgot-password",
  //   },
  // },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

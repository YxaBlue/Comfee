import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CreateAcc from "./app/screens/createAcc-FE";
import ForgotPasswordPage from "./app/screens/forgotPassword-FE";
import LoginScreen from "./app/screens/login-FE";
import ProfileScreen from "./app/screens/profile-FE";
import ResetPasswordPage from "./app/screens/resetPassword-FE";

export type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAcc} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordPage} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

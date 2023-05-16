import { useContext } from "react";
import { RootSiblingParent } from "react-native-root-siblings";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

const Stack = createNativeStackNavigator();

import Home from "./screens/Home";
import ImageModal from "./screens/ImageModal";
import SignIn from "./screens/SignIn";
import { AuthContext } from "./context";

const Layout = () => {
  const { authUser } = useContext(AuthContext);
  return (
    <RootSiblingParent>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Group>
            {authUser ? (
              <Stack.Screen name="Home" component={Home} options={{ title: "S3 Bucket" }} />
            ) : (
              <Stack.Screen
                options={{
                  headerShown: false,
                }}
                name="SignIn"
                component={SignIn}
              />
            )}
          </Stack.Group>

          <Stack.Group screenOptions={{ presentation: "modal" }}>
            <Stack.Screen name="Image" component={ImageModal} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </RootSiblingParent>
  );
};

export default Layout;

import { RootSiblingParent } from "react-native-root-siblings";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

const Stack = createNativeStackNavigator();

import Home from "./screens/Home";
import ImageModal from "./screens/ImageModal";

const Layout = () => {
  return (
    <RootSiblingParent>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Group>
            <Stack.Screen name="Home" component={Home} options={{ title: "S3 Bucket" }} />
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

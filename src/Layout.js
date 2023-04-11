import { RootSiblingParent } from "react-native-root-siblings";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

const Stack = createNativeStackNavigator();

import Home from "./screens/Home";

const Layout = () => {
  return (
    <RootSiblingParent>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="S3 Bucket" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </RootSiblingParent>
  );
};

export default Layout;

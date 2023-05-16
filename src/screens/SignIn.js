import React, { useState, useEffect, useContext } from "react";
import { Alert, Button, Pressable, StyleSheet, Linking, View, Image, Text } from "react-native";
import { Amplify, Auth, Hub } from "aws-amplify";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import awsConfig from "../aws-exports";
import * as WebBrowser from "expo-web-browser";
import { AuthContext } from "../context";

const SignIn = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(null);
  const [customState, setCustomState] = useState(null);
  const { setAuthUser } = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          setAuthUser(data);
          break;
        case "signOut":
          setAuthUser(null);
          break;
        case "signIn_failure":
          setCustomState(data);
      }
    });

    Auth.currentAuthenticatedUser()
      .then(currentUser => setAuthUser(currentUser))
      .catch(() => {
        //"Not signed in"
        setIsAuthenticating(false);
      });

    return unsubscribe;
  }, []);

  async function urlOpener(url, redirectUrl) {
    const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(url, redirectUrl, {
      showTitle: false,
      enableUrlBarHiding: true,
      enableDefaultShare: false,
      ephemeralWebSession: false,
    });

    if (type === "success") {
      Linking.openURL(newUrl);
    }
  }

  Amplify.configure({
    ...awsConfig,
    oauth: {
      ...awsConfig.oauth,
      urlOpener,
    },
  });

  const handleGoogleButtonPress = async () => {
    Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })
      .then(() => setIsAuthenticating(true))
      .catch(e => {
        setIsAuthenticating(false);
      });
  };

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      Alert.alert("Sign Out", error.message);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 32 }}>S3 Bucket</Text>
      <Image
        style={{ resizeMode: "cover", width: "100%", height: "50%", marginVertical: 20 }}
        source={require("../../assets/Bucket.png")}
      />
      <Button
        disabled={isAuthenticating}
        onPress={handleGoogleButtonPress}
        title={isAuthenticating ? "Signing in ..." : "Sign in with Google"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SignIn;

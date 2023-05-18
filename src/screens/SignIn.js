import React, { useState, useEffect, useContext } from "react";
import { Alert, Button, Pressable, StyleSheet, View, Image, Text } from "react-native";
import * as Linking from "expo-linking";
import { Amplify, Auth, Hub } from "aws-amplify";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import awsConfig from "../aws-exports";
import * as WebBrowser from "expo-web-browser";
import { AuthContext } from "../context";
import Toast from "react-native-root-toast";
import { useFocusEffect } from "@react-navigation/native";

const SignIn = ({ navigation }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [customState, setCustomState] = useState(null);
  const { setAuthUser } = useContext(AuthContext);

  useEffect(() => {
    configureRedirects();

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

    return unsubscribe;
  }, []);

  const configureRedirects = () => {
    const signInRedirects = awsConfig ? awsConfig.oauth.redirectSignIn?.split(",") || [] : [];
    let redirect = "";
    let link = Linking.createURL();
    link += link.endsWith("/") ? "" : "/";

    redirect = signInRedirects.find(r => r === link) || "no_redirects";

    awsConfig.oauth.redirectSignIn = redirect;
    awsConfig.oauth.redirectSignOut = redirect;

    Amplify.configure({
      ...awsConfig,
      oauth: {
        ...awsConfig.oauth,
        urlOpener,
      },
    });
  };

  async function urlOpener(url, redirectUrl) {
    try {
      const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(url, redirectUrl, {
        showTitle: false,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        ephemeralWebSession: false,
      });

      if (type === "success") {
        Linking.openURL(newUrl);
      }
      Auth.currentAuthenticatedUser()
        .then(currentUser => setAuthUser(currentUser))
        .catch(() => {
          //"Not signed in"
          setIsAuthenticating(false);
        });
    } catch (error) {
      Toast.show(error.message, {
        duration: Toast.durations.LONG,
        backgroundColor: "salmon",
      });
    }
  }

  const handleGoogleButtonPress = async () => {
    Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })
      .then(() => setIsAuthenticating(true))
      .catch(e => {
        setIsAuthenticating(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 32 }}>S3 Bucket</Text>
      <Text style={{ fontSize: 32 }}>{}</Text>
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

import { useContext } from "react";
import { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as S3Api from "../S3Api";

import Toast from "react-native-root-toast";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ImageList from "../components/ImageList";
import { AuthContext } from "../context";

const Home = ({ navigation, route }) => {
  const [isLoading, setisLoading] = useState(false);
  const [images, setimages] = useState(null);
  const { authUser, setAuthUser } = useContext(AuthContext);

  useEffect(() => {
    navigation.setOptions({
      headerRight,
    });
    if (images === null || route.params?.isDelete) {
      fetchImages();
    }
  }, [navigation, route.params]);

  const headerRight = () => {
    return (
      <>
        <TouchableOpacity onPress={handleUploadPress}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={28} />
        </TouchableOpacity>
        <View style={{ marginHorizontal: 6 }}></View>
        <TouchableOpacity onPress={handleSignOutPress}>
          <MaterialCommunityIcons name="exit-to-app" size={24} color="black" />
        </TouchableOpacity>
      </>
    );
  };

  const handleSignOutPress = () => {
    Alert.alert("Confirm", "Sign out of the app?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () =>
          Auth.signOut().then(() => {
            setAuthUser(null);
          }),
      },
    ]);
  };

  const handleUploadPress = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri !== null) {
        const filename = imageUri.split("/").pop();
        const bucketUrl = await S3Api.createPresignedUrl(filename);
        setisLoading(true);
        const isOk = await upload(bucketUrl, imageUri, filename);

        if (isOk) {
          Toast.show("Completed upload", {
            duration: Toast.durations.LONG,
            backgroundColor: "#32a852",
          });
          fetchImages();
        }
      }
    } catch (error) {
      Toast.show(error.message, {
        duration: Toast.durations.LONG,
        backgroundColor: "salmon",
      });
    } finally {
      setisLoading(false);
    }
  };

  const fetchImages = () => {
    (async () => {
      try {
        setisLoading(true);
        const fetchResult = await S3Api.fetchImages();
        setimages(fetchResult);
      } catch (error) {
        Toast.show(error.message, {
          duration: Toast.durations.LONG,
          backgroundColor: "salmon",
        });
      } finally {
        setisLoading(false);
      }
    })();
  };

  const handleImagePress = image => {
    navigation.navigate("Image", { imageName: image.Key });
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const upload = async (bucketUrl, fileUri, fileName) => {
    const response = await FileSystem.uploadAsync(bucketUrl, fileUri, {
      fieldName: fileName,
      httpMethod: "PUT",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });
    if (response.status != 200) {
      throw new Error("Bucket upload failed");
    } else {
      return true;
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <ImageList images={images} onItemPress={handleImagePress} onRefresh={fetchImages} />
      )}
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

export default Home;

import { useEffect, useState } from "react";
import { View, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import Toast from "react-native-root-toast";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as S3Api from "../S3Api";

const ImageModal = ({ navigation, route }) => {
  const [isLoading, setisLoading] = useState(false);
  const [imageUri, setimageUri] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight,
    });
    S3Api.downloadImage(route.params.imageName)
      .then(data => setimageUri(data))
      .catch(error => {});
  }, []);

  const showDeleteError = () => {
    Toast.show("Could not delete.", {
      duration: Toast.durations.LONG,
      backgroundColor: "salmon",
    });
  };

  const handleDeletePress = async () => {
    try {
      setisLoading(true);
      const deleteResponse = await S3Api.deleteImage(route.params.imageName);
      if (deleteResponse.$metadata.httpStatusCode === 204) {
        navigation.navigate("Home", { isDelete: true });
        Toast.show("Image deleted.", {
          delay: 500,
          duration: Toast.durations.LONG,
          backgroundColor: "#32a852",
        });
      } else {
        showDeleteError();
      }
    } catch (error) {
      showDeleteError();
    } finally {
      setisLoading(false);
    }
  };

  const headerRight = () => {
    return (
      <TouchableOpacity onPress={handleDeletePress}>
        <MaterialCommunityIcons name="delete-outline" size={28} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Image
        onLoadStart={() => setisLoading(true)}
        onLoadEnd={() => setisLoading(false)}
        style={[
          {
            width: "100%",
            height: "100%",
          },
        ]}
        source={{ uri: imageUri }}
      />
      {isLoading && <ActivityIndicator style={{ position: "absolute" }} size="large" />}
    </View>
  );
};

export default ImageModal;

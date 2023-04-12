import { useEffect, useState } from "react";
import { Text, View, Button, Image, ActivityIndicator } from "react-native";
import { downloadImage } from "../S3Api";

const ImageModal = ({ navigation, route }) => {
  const [isDownloading, setisDownloading] = useState(false);
  const [imageUri, setimageUri] = useState("");

  useEffect(() => {
    (async () => {
      downloadImage(route.params.imageName)
        .then(data => setimageUri(data))
        .catch(error => {});
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {isDownloading && <ActivityIndicator style={{ position: "absolute" }} size="large" />}
      {imageUri && (
        <Image
          onLoadStart={() => setisDownloading(true)}
          onLoadEnd={() => setisDownloading(false)}
          style={[
            {
              width: "100%",
              height: "100%",
            },
          ]}
          source={{ uri: imageUri }}
        />
      )}
    </View>
  );
};

export default ImageModal;

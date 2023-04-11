import React from "react";
import { useState, useEffect } from "react";
import { S3_BUCKET_NAME, S3_ACCESS_KEY, S3_KEY_ID, AWS_REGION } from "@env";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Toast from "react-native-root-toast";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Home = ({ navigation }) => {
  const [isUploading, setisUploading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight,
    });
  }, []);

  const handleUploadPress = () => {
    (async () => {
      try {
        const imageUri = await pickImage();
        if (imageUri !== null) {
          const filename = imageUri.split("/").pop();
          const bucketUrl = await createPresignedUrlWithClient(filename);
          setisUploading(true);
          const isOk = await upload(bucketUrl, imageUri, filename);

          if (isOk) {
            Toast.show("Completed upload", {
              duration: Toast.durations.SHORT,
              backgroundColor: "#32a852",
            });
          }
        }
      } catch (error) {
        Toast.show(error.message, {
          duration: Toast.durations.LONG,
          backgroundColor: "salmon",
        });
      } finally {
        setisUploading(false);
      }
    })();
  };

  const headerRight = () => {
    return (
      <MaterialCommunityIcons name="cloud-upload-outline" size={28} onPress={handleUploadPress} />
    );
  };

  const createPresignedUrlWithClient = async key => {
    const command = new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });

    const client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: S3_KEY_ID,
        secretAccessKey: S3_ACCESS_KEY,
      },
    });

    return getSignedUrl(client, command, { expiresIn: 3600 });
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
      <View style={{ alignItems: "center", height: 60 }}>
        {isUploading && <ActivityIndicator size="large" color="navy" />}
      </View>

      <Text>Upload an image</Text>
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

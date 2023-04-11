import React from "react";
import { useState, useEffect } from "react";
import { S3_BUCKET_NAME, S3_ACCESS_KEY, S3_KEY_ID, AWS_REGION } from "@env";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { PutObjectCommand, S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Toast from "react-native-root-toast";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ImageList from "../components/ImageList";

const client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: S3_KEY_ID,
    secretAccessKey: S3_ACCESS_KEY,
  },
});

const Home = ({ navigation }) => {
  const [isLoading, setisLoading] = useState(false);
  const [images, setimages] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerRight,
    });
    fetchImages();
  }, []);

  const headerRight = () => {
    return (
      <>
        <TouchableOpacity onPress={handleReloadPress}>
          <MaterialCommunityIcons name="reload" size={24} color="black" />
        </TouchableOpacity>
        <View style={{ marginHorizontal: 6 }}></View>
        <TouchableOpacity onPress={handleUploadPress}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={28} />
        </TouchableOpacity>
      </>
    );
  };

  const handleUploadPress = () => {
    (async () => {
      try {
        const imageUri = await pickImage();
        if (imageUri !== null) {
          const filename = imageUri.split("/").pop();
          const bucketUrl = await createPresignedUrlWithClient(filename);
          setisLoading(true);
          const isOk = await upload(bucketUrl, imageUri, filename);

          if (isOk) {
            Toast.show("Completed upload", {
              duration: Toast.durations.SHORT,
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
    })();
  };

  const handleReloadPress = () => {
    fetchImages();
  };

  const fetchImages = () => {
    (async () => {
      const command = new ListObjectsV2Command({
        Bucket: S3_BUCKET_NAME,
        MaxKeys: 1,
      });

      try {
        let isTruncated = true;
        let contents = [];

        setisLoading(true);
        while (isTruncated) {
          const { Contents, IsTruncated, NextContinuationToken } = await client.send(command);
          if (!Contents) break;
          contents.push(...Contents);
          isTruncated = IsTruncated;
          command.input.ContinuationToken = NextContinuationToken;
        }

        setimages(contents);
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

  const createPresignedUrlWithClient = async key => {
    const command = new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });
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
      {isLoading ? <ActivityIndicator size="large" color="navy" /> : <ImageList images={images} />}
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

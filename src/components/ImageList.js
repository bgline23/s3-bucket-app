import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator } from "react-native";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { S3_BUCKET_NAME, S3_ACCESS_KEY, S3_KEY_ID, AWS_REGION } from "@env";

const ImageList = () => {
  const [images, setimages] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  useEffect(() => {
    (async () => {
      const client = new S3Client({
        region: AWS_REGION,
        credentials: {
          accessKeyId: S3_KEY_ID,
          secretAccessKey: S3_ACCESS_KEY,
        },
      });

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
          contents.push(...Contents);
          isTruncated = IsTruncated;
          command.input.ContinuationToken = NextContinuationToken;
        }
        setisLoading(false);
        setimages(contents);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  if (isLoading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      ListEmptyComponent={<Text>Upload an image</Text>}
      ItemSeparatorComponent={<View style={{ marginVertical: 6 }}></View>}
      data={images}
      renderItem={({ item }) => (
        <TouchableOpacity
          key={item.Key}
          style={{ padding: 20, borderRadius: 8, backgroundColor: "teal" }}
          onPress={() => {}}
        >
          <Text>{item.Key}</Text>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.Key}
    />
  );
};

export default ImageList;

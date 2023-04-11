import { FlatList, Text, TouchableOpacity, View } from "react-native";

const ImageList = ({ images }) => {
  return (
    <FlatList
      contentContainerStyle={[
        { flexGrow: 1, paddingVertical: 10 },
        images.length ? null : { justifyContent: "center" },
      ]}
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

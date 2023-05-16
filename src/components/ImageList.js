import { FlatList, Text, TouchableOpacity, View } from "react-native";

const ImageList = ({ images, onItemPress, onRefresh }) => {
  return (
    <FlatList
      refreshing={images === null}
      onRefresh={onRefresh}
      contentContainerStyle={[
        { flexGrow: 1, paddingVertical: 10 },
        images?.length ? null : { justifyContent: "center" },
      ]}
      ListEmptyComponent={<Text>Upload an image</Text>}
      ItemSeparatorComponent={<View style={{ marginVertical: 6 }}></View>}
      data={images || []}
      renderItem={({ item }) => {
        const uploadDate = new Date(item.LastModified);
        const month = uploadDate.toLocaleString();

        const formattedDate = ` ${month}`;

        return (
          <TouchableOpacity
            key={item.Key}
            style={{ padding: 20, borderRadius: 8, backgroundColor: "#7542f5" }}
            onPress={() => onItemPress(item)}
          >
            <Text style={{ color: "#f5a742", alignSelf: "center" }}>{formattedDate}</Text>
            <Text style={{ color: "#fff" }}>{item.Key}</Text>
          </TouchableOpacity>
        );
      }}
      keyExtractor={item => item.Key}
    />
  );
};

export default ImageList;

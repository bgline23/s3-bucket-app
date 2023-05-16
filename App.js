import React, { useState, useContext } from "react";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import Layout from "./src/Layout";
import { AuthContext } from "./src/context";

export default function App() {
  const { authUser } = useContext(AuthContext);
  const [user, setAuthUser] = useState(authUser);
  return (
    <AuthContext.Provider value={{ authUser: user, setAuthUser }}>
      <Layout />
    </AuthContext.Provider>
  );
}

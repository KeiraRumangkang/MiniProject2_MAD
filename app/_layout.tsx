import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";

// buat client Convex
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export default function Layout() {
  return (
    <ConvexProvider client={convex}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="mahasiswa/(tabs)" />
        <Stack.Screen name="mahasiswa/book/[id]" />
        <Stack.Screen name="mahasiswa/forum/[id]" />
        <Stack.Screen name="mahasiswa/forum/create-post" />
        <Stack.Screen name="staff" />
        <Stack.Screen name="kepala" />
      </Stack>
    </ConvexProvider>
  );
}
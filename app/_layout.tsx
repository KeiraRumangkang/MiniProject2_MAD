import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="mahasiswa" />
      <Stack.Screen name="staff" />
      <Stack.Screen name="kepala" />
    </Stack>
  );
}
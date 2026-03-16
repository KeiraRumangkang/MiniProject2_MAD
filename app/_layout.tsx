import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack, usePathname, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { AuthSessionProvider, getHomePathByRole, useAuthSession } from "@/lib/auth-session";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export default function Layout() {
  return (
    <ConvexProvider client={convex}>
      <AuthSessionProvider>
        <AuthGate />
      </AuthSessionProvider>
    </ConvexProvider>
  );
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const navState = useRootNavigationState();
  const { isHydrated, activeRole, activeSession, sessions, setActiveRole } = useAuthSession();

  useEffect(() => {
    if (!navState?.key || !isHydrated) return;

    const top = segments[0];
    const atLogin = top === "login";
    const atMahasiswa = top === "mahasiswa";
    const atStaff = top === "staff";
    const atKepala = top === "kepala";
    const atRoot = pathname === "/";

    const targetRole = atMahasiswa ? "mahasiswa" : atStaff ? "staff" : atKepala ? "kepala" : null;

    if (!activeSession) {
      if (targetRole && sessions[targetRole]) {
        void setActiveRole(targetRole);
        return;
      }

      if (!atLogin) {
        router.replace("/login");
      }
      return;
    }

    if (targetRole && targetRole !== activeRole) {
      if (sessions[targetRole]) {
        void setActiveRole(targetRole);
        return;
      }
      router.replace(getHomePathByRole(activeRole!));
      return;
    }

    if (atLogin || atRoot) {
      router.replace(getHomePathByRole(activeRole!));
    }
  }, [
    activeRole,
    activeSession,
    isHydrated,
    navState?.key,
    pathname,
    router,
    segments,
    sessions,
    setActiveRole,
  ]);

  if (!isHydrated || !navState?.key) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F5F7FA" }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="mahasiswa/(tabs)" />
      <Stack.Screen name="mahasiswa/book/[id]" />
      <Stack.Screen name="mahasiswa/forum/[id]" />
      <Stack.Screen name="mahasiswa/forum/create-post" />
      <Stack.Screen name="staff" />
      <Stack.Screen name="kepala" />
    </Stack>
  );
}
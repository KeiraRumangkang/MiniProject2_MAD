import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = () => {

    if (role === "mahasiswa") {
      router.push("/mahasiswa");
    }

    if (role === "staff") {
      router.push("/staff");
    }

    if (role === "kepala") {
      router.push("/kepala");
    }

  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Library Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={setPassword}
      />

      <Text style={styles.roleTitle}>Pilih Role</Text>

      <View style={styles.roleContainer}>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "mahasiswa" && styles.roleActive
          ]}
          onPress={() => setRole("mahasiswa")}
        >
          <Text style={styles.roleText}>Mahasiswa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "staff" && styles.roleActive
          ]}
          onPress={() => setRole("staff")}
        >
          <Text style={styles.roleText}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            role === "kepala" && styles.roleActive
          ]}
          onPress={() => setRole("kepala")}
        >
          <Text style={styles.roleText}>Kepala</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    padding: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2F80ED",
    textAlign: "center",
    marginBottom: 40,
  },

  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  roleTitle: {
    marginTop: 10,
    marginBottom: 10,
    fontWeight: "600",
    color: "#333333",
  },

  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  roleButton: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },

  roleActive: {
    backgroundColor: "#4CAF50",
  },

  roleText: {
    color: "white",
    fontWeight: "600",
  },

  loginButton: {
    backgroundColor: "#2F80ED",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
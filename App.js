import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const MODE = "@mode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadToDos();
  }, []);
  const work = async () => {
    await AsyncStorage.setItem(MODE, "work");
    setWorking(true);
  };
  const travel = async () => {
    await AsyncStorage.setItem(MODE, "travel");
    setWorking(false);
  };
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    try {
      const jsonValue = JSON.stringify(toSave);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.log(e);
    }
  };
  const loadToDos = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const modeValue = await AsyncStorage.getItem(MODE);
      setToDos(JSON.parse(jsonValue));
      if (modeValue === "travel") {
        setWorking(false);
      } else {
        setWorking(true);
      }
    } catch (e) {
      console.log(e);
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, work: working, done: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    Alert.alert("할 일을 삭제합니다.", "확실합니까?", [
      { text: "취소" },
      {
        text: "네",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
    return;
  };
  const changeDone = (key) => {
    const newToDos = {...toDos}
    newToDos[key].done = !newToDos[key].done
    setToDos(newToDos)
    saveToDos(newToDos)
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? "white" : theme.gray,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "할 일을 추가합니다." : "어디로 가고싶나요?"}
        style={styles.input}
      />
      <ScrollView>
        {loading ? (
          <ActivityIndicator
            style={styles.loading}
            size="large"
            color="white"
          />
        ) : (
          Object.keys(toDos).map((key) =>
            toDos[key].work === working ? (
              <View style={styles.toDo} key={key}>
                <TouchableOpacity style={styles.done} onPress={() => changeDone(key)}>
                  {toDos[key].done ? (
                    <Fontisto name="checkbox-active" size={20} color="white" />
                  ) : (
                    <Fontisto name="checkbox-passive" size={20} color="white" />
                  )}
                </TouchableOpacity>
                <Text style={dStyles(toDos[key].done).toDoText}>{toDos[key].text}</Text>
                <TouchableOpacity style={styles.delete} onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : null
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 44,
    fontWeight: "600",
    color: theme.gray,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  loading: {
    marginTop: 200,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flex: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  done: {
    flex: 2,
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    flex: 8,
  },
  delete: {
    flex: 1,
  }
});

const dStyles = (done) => StyleSheet.create({
  toDoText: {
    color: done ? theme.gray : "white",
    textDecorationLine: done ? "line-through" : "none",
    fontSize: 16,
    fontWeight: "500",
    flex: 10,
  }
})
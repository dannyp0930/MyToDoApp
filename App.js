import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { theme } from "./colors";

const STORAGE_KEY = "@toDos";
const MODE = "@mode";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [modalText, setModalText] = useState("");
  const [updateKey, setUpdateKey] = useState(0);
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
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
  const updateTodo = async () => {
    if (modalText === "") {
      return;
    }
    const newToDos = { ...toDos };
    newToDos[updateKey].text = modalText;
    setToDos(newToDos);
    await saveToDos(newToDos);
    setModalText("");
    setUpdateKey(0);
    setModalVisible(false);
  };
  const onChangeModalText = (payload) => setModalText(payload);
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
    const newToDos = { ...toDos };
    newToDos[key].done = !newToDos[key].done;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <TextInput
              onSubmitEditing={updateTodo}
              onChangeText={onChangeModalText}
              returnKeyType="done"
              value={modalText}
              style={modalStyles.input}
            />
            <TouchableOpacity
              style={modalStyles.button}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={modalStyles.textStyle}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? theme.white : theme.gray,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? theme.white : theme.gray,
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
            color={theme.white}
          />
        ) : (
          Object.keys(toDos).map((key) =>
            toDos[key].work === working ? (
              <View style={styles.toDo} key={key}>
                <TouchableOpacity
                  style={styles.done}
                  onPress={() => changeDone(key)}
                >
                  {toDos[key].done ? (
                    <FontAwesome
                      name="check-square-o"
                      size={20}
                      color={theme.white}
                    />
                  ) : (
                    <FontAwesome name="square-o" size={20} color={theme.white} />
                  )}
                </TouchableOpacity>
                <Text style={dStyles(toDos[key].done).toDoText}>
                  {toDos[key].text}
                </Text>
                <TouchableOpacity
                  style={styles.update}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    setModalText(toDos[key].text);
                    setUpdateKey(key);
                  }}
                >
                  <FontAwesome name="pencil-square-o" size={20} color={theme.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.delete}
                  onPress={() => deleteToDo(key)}
                >
                  <FontAwesome name="trash-o" size={20} color={theme.white} />
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
    backgroundColor: theme.black,
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
    backgroundColor: theme.white,
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
    backgroundColor: theme.darkGray,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flex: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  done: {
    flex: 1,
  },
  toDoText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "500",
    flex: 9,
  },
  update: {
    flex: 1,
    alignItems: "flex-end",
  },
  delete: {
    flex: 1,
    alignItems: "flex-end",
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    flex: 0.8,
    flexDirection: "row",
    backgroundColor: theme.lighterGray,
    borderRadius: 15,
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    flex: 0.8,
    marginVertical: 20,
    paddingVertical: 5,
    borderBottomColor: theme.black,
    borderBottomWidth: 1,
    fontSize: 18,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: theme.gray,
  },
  textStyle: {
    color: theme.white,
    fontWeight: "bold",
    textAlign: "center",
  },
});

const dStyles = (done) =>
  StyleSheet.create({
    toDoText: {
      color: done ? theme.gray : theme.white,
      textDecorationLine: done ? "line-through" : "none",
      fontSize: 16,
      fontWeight: "500",
      flex: 10,
    },
  });

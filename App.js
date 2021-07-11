import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  StyleSheet,
  Button,
  TextInput,
  View,
  Platform,
  Text,
  ScrollView,
} from "react-native";

import { Formik } from "formik";

const axios = require("axios");

export default function App() {
  const [image, setImage] = useState(null);
  const [dataKTP, setDataKTP] = useState();
  const [selfiePic, setSelfiePic] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    setIsFetching(true);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      base64: true,

      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    axios
      .post(
        "https://api.asliri.id:8443/internal_internship_poc/ocr_extra",
        {
          ktp_image: result.base64,
        },
        {
          headers: {
            token: "NmU0MjhiNTYtZmYzYy00MTdhLWI4M2EtODRiNTJmOTM5NDZh",
          },
        }
      )
      .then((res) => {
        setDataKTP(res.data.data);
        setIsFetching(false);
      })
      .catch((err) => {
        console.log(err);
        setIsFetching(false);
      });

    // console.log(result.base64);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const pickSelfie = async () => {
    let selfie = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      base64: true,

      aspect: [4, 3],
      quality: 1,
    });

    setSelfiePic(selfie.base64);
  };

  const onFormSubmit = () => {
    axios
      .post(
        "https://api.asliri.id:8443/internal_internship_poc/verify_profesional",
        {
          nik: dataKTP.nik,
          name: dataKTP.name,
          birthdate: dataKTP.tanggal_lahir,
          birthplace: dataKTP.tempat_lahir,
          identity_photo: "",
          selfie_photo: selfiePic,
        },
        {
          headers: {
            token: "NmU0MjhiNTYtZmYzYy00MTdhLWI4M2EtODRiNTJmOTM5NDZh",
          },
        }
      )
      .then((res) => {
        console.log(res.data.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Button onPress={pickImage} title="ocr" color="blue" />
        {isFetching && <Text>Loading</Text>}
        {dataKTP && (
          <Formik initialValues={dataKTP} onSubmit={onFormSubmit}>
            {({ handleChange, handleBlur, handleSubmit, values }) => (
              <View>
                {Object.keys(dataKTP).map((key) => (
                  <View style={styles.fieldContainer} key={key}>
                    <Text>{key} :</Text>
                    <TextInput
                      style={styles.inputFied}
                      onChangeText={handleChange(key)}
                      onBlur={handleBlur(key)}
                      value={values[key]}
                    />
                  </View>
                ))}
                <View style={styles.selfieButton}>
                  <Button
                    onPress={pickSelfie}
                    color="red"
                    title="choose selfie photo"
                  />
                </View>

                <Button onPress={handleSubmit} title="Submit" />
              </View>
            )}
          </Formik>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginTop: 50,
  },
  fieldContainer: {
    marginTop: 10,
    paddingHorizontal: 8,
    fontSize: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputFied: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: 200,
    height: 50,
    paddingLeft: 10,
    fontSize: 12,
  },

  selfieButton: {
    marginHorizontal: 5,
    marginVertical: 10,
    width: "40%",
  },
});

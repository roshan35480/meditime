import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = 'meditime_mobile_schedules';

export default function App() {
  const [patientName, setPatientName] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [doseTime, setDoseTime] = useState(''); // HH:MM
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
    // Notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setSchedules(JSON.parse(data));
    } catch (e) {
      Alert.alert('Error', 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const saveSchedules = async (newSchedules) => {
    setSchedules(newSchedules);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSchedules));
  };

  const addSchedule = async () => {
    if (!patientName.trim() || !medicineName.trim() || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(doseTime)) {
      Alert.alert('Validation', 'Please enter valid patient, medicine, and time (HH:MM)');
      return;
    }
    const newSchedule = { patientName, medicineName, doseTime };
    const newSchedules = [...schedules, newSchedule];
    await saveSchedules(newSchedules);
    setPatientName('');
    setMedicineName('');
    setDoseTime('');
    scheduleNotification(newSchedule);
  };

  const deleteSchedule = async (index) => {
    Alert.alert('Delete', 'Delete this schedule?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const newSchedules = schedules.filter((_, i) => i !== index);
        await saveSchedules(newSchedules);
      }}
    ]);
  };

  const scheduleNotification = async (schedule) => {
    // Calculate next notification time
    const [h, m] = schedule.doseTime.split(':');
    const now = new Date();
    let notifDate = new Date();
    notifDate.setHours(Number(h), Number(m), 0, 0);
    if (notifDate <= now) notifDate.setDate(notifDate.getDate() + 1); // next day if time passed
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `MediTime Reminder` ,
        body: `${schedule.patientName}: Take ${schedule.medicineName} now!`,
        sound: true,
      },
      trigger: notifDate,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>MediTime Mobile</Text>
      <Text style={styles.label}>Patient Name</Text>
      <TextInput value={patientName} onChangeText={setPatientName} style={styles.input} placeholder="Enter patient name" />
      <Text style={styles.label}>Medicine Name</Text>
      <TextInput value={medicineName} onChangeText={setMedicineName} style={styles.input} placeholder="Enter medicine name" />
      <Text style={styles.label}>Dose Time (HH:MM)</Text>
      <TextInput value={doseTime} onChangeText={setDoseTime} style={styles.input} placeholder="08:00" keyboardType="numeric" />
      <Button title="Add Schedule" onPress={addSchedule} />
      <Text style={[styles.title, { fontSize: 20, marginTop: 30 }]}>Saved Schedules</Text>
      {loading ? <Text>Loading...</Text> : (
        <FlatList
          data={schedules}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}><Text style={{ fontWeight: 'bold' }}>Patient:</Text> {item.patientName}</Text>
              <Text style={styles.cardText}><Text style={{ fontWeight: 'bold' }}>Medicine:</Text> {item.medicineName}</Text>
              <Text style={styles.cardText}><Text style={{ fontWeight: 'bold' }}>Time:</Text> {item.doseTime}</Text>
              <TouchableOpacity onPress={() => deleteSchedule(index)} style={styles.deleteBtn}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4ff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#2d3a5a',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    color: '#2d3a5a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b0b8d1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 4,
  },
  deleteBtn: {
    marginTop: 8,
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
}); 
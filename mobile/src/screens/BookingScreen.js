import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { turfAPI, bookingAPI } from '../services/api';

const BookingScreen = ({ route, navigation }) => {
  const { turfId } = route.params;
  const [turf, setTurf] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    fetchTurf();
    fetchAvailableSlots();
  }, [selectedDate]);

  const fetchTurf = async () => {
    try {
      const response = await turfAPI.getTurf(turfId);
      setTurf(response.data);
    } catch (error) {
      console.error('Error fetching turf:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await turfAPI.getAvailableSlots(turfId, selectedDate);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const toggleSlot = (slot) => {
    setSelectedSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  const createBooking = async () => {
    if (selectedSlots.length === 0) {
      Alert.alert('Error', 'Please select at least one time slot');
      return;
    }

    try {
      const bookingData = {
        turf_id: turfId,
        date: selectedDate,
        time_slots: selectedSlots,
        booking_type: 'single',
        customer_name: 'Mobile User',
        customer_phone: '9876543210',
        customer_email: 'user@example.com'
      };

      const response = await bookingAPI.createBooking(bookingData);
      Alert.alert('Success', 'Booking created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Payment', { bookingId: response.data.booking.id }) }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {turf && (
        <View style={styles.turfInfo}>
          <Text style={styles.turfName}>{turf.turf_name}</Text>
          <Text style={styles.location}>{turf.location}</Text>
          <Text style={styles.price}>₹{turf.price_per_hour}/hour</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <Text style={styles.selectedDate}>{selectedDate}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        <View style={styles.slotsGrid}>
          {availableSlots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.slotButton,
                selectedSlots.includes(slot) && styles.selectedSlot
              ]}
              onPress={() => toggleSlot(slot)}
            >
              <Text style={[
                styles.slotText,
                selectedSlots.includes(slot) && styles.selectedSlotText
              ]}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={createBooking}>
        <Text style={styles.bookButtonText}>
          Book {selectedSlots.length} Slot{selectedSlots.length !== 1 ? 's' : ''}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  turfInfo: { backgroundColor: 'white', padding: 16, marginBottom: 16 },
  turfName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  location: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  price: { fontSize: 16, fontWeight: '600', color: '#059669', marginTop: 8 },
  section: { backgroundColor: 'white', padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  selectedDate: { fontSize: 14, color: '#6B7280' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotButton: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  selectedSlot: { backgroundColor: '#3B82F6' },
  slotText: { fontSize: 12, color: '#374151' },
  selectedSlotText: { color: 'white' },
  bookButton: { backgroundColor: '#3B82F6', margin: 16, padding: 16, borderRadius: 8, alignItems: 'center' },
  bookButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default BookingScreen;
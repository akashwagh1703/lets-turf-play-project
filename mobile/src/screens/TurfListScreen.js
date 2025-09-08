import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { turfAPI } from '../services/api';

const TurfListScreen = ({ navigation }) => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      const response = await turfAPI.getTurfs();
      setTurfs(response.data);
    } catch (error) {
      console.error('Error fetching turfs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTurf = ({ item }) => (
    <TouchableOpacity 
      style={styles.turfCard}
      onPress={() => navigation.navigate('TurfDetail', { turfId: item.id })}
    >
      <View style={styles.turfInfo}>
        <Text style={styles.turfName}>{item.turf_name}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.price}>₹{item.price_per_hour}/hour</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: item.status ? '#10B981' : '#EF4444' }]} />
          <Text style={styles.status}>{item.status ? 'Available' : 'Unavailable'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Turfs</Text>
      <FlatList
        data={turfs}
        renderItem={renderTurf}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={fetchTurfs}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#111827' },
  turfCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  turfInfo: { flex: 1 },
  turfName: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 },
  location: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  price: { fontSize: 16, fontWeight: '600', color: '#059669', marginBottom: 8 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  status: { fontSize: 12, color: '#6B7280' },
});

export default TurfListScreen;
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../types/event';
import { parseEventCandidates } from '../services/ocrService';
import { createDeviceCalendarEvents } from '../services/calendarService';

type Props = NativeStackScreenProps<AppStackParamList, 'Review'>;

export function ReviewScreen({ navigation, route }: Props) {
  const rawText = route.params?.rawText ?? 'Texto no detectado';
  const candidates = parseEventCandidates(rawText);

  const addAllToCalendar = async () => {
    const created = await createDeviceCalendarEvents(candidates);
    if (created === 0) {
      Alert.alert('No disponible', 'No fue posible crear eventos. Revisa permisos de calendario.');
      return;
    }

    Alert.alert('Listo', `Se crearon ${created} eventos por separado en tu calendario.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Texto detectado</Text>
      <Text style={styles.rawText}>{rawText}</Text>

      <Text style={styles.heading}>Eventos sugeridos</Text>
      {candidates.length > 0 ? (
        <Pressable style={styles.bulkButton} onPress={addAllToCalendar}>
          <Text style={styles.bulkButtonText}>Agregar todos al calendario</Text>
        </Pressable>
      ) : null}

      {candidates.length === 0 ? (
        <Text style={styles.emptyText}>No se detectaron eventos separados. Prueba una imagen más nítida o recortada.</Text>
      ) : null}

      {candidates.map((candidate, index) => (
        <View key={`${candidate.title}-${index}`} style={styles.card}>
          <Text style={styles.title}>{candidate.title}</Text>
          <Text style={styles.meta}>Inicio: {new Date(candidate.startDate).toLocaleString()}</Text>
          <Text style={styles.meta}>Fin: {new Date(candidate.endDate).toLocaleString()}</Text>
          <Text style={styles.meta}>Confianza: {Math.round(candidate.confidence * 100)}%</Text>

          <Pressable style={styles.button} onPress={() => navigation.navigate('EventPreview', { event: candidate })}>
            <Text style={styles.buttonText}>Usar este evento</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#fff'
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12
  },
  rawText: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    color: '#3f3f46'
  },
  card: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    padding: 14
  },
  title: {
    fontSize: 16,
    fontWeight: '700'
  },
  meta: {
    color: '#52525b',
    marginTop: 4
  },
  bulkButton: {
    marginTop: 4,
    marginBottom: 6,
    backgroundColor: '#18181b',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  bulkButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  emptyText: {
    color: '#52525b',
    marginTop: 4
  },
  button: {
    marginTop: 10,
    backgroundColor: '#18181b',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});
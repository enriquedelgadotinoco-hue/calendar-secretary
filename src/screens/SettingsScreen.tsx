import { StyleSheet, Text, View } from 'react-native';

export function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>
      <Text style={styles.text}>- OCR avanzado: pendiente de integración</Text>
      <Text style={styles.text}>- Zona horaria y formato de fecha</Text>
      <Text style={styles.text}>- Preferencias de exportación (.ics / dispositivo)</Text>
      <Text style={styles.text}>- Plan premium: USD $1/mes (30 días de prueba)</Text>
      <Text style={styles.text}>- Gestión de suscripción en Google Play / App Store</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 14
  },
  text: {
    color: '#3f3f46',
    marginBottom: 8,
    fontSize: 15
  }
});
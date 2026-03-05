import { StyleSheet, Text, View } from 'react-native';

export function ConnectionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conexiones de calendario</Text>
      <Text style={styles.item}>- Google Calendar: conector planificado</Text>
      <Text style={styles.item}>- Microsoft Outlook: conector planificado</Text>
      <Text style={styles.item}>- Apple Calendar / otros: vía dispositivo y archivo .ics</Text>
      <Text style={styles.note}>
        Nota: en este MVP, el guardado universal se cubre con creación en calendario local + exportación .ics.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12
  },
  item: {
    fontSize: 16,
    color: '#27272a',
    marginBottom: 8
  },
  note: {
    marginTop: 12,
    color: '#52525b'
  }
});
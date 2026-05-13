import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Реєстрація шрифту для підтримки кирилиці
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: 1, paddingBottom: 10, marginBottom: 20 },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#1a365d' },
  titleSection: { textAlign: 'right' },
  reportTitle: { fontSize: 14, color: '#4a5568' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#2b6cb0', marginTop: 5 },
  infoGrid: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 10, borderRadius: 5, marginBottom: 20 },
  infoItem: { flex: 1 },
  label: { fontSize: 10, color: '#718096', marginBottom: 2 },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderBottomWidth: 1, borderRightWidth: 0 },
  tableRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#e2e8f0' },
  tableHeader: { backgroundColor: '#2d3748', color: 'white' },
  tableCol: { width: '40%', padding: 8 },
  tableColSmall: { width: '30%', padding: 8 },
  cellText: { fontSize: 11 }
});

export const ReportPDFDocument = ({ report }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>M&P PHARMA</Text>
        <View style={styles.titleSection}>
          <Text style={styles.reportTitle}>ЗВІТ ПО АКТИВНОСТІ КОРИСТУВАЧА</Text>
          <Text style={styles.userName}>{report.user_email}</Text>
        </View>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Період:</Text>
          <Text>{report.period_start} — {report.period_end}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Дата створення:</Text>
          <Text>{new Date(report.created_at).toLocaleDateString('uk-UA')}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Тип завдань:</Text>
          <Text>{report.task_type === 'psur' ? 'Тільки PSUR' : 'Усі'}</Text>
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableCol}><Text style={{color: 'white'}}>Назва завдання</Text></View>
          <View style={styles.tableColSmall}><Text style={{color: 'white'}}>Дедлайн</Text></View>
          <View style={styles.tableColSmall}><Text style={{color: 'white'}}>Статус</Text></View>
        </View>
        {report.data?.map((task, i) => (
          <View style={styles.tableRow} key={i}>
            <View style={styles.tableCol}><Text style={styles.cellText}>{task.title}</Text></View>
            <View style={styles.tableColSmall}><Text style={styles.cellText}>{task.due_date}</Text></View>
            <View style={styles.tableColSmall}><Text style={styles.cellText}>{task.status}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
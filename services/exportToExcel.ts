import { Platform, Share, Alert } from 'react-native';
import * as XLSX from 'xlsx';
import { DatabasePSACard } from '@/types/databasePSACard';

export const exportToExcel = async (filteredCards: DatabasePSACard[]) => {
  try {
    // Prepare data for export
    const exportData = filteredCards.map(card => ({
      Year: card.year,
      Brand: card.brand,
      Subject: card.subject,
      Grade: card.card_grade,
      Variety: card.variety,
      Cost: card.cost,
      Value: card.value,
      Status: card.status
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Card Data');

    // Generate the Excel file
    const excelFile = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

    // Share or save the file
    if (Platform.OS === 'web') {
      // For web, create a download link
      const blob = new Blob([s2ab(atob(excelFile))], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'filtered_card_data.xlsx';
      link.click();
    } 
  } catch (error) {
    console.error('Export failed', error);
    Alert.alert('Export Failed', 'Unable to export card data');
  }
};

// Helper function to convert string to ArrayBuffer (for web)
const s2ab = (str: string) => {
  const buf = new ArrayBuffer(str.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i) & 0xFF;
  }
  return buf;
};
import React, { useState } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  Platform,
  StyleSheet
} from 'react-native';
import { Text } from '~/components/ui/text';
import { X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from './OrderTable';

interface DatePickerProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
  placeholder: string;
  onClear?: () => void;
}

const CrossPlatformDatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  placeholder,
  onClear
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // Format for HTML date input
  const formatDateForWeb = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Handle web date input change
  const handleWebDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    if (dateString) {
      onDateChange(new Date(dateString));
    } else {
      onDateChange(null);
    }
  };
  
  // Handle native date picker change
  const handleNativeDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };
  
  // Platform-specific date picker
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webDateContainer}>
        <input
          type="date"
          value={formatDateForWeb(date)}
          onChange={handleWebDateChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            height: 46,
            borderWidth: 0,
            outline: 'none',
            fontSize: 16,
            fontFamily: 'inherit',
            backgroundColor: 'transparent'
          }}
        />
        {date && onClear && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <X size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
  
  // Native mobile implementation
  return (
    <View>
      <TouchableOpacity 
        style={styles.nativeDateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text>{date ? formatDate(date.toISOString()) : placeholder}</Text>
        {date && onClear && (
          <TouchableOpacity onPress={onClear}>
            <X size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      {showPicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showPicker}
          >
            <View style={styles.iosModalContainer}>
              <View style={styles.iosModalContent}>
                <View style={styles.iosHeaderContainer}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.iosCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      handleNativeDateChange(null, date || new Date());
                    }}
                  >
                    <Text style={styles.iosDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) {
                      onDateChange(date);
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            testID="dateTimePicker"
            value={date || new Date()}
            mode="date"
            display="default"
            onChange={handleNativeDateChange}
          />
        )
      )}
    </View>
  );
};

// Usage example in OrderFilterModal
const DateRangeExample = ({ 
  filterState, 
  onUpdateFilter
}: {
  filterState: any,
  onUpdateFilter: (key: string, value: any) => void
}) => {
  const clearStartDate = () => {
    onUpdateFilter('dateRange', { ...filterState.dateRange, min: null });
  };
  
  const clearEndDate = () => {
    onUpdateFilter('dateRange', { ...filterState.dateRange, max: null });
  };
  
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Date Range</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={styles.datePickerWrapper}>
          <CrossPlatformDatePicker
            date={filterState.dateRange.min}
            onDateChange={(date) => onUpdateFilter('dateRange', { ...filterState.dateRange, min: date })}
            placeholder="Start Date"
            onClear={clearStartDate}
          />
        </View>
        <View style={styles.datePickerWrapper}>
          <CrossPlatformDatePicker
            date={filterState.dateRange.max}
            onDateChange={(date) => onUpdateFilter('dateRange', { ...filterState.dateRange, max: date })}
            placeholder="End Date"
            onClear={clearEndDate}
          />
        </View>
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  datePickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden'
  },
  webDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    height: 46
  },
  nativeDateButton: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  clearButton: {
    padding: 4
  },
  iosModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iosModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iosHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  iosCancel: {
    color: '#0ea5e9',
    fontSize: 16
  },
  iosDone: {
    color: '#0ea5e9',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default CrossPlatformDatePicker;
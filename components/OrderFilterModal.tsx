import React, { useState, useRef } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Platform, 
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { Text } from '~/components/ui/text';
import { X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { OrderFilterState } from '@/services/useOrderFilters';
import { formatDate } from './OrderTable';
import { Dropdown } from 'react-native-element-dropdown';
import CrossPlatformDatePicker, { styles } from './CrossPlatformDatePicker';

interface OrderFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filterState: OrderFilterState;
  buyerOptions: string[];
  onUpdateFilter: (key: keyof OrderFilterState, value: any) => void;
  onResetFilters: () => void;
}

const OrderFilterModal: React.FC<OrderFilterModalProps> = ({
  visible,
  onClose,
  filterState,
  buyerOptions,
  onUpdateFilter,
  onResetFilters
}) => {
  
  const [isFocus, setIsFocus] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Track the currently focused input to scroll to it when needed
  const [focusedInput, setFocusedInput] = useState<string | null>(null);


  // Scroll to the input when focused
  const handleInputFocus = (inputName: string, yOffset: number) => {
    setFocusedInput(inputName);
    // Give time for the keyboard to appear before scrolling
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: '80%',
            }}>
              {/* Header */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Filter Orders</Text>
                <TouchableOpacity onPress={() => {
                  Keyboard.dismiss();
                  onClose();
                }}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              >
                {/* Date Range Filter */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Date Range</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={styles.datePickerWrapper}>
                        <CrossPlatformDatePicker
                            date={filterState.dateRange.min}
                            onDateChange={(date) => onUpdateFilter('dateRange', { ...filterState.dateRange, min: date })}
                            placeholder="Start Date"
                            onClear={() => onUpdateFilter('dateRange', { ...filterState.dateRange, min: null })}
                        />
                        </View>
                        <View style={styles.datePickerWrapper}>
                        <CrossPlatformDatePicker
                            date={filterState.dateRange.max}
                            onDateChange={(date) => onUpdateFilter('dateRange', { ...filterState.dateRange, max: date })}
                            placeholder="End Date"
                            onClear={() => onUpdateFilter('dateRange', { ...filterState.dateRange, max: null })}
                        />
                        </View>
                    </View>
                    </View>

                {/* Buyer Filter - Using react-native-element-dropdown */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Buyer</Text>
                  
                  <Dropdown
                    style={{
                      height: 50,
                      borderColor: '#e5e7eb',
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      marginBottom: 10,
                      backgroundColor: isFocus ? '#fff' : '#f9fafb'
                    }}
                    placeholderStyle={{
                      fontSize: 16,
                      color: '#9ca3af'
                    }}
                    selectedTextStyle={{
                      fontSize: 16,
                      color: '#000'
                    }}
                    inputSearchStyle={{
                      height: 40,
                      fontSize: 16,
                      borderColor: 'transparent',
                      borderWidth: 1,
                      borderRadius: 8
                    }}
                    iconStyle={{
                      width: 20,
                      height: 20
                    }}
                    data={buyerOptions.map(buyer => ({ label: buyer, value: buyer }))}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select a buyer' : '...'}
                    searchPlaceholder="Search buyer..."
                    value={filterState.buyer}
                    onFocus={() => {
                      setIsFocus(true);
                      // Dismiss keyboard to show dropdown properly
                      Keyboard.dismiss();
                    }}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      onUpdateFilter('buyer', item.value);
                      setIsFocus(false);
                    }}
                    renderRightIcon={() => (
                      filterState.buyer ? (
                        <TouchableOpacity
                          onPress={() => onUpdateFilter('buyer', null)}
                          style={{ padding: 4 }}
                        >
                          <X size={16} color="#6b7280" />
                        </TouchableOpacity>
                      ) : null
                    )}
                  />
                </View>
                
                {/* Quantity Range Filter */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Quantity Range</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderRadius: 8,
                        padding: 12,
                      }}
                      placeholder="Min Quantity"
                      value={filterState.quantityRange.min}
                      onChangeText={(text) => onUpdateFilter('quantityRange', { ...filterState.quantityRange, min: text })}
                      keyboardType="number-pad"
                      onFocus={() => handleInputFocus('quantityMin', 350)}
                    />
                    <TextInput
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderRadius: 8,
                        padding: 12,
                      }}
                      placeholder="Max Quantity"
                      value={filterState.quantityRange.max}
                      onChangeText={(text) => onUpdateFilter('quantityRange', { ...filterState.quantityRange, max: text })}
                      keyboardType="number-pad"
                      onFocus={() => handleInputFocus('quantityMax', 350)}
                    />
                  </View>
                </View>
                
                {/* Total Cost Range Filter */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Total Cost Range</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderRadius: 8,
                        padding: 12,
                      }}
                      placeholder="Min Total ($)"
                      value={filterState.totalRange.min}
                      onChangeText={(text) => onUpdateFilter('totalRange', { ...filterState.totalRange, min: text })}
                      keyboardType="decimal-pad"
                      onFocus={() => handleInputFocus('totalMin', 450)}
                    />
                    <TextInput
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        borderRadius: 8,
                        padding: 12,
                      }}
                      placeholder="Max Total ($)"
                      value={filterState.totalRange.max}
                      onChangeText={(text) => onUpdateFilter('totalRange', { ...filterState.totalRange, max: text })}
                      keyboardType="decimal-pad"
                      onFocus={() => handleInputFocus('totalMax', 450)}
                    />
                  </View>
                </View>
                
                {/* Buttons */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  marginTop: 10,
                  marginBottom: 60 // Extra padding to ensure buttons are visible with keyboard
                }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: '#f3f4f6',
                      marginRight: 10,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      Keyboard.dismiss();
                      onResetFilters();
                    }}
                  >
                    <Text style={{ color: '#6b7280', fontWeight: 'bold' }}>Reset Filters</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: '#0ea5e9',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      Keyboard.dismiss();
                      onClose();
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default OrderFilterModal;
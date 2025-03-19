import React from 'react';
import { 
  View, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  useWindowDimensions 
} from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { X } from 'lucide-react-native';

import { cardTableStyles } from '~/styles/cardTableStyles';
import { FilterOptions } from '@/types/filters';

interface CardFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filterOptions: FilterOptions;
  selectedGrades: Set<string>;
  selectedStatuses: Set<string>;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  toggleGrade: (grade: string) => void;
  toggleStatus: (status: string) => void;
  handleNumericInput: (
    text: string, 
    setter: React.Dispatch<React.SetStateAction<string>>,
    allowDecimal?: boolean
  ) => void;
  setMinPrice: React.Dispatch<React.SetStateAction<string>>;
  setMaxPrice: React.Dispatch<React.SetStateAction<string>>;
  setMinYear: React.Dispatch<React.SetStateAction<string>>;
  setMaxYear: React.Dispatch<React.SetStateAction<string>>;
  resetFilters: () => void;
}

const CardFilterModal: React.FC<CardFilterModalProps> = ({
  visible,
  onClose,
  filterOptions,
  selectedGrades,
  selectedStatuses,
  minPrice,
  maxPrice,
  minYear,
  maxYear,
  toggleGrade,
  toggleStatus,
  handleNumericInput,
  setMinPrice,
  setMaxPrice,
  setMinYear,
  setMaxYear,
  resetFilters
}) => {
  const { height } = useWindowDimensions();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={cardTableStyles.modalContainer}>
        <View style={cardTableStyles.modalContent}>
          {/* Modal Header */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 16 
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: height * 0.7 }}>
            {/* Grade Filter */}
            <View style={cardTableStyles.filterSection}>
              <Text style={cardTableStyles.filterSectionTitle}>Grade</Text>
              <View style={cardTableStyles.filterOptionsContainer}>
                {filterOptions.grades.map(grade => (
                  <TouchableOpacity 
                    key={grade}
                    onPress={() => toggleGrade(grade)}
                    style={{
                      ...cardTableStyles.filterOption,
                      backgroundColor: selectedGrades.has(grade) ? '#e0f2fe' : '#f3f4f6',
                      borderWidth: selectedGrades.has(grade) ? 1 : 0,
                      borderColor: '#0ea5e9'
                    }}
                  >
                    <Text style={{ 
                      color: selectedGrades.has(grade) ? '#0ea5e9' : '#6b7280',
                      fontWeight: selectedGrades.has(grade) ? 'bold' : 'normal'
                    }}>
                      {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View style={cardTableStyles.filterSection}>
              <Text style={cardTableStyles.filterSectionTitle}>Status</Text>
              <View style={cardTableStyles.filterOptionsContainer}>
                {filterOptions.statuses.map(status => (
                  <TouchableOpacity 
                    key={status}
                    onPress={() => toggleStatus(status)}
                    style={{
                      ...cardTableStyles.filterOption,
                      backgroundColor: selectedStatuses.has(status) ? '#e0f2fe' : '#f3f4f6',
                      borderWidth: selectedStatuses.has(status) ? 1 : 0,
                      borderColor: '#0ea5e9'
                    }}
                  >
                    <Text style={{ 
                      color: selectedStatuses.has(status) ? '#0ea5e9' : '#6b7280',
                      fontWeight: selectedStatuses.has(status) ? 'bold' : 'normal'
                    }}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Year Range Filter */}
            <View style={cardTableStyles.filterSection}>
              <Text style={cardTableStyles.filterSectionTitle}>Year Range</Text>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 8 
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ marginBottom: 4 }}>Minimum Year</Text>
                  <TextInput
                    style={{ 
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontSize: 16,
                      backgroundColor: '#f9fafb'
                    }}
                    value={minYear}
                    onChangeText={(text) => handleNumericInput(text, setMinYear)}
                    keyboardType="numeric"
                    placeholder={filterOptions.minYear}
                  />
                </View>
                <View style={{ width: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ marginBottom: 4 }}>Maximum Year</Text>
                  <TextInput
                    style={{ 
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontSize: 16,
                      backgroundColor: '#f9fafb'
                    }}
                    value={maxYear}
                    onChangeText={(text) => handleNumericInput(text, setMaxYear)}
                    keyboardType="numeric"
                    placeholder={filterOptions.maxYear}
                  />
                </View>
              </View>
            </View>

            {/* Price Range Filter */}
            <View style={cardTableStyles.filterSection}>
              <Text style={cardTableStyles.filterSectionTitle}>Price Range</Text>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 8 
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ marginBottom: 4 }}>Minimum ($)</Text>
                  <TextInput
                    style={{ 
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontSize: 16,
                      backgroundColor: '#f9fafb'
                    }}
                    value={minPrice}
                    onChangeText={(text) => handleNumericInput(text, setMinPrice, true)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={{ width: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ marginBottom: 4 }}>Maximum ($)</Text>
                  <TextInput
                    style={{ 
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      fontSize: 16,
                      backgroundColor: '#f9fafb'
                    }}
                    value={maxPrice}
                    onChangeText={(text) => handleNumericInput(text, setMaxPrice, true)}
                    keyboardType="numeric"
                    placeholder={filterOptions.maxPrice.toString()}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Modal Action Buttons */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginTop: 16, 
            paddingHorizontal: 30, 
            paddingBottom: 20 
          }}>
            <Button variant="outline" onPress={resetFilters}>
              <Text>Reset All</Text>
            </Button>
            <Button onPress={onClose}>
              <Text>Apply Filters</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CardFilterModal;
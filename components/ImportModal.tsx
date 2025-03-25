import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { X, Upload, AlertCircle } from 'lucide-react-native';
import { Button } from '~/components/ui/button';

import { importService } from '@/services/importService';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ visible, onClose, onImportComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await importService.importCards();
      
      if (result) {
        // Import successful
        onImportComplete();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Import Cards</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description}>
              Import your card collection from a CSV file.
              The file must include the following columns:
            </Text>
            
            <View style={styles.requiredColumns}>
              <Text style={styles.requiredColumn}>• Card</Text>
              <Text style={styles.requiredColumn}>• Ask</Text>
              <Text style={styles.requiredColumn}>• Cost</Text>
            </View>
            
            <Text style={styles.optionalText}>
              Optional columns: card_grade, variety, value, status. Cards will be better formatted if optional columns are included.
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text style={styles.loadingText}>Processing import...</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.importButton}
                onPress={handleImport}
              >
                <Upload size={24} color="#0ea5e9" />
                <Text style={styles.importButtonText}>Select CSV File</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Button 
              variant="ghost" 
              onPress={onClose}
              disabled={loading}
            >
              <Text>Cancel</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  requiredColumns: {
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
  },
  requiredColumn: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  optionalText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  importButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  importButtonText: {
    color: '#0ea5e9',
    fontWeight: 'bold',
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#0ea5e9',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default ImportModal;
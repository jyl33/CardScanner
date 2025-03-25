import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';
import { databaseService } from './database';
import { ImportCard } from '@/types/databasePSACard';
import ParseCardDescription from './parseCardDescription';

// Required headers that must be present in the CSV
const REQUIRED_HEADERS = ['card', 'ask', 'cost'];

interface ParseResult {
    valid: boolean;
    data: any[] | null;
    error: string | null;
}

interface FileInfo {
    uri: string | File;
    type: string;
    name: string;
    size: number;
  }


/**
 * Formats a currency string by removing '$' symbol and converting to a number
 * @param value The string value to format (e.g. "$12.50" or "15.75")
 * @returns A number, or null if the value couldn't be parsed
 */
function formatCurrencyToNumber(value: string | number | undefined): number | null {
    // Handle undefined or empty values
    if (value === undefined || value === null || value === '') {
      return null;
    }
  
    // If already a number, return it
    if (typeof value === 'number') {
      return value;
    }
  
    // Convert to string in case it's not
    const valueStr = String(value);
    
    try {
      // Remove dollar sign and any commas
      const cleanedValue = valueStr.replace(/[$,]/g, '').trim();
      
      // Parse as float
      const numericValue = parseFloat(cleanedValue);
      
      // Check if it's a valid number
      if (isNaN(numericValue)) {
        return null;
      }
      
      return numericValue;
    } catch (error) {
      console.warn(`Error formatting currency value: ${value}`, error);
      return null;
    }
  }

export const importService = {
  /**
   * Main function to handle the import process
   */
  async importCards() {
    try {
      // Step 1: Pick a file
      const file = await this.pickFile();
      if (!file) return null; // User cancelled
      
      // Step 2: Read and parse the file
      const fileContent = await this.readFile(file.uri);
      if (!fileContent) return null;
      
      // Step 3: Parse CSV and validate headers
      const result = await this.parseAndValidate(fileContent);
      if (!result.valid) {
        Alert.alert("Import Error", result.error || "Invalid file format");
        return null;
      }

      // And use result.data instead of just data
      const importResult = await this.saveCards(result.data);
      
      // Step 5: Show success message
      Alert.alert(
        "Import Complete", 
        `Successfully imported ${importResult.success} cards. ${importResult.failed} failed.`
      );
      
      return result;
    } catch (error: any) {
      console.error("Import error:", error);
      Alert.alert("Import Error", error.message || "An error occurred during import");
      return null;
    }
  },
  
  /**
   * Pick a file using document picker
   */
  async pickFile(): Promise<FileInfo | null> {
    try {
      if (Platform.OS === 'web') {
        // Create a file input element
        return new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.csv';
          
          input.onchange = (e) => {
            const target = e.target as HTMLInputElement; // Type assertion to ensure target is HTMLInputElement
            const file = target.files ? target.files[0] : null; // Check if files exists
            if (!file) {
              resolve(null);
              return;
            }
            
            resolve({
              uri: file, // Pass the file object directly on web
              type: file.type,
              name: file.name,
              size: file.size
            });
          };
          
          // Trigger the file picker
          input.click();
        });
      } else {
        // Use expo-document-picker for native platforms
        const result = await DocumentPicker.getDocumentAsync({ 
          type: "text/csv", 
          copyToCacheDirectory: true 
        });
        
        if (result.canceled) {
          return null;
        }
        
        return {
          uri: result.assets[0].uri,
          type: 'text/csv',
          name: result.assets[0].name,
          size: result.assets[0].size !== undefined ? result.assets[0].size : 0 // Provide a default value if size is undefined
        };
      }
    } catch (err) {
      console.error("Document picking error:", err);
      throw err;
    }
  },
  
  /**
   * Read file content from URI
   */
  async readFile(uri: string | File): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        // For web, uri might be a File object
        if (uri instanceof File) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target) {
                resolve(e.target.result as string);
              } else {
                reject(new Error('FileReader onload event target is null'));
              }
            };
            reader.onerror = () => {
              reject(new Error('Failed to read file'));
            };
            reader.readAsText(uri);
          });
        } else {
          // Handle case where it might be a string URL on web
          const response = await fetch(uri as string);
          return await response.text();
        }
      } else {
        // For native platforms, uri should be a string path
        const content = await FileSystem.readAsStringAsync(uri as string, {
          encoding: FileSystem.EncodingType.UTF8
        });
        return content;
      }
    } catch (error: any) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  },
  
  /**
   * Parse CSV content and validate headers
   */
  async parseAndValidate(content: string) {
    return new Promise<ParseResult>((resolve) => {
      Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            resolve({
              valid: false,
              error: `CSV parsing error: ${results.errors[0].message}`,
              data: null
            });
            return;
          }
          
        // Check if data exists and has at least one item
        if (!results.data || !Array.isArray(results.data) || results.data.length === 0) {
            resolve({
            valid: false,
            error: "The CSV file contains no data or invalid format",
            data: null
            });
            return;
        }
        
        // Type assertion to tell TypeScript that the first item is an object
        const firstRow = results.data[0] as Record<string, unknown>;
        const headers = Object.keys(firstRow);
          const missingHeaders = REQUIRED_HEADERS.filter(
            requiredHeader => !headers.some(
              header => header.toLowerCase().trim() === requiredHeader.toLowerCase().trim()
            )
          );
          
          if (missingHeaders.length > 0) {
            resolve({
              valid: false,
              error: `Missing required columns: ${missingHeaders.join(', ')}`,
              data: null
            });
            return;
          }
          
          resolve({
            valid: true,
            data: results.data,
            error: null
          });
        },
        error: (error: { message: any; }) => {
          resolve({
            valid: false,
            error: `Failed to parse CSV: ${error.message}`,
            data: null
          });
        }
      });
    });
  },

  
  
  /**
   * Save the cards to the database
   */
  async saveCards(data: Record<string, string>[] | null): Promise<{success: number, failed: number}> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
      
    for (const item of data) {
      try {
        // Map CSV columns to database fields
        // Use lowercase column names for case-insensitive matching
        // Define the type with a string index signature
        const lowerCaseItem: Record<string, string> = {};

        // Now you can safely use string keys
        Object.keys(item).forEach(key => {
            lowerCaseItem[key.toLowerCase().trim()] = item[key];
        });

        const parsedCardInfo = ParseCardDescription(lowerCaseItem.card)
        
       const card: ImportCard = {
          year: parsedCardInfo.year || lowerCaseItem.year || item.Year || "",
          brand: parsedCardInfo.brand || lowerCaseItem.brand || item.Brand || "",
          subject: parsedCardInfo.subject || lowerCaseItem.card || item.Card || "",
          card_grade: parsedCardInfo.card_grade || lowerCaseItem.card_grade || lowerCaseItem.grade || item.Grade || "",
          variety: parsedCardInfo.variety|| lowerCaseItem.variety || item.Variety || "",
          cost: formatCurrencyToNumber(lowerCaseItem.cost) || formatCurrencyToNumber(item.Cost) || 0,
          value: formatCurrencyToNumber(lowerCaseItem.value) || formatCurrencyToNumber(item.Value) || 0,
          status: lowerCaseItem.status || item.Status || "In Stock",
        }; 
        
        await databaseService.createImportCard(card);
        success++;
      } catch (error) {
        console.error("Failed to save card:", error, item);
        failed++;
      }
    }
    
    return { success, failed };
  }
};
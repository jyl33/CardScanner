import { supabase } from '~/utils/supabase'
import  { PSAResponse }  from '~/types/psaResponse'
import { normalizeForDB } from './normalizeForDatabase'
import { DatabasePSACard } from '@/types/DatabasePSACard'

export const psaCardService = {
  async getAll(): Promise<DatabasePSACard[]> {
    const { data, error } = await supabase
      .from('psa_cards')
      .select('*')
    
    if (error) throw error

    return data || []
  },

  async getByCardNumber(certNumber: string): Promise<PSAResponse | null> {
    const { data, error } = await supabase
      .from('psa_cards')
      .select('*')
      .eq('cert_number', certNumber)
      .single()
    
    if (error) throw error
    return data
  },

  async create(card: Omit<PSAResponse, 'id'>): Promise<{ success: boolean; data?: PSAResponse; error?: string }> {

    const normalizedCard = normalizeForDB(card);

    console.log("Creating card:", normalizedCard);

    const { data, error } = await supabase
      .from('psa_cards')
      .insert(normalizedCard.PSACert)
      .select()
      .single()
    
    if (error) {
        console.error("Error creating card:", error);
        return { success: false, error: error.message };
    }

    if (!data) {
        console.error("Row addition was not successful, no data returned.");
        return { success: false, error: "Row addition failed." };
    }

    console.log("Card created:", data);

    return { success: true, data };
  },

  async update(certNumber: string, card: Partial<PSAResponse>): Promise<PSAResponse> {
    const { data, error } = await supabase
      .from('psa_cards')
      .update(card)
      .eq('cert_number', certNumber)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(certNumber: string): Promise<void> {
    const { error } = await supabase
      .from('psa_cards')
      .delete()
      .eq('cert_number', certNumber)
    
    if (error) throw error
  }
}
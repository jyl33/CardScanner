import { supabase } from '~/utils/supabase'
import  { PSAResponse }  from '~/types/psaResponse'
import { normalizeForDB } from './normalizeForDatabase'
import { DatabasePSACard, databasePSACardResponse } from '~/types/databasePSACard'
import { Buyer } from '@/types/buyer'
import { CreateOrder, CreateOrderItem, Order, OrderItem, OrderItemResponse, OrderResponse} from '@/types/order'
export const databaseService = {

  /* All PSA_CARD Helper Functions Here */

  async getAllCards(): Promise<DatabasePSACard[]> {
    const { data, error } = await supabase
      .from('psa_cards')
      .select('*')
    
    if (error) throw error

    return data || []
  },

  async getInStockCards(): Promise<DatabasePSACard[]> {
    const { data, error } = await supabase
      .from('psa_cards')
      .select('*')
      .eq('status', 'In Stock') // Filter for cards with status 'In Stock'
    
    if (error) throw error

    return data || []
  },

  async getByCardNumber(certNumber: string): Promise<DatabasePSACard | null> {
    const { data, error } = await supabase
      .from('psa_cards')
      .select('*')
      .eq('cert_number', certNumber)
      .single()
    
    if (error) {
      console.log("error while fetching card from db", error)
    }
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

  async updateCard(card_id: number, card: Partial<DatabasePSACard>): Promise<{ success: boolean; data?: databasePSACardResponse; error?: string }> {
    const { data, error } = await supabase
      .from('psa_cards')
      .update(card)
      .eq('id', card_id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCard(certNumber: string): Promise<void> {
    const { error } = await supabase
      .from('psa_cards')
      .delete()
      .eq('cert_number', certNumber)
    
    if (error) throw error
  },

  /* All Buyer Helper Functions Here */

  async getAllBuyers(): Promise<Buyer[]> {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
    
    if (error) throw error

    return data;
  },


  /* All Order Helper Functions Here */

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')

    if (error) throw error

    return data;
  },

  async createOrder(buyerId : string, buyerName: string, totalCost: number, quantity: number): Promise<{ success: boolean; data?: OrderResponse; error?: string }> {

    console.log("Creating order:");

    const newOrder : CreateOrder = {
      buyer_id: buyerId,
      buyer_name: buyerName,
      total_cost: totalCost,
      quantity: quantity
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(newOrder)
      .select()
      .single()
    
    if (error) {
        console.error("Error creating order:", error);
        return { success: false, error: error.message };
    }

    if (!data) {
        console.error("Row addition was not successful, no data returned.");
        return { success: false, error: "Row addition failed." };
    }

    console.log("Order created:", data);

    return { success: true, data };
  },

  async deleteOrder(orderId: string): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    console.log("Attempted to delete order");
    
    if (error) {
      console.error("Error deleting order:", error);
      return false; // Return false if there was an error
    }

    return true; // Return true if deletion was successful
  },

  async updateOrder(order_id: string, order: Partial<Order>): Promise<{ success: boolean; data?: OrderResponse; error?: string }> {
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', order_id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /* ALL Order Item Helper Functions Here */

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    if (error) throw error

    return data;
  },

  async createOrderItem(orderItem: CreateOrderItem): Promise<{ success: boolean; data?: OrderItemResponse; error?: string }> {
    const { data, error } = await supabase  
      .from('order_items')
      .insert(orderItem)
      .select()
      .single()

    if (error) {
        console.error("Error creating order item:", error);
        return { success: false, error: error.message };
    }

    if (!data) {
        console.error("Row addition was not successful, no data returned.");
        return { success: false, error: "Row addition failed." };
    }

    console.log("Order item created:", data);

    return { success: true, data };
    
  },

  async deleteOrderItem(orderItemId: string): Promise<boolean> {
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', orderItemId)

    console.log("Attempted to delete order item");
    
    if (error) {
      console.error("Error deleting order item:", error);
      return false; // Return false if there was an error
    }

    return true; // Return true if deletion was successful
  },

}
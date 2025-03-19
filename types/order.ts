// Base Order Item type
export type OrderItem = {
  id: string;
  card_name: string;
  card_grade: string;
  order_id: string;
  card_id: number;
  quantity: number;
  price: number;
  value: number;
  created_at: string;
};

// For creating a new order item
export type CreateOrderItem = {
  order_id: string;
  card_name: string;
  card_grade: string;
  card_id: number;
  quantity: number;
  value: number;
  price: number;
};

// Order is always combined with items since they're required
export type Order = {
  id: string;
  buyer_id: string;
  buyer_name: string;
  order_number: string;
  total_cost: number;
  order_date: string;
  created_at: string;
  updated_at: string;
  quantity: number;
  items?: OrderItem[];  // Always required
};

// Type for creating a new order (items required)
export type CreateOrder = {
  buyer_id: string;
  buyer_name: string;
  total_cost?: number;
  order_date?: string;
  quantity?: number;
  items?: [CreateOrderItem, ...CreateOrderItem[]];  
};

// Type for updating an order
export type UpdateOrder = {
  buyer_id?: string;
  buyer_name?: string;
  total_cost?: number;
  items?: [CreateOrderItem, ...CreateOrderItem[]];
};

// Database response type
export interface OrderResponse {
  id: string;
  data: Order | null;
  error: Error | null;
}

export interface OrderItemResponse {
  id: string;
  data: OrderItem | null;
  error: Error | null;
}
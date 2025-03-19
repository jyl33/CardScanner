export type Buyer = {
    id: string;  // UUID is represented as string in TypeScript
    name: string;
    primary_contact: string;
    email: string;
    phone: string | null;  // Optional field
    address: string | null;  // Optional field
    created_at: string;  // ISO timestamp string
    updated_at: string;  // ISO timestamp string
  };
  
  // You might also want a type for creating a new buyer where
  // id and timestamps are not required
  export type CreateBuyer = {
    name: string;
    primary_contact: string;
    email: string;
    phone?: string;
    address?: string;
  };
  
  // Type for updating a buyer where all fields are optional
  export type UpdateBuyer = Partial<Omit<CreateBuyer, 'name' | 'email'>> & {
    name?: string;
    primary_contact: string;
    email?: string;
  };
  
  // Database response type (useful for Supabase queries)
  export type BuyerResponse = {
    data: Buyer | null;
    error: Error | null;
  };
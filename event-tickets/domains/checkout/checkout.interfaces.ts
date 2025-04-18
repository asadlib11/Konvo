interface Checkout {
    id: string;
    eventId: string;
    ticketTypeId: string;
    quantity: number;
    status: CheckoutStatus;
    expiresAt?: Date;
  }
  
enum CheckoutStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    EXPIRED = 'EXPIRED'
}
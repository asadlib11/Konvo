interface Event {
    id: string;
    name: string;
    date: Date;
    venue: string;
    ticketTypes: TicketType[];
}

interface EventRepository {
    create(event: Omit<Event, 'id'>): Promise<Event>;
    findById(id: string): Promise<Event | null>;
    updateTicketInventory(eventId: string, ticketTypeId: string, quantity: number): Promise<void>;
}
  
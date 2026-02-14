import { Event } from '../types';
export declare const eventsApi: {
    getAll: () => Promise<{
        events: Event[];
    }>;
    getById: (id: string) => Promise<{
        event: Event;
    }>;
    create: (data: Omit<Event, "id" | "createdAt" | "updatedAt" | "createdBy">) => Promise<{
        message: string;
        event: Event;
    }>;
    update: (id: string, data: Partial<Event>) => Promise<{
        message: string;
        event: Event;
    }>;
    delete: (id: string) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=events.d.ts.map
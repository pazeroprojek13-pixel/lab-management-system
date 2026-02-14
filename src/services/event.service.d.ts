export interface CreateEventInput {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    location: string;
    createdById: string;
    campusId?: string;
}
export interface UpdateEventInput {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    campusId?: string;
}
export interface FindAllOptions {
    campusId?: string;
    userId?: string;
}
export declare class EventService {
    findAll(options?: FindAllOptions): Promise<any>;
    findById(id: string): Promise<any>;
    create(input: CreateEventInput): Promise<any>;
    update(id: string, input: UpdateEventInput): Promise<any>;
    delete(id: string): Promise<any>;
}
export declare const eventService: EventService;
//# sourceMappingURL=event.service.d.ts.map
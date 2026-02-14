export interface CreateCampusInput {
    name: string;
    code: string;
    location?: string;
    description?: string;
}
export interface UpdateCampusInput {
    name?: string;
    code?: string;
    location?: string;
    description?: string;
}
export interface FindAllOptions {
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class CampusService {
    findAll(options?: FindAllOptions): Promise<PaginatedResult<any>>;
    findById(id: string, includeDeleted?: boolean): Promise<any>;
    findByCode(code: string, includeDeleted?: boolean): Promise<any>;
    create(input: CreateCampusInput): Promise<any>;
    update(id: string, input: UpdateCampusInput): Promise<any>;
    softDelete(id: string): Promise<any>;
    restore(id: string): Promise<any>;
    hardDelete(id: string): Promise<any>;
}
export declare const campusService: CampusService;
//# sourceMappingURL=campus.service.d.ts.map
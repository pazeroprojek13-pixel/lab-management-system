export interface AutomationRunResult {
    processed: number;
    created: number;
}
export declare class AutomationService {
    runWarrantyCheck(): Promise<AutomationRunResult>;
    runIncidentEscalationCheck(): Promise<AutomationRunResult>;
    runMaintenanceOverdueCheck(): Promise<AutomationRunResult>;
    private createNotificationsIfNotExists;
}
export declare const automationService: AutomationService;
//# sourceMappingURL=automation.service.d.ts.map
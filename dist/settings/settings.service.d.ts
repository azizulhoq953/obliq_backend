type SettingsState = {
    timezone: string;
    locale: string;
    businessName: string;
};
export declare class SettingsService {
    private state;
    getAll(): SettingsState;
    update(partial: Partial<SettingsState>): SettingsState;
}
export {};

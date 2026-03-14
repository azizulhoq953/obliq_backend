import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getAll(): {
        timezone: string;
        locale: string;
        businessName: string;
    };
    update(body: any): {
        timezone: string;
        locale: string;
        businessName: string;
    };
}

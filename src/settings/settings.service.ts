import { Injectable } from '@nestjs/common';

type SettingsState = {
  timezone: string;
  locale: string;
  businessName: string;
};

@Injectable()
export class SettingsService {
  private state: SettingsState = {
    timezone: 'UTC',
    locale: 'en',
    businessName: 'Obliq',
  };

  getAll() {
    return this.state;
  }

  update(partial: Partial<SettingsState>) {
    this.state = {
      ...this.state,
      ...partial,
    };

    return this.state;
  }
}
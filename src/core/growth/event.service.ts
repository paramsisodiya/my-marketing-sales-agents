import { IEventRecord } from '../types/growth.types';
import { DatabaseService } from '../database/db.service';

export class EventService {
  private static instance: EventService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  public logEvent(eventName: string, params?: { anonymousId?: string; leadId?: string; metadata?: Record<string, any> }): IEventRecord {
    const event: IEventRecord = {
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      eventName,
      anonymousId: params?.anonymousId,
      leadId: params?.leadId,
      metadata: params?.metadata,
      createdAt: new Date().toISOString(),
    };

    this.db.saveEvent(event);
    return event;
  }

  public getEventStats(): Record<string, number> {
    const events = this.db.getEvents();
    const stats: Record<string, number> = {};
    for (const evt of events) {
      stats[evt.eventName] = (stats[evt.eventName] || 0) + 1;
    }
    return stats;
  }
}

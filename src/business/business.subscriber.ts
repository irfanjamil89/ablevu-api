import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { SyncService } from 'src/sync/sync.service';
import { Business } from 'src/entity/business.entity';

@EventSubscriber()
@Injectable()
export class BusinessSubscriber implements EntitySubscriberInterface<Business> {
  constructor(
    @InjectDataSource() readonly dataSource: DataSource,
    @Inject(forwardRef(() => SyncService))
    private readonly syncService: SyncService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Business;
  }

async afterUpdate(event: UpdateEvent<Business>): Promise<void> {
  const id = event.entity?.id ?? event.databaseEntity?.id;
  if (!id) return;

  setImmediate(async () => {
    await this.handleSync(id);
  });
}

async afterInsert(event: InsertEvent<Business>): Promise<void> {
  const id = event.entity?.id;
  if (!id) return;

  setImmediate(async () => {
    await this.handleSync(id);
  });
}

  private async handleSync(businessId: string): Promise<void> {
    if (!businessId) return;

    try {
      console.log(`[BusinessSubscriber] Auto-syncing: ${businessId}`);
      await this.syncService.syncSingleBusiness(businessId);
      console.log(`[BusinessSubscriber] ✅ Sync complete: ${businessId}`);
    } catch (error) {
      console.error(`[BusinessSubscriber] ❌ Sync failed: ${businessId}`, error);
    }
  }
}
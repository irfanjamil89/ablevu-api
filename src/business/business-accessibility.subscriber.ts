import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BusinessAccessibleFeature } from 'src/entity/business_accessiblity_feature.entity';
import { SyncService } from 'src/sync/sync.service';

@EventSubscriber()
@Injectable()
export class BusinessAccessibilitySubscriber
  implements EntitySubscriberInterface<BusinessAccessibleFeature>
{
  constructor(
    @InjectDataSource() readonly dataSource: DataSource,
    @Inject(forwardRef(() => SyncService))
    private readonly syncService: SyncService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return BusinessAccessibleFeature;
  }

  async afterInsert(event: InsertEvent<BusinessAccessibleFeature>): Promise<void> {
    const id = event.entity?.business_id;
    if (!id) return;
    setImmediate(async () => await this.syncService.syncSingleBusiness(id));
  }

  async afterUpdate(event: UpdateEvent<BusinessAccessibleFeature>): Promise<void> {
    const id = event.entity?.business_id ?? event.databaseEntity?.business_id;
    if (!id) return;
    setImmediate(async () => await this.syncService.syncSingleBusiness(id));
  }

  async afterRemove(event: RemoveEvent<BusinessAccessibleFeature>): Promise<void> {
    const id = event.entity?.business_id ?? event.databaseEntity?.business_id;
    if (!id) return;
    setImmediate(async () => await this.syncService.syncSingleBusiness(id));
  }
}

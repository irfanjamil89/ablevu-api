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
import { BusinessLinkedType } from 'src/entity/business_linked_type.entity';
import { SyncService } from 'src/sync/sync.service';      

@EventSubscriber()
@Injectable()
export class BusinessLinkedTypeSubscriber
  implements EntitySubscriberInterface<BusinessLinkedType>
{
  constructor(
    @InjectDataSource() readonly dataSource: DataSource,
    @Inject(forwardRef(() => SyncService))
    private readonly syncService: SyncService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return BusinessLinkedType;
  }

  async afterInsert(event: InsertEvent<BusinessLinkedType>): Promise<void> {
    const id = event.entity?.business_id;
    if (!id) return;
    setImmediate(async () => await this.syncService.syncSingleBusiness(id));
  }

  async afterUpdate(event: UpdateEvent<BusinessLinkedType>): Promise<void> {
    const id = event.entity?.business_id ?? event.databaseEntity?.business_id;
    if (!id) return;
    setImmediate(async () => await this.syncService.syncSingleBusiness(id));
  }

  async afterRemove(event: RemoveEvent<BusinessLinkedType>): Promise<void> {
    const id = event.entity?.business_id ?? event.databaseEntity?.business_id;
    if (!id) return;
    setImmediate(async () => await this.syncService.syncSingleBusiness(id));
  }
}

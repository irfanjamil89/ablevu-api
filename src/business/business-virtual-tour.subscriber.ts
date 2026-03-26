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
import { BusinessVirtualTour } from 'src/entity/business_virtual_tours.entity';
import { SyncService } from 'src/sync/sync.service';  

@EventSubscriber()
@Injectable()
export class BusinessVirtualTourSubscriber
  implements EntitySubscriberInterface<BusinessVirtualTour>
{
  constructor(
    @InjectDataSource() readonly dataSource: DataSource,
    @Inject(forwardRef(() => SyncService))
    private readonly syncService: SyncService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return BusinessVirtualTour;
  }

  async afterInsert(event: InsertEvent<BusinessVirtualTour>): Promise<void> {
    const businessId = event.entity?.business?.id;
    if (!businessId) return;
    setImmediate(async () => await this.syncService.syncSingleBusiness(businessId));
  }

  async afterUpdate(event: UpdateEvent<BusinessVirtualTour>): Promise<void> {
    const businessId =
      event.entity?.business?.id ??
      event.databaseEntity?.business?.id;
    if (!businessId) return;
    setImmediate(async () => await this.syncService.syncSingleBusiness(businessId));
  }

  async afterRemove(event: RemoveEvent<BusinessVirtualTour>): Promise<void> {
    const businessId =
      event.entity?.business?.id ??
      event.databaseEntity?.business?.id;
    if (!businessId) return;
    setImmediate(async () => await this.syncService.syncSingleBusiness(businessId));
  }
}
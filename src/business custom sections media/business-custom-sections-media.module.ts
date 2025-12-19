import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessCustomSectionsMedia } from "src/entity/business-custom-sections-media.entity";
import { BusinessCustomSectionsMediaController } from './business-custom-sections-media.controller';
import { BusinessCustomSectionsMediaService } from './business-custom-sections-media.service';

@Module({
    imports: [TypeOrmModule.forFeature([BusinessCustomSectionsMedia])],
    providers: [BusinessCustomSectionsMediaService],
    controllers: [BusinessCustomSectionsMediaController],
    exports: [BusinessCustomSectionsMediaService]
})
export class BusinessCustomSectionsMediaModule { }
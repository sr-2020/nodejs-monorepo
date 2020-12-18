import { kAllImplants } from '../scripts/character/implants_library';
import { kAllPills } from '../scripts/character/chemo_library';
import { kAllReagents } from '../scripts/qr/reagents_library';
import { kAllEthicGroups } from '../scripts/character/ethics_library';
import { kAllDrones } from '@alice/sr2020-model-engine/scripts/qr/drone_library';
import { Feature } from '@alice/sr2020-common/models/sr2020-character.model';
import { getAllFeatures } from '@alice/sr2020-model-engine/scripts/character/features';
import { kAllFocuses } from '@alice/sr2020-model-engine/scripts/qr/focus_library';
import { kALlCyberDecks } from '@alice/sr2020-model-engine/scripts/qr/cyberdeck_library';
import { kAllSoftware } from '@alice/sr2020-model-engine/scripts/qr/software_library';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Dictionaries')
export class DictionariesController {
  @Get('/features')
  @ApiOperation({ summary: `Returns the list of implemented character features with their names and descriptions` })
  @ApiResponse({ status: 200 })
  features(): Feature[] {
    return getAllFeatures();
  }

  @Get('/implants')
  @ApiOperation({ summary: `Returns the list of implemented implants` })
  @ApiResponse({ status: 200 })
  implants() {
    return kAllImplants.map((it) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { modifiers, onInstallEvent, onRemoveEvent, ...rest } = it;
      return rest;
    });
  }

  @Get('/pills')
  @ApiOperation({ summary: `Returns the list of implemented pills` })
  @ApiResponse({ status: 200 })
  pills(): { id: string; name: string }[] {
    return kAllPills.map((p) => ({ id: p.id, name: p.name }));
  }

  @Get('/reagents')
  @ApiOperation({ summary: `Returns the list of implemented reagents` })
  @ApiResponse({ status: 200 })
  reagents(): { id: string; name: string }[] {
    return kAllReagents;
  }

  @Get('/drones')
  @ApiOperation({ summary: `Returns the list of implemented drones` })
  @ApiResponse({ status: 200 })
  drones(): { id: string; name: string; description: string }[] {
    return kAllDrones.map((p) => ({ id: p.id, name: p.name, description: p.description }));
  }

  @Get('/cyberdecks')
  @ApiOperation({ summary: `Returns the list of implemented cyberdecks` })
  @ApiResponse({ status: 200 })
  cyberdecks(): { id: string; name: string; description: string }[] {
    return kALlCyberDecks.map((p) => ({ id: p.id, name: p.name, description: p.description }));
  }

  @Get('/software')
  @ApiOperation({ summary: `Returns the list of implemented software` })
  @ApiResponse({ status: 200 })
  software(): { id: string; name: string; description: string }[] {
    return kAllSoftware.map((p) => ({ id: p.id, name: p.name, description: p.description }));
  }

  @Get('/focuses')
  @ApiOperation({ summary: `Returns the list of implemented magic focuses` })
  @ApiResponse({ status: 200 })
  focuses(): { id: string; name: string }[] {
    return kAllFocuses.map((p) => ({ id: p.id, name: p.name }));
  }

  @Get('/ethic_groups')
  @ApiOperation({ summary: `Returns the list of implemented ethic groups` })
  @ApiResponse({ status: 200 })
  ethicGroups(): { id: string; name: string }[] {
    return kAllEthicGroups.map((p) => ({ id: p.id, name: p.name }));
  }
}

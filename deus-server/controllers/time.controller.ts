import {Get, JsonController} from 'routing-controllers';
import { currentTimestamp } from '../utils';

@JsonController()
export class TimeController {
    @Get('/time')
    public get() {
       return {serverTime: currentTimestamp()};
    }
}

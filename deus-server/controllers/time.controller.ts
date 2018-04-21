import {JsonController, Get} from "routing-controllers";
import { currentTimestamp } from "../utils";

@JsonController()
export class TimeController {
    @Get("/time")
    get() {
       return {serverTime: currentTimestamp()};
    }
}
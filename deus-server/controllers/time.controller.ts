import {JsonController, Get} from "routing-controllers";

@JsonController()
export class TimeController {
    @Get("/time")
    get() {
       return {serverTime: new Date().valueOf()};
    }
}
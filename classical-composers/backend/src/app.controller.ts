import { Controller, Get, Param } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {
	}

	@Get('composers')
	getComposers() {
	  return this.appService.getComposers();
	}
  
	@Get('composers/:id')
	async getComposerById(@Param('id') id: string) {
	  return this.appService.getComposerById(id);
	}
}

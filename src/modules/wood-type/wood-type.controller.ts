import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { WoodTypeService } from './wood-type.service';

@Controller('wood-types')
export class WoodTypeController {
    constructor(private readonly woodTypeService: WoodTypeService) { }

    @Get()
    async getAll() {
        return this.woodTypeService.getAll();
    }

    @Post()
    async create(@Body() body: { name: string; description?: string }) {
        return this.woodTypeService.create(body);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: { name?: string; description?: string },
    ) {
        return this.woodTypeService.update(id, body);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.woodTypeService.delete(id);
    }
}

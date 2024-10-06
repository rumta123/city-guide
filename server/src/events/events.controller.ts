import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from '../entities/event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Post()
  create(@Body() event: Event): Promise<Event> {
    return this.eventsService.create(event);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.eventsService.remove(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() event: Event): Promise<Event> {
    return this.eventsService.update(id, event);
  }
}

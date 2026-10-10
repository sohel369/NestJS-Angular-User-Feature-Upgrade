import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated dashboard metrics from PostgreSQL' })
  @ApiResponse({ status: 200, description: 'Aggregated analytics data returned.' })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getAggregatedStats();
  }

  @Post('trigger-event')
  @ApiOperation({ summary: 'Trigger a simulated real-time event manually' })
  @ApiResponse({ status: 201, description: 'Event generated and recorded in PostgreSQL.' })
  async triggerSimulatedEvent() {
    return this.dashboardService.recordSimulatedLiveEvent();
  }
}

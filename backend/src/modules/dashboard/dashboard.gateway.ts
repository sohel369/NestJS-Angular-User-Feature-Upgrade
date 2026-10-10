import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { DashboardService } from './dashboard.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DashboardGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DashboardGateway.name);
  private intervalTimer: NodeJS.Timeout;

  constructor(private readonly dashboardService: DashboardService) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway initialized for Dashboard Real-Time Updates');

    // Periodic live aggregation broadcaster (pushes updates to connected Angular clients every 5s)
    this.intervalTimer = setInterval(async () => {
      try {
        // Occasionally emit a new simulated live event into the stream
        if (Math.random() > 0.4) {
          const liveEvent = await this.dashboardService.recordSimulatedLiveEvent();
          if (liveEvent) {
            this.server.emit('newActivityStream', liveEvent);
          }
        }

        const stats = await this.dashboardService.getAggregatedStats();
        this.server.emit('dashboardStatsUpdated', stats);
      } catch (err) {
        this.logger.error('Error broadcasting dashboard stats over WebSocket', err);
      }
    }, 5000);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to real-time WebSocket: ${client.id}`);
    // Send immediate initial stats payload upon connection
    this.dashboardService.getAggregatedStats().then((stats) => {
      client.emit('dashboardStatsUpdated', stats);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from WebSocket: ${client.id}`);
  }

  @SubscribeMessage('requestStats')
  async handleRequestStats(client: Socket): Promise<void> {
    const stats = await this.dashboardService.getAggregatedStats();
    client.emit('dashboardStatsUpdated', stats);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket): string {
    return 'pong';
  }
}

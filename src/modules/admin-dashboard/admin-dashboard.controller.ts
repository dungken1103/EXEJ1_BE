import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
// You might want to add AdminGuard here later
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
// import { Role } from '@prisma/client';

@Controller('admin/dashboard')
export class AdminDashboardController {
    constructor(private readonly dashboardService: AdminDashboardService) { }

    @Get('stats')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.ADMIN)
    async getStats() {
        return this.dashboardService.getStats();
    }
}

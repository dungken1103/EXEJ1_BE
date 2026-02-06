import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus, Role } from '@prisma/client';

@Injectable()
export class AdminDashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getStats() {
        const [
            totalRevenueAggregate,
            totalOrders,
            pendingOrders,
            totalUsers,
            totalProducts,
            lowStockProducts,
            recentOrders,
        ] = await Promise.all([
            // 1. Total Revenue (sum of all orders that are not CANCELLED)
            this.prisma.order.aggregate({
                _sum: { total: true },
                where: {
                    status: { not: OrderStatus.CANCELLED },
                },
            }),

            // 2. Total Orders
            this.prisma.order.count(),

            // 3. Pending Orders
            this.prisma.order.count({
                where: { status: OrderStatus.PENDING },
            }),

            // 4. Total Users
            this.prisma.user.count({
                where: { role: Role.USER },
            }),

            // 5. Total Products
            this.prisma.product.count(),

            // 6. Low Stock Products (stock <= 5)
            this.prisma.product.count({
                where: { stock: { lte: 5 } },
            }),

            // 7. Recent Orders (limit 5)
            this.prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true },
                    },
                },
            }),
        ]);

        // Calculate monthly sales (simple version: last 6 months)
        // Note: Doing this in raw SQL might be faster but for simplicity we can structure it here or add a separate query if needed.
        // For now, let's just return the aggregate stats. If we need charts, we might need grouping.

        // Group orders by status for Charts
        const ordersByStatus = await this.prisma.order.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        return {
            totalRevenue: totalRevenueAggregate._sum.total || 0,
            totalOrders,
            pendingOrders,
            totalUsers,
            totalProducts,
            lowStockProducts,
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                customer: order.userAddress ? (order.userAddress as any).fullName : order.user?.name || 'Guest',
                date: order.createdAt,
                total: order.total,
                status: order.status,
            })),
            ordersByStatus: ordersByStatus.reduce((acc, curr) => {
                acc[curr.status] = curr._count.id;
                return acc;
            }, {}),
        };
    }
}

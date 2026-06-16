import { InventoryAlertLevel, ShipmentStatus, SupplierStatus } from '../constants/enums.js';
import { inventories, shipments, suppliers, warehouses } from '../database/seeds/initial.js';

function getSupplierOnTimeRate(supplierId: string) {
  const deliveredShipments = shipments.filter(
    (item) => item.supplierId === supplierId && item.status === ShipmentStatus.DELIVERED && item.actualArrival,
  );
  const total = deliveredShipments.length;
  if (total === 0) return { onTimeRate: 0, onTimeCount: 0, totalDelivered: 0 };
  const onTimeCount = deliveredShipments.filter((item) => new Date(item.actualArrival!) <= new Date(item.estimatedArrival)).length;
  return { onTimeRate: Number(((onTimeCount / total) * 100).toFixed(1)), onTimeCount, totalDelivered: total };
}

export class DashboardService {
  stats() {
    const shipmentStatus = Object.values(ShipmentStatus).map((status) => ({ status, count: shipments.filter((item) => item.status === status).length }));
    const ratingBuckets = [
      { label: '1-2', count: suppliers.filter((item) => item.rating >= 1 && item.rating < 2).length },
      { label: '2-3', count: suppliers.filter((item) => item.rating >= 2 && item.rating < 3).length },
      { label: '3-4', count: suppliers.filter((item) => item.rating >= 3 && item.rating < 4).length },
      { label: '4-5', count: suppliers.filter((item) => item.rating >= 4 && item.rating <= 5).length },
    ];
    const suppliersWithOnTime = suppliers.map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      rating: supplier.rating,
      ...getSupplierOnTimeRate(supplier.id),
    }));
    const onTimeRateBuckets = [
      { label: '0-60%', count: suppliersWithOnTime.filter((item) => item.totalDelivered > 0 && item.onTimeRate < 60).length },
      { label: '60-80%', count: suppliersWithOnTime.filter((item) => item.onTimeRate >= 60 && item.onTimeRate < 80).length },
      { label: '80-95%', count: suppliersWithOnTime.filter((item) => item.onTimeRate >= 80 && item.onTimeRate < 95).length },
      { label: '95-100%', count: suppliersWithOnTime.filter((item) => item.onTimeRate >= 95 && item.onTimeRate <= 100).length },
    ];
    const topSuppliersByOnTime = suppliersWithOnTime
      .filter((item) => item.totalDelivered > 0)
      .sort((a, b) => b.onTimeRate - a.onTimeRate)
      .slice(0, 5);
    return {
      cards: {
        inTransitShipments: shipments.filter((item) => [ShipmentStatus.SHIPPED, ShipmentStatus.IN_TRANSIT].includes(item.status)).length,
        pendingReceiveShipments: shipments.filter((item) => item.status === ShipmentStatus.IN_TRANSIT).length,
        lowInventoryAlerts: inventories.filter((item) => [InventoryAlertLevel.LOW, InventoryAlertLevel.CRITICAL].includes(item.alertLevel)).length,
        activeSuppliers: suppliers.filter((item) => item.status === SupplierStatus.ACTIVE).length,
      },
      shipmentStatus,
      ratingBuckets,
      onTimeRateBuckets,
      topSuppliersByOnTime,
      recentShipments: shipments.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10),
      inventoryAlerts: inventories
        .filter((item) => [InventoryAlertLevel.LOW, InventoryAlertLevel.CRITICAL].includes(item.alertLevel))
        .map((item) => ({ ...item, warehouseName: warehouses.find((warehouse) => warehouse.id === item.warehouseId)?.name ?? '-' })),
    };
  }
}

export const dashboardService = new DashboardService();

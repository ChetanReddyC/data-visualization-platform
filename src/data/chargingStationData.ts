// Charging station metrics data for visualization
export interface ChargingStationMetrics {
  months: string[];
  utilizationRates: number[];         // % of time stations are in use
  energyDelivered: number[];          // kWh delivered per month
  unsatisfiedDemand: number[];        // % of demand not met due to unavailability
  averageChargingTime: number[];      // minutes
  peakHourUsage: number[];            // % utilization during peak hours
}

export const chargingStationData: ChargingStationMetrics = {
  months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  
  // Utilization rate percentages (65-85%)
  utilizationRates: [68, 72, 77, 85, 82, 75, 79],
  
  // Energy delivered in kWh
  energyDelivered: [42500, 46800, 52300, 61500, 58700, 51200, 55900],
  
  // Percentage of unsatisfied demand
  unsatisfiedDemand: [12, 10, 8, 15, 9, 7, 11],
  
  // Average charging time in minutes
  averageChargingTime: [32, 35, 31, 38, 36, 33, 34],
  
  // Peak hour usage percentage
  peakHourUsage: [92, 88, 95, 98, 93, 87, 91]
}; 
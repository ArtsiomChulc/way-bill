export type SeasonCode = 'л' | 'з';

export interface Vehicle {
    id: string;
    user_id: string;
    brand: string;
    plate_number: string;
    fuel_card: string;
    summer_city: number;
    summer_highway: number;
    winter_city: number;
    winter_highway: number;
    summer_trailer_city: number;
    summer_trailer_highway: number;
    winter_trailer_city: number;
    winter_trailer_highway: number;
    current_odometer: number;
    current_fuel: number;
    is_active: boolean;
}

export interface Driver {
    id: string;
    user_id: string;
    full_name: string;
    license_number: string;
    is_active: boolean;
}

export interface WaybillTrip {
    id: string;
    departure_time: string;       // например: '08:00'
    return_time: string;          // например: '20:00'
    season: SeasonCode;           // 'л' (лето) или 'з' (зима)
    km_city: number;              // пробег город, км
    km_highway: number;           // пробег трасса, км
    km_trailer_city: number;      // пробег город с прицепом, км
    km_trailer_highway: number;   // пробег трасса с прицепом, км
    fuel_added: number;           // заправлено топлива, л
    fuel_actual: number | null;   // фактический расход (если null — равен норме)
    route: string;                // маршрут следования
    driver_id: string;            // ID водителя из справочника
}

export interface CalculatedTrip extends WaybillTrip {
    odometer_start: number;
    odometer_end: number;
    km_total: number;
    fuel_start: number;
    fuel_norm: number;
    fuel_fact_computed: number;
    fuel_end: number;
    fuel_diff: number;            // экономия (+) / перерасход (-)
    driver_name: string;
}

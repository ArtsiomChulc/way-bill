import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { supabase } from '../supabase/client';
import { authStore } from './AuthStore';
import type {
    CalculatedTrip,
    Driver,
    SeasonCode,
    Vehicle,
    WaybillTrip,
} from '../types/waybill';

export class WaybillStore {
    vehicles: Vehicle[] = [];
    drivers: Driver[] = [];

    selectedVehicleId: string = '';
    waybillDate: string = new Date().toISOString().slice(0, 10);
    defaultSeason: SeasonCode = 'л';
    initialOdometer: number = 0;
    initialFuel: number = 0;
    trips: WaybillTrip[] = [];

    isLoading = false;
    saveStatus: 'saved' | 'saving' | 'error' = 'saved';

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    // Сброс состояния при выходе из аккаунта или смене пользователя
    reset() {
        this.vehicles = [];
        this.drivers = [];
        this.selectedVehicleId = '';
        this.waybillDate = new Date().toISOString().slice(0, 10);
        this.defaultSeason = 'л';
        this.initialOdometer = 0;
        this.initialFuel = 0;
        this.trips = [];
        this.isLoading = false;
        this.saveStatus = 'saved';
    }

    get selectedVehicle(): Vehicle | undefined {
        return this.vehicles.find((v) => v.id === this.selectedVehicleId);
    }

    // Цепочный расчёт всех поездок путевого листа (как в формулах Excel)
    get calculatedTrips(): CalculatedTrip[] {
        const vehicle = this.selectedVehicle;
        let prevOdometer = Number(this.initialOdometer) || 0;
        let prevFuel = Number(this.initialFuel) || 0;

        return this.trips.map((trip) => {
            const kmCity = Number(trip.km_city) || 0;
            const kmHighway = Number(trip.km_highway) || 0;
            const kmTrCity = Number(trip.km_trailer_city) || 0;
            const kmTrHighway = Number(trip.km_trailer_highway) || 0;
            const kmTotal = kmCity + kmHighway + kmTrCity + kmTrHighway;

            const odoStart = prevOdometer;
            const odoEnd = odoStart + kmTotal;

            // Расчёт расхода по норме в зависимости от сезона (л / з)
            let normRaw = 0;
            if (vehicle) {
                const isWinter = trip.season === 'з';
                const rCity = isWinter ? vehicle.winter_city : vehicle.summer_city;
                const rHwy = isWinter ? vehicle.winter_highway : vehicle.summer_highway;
                const rTrCity = isWinter
                    ? vehicle.winter_trailer_city
                    : vehicle.summer_trailer_city;
                const rTrHwy = isWinter
                    ? vehicle.winter_trailer_highway
                    : vehicle.summer_trailer_highway;

                normRaw =
                    (kmCity * rCity +
                        kmHighway * rHwy +
                        kmTrCity * rTrCity +
                        kmTrHighway * rTrHwy) /
                    100;
            }

            const fuelNorm = Math.round(normRaw * 100) / 100;
            const fuelFact =
                trip.fuel_actual !== null && trip.fuel_actual !== undefined
                    ? Number(trip.fuel_actual)
                    : fuelNorm;

            const fuelStart = Math.round(prevFuel * 100) / 100;
            const fuelAdded = Number(trip.fuel_added) || 0;
            const fuelEnd = Math.round((fuelStart + fuelAdded - fuelFact) * 100) / 100;
            const fuelDiff = Math.round((fuelNorm - fuelFact) * 100) / 100;

            prevOdometer = odoEnd;
            prevFuel = fuelEnd;

            const driver = this.drivers.find((d) => d.id === trip.driver_id);

            return {
                ...trip,
                odometer_start: odoStart,
                odometer_end: odoEnd,
                km_total: kmTotal,
                fuel_start: fuelStart,
                fuel_norm: fuelNorm,
                fuel_fact_computed: fuelFact,
                fuel_end: fuelEnd,
                fuel_diff: fuelDiff,
                driver_name: driver?.full_name ?? '',
            };
        });
    }

    // Итоговые суммы по всему путевому листу
    get totals() {
        return this.calculatedTrips.reduce(
            (acc, t) => {
                acc.km_city += Number(t.km_city) || 0;
                acc.km_highway += Number(t.km_highway) || 0;
                acc.km_trailer_city += Number(t.km_trailer_city) || 0;
                acc.km_trailer_highway += Number(t.km_trailer_highway) || 0;
                acc.km_total += t.km_total;
                acc.fuel_added += Number(t.fuel_added) || 0;
                acc.fuel_norm = Math.round((acc.fuel_norm + t.fuel_norm) * 100) / 100;
                acc.fuel_fact =
                    Math.round((acc.fuel_fact + t.fuel_fact_computed) * 100) / 100;
                acc.fuel_diff = Math.round((acc.fuel_diff + t.fuel_diff) * 100) / 100;
                return acc;
            },
            {
                km_city: 0,
                km_highway: 0,
                km_trailer_city: 0,
                km_trailer_highway: 0,
                km_total: 0,
                fuel_added: 0,
                fuel_norm: 0,
                fuel_fact: 0,
                fuel_diff: 0,
            }
        );
    }

    // Загрузка справочников автомобилей и водителей
    async loadDictionaries() {
        if (!authStore.user) return;
        this.isLoading = true;

        try {
            const [vehRes, drvRes] = await Promise.all([
                supabase
                    .from('vehicles')
                    .select('*')
                    .eq('is_active', true)
                    .order('brand'),
                supabase
                    .from('drivers')
                    .select('*')
                    .eq('is_active', true)
                    .order('full_name'),
            ]);

            if (vehRes.error) throw vehRes.error;
            if (drvRes.error) throw drvRes.error;

            runInAction(() => {
                this.vehicles = (vehRes.data as Vehicle[]) ?? [];
                this.drivers = (drvRes.data as Driver[]) ?? [];

                if (!this.selectedVehicleId && this.vehicles.length > 0) {
                    this.selectVehicle(this.vehicles[0].id);
                }
            });
        } catch (err) {
            console.error('Ошибка загрузки справочников:', err);
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    // Выбор автомобиля и подстановка его текущего пробега/топлива
    selectVehicle(vehicleId: string) {
        this.selectedVehicleId = vehicleId;
        const veh = this.vehicles.find((v) => v.id === vehicleId);
        if (veh) {
            this.initialOdometer = Number(veh.current_odometer) || 0;
            this.initialFuel = Number(veh.current_fuel) || 0;
        }
    }

    // Создание или редактирование автомобиля
    async saveVehicle(
        dto: Omit<Vehicle, 'id' | 'user_id' | 'is_active'>,
        editId?: string
    ): Promise<boolean> {
        if (!authStore.user) return false;

        if (editId) {
            const { data, error } = await supabase
                .from('vehicles')
                .update(dto)
                .eq('id', editId)
                .select()
                .single();

            if (error) {
                console.error('Ошибка обновления авто:', error.message);
                return false;
            }

            runInAction(() => {
                const idx = this.vehicles.findIndex((v) => v.id === editId);
                if (idx !== -1) {
                    this.vehicles[idx] = data as Vehicle;
                }
                if (this.selectedVehicleId === editId) {
                    this.initialOdometer = Number(dto.current_odometer) || 0;
                    this.initialFuel = Number(dto.current_fuel) || 0;
                }
            });
            return true;
        }

        const { data, error } = await supabase
            .from('vehicles')
            .insert({ ...dto, user_id: authStore.user.id })
            .select()
            .single();

        if (error) {
            console.error('Ошибка добавления авто:', error.message);
            return false;
        }

        runInAction(() => {
            this.vehicles.push(data as Vehicle);
            if (!this.selectedVehicleId) {
                this.selectVehicle((data as Vehicle).id);
            }
        });
        return true;
    }

    // Создание или редактирование водителя
    async saveDriver(
        fullName: string,
        licenseNumber: string,
        editId?: string
    ): Promise<boolean> {
        if (!authStore.user) return false;

        if (editId) {
            const { data, error } = await supabase
                .from('drivers')
                .update({
                    full_name: fullName.trim(),
                    license_number: licenseNumber.trim(),
                })
                .eq('id', editId)
                .select()
                .single();

            if (error) {
                console.error('Ошибка обновления водителя:', error.message);
                return false;
            }

            runInAction(() => {
                const idx = this.drivers.findIndex((d) => d.id === editId);
                if (idx !== -1) {
                    this.drivers[idx] = data as Driver;
                }
            });
            return true;
        }

        const { data, error } = await supabase
            .from('drivers')
            .insert({
                user_id: authStore.user.id,
                full_name: fullName.trim(),
                license_number: licenseNumber.trim(),
            })
            .select()
            .single();

        if (error) {
            console.error('Ошибка добавления водителя:', error.message);
            return false;
        }

        runInAction(() => {
            this.drivers.push(data as Driver);
        });
        return true;
    }

    // Управление строками поездок
    addTrip() {
        this.trips.push({
            id: crypto.randomUUID(),
            departure_time: '08:00',
            return_time: '20:00',
            season: this.defaultSeason,
            km_city: 0,
            km_highway: 0,
            km_trailer_city: 0,
            km_trailer_highway: 0,
            fuel_added: 0,
            fuel_actual: null,
            route: '',
            driver_id: this.drivers[0]?.id ?? '',
        });
    }

    updateTrip<K extends keyof WaybillTrip>(
        tripId: string,
        field: K,
        value: WaybillTrip[K]
    ) {
        const trip = this.trips.find((t) => t.id === tripId);
        if (trip) {
            trip[field] = value;
        }
    }

    removeTrip(tripId: string) {
        this.trips = this.trips.filter((t) => t.id !== tripId);
    }

    // Сохранение путевого листа в базу и обновление остатков в карточке авто
    async saveWaybill(updateVehicleBalances = true): Promise<boolean> {
        if (!authStore.user || !this.selectedVehicleId) return false;
        this.saveStatus = 'saving';

        const { error } = await supabase.from('waybills').insert({
            user_id: authStore.user.id,
            vehicle_id: this.selectedVehicleId,
            waybill_date: this.waybillDate,
            season: this.defaultSeason,
            initial_odometer: Number(this.initialOdometer) || 0,
            initial_fuel: Number(this.initialFuel) || 0,
            trips: toJS(this.trips),
        });

        if (error) {
            console.error('Ошибка сохранения путевого листа:', error.message);
            runInAction(() => {
                this.saveStatus = 'error';
            });
            return false;
        }
// Если есть поездки и включено автообновление — записываем конечный пробег и остаток топлива в авто
        const computed = this.calculatedTrips;
        if (updateVehicleBalances && computed.length > 0) {
            const lastTrip = computed[computed.length - 1];
            await supabase
                .from('vehicles')
                .update({
                    current_odometer: lastTrip.odometer_end,
                    current_fuel: lastTrip.fuel_end,
                })
                .eq('id', this.selectedVehicleId);
            runInAction(() => {
                const veh = this.vehicles.find((v) => v.id === this.selectedVehicleId);
                if (veh) {
                    veh.current_odometer = lastTrip.odometer_end;
                    veh.current_fuel = lastTrip.fuel_end;
                }
            });
        }
        runInAction(() => {
            this.saveStatus = 'saved';
        });
        return true;
    }
}
export const waybillStore = new WaybillStore();

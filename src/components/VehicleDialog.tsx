import { type FC, useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { waybillStore } from '../stores/WaybillStore';
import type { Vehicle } from '../types/waybill';

interface VehicleDialogProps {
    open: boolean;
    onClose: () => void;
    vehicleToEdit?: Vehicle | null;
}

export const VehicleDialog: FC<VehicleDialogProps> = ({
                                                          open,
                                                          onClose,
                                                          vehicleToEdit,
                                                      }) => {
    const [brand, setBrand] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [fuelCard, setFuelCard] = useState('');

    const [summerCity, setSummerCity] = useState('8.1');
    const [summerHighway, setSummerHighway] = useState('7.1');
    const [winterCity, setWinterCity] = useState('8.5');
    const [winterHighway, setWinterHighway] = useState('7.5');

    const [summerTrCity, setSummerTrCity] = useState('9.4');
    const [summerTrHighway, setSummerTrHighway] = useState('8.4');
    const [winterTrCity, setWinterTrCity] = useState('10.2');
    const [winterTrHighway, setWinterTrHighway] = useState('9.1');

    const [odometer, setOdometer] = useState('0');
    const [fuel, setFuel] = useState('0');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (vehicleToEdit) {
            setBrand(vehicleToEdit.brand);
            setPlateNumber(vehicleToEdit.plate_number);
            setFuelCard(vehicleToEdit.fuel_card ?? '');
            setSummerCity(String(vehicleToEdit.summer_city));
            setSummerHighway(String(vehicleToEdit.summer_highway));
            setWinterCity(String(vehicleToEdit.winter_city));
            setWinterHighway(String(vehicleToEdit.winter_highway));
            setSummerTrCity(String(vehicleToEdit.summer_trailer_city));
            setSummerTrHighway(String(vehicleToEdit.summer_trailer_highway));
            setWinterTrCity(String(vehicleToEdit.winter_trailer_city));
            setWinterTrHighway(String(vehicleToEdit.winter_trailer_highway));
            setOdometer(String(vehicleToEdit.current_odometer));
            setFuel(String(vehicleToEdit.current_fuel));
        } else {
            setBrand('');
            setPlateNumber('');
            setFuelCard('');
            setOdometer('0');
            setFuel('0');
        }
    }, [vehicleToEdit, open]);

    const handleSave = async () => {
        if (!brand.trim() || !plateNumber.trim()) return;

        setIsSaving(true);
        const ok = await waybillStore.saveVehicle(
            {
                brand: brand.trim(),
                plate_number: plateNumber.trim().toUpperCase(),
                fuel_card: fuelCard.trim(),
                summer_city: Number(summerCity) || 0,
                summer_highway: Number(summerHighway) || 0,
                winter_city: Number(winterCity) || 0,
                winter_highway: Number(winterHighway) || 0,
                summer_trailer_city: Number(summerTrCity) || 0,
                summer_trailer_highway: Number(summerTrHighway) || 0,
                winter_trailer_city: Number(winterTrCity) || 0,
                winter_trailer_highway: Number(winterTrHighway) || 0,
                current_odometer: Number(odometer) || 0,
                current_fuel: Number(fuel) || 0,
            },
            vehicleToEdit?.id
        );
        setIsSaving(false);

        if (ok) onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {vehicleToEdit ? 'Редактирование автомобиля' : 'Новый автомобиль'}
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Марка и модель *"
                                placeholder="Лада Ларгус"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Гос. номер *"
                                placeholder="9121 CI-7"
                                value={plateNumber}
                                onChange={(e) => setPlateNumber(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>

                    <TextField
                        label="Топливная карта (необязательно)"
                        placeholder="Э/к 652 147 489"
                        value={fuelCard}
                        onChange={(e) => setFuelCard(e.target.value)}
                        fullWidth
                    />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                type="number"
                                label="Начальный спидометр, км"
                                value={odometer}
                                onChange={(e) => setOdometer(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                type="number"
                                label="Начальный остаток топлива, л"
                                value={fuel}
                                onChange={(e) => setFuel(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>

                    <Divider />
                    <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                        Нормы расхода без прицепа (л / 100 км)
                    </Typography>

                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                type="number"
                                label="Лето город"
                                value={summerCity}
                                onChange={(e) => setSummerCity(e.target.value)}
                                slotProps={{htmlInput: {step: 0.1}}}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                type="number"
                                label="Лето трасса"
                                value={summerHighway}
                                onChange={(e) => setSummerHighway(e.target.value)}
                                slotProps={{htmlInput: {step: 0.1}}}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                type="number"
                                label="Зима город"
                                value={winterCity}
                                onChange={(e) => setWinterCity(e.target.value)}
                                slotProps={{htmlInput: {step: 0.1}}}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                type="number"
                                label="Зима трасса"
                                value={winterHighway}
                                onChange={(e) => setWinterHighway(e.target.value)}
                                slotProps={{htmlInput: {step: 0.1}}}
                                fullWidth
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                        Нормы расхода с прицепом (л / 100 км)
                    </Typography>

                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                type="number"
                                label="Лето город"
                                value={summerTrCity}
                                onChange={(e) => setSummerTrCity(e.target.value)}
                                slotProps={{htmlInput: {step: 0.1}}}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                type="number"
                                label="Лето трасса"
                                value={summerTrHighway}
                                onChange={(e) => setSummerTrHighway(e.target.value)}
                                slotProps={{htmlInput: {step: 0.1}}}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                type="number"
                                label="Зима город"
                                value={winterTrCity}
                                onChange={(e) => setWinterTrCity(e.target.value)}
                                slotProps={{htmlInput: {step: 0.1}}}
                                fullWidth
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                type="number"
                                label="Зима трасса"
                                value={winterTrHighway}
                                onChange={(e) => setWinterTrHighway(e.target.value)}
                                slotProps={{htmlInput: {step: 0.1}}}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSaving}>
                    Отмена
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isSaving || !brand.trim() || !plateNumber.trim()}
                >
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

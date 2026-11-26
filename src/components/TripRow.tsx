import type { FC } from 'react';
import { observer } from 'mobx-react-lite';
import {
    IconButton,
    MenuItem,
    Stack,
    TableCell,
    TableRow,
    TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { waybillStore } from '../stores/WaybillStore';
import type { CalculatedTrip, SeasonCode } from '../types/waybill';

interface TripRowProps {
    trip: CalculatedTrip;
    index: number;
}

export const TripRow: FC<TripRowProps> = observer(({ trip, index }) => {
    return (
        <TableRow hover>
            <TableCell>{index + 1}</TableCell>

            <TableCell>
                <Stack direction="row" spacing={0.5}>
                    <TextField
                        size="small"
                        value={trip.departure_time}
                        onChange={(e) =>
                            waybillStore.updateTrip(trip.id, 'departure_time', e.target.value)
                        }
                        sx={{ width: 68 }}
                    />
                    <TextField
                        size="small"
                        value={trip.return_time}
                        onChange={(e) =>
                            waybillStore.updateTrip(trip.id, 'return_time', e.target.value)
                        }
                        sx={{ width: 68 }}
                    />
                </Stack>
            </TableCell>

            <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                {trip.odometer_start} → <b>{trip.odometer_end}</b>
            </TableCell>

            <TableCell>
                <TextField
                    select
                    size="small"
                    value={trip.season}
                    onChange={(e) =>
                        waybillStore.updateTrip(
                            trip.id,
                            'season',
                            e.target.value as SeasonCode
                        )
                    }
                    sx={{ width: 60 }}
                >
                    <MenuItem value="л">л</MenuItem>
                    <MenuItem value="з">з</MenuItem>
                </TextField>
            </TableCell>

            <TableCell>
                <TextField
                    type="number"
                    size="small"
                    value={trip.km_city || ''}
                    onChange={(e) =>
                        waybillStore.updateTrip(trip.id, 'km_city', Number(e.target.value))
                    }
                    sx={{ width: 68 }}
                />
            </TableCell>

            <TableCell>
                <TextField
                    type="number"
                    size="small"
                    value={trip.km_highway || ''}
                    onChange={(e) =>
                        waybillStore.updateTrip(
                            trip.id,
                            'km_highway',
                            Number(e.target.value)
                        )
                    }
                    sx={{ width: 68 }}
                />
            </TableCell>

            <TableCell>
                <TextField
                    type="number"
                    size="small"
                    value={trip.km_trailer_city || ''}
                    onChange={(e) =>
                        waybillStore.updateTrip(
                            trip.id,
                            'km_trailer_city',
                            Number(e.target.value)
                        )
                    }
                    sx={{ width: 65 }}
                />
            </TableCell>

            <TableCell>
                <TextField
                    type="number"
                    size="small"
                    value={trip.km_trailer_highway || ''}
                    onChange={(e) =>
                        waybillStore.updateTrip(
                            trip.id,
                            'km_trailer_highway',
                            Number(e.target.value)
                        )
                    }
                    sx={{ width: 65 }}
                />
            </TableCell>

            <TableCell sx={{ fontWeight: 600 }}>{trip.km_total}</TableCell>

            <TableCell>
                <TextField
                    type="number"
                    size="small"
                    value={trip.fuel_added || ''}
                    onChange={(e) =>
                        waybillStore.updateTrip(
                            trip.id,
                            'fuel_added',
                            Number(e.target.value)
                        )
                    }
                    sx={{ width: 65 }}
                />
            </TableCell>

            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                {trip.fuel_norm.toFixed(2)}
            </TableCell>

            <TableCell sx={{ fontWeight: 600 }}>{trip.fuel_end.toFixed(2)}</TableCell>

            <TableCell>
                <TextField
                    size="small"
                    placeholder="Орша - Минск - Орша"
                    value={trip.route}
                    onChange={(e) =>
                        waybillStore.updateTrip(trip.id, 'route', e.target.value)
                    }
                    fullWidth
                />
            </TableCell>

            <TableCell>
                <TextField
                    select
                    size="small"
                    value={trip.driver_id}
                    onChange={(e) =>
                        waybillStore.updateTrip(trip.id, 'driver_id', e.target.value)
                    }
                    fullWidth
                >
                    {waybillStore.drivers.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                            {d.full_name}
                        </MenuItem>
                    ))}
                </TextField>
            </TableCell>

            <TableCell>
                <IconButton
                    size="small"
                    color="error"
                    onClick={() => waybillStore.removeTrip(trip.id)}
                    title="Удалить строку"
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </TableCell>
        </TableRow>
    );
});

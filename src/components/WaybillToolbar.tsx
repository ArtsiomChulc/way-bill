import type { FC } from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import BadgeIcon from "@mui/icons-material/Badge";
import { waybillStore } from "../stores/WaybillStore";
import type { SeasonCode } from "../types/waybill";

interface WaybillToolbarProps {
  onNewVehicle: () => void;
  onEditVehicle: () => void;
  onOpenDrivers: () => void;
  onSaveWaybill: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export const WaybillToolbar: FC<WaybillToolbarProps> =
  observer(
    ({
      onNewVehicle,
      onEditVehicle,
      onOpenDrivers,
      onSaveWaybill,
      onExport,
      isExporting,
    }) => {
      const { selectedVehicle, saveStatus, trips } =
        waybillStore;
      const isSaving = saveStatus === "saving";

      return (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            sx={{
              flexDirection: { xs: "column", lg: "row" },
              flexWrap: "wrap",
              alignItems: { xs: "stretch", lg: "center" },
              justifyContent: "space-between",
            }}
          >
            <Stack
              sx={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "12px",
              }}
              useFlexGap
            >
              <TextField
                select
                size="small"
                label="Автомобиль"
                value={waybillStore.selectedVehicleId}
                onChange={(e) =>
                  waybillStore.selectVehicle(e.target.value)
                }
                sx={{ minWidth: 230 }}
              >
                {waybillStore.vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.brand} ({v.plate_number})
                  </MenuItem>
                ))}
              </TextField>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DirectionsCarIcon />}
                onClick={onNewVehicle}
              >
                + Авто
              </Button>

              {selectedVehicle && (
                <IconButton
                  size="small"
                  onClick={onEditVehicle}
                  title="Редактировать нормы и данные авто"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}

              <Button
                size="small"
                variant="outlined"
                startIcon={<BadgeIcon />}
                onClick={onOpenDrivers}
              >
                Водители ({waybillStore.drivers.length})
              </Button>
            </Stack>

            <Stack
              sx={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "12px",
                marginTop: "20px",
              }}
              useFlexGap
            >
              <TextField
                type="date"
                size="small"
                label="Дата листа"
                value={waybillStore.waybillDate}
                onChange={(e) =>
                  (waybillStore.waybillDate =
                    e.target.value)
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                select
                size="small"
                label="Сезон"
                value={waybillStore.defaultSeason}
                onChange={(e) =>
                  (waybillStore.defaultSeason = e.target
                    .value as SeasonCode)
                }
                sx={{ width: 110 }}
              >
                <MenuItem value="л">Лето (л)</MenuItem>
                <MenuItem value="з">Зима (з)</MenuItem>
              </TextField>

              <TextField
                type="number"
                size="small"
                label="Спидометр выезд"
                value={waybillStore.initialOdometer}
                onChange={(e) =>
                  (waybillStore.initialOdometer = Number(
                    e.target.value,
                  ))
                }
                sx={{ width: 145 }}
              />

              <TextField
                type="number"
                size="small"
                label="Топливо выезд, л"
                value={waybillStore.initialFuel}
                onChange={(e) =>
                  (waybillStore.initialFuel = Number(
                    e.target.value,
                  ))
                }
                sx={{ width: 145 }}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={onSaveWaybill}
                disabled={
                  !selectedVehicle ||
                  trips.length === 0 ||
                  isSaving
                }
              >
                {isSaving
                  ? "Сохранение..."
                  : "Сохранить лист"}
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
                onClick={onExport}
                disabled={!selectedVehicle || isExporting}
              >
                {isExporting
                  ? "Сборка..."
                  : "Скачать Excel"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      );
    },
  );

import { type FC, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { waybillStore } from "../stores/WaybillStore";
import { authStore } from "../stores/AuthStore";
import { WaybillToolbar } from "../components/WaybillToolbar";
import { VehicleDialog } from "../components/VehicleDialog";
import { DriversDialog } from "../components/DriversDialog";
import { TripRow } from "../components/TripRow";
import { exportWaybillToExcel } from "../utils/waybillExcelExport";
import type { Vehicle } from "../types/waybill";

export const WaybillPage: FC = observer(() => {
  const [vehicleDialogOpen, setVehicleDialogOpen] =
    useState(false);
  const [editingVehicle, setEditingVehicle] =
    useState<Vehicle | null>(null);
  const [driversDialogOpen, setDriversDialogOpen] =
    useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (authStore.user) {
      waybillStore.loadDictionaries();
    }
  }, [authStore.user]);

  const { selectedVehicle, calculatedTrips, totals } =
    waybillStore;

  const handleOpenNewVehicle = () => {
    setEditingVehicle(null);
    setVehicleDialogOpen(true);
  };

  const handleOpenEditVehicle = () => {
    if (!selectedVehicle) return;
    setEditingVehicle(selectedVehicle);
    setVehicleDialogOpen(true);
  };

  const handleExport = async () => {
    if (!selectedVehicle) return;
    setIsExporting(true);
    try {
      await exportWaybillToExcel({
        vehicle: selectedVehicle,
        drivers: waybillStore.drivers,
        trips: calculatedTrips,
        waybillDate: waybillStore.waybillDate,
      });
    } catch (error) {
      console.error(
        "Ошибка при выгрузке путевого листа в Excel:",
        error,
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveWaybill = async () => {
    const ok = await waybillStore.saveWaybill(true);
    if (ok) {
      const lastTrip =
        calculatedTrips[calculatedTrips.length - 1];
      setToast({
        open: true,
        severity: "success",
        message: lastTrip
          ? `Лист сохранён! Новые показания авто: ${lastTrip.odometer_end} км, остаток ${lastTrip.fuel_end.toFixed(2)} л`
          : "Путевой лист успешно сохранён в базу",
      });
    } else {
      setToast({
        open: true,
        severity: "error",
        message:
          "Не удалось сохранить путевой лист. Проверьте подключение к сети.",
      });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2.5}>
        <WaybillToolbar
          onSaveWaybill={handleSaveWaybill}
          onNewVehicle={handleOpenNewVehicle}
          onEditVehicle={handleOpenEditVehicle}
          onOpenDrivers={() => setDriversDialogOpen(true)}
          onExport={handleExport}
          isExporting={isExporting}
        />

        {!selectedVehicle ? (
          <Alert severity="info">
            Добавьте первый автомобиль (нажмите «+ Авто»),
            чтобы указать нормы расхода топлива и начать
            заполнение путевого листа.
          </Alert>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600 }}
              >
                Поездки по путевому листу ·{" "}
                {selectedVehicle.brand}{" "}
                {selectedVehicle.plate_number}
              </Typography>

              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={waybillStore.addTrip}
              >
                Добавить строку
              </Button>
            </Box>

            <TableContainer sx={{ maxHeight: "65vh" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>№</TableCell>
                    <TableCell>Выезд / Возвр.</TableCell>
                    <TableCell>Спид. нач / кон</TableCell>
                    <TableCell>Сезон</TableCell>
                    <TableCell>Город, км</TableCell>
                    <TableCell>Трасса, км</TableCell>
                    <TableCell>Приц. гор</TableCell>
                    <TableCell>Приц. тр</TableCell>
                    <TableCell>Итого км</TableCell>
                    <TableCell>Запр., л</TableCell>
                    <TableCell>Норма, л</TableCell>
                    <TableCell>Ост. кон, л</TableCell>
                    <TableCell sx={{ minWidth: 220 }}>
                      Маршрут следования
                    </TableCell>
                    <TableCell sx={{ minWidth: 160 }}>
                      Водитель
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {calculatedTrips.map((trip, idx) => (
                    <TripRow
                      key={trip.id}
                      trip={trip}
                      index={idx}
                    />
                  ))}

                  {calculatedTrips.length > 0 && (
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell
                        colSpan={4}
                        sx={{ fontWeight: 700 }}
                      >
                        Итого за лист:
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {totals.km_city}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {totals.km_highway}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {totals.km_trailer_city}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {totals.km_trailer_highway}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {totals.km_total}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {totals.fuel_added}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                        }}
                      >
                        {totals.fuel_norm.toFixed(2)}
                      </TableCell>
                      <TableCell colSpan={4} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Stack>

      <VehicleDialog
        open={vehicleDialogOpen}
        onClose={() => setVehicleDialogOpen(false)}
        vehicleToEdit={editingVehicle}
      />

      <DriversDialog
        open={driversDialogOpen}
        onClose={() => setDriversDialogOpen(false)}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4500}
        onClose={() =>
          setToast((prev) => ({ ...prev, open: false }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={() =>
            setToast((prev) => ({ ...prev, open: false }))
          }
          severity={toast.severity}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
});

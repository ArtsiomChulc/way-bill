import { type FC, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack,
    TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { waybillStore } from '../stores/WaybillStore';
import type { Driver } from '../types/waybill';

interface DriversDialogProps {
    open: boolean;
    onClose: () => void;
}

export const DriversDialog: FC<DriversDialogProps> = observer(
    ({ open, onClose }) => {
        const [editingId, setEditingId] = useState<string | undefined>(undefined);
        const [fullName, setFullName] = useState('');
        const [license, setLicense] = useState('');
        const [isSaving, setIsSaving] = useState(false);

        const startEdit = (drv: Driver) => {
            setEditingId(drv.id);
            setFullName(drv.full_name);
            setLicense(drv.license_number);
        };

        const resetForm = () => {
            setEditingId(undefined);
            setFullName('');
            setLicense('');
        };

        const handleSave = async () => {
            if (!fullName.trim()) return;
            setIsSaving(true);
            const ok = await waybillStore.saveDriver(fullName, license, editingId);
            setIsSaving(false);
            if (ok) resetForm();
        };

        return (
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
                <DialogTitle>Справочник водителей</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            size="small"
                            label="Фамилия И.О. *"
                            placeholder="Медвецкий Д.Н."
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            size="small"
                            label="Водительское удостоверение"
                            placeholder="2АЕ 052014"
                            value={license}
                            onChange={(e) => setLicense(e.target.value)}
                            fullWidth
                        />
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleSave}
                                disabled={isSaving || !fullName.trim()}
                            >
                                {editingId ? 'Обновить' : 'Добавить'}
                            </Button>
                            {editingId && (
                                <Button size="small" onClick={resetForm}>
                                    Отмена правки
                                </Button>
                            )}
                        </Stack>

                        <Divider />

                        <List dense disablePadding>
                            {waybillStore.drivers.map((drv) => (
                                <ListItem
                                    key={drv.id}
                                    divider
                                    secondaryAction={
                                        <IconButton size="small" onClick={() => startEdit(drv)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={drv.full_name}
                                        secondary={drv.license_number || 'ВУ не указано'}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Закрыть</Button>
                </DialogActions>
            </Dialog>
        );
    }
);

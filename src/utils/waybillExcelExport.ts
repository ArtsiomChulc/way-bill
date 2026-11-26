import {saveAs} from 'file-saver';
import type {CalculatedTrip, Driver, Vehicle} from '../types/waybill';

export interface ExportWaybillParams {
    vehicle: Vehicle;
    drivers: Driver[];
    trips: CalculatedTrip[];
    waybillDate: string;
}

const THIN = {style: 'thin' as const, color: {argb: 'FF000000'}};
const MEDIUM = {style: 'medium' as const, color: {argb: 'FF000000'}};
const ALL_THIN = {top: THIN, left: THIN, bottom: THIN, right: THIN};
const YELLOW_FILL = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: {argb: 'FFFFFF00'},
};

export async function exportWaybillToExcel({
                                               vehicle,
                                               drivers,
                                               trips,
                                               waybillDate,
                                           }: ExportWaybillParams): Promise<void> {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Путевой лист', {
        pageSetup: {orientation: 'landscape', fitToPage: true, fitToWidth: 1},
    });

    // 1. Блок норм расхода (колонки A..D, строки 1..6)
    sheet.mergeCells('A1:B1');
    sheet.getCell('A1').value = 'лето (без приц)';
    sheet.mergeCells('C1:D1');
    sheet.getCell('C1').value = 'зима (без приц)';

    sheet.getCell('A2').value = 'город';
    sheet.getCell('B2').value = 'трасса';
    sheet.getCell('C2').value = 'город';
    sheet.getCell('D2').value = 'трасса';

    sheet.getCell('A3').value = Number(vehicle.summer_city);
    sheet.getCell('B3').value = Number(vehicle.summer_highway);
    sheet.getCell('C3').value = Number(vehicle.winter_city);
    sheet.getCell('D3').value = Number(vehicle.winter_highway);

    sheet.mergeCells('A4:B4');
    sheet.getCell('A4').value = 'лето (с приц)';
    sheet.mergeCells('C4:D4');
    sheet.getCell('C4').value = 'зима (с приц)';

    sheet.getCell('A5').value = 'город';
    sheet.getCell('B5').value = 'трасса';
    sheet.getCell('C5').value = 'город';
    sheet.getCell('D5').value = 'трасса';

    sheet.getCell('A6').value = Number(vehicle.summer_trailer_city);
    sheet.getCell('B6').value = Number(vehicle.summer_trailer_highway);
    sheet.getCell('C6').value = Number(vehicle.winter_trailer_city);
    sheet.getCell('D6').value = Number(vehicle.winter_trailer_highway);

    for (let r = 1; r <= 6; r++) {
        for (let c = 1; c <= 4; c++) {
            const cell = sheet.getCell(r, c);
            cell.border = ALL_THIN;
            cell.alignment = {horizontal: 'center', vertical: 'middle'};
            cell.font = {name: 'Arial', size: 9, bold: r === 3 || r === 6};
            if (r === 3 || r === 6) {
                cell.fill = YELLOW_FILL;
                cell.numFmt = '0.00';
            }
        }
    }

    // 2. Предупреждение справа от норм (F2:R3)
    sheet.mergeCells('F2:R2');
    sheet.getCell('F2').value =
        'ЗАПОЛНЯЮТСЯ ТОЛЬКО ТЕ ЯЧЕЙКИ, КОТОРЫЕ ОТМЕЧЕНЫ ЖЁЛТЫМ ЦВЕТОМ !!!';
    sheet.getCell('F2').font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: {argb: 'FFFF0000'},
    };

    sheet.mergeCells('F3:R3');
    sheet.getCell('F3').value =
        'НЕ ЗАЛИТЫЕ ЯЧЕЙКИ - НЕ ТРОГАТЬ (В НИХ ПРОПИСАНЫ ФОРМУЛЫ) !!!';
    sheet.getCell('F3').font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: {argb: 'FFFF0000'},
    };

    // 3. Марка и госномер авто (строка 8)
    sheet.mergeCells('G8:L8');
    sheet.getCell('G8').value = `${vehicle.brand} ${vehicle.plate_number}`;
    sheet.getCell('G8').font = {name: 'Arial', size: 11, bold: true};
    sheet.getCell('G8').alignment = {horizontal: 'center', vertical: 'middle'};

    // 4. Шапка основной таблицы (строки 9..11)
    sheet.mergeCells('A9:B9');
    sheet.getCell('A9').value = 'Время (ч, мин)';
    sheet.mergeCells('A10:A11');
    sheet.getCell('A10').value = 'выезда';
    sheet.mergeCells('B10:B11');
    sheet.getCell('B10').value = 'возвра-\nщения';

    sheet.mergeCells('C9:C11');
    sheet.getCell('C9').value = 'Показания спидометра\nпри выезде';
    sheet.mergeCells('D9:D11');
    sheet.getCell('D9').value = 'Показания спидометра\nпри возвра-\nщении';

    sheet.mergeCells('E9:E11');
    sheet.getCell('E9').value = 'отметить\nлето или\nзима (л/з)';

    sheet.mergeCells('F9:J9');
    sheet.getCell('F9').value = 'Пробег, км';
    sheet.mergeCells('F10:F11');
    sheet.getCell('F10').value = 'город';
    sheet.mergeCells('G10:G11');
    sheet.getCell('G10').value = 'трасса';
    sheet.mergeCells('H10:H11');
    sheet.getCell('H10').value = 'город\nс\nприц';
    sheet.mergeCells('I10:I11');
    sheet.getCell('I10').value = 'трасса\nс приц';
    sheet.mergeCells('J10:J11');
    sheet.getCell('J10').value = 'итого';

    sheet.mergeCells('K9:P9');
    sheet.getCell('K9').value = 'Движение топлива';
    sheet.mergeCells('K10:L10');
    sheet.getCell('K10').value = 'остаток топлива, л';
    sheet.getCell('K11').value = 'при выезде';
    sheet.getCell('L11').value = 'при возвра-\nщении';

    sheet.getCell('M10').value = 'заправлен\nо топлива';
    sheet.getCell('M11').value = 'коли-\nчество, л';

    sheet.mergeCells('N10:P10');
    sheet.getCell('N10').value = 'расход топлива, л';
    sheet.getCell('N11').value = 'по норме';
    sheet.getCell('O11').value = 'факти-\nчески';
    sheet.getCell('P11').value = 'Эконо-\nмия (+)\nперерас-\nход (-)';

    sheet.mergeCells('Q9:Q11');
    sheet.getCell('Q9').value = 'Маршрут следования';

    sheet.mergeCells('R9:R11');
    sheet.getCell('R9').value = '№ п/п';

    sheet.mergeCells('S9:S11');
    sheet.getCell('S9').value = 'Фамилия ИО водителя';

    for (let r = 9; r <= 11; r++) {
        const row = sheet.getRow(r);
        row.height = r === 11 ? 34 : 18;
        for (let c = 1; c <= 19; c++) {
            const cell = row.getCell(c);
            cell.font = {name: 'Arial', size: 8, bold: r === 9};
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true,
            };
            cell.border = ALL_THIN;
        }
    }

    // 5. Строки поездок (начиная с 12-й строки)
    const startDataRow = 12;
    const rowsToRender = Math.max(trips.length, 2);

    const firstRowYellowCols = Array.of(1, 2, 3, 5, 6, 7, 8, 9, 11, 13, 17, 19);
    const nextRowYellowCols = Array.of(1, 2, 5, 6, 7, 8, 9, 13, 17, 19);
    const fuelFormatCols = Array.of(11, 12, 13, 14, 15, 16);

    for (let i = 0; i < rowsToRender; i++) {
        const r = startDataRow + i;
        const row = sheet.getRow(r);
        row.height = 19;
        const trip = trips[i];

        const yellowCols = i === 0 ? firstRowYellowCols : nextRowYellowCols;
        yellowCols.forEach((colIdx) => {
            row.getCell(colIdx).fill = YELLOW_FILL;
        });

        if (trip) {
            row.getCell(1).value = trip.departure_time;
            row.getCell(2).value = trip.return_time;
            row.getCell(3).value =
                i === 0 ? trip.odometer_start : {formula: `D${r - 1}`};
            row.getCell(4).value = {formula: `C${r}+J${r}`};
            row.getCell(5).value = trip.season;

            row.getCell(6).value = trip.km_city || null;
            row.getCell(7).value = trip.km_highway || null;
            row.getCell(8).value = trip.km_trailer_city || null;
            row.getCell(9).value = trip.km_trailer_highway || null;
            row.getCell(10).value = {formula: `SUM(F${r}:I${r})`};

            row.getCell(11).value =
                i === 0 ? trip.fuel_start : {formula: `L${r - 1}`};
            row.getCell(12).value = {formula: `K${r}+M${r}-O${r}`};
            row.getCell(13).value = trip.fuel_added || null;

            row.getCell(14).value = {
                formula: `ROUND(IF(E${r}="з",(F${r}*$C$3+G${r}*$D$3+H${r}*$C$6+I${r}*$D$6)/100,(F${r}*$A$3+G${r}*$B$3+H${r}*$A$6+I${r}*$B$6)/100),2)`,
            };
            row.getCell(15).value =
                trip.fuel_actual !== null ? trip.fuel_actual : {formula: `N${r}`};
            row.getCell(16).value = {formula: `N${r}-O${r}`};

            row.getCell(17).value = trip.route;
            row.getCell(18).value = i + 1;
            row.getCell(19).value = trip.driver_name;
        } else {
            if (i > 0) {
                row.getCell(3).value = {formula: `D${r - 1}`};
                row.getCell(11).value = {formula: `L${r - 1}`};
            }
            row.getCell(4).value = {formula: `C${r}+J${r}`};
            row.getCell(10).value = {formula: `SUM(F${r}:I${r})`};
            row.getCell(12).value = {formula: `K${r}+M${r}-O${r}`};
            row.getCell(14).value = {
                formula: `ROUND(IF(E${r}="з",(F${r}*$C$3+G${r}*$D$3+H${r}*$C$6+I${r}*$D$6)/100,(F${r}*$A$3+G${r}*$B$3+H${r}*$A$6+I${r}*$B$6)/100),2)`,
            };
            row.getCell(15).value = {formula: `N${r}`};
            row.getCell(16).value = {formula: `N${r}-O${r}`};
        }

        fuelFormatCols.forEach((cIdx) => {
            row.getCell(cIdx).numFmt = '0.00';
        });

        for (let c = 1; c <= 19; c++) {
            const cell = row.getCell(c);
            cell.font = {name: 'Arial', size: 9};
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true,
            };
            cell.border = ALL_THIN;
        }
    }

    // 6. Итоговая строка с прочерками 'x' и суммами
    const endDataRow = startDataRow + rowsToRender - 1;
    const totalRowIdx = endDataRow + 1;
    const totalRow = sheet.getRow(totalRowIdx);
    totalRow.height = 19;

    const crossCols = Array.of(1, 2, 3, 4, 5, 11, 12);
    crossCols.forEach((cIdx) => {
        totalRow.getCell(cIdx).value = 'x';
    });

    const sumCols = Array.of(6, 7, 8, 9, 10, 13, 14, 15, 16);
    sumCols.forEach((cIdx) => {
        const colLetter = sheet.getColumn(cIdx).letter;
        const cell = totalRow.getCell(cIdx);
        cell.value = {
            formula: `SUM(${colLetter}${startDataRow}:${colLetter}${endDataRow})`,
        };
        if (cIdx >= 13) {
            cell.numFmt = '0.00';
        }
    });

    for (let c = 1; c <= 19; c++) {
        const cell = totalRow.getCell(c);
        cell.font = {name: 'Arial', size: 9, bold: c >= 10 && c <= 16};
        cell.alignment = {horizontal: 'center', vertical: 'middle'};
        cell.border = {...ALL_THIN, bottom: MEDIUM};
    }

    // 7. Нижний блок: топливная карта и список водителей с ВУ
    const cardRowIdx = totalRowIdx + 2;
    if (vehicle.fuel_card) {
        sheet.mergeCells(cardRowIdx, 10, cardRowIdx, 12);
        const cardCell = sheet.getCell(cardRowIdx, 10);
        cardCell.value = vehicle.fuel_card;
        cardCell.fill = YELLOW_FILL;
        cardCell.font = {name: 'Arial', size: 9, bold: true};
        cardCell.alignment = {horizontal: 'center', vertical: 'middle'};
        cardCell.border = ALL_THIN;
    }
    drivers.forEach((drv, idx) => {
        const r = cardRowIdx + 1 + idx;
        sheet.mergeCells(r, 10, r, 13);
        const drvCell = sheet.getCell(r, 10);
        drvCell.value = `${drv.full_name} ${drv.license_number}`.trim();
        drvCell.font = {name: 'Arial', size: 9};
        drvCell.alignment = {horizontal: 'left', vertical: 'middle'};
    });
// 8. Ширина 19 колонок под печать А4 альбомно
    const widths = Array.of(
        7, 7, 10, 10, 6, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 26, 5, 16
    );
    widths.forEach((w, idx) => {
        sheet.getColumn(idx + 1).width = w;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `Путевой_лист_${vehicle.plate_number}_${waybillDate}.xlsx`);
}
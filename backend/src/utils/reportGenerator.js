import pool from '../database/db.js';

/**
 * Genera reporte diario automático
 * Se ejecuta a la medianoche
 */
export const generateDailyReport = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    console.log(`📊 Generando reporte diario para: ${dateStr}`);
    
    // Obtener estadísticas del día
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_shifts,
        COALESCE(SUM(price), 0) as total_income,
        SUM(CASE WHEN payment_method = 'cash' THEN price ELSE 0 END) as cash_income,
        SUM(CASE WHEN payment_method = 'card' THEN price ELSE 0 END) as card_income,
        SUM(CASE WHEN payment_method = 'transfer' THEN price ELSE 0 END) as transfer_income,
        AVG(TIMESTAMPDIFF(MINUTE, start_time, COALESCE(actual_end_time, end_time))) as avg_duration,
        SUM(CASE WHEN extended_count > 0 THEN 1 ELSE 0 END) as total_extensions,
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as total_no_shows,
        COUNT(DISTINCT room_id) as rooms_used
      FROM shifts 
      WHERE DATE(start_time) = ?
        AND status IN ('completed', 'cleaning', 'no_show')
    `, [dateStr]);
    
    if (stats.length === 0 || stats[0].total_shifts === 0) {
      console.log(`📊 No hay datos para el día ${dateStr}`);
      return;
    }
    
    const data = stats[0];
    
    // Calcular tasa de rotación
    const [rooms] = await pool.execute('SELECT COUNT(*) as total FROM rooms');
    const totalRooms = rooms[0].total;
    const rotationRate = totalRooms > 0 ? (data.rooms_used / totalRooms).toFixed(2) : 0;
    
    // Obtener hora pico
    const [peakHour] = await pool.execute(`
      SELECT HOUR(start_time) as hour, COUNT(*) as count
      FROM shifts 
      WHERE DATE(start_time) = ? AND status IN ('completed', 'cleaning')
      GROUP BY HOUR(start_time)
      ORDER BY count DESC
      LIMIT 1
    `, [dateStr]);
    
    // Guardar en daily_metrics
    await pool.execute(`
      INSERT INTO daily_metrics 
        (date, total_shifts, total_income, cash_income, card_income, transfer_income, 
         average_duration_minutes, room_rotation_rate, no_shows, extensions_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        total_shifts = VALUES(total_shifts),
        total_income = VALUES(total_income),
        cash_income = VALUES(cash_income),
        card_income = VALUES(card_income),
        transfer_income = VALUES(transfer_income),
        average_duration_minutes = VALUES(average_duration_minutes),
        room_rotation_rate = VALUES(room_rotation_rate),
        no_shows = VALUES(no_shows),
        extensions_total = VALUES(extensions_total)
    `, [
      dateStr,
      data.total_shifts,
      data.total_income,
      data.cash_income || 0,
      data.card_income || 0,
      data.transfer_income || 0,
      data.avg_duration || 0,
      rotationRate,
      data.total_no_shows || 0,
      data.total_extensions || 0
    ]);
    
    // Registrar hora pico
    if (peakHour && peakHour.hour !== null) {
      await pool.execute(`
        INSERT INTO hourly_stats (date, hour, shifts_count, income)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          shifts_count = VALUES(shifts_count),
          income = VALUES(income)
      `, [dateStr, peakHour.hour, peakHour.count, data.total_income]);
    }
    
    console.log(`✅ Reporte diario generado exitosamente:
       - Fecha: ${dateStr}
       - Turnos: ${data.total_shifts}
       - Ingresos: $${data.total_income.toLocaleString()}
       - Rotación: ${rotationRate}x
       - Hora pico: ${peakHour?.hour || 'N/A'}:00
    `);
    
    // Opcional: Guardar reporte en archivo
    await saveReportToFile(dateStr, data);
    
  } catch (error) {
    console.error('❌ Error generando reporte diario:', error);
  }
};

/**
 * Guarda el reporte en un archivo JSON
 */
async function saveReportToFile(date, data) {
  const fs = await import('fs');
  const path = await import('path');
  
  const reportDir = path.join(process.cwd(), 'reports');
  
  // Crear directorio si no existe
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportFile = path.join(reportDir, `report_${date}.json`);
  
  const report = {
    date,
    generated_at: new Date().toISOString(),
    summary: {
      total_shifts: data.total_shifts,
      total_income: data.total_income,
      cash_income: data.cash_income,
      card_income: data.card_income,
      transfer_income: data.transfer_income,
      average_duration_minutes: data.avg_duration,
      room_rotation_rate: data.room_rotation_rate,
      total_extensions: data.total_extensions,
      total_no_shows: data.total_no_shows,
      rooms_used: data.rooms_used
    }
  };
  
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`📁 Reporte guardado en: ${reportFile}`);
}

/**
 * Genera reporte semanal
 */
export const generateWeeklyReport = async () => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const [report] = await pool.execute(`
      SELECT 
        DATE(start_time) as fecha,
        COUNT(*) as turnos,
        COALESCE(SUM(price), 0) as ingresos,
        AVG(TIMESTAMPDIFF(MINUTE, start_time, COALESCE(actual_end_time, end_time))) as duracion_promedio
      FROM shifts 
      WHERE DATE(start_time) BETWEEN ? AND ?
        AND status IN ('completed', 'cleaning')
      GROUP BY DATE(start_time)
      ORDER BY fecha DESC
    `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
    
    console.log(`📊 Reporte semanal generado: ${report.length} días`);
    return report;
    
  } catch (error) {
    console.error('Error generando reporte semanal:', error);
    return [];
  }
};

/**
 * Genera reporte mensual
 */
export const generateMonthlyReport = async (year, month) => {
  try {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const [report] = await pool.execute(`
      SELECT 
        COUNT(*) as total_turnos,
        COALESCE(SUM(price), 0) as ingresos_totales,
        SUM(CASE WHEN payment_method = 'cash' THEN price ELSE 0 END) as efectivo,
        SUM(CASE WHEN payment_method = 'card' THEN price ELSE 0 END) as tarjeta,
        SUM(CASE WHEN payment_method = 'transfer' THEN price ELSE 0 END) as transferencia,
        AVG(TIMESTAMPDIFF(MINUTE, start_time, COALESCE(actual_end_time, end_time))) as duracion_promedio,
        COUNT(DISTINCT room_id) as habitaciones_utilizadas,
        SUM(CASE WHEN extended_count > 0 THEN 1 ELSE 0 END) as extensiones,
        SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_shows
      FROM shifts 
      WHERE DATE(start_time) BETWEEN ? AND ?
        AND status IN ('completed', 'cleaning')
    `, [startDate, endDate]);
    
    console.log(`📊 Reporte mensual ${year}-${month}: $${report[0]?.ingresos_totales?.toLocaleString() || 0}`);
    return report[0];
    
  } catch (error) {
    console.error('Error generando reporte mensual:', error);
    return null;
  }
};

export default {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport
};
import pool from '../database/db.js';

/**
 * Verifica turnos que expiraron y los marca para limpieza
 * Este script se ejecuta cada minuto automáticamente
 */
export const checkTimeouts = async (io) => {
  try {
    // Buscar turnos activos que ya pasaron su hora de finalización
    const [expiredShifts] = await pool.execute(`
      SELECT s.*, r.room_number, r.cleaning_time_minutes
      FROM shifts s
      JOIN rooms r ON s.room_id = r.id
      WHERE s.status = 'active' 
        AND s.end_time <= NOW()
    `);
    
    if (expiredShifts.length === 0) {
      return; // No hay turnos expirados
    }
    
    console.log(`⏰ Se encontraron ${expiredShifts.length} turnos expirados`);
    
    for (const shift of expiredShifts) {
      // Calcular tiempo de limpieza
      const cleaningMinutes = shift.cleaning_time_minutes || 20;
      const cleaningEnd = new Date();
      cleaningEnd.setMinutes(cleaningEnd.getMinutes() + cleaningMinutes);
      
      // Actualizar estado del turno a limpieza
      await pool.execute(
        `UPDATE shifts 
         SET status = 'cleaning', 
             cleaning_start = NOW(), 
             cleaning_end = ?,
             actual_end_time = NOW()
         WHERE id = ?`,
        [cleaningEnd, shift.id]
      );
      
      // Actualizar estado de la habitación
      await pool.execute(
        'UPDATE rooms SET status = "cleaning" WHERE id = ?',
        [shift.room_id]
      );
      
      // Emitir evento via Socket.io para notificar en tiempo real
      if (io) {
        io.to('reception').emit('shift_expired', {
          shift_id: shift.id,
          room_id: shift.room_id,
          room_number: shift.room_number,
          message: `El turno de la habitación ${shift.room_number} ha expirado`
        });
        
        io.to('reception').emit('room_needs_cleaning', {
          room_id: shift.room_id,
          room_number: shift.room_number,
          cleaning_minutes: cleaningMinutes
        });
      }
      
      console.log(`🧹 Habitación ${shift.room_number} marcada para limpieza (${cleaningMinutes} min)`);
    }
    
    // Actualizar métricas después de procesar los expirados
    await updateMetricsAfterTimeouts();
    
  } catch (error) {
    console.error('❌ Error en checkTimeouts:', error);
  }
};

/**
 * Actualiza métricas después de timeouts
 */
async function updateMetricsAfterTimeouts() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [result] = await pool.execute(
      `UPDATE daily_metrics 
       SET total_shifts = (SELECT COUNT(*) FROM shifts WHERE DATE(start_time) = ? AND status IN ('completed', 'cleaning')),
           total_income = (SELECT COALESCE(SUM(price), 0) FROM shifts WHERE DATE(start_time) = ? AND status IN ('completed', 'cleaning'))
       WHERE date = ?`,
      [today, today, today]
    );
  } catch (error) {
    console.error('Error actualizando métricas:', error);
  }
}

/**
 * Programa la verificación automática de timeouts
 */
export const startTimeoutChecker = (io) => {
  console.log('⏰ Iniciando verificador de timeouts (cada 60 segundos)');
  
  // Ejecutar inmediatamente al iniciar
  checkTimeouts(io);
  
  // Programar ejecución cada minuto
  const interval = setInterval(() => {
    checkTimeouts(io);
  }, 60000); // 60 segundos
  
  return interval;
};

export default { checkTimeouts, startTimeoutChecker };
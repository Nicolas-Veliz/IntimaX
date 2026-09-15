import pool from '../database/db.js';

// ============================================
// OBTENER TODOS LOS AMENITIES
// ============================================
export const getAmenities = async (req, res) => {
  try {
    const [amenities] = await pool.execute(
      'SELECT * FROM amenities WHERE is_active = TRUE ORDER BY category, name'
    );
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// OBTENER AMENITY POR ID
// ============================================
export const getAmenityById = async (req, res) => {
  try {
    const { id } = req.params;
    const [amenities] = await pool.execute(
      'SELECT * FROM amenities WHERE id = ?',
      [id]
    );
    
    if (amenities.length === 0) {
      return res.status(404).json({ message: 'Amenity no encontrado' });
    }
    
    res.json(amenities[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// CREAR NUEVO AMENITY (SOLO ADMIN)
// ============================================
export const createAmenity = async (req, res) => {
  try {
    const { name, description, price, stock, min_stock_alert, category } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO amenities (name, description, price, stock, min_stock_alert, category) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, stock || 0, min_stock_alert || 5, category || 'otros']
    );
    
    // Registrar en historial
    await pool.execute(
      `INSERT INTO stock_history (amenity_id, previous_stock, new_stock, quantity_change, action, performed_by, notes) 
       VALUES (?, 0, ?, ?, 'add', ?, 'Creación inicial')`,
      [result.insertId, stock || 0, stock || 0, req.user.id]
    );
    
    const [newAmenity] = await pool.execute(
      'SELECT * FROM amenities WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newAmenity[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ACTUALIZAR AMENITY (SOLO ADMIN)
// ============================================
export const updateAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, min_stock_alert, category, is_active } = req.body;
    
    // Obtener stock actual para historial
    const [current] = await pool.execute(
      'SELECT stock FROM amenities WHERE id = ?',
      [id]
    );
    
    if (current.length === 0) {
      return res.status(404).json({ message: 'Amenity no encontrado' });
    }
    
    const previousStock = current[0].stock;
    
    await pool.execute(
      `UPDATE amenities 
       SET name = ?, description = ?, price = ?, stock = ?, min_stock_alert = ?, category = ?, is_active = ?
       WHERE id = ?`,
      [name, description, price, stock, min_stock_alert, category, is_active !== undefined ? is_active : true, id]
    );
    
    // Registrar cambio de stock si hubo
    if (stock !== previousStock) {
      await pool.execute(
        `INSERT INTO stock_history (amenity_id, previous_stock, new_stock, quantity_change, action, performed_by, notes) 
         VALUES (?, ?, ?, ?, 'adjust', ?, 'Actualización manual')`,
        [id, previousStock, stock, stock - previousStock, req.user.id]
      );
    }
    
    const [updatedAmenity] = await pool.execute(
      'SELECT * FROM amenities WHERE id = ?',
      [id]
    );
    
    res.json(updatedAmenity[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ELIMINAR AMENITY (SOLO ADMIN - Soft delete)
// ============================================
export const deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'UPDATE amenities SET is_active = FALSE WHERE id = ?',
      [id]
    );
    
    res.json({ message: 'Amenity eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// CONSUMIR AMENITY EN HABITACIÓN
// ============================================
export const consumeAmenity = async (req, res) => {
  try {
    const { shift_id, room_id, amenity_id, quantity } = req.body;

    if (!amenity_id) {
      return res.status(400).json({ message: 'Faltan datos para registrar el amenity' });
    }

    let activeShiftId = shift_id;

    if (!activeShiftId && room_id) {
      const [activeShiftRows] = await pool.execute(
        'SELECT id FROM shifts WHERE room_id = ? AND status = "active" ORDER BY id DESC LIMIT 1',
        [room_id]
      );
      activeShiftId = activeShiftRows[0]?.id;
    }

    if (!activeShiftId) {
      return res.status(404).json({ message: 'No existe un turno activo para esta habitación' });
    }

    const [shiftRows] = await pool.execute(
      'SELECT * FROM shifts WHERE id = ? AND status = "active"',
      [activeShiftId]
    );

    if (shiftRows.length === 0) {
      return res.status(404).json({ message: 'No existe un turno activo para esta habitación' });
    }

    const [amenity] = await pool.execute(
      'SELECT * FROM amenities WHERE id = ? AND is_active = TRUE',
      [amenity_id]
    );

    if (amenity.length === 0) {
      return res.status(404).json({ message: 'Amenity no disponible' });
    }

    if (amenity[0].stock < quantity) {
      return res.status(400).json({ message: 'Stock insuficiente' });
    }

    const unitPrice = Number(amenity[0].price);
    const totalAmenityPrice = unitPrice * Number(quantity);
    const currentShiftPrice = Number(shiftRows[0].price || 0);
    const newShiftPrice = currentShiftPrice + totalAmenityPrice;

    await pool.execute(
      `INSERT INTO room_amenities (shift_id, amenity_id, quantity, price_at_time) 
       VALUES (?, ?, ?, ?)`,
      [activeShiftId, amenity_id, quantity, unitPrice]
    );

    const newStock = amenity[0].stock - quantity;
    await pool.execute(
      'UPDATE amenities SET stock = ? WHERE id = ?',
      [newStock, amenity_id]
    );

    await pool.execute(
      'UPDATE shifts SET price = ? WHERE id = ?',
      [newShiftPrice, activeShiftId]
    );

    await pool.execute(
      `INSERT INTO stock_history (amenity_id, previous_stock, new_stock, quantity_change, action, performed_by, notes) 
       VALUES (?, ?, ?, ?, 'remove', ?, 'Consumo en habitación')`,
      [amenity_id, amenity[0].stock, newStock, -quantity, req.user.id]
    );

    let alert = null;
    if (newStock <= amenity[0].min_stock_alert) {
      alert = {
        amenity: amenity[0].name,
        current_stock: newStock,
        min_stock: amenity[0].min_stock_alert
      };
    }

    res.json({
      message: 'Consumo registrado',
      new_stock: newStock,
      new_total: newShiftPrice,
      amenity_price: totalAmenityPrice,
      alert: alert
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ELIMINAR CONSUMO DE AMENITY EN HABITACIÓN
// ============================================
export const removeAmenityConsumption = async (req, res) => {
  try {
    const { id } = req.params;

    const [consumptionRows] = await pool.execute(
      'SELECT * FROM room_amenities WHERE id = ?',
      [id]
    );

    if (consumptionRows.length === 0) {
      return res.status(404).json({ message: 'Consumo no encontrado' });
    }

    const record = consumptionRows[0];
    const removedQuantity = Number(record.quantity || 1);
    const removedPrice = Number(record.price_at_time || 0) * removedQuantity;

    const [shiftRows] = await pool.execute(
      'SELECT * FROM shifts WHERE id = ? AND status = "active"',
      [record.shift_id]
    );

    if (shiftRows.length === 0) {
      return res.status(404).json({ message: 'No existe un turno activo para esta habitación' });
    }

    const [amenityRows] = await pool.execute(
      'SELECT * FROM amenities WHERE id = ? AND is_active = TRUE',
      [record.amenity_id]
    );

    if (amenityRows.length === 0) {
      return res.status(404).json({ message: 'Amenity no disponible' });
    }

    const currentStock = Number(amenityRows[0].stock || 0);
    const newStock = currentStock + removedQuantity;
    const currentShiftPrice = Number(shiftRows[0].price || 0);
    const newShiftPrice = Math.max(0, currentShiftPrice - removedPrice);

    await pool.execute('DELETE FROM room_amenities WHERE id = ?', [id]);

    await pool.execute(
      'UPDATE amenities SET stock = ? WHERE id = ?',
      [newStock, record.amenity_id]
    );

    await pool.execute(
      'UPDATE shifts SET price = ? WHERE id = ?',
      [newShiftPrice, record.shift_id]
    );

    await pool.execute(
      `INSERT INTO stock_history (amenity_id, previous_stock, new_stock, quantity_change, action, performed_by, notes) 
       VALUES (?, ?, ?, ?, 'add', ?, 'Eliminación de consumo en habitación')`,
      [record.amenity_id, currentStock, newStock, removedQuantity, req.user.id]
    );

    res.json({
      message: 'Consumo eliminado',
      new_stock: newStock,
      new_total: newShiftPrice,
      amenity_price: removedPrice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// OBTENER AMENITIES CON BAJO STOCK
// ============================================
export const getLowStock = async (req, res) => {
  try {
    const [lowStock] = await pool.execute(
      'SELECT * FROM amenities WHERE stock <= min_stock_alert AND is_active = TRUE'
    );
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// OBTENER CONSUMO POR HABITACIÓN
// ============================================
export const getRoomConsumption = async (req, res) => {
  try {
    const { shift_id } = req.params;
    
    const [consumption] = await pool.execute(`
      SELECT ra.*, a.name, a.category
      FROM room_amenities ra
      JOIN amenities a ON ra.amenity_id = a.id
      WHERE ra.shift_id = ?
      ORDER BY ra.consumed_at DESC
    `, [shift_id]);
    
    res.json(consumption);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
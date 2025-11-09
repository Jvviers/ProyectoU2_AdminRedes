const { pool } = require('../config/database');

module.exports = (ticketsGeneratedCounter) => {
    // Lógica de negocio para generar un nuevo número de atención
    const generateNumber = async (req, res) => {
        const { service_id, client_name } = req.body;

        if (!service_id) {
            return res.status(400).json({ error: 'El campo service_id es requerido.' });
        }

        try {
            // 1. Obtener el último número para el servicio dado
            const lastNumberResult = await pool.query(
                'SELECT number FROM queues WHERE service_id = $1 ORDER BY number DESC LIMIT 1',
                [service_id]
            );

            const newNumber = lastNumberResult.rows.length > 0 ? lastNumberResult.rows[0].number + 1 : 1;

            // 2. Insertar el nuevo número en la cola
            const result = await pool.query(
                'INSERT INTO queues (service_id, number, client_name, status) VALUES ($1, $2, $3, $4) RETURNING *',
                [service_id, newNumber, client_name || 'N/A', 'waiting']
            );

            // Incrementar el contador de Prometheus
            ticketsGeneratedCounter.inc({ service_id: service_id });

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error al generar número:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    // Lógica para llamar al siguiente número
    const callNext = async (req, res) => {
        const { serviceId } = req.params;
        const { station } = req.query; // ej: ?station=Modulo-01

        if (!station) {
            return res.status(400).json({ error: 'El parámetro station es requerido.' });
        }

        try {
            // Iniciar una transacción
            await pool.query('BEGIN');

            // 1. Encontrar el próximo ticket en estado 'waiting' para el servicio
            const nextTicket = await pool.query(
                `SELECT id, number FROM queues 
                 WHERE service_id = $1 AND status = 'waiting' 
                 ORDER BY created_at ASC 
                 LIMIT 1 FOR UPDATE`, // Bloquear la fila para evitar que otra estación la tome
                [serviceId]
            );

            if (nextTicket.rows.length === 0) {
                await pool.query('COMMIT');
                return res.status(404).json({ message: 'No hay más clientes en espera.' });
            }

            const { id, number } = nextTicket.rows[0];

            // 2. Actualizar el estado del ticket a 'called' y asignar la estación
            const updatedTicket = await pool.query(
                `UPDATE queues SET status = 'called', station = $1, updated_at = NOW() 
                 WHERE id = $2 RETURNING *`,
                [station, id]
            );
            
            // Finalizar la transacción
            await pool.query('COMMIT');

            // Aquí se podría emitir un evento WebSocket para notificar a las pantallas
            console.log(`Llamando a ticket ${number} en la estación ${station}`);

            res.status(200).json(updatedTicket.rows[0]);
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error al llamar al siguiente número:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    // Obtener el estado de la cola para un servicio
    const getStatus = async (req, res) => {
        const { serviceId } = req.params;
        try {
            const result = await pool.query(
                "SELECT status, COUNT(*) as count FROM queues WHERE service_id = $1 GROUP BY status",
                [serviceId]
            );
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error al obtener estado de la cola:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    return {
        generateNumber,
        callNext,
        getStatus,
    };
};

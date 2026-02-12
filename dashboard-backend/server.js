const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// FIXED: Host changed to localhost for your MacBook Air
// FIXED: Ensure password matches your local MySQL setup
const db = mysql.createPool({
    host: '195.35.7.160',
    port: 3306,        // The specific port from your ddev describe ddev port 61567
    user: 'csaengg',         // DDEV default user
    password: 'Revanthshiva3',     // DDEV default password
    database: 'csarae',     // DDEV default database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/api/team-projects', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.project_id, 
                p.project_name, 
                p.p_team, 
                p.progress, 
                p.start_date,
                p.assign_to_id,
                p.assign_to,
                p.urgency,
                COALESCE(ts.total_hours, 0) as hours_spent,
                u.fullname as engineer_name,
                u.profile_pic as engineer_image
            FROM projects p
            LEFT JOIN (
                SELECT project_id_timesheet, SUM(working_hours) as total_hours 
                FROM timesheet 
                GROUP BY project_id_timesheet
            ) ts ON p.project_id = ts.project_id_timesheet
            LEFT JOIN tbl_admin u ON p.assign_to_id = u.user_id
            ORDER BY p.start_date DESC
        `);

        // Categorize the data for the frontend
        const categories = {
            not_assigned: rows.filter(p => !p.assign_to_id),
            not_started: rows.filter(p => p.assign_to_id && p.progress === 0),
            newly_started: rows.filter(p => p.progress > 0 && p.progress <= 20)
        };

        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ... existing imports and DB config
app.get('/api/detailed-projects', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.*, 
                p.end_date as estimated_date,
                p.urgency, -- Pulling the urgency column (e.g., 'purple')
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'user_id', u.user_id,
                            'name', u.fullname,
                            'pic', COALESCE(u.profile_pic, ''),
                            'total_hours', sub.total_hours,
                            'breakouts', (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT('date', date_value, 'hours', working_hours)
                                )
                                FROM timesheet 
                                WHERE project_id_timesheet = p.project_id AND user_id = u.user_id
                            )
                        )
                    )
                    FROM (
                        SELECT project_id_timesheet, user_id, SUM(working_hours) as total_hours
                        FROM timesheet
                        GROUP BY project_id_timesheet, user_id
                    ) sub
                    JOIN tbl_admin u ON sub.user_id = u.user_id
                    WHERE sub.project_id_timesheet = p.project_id
                ) as contributors
            FROM projects p
            ORDER BY p.start_date DESC
        `);

        const formattedRows = rows.map(row => {
            const cleanEPT = row.EPT ? parseFloat(row.EPT.toString().replace(/[^\d.]/g, '')) : 0;
            return {
                ...row,
                estimated_hours: cleanEPT,
                contributors: typeof row.contributors === 'string' ? JSON.parse(row.contributors) : (row.contributors || [])
            };
        });
        res.json(formattedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5001; // FIXED: Moved to 5001 to avoid macOS AirPlay conflict on 5000
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
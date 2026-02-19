import sql from './src/app/api/utils/sql.js';

async function checkColumns() {
    try {
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'shift_swap_requests'
    `;
        console.log('Columns in shift_swap_requests:');
        columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkColumns();

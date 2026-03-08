-- Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT NOT NULL,
  photo_url TEXT,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_assignment_id ON incidents(assignment_id);
CREATE INDEX IF NOT EXISTS idx_incidents_employee_id ON incidents(employee_id);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON incidents(date);

USE drishya;

CREATE TABLE IF NOT EXISTS equipment_units (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  equipment_id BIGINT UNSIGNED NOT NULL,
  asset_code VARCHAR(80) NOT NULL UNIQUE,
  condition_notes VARCHAR(500),
  status ENUM('available', 'reserved', 'rented', 'maintenance') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_unit_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

CREATE TABLE IF NOT EXISTS booking_unit_assignments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  booking_item_id BIGINT UNSIGNED NOT NULL,
  unit_id BIGINT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  returned_at TIMESTAMP NULL,
  CONSTRAINT fk_assignment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_assignment_item FOREIGN KEY (booking_item_id) REFERENCES booking_items(id),
  CONSTRAINT fk_assignment_unit FOREIGN KEY (unit_id) REFERENCES equipment_units(id),
  UNIQUE KEY uq_booking_unit (booking_id, unit_id)
);

CREATE TABLE IF NOT EXISTS booking_payments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  payment_type ENUM('rental', 'deposit', 'refund', 'damage') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('cash', 'upi', 'manual') NOT NULL,
  status ENUM('recorded', 'refunded') NOT NULL DEFAULT 'recorded',
  notes VARCHAR(500),
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS booking_operations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  operation ENUM('handover', 'return') NOT NULL,
  condition_notes VARCHAR(500),
  missing_accessories VARCHAR(500),
  damage_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_refund DECIMAL(10,2) NOT NULL DEFAULT 0,
  customer_verified BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_booking_operation (booking_id, operation),
  CONSTRAINT fk_operation_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

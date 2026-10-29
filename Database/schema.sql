CREATE DATABASE IF NOT EXISTS drishya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE drishya;

CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  phone VARCHAR(30),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE equipment_categories (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE equipment (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  daily_rate DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_units INT UNSIGNED NOT NULL DEFAULT 1,
  available_units INT UNSIGNED NOT NULL DEFAULT 1,
  image_url VARCHAR(500),
  status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_equipment_category FOREIGN KEY (category_id) REFERENCES equipment_categories(id)
);

CREATE TABLE bookings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  status ENUM('requested', 'approved', 'active', 'returned', 'cancelled') NOT NULL DEFAULT 'requested',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE booking_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  equipment_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  daily_rate DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_booking_item_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_booking_item_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

CREATE TABLE equipment_units (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  equipment_id BIGINT UNSIGNED NOT NULL,
  asset_code VARCHAR(80) NOT NULL UNIQUE,
  condition_notes VARCHAR(500),
  status ENUM('available', 'reserved', 'rented', 'maintenance') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_unit_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

CREATE TABLE booking_unit_assignments (
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

CREATE TABLE booking_payments (
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

CREATE TABLE booking_operations (
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

CREATE TABLE enquiries (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  subject VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'in_progress', 'resolved') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

USE drishya;

INSERT INTO equipment_categories (name, slug) VALUES
  ('Digital Cameras', 'digital-cameras'),
  ('Cinema Cameras', 'cinema-cameras'),
  ('Lenses', 'lenses'),
  ('Lighting', 'lighting'),
  ('Audio', 'audio'),
  ('Accessories', 'accessories')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO equipment (category_id, name, slug, description, daily_rate, security_deposit, total_units, available_units, image_url)
SELECT id, 'Demo Cinema Camera', 'demo-cinema-camera', 'A demo item for local development.', 4500.00, 15000.00, 2, 2, '/images/demo-camera.jpg'
FROM equipment_categories WHERE slug = 'cinema-cameras'
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample categories if they don't exist
INSERT INTO categories (id, slug, icon, color) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'history', '🏛️', '#3B82F6'),
  ('550e8400-e29b-41d4-a716-446655440002', 'culture', '🎭', '#8B5CF6'),
  ('550e8400-e29b-41d4-a716-446655440003', 'legend', '⚡', '#F59E0B'),
  ('550e8400-e29b-41d4-a716-446655440004', 'nature', '🌲', '#10B981'),
  ('550e8400-e29b-41d4-a716-446655440005', 'mystery', '❓', '#EF4444')
ON CONFLICT (slug) DO NOTHING;

-- Insert category translations if they don't exist
INSERT INTO category_translations (category_id, language_code, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'en', 'History', 'Historical sites and events'),
  ('550e8400-e29b-41d4-a716-446655440002', 'en', 'Culture', 'Cultural landmarks and traditions'),
  ('550e8400-e29b-41d4-a716-446655440003', 'en', 'Legend', 'Myths and legendary tales'),
  ('550e8400-e29b-41d4-a716-446655440004', 'en', 'Nature', 'Natural wonders and wildlife'),
  ('550e8400-e29b-41d4-a716-446655440005', 'en', 'Mystery', 'Unexplained phenomena')
ON CONFLICT (category_id, language_code) DO NOTHING;

-- Insert sample facts if they don't exist
INSERT INTO facts (id, title, description, location_name, latitude, longitude, category_id, status, vote_count_up, vote_count_down) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'Empire State Building', 'Iconic Art Deco skyscraper completed in 1931, standing 1,454 feet tall including its antenna.', 'Manhattan, New York', 40.7484, -73.9857, '550e8400-e29b-41d4-a716-446655440001', 'verified', 15, 2),
  ('550e8400-e29b-41d4-a716-446655440012', 'Central Park Shakespeare Garden', 'Hidden garden featuring plants mentioned in Shakespeare''s works, a peaceful retreat in the city.', 'Central Park, New York', 40.7794, -73.9656, '550e8400-e29b-41d4-a716-446655440002', 'verified', 8, 1),
  ('550e8400-e29b-41d4-a716-446655440013', 'Brooklyn Bridge Ghost Stories', 'Local legends tell of construction workers'' spirits still guarding the bridge they built.', 'Brooklyn Bridge, New York', 40.7061, -73.9969, '550e8400-e29b-41d4-a716-446655440003', 'pending', 12, 4),
  ('550e8400-e29b-41d4-a716-446655440014', 'The High Line', 'Elevated linear park built on former railway tracks, showcasing urban nature and art.', 'Chelsea, New York', 40.7480, -74.0048, '550e8400-e29b-41d4-a716-446655440004', 'verified', 22, 0),
  ('550e8400-e29b-41d4-a716-446655440015', 'The Mysterious Steam Pipes', 'Unexplained steam rising from manholes throughout the city - urban legend or utility reality?', 'Various Locations, New York', 40.7505, -73.9934, '550e8400-e29b-41d4-a716-446655440005', 'pending', 7, 3),
  ('550e8400-e29b-41d4-a716-446655440016', 'Trinity Church Cemetery', 'Historic cemetery where Alexander Hamilton is buried, with tales of Revolutionary War spirits.', 'Financial District, New York', 40.7081, -74.0134, '550e8400-e29b-41d4-a716-446655440001', 'verified', 18, 1),
  ('550e8400-e29b-41d4-a716-446655440017', 'Little Italy Festival Grounds', 'Where generations have celebrated Italian heritage through food, music, and traditions.', 'Little Italy, New York', 40.7193, -73.9965, '550e8400-e29b-41d4-a716-446655440002', 'verified', 13, 2),
  ('550e8400-e29b-41d4-a716-446655440018', 'Washington Square Park Fountain', 'Said to be a portal to another dimension according to local urban legends.', 'Greenwich Village, New York', 40.7308, -73.9973, '550e8400-e29b-41d4-a716-446655440003', 'pending', 5, 8)
ON CONFLICT (id) DO NOTHING;
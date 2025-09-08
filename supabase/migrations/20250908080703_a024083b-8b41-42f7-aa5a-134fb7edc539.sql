-- Insert sample facts with proper author_id (using auth system account)
-- First, let's create a sample author profile for demo facts
INSERT INTO profiles (id, username, bio) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'curator_demo', 'Demo content curator')
ON CONFLICT (id) DO NOTHING;

-- Insert sample facts using existing category IDs and the demo author
INSERT INTO facts (id, title, description, location_name, latitude, longitude, category_id, status, vote_count_up, vote_count_down, author_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'Empire State Building', 'Iconic Art Deco skyscraper completed in 1931, standing 1,454 feet tall including its antenna.', 'Manhattan, New York', 40.7484, -73.9857, 'a9ea3569-0e83-4f83-a3a2-cbce5fe64bb5', 'verified', 15, 2, '00000000-0000-0000-0000-000000000001'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Central Park Shakespeare Garden', 'Hidden garden featuring plants mentioned in Shakespeare''s works, a peaceful retreat in the city.', 'Central Park, New York', 40.7794, -73.9656, 'a0792875-75c7-4128-bf5e-435cfd063910', 'verified', 8, 1, '00000000-0000-0000-0000-000000000001'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Brooklyn Bridge Ghost Stories', 'Local legends tell of construction workers'' spirits still guarding the bridge they built.', 'Brooklyn Bridge, New York', 40.7061, -73.9969, '789ae79b-fd11-4a65-a1ce-04340d056b99', 'pending', 12, 4, '00000000-0000-0000-0000-000000000001'),
  ('550e8400-e29b-41d4-a716-446655440014', 'The High Line', 'Elevated linear park built on former railway tracks, showcasing urban nature and art.', 'Chelsea, New York', 40.7480, -74.0048, '4364f8ea-41bb-4bfa-87be-97b959eb6a9e', 'verified', 22, 0, '00000000-0000-0000-0000-000000000001'),
  ('550e8400-e29b-41d4-a716-446655440015', 'The Mysterious Steam Pipes', 'Unexplained steam rising from manholes throughout the city - urban legend or utility reality?', 'Various Locations, New York', 40.7505, -73.9934, 'd0e7ba04-332e-4182-8348-b6dc15b04b22', 'pending', 7, 3, '00000000-0000-0000-0000-000000000001'),
  ('550e8400-e29b-41d4-a716-446655440016', 'Trinity Church Cemetery', 'Historic cemetery where Alexander Hamilton is buried, with tales of Revolutionary War spirits.', 'Financial District, New York', 40.7081, -74.0134, 'a9ea3569-0e83-4f83-a3a2-cbce5fe64bb5', 'verified', 18, 1, '00000000-0000-0000-0000-000000000001'),
  ('550e8400-e29b-41d4-a716-446655440017', 'Little Italy Festival Grounds', 'Where generations have celebrated Italian heritage through food, music, and traditions.', 'Little Italy, New York', 40.7193, -73.9965, 'a0792875-75c7-4128-bf5e-435cfd063910', 'verified', 13, 2, '00000000-0000-0000-0000-000000000001'),
  ('550e8400-e29b-41d4-a716-446655440018', 'Washington Square Park Fountain', 'Said to be a portal to another dimension according to local urban legends.', 'Greenwich Village, New York', 40.7308, -73.9973, '789ae79b-fd11-4a65-a1ce-04340d056b99', 'pending', 5, 8, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
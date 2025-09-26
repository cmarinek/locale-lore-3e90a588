-- Update remaining facts with relevant images
UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'] WHERE title = 'Beneath the Louvre' AND media_urls = ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'];

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'] WHERE title = 'Beneath the Louvre';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'Blood Falls';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'Brooklyn Bridge Ghost Stories';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'Easter Island Moai';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'] WHERE title = 'Forbidden City';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'Ghost Lights of Marfa';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'Hidden Waterfalls of Yosemite';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&h=600&fit=crop'] WHERE title = 'Machu Picchu Hidden Chamber';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop'] WHERE title = 'Mont Saint-Michel';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'] WHERE title = 'Statue of Liberty';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1555400081-61ae9deee2b9?w=800&h=600&fit=crop'] WHERE title = 'The Antikythera Mechanism';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'] WHERE title = 'The Boiling River of the Amazon';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'] WHERE title = 'The Boiling River of the Amazon';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'] WHERE title = 'The Crooked Forest';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'The Crooked Forest';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'The Devil''s Kettle Waterfall';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&h=600&fit=crop'] WHERE title = 'The Floating Gardens of Xochimilco';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'The Hessdalen Lights';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'] WHERE title = 'The Island of Dolls';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&h=600&fit=crop'] WHERE title = 'The Island of Dolls';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'The Moving Rocks of Racetrack Playa';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'The Nazca Line Discoveries';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'] WHERE title = 'The Sedlec Ossuary';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop'] WHERE title = 'The Secret Churchill Bunker';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'The Underwater City of Shicheng';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'] WHERE title = 'The Winchester Mystery House';

UPDATE facts SET media_urls = ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'] WHERE title = 'The Winchester Mystery House';

-- Update image_url to match media_urls for consistency
UPDATE facts SET image_url = media_urls[1] WHERE media_urls IS NOT NULL AND array_length(media_urls, 1) > 0;
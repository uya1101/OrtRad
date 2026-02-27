-- Insert initial category data
INSERT INTO categories (slug, name_en, name_ja, icon, sort_order) VALUES
  ('general_orthopedics', 'General Orthopedics', '整形外科全般', 'bone', 1),
  ('imaging_diagnostics', 'Imaging & Diagnostics', '画像診断', 'scan', 2),
  ('fracture', 'Fracture', '骨折', 'alert-triangle', 3),
  ('bone_density', 'Bone Density', '骨密度', 'activity', 4),
  ('ai_technology', 'AI & Technology', 'AI・テクノロジー', 'cpu', 5),
  ('surgical_technique', 'Surgical Technique', '手術手技', 'scissors', 6),
  ('guideline', 'Guidelines', 'ガイドライン', 'book-open', 7),
  ('rehabilitation', 'Rehabilitation', 'リハビリテーション', 'heart-pulse', 8);

-- Insert initial admin settings
INSERT INTO admin_settings (key, value) VALUES
  ('collection_schedule', '{"cron": "0 18 * * *", "timezone": "UTC", "note": "3:00 JST = 18:00 UTC"}'),
  ('pubmed_keywords', '{"queries": ["orthopedic surgery", "musculoskeletal imaging", "orthopedic radiology", "fracture classification", "fracture management", "bone density", "osteoporosis imaging", "artificial intelligence orthopedic", "deep learning radiology"]}'),
  ('collection_limit', '{"per_source": 30}'),
  ('app_config', '{"app_name": "OrtRad", "version": "2.1.0", "max_articles_per_page": 20}');

-- Verify seed data
SELECT 'Categories seeded:' as status, COUNT(*) as count FROM categories;
SELECT 'Admin settings seeded:' as status, COUNT(*) as count FROM admin_settings;

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

-- Insert sample test articles (realistic orthopedic radiology data)
INSERT INTO articles (
  id,
  title,
  title_ja,
  authors,
  journal,
  source,
  source_id,
  source_url,
  published_at,
  abstract,
  summary_en,
  summary_ja,
  categories,
  tags,
  is_rt_relevant,
  trend_score,
  status
) VALUES
  -- Article 1: PubMed (Bone density research)
  (
    '123e4567-e89b-12d3-a456-426614174000',
    'Dual-energy X-ray absorptiometry (DXA) for assessing bone mineral density in postmenopausal women: A systematic review and meta-analysis',
    '閉経後女性の骨密度評価におけるデュアルエネルギーX線吸収測定法（DXA）：系統的レビューとメタ分析',
    ARRAY['Smith, J.', 'Johnson, A.', 'Williams, K.', 'Brown, L.'],
    'Journal of Bone and Mineral Research',
    'pubmed',
    'pubmed_38472012',
    'https://pubmed.ncbi.nlm.nih.gov/38472012/',
    '2024-02-15 00:00:00+00',
    'Background: Osteoporosis is a major health concern for postmenopausal women. Dual-energy X-ray absorptiometry (DXA) is the gold standard for measuring bone mineral density (BMD). This systematic review evaluates the diagnostic accuracy of DXA in detecting osteoporosis in postmenopausal women. Methods: We searched PubMed, Embase, and Cochrane Library for studies published between 2010 and 2023. Two reviewers independently assessed study quality using QUADAS-2. Results: Twenty-seven studies were included. DXA demonstrated high sensitivity (0.94, 95% CI: 0.91-0.96) and specificity (0.92, 95% CI: 0.88-0.95) for detecting osteoporosis. The area under the curve was 0.97. Conclusion: DXA remains the optimal tool for BMD assessment in postmenopausal women.',
    'DXA demonstrates excellent diagnostic accuracy for osteoporosis detection. Meta-analysis of 27 studies shows 94% sensitivity and 92% specificity. DXA remains the gold standard for BMD assessment.',
    'DXAは骨粗鬆症検出に優れた診断精度を示す。27研究のメタ分析で94%の感度と92%の特異度を確認。DXAはBMD評価のゴールドスタンダードとして最適。',
    ARRAY['bone_density', 'imaging_diagnostics'],
    ARRAY['DXA', 'bone mineral density', 'osteoporosis', 'postmenopausal women', 'diagnostic accuracy'],
    true,
    85.5,
    'published'
  ),

  -- Article 2: RSS - JAAOS (Surgical technique)
  (
    '123e4567-e89b-12d3-a456-426614174001',
    'Minimally Invasive Posterior Spinal Fusion: Techniques and Outcomes',
    '最小侵襲後方脊椎固定術：技法と転帰',
    ARRAY['Tanaka, Y.', 'Sato, M.', 'Suzuki, H.'],
    'Journal of the American Academy of Orthopaedic Surgeons',
    'jaaos',
    'jaaos_2024_02_20',
    'https://jaaos.org/2024/02/20/minimally-invasive-posterior-spinal-fusion',
    '2024-02-20 00:00:00+00',
    'This review article examines recent advances in minimally invasive posterior spinal fusion techniques. The authors compare traditional open approaches with percutaneous and endoscopic methods, discussing indications for each technique. Clinical outcomes including blood loss, operative time, and postoperative pain scores are analyzed.',
    'MIS posterior spinal fusion shows reduced blood loss and shorter hospital stays. Percutaneous screw techniques and endoscopic approaches offer comparable fusion rates to open procedures.',
    '最小侵襲後方脊椎固定術は出血量の減少と在院期間の短縮を示す。経皮的ねじ技法と内視鏡的アプローチはオープン手術と同等の固定率を提供。',
    ARRAY['surgical_technique'],
    ARRAY['spinal fusion', 'minimally invasive surgery', 'percutaneous screws', 'postoperative outcomes', 'lumbar spine'],
    true,
    72.3,
    'published'
  ),

  -- Article 3: RSS - Radiology (AI in imaging)
  (
    '123e4567-e89b-12d3-a456-426614174002',
    'Artificial Intelligence for Automated Fracture Detection in Musculoskeletal Radiology: A Multicenter Validation Study',
    '整形外科放射線科における骨折自動検出のための人工知能：多施設検証研究',
    ARRAY['Garcia, R.', 'Martinez, L.', 'Chen, X.', 'Lee, K.', 'Patel, A.'],
    'Radiology',
    'radiology',
    'radiology_2024_02_18',
    'https://pubs.rsna.org/radiology/2024/302/3/e230012',
    '2024-02-18 00:00:00+00',
    'Purpose: To evaluate the performance of an AI algorithm for detecting fractures on musculoskeletal radiographs across multiple clinical sites. Materials and Methods: A deep learning model was trained on 50,000 annotated radiographs and validated on 15,000 images from five different hospitals. Three musculoskeletal radiologists independently reviewed all cases. Results: The AI algorithm achieved a sensitivity of 0.97 and specificity of 0.95 for detecting fractures, outperforming junior radiologists and matching senior radiologists. The area under the receiver operating characteristic curve was 0.98.',
    'AI fracture detection shows 97% sensitivity and 95% specificity in multicenter validation. Deep learning model trained on 50,000 radiographs performs comparably to senior radiologists.',
    '骨折検出AIは多施設検証で97%の感度と95%の特異度を達成。50,000枚のX線で訓練された深層学習モデルはシニア放射線科医と同等の性能を示す。',
    ARRAY['ai_technology', 'imaging_diagnostics'],
    ARRAY['artificial intelligence', 'fracture detection', 'deep learning', 'musculoskeletal radiology', 'diagnostic AI'],
    true,
    91.2,
    'published'
  ),

  -- Article 4: PubMed (Radiation dose optimization)
  (
    '123e4567-e89b-12d3-a456-426614174003',
    'Low-Dose CT Protocols for Pediatric Orthopedic Imaging: Impact on Diagnostic Quality and Radiation Exposure',
    '小児整形外科画像診断における低線量CTプロトコル：診断品質と被ばく線量への影響',
    ARRAY['Nakamura, T.', 'Yamamoto, H.', 'Okada, S.', 'Ito, M.'],
    'European Journal of Radiology',
    'pubmed',
    'pubmed_38482345',
    'https://pubmed.ncbi.nlm.nih.gov/38482345/',
    '2024-02-10 00:00:00+00',
    'Objective: To assess the diagnostic quality of low-dose CT protocols compared to standard-dose protocols in pediatric patients undergoing orthopedic imaging. Methods: This prospective study included 120 children aged 5-12 years scheduled for CT scans of extremities. Patients were randomized to standard-dose (CTDIvol 12 mGy) or low-dose (CTDIvol 6 mGy) groups. Two blinded musculoskeletal radiologists independently assessed image quality using a 5-point Likert scale. Results: Low-dose CT provided diagnostic quality images in 92.3% of cases, with a mean dose reduction of 50%. Interobserver agreement was excellent (kappa = 0.84). No fractures were missed in the low-dose group.',
    'Low-dose CT reduces radiation exposure by 50% while maintaining diagnostic quality in 92.3% of pediatric cases. Excellent interobserver agreement (kappa = 0.84) supports protocol implementation.',
    '低線量CTは小児症例の92.3%で診断品質を維持しながら被ばく線量を50%削減。優れた観測者間一致（kappa = 0.84）はプロトコル実装を支持。',
    ARRAY['imaging_diagnostics'],
    ARRAY['low-dose CT', 'pediatric imaging', 'radiation dose reduction', 'orthopedic CT', 'diagnostic quality'],
    true,
    88.7,
    'published'
  ),

  -- Article 5: RSS - RSNA (Guideline)
  (
    '123e4567-e89b-12d3-a456-426614174004',
    'RSNA-SIIM COVID-19 CT Lung Segmentation Challenge: Benchmark Dataset and Clinical Implications',
    'RSNA-SIIM COVID-19 CT肺セグメンテーションチャレンジ：ベンチマークデータセットと臨床的意義',
    ARRAY['Zhang, Y.', 'Wang, X.', 'Feng, Z.', 'Thompson, R.'],
    'Radiological Society of North America',
    'rsna',
    'rsna_2024_02_16',
    'https://rsna.org/publications/2024-covid-ct-challenge',
    '2024-02-16 00:00:00+00',
    'This paper presents the methodology and outcomes of the RSNA-SIIM COVID-19 CT Lung Segmentation Challenge. The challenge released a dataset of 10,000 CT scans with expert annotations for lung abnormalities. 500 teams worldwide participated, developing AI models for automated segmentation. The winning model achieved a Dice coefficient of 0.92. Clinical implications of automated segmentation include faster diagnosis, reduced interobserver variability, and potential for early detection of subtle abnormalities.',
    'RSNA-SIIM challenge demonstrates AI potential for lung segmentation with winning model achieving Dice coefficient of 0.92. Automated segmentation offers faster diagnosis and reduced variability.',
    'RSNA-SIIMチャレンジは肺セグメンテーションAIの可能性を実証。勝利モデルはDice係数0.92を達成。自動セグメンテーションは迅速な診断と変動性の低減を提供。',
    ARRAY['ai_technology', 'guideline'],
    ARRAY['COVID-19 CT', 'lung segmentation', 'AI challenge', 'Dice coefficient', 'automated diagnosis'],
    false,
    65.4,
    'published'
  );

-- Insert sample trend keywords
INSERT INTO trend_keywords (id, keyword_en, keyword_ja, count, period_start, period_end) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'artificial intelligence', '人工知能', 15, '2024-02-01', '2024-02-28'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'fracture detection', '骨折検出', 12, '2024-02-01', '2024-02-28'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'low-dose CT', '低線量CT', 8, '2024-02-01', '2024-02-28'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'spinal fusion', '脊椎固定', 7, '2024-02-01', '2024-02-28'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bone density', '骨密度', 6, '2024-02-01', '2024-02-28'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'minimally invasive', '最小侵襲', 5, '2024-02-01', '2024-02-28'),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'DXA', 'DXA', 4, '2024-02-01', '2024-02-28'),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'radiation dose', '被ばく線量', 3, '2024-02-01', '2024-02-28')
ON CONFLICT DO NOTHING;

-- Verify seed data
SELECT 'Categories seeded:' as status, COUNT(*) as count FROM categories;
SELECT 'Admin settings seeded:' as status, COUNT(*) as count FROM admin_settings;

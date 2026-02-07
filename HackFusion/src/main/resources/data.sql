INSERT INTO departments (id, name) VALUES
                                       (gen_random_uuid(), 'BMC'),
                                       (gen_random_uuid(), 'MMRDA'),
                                       (gen_random_uuid(), 'MMRCL'),
                                       (gen_random_uuid(), 'BEST'),
                                       (gen_random_uuid(), 'Police Department'),
                                       (gen_random_uuid(), 'Public Works Department');
INSERT INTO operators (id, username, role, join_date, department_id)
VALUES
    -- Workers for BMC
    (gen_random_uuid(), 'rahul_bmc', 'Field Engineer', '2024-01-15', (SELECT id FROM departments WHERE name = 'BMC')),
    (gen_random_uuid(), 'priya_bmc', 'Supervisor', '2023-11-20', (SELECT id FROM departments WHERE name = 'BMC')),

    -- Workers for MMRDA
    (gen_random_uuid(), 'amit_mmrda', 'Technician', '2024-02-10', (SELECT id FROM departments WHERE name = 'MMRDA')),
    (gen_random_uuid(), 'sara_mmrda', 'Manager', '2023-05-12', (SELECT id FROM departments WHERE name = 'MMRDA')),

    -- Workers for BEST
    (gen_random_uuid(), 'vikram_best', 'Line Worker', '2024-01-05', (SELECT id FROM departments WHERE name = 'BEST')),
    (gen_random_uuid(), 'anita_best', 'Dispatcher', '2023-08-15', (SELECT id FROM departments WHERE name = 'BEST')),

    -- Workers for MMRCL
    (gen_random_uuid(), 'raj_mmrcl', 'Safety Officer', '2024-03-01', (SELECT id FROM departments WHERE name = 'MMRCL'));
INSERT INTO reports (
    id, description, entry_date, issue_since, lat, lon,
    media_url, pdf_url, priority, status, upvotes,
    department_id, operator_id, assigned_id
) VALUES
-- 1. BMC - Water Leakage
(gen_random_uuid(), 'Major water pipe burst near Dadar Station', CURRENT_DATE, '2026-02-05', 19.0178, 72.8478, ARRAY['http://img.com/water1.jpg'], NULL, 1, 'PENDING', 45,
 (SELECT id FROM departments WHERE name = 'BMC'), (SELECT id FROM operators WHERE username = 'rahul_bmc'), (SELECT id FROM operators WHERE username = 'priya_bmc')),

-- 2. BMC - Garbage Collection
(gen_random_uuid(), 'Unattended garbage pile in Dharavi sector 3', CURRENT_DATE, '2026-02-06', 19.0380, 72.8538, ARRAY['http://img.com/trash.jpg'], NULL, 3, 'ASSIGNED', 12,
 (SELECT id FROM departments WHERE name = 'BMC'), (SELECT id FROM operators WHERE username = 'priya_bmc'), (SELECT id FROM operators WHERE username = 'rahul_bmc')),

-- 3. MMRDA - Metro Pillar Crack
(gen_random_uuid(), 'Surface cracks observed on Metro Pillar 402', CURRENT_DATE, '2026-01-20', 19.1176, 72.8480, ARRAY['http://img.com/pillar.jpg'], 'http://docs.com/structural_report.pdf', 1, 'IN_PROGRESS', 89,
 (SELECT id FROM departments WHERE name = 'MMRDA'), (SELECT id FROM operators WHERE username = 'amit_mmrda'), (SELECT id FROM operators WHERE username = 'sara_mmrda')),

-- 4. BEST - Power Outage
(gen_random_uuid(), 'Street lights not working on Link Road', CURRENT_DATE, '2026-02-07', 19.1860, 72.8485, ARRAY['http://img.com/dark.jpg'], NULL, 2, 'PENDING', 8,
 (SELECT id FROM departments WHERE name = 'BEST'), (SELECT id FROM operators WHERE username = 'vikram_best'), (SELECT id FROM operators WHERE username = 'anita_best')),

-- 5. MMRCL - Noise Complaint
(gen_random_uuid(), 'Late night drilling noise beyond 10PM', CURRENT_DATE, '2026-02-01', 18.9322, 72.8264, NULL, NULL, 3, 'CLOSED', 4,
 (SELECT id FROM departments WHERE name = 'MMRCL'), (SELECT id FROM operators WHERE username = 'raj_mmrcl'), (SELECT id FROM operators WHERE username = 'raj_mmrcl')),

-- 6. BMC - Pothole
(gen_random_uuid(), 'Deep pothole causing traffic at JVLR', CURRENT_DATE, '2026-01-15', 19.1271, 72.8727, ARRAY['http://img.com/hole.jpg'], NULL, 1, 'ASSIGNED', 156,
 (SELECT id FROM departments WHERE name = 'BMC'), (SELECT id FROM operators WHERE username = 'rahul_bmc'), (SELECT id FROM operators WHERE username = 'priya_bmc')),

-- 7. BEST - Bus Stop Damage
(gen_random_uuid(), 'Broken bench and roof at Mahim Bus Stop', CURRENT_DATE, '2026-02-04', 19.0354, 72.8404, ARRAY['http://img.com/stop.jpg'], NULL, 3, 'PENDING', 15,
 (SELECT id FROM departments WHERE name = 'BEST'), (SELECT id FROM operators WHERE username = 'anita_best'), (SELECT id FROM operators WHERE username = 'vikram_best')),

-- 8. MMRDA - Road Blockage
(gen_random_uuid(), 'Construction material dumping on highway', CURRENT_DATE, '2026-02-06', 19.0626, 72.8729, ARRAY['http://img.com/blocks.jpg'], NULL, 2, 'PENDING', 22,
 (SELECT id FROM departments WHERE name = 'MMRDA'), (SELECT id FROM operators WHERE username = 'sara_mmrda'), (SELECT id FROM operators WHERE username = 'amit_mmrda')),

-- 9. MMRCL - Tunnel Seepage
(gen_random_uuid(), 'Minor water seepage in tunnel section B', CURRENT_DATE, '2026-01-10', 19.0433, 72.8230, ARRAY['http://img.com/seep.jpg'], 'http://docs.com/tunnel_safety.pdf', 1, 'IN_PROGRESS', 5,
 (SELECT id FROM departments WHERE name = 'MMRCL'), (SELECT id FROM operators WHERE username = 'raj_mmrcl'), (SELECT id FROM operators WHERE username = 'raj_mmrcl')),

-- 10. BMC - Tree Fall
(gen_random_uuid(), 'Old Banyan tree fell blocking lane 4', CURRENT_DATE, '2026-02-07', 18.9440, 72.8235, ARRAY['http://img.com/tree.jpg'], NULL, 1, 'PENDING', 34,
 (SELECT id FROM departments WHERE name = 'BMC'), (SELECT id FROM operators WHERE username = 'priya_bmc'), (SELECT id FROM operators WHERE username = 'rahul_bmc'));
INSERT INTO report_status_history (id, report_id, status, status_date)
VALUES
    (gen_random_uuid(), '57f5a360-df28-48cd-a31f-198d94a78473', 'REPORT_LOGGED', '2026-02-07'),
    (gen_random_uuid(), '57f5a360-df28-48cd-a31f-198d94a78473', 'UNDER_REVIEW', '2026-02-07'),
    (gen_random_uuid(), '57f5a360-df28-48cd-a31f-198d94a78473', 'DEPARTMENT_NOTIFIED', '2026-02-07'),
    (gen_random_uuid(), '57f5a360-df28-48cd-a31f-198d94a78473', 'OPERATOR_ASSIGNED', '2026-02-07'),
    (gen_random_uuid(), '57f5a360-df28-48cd-a31f-198d94a78473', 'SITE_INSPECTION_STARTED', '2026-02-07');
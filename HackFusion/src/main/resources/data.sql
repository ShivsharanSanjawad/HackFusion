INSERT INTO departments (id, name) VALUES
                                       ('550e8400-e29b-41d4-a716-446655440000', 'Engineering'),
                                       ('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'Operations'),
                                       ('a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', 'Data Science');

INSERT INTO operators (id, username, role, join_date, department_id) VALUES
                                                                         ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'alice_tech', 'Staff', '2023-01-15', '550e8400-e29b-41d4-a716-446655440000'),
                                                                         ('b2d4e6f8-a1c3-4e5b-9d7f-8a0b1c2d3e4f', 'bob_ops', 'Staff', '2023-03-22', '7c9e6679-7425-40de-944b-e07fc1f90ae7'),
-- CORRECTED UUID BELOW (Matches the one used in your reports table)
                                                                         ('6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a', 'charlie_data', 'Staff', '2023-06-10', 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6');
INSERT INTO reports (id, description, entry_date, issue_since, lat, lon, priority, status, upvotes, department_id, operator_id, assigned_id) VALUES
-- Reports for Alice (Engineering - Mumbai South/Central)
('11111111-1111-4111-a111-111111111111', 'Structural cracks on Marine Drive promenade', '2024-01-01', '2023-12-25', 18.9440, 72.8230, 1, 'OPEN', 12, '550e8400-e29b-41d4-a716-446655440000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
('22222222-2222-4222-a222-222222222222', 'Severe pothole near Dadar Station', '2024-01-02', '2024-01-01', 19.0178, 72.8478, 3, 'IN_PROGRESS', 5, '550e8400-e29b-41d4-a716-446655440000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
('33333333-3333-4333-a333-333333333333', 'Traffic signal sync error in Worli', '2024-01-03', '2024-01-03', 19.0110, 72.8150, 2, 'OPEN', 8, '550e8400-e29b-41d4-a716-446655440000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),

-- Reports for Bob (Operations - Western Suburbs)
('44444444-4444-4444-a444-444444444444', 'Transformer sparking near Bandra Reclamation', '2024-01-05', '2024-01-04', 19.0400, 72.8200, 1, 'OPEN', 25, '7c9e6679-7425-40de-944b-e07fc1f90ae7', 'b2d4e6f8-a1c3-4e5b-9d7f-8a0b1c2d3e4f', 'b2d4e6f8-a1c3-4e5b-9d7f-8a0b1c2d3e4f'),
('55555555-5555-4555-a555-555555555555', 'Street lights non-functional in Andheri West', '2024-01-06', '2024-01-05', 19.1200, 72.8300, 3, 'OPEN', 3, '7c9e6679-7425-40de-944b-e07fc1f90ae7', 'b2d4e6f8-a1c3-4e5b-9d7f-8a0b1c2d3e4f', 'b2d4e6f8-a1c3-4e5b-9d7f-8a0b1c2d3e4f'),
('66666666-6666-4666-a666-666666666666', 'Cable vault fire hazard in Borivali', '2024-01-07', '2024-01-07', 19.2300, 72.8500, 2, 'RESOLVED', 0, '7c9e6679-7425-40de-944b-e07fc1f90ae7', 'b2d4e6f8-a1c3-4e5b-9d7f-8a0b1c2d3e4f', 'b2d4e6f8-a1c3-4e5b-9d7f-8a0b1c2d3e4f'),

-- Reports for Charlie (Data Science - Eastern Suburbs/Navi Mumbai)
('77777777-7777-4777-a777-777777777777', 'Major water pipeline leak in Ghatkopar', '2024-01-10', '2024-01-10', 19.0860, 72.9080, 1, 'OPEN', 50, 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', '6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a', '6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a'),
('88888888-8888-4888-a888-888888888888', 'Contamination alert - Vihar Lake feeder', '2024-01-11', '2024-01-11', 19.1480, 72.9000, 1, 'IN_PROGRESS', 100, 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', '6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a', '6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a'),
('99999999-9999-4999-a999-999999999999', 'Low water pressure reported in Powai', '2024-01-12', '2024-01-08', 19.1190, 72.9050, 2, 'OPEN', 15, 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6', '6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a', '6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a');

INSERT INTO report_status_history (id, status_date, status, report_id) VALUES
-- Report 1: OPEN
('b1111111-1111-4111-b111-111111111111', '2024-01-01', 'OPEN', '11111111-1111-4111-a111-111111111111'),

-- Report 2: IN_PROGRESS
('b2111111-2222-4222-b222-222222222222', '2024-01-02', 'OPEN', '22222222-2222-4222-a222-222222222222'),
('b2222222-2222-4222-b222-222222222222', '2024-01-03', 'ASSIGNED', '22222222-2222-4222-a222-222222222222'),
('b2333333-2222-4222-b222-222222222222', '2024-01-04', 'IN PROGRESS', '22222222-2222-4222-a222-222222222222'),

-- Report 3: OPEN
('b3111111-3333-4333-b333-333333333333', '2024-01-03', 'OPEN', '33333333-3333-4333-a333-333333333333'),

-- Report 4: OPEN
('b4111111-4444-4444-b444-444444444444', '2024-01-05', 'OPEN', '44444444-4444-4444-a444-444444444444'),

-- Report 5: OPEN
('b5111111-5555-4555-b555-555555555555', '2024-01-06', 'OPEN', '55555555-5555-4555-a555-555555555555'),

-- Report 6: RESOLVED
('b6111111-6666-4666-b666-666666666666', '2024-01-07', 'OPEN', '66666666-6666-4666-a666-666666666666'),
('b6222222-6666-4666-b666-666666666666', '2024-01-08', 'ASSIGNED', '66666666-6666-4666-a666-666666666666'),
('b6333333-6666-4666-b666-666666666666', '2024-01-09', 'IN PROGRESS', '66666666-6666-4666-a666-666666666666'),
('b6444444-6666-4666-b666-666666666666', '2024-01-10', 'RESOLVED', '66666666-6666-4666-a666-666666666666'),

-- Report 7: OPEN
('b7111111-7777-4777-b777-777777777777', '2024-01-10', 'OPEN', '77777777-7777-4777-a777-777777777777'),

-- Report 8: IN_PROGRESS
('b8111111-8888-4888-b888-888888888888', '2024-01-11', 'OPEN', '88888888-8888-4888-a888-888888888888'),
('b8222222-8888-4888-b888-888888888888', '2024-01-12', 'ASSIGNED', '88888888-8888-4888-a888-888888888888'),
('b8333333-8888-4888-b888-888888888888', '2024-01-13', 'IN PROGRESS', '88888888-8888-4888-a888-888888888888'),

-- Report 9: OPEN
('b9111111-9999-4999-b999-999999999999', '2024-01-12', 'OPEN', '99999999-9999-4999-a999-999999999999');
-- -- Insert sample classes
-- INSERT IGNORE INTO classes (id, name, level) VALUES 
--   ('11111111-1111-1111-1111-111111111111', 'PP1 Class', 'PP1'),
--   ('22222222-2222-2222-2222-222222222222', 'PP2 Class', 'PP2'),
--   ('33333333-3333-3333-3333-333333333333', 'Grade 3 Class', 'Grade 3');

-- -- Insert sample subjects
-- INSERT IGNORE INTO subjects (id, name, class_id) VALUES 
--   ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mathematics', '33333333-3333-3333-3333-333333333333'),
--   ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'English', '33333333-3333-3333-3333-333333333333'),
--   ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Science', '33333333-3333-3333-3333-333333333333'),
--   ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Reading', '22222222-2222-2222-2222-222222222222'),
--   ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Writing', '22222222-2222-2222-2222-222222222222');

-- -- Insert sample users (password is 'password123' hashed)
-- INSERT IGNORE INTO users (id, full_name, email, password, role, is_whitelisted) VALUES 
--   ('99999999-9999-9999-9999-999999999999', 'Admin User', 'admin@school.com', '$2b$10$rOzJmm6cVh.5c6uKK8XgOuYlQJ5VoKm6HcJJBJ5QVz1QkL2XFz6K2', 'admin', true),
--   ('88888888-8888-8888-8888-888888888888', 'John Teacher', 'john.teacher@school.com', '$2b$10$rOzJmm6cVh.5c6uKK8XgOuYlQJ5VoKm6HcJJBJ5QVz1QkL2XFz6K2', 'teacher', true),
--   ('77777777-7777-7777-7777-777777777777', 'Jane Teacher', 'jane.teacher@school.com', '$2b$10$rOzJmm6cVh.5c6uKK8XgOuYlQJ5VoKm6HcJJBJ5QVz1QkL2XFz6K2', 'teacher', true),
--   ('66666666-6666-6666-6666-666666666666', 'Alice Student', 'alice.student@school.com', '$2b$10$rOzJmm6cVh.5c6uKK8XgOuYlQJ5VoKm6HcJJBJ5QVz1QkL2XFz6K2', 'student', true),
--   ('55555555-5555-5555-5555-555555555555', 'Bob Student', 'bob.student@school.com', '$2b$10$rOzJmm6cVh.5c6uKK8XgOuYlQJ5VoKm6HcJJBJ5QVz1QkL2XFz6K2', 'student', true),
--   ('44444444-4444-4444-4444-444444444444', 'Charlie Student', 'charlie.student@school.com', '$2b$10$rOzJmm6cVh.5c6uKK8gOuYlQJ5VoKm6HcJJBJ5QVz1QkL2XFz6K2', 'student', true);

-- -- Insert sample students
-- INSERT IGNORE INTO students (id, user_id, class_id) VALUES 
--   ('student1-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333'),
--   ('student2-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333'),
--   ('student3-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333');

-- -- Insert sample teachers
-- INSERT IGNORE INTO teachers (id, user_id, class_id, subject_ids) VALUES 
--   ('teacher1-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', JSON_ARRAY('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')),
--   ('teacher2-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', JSON_ARRAY('cccccccc-cccc-cccc-cccc-cccccccccccc'));

-- -- Insert sample assignments
-- INSERT IGNORE INTO assignments (id, class_id, subject_id, title, description, type, deadline) VALUES 
--   ('assign1-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Basic Addition Quiz', 'Complete the basic addition problems', 'mcq', DATE_ADD(NOW(), INTERVAL 7 DAY)),
--   ('assign2-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Reading Comprehension', 'Read the passage and answer questions', 'mcq', DATE_ADD(NOW(), INTERVAL 5 DAY)),
--   ('assign3-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Science Experiment Report', 'Write about your science experiment', 'written', DATE_ADD(NOW(), INTERVAL 10 DAY));

-- -- Insert sample questions for MCQ assignments
-- INSERT IGNORE INTO questions (assignment_id, question_text, options, correct_option, marks) VALUES 
--   ('assign1-1111-1111-1111-111111111111', 'What is 2 + 2?', JSON_OBJECT('A', '3', 'B', '4', 'C', '5', 'D', '6'), 'B', 2),
--   ('assign1-1111-1111-1111-111111111111', 'What is 5 + 3?', JSON_OBJECT('A', '7', 'B', '8', 'C', '9', 'D', '10'), 'B', 2),
--   ('assign2-2222-2222-2222-222222222222', 'What is the main character''s name?', JSON_OBJECT('A', 'John', 'B', 'Mary', 'C', 'Peter', 'D', 'Sarah'), 'C', 3),
--   ('assign3-3333-3333-3333-333333333333', 'Describe your experiment process:', JSON_OBJECT(), '', 10);
-- </create_file>

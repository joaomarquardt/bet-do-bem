-- Users
-- Important! -> The password is 'senha123' for all users. Use it to log in and test the application.
INSERT INTO `users` (id, full_name, username, email, password, `role`, coins, has_bought_challenge, profile_picture_url) VALUES (2, 'João Silva', 'joaosilva123', 'joao@gmail.com', '$2b$12$DrWryuwevYzePfZZuJiGNexVcJxEOEfslEf1xu6gZ5CfcL32tT8Jy', 'USER', 500, false, NULL);
INSERT INTO `users` (id, full_name, username, email, password, `role`, coins, has_bought_challenge, profile_picture_url) VALUES (3, 'Maria Eduarda', 'mariaduda05', 'maria@gmail.com', '$2b$12$DrWryuwevYzePfZZuJiGNexVcJxEOEfslEf1xu6gZ5CfcL32tT8Jy', 'USER', 800, true, NULL);
INSERT INTO `users` (id, full_name, username, email, password, `role`, coins, has_bought_challenge, profile_picture_url) VALUES (4, 'Rafael Pinheiros', 'rafapinheiros_', 'rafael@gmail.com', '$2b$12$DrWryuwevYzePfZZuJiGNexVcJxEOEfslEf1xu6gZ5CfcL32tT8Jy', 'USER', 200, false, NULL);
INSERT INTO `users` (id, full_name, username, email, password, `role`, coins, has_bought_challenge, profile_picture_url) VALUES (5, 'Pedro Dantas', 'pedrodantxs', 'pedro@gmail.com', '$2b$12$DrWryuwevYzePfZZuJiGNexVcJxEOEfslEf1xu6gZ5CfcL32tT8Jy', 'USER', 1500, true, NULL);
INSERT INTO `users` (id, full_name, username, email, password, `role`, coins, has_bought_challenge, profile_picture_url) VALUES (6, 'Arthur Souza', 'arthursouza03_', 'arthur@gmail.com', '$2b$12$DrWryuwevYzePfZZuJiGNexVcJxEOEfslEf1xu6gZ5CfcL32tT8Jy', 'USER', 350, false, NULL);
INSERT INTO `users` (id, full_name, username, email, password, `role`, coins, has_bought_challenge, profile_picture_url) VALUES (7, 'Camila Rocha', 'camilarocha', 'camila@gmail.com', '$2b$12$DrWryuwevYzePfZZuJiGNexVcJxEOEfslEf1xu6gZ5CfcL32tT8Jy', 'USER', 600, false, NULL);
INSERT INTO `users` (id, full_name, username, email, password, `role`, coins, has_bought_challenge, profile_picture_url) VALUES (8, 'Lucas Mendes', 'lucasmendes1', 'lucas@gmail.com', '$2b$12$DrWryuwevYzePfZZuJiGNexVcJxEOEfslEf1xu6gZ5CfcL32tT8Jy', 'USER', 900, true, NULL);
INSERT INTO `users` (id, full_name, username, email, password, `role`, coins, has_bought_challenge, profile_picture_url) VALUES (9, 'Juliana Costa', 'jucosta99', 'juliana@gmail.com', '$2b$12$DrWryuwevYzePfZZuJiGNexVcJxEOEfslEf1xu6gZ5CfcL32tT8Jy', 'USER', 100, false, NULL);
INSERT INTO `users` (id, full_name, username, email, password, `role`, coins, has_bought_challenge, profile_picture_url) VALUES (10, 'Thiago Lima', 'thiagolima22', 'thiago@gmail.com', '$2b$12$DrWryuwevYzePfZZuJiGNexVcJxEOEfslEf1xu6gZ5CfcL32tT8Jy', 'USER', 700, false, NULL);

-- Groups
INSERT INTO `groups` (id, name, description, creator_id, created_at) VALUES (1, 'Grupo Principal', 'Grupo com os usuários iniciais', 2, CURRENT_TIMESTAMP);
INSERT INTO `groups` (id, name, description, creator_id, created_at) VALUES (2, 'Atletas de Fim de Semana', 'Futebol e academia', 5, CURRENT_TIMESTAMP);
INSERT INTO `groups` (id, name, description, creator_id, created_at) VALUES (3, 'Vida Saudável', 'Dietas e exercícios', 3, CURRENT_TIMESTAMP);

-- Group Members
INSERT INTO group_members (group_id, user_id) VALUES (1, 2);
INSERT INTO group_members (group_id, user_id) VALUES (1, 3);
INSERT INTO group_members (group_id, user_id) VALUES (1, 4);
INSERT INTO group_members (group_id, user_id) VALUES (1, 5);
INSERT INTO group_members (group_id, user_id) VALUES (1, 6);
INSERT INTO group_members (group_id, user_id) VALUES (2, 5);
INSERT INTO group_members (group_id, user_id) VALUES (2, 4);
INSERT INTO group_members (group_id, user_id) VALUES (2, 8);
INSERT INTO group_members (group_id, user_id) VALUES (2, 10);
INSERT INTO group_members (group_id, user_id) VALUES (3, 3);
INSERT INTO group_members (group_id, user_id) VALUES (3, 7);
INSERT INTO group_members (group_id, user_id) VALUES (3, 9);
INSERT INTO group_members (group_id, user_id) VALUES (3, 2);

-- Group Invites
INSERT INTO group_invites (id, group_id, inviter_id, invitee_id, status, created_at) VALUES (1, 1, 2, 7, 'PENDING', CURRENT_TIMESTAMP);
INSERT INTO group_invites (id, group_id, inviter_id, invitee_id, status, created_at) VALUES (2, 2, 5, 2, 'ACCEPTED', CURRENT_TIMESTAMP);
INSERT INTO group_invites (id, group_id, inviter_id, invitee_id, status, created_at) VALUES (3, 3, 3, 6, 'DECLINED', CURRENT_TIMESTAMP);

-- Proofs
INSERT INTO proofs (id, file_name, content_type, image_url, author_id, posted_at) VALUES (1, 'prova1.jpg', 'image/jpeg', 'https://example.com/prova1.jpg', 3, CURRENT_TIMESTAMP);
INSERT INTO proofs (id, file_name, content_type, image_url, author_id, posted_at) VALUES (2, 'corrida.jpg', 'image/jpeg', 'https://example.com/corrida.jpg', 5, CURRENT_TIMESTAMP);
INSERT INTO proofs (id, file_name, content_type, image_url, author_id, posted_at) VALUES (3, 'dieta.jpg', 'image/jpeg', 'https://example.com/dieta.jpg', 7, CURRENT_TIMESTAMP);

-- Activities
INSERT INTO activities (id, author_id, group_id, description, status, created_at, expires_at) VALUES (1, 3, 1, 'Corri 5km hoje', 'APPROVED', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 DAY));
INSERT INTO activities (id, author_id, group_id, description, status, created_at, expires_at) VALUES (2, 5, 2, 'Treino de perna', 'IN_JUDGMENT', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 DAY));
INSERT INTO activities (id, author_id, group_id, description, status, created_at, expires_at) VALUES (3, 7, 3, 'Almoço saudável', 'APPROVED', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 DAY));
INSERT INTO activities (id, author_id, group_id, description, status, created_at, expires_at) VALUES (4, 4, 1, 'Faltou na academia', 'REJECTED', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 DAY));

-- Activity Proofs
INSERT INTO activity_proofs (activity_id, proof_id) VALUES (1, 1);
INSERT INTO activity_proofs (activity_id, proof_id) VALUES (2, 2);
INSERT INTO activity_proofs (activity_id, proof_id) VALUES (3, 3);

-- Votes
INSERT INTO votes (id, voter_id, proof_id, approved, voted_at) VALUES (1, 2, 1, true, CURRENT_TIMESTAMP);
INSERT INTO votes (id, voter_id, proof_id, approved, voted_at) VALUES (2, 4, 1, true, CURRENT_TIMESTAMP);
INSERT INTO votes (id, voter_id, proof_id, approved, voted_at) VALUES (3, 4, 2, true, CURRENT_TIMESTAMP);
INSERT INTO votes (id, voter_id, proof_id, approved, voted_at) VALUES (4, 8, 2, false, CURRENT_TIMESTAMP);

-- Bets
INSERT INTO bets (id, creator_id, opponent_id, group_id, buy_in, title, description, status, created_at, invite_expires_at, deadline) VALUES (1, 2, 3, 1, 50, 'Aposta de Corrida', 'Quem corre mais no mês', 'IN_PROGRESS', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 DAY));
INSERT INTO bets (id, creator_id, opponent_id, group_id, buy_in, title, description, status, created_at, invite_expires_at, deadline) VALUES (2, 5, 8, 2, 100, 'Aposta de Peso', 'Quem levanta mais peso', 'FINISHED_WIN_CREATOR', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY));
INSERT INTO bets (id, creator_id, opponent_id, group_id, buy_in, title, description, status, created_at, invite_expires_at, deadline) VALUES (3, 3, 7, 3, 30, 'Aposta de Perda de Peso', 'Quem perde mais peso', 'FINISHED_WIN_OPPONENT', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 DAY));
INSERT INTO bets (id, creator_id, opponent_id, group_id, buy_in, title, description, status, created_at, invite_expires_at, deadline) VALUES (4, 4, 6, 1, 20, 'Aposta de Futebol', 'Quem joga mais futebol', 'DECLINED', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 6 DAY));
INSERT INTO bets (id, creator_id, opponent_id, group_id, buy_in, title, description, status, created_at, invite_expires_at, deadline) VALUES (5, 9, 2, 3, 40, 'Aposta de Água', 'Quem toma mais água', 'INVITED', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 12 DAY));

-- Challenges
INSERT INTO challenges (id, group_id, amount, title, description, challenger_id, challenged_id, status, created_at, invite_expires_at, deadline) VALUES (1, 1, 100, 'Desafio Mensal', 'Desafio para correr 10km', 2, 4, 'IN_PROGRESS', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY));
INSERT INTO challenges (id, group_id, amount, title, description, challenger_id, challenged_id, status, created_at, invite_expires_at, deadline) VALUES (2, 2, 500, 'Desafio de Força', 'Levantar 100kg no supino', 5, 10, 'SUCCESS', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 2 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY));
INSERT INTO challenges (id, group_id, amount, title, description, challenger_id, challenged_id, status, created_at, invite_expires_at, deadline) VALUES (3, 3, 200, 'Desafio de Dieta', 'Ficar 1 mês sem açúcar', 7, 9, 'FAILED', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 DAY));
INSERT INTO challenges (id, group_id, amount, title, description, challenger_id, challenged_id, status, created_at, invite_expires_at, deadline) VALUES (4, 1, 50, 'Desafio de Futebol', 'Fazer 10 embaixadinhas', 6, 2, 'INVITED', CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 DAY));

-- Transactions
INSERT INTO transactions (id, user_id, amount, transaction_type, context_type, context_id, created_at) VALUES (1, 5, 1000, 'CHALLENGE_WIN', 'CHALLENGE', 2, CURRENT_TIMESTAMP);
INSERT INTO transactions (id, user_id, amount, transaction_type, context_type, context_id, created_at) VALUES (2, 5, 100, 'BET_WIN', 'BET', 2, CURRENT_TIMESTAMP);
INSERT INTO transactions (id, user_id, amount, transaction_type, context_type, context_id, created_at) VALUES (3, 8, 100, 'BET_ENTRY', 'BET', 2, CURRENT_TIMESTAMP);
INSERT INTO transactions (id, user_id, amount, transaction_type, context_type, context_id, created_at) VALUES (4, 7, 30, 'BET_WIN', 'BET', 3, CURRENT_TIMESTAMP);
INSERT INTO transactions (id, user_id, amount, transaction_type, context_type, context_id, created_at) VALUES (5, 3, 30, 'BET_ENTRY', 'BET', 3, CURRENT_TIMESTAMP);
INSERT INTO transactions (id, user_id, amount, transaction_type, context_type, context_id, created_at) VALUES (6, 2, 50, 'BET_ENTRY', 'BET', 1, CURRENT_TIMESTAMP);
INSERT INTO transactions (id, user_id, amount, transaction_type, context_type, context_id, created_at) VALUES (7, 3, 50, 'BET_ENTRY', 'BET', 1, CURRENT_TIMESTAMP);

-- Comments
INSERT INTO comments (id, author_id, context_type, context_id, content, posted_at) VALUES (1, 2, 'ACTIVITY', 1, 'Boa corrida!', CURRENT_TIMESTAMP);
INSERT INTO comments (id, author_id, context_type, context_id, content, posted_at) VALUES (2, 4, 'ACTIVITY', 2, 'Ta fraco em mano', CURRENT_TIMESTAMP);
INSERT INTO comments (id, author_id, context_type, context_id, content, posted_at) VALUES (3, 8, 'BET', 2, 'Você deu sorte dessa vez!', CURRENT_TIMESTAMP);
INSERT INTO comments (id, author_id, context_type, context_id, content, posted_at) VALUES (4, 2, 'CHALLENGE', 1, 'Vamos lá!', CURRENT_TIMESTAMP);

DROP DATABASE IF EXISTS eduvix;
CREATE DATABASE eduvix;
USE eduvix;

-- Menghapus tabel jika ada agar benar-benar bersih
DROP TABLE IF EXISTS materi_progress;
DROP TABLE IF EXISTS quiz_hasil;
DROP TABLE IF EXISTS xp_log;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    xp INT DEFAULT 0,
    coins INT DEFAULT 0,
    level INT DEFAULT 1,
    streak INT DEFAULT 0,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE xp_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    jumlah INT,
    alasan VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE quiz_hasil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    quiz_id VARCHAR(50),
    skor INT,
    benar INT,
    salah INT,
    total INT,
    waktu_detik INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE materi_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    materi_id VARCHAR(50),
    selesai_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE DATABASE IF NOT EXISTS lost_found_db;
USE lost_found_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS police_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lost_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    region_details VARCHAR(255),
    status ENUM('submitted', 'under_review', 'found', 'collected') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS found_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    police_id INT,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    status ENUM('stored', 'matched', 'collected') DEFAULT 'stored',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (police_id) REFERENCES police_users(id)
);

CREATE TABLE IF NOT EXISTS item_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    item_type ENUM('lost', 'found') NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- PostgreSQL version of huangbinhong_visualization database
-- Converted from MySQL dump

-- Drop existing tables
DROP TABLE IF EXISTS works_tag_rel CASCADE;
DROP TABLE IF EXISTS works_tag CASCADE;
DROP TABLE IF EXISTS works_image CASCADE;
DROP TABLE IF EXISTS works CASCADE;
DROP TABLE IF EXISTS trajectory_type CASCADE;
DROP TABLE IF EXISTS trajectory_point CASCADE;
DROP TABLE IF EXISTS trajectory_person_rel CASCADE;
DROP TABLE IF EXISTS timeline_works_rel CASCADE;
DROP TABLE IF EXISTS timeline_event CASCADE;
DROP TABLE IF EXISTS person_relationship CASCADE;
DROP TABLE IF EXISTS person CASCADE;
DROP TABLE IF EXISTS life_timeline CASCADE;

-- Create ENUM types
CREATE TYPE category_enum AS ENUM ('山水画', '花鸟画');
CREATE TYPE img_type_enum AS ENUM ('thumbnail', 'hd', 'detail');

-- Table: life_timeline
CREATE TABLE life_timeline (
    timeline_id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month SMALLINT,
    day SMALLINT,
    event_title VARCHAR(100) NOT NULL,
    event_detail TEXT NOT NULL,
    location_name VARCHAR(50),
    importance SMALLINT DEFAULT 5,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_year ON life_timeline(year);

-- Table: person
CREATE TABLE person (
    person_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    alias VARCHAR(100),
    birth_year INTEGER,
    death_year INTEGER,
    identity VARCHAR(100) NOT NULL,
    brief_intro TEXT,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: person_relationship
CREATE TABLE person_relationship (
    relation_id SERIAL PRIMARY KEY,
    source_person_id INTEGER NOT NULL,
    target_person_id INTEGER NOT NULL,
    relation_type VARCHAR(50) NOT NULL,
    importance SMALLINT NOT NULL,
    relation_event TEXT,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_source_person FOREIGN KEY (source_person_id) 
        REFERENCES person(person_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_target_person FOREIGN KEY (target_person_id) 
        REFERENCES person(person_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_target_person_id ON person_relationship(target_person_id);

-- Table: timeline_event
CREATE TABLE timeline_event (
    event_id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    art_weight SMALLINT NOT NULL,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location_name VARCHAR(50) NOT NULL DEFAULT '',
    CONSTRAINT fk_timeline_person FOREIGN KEY (person_id) 
        REFERENCES person(person_id) ON UPDATE CASCADE
);

CREATE INDEX idx_year ON timeline_event(year);
CREATE INDEX idx_person_id ON timeline_event(person_id);

-- Table: timeline_works_rel
CREATE TABLE timeline_works_rel (
    rel_id SERIAL PRIMARY KEY,
    timeline_id INTEGER NOT NULL,
    works_id INTEGER NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_timeline_works UNIQUE (timeline_id, works_id),
    CONSTRAINT fk_timeline_works_rel_timeline FOREIGN KEY (timeline_id) 
        REFERENCES life_timeline(timeline_id) ON DELETE CASCADE,
    CONSTRAINT fk_timeline_works_rel_works FOREIGN KEY (works_id) 
        REFERENCES works(works_id) ON DELETE CASCADE
);

-- Table: trajectory_point
CREATE TABLE trajectory_point (
    point_id SERIAL PRIMARY KEY,
    type_id SMALLINT NOT NULL,
    year INTEGER NOT NULL,
    month SMALLINT,
    location_name VARCHAR(100) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    address_detail VARCHAR(255),
    event_desc TEXT NOT NULL,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_type_id ON trajectory_point(type_id);

-- Table: trajectory_person_rel
CREATE TABLE trajectory_person_rel (
    rel_id SERIAL PRIMARY KEY,
    point_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    CONSTRAINT fk_traj_person_person FOREIGN KEY (person_id) 
        REFERENCES person(person_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_traj_person_point FOREIGN KEY (point_id) 
        REFERENCES trajectory_point(point_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_point_id ON trajectory_person_rel(point_id);
CREATE INDEX idx_person_id ON trajectory_person_rel(person_id);

-- Table: trajectory_type
CREATE TABLE trajectory_type (
    type_id SMALLINT PRIMARY KEY,
    type_name VARCHAR(20) NOT NULL,
    type_desc VARCHAR(100)
);

-- Table: works
CREATE TABLE works (
    works_id SERIAL PRIMARY KEY,
    works_name VARCHAR(100) NOT NULL,
    category category_enum NOT NULL DEFAULT '花鸟画',
    creation_year INTEGER,
    creation_time_detail VARCHAR(50),
    size VARCHAR(50),
    material VARCHAR(50),
    collection_institution VARCHAR(100),
    collection_location VARCHAR(100),
    works_desc TEXT,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    art_period VARCHAR(10)
);

CREATE INDEX idx_works_name ON works(works_name);
CREATE INDEX idx_creation_year ON works(creation_year);

-- Table: works_image
CREATE TABLE works_image (
    image_id SERIAL PRIMARY KEY,
    works_id INTEGER NOT NULL,
    img_type img_type_enum NOT NULL,
    img_url VARCHAR(255) NOT NULL,
    img_desc VARCHAR(100),
    img_size VARCHAR(20),
    sort_order SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_works_image_works FOREIGN KEY (works_id) 
        REFERENCES works(works_id) ON DELETE CASCADE
);

CREATE INDEX idx_works_id ON works_image(works_id);

-- Table: works_tag
CREATE TABLE works_tag (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(30) NOT NULL,
    CONSTRAINT uk_tag_name UNIQUE (tag_name)
);

-- Table: works_tag_rel
CREATE TABLE works_tag_rel (
    rel_id SERIAL PRIMARY KEY,
    works_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    CONSTRAINT uk_works_tag UNIQUE (works_id, tag_id),
    CONSTRAINT fk_works_tag_rel_tag FOREIGN KEY (tag_id) 
        REFERENCES works_tag(tag_id),
    CONSTRAINT fk_works_tag_rel_works FOREIGN KEY (works_id) 
        REFERENCES works(works_id) ON DELETE CASCADE
);

CREATE INDEX fk_works_tag_rel_tag ON works_tag_rel(tag_id);

-- Insert data for life_timeline
INSERT INTO life_timeline (timeline_id, year, month, day, event_title, event_detail, location_name, importance, create_time, update_time) VALUES
(1, 1865, 1, 27, '黄宾虹出生', '黄宾虹原名懋质，后改名质，字朴存，别号予向、虹庐等。出生于浙江金华铁岭头', '金华', 10, '2025-12-01 12:41:21', '2025-12-15 04:38:22'),
(2, 1886, NULL, NULL, '迁居歙县潭渡', '黄宾虹随家人迁居安徽歙县潭渡村，开始了在徽州的生活和学习', '歙县', 6, '2025-12-01 12:41:21', '2025-12-15 04:38:22'),
(3, 1895, NULL, NULL, '拜师郑雪湖', '黄宾虹拜郑雪湖为师学习书画，郑雪湖的教导对其艺术发展产生了深远影响"学画必先从师承"', '潭渡', 7, '2025-12-01 12:41:21', '2025-12-15 04:38:22'),
(4, 1907, 9, NULL, '迁居上海', '随家人(父亲)移居上海，开始了在上海的艺术活动和职业发展', '上海', 8, '2025-12-01 12:41:21', '2025-12-15 04:38:22'),
(5, 1908, NULL, NULL, '参与国粹学社', '加入陈独秀、于右任等组织的国学保存会(后改称国粹学社)活动', '上海', 7, '2025-12-01 12:41:21', '2025-12-15 04:38:23'),
(6, 1911, 10, NULL, '任职《国是报》编辑', '任职上海《国是报》编辑，开始参与革命活动并与郑雪湖师保持书信往来', '上海', 8, '2025-12-01 12:41:21', '2025-12-15 04:38:23'),
(7, 1928, NULL, NULL, '参与全国美术展览会', '参与第一届全国美术展览会，其作品引起广泛关注', '上海', 9, '2025-12-01 12:41:21', '2025-12-15 04:38:23'),
(8, 1937, NULL, NULL, '定居北平', '迁居北平，继续创作和艺术教育活动', '北平', 7, '2025-12-01 12:41:21', '2025-12-15 04:38:23'),
(9, 1948, NULL, NULL, '迁居杭州', '迁居杭州栖霞岭，继续创作和艺术研究', '杭州', 10, '2025-12-01 12:41:21', '2025-12-15 04:38:23');

-- Insert data for person
INSERT INTO person (person_id, name, alias, birth_year, death_year, identity, brief_intro, create_time, update_time) VALUES
(2, '郑雪湖', NULL, NULL, NULL, '书画导师', '黄宾虹的书画启蒙老师，对其艺术道路有重要影响', '2025-12-09 20:37:17', '2025-12-09 20:37:17'),
(3, '陈独秀', NULL, NULL, NULL, '革命家', '与黄宾虹在国学保存会活动中相识', '2025-12-09 20:37:17', '2025-12-09 20:37:17'),
(4, '于右任', NULL, NULL, NULL, '政治家', '与黄宾虹在国学保存会活动中相识', '2025-12-09 20:37:17', '2025-12-09 20:37:17'),
(5, '黄宾虹', NULL, NULL, NULL, '本尊', '黄宾虹本人，本项目的主人公', '2025-12-09 20:37:17', '2025-12-09 20:37:17'),
(6, '徐悲鸿', NULL, NULL, NULL, '画家', '与黄宾虹有艺术交流', '2025-12-09 20:37:17', '2025-12-09 20:37:17'),
(7, '齐白石', NULL, NULL, NULL, '画家', '与黄宾虹有艺术交流', '2025-12-09 20:37:17', '2025-12-09 20:37:17'),
(8, '张大千', NULL, NULL, NULL, '画家', '与黄宾虹有艺术交流', '2025-12-09 20:37:17', '2025-12-09 20:37:17'),
(9, '齐白石', NULL, NULL, NULL, '书画导师', '与黄宾虹有艺术交流', '2025-12-09 20:37:17', '2025-12-09 20:37:17'),
(10, '刘海粟', NULL, NULL, NULL, '画家', '与黄宾虹有艺术交流', '2025-12-09 20:37:17', '2025-12-09 20:37:17'),
(11, '潘天寿', NULL, NULL, NULL, '画家', '与黄宾虹有艺术交流', '2025-12-09 20:37:17', '2025-12-09 20:37:17');

-- Insert data for trajectory_type
INSERT INTO trajectory_type (type_id, type_name, type_desc) VALUES
(1, '出生', '出生地'),
(2, '游历', '游历地点'),
(3, '居住', '居住地'),
(4, '教学', '教学活动'),
(5, '展览', '展览活动');

-- Insert data for trajectory_point
INSERT INTO trajectory_point (point_id, type_id, year, month, location_name, longitude, latitude, address_detail, event_desc, create_time, update_time) VALUES
(1, 1, 1865, 1, '金华', 119.645400, 29.116400, '金华铁岭头', '黄宾虹出生在金华铁岭头，开始了其传奇的一生', '2025-12-23 20:49:39', '2025-12-23 20:49:39'),
(2, 2, 1890, 5, '潭渡村', 118.447200, 29.814700, '潭渡村', '郑雪湖在潭渡村，黄宾虹拜师学艺', '2025-12-23 20:49:39', '2025-12-23 20:49:39'),
(3, 2, 1907, 10, '上海', 121.473700, 31.230400, '上海', '黄宾虹随家人迁居上海，开始职业发展', '2025-12-23 20:49:39', '2025-12-23 20:49:39'),
(4, 2, 1937, 8, '北平', 116.407400, 39.904200, '北平', '黄宾虹迁居北平，继续创作和研究', '2025-12-23 20:49:39', '2025-12-23 20:49:39'),
(5, 2, 1948, 12, '金华栖霞岭', 120.155100, 30.274100, '金华栖霞岭', '黄宾虹迁居杭州栖霞岭，安度晚年', '2025-12-23 20:49:39', '2025-12-23 20:49:39'),
(6, 3, 1907, 9, '上海', 118.796900, 32.060300, '上海', '在黄宾虹的推动下，上海成为艺术中心', '2025-12-23 20:49:39', '2025-12-23 20:49:39');

-- Insert data for trajectory_person_rel
INSERT INTO trajectory_person_rel (rel_id, point_id, person_id) VALUES
(7, 6, 25), (8, 6, 26), (9, 2, 2), (10, 2, 3), (11, 2, 4), (12, 2, 5), (13, 2, 6), (14, 2, 7), (15, 2, 8), (16, 2, 9), (17, 2, 10), (18, 3, 11), (19, 3, 12), (20, 3, 13), (21, 3, 14), (22, 3, 15), (23, 4, 16), (24, 5, 17), (25, 5, 18), (26, 5, 19), (27, 5, 20), (28, 5, 21), (29, 5, 22), (30, 5, 23), (31, 5, 24), (32, 6, 25), (33, 6, 26);

-- Insert data for timeline_event
INSERT INTO timeline_event (event_id, year, person_id, title, description, art_weight, create_time, update_time, location_name) VALUES
(1, 1907, 11, '发起艺术活动', '黄宾虹与潘天寿等人发起艺术活动，通过展览和交流推动中国画发展', 9, '2025-12-09 20:37:35', '2025-12-10 01:48:27', '金华'),
(2, 1912, 11, '创办艺术社团', '黄宾虹与潘天寿共同创办艺术社团，推动艺术交流和发展', 8, '2025-12-09 20:37:35', '2025-12-10 01:48:27', '上海'),
(3, 1925, 23, '开始创作山水画', '黄宾虹开始系统创作山水画，借鉴传统并发展新风格', 7, '2025-12-09 20:37:35', '2025-12-10 01:47:49', '山水画'),
(4, 1929, 12, '参加全国美展', '黄宾虹的作品参加全国美术展览，获得广泛关注', 7, '2025-12-09 20:37:35', '2025-12-10 01:48:27', '上海'),
(5, 1930, 23, '深入研究传统', '黄宾虹深入研究传统绘画，为艺术创新奠定基础', 8, '2025-12-09 20:37:35', '2025-12-10 01:48:27', '上海'),
(6, 1931, 12, '艺术作品参展', '黄宾虹的艺术作品在多个展览中展出，影响力不断扩大', 8, '2025-12-09 20:37:35', '2025-12-10 01:48:27', '上海');

-- Insert data for works
INSERT INTO works (works_id, works_name, category, creation_year, creation_time_detail, size, material, collection_institution, collection_location, works_desc, create_time, update_time, art_period) VALUES
(1, '山水四条屏', '花鸟画', NULL, NULL, '87.9x31.7 cm', '水墨纸本', NULL, NULL, '作品描绘山水景色，笔法精妙，墨色层次丰富，展现了黄宾虹深厚的笔墨功底', '2025-12-09 11:59:08', '2025-12-15 00:46:48', '早期'),
(2, '山水立轴', '花鸟画', 1947, NULL, '86.5x37.5 cm', '水墨纸本', NULL, NULL, '作品构图简洁，意境深远，体现了黄宾虹晚年的艺术成就', '2025-12-09 11:59:08', '2025-12-15 00:46:48', '晚期'),
(3, '山水图', '花鸟画', 1945, NULL, '100.4x39.8 cm', '水墨纸本', NULL, NULL, '作品气势雄浑，笔力苍劲，是黄宾虹代表作之一', '2025-12-09 11:59:08', '2025-12-15 00:46:48', '晚期'),
(4, '山水四屏', '花鸟画', NULL, NULL, '133.8x50.6 cm', '水墨纸本', NULL, NULL, '四屏山水，气势磅礴，展现了黄宾虹高超的构图技巧', '2025-12-09 11:59:08', '2025-12-15 00:46:48', '早期'),
(5, '山水立轴 山水图', '花鸟画', NULL, NULL, '139.9x48.3 cm', '水墨纸本', NULL, NULL, '作品笔墨苍润，意境深远，是黄宾虹晚年的精品之作', '2025-12-09 11:59:08', '2025-12-15 00:46:48', '早期');

-- Insert data for works_image
INSERT INTO works_image (image_id, works_id, img_type, img_url, img_desc, img_size, sort_order) VALUES
(1, 1, 'thumbnail', '/images/山水四条屏22r.jpg', NULL, NULL, 1),
(2, 2, 'thumbnail', '/images/山水立轴山水图.jpg', NULL, NULL, 1),
(3, 3, 'thumbnail', '/images/山水图.jpg', NULL, NULL, 1),
(4, 4, 'thumbnail', '/images/山水四屏山水图.jpg', NULL, NULL, 1),
(5, 5, 'thumbnail', '/images/山水立轴山水图.jpg', NULL, NULL, 1),
(6, 6, 'thumbnail', '/images/山水图.jpg', NULL, NULL, 1),
(7, 7, 'thumbnail', '/images/山水立轴山水图.jpg', NULL, NULL, 1),
(8, 8, 'thumbnail', '/images/山水四屏山水图45.jpg', NULL, NULL, 1),
(9, 9, 'thumbnail', '/images/山水立轴山水图.jpg', NULL, NULL, 1),
(10, 10, 'thumbnail', '/images/山水图立轴山水图135.jpg', NULL, NULL, 1),
(11, 11, 'thumbnail', '/images/山水立轴山水图潘天寿.jpg', NULL, NULL, 1),
(12, 12, 'thumbnail', '/images/山水立轴山水图潘天寿.jpg', NULL, NULL, 1),
(13, 13, 'thumbnail', '/images/山水立轴山水图.jpg', NULL, NULL, 1),
(14, 14, 'thumbnail', '/images/山水立轴山水图潘天寿.jpg', NULL, NULL, 1),
(15, 15, 'thumbnail', '/images/山水四屏山水图108.jpg', NULL, NULL, 1),
(16, 16, 'thumbnail', '/images/山水立轴山水图92.jpg', NULL, NULL, 1),
(17, 17, 'thumbnail', '/images/山水立轴山水图潘天寿.jpg', NULL, NULL, 1),
(18, 18, 'thumbnail', '/images/山水立轴山水图.jpg', NULL, NULL, 1),
(19, 19, 'thumbnail', '/images/山水立轴山水图潘天寿.jpg', NULL, NULL, 1),
(20, 20, 'thumbnail', '/images/山水立轴山水图潘天寿.jpg', NULL, NULL, 1);

-- Insert data for works_tag
INSERT INTO works_tag (tag_id, tag_name) VALUES
(2, '山水图'),
(5, '传统风格'),
(7, '创新风格'),
(6, '水墨画'),
(1, '山水画'),
(8, '花卉画'),
(9, '人物画'),
(3, '山水图山水图'),
(4, '山水图潘天寿');

-- Insert data for works_tag_rel
INSERT INTO works_tag_rel (rel_id, works_id, tag_id) VALUES
(1, 1, 2), (2, 2, 2), (48, 3, 3), (3, 7, 2), (4, 8, 2), (5, 9, 2), (6, 10, 2), (49, 10, 3), (7, 11, 2), (8, 12, 2), (55, 12, 4), (9, 13, 2), (10, 14, 2), (11, 15, 2), (12, 16, 2), (13, 17, 2), (14, 18, 2), (15, 19, 2), (16, 20, 2), (17, 21, 2), (18, 22, 2), (20, 24, 2), (58, 24, 5), (21, 25, 2), (22, 26, 2), (23, 27, 2), (24, 28, 2), (51, 28, 3), (25, 29, 2), (26, 31, 2), (52, 31, 3), (27, 32, 2), (28, 33, 2), (29, 34, 2), (30, 35, 2), (31, 36, 2), (56, 36, 4), (32, 37, 2), (33, 38, 2), (34, 39, 2), (35, 40, 2), (36, 41, 2), (57, 41, 4), (37, 42, 2), (53, 42, 3), (38, 43, 2), (39, 44, 2), (40, 45, 2), (54, 45, 3), (41, 46, 2), (42, 47, 2), (43, 48, 2), (44, 49, 2), (45, 50, 2), (46, 51, 2), (47, 52, 2), (59, 54, 1), (60, 55, 1), (61, 56, 1), (62, 57, 1), (63, 58, 1), (64, 59, 1), (65, 60, 1), (66, 61, 1), (67, 63, 1), (68, 64, 1), (69, 65, 1), (70, 66, 1), (71, 67, 1), (72, 68, 1), (73, 69, 1), (74, 70, 1), (75, 71, 1), (76, 72, 1), (77, 73, 1), (78, 74, 1), (79, 75, 1), (80, 76, 1), (81, 77, 1), (82, 78, 1), (83, 80, 6), (85, 81, 6), (98, 82, 9), (99, 83, 8), (100, 83, 9), (87, 84, 6), (97, 85, 6), (101, 86, 8), (102, 86, 9), (103, 87, 8), (104, 87, 9), (89, 88, 6), (91, 89, 6), (105, 90, 8), (106, 90, 9), (107, 92, 8), (108, 92, 9);

-- Create trigger for update_time
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_time = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_life_timeline BEFORE UPDATE ON life_timeline
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_person BEFORE UPDATE ON person
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_person_relationship BEFORE UPDATE ON person_relationship
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_event BEFORE UPDATE ON timeline_event
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trajectory_point BEFORE UPDATE ON trajectory_point
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_works BEFORE UPDATE ON works
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
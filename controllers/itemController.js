const db = require('../config/db');
const notificationController = require('./notificationController');

// Report Lost Item
exports.reportLostItem = async (req, res) => {
    try {
        const { category, name, description, region_details, location_lat, location_lng } = req.body;
        const userId = req.user.id;

        // Insert item
        const [result] = await db.execute(
            'INSERT INTO lost_items (user_id, category, name, description, region_details, location_lat, location_lng, status) VALUES (?, ?, ?, ?, ?, ?, ?, "submitted")',
            [userId, category, name, description, region_details, location_lat, location_lng]
        );

        const itemId = result.insertId;

        // Handle Images
        if (req.files && req.files.length > 0) {
            const imageValues = req.files.map(file => [itemId, 'lost', '/assets/uploads/' + file.filename]);
            // Construct bulk insert query
            const placeholders = imageValues.map(() => '(?, ?, ?)').join(', ');
            const flatValues = imageValues.flat();

            await db.execute(
                `INSERT INTO item_images (item_id, item_type, image_url) VALUES ${placeholders}`,
                flatValues
            );
        }

        res.status(201).json({ message: 'Lost item reported successfully', itemId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error reporting item' });
    }
};

// Get User's Lost Items
exports.getUserLostItems = async (req, res) => {
    try {
        const userId = req.user.id;
        const [items] = await db.execute('SELECT * FROM lost_items WHERE user_id = ? ORDER BY created_at DESC', [userId]);

        // Fetch images for each item (simple efficient way, doing it in loop for MVP clarity, better with JOINs)
        for (let item of items) {
            const [images] = await db.execute('SELECT image_url FROM item_images WHERE item_id = ? AND item_type = "lost"', [item.id]);
            item.images = images.map(img => img.image_url);
        }

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching items' });
    }
};

// Get All Lost Items (For Police)
exports.getAllLostItems = async (req, res) => {
    try {
        // Can add filters here
        const [items] = await db.execute('SELECT l.*, u.name as reporter_name, u.phone as reporter_phone FROM lost_items l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC');
        for (let item of items) {
            const [images] = await db.execute('SELECT image_url FROM item_images WHERE item_id = ? AND item_type = "lost"', [item.id]);
            item.images = images.map(img => img.image_url);
        }
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Report Found Item (Police)
exports.reportFoundItem = async (req, res) => {
    try {
        const { category, description, location_lat, location_lng } = req.body;
        const policeId = req.user.id;

        const [result] = await db.execute(
            'INSERT INTO found_items (police_id, category, description, location_lat, location_lng, status) VALUES (?, ?, ?, ?, ?, "stored")',
            [policeId, category, description, location_lat, location_lng]
        );

        const itemId = result.insertId;

        // Handle Images
        if (req.files && req.files.length > 0) {
            const imageValues = req.files.map(file => [itemId, 'found', '/assets/uploads/' + file.filename]);
            const placeholders = imageValues.map(() => '(?, ?, ?)').join(', ');
            const flatValues = imageValues.flat();

            await db.execute(
                `INSERT INTO item_images (item_id, item_type, image_url) VALUES ${placeholders}`,
                flatValues
            );
        }

        res.status(201).json({ message: 'Found item reported successfully', itemId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error reporting found item' });
    }
};

// Match Item (Police Action) & Generate OTP
exports.matchItem = async (req, res) => {
    try {
        const { lostItemId, foundItemId } = req.body;

        // Generate 6-digit OTP
        const releaseCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Update Lost Item Status & Store OTP
        await db.execute('UPDATE lost_items SET status = "found", release_code = ? WHERE id = ?', [releaseCode, lostItemId]);

        // Update Found Item Status
        await db.execute('UPDATE found_items SET status = "matched" WHERE id = ?', [foundItemId]);

        // Get Lost Item Details to notify user
        const [lostItems] = await db.execute('SELECT user_id, name FROM lost_items WHERE id = ?', [lostItemId]);
        if (lostItems.length > 0) {
            const item = lostItems[0];
            const message = `Good news! Match Found for "${item.name}". Your Release Code is: ${releaseCode}`;
            const subject = 'Action Required: Item Found';
            const body = `We have found your item: ${item.name}. Please visit the station with this Release Code to claim it: ${releaseCode}`;

            await notificationController.sendNotification(item.user_id, message, subject, body);
        }

        res.json({ message: 'Item matched. OTP generated and sent to user.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error matching items' });
    }
};

// Smart Geo-Matching Algorithm
exports.smartMatch = async (req, res) => {
    try {
        const { lostItemId } = req.body;
        const [lostItems] = await db.execute('SELECT * FROM lost_items WHERE id = ?', [lostItemId]);
        if (lostItems.length === 0) return res.status(404).json({ message: 'Lost item not found' });
        const lost = lostItems[0];

        // Fetch candidates (same category)
        const [candidates] = await db.execute('SELECT * FROM found_items WHERE category = ? AND status = "stored"', [lost.category]);

        const scoredCandidates = candidates.map(found => {
            let score = 0;
            const reasons = [];

            // 1. Distance Score (Haversine)
            if (lost.location_lat && found.location_lat) {
                const toRad = (val) => val * Math.PI / 180;
                const R = 6371; // km
                const dLat = toRad(found.location_lat - lost.location_lat);
                const dLng = toRad(found.location_lng - lost.location_lng);
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(lost.location_lat)) * Math.cos(toRad(found.location_lat)) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = R * c;

                if (distance < 1) { score += 50; reasons.push('Very Close (<1km)'); }
                else if (distance < 5) { score += 30; reasons.push('Nearby (<5km)'); }
                else if (distance < 10) { score += 10; reasons.push('In Area (<10km)'); }
            }

            // 2. Text Match
            const lostWords = lost.description.toLowerCase().split(' ');
            const foundDesc = found.description.toLowerCase();
            let wordMatches = 0;
            lostWords.forEach(w => {
                if (w.length > 3 && foundDesc.includes(w)) wordMatches++;
            });
            if (wordMatches > 0) {
                const textScore = Math.min(wordMatches * 15, 30);
                score += textScore;
                reasons.push(`Text Match (${wordMatches} keywords)`);
            }

            // 3. Time
            if (new Date(found.created_at) >= new Date(lost.created_at)) {
                score += 20;
                reasons.push('Found after Lost date');
            }

            return { ...found, score, reasons };
        });

        // Sort by Score
        scoredCandidates.sort((a, b) => b.score - a.score);
        res.json(scoredCandidates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during smart match' });
    }
};

// Verify OTP Handover
exports.verifyHandover = async (req, res) => {
    try {
        const { lostItemId, otp } = req.body;
        const [items] = await db.execute('SELECT * FROM lost_items WHERE id = ?', [lostItemId]);
        if (items.length === 0) return res.status(404).json({ message: 'Item not found' });

        const item = items[0];
        if (item.release_code === otp) {
            await db.execute('UPDATE lost_items SET status = "collected" WHERE id = ?', [lostItemId]);
            res.json({ success: true, message: 'Identity Verified. Item handed over successfully.' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP Code.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Analytics Data
exports.getHeatmapData = async (req, res) => {
    try {
        const [lostItems] = await db.execute('SELECT location_lat, location_lng FROM lost_items');
        res.json(lostItems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

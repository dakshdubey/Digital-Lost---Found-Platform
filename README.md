#  GovRecover - Digital Lost & Found Platform
> *Production-Grade Government Solution for Lost Asset Recovery & Theft Prevention.*

**GovRecover** is a Next-Gen Smart Platform designed to bridge the gap between Citizens and Police. It replaces manual/paper-based "Lost & Found" systems with an AI-powered, secure, and transparent digital ecosystem.

---

##  Tech Stack Used
Built with a "Security-First" & "Performance-First" architecture:

*   **Frontend:** HTML5, Tailwind CSS (via CDN for Proto/Build), Vanilla JavaScript (ES6+).
*   **Backend:** Node.js, Express.js (REST API Architecture).
*   **Database:** MySQL (Relational Data & Geospatial Storage).
*   **Authentication:** JWT (JSON Web Tokens) & BCrypt (Gov-Grade Hashing).
*   **Maps & Analytics:** Google Maps JavaScript API (Heatmaps, Geolocation).
*   **UI/Design:** Glassmorphism UI, 3D CSS Animations, 'Outfit' & 'JetBrains Mono' Typography.

---

##  Key Features

###  For Police (Secure Terminal)
1.  **Possession Dashboard:** Manage found items inventory with status tracking.
2.  ** Smart Geo-Matching:** Server-side algorithm automatically matches lost items with found inventory based on **Location (<5km), Time, and Fuzzy Text Similarity**.
3.  ** Secure Digital Handover:** 6-Digit OTP generation for verifying ownership before releasing items (Prevention of Fraud).
4.  ** Theft Heatmap:** Real-time visualization of "High-Theft Zones" to aid patrolling decisions.

###  For Citizens (Public Portal)
1.  **Instant Reporting:** Report lost items with GPS location pinning and image upload.
2.  **Live Status Tracking:** Real-time updates (Submitted -> Under Review -> Found -> Collected).
3.  **Proactive Notifications:** Get alerted immediately when a match is found.
4.  **Mobile-First Design:** App-like experience with bottom navigation for mobile users.

---

##  How to Setup (Installation Guide)

### Prerequisites
*   Node.js (v16+)
*   MySQL Server (XAMPP/WAMP or local install)

### Phase 1: Database Setup
1.  Open **MySQL Workbench** or PHPMyAdmin.
2.  Create a distinct database (e.g., `lost_found_db`).
3.  Update the `.env` file with your credentials:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=lost_found_db
    JWT_SECRET=any_super_secret_key
    GOOGLE_MAPS_API_KEY=your_google_maps_key
    ```
4.  Run the initialization script to build tables:
    ```bash
    node setup_db.js
    ```

### Phase 2: Application Start
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the server:
    ```bash
    npm start
    ```
3.  Server runs at: `http://localhost:5000`

### Phase 3: Access
*   **Citizen Portal:** `http://localhost:5000/`
*   **Police Terminal:** `http://localhost:5000/police/login.html`

---

##  Default Credentials (Vadodara Region)

**Police Administrator:**
*   **Email:** ``
*   **Password:** ``

*(Note: You can create new officers via the hidden route `/police/signup.html`)*

---

##  License
This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for details.

---
*Developed for Government Innovation Drive.*

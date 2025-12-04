# Database Schema with User Management

This document extends the localStorage schema to support multi-user functionality. Each user has their own entries, trading pairs, motivational images, and preferences.

> **Reference:** See `localStorage-schema.md` for detailed field descriptions and data types.

---

## Entity Relationship Overview

```
users (1) ────< (many) entries
users (1) ────< (many) trading_pairs
users (1) ────< (many) motivational_images
users (1) ────< (1) user_preferences
```

**Key Relationships:**
- One user can have many entries (trading, thoughts, day offs)
- One user can have many trading pairs
- One user can have many motivational images
- One user has one set of preferences (title, balance, theme, initialized)

---

## Core Tables

### Table: `users`

**Description:** User accounts with authentication information

| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `id` | INT/BIGINT | Yes | Primary key, auto-increment | `1`, `2`, `3` |
| `username` | VARCHAR(50) | Yes | Unique username | `"trader_john"` |
| `email` | VARCHAR(255) | Yes | Unique email address | `"john@example.com"` |
| `password_hash` | VARCHAR(255) | Yes | Hashed password (bcrypt/argon2) | `"$2b$10$..."` |
| `created_at` | TIMESTAMP | Yes | Account creation timestamp | `2024-01-15 10:30:00` |
| `updated_at` | TIMESTAMP | Yes | Last update timestamp | `2024-01-15 10:30:00` |
| `last_login` | TIMESTAMP | No | Last login timestamp | `2024-01-20 14:22:00` |
| `is_active` | BOOLEAN | Yes | Account active status | `true`, `false` |

**SQL Schema:**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
);
```

---

### Table: `entries`

**Description:** Journal entries (trading operations, thoughts, day offs) - **Linked to users**

**Mapping from localStorage:** `journal_entries_v1` array

| Field | Type | Required | Description | Maps From |
|-------|------|----------|-------------|-----------|
| `id` | BIGINT | Yes | Unique identifier | `entry.id` |
| `user_id` | INT | Yes | Foreign key to users | N/A (new) |
| `date` | TIMESTAMP | Yes | Entry date | `entry.date` |
| `entry_type` | VARCHAR(20) | No | Entry type discriminator | `entry.entryType` |
| `pair` | VARCHAR(20) | No | Trading pair (uppercase) | `entry.pair` |
| `type` | VARCHAR(10) | No | Trade direction (BUY/SELL) | `entry.type` |
| `rr` | VARCHAR(10) | No | Risk/Reward ratio | `entry.rr` |
| `pnl` | DECIMAL(10, 2) | No | Profit and Loss | `entry.pnl` |
| `notes` | TEXT | No | Additional notes | `entry.notes` |
| `screenshot_url` | TEXT | No | Screenshot image URL | `entry.screenshotUrl` |
| `message` | TEXT | No | Message (for thoughts/dayoff) | `entry.message` |
| `trading_view_url` | TEXT | No | TradingView URL (for thoughts) | `entry.tradingViewUrl` |
| `created_at` | TIMESTAMP | Yes | Record creation time | N/A (new) |
| `updated_at` | TIMESTAMP | Yes | Last update time | N/A (new) |

**SQL Schema:**
```sql
CREATE TABLE entries (
    id BIGINT PRIMARY KEY,
    user_id INT NOT NULL,
    date TIMESTAMP NOT NULL,
    entry_type VARCHAR(20), -- NULL for trading entries, 'thought' or 'dayoff' for others
    pair VARCHAR(20), -- NULL for non-trading entries
    type VARCHAR(10), -- 'BUY' or 'SELL', NULL for non-trading entries
    rr VARCHAR(10), -- Risk/Reward ratio, NULL for non-trading entries
    pnl DECIMAL(10, 2), -- NULL for non-trading entries
    notes TEXT,
    screenshot_url TEXT,
    message TEXT, -- For thought and dayoff entries
    trading_view_url TEXT, -- For thought entries
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_entries_user_id (user_id),
    INDEX idx_entries_date (date),
    INDEX idx_entries_entry_type (entry_type),
    INDEX idx_entries_pair (pair),
    INDEX idx_entries_user_date (user_id, date) -- Composite index for user-specific date queries
);
```

**Entry Type Logic:**
- **Trading Entry:** `entry_type IS NULL`, requires `pair`, `type`, `pnl`
- **Thought Entry:** `entry_type = 'thought'`, requires at least one of `message` or `trading_view_url`
- **Day Off Entry:** `entry_type = 'dayoff'`, requires `message = 'DAY OFF'`

---

### Table: `trading_pairs`

**Description:** Available trading pairs per user - **Linked to users**

**Mapping from localStorage:** `journal_pairs_v1` array

| Field | Type | Required | Description | Maps From |
|-------|------|----------|-------------|-----------|
| `id` | INT | Yes | Primary key, auto-increment | N/A (new) |
| `user_id` | INT | Yes | Foreign key to users | N/A (new) |
| `pair` | VARCHAR(20) | Yes | Trading pair (uppercase) | Array element |
| `created_at` | TIMESTAMP | Yes | Creation timestamp | N/A (new) |

**SQL Schema:**
```sql
CREATE TABLE trading_pairs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pair VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pair (user_id, pair), -- Each user can have unique pairs
    INDEX idx_trading_pairs_user_id (user_id)
);
```

---

### Table: `motivational_images`

**Description:** Motivational images for vision board - **Linked to users**

**Mapping from localStorage:** `journal_images_v1` array

| Field | Type | Required | Description | Maps From |
|-------|------|----------|-------------|-----------|
| `id` | DECIMAL(20, 6) | Yes | Primary key (original timestamp) | `image.id` |
| `user_id` | INT | Yes | Foreign key to users | N/A (new) |
| `image_data` | LONGTEXT | Yes | Base64 encoded image data | `image.src` |
| `created_at` | TIMESTAMP | Yes | Creation timestamp | N/A (new) |

**SQL Schema:**
```sql
CREATE TABLE motivational_images (
    id DECIMAL(20, 6) PRIMARY KEY,
    user_id INT NOT NULL,
    image_data LONGTEXT NOT NULL, -- Base64 encoded image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_motivational_images_user_id (user_id)
);
```

**Note:** Consider storing images in cloud storage (S3, Cloudinary) and storing URLs instead of base64 data for better performance.

---

### Table: `user_preferences`

**Description:** User-specific application preferences - **One-to-one with users**

**Mapping from localStorage:**
- `journal_title_v1` → `app_title`
- `journal_balance_v1` → `account_balance`
- `journal_theme_v1` → `current_theme`
- `journal_initialized_v1` → `initialized`

| Field | Type | Required | Description | Maps From | Default |
|-------|------|----------|-------------|-----------|---------|
| `id` | INT | Yes | Primary key | N/A (new) | - |
| `user_id` | INT | Yes | Foreign key to users (unique) | N/A (new) | - |
| `app_title` | VARCHAR(255) | Yes | Application title | `journal_title_v1` | `"ProTrader Journal"` |
| `account_balance` | DECIMAL(12, 2) | Yes | Starting account balance | `journal_balance_v1` | `0.00` |
| `current_theme` | VARCHAR(50) | Yes | Theme identifier | `journal_theme_v1` | `"slate_blue"` |
| `initialized` | BOOLEAN | Yes | Initialization flag | `journal_initialized_v1` | `false` |
| `created_at` | TIMESTAMP | Yes | Creation timestamp | N/A (new) | - |
| `updated_at` | TIMESTAMP | Yes | Last update timestamp | N/A (new) | - |

**SQL Schema:**
```sql
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    app_title VARCHAR(255) NOT NULL DEFAULT 'ProTrader Journal',
    account_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    current_theme VARCHAR(50) NOT NULL DEFAULT 'slate_blue',
    initialized BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_preferences_user_id (user_id)
);

-- Valid theme values constraint (application-level or check constraint)
-- Themes: 'slate_blue', 'zinc_violet', 'neutral_emerald', 'stone_orange', 
--         'gray_cyan', 'slate_pink', 'zinc_amber', 'neutral_teal',
--         'light_blue', 'light_violet', 'light_emerald', 'light_orange'
```

---

## Complete Database Schema

### Full SQL Script

```sql
-- ============================================
-- Trading Journal Database Schema
-- Multi-User Support
-- ============================================

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
);

-- User preferences (one-to-one with users)
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    app_title VARCHAR(255) NOT NULL DEFAULT 'ProTrader Journal',
    account_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    current_theme VARCHAR(50) NOT NULL DEFAULT 'slate_blue',
    initialized BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_preferences_user_id (user_id)
);

-- Journal entries (trading, thoughts, day offs)
CREATE TABLE entries (
    id BIGINT PRIMARY KEY,
    user_id INT NOT NULL,
    date TIMESTAMP NOT NULL,
    entry_type VARCHAR(20), -- NULL for trading entries, 'thought' or 'dayoff' for others
    pair VARCHAR(20), -- NULL for non-trading entries
    type VARCHAR(10), -- 'BUY' or 'SELL', NULL for non-trading entries
    rr VARCHAR(10), -- Risk/Reward ratio, NULL for non-trading entries
    pnl DECIMAL(10, 2), -- NULL for non-trading entries
    notes TEXT,
    screenshot_url TEXT,
    message TEXT, -- For thought and dayoff entries
    trading_view_url TEXT, -- For thought entries
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_entries_user_id (user_id),
    INDEX idx_entries_date (date),
    INDEX idx_entries_entry_type (entry_type),
    INDEX idx_entries_pair (pair),
    INDEX idx_entries_user_date (user_id, date)
);

-- Trading pairs (user-specific)
CREATE TABLE trading_pairs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pair VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pair (user_id, pair),
    INDEX idx_trading_pairs_user_id (user_id)
);

-- Motivational images (user-specific)
CREATE TABLE motivational_images (
    id DECIMAL(20, 6) PRIMARY KEY,
    user_id INT NOT NULL,
    image_data LONGTEXT NOT NULL, -- Base64 encoded image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_motivational_images_user_id (user_id)
);
```

---

## Data Migration from localStorage

### Migration Strategy

When migrating existing localStorage data to the database:

1. **User Creation:**
   - Create a user account (if not exists)
   - Create default `user_preferences` record

2. **Data Import:**
   - Import entries with `user_id`
   - Import trading pairs with `user_id`
   - Import motivational images with `user_id`
   - Update user preferences

### Example Migration Script (Pseudocode)

```javascript
async function migrateLocalStorageToDatabase(userId, localStorageData) {
    // 1. Create/Update user preferences
    await db.user_preferences.upsert({
        user_id: userId,
        app_title: localStorageData.appTitle || 'ProTrader Journal',
        account_balance: localStorageData.accountBalance || 0,
        current_theme: localStorageData.currentTheme || 'slate_blue',
        initialized: localStorageData.initialized || false
    });

    // 2. Import entries
    if (localStorageData.entries && localStorageData.entries.length > 0) {
        const entries = localStorageData.entries.map(entry => ({
            id: entry.id,
            user_id: userId,
            date: new Date(entry.date),
            entry_type: entry.entryType || null,
            pair: entry.pair || null,
            type: entry.type || null,
            rr: entry.rr || null,
            pnl: entry.pnl || null,
            notes: entry.notes || null,
            screenshot_url: entry.screenshotUrl || null,
            message: entry.message || null,
            trading_view_url: entry.tradingViewUrl || null
        }));
        await db.entries.bulkCreate(entries, { ignoreDuplicates: true });
    }

    // 3. Import trading pairs
    if (localStorageData.availablePairs && localStorageData.availablePairs.length > 0) {
        const pairs = localStorageData.availablePairs.map(pair => ({
            user_id: userId,
            pair: pair.toUpperCase()
        }));
        await db.trading_pairs.bulkCreate(pairs, { ignoreDuplicates: true });
    }

    // 4. Import motivational images
    if (localStorageData.motivationalImages && localStorageData.motivationalImages.length > 0) {
        const images = localStorageData.motivationalImages.map(image => ({
            id: image.id,
            user_id: userId,
            image_data: image.src
        }));
        await db.motivational_images.bulkCreate(images, { ignoreDuplicates: true });
    }
}
```

---

## Common Queries

### Get All User Data

```sql
-- Get user with preferences
SELECT 
    u.id,
    u.username,
    u.email,
    up.app_title,
    up.account_balance,
    up.current_theme,
    up.initialized
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
WHERE u.id = ?;

-- Get user entries (with filtering)
SELECT * FROM entries
WHERE user_id = ?
ORDER BY date DESC;

-- Get user trading pairs
SELECT pair FROM trading_pairs
WHERE user_id = ?
ORDER BY pair ASC;

-- Get user motivational images
SELECT id, image_data FROM motivational_images
WHERE user_id = ?
ORDER BY created_at DESC;
```

### Calculate User Metrics

```sql
-- Get trading statistics for a user
SELECT 
    COUNT(*) as total_trades,
    SUM(pnl) as total_pnl,
    AVG(pnl) as avg_pnl,
    SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) as losses,
    SUM(CASE WHEN pnl = 0 THEN 1 ELSE 0 END) as break_even
FROM entries
WHERE user_id = ?
  AND entry_type IS NULL  -- Trading entries only
  AND pnl IS NOT NULL;
```

### Get User Data for Export

```sql
-- Export all user data (similar to localStorage export)
SELECT 
    (SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', id,
            'date', date,
            'entryType', entry_type,
            'pair', pair,
            'type', type,
            'rr', rr,
            'pnl', pnl,
            'notes', notes,
            'screenshotUrl', screenshot_url,
            'message', message,
            'tradingViewUrl', trading_view_url
        )
    ) FROM entries WHERE user_id = ?) as entries,
    (SELECT JSON_ARRAYAGG(pair) FROM trading_pairs WHERE user_id = ?) as availablePairs,
    (SELECT JSON_ARRAYAGG(
        JSON_OBJECT('id', id, 'src', image_data)
    ) FROM motivational_images WHERE user_id = ?) as motivationalImages,
    (SELECT app_title FROM user_preferences WHERE user_id = ?) as appTitle,
    (SELECT account_balance FROM user_preferences WHERE user_id = ?) as accountBalance,
    (SELECT current_theme FROM user_preferences WHERE user_id = ?) as currentTheme,
    (SELECT initialized FROM user_preferences WHERE user_id = ?) as initialized;
```

---

## Security Considerations

1. **Authentication:**
   - Use secure password hashing (bcrypt, argon2)
   - Implement JWT tokens or session management
   - Add rate limiting for login attempts

2. **Authorization:**
   - Always filter queries by `user_id`
   - Never trust client-provided user IDs
   - Use middleware to verify user ownership

3. **Data Isolation:**
   - All queries must include `WHERE user_id = ?`
   - Use database row-level security if available
   - Implement proper foreign key constraints with CASCADE DELETE

4. **Sensitive Data:**
   - Consider encrypting screenshot URLs
   - Store images in secure cloud storage
   - Implement data retention policies

---

## Performance Optimization

1. **Indexes:**
   - All foreign keys are indexed
   - Composite indexes for common query patterns (user_id + date)
   - Regular index maintenance

2. **Image Storage:**
   - Move base64 images to cloud storage (S3, Cloudinary)
   - Store only URLs in database
   - Implement image compression

3. **Caching:**
   - Cache user preferences
   - Cache frequently accessed entries
   - Use Redis for session management

4. **Pagination:**
   - Always paginate large result sets
   - Use cursor-based pagination for entries

---

## Notes

1. **ID Generation:**
   - Entry IDs remain as BIGINT timestamps (compatible with localStorage)
   - User IDs are auto-increment integers
   - Image IDs remain as DECIMAL timestamps

2. **Backward Compatibility:**
   - Entry structure matches localStorage format
   - Migration scripts can preserve existing IDs
   - Export format matches localStorage export

3. **Scalability:**
   - Consider partitioning entries table by user_id for very large datasets
   - Implement soft deletes instead of hard deletes
   - Add audit logging for data changes

4. **Future Enhancements:**
   - Add user roles and permissions
   - Support multiple accounts per user
   - Add sharing/collaboration features
   - Implement data export/import APIs


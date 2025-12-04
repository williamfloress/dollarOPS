# localStorage Schema Documentation

This document describes all attributes and values stored in localStorage for the Trading Journal application. This information can be used to create SQL database schemas.

## Storage Keys

All localStorage keys use the prefix `journal_` and version suffix `_v1`:

| Storage Key | Data Type | Description |
|------------|-----------|-------------|
| `journal_entries_v1` | Array | Journal entries (trading operations, thoughts, day offs) |
| `journal_pairs_v1` | Array | Available trading pairs |
| `journal_images_v1` | Array | Motivational images for vision board |
| `journal_title_v1` | String | Application title |
| `journal_balance_v1` | Number | Account balance |
| `journal_theme_v1` | String | Current theme identifier |
| `journal_initialized_v1` | Boolean | Initialization flag (stored as 'true'/'false' string) |

---

## 1. journal_entries_v1

**Type:** Array of Objects  
**Storage Format:** JSON stringified array

### Entry Types

Entries can be one of three types:
1. **Trading Entry** (default, no `entryType` field)
2. **Thought Entry** (`entryType: 'thought'`)
3. **Day Off Entry** (`entryType: 'dayoff'`)

---

### Trading Entry Object

**Fields:**

| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `id` | Number | Yes | Unique identifier (timestamp) | `1699123456789` |
| `date` | String | Yes | ISO 8601 date string | `"2024-01-15T10:30:00.000Z"` |
| `pair` | String | Yes | Trading pair (uppercase) | `"EURUSD"`, `"BTCUSD"` |
| `type` | String | Yes | Trade direction | `"BUY"`, `"SELL"` |
| `rr` | String | No | Risk/Reward ratio | `"1:1"`, `"1:2"`, `"2:1"` |
| `pnl` | Number | Yes | Profit and Loss | `150.50`, `-75.25`, `0` |
| `notes` | String | No | Additional notes/comments | `"Good entry, followed the trend"` |
| `screenshotUrl` | String | No | URL to screenshot image | `"data:image/png;base64,..."` |

**Example:**
```json
{
  "id": 1699123456789,
  "date": "2024-01-15T10:30:00.000Z",
  "pair": "EURUSD",
  "type": "BUY",
  "rr": "1:2",
  "pnl": 150.50,
  "notes": "Followed the trend, good entry",
  "screenshotUrl": "data:image/png;base64,iVBORw0KG..."
}
```

---

### Thought Entry Object

**Fields:**

| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `id` | Number | Yes | Unique identifier (timestamp) | `1699123456789` |
| `date` | String | Yes | ISO 8601 date string | `"2024-01-15T10:30:00.000Z"` |
| `entryType` | String | Yes | Must be `"thought"` | `"thought"` |
| `message` | String | No* | Thought message | `"Remember to follow the plan"` |
| `tradingViewUrl` | String | No* | TradingView chart URL | `"https://www.tradingview.com/chart/..."` |

*At least one of `message` or `tradingViewUrl` must be present.

**Example:**
```json
{
  "id": 1699123456790,
  "date": "2024-01-15T10:30:00.000Z",
  "entryType": "thought",
  "message": "Remember to follow the trading plan",
  "tradingViewUrl": "https://www.tradingview.com/chart/..."
}
```

---

### Day Off Entry Object

**Fields:**

| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `id` | Number | Yes | Unique identifier (timestamp) | `1699123456791` |
| `date` | String | Yes | ISO 8601 date string | `"2024-01-15T10:30:00.000Z"` |
| `entryType` | String | Yes | Must be `"dayoff"` | `"dayoff"` |
| `message` | String | Yes | Always `"DAY OFF"` | `"DAY OFF"` |

**Example:**
```json
{
  "id": 1699123456791,
  "date": "2024-01-15T10:30:00.000Z",
  "entryType": "dayoff",
  "message": "DAY OFF"
}
```

---

## 2. journal_pairs_v1

**Type:** Array of Strings  
**Storage Format:** JSON stringified array

**Description:** List of available trading pairs (all uppercase)

**Example:**
```json
["EURUSD", "GBPUSD", "BTCUSD", "ETHUSD", "XAUUSD"]
```

---

## 3. journal_images_v1

**Type:** Array of Objects  
**Storage Format:** JSON stringified array

**Description:** Motivational images for the vision board feature

**Object Fields:**

| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| `id` | Number | Yes | Unique identifier | `1699123456792.123456` |
| `src` | String | Yes | Base64 encoded image data URL | `"data:image/jpeg;base64,/9j/4AAQ..."` |

**Example:**
```json
[
  {
    "id": 1699123456792.123456,
    "src": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  },
  {
    "id": 1699123456793.789012,
    "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
  }
]
```

---

## 4. journal_title_v1

**Type:** String  
**Storage Format:** JSON stringified string

**Description:** Application title displayed in the UI

**Default Value:** `"ProTrader Journal"`

**Example:**
```json
"ProTrader Journal"
```

---

## 5. journal_balance_v1

**Type:** Number  
**Storage Format:** JSON stringified number

**Description:** Account balance (starting balance)

**Default Value:** `0`

**Example:**
```json
10000
```

---

## 6. journal_theme_v1

**Type:** String  
**Storage Format:** JSON stringified string

**Description:** Current theme identifier

**Default Value:** `"slate_blue"`

**Possible Values:**
- `"slate_blue"`
- `"zinc_violet"`
- `"neutral_emerald"`
- `"stone_orange"`
- `"gray_cyan"`
- `"slate_pink"`
- `"zinc_amber"`
- `"neutral_teal"`
- `"light_blue"`
- `"light_violet"`
- `"light_emerald"`
- `"light_orange"`

**Example:**
```json
"slate_blue"
```

---

## 7. journal_initialized_v1

**Type:** Boolean  
**Storage Format:** String (`'true'` or `'false'`)

**Description:** Flag indicating if the application has been initialized (welcome modal completed)

**Default Value:** `false` (when key doesn't exist)

**Example:**
```
"true"
```

---

## SQL Schema Suggestions

Based on this localStorage structure, here are suggested SQL table schemas:

### Table: `entries`

```sql
CREATE TABLE entries (
    id BIGINT PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_entries_date ON entries(date);
CREATE INDEX idx_entries_entry_type ON entries(entry_type);
CREATE INDEX idx_entries_pair ON entries(pair);
```

### Table: `trading_pairs`

```sql
CREATE TABLE trading_pairs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pair VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `motivational_images`

```sql
CREATE TABLE motivational_images (
    id DECIMAL(20, 6) PRIMARY KEY,
    image_data LONGTEXT NOT NULL, -- Base64 encoded image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `app_settings`

```sql
CREATE TABLE app_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initial data
INSERT INTO app_settings (setting_key, setting_value) VALUES
    ('app_title', 'ProTrader Journal'),
    ('account_balance', '0'),
    ('current_theme', 'slate_blue'),
    ('initialized', 'false');
```

---

## Notes

1. **Data Types:**
   - All numeric IDs are stored as JavaScript numbers (can be very large timestamps)
   - Dates are stored as ISO 8601 strings
   - Images are stored as base64-encoded data URLs

2. **Entry Type Discrimination:**
   - Trading entries: `entryType` field is absent/undefined
   - Thought entries: `entryType === 'thought'`
   - Day off entries: `entryType === 'dayoff'`

3. **Validation:**
   - Trading entries require: `id`, `date`, `pair`, `type`, `pnl`
   - Thought entries require: `id`, `date`, `entryType`, and at least one of `message` or `tradingViewUrl`
   - Day off entries require: `id`, `date`, `entryType`, `message`

4. **Storage Limitations:**
   - localStorage has a ~5-10MB limit per domain
   - Base64 images can consume significant space
   - Consider moving images to a separate storage solution for production


-- Table to store pricing details for two-wheelers
CREATE TABLE two_wheeler_pricing (
    id SERIAL PRIMARY KEY,                 -- Integer, auto-increment
    variant_id VARCHAR(255) NOT NULL,      -- MongoDB ObjectId as string
    color_id VARCHAR(255),                 -- Optional color ID
    ex_showroom_price NUMERIC NOT NULL CHECK (ex_showroom_price >= 0),
    registration_road_tax NUMERIC NOT NULL CHECK (registration_road_tax >= 0),
    insurance NUMERIC NOT NULL CHECK (insurance >= 0)
);

-- Table to store add-on options for two-wheelers
CREATE TABLE two_wheeler_add_on (
    id SERIAL PRIMARY KEY,                 -- Integer, auto-increment
    two_wheeler_add_on_title VARCHAR(255) NOT NULL,
    two_wheeler_add_on_description TEXT NOT NULL,
    two_wheeler_add_on_price NUMERIC NOT NULL CHECK (two_wheeler_add_on_price >= 0),
    two_wheeler_add_on_is_optional BOOLEAN DEFAULT TRUE
);

-- Table to store subsidies for two-wheelers
CREATE TABLE two_wheeler_subsidy (
    id SERIAL PRIMARY KEY,                 -- Integer, auto-increment
    two_wheeler_subsidy_title VARCHAR(255) NOT NULL,
    two_wheeler_subsidy_description TEXT NOT NULL,
    two_wheeler_subsidy_amount NUMERIC NOT NULL CHECK (two_wheeler_subsidy_amount >= 0)
);

-- Junction table to link pricing with add-ons
CREATE TABLE two_wheeler_pricing_add_ons (
    id SERIAL PRIMARY KEY,                 -- Integer, auto-increment
    pricing_id INTEGER NOT NULL,
    add_on_id INTEGER NOT NULL,
    FOREIGN KEY (pricing_id) REFERENCES two_wheeler_pricing(id) ON DELETE CASCADE,
    FOREIGN KEY (add_on_id) REFERENCES two_wheeler_add_on(id) ON DELETE CASCADE,
    UNIQUE (pricing_id, add_on_id)         -- Prevent duplicate mappings
);

-- Junction table to link pricing with subsidies
CREATE TABLE two_wheeler_pricing_subsidies (
    id SERIAL PRIMARY KEY,                 -- Integer, auto-increment
    pricing_id INTEGER NOT NULL,
    subsidy_id INTEGER NOT NULL,
    FOREIGN KEY (pricing_id) REFERENCES two_wheeler_pricing(id) ON DELETE CASCADE,
    FOREIGN KEY (subsidy_id) REFERENCES two_wheeler_subsidy(id) ON DELETE CASCADE,
    UNIQUE (pricing_id, subsidy_id)        -- Prevent duplicate mappings
);




-- Insert data into two_wheeler_pricing
INSERT INTO two_wheeler_pricing (variant_id, color_id, ex_showroom_price, registration_road_tax, insurance) VALUES
    ('507f1f77bcf86cd799439011', '507f191e810c19729de860ea', 85000.00, 5000.00, 3000.00), -- Bike 1: Variant 1, Color Red
    ('507f1f77bcf86cd799439012', NULL, 90000.00, 5500.00, 3200.00);                        -- Bike 2: Variant 2, No specific color

-- Insert data into two_wheeler_add_on
INSERT INTO two_wheeler_add_on (two_wheeler_add_on_title, two_wheeler_add_on_description, two_wheeler_add_on_price, two_wheeler_add_on_is_optional) VALUES
    ('Extended Warranty', '1-year extended warranty coverage', 2000.00, TRUE),
    ('Helmet', 'Branded safety helmet', 1500.00, TRUE),
    ('Side Stand', 'Custom side stand for stability', 800.00, FALSE); -- Mandatory add-on

-- Insert data into two_wheeler_subsidy
INSERT INTO two_wheeler_subsidy (two_wheeler_subsidy_title, two_wheeler_subsidy_description, two_wheeler_subsidy_amount) VALUES
    ('Electric Vehicle Subsidy', 'Government subsidy for electric two-wheelers', 10000.00),
    ('State Tax Rebate', 'State-specific tax rebate for eco-friendly vehicles', 3000.00);

-- Insert data into two_wheeler_pricing_add_ons (junction table for pricing and add-ons)
INSERT INTO two_wheeler_pricing_add_ons (pricing_id, add_on_id) VALUES
    (1, 1), -- Bike 1 with Extended Warranty
    (1, 2), -- Bike 1 with Helmet
    (2, 2), -- Bike 2 with Helmet
    (2, 3); -- Bike 2 with Side Stand (mandatory)

-- Insert data into two_wheeler_pricing_subsidies (junction table for pricing and subsidies)
INSERT INTO two_wheeler_pricing_subsidies (pricing_id, subsidy_id) VALUES
    (1, 1), -- Bike 1 with Electric Vehicle Subsidy
    (2, 1), -- Bike 2 with Electric Vehicle Subsidy
    (2, 2); -- Bike 2 with State Tax Rebate
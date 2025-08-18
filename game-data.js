// Game Data - Card Decks and Scene Tiles

class GameData {
    static getClueCards() {
        return [
            'Fingerprint', 'Bloodstain', 'Hair Sample', 'Fiber', 'Shoe Print', 'Tire Track',
            'Glass Fragment', 'Paint Chip', 'Soil Sample', 'Pollen', 'Insect', 'Feather',
            'Button', 'Thread', 'Paper', 'Note', 'Receipt', 'Ticket', 'Key', 'Coin',
            'Jewelry', 'Watch', 'Phone', 'Wallet', 'ID Card', 'Credit Card', 'Photo',
            'Document', 'Map', 'Diary', 'Letter', 'Envelope', 'Stamp', 'Sticker',
            'Tape', 'Glue', 'Ink', 'Pencil', 'Pen', 'Marker', 'Chalk', 'Dust',
            'Ash', 'Smoke', 'Fire', 'Explosion', 'Bullet', 'Shell Casing', 'Gunpowder',
            'Knife Mark', 'Tool Mark', 'Bite Mark', 'Scratch', 'Bruise', 'Cut',
            'Burn', 'Stab Wound', 'Gunshot Wound', 'Strangulation', 'Poison', 'Drug',
            'Alcohol', 'Chemical', 'Acid', 'Base', 'Salt', 'Sugar', 'Spice',
            'Herb', 'Plant', 'Flower', 'Leaf', 'Bark', 'Wood', 'Metal', 'Plastic',
            'Rubber', 'Leather', 'Fabric', 'Wool', 'Cotton', 'Silk', 'Linen',
            'Canvas', 'Vinyl', 'Ceramic', 'Porcelain', 'Stone', 'Marble', 'Granite',
            'Concrete', 'Brick', 'Tile', 'Carpet', 'Rug', 'Curtain', 'Blind',
            'Mirror', 'Window', 'Door', 'Lock', 'Hinge', 'Handle', 'Knob',
            'Switch', 'Outlet', 'Wire', 'Cable', 'Battery', 'Bulb', 'Lamp',
            'Candle', 'Match', 'Lighter', 'Cigarette', 'Cigar', 'Pipe', 'Ashtray',
            'Cup', 'Glass', 'Bottle', 'Can', 'Jar', 'Box', 'Bag', 'Envelope',
            'Package', 'Container', 'Vessel', 'Pot', 'Pan', 'Plate', 'Bowl',
            'Fork', 'Spoon', 'Knife', 'Chopstick', 'Napkin', 'Towel', 'Cloth',
            'Rag', 'Sponge', 'Brush', 'Comb', 'Mirror', 'Razor', 'Scissors',
            'Tweezers', 'Tape', 'Glue', 'Stapler', 'Paper Clip', 'Rubber Band',
            'String', 'Rope', 'Chain', 'Wire', 'Cable', 'Pipe', 'Tube', 'Hose',
            'Duct', 'Vent', 'Fan', 'Pump', 'Motor', 'Engine', 'Gear', 'Wheel',
            'Axle', 'Shaft', 'Bearing', 'Spring', 'Magnet', 'Battery', 'Circuit',
            'Chip', 'Board', 'Screen', 'Display', 'Speaker', 'Microphone', 'Camera',
            'Lens', 'Filter', 'Prism', 'Mirror', 'Laser', 'Light', 'Shadow',
            'Reflection', 'Echo', 'Sound', 'Vibration', 'Heat', 'Cold', 'Pressure',
            'Vacuum', 'Gravity', 'Magnetism', 'Electricity', 'Radiation', 'Wave',
            'Particle', 'Atom', 'Molecule', 'Cell', 'Tissue', 'Organ', 'Bone',
            'Muscle', 'Nerve', 'Blood', 'Sweat', 'Tear', 'Saliva', 'Mucus',
            'Urine', 'Feces', 'Vomit', 'Pus', 'Scab', 'Scar', 'Tattoo', 'Piercing',
            'Makeup', 'Perfume', 'Deodorant', 'Soap', 'Shampoo', 'Lotion', 'Cream',
            'Ointment', 'Medicine', 'Pill', 'Capsule', 'Tablet', 'Syrup', 'Injection',
            'Bandage', 'Gauze', 'Tape', 'Splint', 'Cast', 'Crutch', 'Wheelchair',
            'Bed', 'Pillow', 'Blanket', 'Sheet', 'Curtain', 'Blind', 'Shade',
            'Lamp', 'Clock', 'Calendar', 'Book', 'Magazine', 'Newspaper', 'Map',
            'Chart', 'Graph', 'Diagram', 'Blueprint', 'Plan', 'Design', 'Model',
            'Prototype', 'Sample', 'Specimen', 'Artifact', 'Relic', 'Antique',
            'Heirloom', 'Treasure', 'Jewel', 'Gem', 'Crystal', 'Mineral', 'Rock',
            'Fossil', 'Bone', 'Shell', 'Coral', 'Pearl', 'Diamond', 'Ruby',
            'Emerald', 'Sapphire', 'Opal', 'Amber', 'Jade', 'Turquoise', 'Lapis',
            'Malachite', 'Quartz', 'Amethyst', 'Citrine', 'Rose Quartz', 'Obsidian',
            'Granite', 'Marble', 'Slate', 'Limestone', 'Sandstone', 'Shale',
            'Clay', 'Mud', 'Sand', 'Gravel', 'Pebble', 'Stone', 'Boulder'
        ];
    }

    static getMeanCards() {
        return [
            'Knife', 'Gun', 'Rope', 'Poison', 'Hammer', 'Axe', 'Sword', 'Dagger',
            'Scissors', 'Razor', 'Broken Glass', 'Fire', 'Explosion', 'Drowning',
            'Strangulation', 'Suffocation', 'Electrocution', 'Radiation', 'Disease',
            'Virus', 'Bacteria', 'Fungus', 'Parasite', 'Snake', 'Spider', 'Scorpion',
            'Bee', 'Wasp', 'Hornet', 'Ant', 'Termite', 'Mosquito', 'Flea', 'Tick',
            'Louse', 'Mite', 'Worm', 'Leech', 'Jellyfish', 'Coral', 'Sea Urchin',
            'Starfish', 'Crab', 'Lobster', 'Shrimp', 'Oyster', 'Clam', 'Mussel',
            'Snail', 'Slug', 'Centipede', 'Millipede', 'Beetle', 'Moth', 'Butterfly',
            'Dragonfly', 'Grasshopper', 'Cricket', 'Cicada', 'Aphid', 'Scale',
            'Mealybug', 'Thrip', 'Whitefly', 'Leafhopper', 'Treehopper', 'Spittlebug',
            'Froghopper', 'Planthopper', 'Stink Bug', 'Assassin Bug', 'Bed Bug',
            'Kissing Bug', 'Water Bug', 'Backswimmer', 'Water Strider', 'Giant Water Bug',
            'Diving Beetle', 'Whirligig Beetle', 'Ground Beetle', 'Tiger Beetle',
            'Firefly', 'Lightning Bug', 'Ladybug', 'Lady Beetle', 'Japanese Beetle',
            'Colorado Potato Beetle', 'Mexican Bean Beetle', 'Cucumber Beetle',
            'Striped Cucumber Beetle', 'Spotted Cucumber Beetle', 'Blister Beetle',
            'Soldier Beetle', 'Checkered Beetle', 'Clerid Beetle', 'Burying Beetle',
            'Carrion Beetle', 'Silphid Beetle', 'Rove Beetle', 'Staphylinid Beetle',
            'Click Beetle', 'Elaterid Beetle', 'Wireworm', 'Firefly Larva',
            'Lightning Bug Larva', 'Glowworm', 'Railroad Worm', 'Phengodid Beetle',
            'Net-winged Beetle', 'Lycid Beetle', 'Soldier Beetle', 'Cantharid Beetle',
            'Blister Beetle', 'Meloid Beetle', 'Oil Beetle', 'Spanish Fly',
            'False Blister Beetle', 'Oedemerid Beetle', 'False Click Beetle',
            'Eucnemid Beetle', 'Throscid Beetle', 'False Click Beetle', 'Throscid Beetle',
            'False Click Beetle', 'Throscid Beetle', 'False Click Beetle', 'Throscid Beetle'
        ];
    }

    static getRoleCards() {
        return [
            { name: 'Forensic Scientist', count: 1 },
            { name: 'Murderer', count: 1 },
            { name: 'Investigator', count: 8 },
            { name: 'Accomplice', count: 1 },
            { name: 'Witness', count: 1 }
        ];
    }

    static getSceneTiles() {
        return [
            { text: "Blood in the Alley", hints: ["Bloodstain", "Knife", "Darkness"] },
            { text: "Broken Window", hints: ["Glass Fragment", "Rock", "Break-in"] },
            { text: "Smoke in the Kitchen", hints: ["Fire", "Gas", "Accident"] },
            { text: "Wet Carpet", hints: ["Water", "Drowning", "Slippery"] },
            { text: "Locked Door", hints: ["Key", "Lock", "Confinement"] },
            { text: "Torn Clothing", hints: ["Fabric", "Struggle", "Violence"] },
            { text: "Spilled Chemicals", hints: ["Poison", "Acid", "Laboratory"] },
            { text: "Fallen Ladder", hints: ["Height", "Accident", "Gravity"] },
            { text: "Shattered Mirror", hints: ["Glass", "Reflection", "Break"] },
            { text: "Burned Documents", hints: ["Fire", "Paper", "Evidence"] },
            { text: "Open Safe", hints: ["Money", "Theft", "Security"] },
            { text: "Stained Rug", hints: ["Bloodstain", "Carpet", "Cover-up"] },
            { text: "Broken Chain", hints: ["Metal", "Restraint", "Escape"] },
            { text: "Empty Medicine Bottle", hints: ["Poison", "Pill", "Overdose"] },
            { text: "Cut Phone Line", hints: ["Communication", "Isolation", "Wire"] },
            { text: "Fallen Chandelier", hints: ["Height", "Glass", "Accident"] },
            { text: "Open Gas Valve", hints: ["Gas", "Explosion", "Asphyxiation"] },
            { text: "Broken Lock", hints: ["Security", "Break-in", "Metal"] },
            { text: "Stained Bathtub", hints: ["Water", "Bloodstain", "Drowning"] },
            { text: "Torn Curtain", hints: ["Fabric", "Struggle", "Window"] },
            { text: "Spilled Ink", hints: ["Writing", "Mess", "Document"] },
            { text: "Broken Staircase", hints: ["Height", "Fall", "Wood"] },
            { text: "Open Refrigerator", hints: ["Cold", "Food", "Electricity"] },
            { text: "Stained Wallpaper", hints: ["Wall", "Stain", "Cover-up"] },
            { text: "Broken Clock", hints: ["Time", "Glass", "Mechanical"] },
            { text: "Empty Gun Case", hints: ["Gun", "Weapon", "Security"] },
            { text: "Torn Photograph", hints: ["Memory", "Paper", "Emotion"] },
            { text: "Broken Vase", hints: ["Ceramic", "Accident", "Fragile"] },
            { text: "Stained Bedding", hints: ["Sleep", "Bloodstain", "Rest"] },
            { text: "Open Drawer", hints: ["Storage", "Search", "Wood"] },
            { text: "Broken Lamp", hints: ["Light", "Electricity", "Glass"] },
            { text: "Torn Book", hints: ["Knowledge", "Paper", "Destruction"] },
            { text: "Stained Sink", hints: ["Water", "Cleaning", "Metal"] },
            { text: "Broken Fence", hints: ["Boundary", "Wood", "Break"] },
            { text: "Open Window", hints: ["Air", "Escape", "Glass"] },
            { text: "Torn Map", hints: ["Location", "Paper", "Direction"] },
            { text: "Stained Floor", hints: ["Surface", "Stain", "Cover-up"] },
            { text: "Broken Statue", hints: ["Art", "Stone", "Accident"] }
        ];
    }
}

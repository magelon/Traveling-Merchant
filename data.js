const TOWNS = {
    'Pazzio': {
        'connections': ['Poroson', 'Ruvinheigen', 'Kumersun'],
        'goods': {
            'wheat': {'base_price': 8},
            'trenni_silver': {'base_price': 35},
            'spices': {'base_price': 45},
            'salt': {'base_price': 15},
            'fur': {'base_price': 30},
            'wine': {'base_price': 25}
        }
    },
    'Ruvinheigen': {
        'connections': ['Pazzio', 'Kumersun', 'Lenos'],
        'goods': {
            'holy_books': {'base_price': 50},
            'cloth': {'base_price': 20},
            'incense': {'base_price': 40},
            'candles': {'base_price': 12},
            'silver_ornaments': {'base_price': 60},
            'wool': {'base_price': 18}
        }
    },
    'Kumersun': {
        'connections': ['Pazzio', 'Ruvinheigen', 'Nyohhira'],
        'goods': {
            'marten_fur': {'base_price': 45},
            'lumber': {'base_price': 22},
            'armor': {'base_price': 70},
            'dried_fish': {'base_price': 15},
            'nails': {'base_price': 10},
            'pyrite': {'base_price': 25}
        }
    },
    'Lenos': {
        'connections': ['Ruvinheigen', 'Nyohhira', 'Poroson'],
        'goods': {
            'premium_fur': {'base_price': 80},
            'leather': {'base_price': 35},
            'honey': {'base_price': 30},
            'weapons': {'base_price': 65},
            'iron': {'base_price': 40},
            'ale': {'base_price': 20}
        }
    },
    'Nyohhira': {
        'connections': ['Kumersun', 'Lenos', 'Poroson'],
        'goods': {
            'medicinal_herbs': {'base_price': 55},
            'hot_spring_salt': {'base_price': 25},
            'crafted_pottery': {'base_price': 40},
            'paper': {'base_price': 15},
            'oil': {'base_price': 30},
            'artwork': {'base_price': 100}
        }
    },
    'Poroson': {
        'connections': ['Pazzio', 'Lenos', 'Nyohhira'],
        'goods': {
            'grains': {'base_price': 12},
            'vegetables': {'base_price': 8},
            'cheese': {'base_price': 25},
            'tools': {'base_price': 35},
            'preserved_meat': {'base_price': 40},
            'textiles': {'base_price': 28},
            'apples': {'base_price': 15}
        }
    }
};
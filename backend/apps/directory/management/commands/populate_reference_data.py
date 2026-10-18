from django.core.management.base import BaseCommand
from apps.directory.models import District, Town, Locality, Category

class Command(BaseCommand):
    help = 'Populates authentic reference master data (District, Towns, Localities, and Categories) for Tirunelveli District'

    def handle(self, *args, **options):
        self.stdout.write("Populating official reference taxonomy for Tirunelveli District...")

        # 1. District
        district, created = District.objects.get_or_create(
            slug='tirunelveli',
            defaults={
                'name': 'Tirunelveli',
                'tamil_name': 'திருநெல்வேலி',
                'state': 'Tamil Nadu'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created District: {district.name}"))

        # 2. Categories
        categories_data = [
            {
                'name': 'Shops & Retail Stores',
                'tamil_name': 'கடைகள் & சில்லறை விற்பனை',
                'slug': 'shops',
                'icon': 'store',
                'description': 'Local retail shops, textile showrooms, stationery, hardware, electronics and specialty stores.',
                'order': 1,
            },
            {
                'name': 'Schools',
                'tamil_name': 'பள்ளிகள்',
                'slug': 'schools',
                'icon': 'graduation-cap',
                'description': 'Primary, secondary, and higher secondary schools across state, matriculation, and CBSE boards.',
                'order': 2,
            },
            {
                'name': 'Colleges & Universities',
                'tamil_name': 'கல்லூரிகள் & பல்கலைக்கழகங்கள்',
                'slug': 'colleges',
                'icon': 'landmark',
                'description': 'Engineering, arts and science colleges, polytechnics, medical and allied educational institutions.',
                'order': 3,
            },
            {
                'name': 'Hospitals & Clinics',
                'tamil_name': 'மருத்துவமனைகள் & கிளினிக்குகள்',
                'slug': 'hospitals',
                'icon': 'hospital',
                'description': 'General hospitals, specialty clinics, dispensaries, primary health centres, and diagnostic labs.',
                'order': 4,
            },
            {
                'name': 'Hotels & Restaurants',
                'tamil_name': 'ஹோட்டல்கள் & உணவகங்கள்',
                'slug': 'hotels-restaurants',
                'icon': 'utensils',
                'description': 'Traditional vegetarian messes, non-vegetarian restaurants, cafes, bakeries, and lodging hotels.',
                'order': 5,
            },
            {
                'name': 'Markets & Marketplaces',
                'tamil_name': 'சந்தைகள்',
                'slug': 'markets',
                'icon': 'shopping-bag',
                'description': 'Vegetable, fruit, flower and daily commodity markets including Uzhavar Sandhais.',
                'order': 6,
            },
            {
                'name': 'Shopping Complexes & Malls',
                'tamil_name': 'வணிக வளாகங்கள்',
                'slug': 'shopping-complexes',
                'icon': 'building',
                'description': 'Commercial complexes, multi-store shopping centres, and retail plazas.',
                'order': 7,
            },
            {
                'name': 'Public Places & Parks',
                'tamil_name': 'பொது இடங்கள் & பூங்காக்கள்',
                'slug': 'public-places',
                'icon': 'trees',
                'description': 'City parks, riverwalks along Tamirabarani, recreational spots, and public libraries.',
                'order': 8,
            },
            {
                'name': 'Temples & Heritage Places',
                'tamil_name': 'கோயில்கள் & பாரம்பரிய இடங்கள்',
                'slug': 'temples',
                'icon': 'temple',
                'description': 'Historic temples, heritage landmarks, architectural monuments, and cultural sites.',
                'order': 9,
            },
            {
                'name': 'Government Offices & Public Services',
                'tamil_name': 'அரசு அலுவலகங்கள்',
                'slug': 'government-offices',
                'icon': 'briefcase',
                'description': 'Collectorate, taluk offices, municipal corporation offices, police stations, and registrar offices.',
                'order': 10,
            },
            {
                'name': 'Banks & Financial Services',
                'tamil_name': 'வங்கிகள் & நிதி சேவைகள்',
                'slug': 'banks',
                'icon': 'building-2',
                'description': 'Nationalized, private, and cooperative bank branches, post office financial counters, and ATMs.',
                'order': 11,
            },
            {
                'name': 'Supermarkets',
                'tamil_name': 'பல்பொருள் அங்காடிகள்',
                'slug': 'supermarkets',
                'icon': 'shopping-cart',
                'description': 'Departmental stores, consumer cooperatives, and grocery supermarkets.',
                'order': 12,
            },
            {
                'name': 'Service Centres',
                'tamil_name': 'சேவை மையங்கள்',
                'slug': 'service-centres',
                'icon': 'wrench',
                'description': 'Automobile service stations, electronics repair centres, Aadhaar/e-Seva centres, and utility offices.',
                'order': 13,
            },
        ]

        for cat_info in categories_data:
            c, was_created = Category.objects.update_or_create(
                slug=cat_info['slug'],
                defaults={
                    'name': cat_info['name'],
                    'tamil_name': cat_info['tamil_name'],
                    'icon': cat_info['icon'],
                    'description': cat_info['description'],
                    'display_order': cat_info['order'],
                }
            )
            if was_created:
                self.stdout.write(f"  + Category: {c.name}")

        # 3. Towns in Tirunelveli District
        towns_data = [
            {'name': 'Tirunelveli City', 'tamil_name': 'திருநெல்வேலி மாநகரம்', 'slug': 'tirunelveli-city'},
            {'name': 'Palayamkottai', 'tamil_name': 'பாளையங்கோட்டை', 'slug': 'palayamkottai'},
            {'name': 'Ambasamudram', 'tamil_name': 'அம்பாசமுத்திரம்', 'slug': 'ambasamudram'},
            {'name': 'Cheranmahadevi', 'tamil_name': 'சேரன்மகாதேவி', 'slug': 'cheranmahadevi'},
            {'name': 'Nanguneri', 'tamil_name': 'நாங்குநேரி', 'slug': 'nanguneri'},
            {'name': 'Radhapuram', 'tamil_name': 'ராதாபுரம்', 'slug': 'radhapuram'},
            {'name': 'Valliyur', 'tamil_name': 'வள்ளியூர்', 'slug': 'valliyur'},
            {'name': 'Kalakkad', 'tamil_name': 'களக்காடு', 'slug': 'kalakkad'},
            {'name': 'Sankarankovil', 'tamil_name': 'சங்கரன்கோவில்', 'slug': 'sankarankovil'},
        ]

        town_instances = {}
        for t_info in towns_data:
            t, was_created = Town.objects.update_or_create(
                district=district,
                slug=t_info['slug'],
                defaults={
                    'name': t_info['name'],
                    'tamil_name': t_info['tamil_name'],
                }
            )
            town_instances[t_info['slug']] = t
            if was_created:
                self.stdout.write(f"  + Town: {t.name}")

        # 4. Prominent Localities
        city_town = town_instances.get('tirunelveli-city')
        palay_town = town_instances.get('palayamkottai')

        localities_data = [
            {'town': city_town, 'name': 'Tirunelveli Town', 'tamil_name': 'டவுன்', 'pin': '627006'},
            {'town': city_town, 'name': 'Tirunelveli Junction', 'tamil_name': 'சந்திப்பு', 'pin': '627001'},
            {'town': city_town, 'name': 'Vannarpettai', 'tamil_name': 'வண்ணார்பேட்டை', 'pin': '627003'},
            {'town': city_town, 'name': 'Pettai', 'tamil_name': 'பேட்டை', 'pin': '627004'},
            {'town': city_town, 'name': 'Thachanallur', 'tamil_name': 'தச்சநல்லூர்', 'pin': '627358'},
            {'town': city_town, 'name': 'Kokkirakulam', 'tamil_name': 'கொக்கிரகுளம்', 'pin': '627009'},
            {'town': city_town, 'name': 'Melapalayam', 'tamil_name': 'மேலப்பாளையம்', 'pin': '627005'},
            {'town': palay_town, 'name': 'Palayamkottai High Ground', 'tamil_name': 'ஹை கிரவுண்ட்', 'pin': '627002'},
            {'town': palay_town, 'name': 'Maharaja Nagar', 'tamil_name': 'மகாராஜா நகர்', 'pin': '627011'},
            {'town': palay_town, 'name': 'Perumalpuram', 'tamil_name': 'பெருமாள்புரம்', 'pin': '627007'},
            {'town': palay_town, 'name': 'Samathanapuram', 'tamil_name': 'சமாதானபுரம்', 'pin': '627002'},
            {'town': palay_town, 'name': 'Shanthi Nagar', 'tamil_name': 'சாந்தி நகர்', 'pin': '627002'},
        ]

        for loc in localities_data:
            if loc['town']:
                l, was_created = Locality.objects.update_or_create(
                    town=loc['town'],
                    name=loc['name'],
                    defaults={
                        'tamil_name': loc['tamil_name'],
                        'postal_code': loc['pin'],
                    }
                )
                if was_created:
                    self.stdout.write(f"  + Locality: {l.name}")

        self.stdout.write(self.style.SUCCESS("Reference taxonomy for Tirunelveli District successfully populated."))

export function getAnimalName(numRange = 99): string {
    const aniIdx = Math.floor(Math.random() * ANIMALS.length);
    return getDescribedNoun(ANIMALS[aniIdx], numRange);
}

export function getDescribedNoun(noun: string, numRange = 99): string {
    const adjIdx = Math.floor(Math.random() * ADJECTIVES.length);
    const num = '' + (numRange > 0 ? Math.floor(Math.random() * numRange) + 1 : '');
    return `${ADJECTIVES[adjIdx]}${noun}${num}`;
}

const ADJECTIVES = [
    'Adventurous',
    'Alert',
    'Amusing',
    'Ancient',
    'Askew',
    'Awkward',
    'Benevolent',
    'Brave',
    'Brazen',
    'Brilliant',
    'Busy',
    'Calm',
    'Capable',
    'Carefree',
    'Ceaseless',
    'Challenging',
    'Charming',
    'Cheeky',
    'Cheerful',
    'Chilly',
    'Clever',
    'Compassionate',
    'Content',
    'Copious',
    'Courageous',
    'Courteous',
    'Cozy',
    'Crawling',
    'Crazy',
    'Creaky',
    'Creative',
    'Creeping',
    'Crispy',
    'Curious',
    'Curly',
    'Daring',
    'Delighted',
    'Diminutive',
    'Eccentric',
    'Ecstatic',
    'Edgy',
    'Effortless',
    'Endless',
    'Entertaining',
    'Eternal',
    'Excited',
    'Fair',
    'Fantastic',
    'Fluttering',
    'Freezing',
    'Friendly',
    'Frosty',
    'Furious',
    'Fuzzy',
    'Generous',
    'Gilded',
    'Glassy',
    'Glowing',
    'Graceful',
    'Grand',
    'Grave',
    'Great',
    'Happy',
    'Hardworking',
    'Hopeful',
    'Huge',
    'Icy',
    'Idyllic',
    'Impatient',
    'Infamous',
    'Ingenious',
    'Intense',
    'Joyful',
    'Lavish',
    'Lively',
    'Long',
    'Loud',
    'Loyal',
    'Lumpy',
    'Marvelous',
    'Meandering',
    'Mighty',
    'Muffled',
    'Muggy',
    'Mysterious',
    'Nervous',
    'Nimble',
    'Odd',
    'Optimistic',
    'Opulent',
    'Parched',
    'Peculiar',
    'Perpetual',
    'Pleasant',
    'Plush',
    'Polite',
    'Precise',
    'Proud',
    'Prudent',
    'Puny',
    'Quick',
    'Rambunctious',
    'Rapid',
    'Relaxed',
    'Rich',
    'Ridiculous',
    'Righteous',
    'Scorching',
    'Serious',
    'Shining',
    'Shocking',
    'Silly',
    'Sizzling',
    'Slick',
    'Small',
    'Smooth',
    'Snug',
    'Soaring',
    'Solemn',
    'Sparkling',
    'Speedy',
    'Spiky',
    'Splendid',
    'Steaming',
    'Stern',
    'Strict',
    'Striking',
    'Sturdy',
    'Subtle',
    'Superb',
    'Surprised',
    'Swift',
    'Thrifty',
    'Tiny',
    'Tough',
    'Tranquil',
    'Trendy',
    'Tricky',
    'Truthful',
    'Vast',
    'Verdant',
    'Vigilant',
    'Whimsical',
    'Wild',
    'Wise',
    'Wonderful',
    'Wrinkly'
];

const ANIMALS = [
    'Aardvark',
    'Albatross',
    'Alligator',
    'Alpaca',
    'Anaconda',
    'Angelfish',
    'Anglerfish',
    'Ant',
    'Anteater',
    'Antelope',
    'Antlion',
    'Aphid',
    'Armadillo',
    'Asp',
    'Baboon',
    'Badger',
    'Bandicoot',
    'Barnacle',
    'Barracuda',
    'Basilisk',
    'Bass',
    'Bat',
    'Bear',
    'Beaver',
    'Bee',
    'Beetle',
    'Bison',
    'Blackbird',
    'Bluebird',
    'Bluejay',
    'Boa',
    'Bobcat',
    'Buffalo',
    'Butterfly',
    'Camel',
    'Capybara',
    'Cardinal',
    'Caribou',
    'Carp',
    'Cat',
    'Caterpillar',
    'Catfish',
    'Centipede',
    'Cephalopod',
    'Chameleon',
    'Chickadee',
    'Chimpanzee',
    'Chinchilla',
    'Chipmunk',
    'Clam',
    'Clownfish',
    'Cobra',
    'Cod',
    'Condor',
    'Coyote',
    'Crab',
    'Crane',
    'Crawdad',
    'Crayfish',
    'Cricket',
    'Crocodile',
    'Cuckoo',
    'Deer',
    'Dingo',
    'Dinosaur',
    'Dog',
    'Dolphin',
    'Dragonfly',
    'Dragon',
    'Duck',
    'Eagle',
    'Earthworm',
    'Echidna',
    'Eel',
    'Egret',
    'Elephant',
    'Elk',
    'Emu',
    'Ermine',
    'Falcon',
    'Ferret',
    'Finch',
    'Firefly',
    'Fish',
    'Flamingo',
    'Flyingfish',
    'Fowl',
    'Fox',
    'Frog',
    'Fruitbat',
    'Galliform',
    'Gazelle',
    'Gecko',
    'Gerbil',
    'Gibbon',
    'Gila',
    'Giraffe',
    'Goat',
    'Goldfish',
    'Goose',
    'Gopher',
    'Gorilla',
    'Grasshopper',
    'Grizzly',
    'Grouse',
    'Guineafowl',
    'Gull',
    'Guppy',
    'Haddock',
    'Halibut',
    'Hammerhead',
    'Hamster',
    'Hare',
    'Harrier',
    'Hawk',
    'Hedgehog',
    'Heron',
    'Herring',
    'Hippopotamus',
    'Hornet',
    'Horse',
    'Hummingbird',
    'Hyena',
    'Iguana',
    'Impala',
    'Jackal',
    'Jaguar',
    'Jellyfish',
    'Kangaroo',
    'Kingfisher',
    'Kiwi',
    'Koala',
    'Koi',
    'Komodo',
    'Krill',
    'Lamprey',
    'Lark',
    'Lemming',
    'Lemur',
    'Leopard',
    'Leopon',
    'Limpet',
    'Lion',
    'Lizard',
    'Llama',
    'Lobster',
    'Lungfish',
    'Lynx',
    'Macaw',
    'Mackerel',
    'Magpie',
    'Manatee',
    'Mandrill',
    'Marlin',
    'Marmoset',
    'Marmot',
    'Marsupial',
    'Mastodon',
    'Meadowlark',
    'Meerkat',
    'Mink',
    'Minnow',
    'Mockingbird',
    'Mole',
    'Mollusk',
    'Mongoose',
    'Monkey',
    'Moose',
    'Mouse',
    'Muskox',
    'Narwhal',
    'Newt',
    'Ocelot',
    'Octopus',
    'Opossum',
    'Orangutan',
    'Orca',
    'Ostrich',
    'Otter',
    'Owl',
    'Ox',
    'Panda',
    'Panther',
    'Parakeet',
    'Parrot',
    'Parrotfish',
    'Partridge',
    'Pelican',
    'Penguin',
    'Perch',
    'Pheasant',
    'Pigeon',
    'Pike',
    'Piranha',
    'Planarian',
    'Platypus',
    'Porcupine',
    'Porpoise',
    'Possum',
    'Prairiedog',
    'Prawn',
    'Primate',
    'Ptarmigan',
    'Puffin',
    'Puma',
    'Python',
    'Quail',
    'Quelea',
    'Quokka',
    'Rabbit',
    'Raccoon',
    'Rattlesnake',
    'Raven',
    'Reindeer',
    'Reptile',
    'Rhinoceros',
    'Roadrunner',
    'Sabertooth',
    'Sailfish',
    'Salamander',
    'Salmon',
    'Sawfish',
    'Scallop',
    'Scorpion',
    'Seahorse',
    'Sealion',
    'Shark',
    'Shrimp',
    'Silkworm',
    'Skink',
    'Skunk',
    'Snail',
    'Snake',
    'Snipe',
    'Sparrow',
    'Spider',
    'Spoonbill',
    'Squid',
    'Squirrel',
    'Starfish',
    'Stingray',
    'Stoat',
    'Sturgeon',
    'Swan',
    'Swordfish',
    'Swordtail',
    'Tahr',
    'Takin',
    'Tapir',
    'Tarantula',
    'Tarsier',
    'Tern',
    'Thrush',
    'Tiger',
    'Toad',
    'Tortoise',
    'Toucan',
    'Trout',
    'Tuna',
    'Turkey',
    'Turtle',
    'Urial',
    'Vicuna',
    'Viper',
    'Vole',
    'Wallaby',
    'Walrus',
    'Whale',
    'Whippet',
    'Whitefish',
    'Wildcat',
    'Wildfowl',
    'Wolf',
    'Wolverine',
    'Wombat',
    'Woodpecker',
    'Wren',
    'Xerinae',
    'Yak',
    'Zebra'
];
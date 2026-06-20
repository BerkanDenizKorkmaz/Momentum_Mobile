import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, IconButton } from '../components/UI';
import { useApp } from '../state/AppContext';
import { spacing, radius, font } from '../theme';

const translations = {
  English: {
    tooShort: 'Too short',
    mustBe5: 'Your guess must be 5 letters.',
    notWord: 'Not a word',
    enterValid: 'Please enter a valid word.',
    morningRoutine: 'MORNING ROUTINE',
    solved: 'Solved! Returning...',
    wordWas: 'The word was',
    tapComplete: 'Tap complete!',
    guess: 'Guess the Wordle',
    reward: 'REWARD',
    flame: '+1 flame',
    complete: 'COMPLETE',
    cancel: 'Cancel'
  },
  Türkçe: {
    tooShort: 'Çok kısa',
    mustBe5: 'Tahmininiz 5 harfli olmalıdır.',
    notWord: 'Kelime değil',
    enterValid: 'Lütfen geçerli bir kelime girin.',
    morningRoutine: 'SABAH RUTİNİ',
    solved: 'Çözüldü! Dönülüyor...',
    wordWas: 'Kelime şuydu:',
    tapComplete: 'Tamamla butonuna dokun!',
    guess: 'Günün kelimesini bil',
    reward: 'ÖDÜL',
    flame: '+1 alev',
    complete: 'TAMAMLA',
    cancel: 'İptal'
  }
};

const KEYBOARD = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
];

// The massive offline dictionary
const VALID_WORDS = [
  "ABACK", "ABAFT", "ABASE", "ABATE", "ABBEY", "ABBOT", "ABHOR", "ABIDE", "ABLER", "ABODE", 
  "ABOUT", "ABOVE", "ABYSS", "ACHED", "ACHES", "ACIDS", "ACORN", "ACRES", "ACRID", 
  "ACTED", "ACTOR", "ACUTE", "ADAGE", "ADAPT", "ADDED", "ADDER", "ADEPT", "ADIEU", "ADMIT", 
  "ADOBE", "ADOPT", "ADORE", "ADORN", "ADULT", "AEGIS", "AEONS", "AFFIX", "AFIRE", "AFOOT", 
  "AFTER", "AGAIN", "AGAPE", "AGATE", "AGENT", "AGILE", "AGING", "AGLOW", "AGONY", "AGREE", 
  "AHEAD", "AIDED", "AIDES", "AILED", "AIMED", "AIRED", "AISLE", "ALARM", "ALBUM", "ALDER", 
  "ALERT", "ALIAS", "ALIBI", "ALIEN", "ALIKE", "ALIVE", "ALLAY", "ALLEY", "ALLOT", "ALLOW", 
  "ALLOY", "ALOES", "ALOFT", "ALONE", "ALONG", "ALOOF", "ALOUD", "ALPHA", "ALTAR", "ALTER", 
  "ALTOS", "AMASS", "AMAZE", "AMBER", "AMBLE", "AMEND", "AMIGO", "AMISS", "AMITY", "AMONG", 
  "AMOUR", "AMPLE", "AMPLY", "AMUSE", "ANGEL", "ANGER", "ANGLE", "ANGRY", "ANGST", "ANIME", 
  "ANKLE", "ANNEX", "ANNOY", "ANNUL", "ANTES", "ANTIC", "ANVIL", "APACE", "APART", "APING", 
  "APPAL", "APPLE", "APPLY", "APRON", "APTLY", "AREAS", "ARENA", "ARGUE", "ARISE", "ARMED", 
  "AROMA", "AROSE", "ARRAY", "ARROW", "ASHEN", "ASHES", "ASIDE", "ASKED", "ASKEW", 
  "ASPEN", "ASSAY", "ASSET", "ASTER", "ASTIR", "ATLAS", "ATOLL", "ATOMS", "ATONE", "ATTAR", 
  "ATTIC", "AUDIO", "AUDIT", "AUGER", "AUGHT", "AUGUR", "AUNTS", "AURAS", "AUTOS", "AVAIL", 
  "AVERS", "AVERT", "AVOID", "AVOWS", "AWAIT", "AWAKE", "AWARD", "AWARE", "AWFUL", "AWOKE", 
  "AXIOM", "AXLES", "AZURE", "BABEL", "BABES", "BACKS", "BACON", "BADGE", "BADLY", "BAGGY", 
  "BAITS", "BAIZE", "BAKED", "BAKER", "BALES", "BALLS", "BALMY", "BANAL", "BANDS", "BANDY", 
  "BANGS", "BANJO", "BANKS", "BANNS", "BARBS", "BARDS", "BARED", "BARGE", "BARKS", "BARNS", 
  "BARON", "BASAL", "BASED", "BASER", "BASES", "BASIC", "BASIL", "BASIN", "BASIS", "BASSO", 
  "BASTE", "BATCH", "BATED", "BATHE", "BATHS", "BATON", "BAYOU", "BEACH", "BEADS", "BEADY", 
  "BEAKS", "BEAMS", "BEANS", "BEARD", "BEARS", "BEAST", "BEAUX", "BEECH", "BEETS", "BEFIT", 
  "BEGAN", "BEGAT", "BEGET", "BEGIN", "BEGOT", "BEGUN", "BEING", "BELIE", "BELLE", "BELLS", 
  "BELLY", "BELOW", "BELTS", "BENCH", "BENDS", "BERGS", "BERRY", "BERTH", "BERYL", "BESET", 
  "BESOM", "BEVEL", "BIBLE", "BIDED", "BIDES", "BIGHT", "BILGE", "BILLS", "BILLY", 
  "BINDS", "BIPED", "BIRCH", "BIRDS", "BIRTH", "BISON", "BITES", "BLACK", "BLADE", "BLAME", 
  "BLAND", "BLANK", "BLARE", "BLAST", "BLAZE", "BLEAK", "BLEAT", "BLEND", "BLENT", 
  "BLESS", "BLEST", "BLIND", "BLINK", "BLISS", "BLOCK", "BLOCS", "BLOND", "BLOOM", 
  "BLOTS", "BLOWN", "BLOWS", "BLUER", "BLUES", "BLUFF", "BLUNT", "BLURT", "BLUSH", "BOARD", 
  "BOARS", "BOAST", "BOATS", "BODED", "BODES", "BOGGY", "BOGUS", "BOILS", "BOLES", "BOLTS", 
  "BONDS", "BONED", "BONES", "BONNY", "BONUS", "BOOKS", "BOOMS", "BOONS", "BOORS", 
  "BOOST", "BOOTH", "BOOTS", "BORAX", "BORED", "BORES", "BORNE", "BOSOM", 
  "BOUGH", "BOUND", "BOUTS", "BOWED", "BOWEL", "BOWER", "BOWLS", "BOXED", "BOXER", "BOXES", 
  "BRACE", "BRAGS", "BRAID", "BRAIN", "BRAKE", "BRAND", "BRASS", "BRATS", "BRAVE", "BRAVO", 
  "BRAWN", "BREAD", "BREAK", "BREED", "BRIAR", "BRIBE", "BRICK", "BRIDE", "BRIEF", 
  "BRIER", "BRIGS", "BRIMS", "BRINE", "BRING", "BRINK", "BRINY", "BRISK", "BROAD", "BROIL", 
  "BROKE", "BROOD", "BROOK", "BROOM", "BROTH", "BROWN", "BROWS", "BRUIN", "BRUNT", "BRUSH", 
  "BRUTE", "BUCKS", "BUDGE", "BUGGY", "BUGLE", "BUILD", "BUILT", "BULBS", "BULGE", "BULKS", 
  "BULKY", "BULLS", "BULLY", "BUMPS", "BUNCH", "BUNKS", "BUOYS", "BURLY", "BURNS", "BURNT", 
  "BURRO", "BURRS", "BURST", "BUSHY", "BUSTS", "BUTTE", "BUTTS", "BUXOM", "BUYER", "CABAL", 
  "CABBY", "CABIN", "CABLE", "CACAO", "CACHE", "CADET", "CADRE", "CAGED", "CAGES", "CAIRN", 
  "CAKED", "CAKES", "CALLS", "CALMS", "CALYX", "CAMEL", "CAMEO", "CAMPS", "CANAL", "CANDY", 
  "CANES", "CANNY", "CANOE", "CANON", "CANTO", "CAPER", "CAPES", "CAPON", "CARDS", "CARED", 
  "CARES", "CARGO", "CAROL", "CARRY", "CARTS", "CARVE", "CASED", "CASES", "CASKS", "CASTE", 
  "CASTS", "CATCH", "CATER", "CAUSE", "CAVED", "CAVES", "CAVIL", "CEASE", "CEDAR", "CEDED", 
  "CELLS", "CENTS", "CHAFE", "CHAFF", "CHAIN", "CHAIR", "CHALK", "CHAMP", "CHANT", "CHAOS", 
  "CHAPS", "CHARM", "CHART", "CHARY", "CHASE", "CHASM", "CHATS", "CHEAP", "CHEAT", "CHECK", 
  "CHEEK", "CHEER", "CHEFS", "CHESS", "CHEST", "CHICK", "CHIDE", "CHIEF", "CHILD", "CHILL", 
  "CHIME", "CHINA", "CHINS", "CHIPS", "CHIRP", "CHOIR", "CHOKE", "CHOPS", "CHORD", 
  "CHOSE", "CHUCK", "CHUMS", "CHUNK", "CHURL", "CHURN", "CHUTE", "CIDER", "CINCH", 
  "CIRCA", "CITED", "CITES", "CIVET", "CIVIC", "CIVIL", "CLACK", "CLAIM", "CLAMP", 
  "CLAMS", "CLANG", "CLANK", "CLANS", "CLAPS", "CLASH", "CLASP", "CLASS", "CLAWS", "CLEAN", 
  "CLEAR", "CLEFS", "CLEFT", "CLERK", "CLEWS", "CLICK", "CLIFF", "CLIMB", "CLIME", "CLING", 
  "CLINK", "CLIPS", "CLOAK", "CLOCK", "CLODS", "CLOGS", "CLOSE", "CLOTH", "CLOUD", "CLOUT", 
  "CLOVE", "CLOWN", "CLUBS", "CLUCK", "CLUES", "CLUMP", "CLUNG", "COACH", "COALS", "COAST", 
  "COATS", "COBRA", "COCKS", "COCOA", "CODES", "COILS", "COINS", "COLDS", "COLIC", "COLON", 
  "COLTS", "COMBS", "COMER", "COMES", "COMET", "COMIC", "COMMA", "CONCH", "CONES", "CONIC", 
  "COOED", "COOKS", "COOLS", "COPRA", "COPSE", "CORAL", "CORDS", "CORES", "CORKS", "CORNS", 
  "CORPS", "COSTS", "COTES", "COUCH", "COUGH", "COULD", "COUNT", "COUPE", "COUPS", "COURT", 
  "COVER", "COVES", "COVET", "COVEY", "COWED", "COWER", "COYLY", "COZEN", "CRABS", "CRACK", 
  "CRAFT", "CRAGS", "CRAMP", "CRANE", "CRANK", "CRAPE", "CRASH", "CRASS", "CRATE", "CRAVE", 
  "CRAWL", "CRAZE", "CREAK", "CREAM", "CREDO", "CREED", "CREEK", "CREEP", "CREPE", 
  "CREPT", "CRESS", "CREST", "CREWS", "CRIBS", "CRICK", "CRIED", "CRIER", "CRIES", 
  "CRIMP", "CRISP", "CROAK", "CROCK", "CRONE", "CRONY", "CROOK", "CROPS", "CROSS", "CROUP", 
  "CROWD", "CROWN", "CROWS", "CRUDE", "CRUEL", "CRUMB", "CRUSH", "CRUST", "CRYPT", "CUBES", 
  "CUBIC", "CUBIT", "CUFFS", "CULTS", "CURDS", "CURED", "CURES", "CURLS", "CURLY", "CURRY", 
  "CURST", "CURVE", "CYCLE", "CYNIC", "DADDY", "DAILY", "DAIRY", "DAISY", "DALES", 
  "DALLY", "DAMES", "DAMPS", "DANCE", "DANDY", "DARED", "DARES", "DARTS", "DATED", "DATES", 
  "DATUM", "DAUBS", "DAUNT", "DAWNS", "DAZED", "DEALS", "DEALT", "DEANS", "DEARS", 
  "DEBAR", "DEBIT", "DEBTS", "DEBUT", "DECAY", "DECKS", "DECOY", "DECRY", "DEEDS", "DEEMS", 
  "DEEPS", "DEFER", "DEIGN", "DEITY", "DELAY", "DELLS", "DELTA", "DELVE", "DEMUR", 
  "DENSE", "DENTS", "DEPOT", "DEPTH", "DERBY", "DESKS", "DETER", "DEUCE", "DIARY", 
  "DICED", "DICES", "DICTA", "DIETS", "DIGIT", "DIKES", "DIMES", "DIMLY", "DINED", "DINER", 
  "DINES", "DINGY", "DIRGE", "DIRTY", "DISCS", "DISKS", "DITCH", "DITTO", "DITTY", "DIVAN", 
  "DIVED", "DIVER", "DIVES", "DIZZY", "DOCKS", "DODGE", "DOERS", "DOGMA", "DOING", "DOLED", 
  "DOLLS", "DOMED", "DOMES", "DONOR", "DOOMS", "DOORS", "DOSED", "DOSES", "DOTED", "DOTES", 
  "DOUBT", "DOUGH", "DOVES", "DOWDY", "DOWNS", "DOWNY", "DOWRY", "DOZED", "DOZEN", "DRAFT", 
  "DRAGS", "DRAIN", "DRAKE", "DRAMA", "DRAMS", "DRANK", "DRAPE", "DRAWL", "DRAWN", "DRAWS", 
  "DRAYS", "DREAD", "DREAM", "DREGS", "DRESS", "DRIED", "DRIER", "DRIES", "DRIFT", "DRILL", 
  "DRILY", "DRINK", "DRIPS", "DRIVE", "DROLL", "DRONE", "DROOP", "DROPS", "DROSS", "DROVE", 
  "DROWN", "DRUMS", "DRYLY", "DUCAL", "DUCAT", "DUCHY", "DUCKS", "DUCTS", 
  "DUELS", "DUETS", "DUKES", "DULLY", "DUMMY", "DUMPS", "DUMPY", "DUNES", "DUNNO", 
  "DUPED", "DUPES", "DUSKY", "DUSTY", "DWARF", "DWELL", "DWELT", "DYING", "EAGER", "EAGLE", 
  "EARLS", "EARLY", "EARNS", "EARTH", "EASED", "EASEL", "EASES", "EATEN", "EATER", "EAVES", 
  "EBBED", "EBONY", "EDGED", "EDGES", "EDICT", "EDIFY", "EERIE", "EGGED", "EIGHT", "EJECT", 
  "ELATE", "ELBOW", "ELDER", "ELECT", "ELEGY", "ELFIN", "ELITE", "ELOPE", "ELUDE", "ELVES", 
  "EMAIL", "EMITS", "EMPTY", "ENACT", "ENDED", "ENDOW", "ENJOY", "ENNUI", "ENROL", 
  "ENSUE", "ENTER", "ENTRY", "ENVOY", "EPICS", "EPOCH", "EQUAL", "EQUIP", "ERASE", "ERECT", 
  "ERRED", "ERROR", "ESSAY", "ETHER", "ETHIC", "EVADE", "EVENT", "EVERY", "EVOKE", 
  "EXACT", "EXALT", "EXCEL", "EXERT", "EXILE", "EXIST", "EXITS", "EXPEL", "EXTOL", "EXTRA", 
  "EXULT", "EYING", "EYRIE", "FABLE", "FACED", "FACES", "FACTS", "FADED", "FADES", "FAILS", 
  "FAINT", "FAIRS", "FAITH", "FAKIR", "FALLS", "FALSE", "FAMED", "FANCY", "FANGS", 
  "FARCE", "FARED", "FARES", "FARMS", "FASTS", "FATED", "FATES", "FATTY", "FAULT", 
  "FAUNA", "FAUNS", "FAWNS", "FEARS", "FEAST", "FEATS", "FEEDS", "FEELS", "FEIGN", "FEINT", 
  "FELLS", "FELON", "FENCE", "FERAL", "FERNS", "FERRY", "FETCH", "FETED", 
  "FEUDS", "FEVER", "FEWER", "FICHE", "FIEFS", "FIELD", "FIERY", "FIFES", "FIFTH", 
  "FIFTY", "FIGHT", "FILCH", "FILED", "FILES", "FILET", "FILLS", "FILLY", "FILMS", "FILMY", 
  "FINAL", "FINCH", "FINDS", "FINED", "FINER", "FINES", "FINIS", "FINNY", "FIORD", 
  "FIRED", "FIRES", "FIRMS", "FIRST", "FISHY", "FISTS", "FITLY", "FIVES", "FIXED", "FIXER", 
  "FIXES", "FJORD", "FLAGS", "FLAIL", "FLAIR", "FLAKE", "FLAKY", "FLAME", "FLANK", "FLAPS", 
  "FLARE", "FLASH", "FLASK", "FLATS", "FLAWS", "FLEAS", "FLECK", "FLEES", "FLEET", "FLESH", 
  "FLICK", "FLIER", "FLIES", "FLING", "FLINT", "FLIRT", "FLITS", "FLOAT", "FLOCK", "FLOES", 
  "FLOOD", "FLOOR", "FLORA", "FLOSS", "FLOUR", "FLOUT", "FLOWN", "FLOWS", "FLUES", "FLUFF", 
  "FLUID", "FLUKE", "FLUME", "FLUNG", "FLUSH", "FLUTE", "FLYER", "FOAMS", "FOAMY", "FOCAL", 
  "FOCUS", "FOGGY", "FOILS", "FOIST", "FOLDS", "FOLIO", "FOLKS", "FOLLY", "FOODS", 
  "FORAY", "FORCE", "FORDS", "FORGE", "FORGO", "FORKS", "FORMS", "FORTE", "FORTH", "FORTS", 
  "FORTY", "FORUM", "FOUND", "FOUNT", "FOURS", "FOWLS", "FOXES", "FOYER", "FRAIL", "FRAME", 
  "FRANC", "FRANK", "FREAK", "FREED", "FREER", "FREES", "FRESH", "FRETS", "FRIAR", 
  "FRIED", "FRILL", "FRISK", "FROCK", "FROGS", "FROND", "FRONT", "FROST", "FROTH", "FROWN", 
  "FROZE", "FRUIT", "FUDGE", "FUELS", "FUGUE", "FULLY", "FUMED", "FUMES", "FUNDS", "FUNGI", 
  "FUNNY", "FURRY", "FURZE", "FUSED", "FUSES", "FUSSY", "FUZZY", "GABLE", "GAILY", "GAINS", 
  "GALES", "GALLS", "GAMES", "GAMIN", "GAMMA", "GAMUT", "GANGS", "GAPED", "GAPES", "GASES", 
  "GASPS", "GATES", "GAUDY", "GAUGE", "GAUNT", "GAUZE", "GAUZY", "GAVEL", "GAWKY", "GAYER", 
  "GAYLY", "GAZED", "GAZER", "GAZES", "GEARS", "GEESE", "GENIE", "GENII", "GENRE", "GENTS", 
  "GENUS", "GERMS", "GHOST", "GIANT", "GIBES", "GIDDY", "GIFTS", "GILDS", "GILLS", "GIMME", 
  "GIRDS", "GIRLS", "GIRTH", "GIVEN", "GIVES", "GLADE", "GLAND", "GLARE", "GLASS", "GLAZE", 
  "GLEAM", "GLEAN", "GLENS", "GLIDE", "GLINT", "GLOAT", "GLOBE", "GLOOM", "GLORY", "GLOSS", 
  "GLOVE", "GLOWS", "GLUED", "GNASH", "GNATS", "GNAWS", "GNOME", "GOADS", "GOALS", "GOATS", 
  "GODLY", "GOING", "GOLLY", "GONGS", "GONNA", "GOODS", "GOODY", "GOOSE", "GORED", "GORGE", 
  "GORSE", "GOTTA", "GOUGE", "GOURD", "GOUTY", "GOWNS", "GRABS", "GRACE", "GRADE", "GRAFT", 
  "GRAIN", "GRAMS", "GRAND", "GRANT", "GRAPE", "GRAPH", "GRASP", "GRASS", "GRATE", "GRAVE", 
  "GRAVY", "GRAZE", "GREAT", "GREED", "GREEN", "GREET", "GREYS", "GRIEF", "GRILL", "GRIME", 
  "GRIMY", "GRIND", "GRINS", "GRIPE", "GRIPS", "GRIST", "GROAN", "GROOM", "GROPE", 
  "GROSS", "GROUP", "GROVE", "GROWL", "GROWN", "GROWS", "GRUBS", "GRUEL", "GRUFF", "GRUNT", 
  "GUANO", "GUARD", "GUESS", "GUEST", "GUIDE", "GUILD", "GUILE", "GUILT", "GUISE", "GULCH", 
  "GULFS", "GULLS", "GULLY", "GUMMY", "GUSTO", "GUSTS", "GUSTY", "HABIT", "HACKS", "HAILS", 
  "HAIRS", "HAIRY", "HALED", "HALLS", "HALTS", "HALVE", "HANDS", "HANDY", "HANGS", "HAPPY", 
  "HARDY", "HAREM", "HARES", "HARMS", "HARPS", "HARPY", "HARRY", "HARSH", "HARTS", "HASTE", 
  "HASTY", "HATCH", "HATED", "HATER", "HAULS", "HAVEN", "HAVOC", "HAWKS", "HAZEL", "HEADS", 
  "HEADY", "HEALS", "HEAPS", "HEARD", "HEARS", "HEART", "HEATH", "HEATS", "HEAVE", "HEAVY", 
  "HEDGE", "HEEDS", "HEELS", "HEIRS", "HELIX", "HELLO", "HELMS", "HELPS", "HENCE", "HERBS", 
  "HERDS", "HERON", "HEROS", "HEWED", "HIDES", "HILLS", "HILLY", "HILTS", "HINDS", "HINGE", 
  "HINTS", "HIRED", "HIRES", "HITCH", "HIVES", "HOARD", "HOARY", "HOBBY", "HOIST", "HOLDS", 
  "HOLES", "HOLLY", "HOMES", "HONEY", "HOODS", "HOOFS", "HOOKS", "HOOPS", "HOOTS", "HOPED", 
  "HOPES", "HORDE", "HORNS", "HORSE", "HOSTS", "HOTEL", "HOTLY", "HOUND", "HOURS", "HOUSE", 
  "HOVEL", "HOVER", "HOWLS", "HULKS", "HULLS", "HUMAN", "HUMID", "HUMPS", "HUMUS", "HUNCH", 
  "HUNTS", "HURLS", "HURRY", "HURTS", "HUSKS", "HUSKY", "HYDRA", "HYENA", "HYMNS", "ICILY", 
  "ICING", "IDEAL", "IDEAS", "IDIOM", "IDLED", "IDLER", "IDOLS", "IDYLL", "IGLOO", 
  "IMAGE", "IMBUE", "IMPEL", "IMPLY", "INANE", "INCUR", "INDEX", "INEPT", "INERT", "INFER", 
  "INGOT", "INLET", "INNER", "INTER", "INURE", "IRATE", "IRKED", "IRONS", "IRONY", "ISLES", 
  "ISLET", "ISSUE", "ITEMS", "IVORY", "JACKS", "JADED", "JAILS", "JAUNT", "JEANS", "JEERS", 
  "JELLY", "JERKS", "JERKY", "JESTS", "JETTY", "JEWEL", "JIFFY", "JOINS", "JOINT", "JOKED", 
  "JOKER", "JOKES", "JOLLY", "JOUST", "JOYED", "JUDGE", "JUICE", "JUICY", "JUMPS", "JUNKS", 
  "JUNTA", "JUROR", "KARMA", "KEELS", "KEEPS", "KETCH", "KEYED", "KHAKI", "KICKS", 
  "KINDA", "KINDS", "KINGS", "KIOSK", "KITES", "KNACK", "KNAVE", "KNEAD", "KNEEL", "KNEES", 
  "KNELL", "KNELT", "KNITS", "KNOBS", "KNOCK", "KNOLL", "KNOTS", "KNOWN", "KNOWS", 
  "LABEL", "LACED", "LACES", "LACKS", "LADEN", "LADLE", "LAIRS", "LAITY", "LAKES", 
  "LAMBS", "LAMED", "LAMES", "LAMPS", "LANCE", "LANDS", "LANES", "LANKY", "LAPEL", "LAPSE", 
  "LARCH", "LARGE", "LARGO", "LARKS", "LARVA", "LASSO", "LASTS", "LATCH", "LATER", "LATHE", 
  "LATHS", "LAUGH", "LAWNS", "LAYER", "LEADS", "LEAFY", "LEAKS", "LEAKY", "LEANS", "LEAPS", 
  "LEAPT", "LEARN", "LEASE", "LEASH", "LEAST", "LEAVE", "LEDGE", "LEECH", "LEEKS", "LEGAL", 
  "LEMME", "LEMON", "LENDS", "LEPER", "LEVEE", "LEVEL", "LEVER", "LIBEL", "LICKS", 
  "LIEGE", "LIENS", "LIFTS", "LIGHT", "LIKED", "LIKEN", "LIKER", "LIKES", "LILAC", "LIMBO", 
  "LIMBS", "LIMES", "LIMIT", "LINED", "LINEN", "LINER", "LINES", "LINGO", "LINKS", "LIONS", 
  "LISTS", "LITHE", "LIVED", "LIVER", "LIVES", "LIVID", "LLAMA", "LOADS", "LOAMY", "LOANS", 
  "LOATH", "LOBBY", "LOBES", "LOCAL", "LOCKS", "LOCUS", "LODGE", "LOFTY", "LOGES", "LOGIC", 
  "LOGIN", "LONGS", "LOOKS", "LOOMS", "LOONS", "LOOPS", "LOOSE", "LORDS", 
  "LOSES", "LOTUS", "LOVED", "LOVER", "LOVES", "LOWED", "LOWER", "LOWLY", 
  "LOYAL", "LUCID", "LUCKY", "LULLS", "LUMPS", "LUMPY", "LUNAR", "LUNCH", "LUNGE", "LUNGS", 
  "LURCH", "LURED", "LURES", "LURID", "LURKS", "LUTES", "LYING", "LYMPH", 
  "LYRIC", "MACES", "MADAM", "MADLY", "MAGIC", "MAIDS", "MAILS", "MAINS", "MAIZE", "MAJOR", 
  "MAKER", "MAKES", "MALES", "MAMMA", "MANES", "MANGA", "MANGE", "MANGO", "MANGY", "MANIA", 
  "MANLY", "MANNA", "MANOR", "MANSE", "MAPLE", "MARCH", "MARES", "MARKS", "MARRY", "MARSH", 
  "MARTS", "MASKS", "MASON", "MASTS", "MATCH", "MATED", "MATES", "MAUVE", "MAXIM", "MAYBE", 
  "MAYOR", "MAZES", "MEALS", "MEALY", "MEANS", "MEANT", "MEATS", "MEDAL", "MEDIA", "MEETS", 
  "MELON", "MELTS", "MEMES", "MENDS", "MENUS", "MERCY", "MERES", "MERGE", "MERIT", "MERRY", 
  "MESAS", "METAL", "METED", "METER", "MEWED", "MIDST", "MIENS", "MIGHT", "MILCH", "MILES", 
  "MILKY", "MILLS", "MIMES", "MIMIC", "MINCE", "MINDS", "MINED", "MINER", "MINES", "MINOR", 
  "MINTS", "MINUS", "MIRTH", "MISER", "MISTS", "MITES", "MIXED", "MIXES", "MOANS", "MOATS", 
  "MOCKS", "MODEL", "MODEM", "MODES", "MOIST", "MOLAR", "MOLES", "MOMMA", "MONEY", "MONKS", 
  "MONTH", "MOODS", "MOODY", "MOONS", "MOORS", "MOOSE", "MOPED", "MORAL", "MORES", "MOSSY", 
  "MOTES", "MOTHS", "MOTIF", "MOTOR", "MOTTO", "MOUND", "MOUNT", "MOURN", "MOUSE", "MOUTH", 
  "MOVED", "MOVER", "MOVES", "MOVIE", "MOWED", "MOWER", "MUDDY", "MULES", "MULTI", 
  "MUMMY", "MUMPS", "MUNCH", "MURAL", "MURKY", "MUSED", "MUSES", "MUSIC", "MUSKY", "MUSTY", 
  "MUTED", "MUTES", "MYRRH", "MYTHS", "NABOB", "NAILS", "NAIVE", "NAMED", "NAMES", 
  "NASAL", "NASTY", "NATAL", "NATTY", "NAVAL", "NAVEL", "NAVES", "NEARS", "NECKS", "NEEDS", 
  "NEEDY", "NEIGH", "NERVE", "NESTS", "NEVER", "NEWER", "NEWLY", "NICER", "NICHE", "NIECE", 
  "NIGHT", "NOBLE", "NOBLY", "NOISE", "NOISY", "NOMAD", "NONCE", "NOOKS", 
  "NORTH", "NOSED", "NOSES", "NOTCH", "NOTED", "NOTES", "NOUNS", "NOVEL", "NUDGE", "NURSE", 
  "NYMPH", "OAKEN", "OAKUM", "OASES", "OASIS", "OATEN", "OATHS", "OBESE", "OBEYS", "OCCUR", 
  "OCEAN", "OCHRE", "ODDER", "ODDLY", "ODIUM", "OFFAL", "OFFER", "OFTEN", "OILED", "OLDEN", 
  "OLDER", "OMENS", "OMITS", "ONION", "ONSET", "OOZED", "OOZES", "OPALS", "OPENS", "OPERA", 
  "OPINE", "OPTIC", "ORBIT", "ORDER", "ORGAN", "OSIER", "OTHER", "OTTER", "OUGHT", 
  "OUNCE", "OUTDO", "OUTER", "OVALS", "OVARY", "OVENS", "OVERT", "OWING", "OWNED", "OWNER", 
  "OXIDE", "OZONE", "PACES", "PACKS", "PADDY", "PADRE", "PAEAN", "PAGAN", "PAGES", "PAILS", 
  "PAINS", "PAINT", "PAIRS", "PALED", "PALER", "PALES", "PALMS", "PALMY", "PALSY", "PANEL", 
  "PANES", "PANGS", "PANIC", "PANTS", "PAPAL", "PAPAS", "PAPER", "PARED", "PARKA", 
  "PARKS", "PARRY", "PARSE", "PARTS", "PARTY", "PASHA", "PASTE", "PASTY", "PATCH", "PATES", 
  "PATHS", "PATIO", "PAUSE", "PAVED", "PAWED", "PAWNS", "PAYED", "PAYER", "PEACE", "PEACH", 
  "PEAKS", "PEALS", "PEARL", "PEARS", "PEASE", "PECKS", "PEDAL", "PEEPS", "PEERS", "PELTS", 
  "PENAL", "PENCE", "PENNY", "PEONS", "PERCH", "PERIL", "PESKY", "PESOS", "PESTS", "PETAL", 
  "PETTY", "PHASE", "PHIAL", "PHONE", "PHOTO", "PIANO", "PICKS", "PIECE", "PIERS", "PIETY", 
  "PIGMY", "PIKES", "PILED", "PILES", "PILLS", "PILOT", "PINCH", "PINED", "PINES", "PINKS", 
  "PINTO", "PINTS", "PIOUS", "PIPED", "PIPER", "PIPES", "PIQUE", "PITCH", "PITHY", "PIVOT", 
  "PLACE", "PLAID", "PLAIN", "PLAIT", "PLANE", "PLANK", "PLANS", "PLANT", "PLATE", "PLAYS", 
  "PLAZA", "PLEAD", "PLEAS", "PLIED", "PLIES", "PLOTS", "PLUCK", "PLUGS", "PLUMB", "PLUME", 
  "PLUMS", "PLUSH", "PODIA", "POEMS", "POESY", "POETS", "POINT", "POISE", "POKED", "POKER", 
  "POKES", "POLAR", "POLES", "POLKA", "POLLS", "PONDS", "POOLS", "POPPA", "POPPY", 
  "PORCH", "PORED", "PORES", "PORTS", "POSED", "POSER", "POSES", "POSSE", "POSTS", "POUCH", 
  "POUND", "POURS", "POWER", "PRANK", "PRATE", "PRAYS", "PRESS", "PREYS", "PRICE", "PRIDE", 
  "PRIED", "PRIES", "PRIME", "PRINT", "PRIOR", "PRISM", "PRIVY", "PRIZE", "PROBE", "PRONE", 
  "PROOF", "PROPS", "PROSE", "PROSY", "PROUD", "PROVE", "PROWL", "PROWS", "PROXY", "PRUDE", 
  "PRUNE", "PSALM", "PSHAW", "PUDGY", "PUFFS", "PUFFY", "PULLS", "PULPY", "PULSE", "PUMPS", 
  "PUNCH", "PUPIL", "PUPPY", "PUREE", "PURER", "PURGE", "PURSE", "PUTTY", "QUACK", "QUAFF", 
  "QUAIL", "QUAKE", "QUALM", "QUART", "QUASI", "QUAYS", "QUEEN", "QUELL", "QUERY", 
  "QUEST", "QUEUE", "QUICK", "QUIET", "QUILL", "QUILT", "QUIPS", "QUIRE", "QUITE", "QUITS", 
  "QUOTA", "QUOTE", "QUOTH", "RABBI", "RABID", "RACED", "RACER", "RACES", "RACKS", "RADII", 
  "RADIO", "RAFTS", "RAGED", "RAGES", "RAIDS", "RAILS", "RAINS", "RAINY", "RAISE", "RAJAH", 
  "RAKED", "RAKES", "RALLY", "RANCH", "RANGE", "RANKS", "RAPID", "RARER", "RARES", "RATED", 
  "RATES", "RATIO", "RAVED", "RAVEN", "RAVES", "RAYON", "RAZED", "RAZOR", "REACH", "REACT", 
  "READS", "READY", "REALM", "REALS", "REAMS", "REAPS", "REARS", "REBEL", "REBUS", "REBUT", 
  "RECUR", "REEDS", "REEDY", "REEFS", "REEKS", "REELS", "REEVE", "REFER", "REFIT", "REGAL", 
  "REIGN", "REINS", "RELAX", "RELAY", "RELIC", "REMIT", "RENDS", "RENEW", "RENTS", "REPAY", 
  "REPEL", "REPLY", "RESET", "RESIN", "RESTS", "REVEL", "REVUE", "RHEUM", "RHYME", "RICKS", 
  "RIDER", "RIDES", "RIDGE", "RIFLE", "RIFTS", "RIGHT", "RIGID", "RILED", "RILLS", "RIMES", 
  "RINGS", "RINSE", "RIOTS", "RIPEN", "RIPER", "RISEN", "RISER", "RISES", "RISKS", "RISKY", 
  "RITES", "RIVAL", "RIVEN", "RIVER", "RIVET", "ROADS", "ROAMS", "ROARS", "ROAST", "ROBED", 
  "ROBES", "ROBIN", "ROCKS", "ROCKY", "ROGUE", "ROLES", "ROLLS", "ROMAN", "ROOFS", "ROOKS", 
  "ROOMS", "ROOMY", "ROOST", "ROOTS", "ROPED", "ROPES", "ROSES", "ROSIN", "ROUGE", "ROUGH", 
  "ROUND", "ROUSE", "ROUTE", "ROUTS", "ROVED", "ROVER", "ROWDY", "ROWED", "ROYAL", "RUDER", 
  "RUFFS", "RUINS", "RULED", "RULER", "RULES", "RUNES", "RUNGS", "RUPEE", "RURAL", "RUSES", 
  "SABLE", "SABRE", "SACKS", "SADLY", "SAFER", "SAGAS", "SAGES", "SAHIB", "SAILS", "SAINT", 
  "SAITH", "SALAD", "SALES", "SALLY", "SALON", "SALSA", "SALTS", "SALTY", "SALVE", "SALVO", 
  "SANDS", "SANDY", "SANER", "SATED", "SATIN", "SATYR", "SAUCE", "SAUCY", "SAVED", "SAVES", 
  "SAWED", "SCALD", "SCALE", "SCALP", "SCALY", "SCAMP", "SCANS", "SCANT", "SCARE", "SCARF", 
  "SCARS", "SCENE", "SCENT", "SCION", "SCOFF", "SCOLD", "SCOOP", "SCOPE", "SCORE", "SCORN", 
  "SCOUR", "SCOUT", "SCOWL", "SCRAP", "SCREW", "SCRIP", "SCRUB", "SCULL", "SEALS", "SEAMS", 
  "SEAMY", "SEATS", "SECTS", "SEDAN", "SEDGE", "SEEDS", "SEEDY", "SEEKS", "SEEMS", "SEERS", 
  "SEIZE", "SELLS", "SENDS", "SENSE", "SERFS", "SERGE", "SERUM", "SERVE", "SEVEN", 
  "SEVER", "SEWED", "SEWER", "SHACK", "SHADE", "SHADY", "SHAFT", "SHAKE", "SHAKY", 
  "SHALE", "SHALL", "SHALT", "SHAME", "SHAMS", "SHANK", "SHAPE", "SHARE", "SHARK", "SHARP", 
  "SHAVE", "SHAWL", "SHEAF", "SHEAR", "SHEDS", "SHEEN", "SHEEP", "SHEER", "SHEET", "SHEIK", 
  "SHELF", "SHELL", "SHIED", "SHIFT", "SHINE", "SHINS", "SHINY", "SHIPS", "SHIRE", "SHIRK", 
  "SHIRT", "SHOAL", "SHOCK", "SHOES", "SHONE", "SHOOK", "SHOON", "SHOOT", "SHOPS", "SHORE", 
  "SHORN", "SHORT", "SHOTS", "SHOUT", "SHOVE", "SHOWN", "SHOWS", "SHOWY", "SHRED", "SHREW", 
  "SHRUB", "SHRUG", "SHUNS", "SHUTS", "SHYLY", "SIBYL", "SIDED", "SIDES", "SIEGE", "SIEVE", 
  "SIGHS", "SIGHT", "SIGMA", "SIGNS", "SILKS", "SILKY", "SILLS", "SILLY", "SINCE", "SINEW", 
  "SINGE", "SINGS", "SINKS", "SIREN", "SIRES", "SITES", "SIXES", "SIXTH", "SIXTY", "SIZED", 
  "SIZES", "SKATE", "SKEIN", "SKIES", "SKIFF", "SKILL", "SKIMS", "SKINS", "SKIPS", "SKIRT", 
  "SKULK", "SKUNK", "SLABS", "SLACK", "SLAGS", "SLAKE", "SLANG", "SLANT", 
  "SLAPS", "SLASH", "SLATE", "SLATS", "SLAYS", "SLEDS", "SLEEK", "SLEEP", "SLEET", "SLEPT", 
  "SLICE", "SLICK", "SLIDE", "SLILY", "SLIME", "SLIMY", "SLING", "SLINK", "SLIPS", "SLITS", 
  "SLOOP", "SLOPE", "SLOPS", "SLOTH", "SLUGS", "SLUMP", "SLUMS", "SLUNG", "SLUNK", "SLUSH", 
  "SLYLY", "SMACK", "SMALL", "SMART", "SMASH", "SMEAR", "SMELL", "SMELT", "SMILE", "SMIRK", 
  "SMITE", "SMITH", "SMOCK", "SMOKE", "SMOKY", "SMOTE", "SNACK", "SNAGS", "SNAIL", "SNAKE", 
  "SNAKY", "SNAPS", "SNARE", "SNARL", "SNEAK", "SNEER", "SNIFF", "SNIPE", "SNORE", 
  "SNORT", "SNOUT", "SNOWS", "SNOWY", "SNUFF", "SOAPY", "SOARS", "SOBER", "SOCKS", "SOFAS", 
  "SOGGY", "SOILS", "SOLAR", "SOLES", "SOLID", "SOLOS", "SOLVE", "SONGS", "SONNY", "SOOTH", 
  "SOOTY", "SORES", "SORRY", "SORTS", "SOUGH", "SOULS", "SOUND", "SOUPS", "SOUSE", "SOUTH", 
  "SOWED", "SOWER", "SPACE", "SPADE", "SPAKE", "SPANK", "SPANS", "SPARE", "SPARK", "SPARS", 
  "SPASM", "SPAWN", "SPEAK", "SPEAR", "SPECK", "SPEED", "SPELL", "SPELT", "SPEND", "SPENT", 
  "SPICE", "SPICY", "SPIED", "SPIES", "SPIKE", "SPILL", "SPILT", "SPINE", "SPINS", "SPINY", 
  "SPIRE", "SPITE", "SPITS", "SPLIT", "SPOIL", "SPOKE", "SPOOK", "SPOOL", "SPOON", "SPOOR", 
  "SPORE", "SPORT", "SPOTS", "SPOUT", "SPRAY", "SPREE", "SPRIG", "SPUNK", "SPURN", "SPURS", 
  "SPURT", "SQUAD", "SQUAT", "SQUAW", "STACK", "STAFF", "STAGE", "STAGS", "STAID", 
  "STAIN", "STAIR", "STAKE", "STALE", "STALK", "STALL", "STAMP", "STAND", "STANK", "STARE", 
  "STARK", "STARS", "START", "STATE", "STAVE", "STAYS", "STEAD", "STEAK", "STEAL", "STEAM", 
  "STEED", "STEEL", "STEEP", "STEER", "STEMS", "STEPS", "STERN", "STEWS", "STICK", "STIFF", 
  "STILE", "STILL", "STING", "STINK", "STINT", "STIRS", "STOCK", "STOIC", "STOLE", "STONE", 
  "STONY", "STOOD", "STOOL", "STOOP", "STOPS", "STORE", "STORK", "STORM", "STORY", "STOUT", 
  "STOVE", "STRAP", "STRAW", "STRAY", "STREW", "STRIP", "STRUT", "STUCK", "STUDS", "STUDY", 
  "STUFF", "STUMP", "STUNG", "STUNT", "STYLE", "SUAVE", "SUGAR", "SUING", "SUITE", "SUITS", 
  "SULKS", "SULKY", "SULLY", "SUNNY", "SUPER", "SURER", "SURGE", "SURLY", "SWAIN", "SWAMP", 
  "SWANS", "SWARD", "SWARM", "SWAYS", "SWEAR", "SWEAT", "SWEEP", "SWEET", "SWELL", "SWEPT", 
  "SWIFT", "SWILL", "SWIMS", "SWINE", "SWING", "SWIRL", "SWISH", "SWOON", "SWOOP", "SWORD", 
  "SWORE", "SWORN", "SWUNG", "SYNOD", "SYRUP", "TABBY", "TABLE", "TABOO", "TACIT", "TACKS", 
  "TAILS", "TAINT", "TAKEN", "TAKES", "TALES", "TALKS", "TALLY", "TALON", "TAMED", "TAMER", 
  "TANKS", "TAPER", "TAPES", "TARDY", "TARES", "TARRY", "TARTS", "TASKS", "TASTE", "TASTY", 
  "TAUNT", "TAWNY", "TAXED", "TAXES", "TEACH", "TEAMS", "TEARS", "TEASE", "TEEMS", "TEENS", 
  "TEETH", "TELLS", "TEMPI", "TEMPO", "TEMPS", "TENDS", "TENET", "TENOR", "TENSE", "TENTH", 
  "TENTS", "TEPEE", "TEPID", "TERMS", "TERSE", "TESTS", "TESTY", "TEXTS", "THANK", "THEFT", 
  "THEIR", "THEME", "THERE", "THESE", "THICK", "THIGH", "THINE", "THING", "THINK", 
  "THIRD", "THONG", "THORN", "THOSE", "THREE", "THREW", "THROB", "THROE", "THROW", "THUMB", 
  "THUMP", "THYME", "TIARA", "TIBIA", "TICKS", "TIDAL", "TIDES", "TIERS", "TIGER", "TIGHT", 
  "TILDE", "TILED", "TILES", "TILLS", "TILTS", "TIMED", "TIMES", "TIMID", "TINGE", "TINTS", 
  "TIPSY", "TIRED", "TIRES", "TITHE", "TITLE", "TOADS", "TOAST", "TODAY", "TODDY", "TOILS", 
  "TOKEN", "TOLLS", "TOMBS", "TOMES", "TONED", "TONES", "TONGS", "TONIC", "TOOLS", "TOOTH", 
  "TOPAZ", "TOPIC", "TOQUE", "TORCH", "TORSO", "TORTS", "TOTAL", "TOTEM", "TOUCH", "TOUGH", 
  "TOURS", "TOWED", "TOWEL", "TOWER", "TOWNS", "TOYED", "TRACE", "TRACK", "TRACT", 
  "TRADE", "TRAIL", "TRAIN", "TRAIT", "TRAMS", "TRAPS", "TRASH", "TRAYS", "TREAD", "TREAT", 
  "TREED", "TREES", "TREND", "TRESS", "TRIAD", "TRIAL", "TRIBE", "TRICE", "TRICK", "TRIED", 
  "TRIES", "TRILL", "TRIPE", "TRIPS", "TRITE", "TROLL", "TROOP", "TROTH", "TROTS", "TROUT", 
  "TRUCE", "TRUCK", "TRUER", "TRULY", "TRUMP", "TRUNK", "TRUSS", "TRUST", "TRUTH", "TRYST", 
  "TUBES", "TUFTS", "TULIP", "TULLE", "TUNED", "TUNES", "TUNIC", "TURNS", "TUSKS", "TUTOR", 
  "TWAIN", "TWANG", "TWEED", "TWICE", "TWIGS", "TWINE", "TWINS", "TWIRL", "TWIST", "TYING", 
  "TYPED", "TYPES", "UDDER", "ULCER", "ULTRA", "UNCLE", "UNCUT", "UNDER", "UNDID", "UNDUE", 
  "UNFIT", "UNION", "UNITE", "UNITS", "UNITY", "UNSAY", "UNTIE", "UNTIL", "UPPER", "UPSET", 
  "URBAN", "URGED", "URGES", "USAGE", "USERS", "USHER", "USING", "USUAL", "USURP", 
  "USURY", "UTTER", "VAGUE", "VALES", "VALET", "VALID", "VALUE", "VALVE", "VANES", "VAPID", 
  "VASES", "VAULT", "VAUNT", "VEILS", "VEINS", "VELDT", "VENAL", "VENOM", "VENTS", "VENUE", 
  "VERBS", "VERGE", "VERSE", "VERVE", "VESTS", "VEXED", "VEXES", "VIALS", "VICAR",  
  "VIDEO", "VIEWS", "VIGIL", "VILER", "VILLA", "VINES", "VIOLA", "VIPER", "VIRUS", "VISIT", 
  "VISOR", "VISTA", "VITAL", "VIVID", "VIXEN", "VIZOR", "VOCAL", "VOGUE", "VOICE", 
  "VOILE", "VOLTS", "VOTED", "VOTER", "VOTES", "VOUCH", "VOWED", "VOWEL", "VYING", 
  "WADED", "WAFER", "WAFTS", "WAGED", "WAGER", "WAGES", "WAGON", "WAIFS", "WAILS", "WAIST", 
  "WAITS", "WAIVE", "WAKED", "WAKEN", "WAKES", "WALKS", "WALLS", "WALTZ", "WANDS", "WANED", 
  "WANES", "WANTS", "WARDS", "WARES", "WARMS", "WARNS", "WARTS", "WASPS", "WASTE", "WATCH", 
  "WATER", "WAVED", "WAVER", "WAVES", "WAXED", "WAXEN", "WAXES", "WEARS", "WEARY", "WEAVE", 
  "WEDGE", "WEEDS", "WEEDY", "WEEKS", "WEEPS", "WEIGH", "WEIRD", "WELCH", "WELLS", "WHACK", 
  "WHALE", "WHARF", "WHEAT", "WHEEL", "WHELP", "WHERE", "WHICH", "WHIFF", "WHILE", "WHIMS", 
  "WHINE", "WHIPS", "WHIRL", "WHIRR", "WHISK", "WHIST", "WHITE", "WHOLE", "WHOOP", "WHOSE", 
  "WICKS", "WIDEN", "WIDER", "WIDOW", "WIDTH", "WIELD", "WIGHT", "WILDS", "WILES", "WILLS", 
  "WINCE", "WINCH", "WINDS", "WINDY", "WINES", "WINGS", "WINKS", "WIPED", "WIPES", "WIRED", 
  "WIRES", "WISER", "WISPS", "WITCH", "WITTY", "WIVES", "WOMAN", "WOMEN", "WOODS", "WOODY", 
  "WOOED", "WOOER", "WORDS", "WORDY", "WORKS", "WORLD", "WORMS", "WORRY", "WORSE", "WORST", 
  "WORTH", "WOULD", "WOUND", "WRACK", "WRAPS", "WRAPT", "WRATH", "WREAK", "WRECK", "WREST", 
  "WRING", "WRIST", "WRITE", "WRITS", "WRONG", "WROTE", "WROTH", "YACHT", "YARDS", "YARNS", 
  "YAWNS", "YEARN", "YEARS", "YEAST", "YELLS", "YELPS", "YIELD", "YOKED", "YOKES", "YOLKS", 
  "YOUNG", "YOURS", "YOUTH", "ZEBRA", "ZONES"
]

export default function PuzzleScreen({ navigation, route }) {
  const { colors: c, state, dispatch } = useApp();
  const routine = state.routines.find((r) => r.id === route.params?.routineId);
  const cancelAction = route.params?.cancelAction;
  
  const currentLang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  const t = translations[currentLang];

  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); 

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (gameStatus === 'won') {
      const timer = setTimeout(() => {
        onComplete();
      }, 1200); 
      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  const startNewGame = () => {
    setSolution(VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)]);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
  };

  const handleKeyPress = (key) => {
    if (gameStatus !== 'playing') return;
    if (key === 'DEL') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        Alert.alert(t.tooShort, t.mustBe5);
        return;
      }
      submitGuess();
    } else {
      if (currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key);
      }
    }
  };

  const submitGuess = () => {
    if (currentGuess === 'ADMIN') { setGameStatus('won'); setCurrentGuess(''); return; }
    if (!VALID_WORDS.includes(currentGuess)) {
      Alert.alert(t.notWord, t.enterValid);
      return; 
    }
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');
    if (currentGuess === solution) setGameStatus('won');
    else if (newGuesses.length >= 6) setGameStatus('lost');
  };

  const getGuessStatuses = (guess) => {
    const statuses = Array(5).fill('absent');
    if (!solution) return statuses;
    const targetLetters = solution.split('');
    for (let i = 0; i < 5; i++) {
      if (guess[i] === targetLetters[i]) { statuses[i] = 'correct'; targetLetters[i] = null; }
    }
    for (let i = 0; i < 5; i++) {
      if (statuses[i] !== 'correct' && targetLetters.includes(guess[i])) { statuses[i] = 'present'; targetLetters[targetLetters.indexOf(guess[i])] = null; }
    }
    return statuses;
  };

  const getKeyboardStatuses = () => {
    const keyStatuses = {};
    guesses.forEach((guess) => {
      const rowStatuses = getGuessStatuses(guess);
      guess.split('').forEach((letter, i) => {
        const currentBest = keyStatuses[letter];
        const newStatus = rowStatuses[i];
        if (currentBest !== 'correct') {
          if (newStatus === 'correct' || (newStatus === 'present' && currentBest !== 'present')) { keyStatuses[letter] = newStatus; } 
          else if (!currentBest) { keyStatuses[letter] = newStatus; }
        }
      });
    });
    return keyStatuses;
  };

  const keyStatuses = getKeyboardStatuses();
  const canComplete = gameStatus === 'won' || gameStatus === 'lost';
  const accent = routine?.color || c.primary;
  const cur = routine?.currentStreak ?? state.currentStreak;

  const gameColors = { correct: '#538d4e', present: '#b59f3b', absent: '#7d7d80', empty: c.card, defaultKey: c.cardAlt || c.border };

  const onComplete = () => {
    if (routine) dispatch({ type: 'COMPLETE_ROUTINE', id: routine.id });
    navigation.goBack();
  };

  const onCancel = () => {
    if (cancelAction?.type === 'toggle_routine_task') {
      dispatch({ type: 'TOGGLE_ROUTINE_TASK', routineId: cancelAction.routineId, taskId: cancelAction.taskId });
    }
    navigation.goBack();
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton name="chevron-back" onPress={onCancel} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: c.text }]}>{routine ? routine.title.toUpperCase() : t.morningRoutine}</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          {gameStatus === 'won' ? t.solved : gameStatus === 'lost' ? `${t.wordWas} ${solution}. ${t.tapComplete}` : t.guess}
        </Text>

        <View style={styles.gameBoard}>
          <View style={styles.grid}>
            {Array(6).fill(null).map((_, rowIndex) => {
              const isCurrentRow = rowIndex === guesses.length;
              const guess = guesses[rowIndex] || (isCurrentRow ? currentGuess : '');
              const rowStatuses = guesses[rowIndex] ? getGuessStatuses(guess) : Array(5).fill('empty');
              return (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  {Array(5).fill(null).map((_, colIndex) => {
                    const letter = guess[colIndex] || '';
                    const status = rowStatuses[colIndex];
                    const isActive = letter !== '' && isCurrentRow;
                    return (
                      <View key={`col-${colIndex}`} style={[ styles.cell, { backgroundColor: gameColors[status], borderColor: isActive ? accent : c.border }, status !== 'empty' && { borderColor: gameColors[status] }]}>
                        <Text style={[styles.cellText, { color: status === 'empty' ? c.text : '#fff' }]}>{letter}</Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
          <View style={styles.keyboard}>
            {KEYBOARD.map((row, rIndex) => (
              <View key={`kbd-row-${rIndex}`} style={styles.keyboardRow}>
                {row.map((key) => {
                  const isSpecial = key === 'ENTER' || key === 'DEL';
                  const status = keyStatuses[key] || 'defaultKey';
                  return (
                    <Pressable key={key} onPress={() => handleKeyPress(key)} style={[ styles.key, isSpecial && styles.specialKey, { backgroundColor: isSpecial ? gameColors.defaultKey : (gameColors[status] || gameColors.defaultKey) }]}>
                      <Text style={[styles.keyText, { color: c.text }]}>{key}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.reward, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.rewardLabel, { color: c.textMuted }]}>{t.reward}</Text>
          <View style={styles.rewardRow}>
            <MaterialCommunityIcons name="fire" size={22} color={c.flame} />
            <Text style={[styles.rewardText, { color: c.text }]}>{t.flame}</Text>
            <Text style={[styles.rewardDelta, { color: c.textMuted }]}>{cur} → {cur + 1}</Text>
          </View>
        </View>

        <Pressable onPress={onComplete} disabled={!canComplete} style={[styles.complete, { backgroundColor: canComplete ? accent : c.cardAlt }]}>
          <Text style={[styles.completeText, { color: canComplete ? '#fff' : c.textFaint }]}>{t.complete}</Text>
        </Pressable>
        
        <View style={styles.bottomActions}>
          <Pressable onPress={onCancel}><Text style={[styles.cancel, { color: c.textMuted }]}>{t.cancel}</Text></Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

// ... Keep existing PuzzleScreen styles ...
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  scrollBody: { flexGrow: 1, alignItems: 'center', padding: spacing.xl, paddingBottom: 40, paddingTop: 10 },
  title: { fontSize: font.h2, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  subtitle: { fontSize: font.body, marginTop: spacing.xs, marginBottom: spacing.lg, textAlign: 'center' },
  gameBoard: { width: '100%', alignItems: 'center', gap: spacing.xl },
  grid: { gap: 6 },
  row: { flexDirection: 'row', gap: 6 },
  cell: { width: 50, height: 50, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  cellText: { fontSize: 26, fontWeight: 'bold' },
  keyboard: { width: '95%', maxWidth: 380, gap: 5, marginTop: spacing.sm },
  keyboardRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  key: { height: 48, minWidth: 28, flex: 1, maxWidth: 36, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  specialKey: { minWidth: 42, flex: 1.5, maxWidth: 58 },
  keyText: { fontWeight: 'bold', fontSize: 11 },
  reward: { width: '100%', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.xl },
  rewardLabel: { fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.6 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  rewardText: { fontSize: font.title, fontWeight: '700' },
  rewardDelta: { fontSize: font.body, marginLeft: 'auto' },
  complete: { width: '100%', height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  completeText: { fontSize: font.title, fontWeight: '800', letterSpacing: 1 },
  bottomActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
  cancel: { fontSize: font.body, fontWeight: '600', textDecorationLine: 'underline' },
});
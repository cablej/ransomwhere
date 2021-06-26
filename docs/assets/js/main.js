/*
	Phantom by Pixelarity
	pixelarity.com | hello@pixelarity.com
	License: pixelarity.com/license
*/

var ransomTotal = 2.51;
var dollarDisplay = true;

// var API_URL = "http://localhost:3000/dev/";

var API_URL = "https://api.ransomwhe.re/";

var numAnim = new countUp.CountUp("count", ransomTotal, {
  prefix: "$",
  decimalPlaces: 2
});

toggleDollar = () => {
  dollarDisplay = !dollarDisplay;
  numAnim = new countUp.CountUp("count", ransomTotal, {
    prefix: dollarDisplay ? "$" : "₿",
    decimalPlaces: 2
  });
  if (dollarDisplay) {
    numAnim.update(ransomTotal * bitcoinExchange);
  } else {
    numAnim.update(ransomTotal);
  }
};

updateBitcoinPrice = () => {
  if (dollarDisplay) {
    $.get("https://api.coinbase.com/v2/prices/spot?currency=USD").then(
      (res) => {
        price = res.data.amount;
        bitcoinExchange = price;
        if (dollarDisplay) {
          numAnim.update(ransomTotal * bitcoinExchange);
        } else {
          numAnim.update(ransomTotal);
        }
      }
    );
  }
};

apiRequest = (method, endpoint, body) => {
  return $.ajax({
    type: method,
    data: JSON.stringify(body),
    url: API_URL + endpoint,
    contentType: "application/json",
    dataType: "json"
  });
};

submitReport = (event) => {
  event.preventDefault();
  addresses = $("#addresses")
    .val()
    .split(/[\n,]+/);
  variant = $("#variant").val();
  amount = $("#amount").val();

  apiRequest("POST", "submit", {
    addresses,
    variant,
    amount
  })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
};

getBalances = () => {
  apiRequest("GET", "list")
    .then((res) => {
      let addresses = res.result;
      ransomTotal = 0;
      for (address of addresses) {
        ransomTotal += address.balance;
      }
      ransomTotal /= 10e7;
      updateBitcoinPrice();
      plotBalances(addresses);
    })
    .catch((err) => console.log(err));
};

plotBalances = (data) => {
  mapping = {};
  for (let address of data) {
    if (!(address.variant in mapping)) {
      mapping[address.variant] = 0;
    }
    mapping[address.variant] += address.balance / 10e7;
  }
  keyValues = [];
  for (var key in mapping) {
    keyValues.push([key, mapping[key]]);
  }
  keyValues.sort((a, b) => b[1] - a[1]);
  var ctx = document.getElementById("chart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: keyValues.map((a) => a[0]),
      datasets: [
        {
          label: "Total payments (BTC)",
          data: keyValues.map((a) => a[1]),
          backgroundColor: ["#373c70"],
          borderColor: ["#373c70"],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

(function($) {
  $("#reportForm").submit(submitReport);

  var $window = $(window),
    $body = $("body");

  setInterval(updateBitcoinPrice, 60 * 1000);

  getBalances();

  // prettier-ignore
  var variants = ["$$$ Ransomware", "010001", "0kilobypt", "16x", "24H Ransomware", "32aa", "4rw5w", "5ss5c", "777", "7ev3n", "7h9r", "7zipper", "8lock8", "AAC", "ABCLocker", "ACCDFISA v2.0", "AdamLocker", "Adhubllka", "AES_KEY_GEN_ASSIST", "AES-Matrix", "AES-NI", "AES256-06", "AESMew", "Afrodita", "AgeLocker", "Ako / MedusaReborn", "Al-Namrood", "Al-Namrood 2.0", "Alcatraz", "Alfa", "Allcry", "Alma Locker", "Alpha", "AMBA", "Amnesia", "Amnesia2", "Anatova", "AnDROid", "AngryDuck", "Annabelle 2.1", "AnteFrigus", "Anubi", "Anubis", "AnubisCrypt", "Apocalypse", "Apocalypse (New Variant)", "ApocalypseVM", "ApolloLocker", "AresCrypt", "Argus", "Aris Locker", "Armage", "ArmaLocky", "Arsium", "ASN1 Encoder", "Ataware", "Atchbo", "Aurora", "AutoLocky", "AutoWannaCryV2", "Avaddon", "AVCrypt", "Avest", "AWT", "AxCrypter", "aZaZeL", "B2DR", "Babaxed", "Babuk", "BadBlock", "BadEncript", "BadRabbit", "Bagli Wiper", "Bam!", "BananaCrypt", "BandarChor", "Banks1", "BarakaTeam", "Bart", "Bart v2.0", "Basilisque Locker", "BB Ransomware", "BeijingCrypt", "BetaSup", "BigBobRoss", "BigLock", "Bisquilla", "BitCrypt", "BitCrypt 2.0", "BitCryptor", "BitKangoroo", "Bitpaymer / DoppelPaymer", "BitPyLock", "Bitshifter", "BitStak", "BKRansomware", "Black Claw", "Black Feather", "Black Shades", "BlackHeart", "BlackKingdom", "Blackout", "BlackRuby", "Blind", "Blind 2", "Blocatto", "BlockFile12", "Blooper", "Blue Blackmail", "Bonsoir", "BoooamCrypt", "Booyah", "BrainCrypt", "Brazilian Ransomware", "Brick", "BrickR", "BTCamant", "BTCWare", "BTCWare Aleta", "BTCWare Gryphon", "BTCWare Master", "BTCWare PayDay", "Bubble", "Bucbi", "Bud", "Bug", "BugWare", "BuyUnlockCode", "c0hen Locker", "Cancer", "Cassetto", "Cerber", "Cerber 2.0", "Cerber 3.0", "Cerber 4.0 / 5.0", "CerberTear", "CheckMail7", "Chekyshka", "ChernoLocker", "Chimera", "ChinaJm", "ChinaYunLong", "ChineseRarypt", "CHIP", "ClicoCrypter", "Clop", "Clouded", "CmdRansomware", "CNHelp", "CobraLocker", "CockBlocker", "Coin Locker", "CoinVault", "Combo13 Wiper", "Comrade Circle", "Conficker", "Consciousness", "Conti", "CoronaVirus", "CorruptCrypt", "Cossy", "Coverton", "Cr1ptT0r Ransomware", "CradleCore", "CreamPie", "Creeper", "Crimson", "Cripton", "Cripton7zp", "Cry128", "Cry36", "Cry9", "Cryakl", "CryCryptor", "CryFile", "CryLocker", "CrypMic", "Crypren", "Crypt0", "Crypt0L0cker", "Crypt0r", "Crypt12", "Crypt32", "Crypt38", "Crypt3r / Ghost / Cring", "CryptConsole", "CryptConsole3", "CryptFuck", "CryptGh0st", "CryptInfinite", "CryptoDarkRubix", "CryptoDefense", "CryptoDevil", "CryptoFinancial", "CryptoFortress", "CryptoGod", "CryptoHasYou", "CryptoHitman", "CryptoJacky", "CryptoJoker", "CryptoLocker3", "CryptoLockerEU", "CryptoLocky", "CryptoLuck", "CryptoMix", "CryptoMix Revenge", "CryptoMix Wallet", "CryptON", "Crypton", "CryptoPatronum", "CryptoPokemon", "CryptorBit", "CryptoRoger", "CryptoShield", "CryptoShocker", "CryptoTorLocker", "CryptoViki", "CryptoWall 2.0", "CryptoWall 3.0", "CryptoWall 4.0", "CryptoWire", "CryptXXX", "CryptXXX 2.0", "CryptXXX 3.0", "CryptXXX 4.0", "CryPy", "CrySiS", "Crystal", "CSP Ransomware", "CTB-Faker", "CTB-Locker", "Cuba", "CXK-NMSL", "Cyborg", "Cyrat", "D00mEd", "Dablio", "Damage", "DarkoderCryptor", "DarkSide", "DataKeeper", "DavesSmith / Balaclava", "Dcrtr", "DCry", "DCry 2.0", "Deadly", "DearCry", "DeathHiddenTear", "DeathHiddenTear v2", "DeathNote", "DeathOfShadow", "DeathRansom", "DEcovid19", "Decr1pt", "DecryptIomega", "DecYourData", "DEDCryptor", "Defender", "Defray", "Defray777 / RansomEXX", "Delta", "DeriaLock", "DeroHE", "Desync", "Dharma (.cezar Family)", "Dharma (.dharma Family)", "Dharma (.onion Family)", "Dharma (.wallet Family)", "Digisom", "DilmaLocker", "DirtyDecrypt", "Dishwasher", "District", "DMA Locker", "DMA Locker 3.0", "DMA Locker 4.0", "DMALocker Imposter", "DoggeWiper", "Domino", "Done", "DoNotChange", "Donut", "DoubleLocker", "DriedSister", "DryCry", "DualShot", "Dviide", "DVPN", "DXXD", "DynA-Crypt", "eBayWall", "eCh0raix / QNAPCrypt", "ECLR Ransomware", "EdgeLocker", "EduCrypt", "EggLocker", "Egregor", "El Polocker", "Enc1", "Encrp", "EnCrypt", "EncryptedBatch", "EncrypTile", "EncryptoJJS", "Encryptor RaaS", "Enigma", "Enjey Crypter", "EnkripsiPC", "EOEO", "Epsilon", "EpsilonRed", "Erebus", "Erica Ransomware", "Eris", "Estemani", "Eternal", "Everbe", "Everbe 2.0", "Everbe 3.0", "Evil", "Executioner", "ExecutionerPlus", "Exerwa CTF", "Exocrypt XTC", "Exorcist Ransomware", "Exotic", "Extortion Scam", "Extractor", "EyeCry", "Fabiansomware", "Fadesoft", "Fantom", "FartPlz", "FCPRansomware", "FCrypt", "FCT", "FenixLocker", "FenixLocker 2.0", "Fenrir", "FilesLocker", "FindNoteFile", "FindZip", "FireCrypt", "Flamingo", "Flatcher3", "FLKR", "FlowEncrypt", "Flyper", "FonixCrypter", "FreeMe", "FrozrLock", "FRSRansomware", "FS0ciety", "FTCode", "FuckSociety", "FunFact", "FuxSocy Encryptor", "Galacti-Crypter", "GandCrab", "GandCrab v4.0 / v5.0", "GandCrab2", "GarrantyDecrypt", "GC47", "Geneve", "Gerber", "GermanWiper", "GetCrypt", "GhostCrypt", "GhostHammer", "Gibberish", "Gibon", "Gladius", "Globe", "Globe (Broken)", "Globe3", "GlobeImposter", "GlobeImposter 2.0", "GoCryptoLocker", "Godra", "GOG", "GoGoogle", "GoGoogle 2.0", "Golden Axe", "GoldenEye", "Gomasom", "Good", "Gopher", "GoRansom", "Gorgon", "Gotcha", "GPAA", "GPCode", "GPGQwerty", "GusCrypter", "GX40", "Hades", "HadesLocker", "Hakbit", "Halloware", "Hansom", "HappyDayzz", "hc6", "hc7", "HDDCryptor", "HDMR", "HE-HELP", "Heimdall", "Hello (WickrMe)", "HelloKitty", "HellsRansomware", "Help50", "HelpDCFile", "Herbst", "Hermes", "Hermes 2.0", "Hermes 2.1", "Hermes837", "Heropoint", "Hi Buddy!", "HiddenTear", "HildaCrypt", "HKCrypt", "HollyCrypt", "HolyCrypt", "HowAreYou", "HPE iLO Ransomware", "HR", "Hucky", "Hydra", "HydraCrypt", "IEncrypt", "IFN643", "ILElection2020", "Ims00ry", "ImSorry", "Incanto", "InducVirus", "InfiniteTear", "InfinityLock", "InfoDot", "InsaneCrypt", "IQ", "iRansom", "Iron", "Ironcat", "Ishtar", "Israbye", "iTunesDecrypt", "JabaCrypter", "Jack.Pot", "Jaff", "Jager", "JapanLocker", "JavaLocker", "JCrypt", "JeepersCrypt", "Jemd", "Jigsaw", "JNEC.a", "JobCrypter", "JoeGo Ransomware", "JoJoCrypter", "Jormungand", "JosepCrypt", "JSWorm", "JSWorm 2.0", "JSWorm 4.0", "JuicyLemon", "JungleSec", "Kaenlupuf", "Kali", "Karma", "Karmen", "Karo", "Kasiski", "Katyusha", "KawaiiLocker", "KCW", "Kee Ransomware", "KeRanger", "Kerkoporta", "KesLan", "KeyBTC", "KEYHolder", "KillerLocker", "KillRabbit", "KimcilWare", "Kirk", "Knot", "KokoKrypt", "Kolobo", "Kostya", "Kozy.Jozy", "Kraken", "Kraken Cryptor", "KratosCrypt", "Krider", "Kriptovor", "KryptoLocker", "Kupidon", "L33TAF Locker", "Ladon", "Lalabitch", "LambdaLocker", "LeakThemAll", "LeChiffre", "LegionLocker", "LightningCrypt", "Lilocked", "Lime", "Litra", "LittleFinger", "LLTP", "LMAOxUS", "Lock2017", "Lock2Bits", "Lock93", "LockBit", "LockBox", "LockCrypt", "LockCrypt 2.0", "LockDown", "Locked-In", "LockedByte", "LockeR", "LockerGoga", "Lockit", "LockLock", "LockMe", "Lockout", "LockTaiwan", "Locky", "Loki", "Lola", "LolKek", "LongTermMemoryLoss", "LonleyCrypt", "LooCipher", "Lortok", "Lost_Files", "LoveServer", "LowLevel04", "LuciferCrypt", "Lucky", "MadBit", "MAFIA", "MafiaWare", "Magic", "Magniber", "Major", "Makop", "Maktub Locker", "MalwareTech's CTF", "MaMoCrypter", "Maoloa", "Mapo", "Marduk", "Marlboro", "MarraCrypt", "Mars", "MarsJoke", "Matrix", "Maui", "MauriGo", "MaxiCrypt", "Maykolin", "Maysomware", "Maze Ransomware", "MCrypt2018", "MedusaLocker", "MegaCortex", "MegaLocker", "Mespinoza", "Meteoritan", "Mew767", "Mikoyan", "MindSystem", "Minotaur", "MirCop", "MireWare", "Mischa", "MMM", "MNS CryptoLocker", "Mobef", "MongoLock", "Montserrat", "MoonCrypter", "MorrisBatchCrypt", "MOTD", "MountLocker", "MoWare", "MRCR1", "MrDec", "Muhstik", "Mystic", "n1n1n1", "N3TW0RM", "NanoLocker", "NAS Data Compromiser", "NCrypt", "Nefilim", "NegozI", "Nemty", "Nemty 2.x", "Nemty Special Edition", "Nemucod", "Nemucod-7z", "Nemucod-AES", "NETCrypton", "Netix", "Netwalker (Mailto)", "NewHT", "NextCry", "Nhtnwcuf", "Nitro", "NM4", "NMoreira", "NMoreira 2.0", "Noblis", "Nomikon", "NonRansomware", "NotAHero", "Nozelesn", "NSB Ransomware", "Nuke", "NullByte", "NxRansomware", "Nyton", "ODCODC", "OhNo!", "OmniSphere", "OnyxLocker", "OoPS", "OopsLocker", "OpenToYou", "OpJerusalem", "Ordinypt", "Osno", "Ouroboros v6", "OutCrypt", "OzozaLocker", "PadCrypt", "Panther", "Paradise", "Paradise .NET", "Paradise B29", "Parasite", "Pay2Key", "Paymen45", "PayOrGrief", "PayPalGenerator2019", "PaySafeGen", "PClock", "PClock (Updated)", "PEC 2017", "Pendor", "Petna", "PewCrypt", "PewPew", "PGPSnippet", "PhantomChina", "Philadelphia", "Phobos", "PhoneNumber", "Pickles", "PL Ransomware", "Plague17", "Planetary Ransomware", "PoisonFang", "Pojie", "PonyFinal", "PopCornTime", "Potato", "Povlsomware", "PowerLocky", "PowerShell Locker", "PowerWare", "PPDDDP", "Pr0tector", "Predator", "PrincessLocker", "PrincessLocker 2.0", "PrincessLocker Evolution", "Project23", "Project34", "Project57", "ProLock", "Prometheus", "Protected Ransomware", "PshCrypt", "PUBG Ransomware", "PureLocker", "PwndLocker", "PyCL", "PyCL", "PyL33T", "PyLocky", "qkG", "Qlocker", "QP Ransomware", "QuakeWay", "Quimera Crypter", "QwertyCrypt", "Qweuirtksd", "R980", "RAA-SEP", "RabbitFox", "RabbitWare", "RackCrypt", "Radamant", "Radamant v2.1", "Radiation", "RagnarLocker", "RagnarLocker 2.0+", "Ragnarok", "Random6", "RandomLocker", "RandomRansom", "Ranion", "RanRan", "RanRans", "Rans0mLocked", "RansomCuck", "Ransomnix", "RansomPlus", "Ransomwared", "RansomWarrior", "Rapid", "Rapid 2.0 / 3.0", "RaRansomware", "RarVault", "Razy", "RCRU64", "RedBoot", "RedEye", "RedRum / Tycoon 1.0", "RegretLocker", "REKTLocker", "Rektware", "Relock", "RemindMe", "RenLocker", "RensenWare", "RetMyData", "REvil / Sodinokibi", "Reyptson", "Rhino", "RNS", "RobbinHood", "Roga", "Rokku", "Rontok", "RoshaLock", "RotorCrypt", "Roza", "RSA-NI", "RSA2048Pro", "RSAUtil", "Ruby", "RunExeMemory", "RunSomeAware", "Russenger", "Russian EDA2", "Ryuk", "SAD", "SadComputer", "Sadogo", "SADStory", "Sage 2.0", "Salsa", "SamSam", "Sanction", "Sanctions", "SantaCrypt", "Satan", "Satana", "SatanCryptor", "Saturn", "SaveTheQueen", "Scarab", "ScareCrow", "SD 1.1", "Sekhmet", "Seon", "Sepsis", "SerbRansom", "Serpent", "SFile", "ShellLocker", "Shifr", "Shigo", "ShinigamiLocker", "ShinoLocker", "ShivaGood", "ShkolotaCrypt", "Shrug", "Shrug2", "Shujin", "Shutdown57", "SifreCozucu", "Sifreli", "Sigma", "Sigrun", "SilentDeath", "SilentSpring", "Silvertor", "Simple_Encoder", "SintaLocker", "Skull Ransomware", "SkyFile", "SkyStars", "Smaug", "Smrss32", "Snake (Ekans)", "SnakeLocker", "SnapDragon", "Snatch", "SNSLocker", "SoFucked", "Solider", "Solo Ransomware", "Solve", "Somik1", "Spartacus", "SpartCrypt", "Spectre", "Spider", "SplinterJoke", "Spora", "Sport", "SQ_", "Stampado", "Stinger", "STOP (Djvu)", "STOP / KEYPASS", "StorageCrypter", "Storm", "Striked", "Stroman", "Stupid Ransomware", "Styx", "Such_Crypt", "SunCrypt", "SuperB", "SuperCrypt", "Surprise", "SynAck", "SyncCrypt", "Syrk", "SYSDOWN", "SystemCrypter", "SZFLocker", "Szymekk", "T1Happy", "TapPiF", "TaRRaK", "Team XRat", "Telecrypt", "TellYouThePass", "Termite", "TeslaCrypt 0.x", "TeslaCrypt 2.x", "TeslaCrypt 3.0", "TeslaCrypt 4.0", "Teslarvng", "TeslaWare", "TFlower", "Thanatos", "Thanos", "The DMR", "TheDarkEncryptor", "THIEFQuest", "THT Ransomware", "ThunderCrypt / Lorenz", "ThunderX", "tk", "Tongda", "Torchwood", "TotalWipeOut", "TowerWeb", "ToxCrypt", "Tripoli", "Trojan.Encoder.6491", "Troldesh / Shade", "Tron", "TrueCrypter", "TrumpLocker", "TurkStatik", "Tycoon 2.0 / 3.0", "UCCU", "UIWIX", "Ukash", "UmbreCrypt", "UnblockUPC", "Ungluk", "Unit09", "Unknown Crypted", "Unknown Lock", "Unknown XTBL", "Unlock26", "Unlock92", "Unlock92 2.0", "Unlock92 Zipper", "UnluckyWare", "Useless Disk", "UselessFiles", "UserFilesLocker", "USR0", "Uyari", "V8Locker", "Vaggen", "Vapor v1", "Vash-Sorena", "VaultCrypt", "vCrypt", "VCrypt", "Vega / Jamper / Buran", "Velso", "Vendetta", "VenisRansomware", "VenusLocker", "VHD Ransomware", "ViACrypt", "VindowsLocker", "VisionCrypt", "VMola", "VoidCrypt", "Vortex", "Vovalex", "Vurten", "VxLock", "Waffle", "Waiting", "Waldo", "WannaCash", "WannaCash 2.0", "WannaCry", "WannaCry.NET", "WannaCryFake", "WannaCryOnClick", "WannaDie", "WannaPeace", "WannaRen", "WannaScream", "WannaSmile", "WannaSpam", "WastedBit", "WastedLocker", "Wesker", "WhatAFuck", "WhiteBlackCrypt", "WhiteRose", "WildFire Locker", "WininiCrypt", "Winnix Cryptor", "WinRarer", "WinTenZZ", "WonderCrypter", "WoodRat", "Wooly", "Wulfric", "X Locker 5.0", "XCry", "XCrypt", "XData", "XerXes", "XiaoBa", "XiaoBa 2.0", "XMRLocker", "Xorist", "Xort", "XRTN", "XTP Locker 5.0", "XYZWare", "Yatron", "Yogynicof", "YouAreFucked", "YourRansom", "Yyto", "Z3", "ZariqaCrypt", "zCrypt", "Zekwacrypt", "Zenis", "Zeoticus", "Zeoticus 2.0", "Zeppelin", "ZeroCrypt", "ZeroFucks", "Zeronine", "Zeropadypt", "Zeropadypt NextGen / Ouroboros", "ZeroRansom", "Zhen", "Ziggy", "Zilla", "ZimbraCryptor", "ZinoCrypt", "ZipLocker", "Zipper", "Zoldon", "Zorab", "ZQ", "Zyklon"];
  $("#variant").autocomplete({ source: variants });

  // Breakpoints.
  breakpoints({
    xlarge: ["1281px", "1680px"],
    large: ["981px", "1280px"],
    medium: ["737px", "980px"],
    small: ["481px", "736px"],
    xsmall: ["361px", "480px"],
    xxsmall: [null, "360px"]
  });

  // Play initial animations on page load.
  $window.on("load", function() {
    window.setTimeout(function() {
      $body.removeClass("is-preload");
    }, 100);
  });

  // Touch?
  if (browser.mobile) $body.addClass("is-touch");

  // Forms.
  var $form = $("form");

  // Auto-resizing textareas.
  $form.find("textarea").each(function() {
    var $this = $(this),
      $wrapper = $('<div class="textarea-wrapper"></div>'),
      $submits = $this.find('input[type="submit"]');

    $this
      .wrap($wrapper)
      .attr("rows", 1)
      .css("overflow", "hidden")
      .css("resize", "none")
      .on("keydown", function(event) {
        if (event.keyCode == 13 && event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();

          $(this).blur();
        }
      })
      .on("blur focus", function() {
        $this.val($.trim($this.val()));
      })
      .on("input blur focus --init", function() {
        $wrapper.css("height", $this.height());

        $this
          .css("height", "auto")
          .css("height", $this.prop("scrollHeight") + "px");
      })
      .on("keyup", function(event) {
        if (event.keyCode == 9) $this.select();
      })
      .triggerHandler("--init");

    // Fix.
    if (browser.name == "ie" || browser.mobile)
      $this.css("max-height", "10em").css("overflow-y", "auto");
  });

  // Menu.
  var $menu = $("#menu");

  $menu.wrapInner('<div class="inner"></div>');

  $menu._locked = false;

  $menu._lock = function() {
    if ($menu._locked) return false;

    $menu._locked = true;

    window.setTimeout(function() {
      $menu._locked = false;
    }, 350);

    return true;
  };

  $menu._show = function() {
    if ($menu._lock()) $body.addClass("is-menu-visible");
  };

  $menu._hide = function() {
    if ($menu._lock()) $body.removeClass("is-menu-visible");
  };

  $menu._toggle = function() {
    if ($menu._lock()) $body.toggleClass("is-menu-visible");
  };

  $menu
    .appendTo($body)
    .on("click", function(event) {
      event.stopPropagation();
    })
    .on("click", "a", function(event) {
      var href = $(this).attr("href");

      event.preventDefault();
      event.stopPropagation();

      // Hide.
      $menu._hide();

      // Redirect.
      if (href == "#menu") return;

      window.setTimeout(function() {
        window.location.href = href;
      }, 350);
    })
    .append('<a class="close" href="#menu">Close</a>');

  $body
    .on("click", 'a[href="#menu"]', function(event) {
      event.stopPropagation();
      event.preventDefault();

      // Toggle.
      $menu._toggle();
    })
    .on("click", function(event) {
      // Hide.
      $menu._hide();
    })
    .on("keydown", function(event) {
      // Hide on escape.
      if (event.keyCode == 27) $menu._hide();
    });
})(jQuery);

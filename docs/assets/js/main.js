var ransomTotal = 2.51;
var dollarDisplay = true;

let table;
let transactionsTable;
let chart;
let chart2;
let transactions;
let usdTotal_;
let btcTotal_;

var numAnim = new countUp.CountUp('count', ransomTotal, {
  prefix: '$',
  decimalPlaces: 2
});

numAnim.update(91787705.66);

toggleDollar = () => {
  dollarDisplay = !dollarDisplay;
  numAnim = new countUp.CountUp('count', ransomTotal, {
    prefix: dollarDisplay ? '$' : '₿',
    decimalPlaces: 2
  });
  if (dollarDisplay) {
    numAnim.update(usdTotal_);
  } else {
    numAnim.update(btcTotal_);
  }
};

submitReport = event => {
  event.preventDefault();

  $('#formResult').html('<br><br>Submitting...');

  body = {};

  let mapping = ['payment_page_url', 'ransom_note_url'];
  numFiles = 0;
  numCompleted = 0;
  for (let i = 0; i < 2; i++) {
    if ($('input[type=file]')[i].files.length > 0) {
      numFiles += 1;
      body[mapping + ''];
      var formdata = new FormData();
      file = $('input[type=file]')[i].files[0];
      formdata.append('file', file);

      filename = Date.now() + file.name;
      body[mapping[i]] = filename;
      // apiRequest('POST', 's3', {
      //   type: file.type,
      //   name: filename
      // }).then(res => {
      $.ajax({
        url:
          'https://ransomwhere.s3.amazonaws.com/' +
          encodeURIComponent(filename),
        data: file,
        processData: false,
        contentType: file.type,
        cache: false,
        // headers: {
        //   'x-amz-acl': 'public-read'
        // },
        type: 'PUT',
        success: function(json, textStatus, jqXhr) {
          numCompleted += 1;
          if (numCompleted == numFiles) {
            sendReportRequest();
          }
        },
        error: function(jqXhr, textStatus, errorThrown) {
          alert('Error submitting, please try again.');
        }
      });
      // });
    }
  }

  if (numFiles == 0) {
    body.source = $('#sourceLink').val();
    if (body.source === '') {
      alert('Please specify at least one source.');
      $('#formResult').html('');
      return;
    }
    sendReportRequest();
  }
};

sendReportRequest = () => {
  body.addresses = $('#addresses')
    .val()
    .split(/[\n,]+/);
  body.family = $('#family').val();
  body.amount = $('#amount').val();
  body.source = $('#sourceLink').val();
  body.notes = $('#notes').val();

  apiRequest('POST', 'submit', body)
    .then(res => {
      alert('Successfully submitted!');
      $('#reportForm')[0].reset();
      $('#formResult').html('');
    })
    .catch(err => {
      alert('Error submitting, please try again.');
      console.log(err);
      $('#formResult').html('');
    });
};

getBalances = range => {
  apiRequest('GET', 'list?range=' + range)
    .then(res => {
      let { usdTotal, btcTotal, transactions, keyValues } = res;
      usdTotal_ = usdTotal;
      btcTotal_ = btcTotal;
      // plotTransactions(addresses, transactions, minimum);
      numAnim.update(usdTotal);
      plotBalances(keyValues);
      // updateTransactions(transactions);
    })
    .catch(err => console.log(err));
};

updateTransactions = transactions => {
  if (transactionsTable) transactionsTable.destroy();
  columns = [
    { title: 'Family', data: 'family', render: $.fn.dataTable.render.text() },
    { title: 'Address', data: 'address', render: $.fn.dataTable.render.text() },
    {
      title: 'Date',
      data: row => new Date(row.time * 1000).toLocaleDateString(),
      render: $.fn.dataTable.render.text(),
      type: 'date'
    },
    {
      title: 'Amount (BTC)',
      data: 'amount',
      render: $.fn.dataTable.render.text()
    },
    {
      title: 'Hash',
      data: 'hash',
      render: $.fn.dataTable.render.text()
    }
  ];
  transactionsTable = $('#transactions').DataTable({
    data: transactions,
    columns,
    lengthChange: false,
    bFilter: true,
    pageLength: 5,
    order: [[2, 'desc']]
  });
};

plotTransactions = (addresses, transactions, minimum) => {
  transactionsByFamily = {};
  for (let address of addresses) {
    if (!(address.family in transactionsByFamily)) {
      transactionsByFamily[address.family] = [];
    }
    transactionsByFamily[address.family] = transactionsByFamily[
      address.family
    ].concat(
      address.transactions
        .map(transaction => ({
          time: transaction.time,
          amount: transaction.amount / 10e7
        }))
        .filter(transaction => transaction.time > minimum)
    );
  }
  datasets = [];
  labels = [];
  for (let family of topFamilies) {
    if (!(family in transactionsByFamily)) continue;
    sorted = transactionsByFamily[family].sort((a, b) => a.time - b.time);
    data = [];
    last = 0;
    for (let tx of sorted) {
      last += tx.amount;
      labels.push(new Date(tx.time * 1000));
      data.push({
        x: new Date(tx.time * 1000),
        y: last
      });
    }
    labels.push(new Date());
    data.push({
      x: new Date(),
      y: last
    });
    datasets.push({
      label: family,
      fill: false,
      fillColor: 'rgba(0,0,0,0)',
      strokeColor: 'rgba(220,220,220,1)',
      pointColor: 'rgba(200,122,20,1)',
      data: data
    });
  }
  // labels = ['2020 Q1', '2020 Q2', '2020 Q3', '2020 Q4', '2021 Q1', '2021 Q2'];
  // labels = transactions.map(transaction => new Date(transaction.time * 1000));
  // transactions.sort((a, b) => b.time - a.time);
  var ctx = document.getElementById('chart2').getContext('2d');
  if (chart2) {
    chart2.destroy();
  }
  chart2 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: {
          beginAtZero: true
        },
        xAxes: [
          {
            type: 'time',
            time: {
              // parser: 'X',
              unit: 'day',
              displayFormats: {
                millisecond: 'MMM DD',
                second: 'MMM DD',
                minute: 'MMM DD',
                hour: 'MMM DD',
                day: 'MMM DD',
                week: 'MMM DD',
                month: 'MMM DD',
                quarter: 'MMM DD',
                year: 'MMM DD'
              }
            },
            ticks: {
              source: 'data'
            }
          }
        ]
      }
    }
  });
};

plotBalances = keyValues => {
  var ctx = document.getElementById('chart').getContext('2d');
  if (chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: keyValues.map(a => a[0]),
      datasets: [
        {
          label: 'Total payments (USD)',
          data: keyValues.map(a => a[1]),
          backgroundColor: ['#373c70'],
          borderColor: ['#373c70'],
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

downloadFile = () => {
  apiRequest('GET', 'export')
    .then(res => {
      $('<a />', {
        download: 'data.json',
        href:
          'data:application/json,' +
          encodeURIComponent(JSON.stringify(res.result))
      })
        .appendTo('body')
        .click(function() {
          $(this).remove();
        })[0]
        .click();
    })
    .catch(err => console.log(err));
};

(function($) {
  $('#reportForm').submit(submitReport);

  var isFirst = true;

  $('.time-select')
    .change(function(e) {
      if (isFirst) {
        isFirst = false;
        return;
      }
      $('.time-select').val(this.value);
      getBalances($('.time-select').val());
    })
    .change();

  getReports('accepted', false);

  // prettier-ignore
  var families = ["$$$ Ransomware", "010001", "0kilobypt", "16x", "24H Ransomware", "32aa", "4rw5w", "5ss5c", "777", "7ev3n", "7h9r", "7zipper", "8lock8", "AAC", "ABCLocker", "ACCDFISA v2.0", "AdamLocker", "Adhubllka", "AES_KEY_GEN_ASSIST", "AES-Matrix", "AES-NI", "AES256-06", "AESMew", "Afrodita", "AgeLocker", "Ako / MedusaReborn", "Al-Namrood", "Al-Namrood 2.0", "Alcatraz", "Alfa", "Allcry", "Alma Locker", "Alpha", "AMBA", "Amnesia", "Amnesia2", "Anatova", "AnDROid", "AngryDuck", "Annabelle 2.1", "AnteFrigus", "Anubi", "Anubis", "AnubisCrypt", "Apocalypse", "Apocalypse (New Family)", "ApocalypseVM", "ApolloLocker", "AresCrypt", "Argus", "Aris Locker", "Armage", "ArmaLocky", "Arsium", "ASN1 Encoder", "Ataware", "Atchbo", "Aurora", "AutoLocky", "AutoWannaCryV2", "Avaddon", "AVCrypt", "Avest", "AWT", "AxCrypter", "aZaZeL", "B2DR", "Babaxed", "Babuk", "BadBlock", "BadEncript", "BadRabbit", "Bagli Wiper", "Bam!", "BananaCrypt", "BandarChor", "Banks1", "BarakaTeam", "Bart", "Bart v2.0", "Basilisque Locker", "BB Ransomware", "BeijingCrypt", "BetaSup", "BigBobRoss", "BigLock", "Bisquilla", "BitCrypt", "BitCrypt 2.0", "BitCryptor", "BitKangoroo", "Bitpaymer / DoppelPaymer", "BitPyLock", "Bitshifter", "BitStak", "BKRansomware", "Black Claw", "Black Feather", "Black Shades", "BlackHeart", "BlackKingdom", "Blackout", "BlackRuby", "Blind", "Blind 2", "Blocatto", "BlockFile12", "Blooper", "Blue Blackmail", "Bonsoir", "BoooamCrypt", "Booyah", "BrainCrypt", "Brazilian Ransomware", "Brick", "BrickR", "BTCamant", "BTCWare", "BTCWare Aleta", "BTCWare Gryphon", "BTCWare Master", "BTCWare PayDay", "Bubble", "Bucbi", "Bud", "Bug", "BugWare", "BuyUnlockCode", "c0hen Locker", "Cancer", "Cassetto", "Cerber", "Cerber 2.0", "Cerber 3.0", "Cerber 4.0 / 5.0", "CerberTear", "CheckMail7", "Chekyshka", "ChernoLocker", "Chimera", "ChinaJm", "ChinaYunLong", "ChineseRarypt", "CHIP", "ClicoCrypter", "Clop", "Clouded", "CmdRansomware", "CNHelp", "CobraLocker", "CockBlocker", "Coin Locker", "CoinVault", "Combo13 Wiper", "Comrade Circle", "Conficker", "Consciousness", "Conti", "CoronaVirus", "CorruptCrypt", "Cossy", "Coverton", "Cr1ptT0r Ransomware", "CradleCore", "CreamPie", "Creeper", "Crimson", "Cripton", "Cripton7zp", "Cry128", "Cry36", "Cry9", "Cryakl", "CryCryptor", "CryFile", "CryLocker", "CrypMic", "Crypren", "Crypt0", "Crypt0L0cker", "Crypt0r", "Crypt12", "Crypt32", "Crypt38", "Crypt3r / Ghost / Cring", "CryptConsole", "CryptConsole3", "CryptFuck", "CryptGh0st", "CryptInfinite", "CryptoDarkRubix", "CryptoDefense", "CryptoDevil", "CryptoFinancial", "CryptoFortress", "CryptoGod", "CryptoHasYou", "CryptoHitman", "CryptoJacky", "CryptoJoker", "CryptoLocker3", "CryptoLockerEU", "CryptoLocky", "CryptoLuck", "CryptoMix", "CryptoMix Revenge", "CryptoMix Wallet", "CryptON", "Crypton", "CryptoPatronum", "CryptoPokemon", "CryptorBit", "CryptoRoger", "CryptoShield", "CryptoShocker", "CryptoTorLocker", "CryptoViki", "CryptoWall 2.0", "CryptoWall 3.0", "CryptoWall 4.0", "CryptoWire", "CryptXXX", "CryptXXX 2.0", "CryptXXX 3.0", "CryptXXX 4.0", "CryPy", "CrySiS", "Crystal", "CSP Ransomware", "CTB-Faker", "CTB-Locker", "Cuba", "CXK-NMSL", "Cyborg", "Cyrat", "D00mEd", "Dablio", "Damage", "DarkoderCryptor", "DarkSide", "DataKeeper", "DavesSmith / Balaclava", "Dcrtr", "DCry", "DCry 2.0", "Deadly", "DearCry", "DeathHiddenTear", "DeathHiddenTear v2", "DeathNote", "DeathOfShadow", "DeathRansom", "DEcovid19", "Decr1pt", "DecryptIomega", "DecYourData", "DEDCryptor", "Defender", "Defray", "Defray777 / RansomEXX", "Delta", "DeriaLock", "DeroHE", "Desync", "Dharma (.cezar Family)", "Dharma (.dharma Family)", "Dharma (.onion Family)", "Dharma (.wallet Family)", "Digisom", "DilmaLocker", "DirtyDecrypt", "Dishwasher", "District", "DMA Locker", "DMA Locker 3.0", "DMA Locker 4.0", "DMALocker Imposter", "DoggeWiper", "Domino", "Done", "DoNotChange", "Donut", "DoubleLocker", "DriedSister", "DryCry", "DualShot", "Dviide", "DVPN", "DXXD", "DynA-Crypt", "eBayWall", "eCh0raix / QNAPCrypt", "ECLR Ransomware", "EdgeLocker", "EduCrypt", "EggLocker", "Egregor", "El Polocker", "Enc1", "Encrp", "EnCrypt", "EncryptedBatch", "EncrypTile", "EncryptoJJS", "Encryptor RaaS", "Enigma", "Enjey Crypter", "EnkripsiPC", "EOEO", "Epsilon", "EpsilonRed", "Erebus", "Erica Ransomware", "Eris", "Estemani", "Eternal", "Everbe", "Everbe 2.0", "Everbe 3.0", "Evil", "Executioner", "ExecutionerPlus", "Exerwa CTF", "Exocrypt XTC", "Exorcist Ransomware", "Exotic", "Extortion Scam", "Extractor", "EyeCry", "Fabiansomware", "Fadesoft", "Fantom", "FartPlz", "FCPRansomware", "FCrypt", "FCT", "FenixLocker", "FenixLocker 2.0", "Fenrir", "FilesLocker", "FindNoteFile", "FindZip", "FireCrypt", "Flamingo", "Flatcher3", "FLKR", "FlowEncrypt", "Flyper", "FonixCrypter", "FreeMe", "FrozrLock", "FRSRansomware", "FS0ciety", "FTCode", "FuckSociety", "FunFact", "FuxSocy Encryptor", "Galacti-Crypter", "GandCrab", "GandCrab v4.0 / v5.0", "GandCrab2", "GarrantyDecrypt", "GC47", "Geneve", "Gerber", "GermanWiper", "GetCrypt", "GhostCrypt", "GhostHammer", "Gibberish", "Gibon", "Gladius", "Globe", "Globe (Broken)", "Globe3", "GlobeImposter", "GlobeImposter 2.0", "GoCryptoLocker", "Godra", "GOG", "GoGoogle", "GoGoogle 2.0", "Golden Axe", "GoldenEye", "Gomasom", "Good", "Gopher", "GoRansom", "Gorgon", "Gotcha", "GPAA", "GPCode", "GPGQwerty", "GusCrypter", "GX40", "Hades", "HadesLocker", "Hakbit", "Halloware", "Hansom", "HappyDayzz", "hc6", "hc7", "HDDCryptor", "HDMR", "HE-HELP", "Heimdall", "Hello (WickrMe)", "HelloKitty", "HellsRansomware", "Help50", "HelpDCFile", "Herbst", "Hermes", "Hermes 2.0", "Hermes 2.1", "Hermes837", "Heropoint", "Hi Buddy!", "HiddenTear", "HildaCrypt", "HKCrypt", "HollyCrypt", "HolyCrypt", "HowAreYou", "HPE iLO Ransomware", "HR", "Hucky", "Hydra", "HydraCrypt", "IEncrypt", "IFN643", "ILElection2020", "Ims00ry", "ImSorry", "Incanto", "InducVirus", "InfiniteTear", "InfinityLock", "InfoDot", "InsaneCrypt", "IQ", "iRansom", "Iron", "Ironcat", "Ishtar", "Israbye", "iTunesDecrypt", "JabaCrypter", "Jack.Pot", "Jaff", "Jager", "JapanLocker", "JavaLocker", "JCrypt", "JeepersCrypt", "Jemd", "Jigsaw", "JNEC.a", "JobCrypter", "JoeGo Ransomware", "JoJoCrypter", "Jormungand", "JosepCrypt", "JSWorm", "JSWorm 2.0", "JSWorm 4.0", "JuicyLemon", "JungleSec", "Kaenlupuf", "Kali", "Karma", "Karmen", "Karo", "Kasiski", "Katyusha", "KawaiiLocker", "KCW", "Kee Ransomware", "KeRanger", "Kerkoporta", "KesLan", "KeyBTC", "KEYHolder", "KillerLocker", "KillRabbit", "KimcilWare", "Kirk", "Knot", "KokoKrypt", "Kolobo", "Kostya", "Kozy.Jozy", "Kraken", "Kraken Cryptor", "KratosCrypt", "Krider", "Kriptovor", "KryptoLocker", "Kupidon", "L33TAF Locker", "Ladon", "Lalabitch", "LambdaLocker", "LeakThemAll", "LeChiffre", "LegionLocker", "LightningCrypt", "Lilocked", "Lime", "Litra", "LittleFinger", "LLTP", "LMAOxUS", "Lock2017", "Lock2Bits", "Lock93", "LockBit", "LockBox", "LockCrypt", "LockCrypt 2.0", "LockDown", "Locked-In", "LockedByte", "LockeR", "LockerGoga", "Lockit", "LockLock", "LockMe", "Lockout", "LockTaiwan", "Locky", "Loki", "Lola", "LolKek", "LongTermMemoryLoss", "LonleyCrypt", "LooCipher", "Lortok", "Lost_Files", "LoveServer", "LowLevel04", "LuciferCrypt", "Lucky", "MadBit", "MAFIA", "MafiaWare", "Magic", "Magniber", "Major", "Makop", "Maktub Locker", "MalwareTech's CTF", "MaMoCrypter", "Maoloa", "Mapo", "Marduk", "Marlboro", "MarraCrypt", "Mars", "MarsJoke", "Matrix", "Maui", "MauriGo", "MaxiCrypt", "Maykolin", "Maysomware", "Maze Ransomware", "MCrypt2018", "MedusaLocker", "MegaCortex", "MegaLocker", "Mespinoza", "Meteoritan", "Mew767", "Mikoyan", "MindSystem", "Minotaur", "MirCop", "MireWare", "Mischa", "MMM", "MNS CryptoLocker", "Mobef", "MongoLock", "Montserrat", "MoonCrypter", "MorrisBatchCrypt", "MOTD", "MountLocker", "MoWare", "MRCR1", "MrDec", "Muhstik", "Mystic", "n1n1n1", "N3TW0RM", "NanoLocker", "NAS Data Compromiser", "NCrypt", "Nefilim", "NegozI", "Nemty", "Nemty 2.x", "Nemty Special Edition", "Nemucod", "Nemucod-7z", "Nemucod-AES", "NETCrypton", "Netix", "Netwalker (Mailto)", "NewHT", "NextCry", "Nhtnwcuf", "Nitro", "NM4", "NMoreira", "NMoreira 2.0", "Noblis", "Nomikon", "NonRansomware", "NotAHero", "Nozelesn", "NSB Ransomware", "Nuke", "NullByte", "NxRansomware", "Nyton", "ODCODC", "OhNo!", "OmniSphere", "OnyxLocker", "OoPS", "OopsLocker", "OpenToYou", "OpJerusalem", "Ordinypt", "Osno", "Ouroboros v6", "OutCrypt", "OzozaLocker", "PadCrypt", "Panther", "Paradise", "Paradise .NET", "Paradise B29", "Parasite", "Pay2Key", "Paymen45", "PayOrGrief", "PayPalGenerator2019", "PaySafeGen", "PClock", "PClock (Updated)", "PEC 2017", "Pendor", "Petna", "PewCrypt", "PewPew", "PGPSnippet", "PhantomChina", "Philadelphia", "Phobos", "PhoneNumber", "Pickles", "PL Ransomware", "Plague17", "Planetary Ransomware", "PoisonFang", "Pojie", "PonyFinal", "PopCornTime", "Potato", "Povlsomware", "PowerLocky", "PowerShell Locker", "PowerWare", "PPDDDP", "Pr0tector", "Predator", "PrincessLocker", "PrincessLocker 2.0", "PrincessLocker Evolution", "Project23", "Project34", "Project57", "ProLock", "Prometheus", "Protected Ransomware", "PshCrypt", "PUBG Ransomware", "PureLocker", "PwndLocker", "PyCL", "PyCL", "PyL33T", "PyLocky", "qkG", "Qlocker", "QP Ransomware", "QuakeWay", "Quimera Crypter", "QwertyCrypt", "Qweuirtksd", "R980", "RAA-SEP", "RabbitFox", "RabbitWare", "RackCrypt", "Radamant", "Radamant v2.1", "Radiation", "RagnarLocker", "RagnarLocker 2.0+", "Ragnarok", "Random6", "RandomLocker", "RandomRansom", "Ranion", "RanRan", "RanRans", "Rans0mLocked", "RansomCuck", "Ransomnix", "RansomPlus", "Ransomwared", "RansomWarrior", "Rapid", "Rapid 2.0 / 3.0", "RaRansomware", "RarVault", "Razy", "RCRU64", "RedBoot", "RedEye", "RedRum / Tycoon 1.0", "RegretLocker", "REKTLocker", "Rektware", "Relock", "RemindMe", "RenLocker", "RensenWare", "RetMyData", "REvil / Sodinokibi", "Reyptson", "Rhino", "RNS", "RobbinHood", "Roga", "Rokku", "Rontok", "RoshaLock", "RotorCrypt", "Roza", "RSA-NI", "RSA2048Pro", "RSAUtil", "Ruby", "RunExeMemory", "RunSomeAware", "Russenger", "Russian EDA2", "Ryuk", "SAD", "SadComputer", "Sadogo", "SADStory", "Sage 2.0", "Salsa", "SamSam", "Sanction", "Sanctions", "SantaCrypt", "Satan", "Satana", "SatanCryptor", "Saturn", "SaveTheQueen", "Scarab", "ScareCrow", "SD 1.1", "Sekhmet", "Seon", "Sepsis", "SerbRansom", "Serpent", "SFile", "ShellLocker", "Shifr", "Shigo", "ShinigamiLocker", "ShinoLocker", "ShivaGood", "ShkolotaCrypt", "Shrug", "Shrug2", "Shujin", "Shutdown57", "SifreCozucu", "Sifreli", "Sigma", "Sigrun", "SilentDeath", "SilentSpring", "Silvertor", "Simple_Encoder", "SintaLocker", "Skull Ransomware", "SkyFile", "SkyStars", "Smaug", "Smrss32", "Snake (Ekans)", "SnakeLocker", "SnapDragon", "Snatch", "SNSLocker", "SoFucked", "Solider", "Solo Ransomware", "Solve", "Somik1", "Spartacus", "SpartCrypt", "Spectre", "Spider", "SplinterJoke", "Spora", "Sport", "SQ_", "Stampado", "Stinger", "STOP (Djvu)", "STOP / KEYPASS", "StorageCrypter", "Storm", "Striked", "Stroman", "Stupid Ransomware", "Styx", "Such_Crypt", "SunCrypt", "SuperB", "SuperCrypt", "Surprise", "SynAck", "SyncCrypt", "Syrk", "SYSDOWN", "SystemCrypter", "SZFLocker", "Szymekk", "T1Happy", "TapPiF", "TaRRaK", "Team XRat", "Telecrypt", "TellYouThePass", "Termite", "TeslaCrypt 0.x", "TeslaCrypt 2.x", "TeslaCrypt 3.0", "TeslaCrypt 4.0", "Teslarvng", "TeslaWare", "TFlower", "Thanatos", "Thanos", "The DMR", "TheDarkEncryptor", "THIEFQuest", "THT Ransomware", "ThunderCrypt / Lorenz", "ThunderX", "tk", "Tongda", "Torchwood", "TotalWipeOut", "TowerWeb", "ToxCrypt", "Tripoli", "Trojan.Encoder.6491", "Troldesh / Shade", "Tron", "TrueCrypter", "TrumpLocker", "TurkStatik", "Tycoon 2.0 / 3.0", "UCCU", "UIWIX", "Ukash", "UmbreCrypt", "UnblockUPC", "Ungluk", "Unit09", "Unknown Crypted", "Unknown Lock", "Unknown XTBL", "Unlock26", "Unlock92", "Unlock92 2.0", "Unlock92 Zipper", "UnluckyWare", "Useless Disk", "UselessFiles", "UserFilesLocker", "USR0", "Uyari", "V8Locker", "Vaggen", "Vapor v1", "Vash-Sorena", "VaultCrypt", "vCrypt", "VCrypt", "Vega / Jamper / Buran", "Velso", "Vendetta", "VenisRansomware", "VenusLocker", "VHD Ransomware", "ViACrypt", "VindowsLocker", "VisionCrypt", "VMola", "VoidCrypt", "Vortex", "Vovalex", "Vurten", "VxLock", "Waffle", "Waiting", "Waldo", "WannaCash", "WannaCash 2.0", "WannaCry", "WannaCry.NET", "WannaCryFake", "WannaCryOnClick", "WannaDie", "WannaPeace", "WannaRen", "WannaScream", "WannaSmile", "WannaSpam", "WastedBit", "WastedLocker", "Wesker", "WhatAFuck", "WhiteBlackCrypt", "WhiteRose", "WildFire Locker", "WininiCrypt", "Winnix Cryptor", "WinRarer", "WinTenZZ", "WonderCrypter", "WoodRat", "Wooly", "Wulfric", "X Locker 5.0", "XCry", "XCrypt", "XData", "XerXes", "XiaoBa", "XiaoBa 2.0", "XMRLocker", "Xorist", "Xort", "XRTN", "XTP Locker 5.0", "XYZWare", "Yatron", "Yogynicof", "YouAreFucked", "YourRansom", "Yyto", "Z3", "ZariqaCrypt", "zCrypt", "Zekwacrypt", "Zenis", "Zeoticus", "Zeoticus 2.0", "Zeppelin", "ZeroCrypt", "ZeroFucks", "Zeronine", "Zeropadypt", "Zeropadypt NextGen / Ouroboros", "ZeroRansom", "Zhen", "Ziggy", "Zilla", "ZimbraCryptor", "ZinoCrypt", "ZipLocker", "Zipper", "Zoldon", "Zorab", "ZQ", "Zyklon"];
  $('#family').autocomplete({ source: families });
})(jQuery);

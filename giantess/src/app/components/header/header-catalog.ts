export type HeaderCatalogItem = {
  name: string;
  slug: string;
};

export type HeaderCatalogSection = {
  title: string;
  slug: string;
  items: HeaderCatalogItem[];
};

export type HeaderCatalogCategory = {
  id: string;
  name: string;
  sections: HeaderCatalogSection[];
};

export const HEADER_CATEGORIES: HeaderCatalogCategory[] = [
  {
    "id": "motorola-zebra",
    "name": "Motorola Zebra",
    "sections": [
      {
        "title": "Mobile Computers",
        "slug": "mobile-computers",
        "items": [
          {
            "name": "MC30",
            "slug": "mc30"
          },
          {
            "name": "EC50 / EC55",
            "slug": "ec50-ec55"
          },
          {
            "name": "MC9500 Series",
            "slug": "mc9500-mc9590-mc9596-mc9598"
          },
          {
            "name": "MC9400 / MC9450",
            "slug": "mc9400-mc9450"
          },
          {
            "name": "MC9300 / MC930B / MC930P",
            "slug": "mc9300-mc930b-mc930p"
          },
          {
            "name": "MC9200 / MC92N0",
            "slug": "mc9200-mc92n0"
          },
          {
            "name": "MC9060",
            "slug": "mc9060"
          },
          {
            "name": "MC9000",
            "slug": "mc9000"
          },
          {
            "name": "MC3400 (MC3401) / MC3450 (MC345)",
            "slug": "mc3400-mc3401-mc3450-mc345"
          },
          {
            "name": "MC3300 / MC333 / MC330K / MC330M",
            "slug": "mc3300-mc333-mc330k-mc330m"
          },
          {
            "name": "MC32N0",
            "slug": "mc32n0"
          },
          {
            "name": "MC3100-R/S / MC3190-R/S",
            "slug": "mc3100-r-s-mc3190-r-s"
          },
          {
            "name": "MC3190-G / MC3190-Z RFID",
            "slug": "mc3190-g-mc3190-z-rfid"
          },
          {
            "name": "MC3000 / MC3070 / MC3090",
            "slug": "mc3000-mc3070-mc3090"
          },
          {
            "name": "MC2700",
            "slug": "mc2700"
          },
          {
            "name": "MC2200",
            "slug": "mc2200"
          },
          {
            "name": "MC2100 / MC2180",
            "slug": "mc2100-mc2180"
          },
          {
            "name": "MC70 / MC75 / MC75A",
            "slug": "mc70-mc75-mc75a"
          },
          {
            "name": "MC67",
            "slug": "mc67"
          },
          {
            "name": "MC65",
            "slug": "mc65"
          },
          {
            "name": "MC55X / MC55E0",
            "slug": "mc55x-mc55e0"
          },
          {
            "name": "MC55A / MC55A0 / MC55N0",
            "slug": "mc55a-mc55a0-mc55n0"
          },
          {
            "name": "MC55",
            "slug": "mc55"
          },
          {
            "name": "MC40",
            "slug": "mc40"
          },
          {
            "name": "MC36",
            "slug": "mc36"
          },
          {
            "name": "MC18",
            "slug": "mc18"
          },
          {
            "name": "PS20J",
            "slug": "ps20j"
          },
          {
            "name": "PS30",
            "slug": "ps30"
          },
          {
            "name": "TC8300 / TC83B0",
            "slug": "tc8300-tc83b0"
          },
          {
            "name": "TC8000 / TC80N0",
            "slug": "tc8000-tc80n0"
          },
          {
            "name": "TC78",
            "slug": "tc78"
          },
          {
            "name": "TC75 / TC75X",
            "slug": "tc75-tc75x"
          },
          {
            "name": "TC77 / TC72",
            "slug": "tc77-tc72"
          },
          {
            "name": "TC70 / TC70X",
            "slug": "tc70-tc70x"
          },
          {
            "name": "TC58",
            "slug": "tc58"
          },
          {
            "name": "TC58e",
            "slug": "tc58e"
          },
          {
            "name": "TC57",
            "slug": "tc57"
          },
          {
            "name": "TC57X",
            "slug": "tc57x"
          },
          {
            "name": "TC56",
            "slug": "tc56"
          },
          {
            "name": "TC55",
            "slug": "tc55"
          },
          {
            "name": "TC53",
            "slug": "tc53"
          },
          {
            "name": "TC52 (TC520K-1P) (TC520K-1H)",
            "slug": "tc52-tc520k-1p-tc520k-1h"
          },
          {
            "name": "TC52X / TC52AX / TC520K-1X",
            "slug": "tc52x-tc52ax-tc520k-1x"
          },
          {
            "name": "TC520L",
            "slug": "tc520l"
          },
          {
            "name": "TC51",
            "slug": "tc51"
          },
          {
            "name": "TC27",
            "slug": "tc27"
          },
          {
            "name": "TC25",
            "slug": "tc25"
          },
          {
            "name": "TC22",
            "slug": "tc22"
          },
          {
            "name": "TC21 / TC26",
            "slug": "tc21-tc26"
          },
          {
            "name": "TC20",
            "slug": "tc20"
          },
          {
            "name": "MC9190",
            "slug": "mc9190"
          },
          {
            "name": "MC9090",
            "slug": "mc9090"
          },
          {
            "name": "EC30",
            "slug": "ec30"
          },
          {
            "name": "MC32N0-R / S",
            "slug": "mc32n0-r"
          },
          {
            "name": "MC75",
            "slug": "mc75"
          },
          {
            "name": "MC75A",
            "slug": "mc75a"
          },
          {
            "name": "MC3000 / MC3070",
            "slug": "mc3000-mc3070"
          },
          {
            "name": "MC3090",
            "slug": "mc3090"
          },
          {
            "name": "MC3300X(MC330L) MC33ax(MC330X)",
            "slug": "mc3300x"
          },
          {
            "name": "MC9090-G",
            "slug": "mc9090-g"
          },
          {
            "name": "MC9090-K MC9094-K",
            "slug": "mc9090-k"
          },
          {
            "name": "MC9090-S MC9094-S MC9097",
            "slug": "mc9090-s"
          },
          {
            "name": "MC9090-Z RFID",
            "slug": "mc9090-z"
          },
          {
            "name": "MC9190-G",
            "slug": "mc9190-g"
          },
          {
            "name": "MC9190-Z RFID",
            "slug": "mc9190-z-rfid"
          },
          {
            "name": "TC52X TC52AX TC520K-1X TC520L",
            "slug": "tc52x"
          },
          {
            "name": "TC73",
            "slug": "tc73"
          }
        ]
      },
      {
        "title": "Barcode Scanners",
        "slug": "barcode-scanners",
        "items": [
          {
            "name": "LS4278 / LS4208",
            "slug": "ls4278-ls4208"
          },
          {
            "name": "LS3578 / LS3478",
            "slug": "ls3578-ls3478"
          },
          {
            "name": "LS3408-ER / FZ",
            "slug": "ls3408-er-fz"
          },
          {
            "name": "LS3008",
            "slug": "ls3008"
          },
          {
            "name": "LS2208",
            "slug": "ls2208"
          },
          {
            "name": "LI3608-SR / ER",
            "slug": "li3608-sr-er"
          },
          {
            "name": "LI3678",
            "slug": "li3678"
          },
          {
            "name": "LI4278",
            "slug": "li4278"
          },
          {
            "name": "DS9908",
            "slug": "ds9908"
          },
          {
            "name": "DS9808",
            "slug": "ds9808"
          },
          {
            "name": "DS9208",
            "slug": "ds9208"
          },
          {
            "name": "DS8178",
            "slug": "ds8178"
          },
          {
            "name": "DS6878",
            "slug": "ds6878"
          },
          {
            "name": "DS6707 / DS6708",
            "slug": "ds6707-ds6708"
          },
          {
            "name": "DS4208",
            "slug": "ds4208"
          },
          {
            "name": "DS3608",
            "slug": "ds3608"
          },
          {
            "name": "DS3678",
            "slug": "ds3678"
          },
          {
            "name": "DS3578",
            "slug": "ds3578"
          },
          {
            "name": "DS3508",
            "slug": "ds3508"
          },
          {
            "name": "DS3478",
            "slug": "ds3478"
          },
          {
            "name": "DS3407 / DS3408",
            "slug": "ds3407-ds3408"
          },
          {
            "name": "DS3678-KD",
            "slug": "ds3678-kd"
          },
          {
            "name": "MT2070/MT2090",
            "slug": "mt2070-mt2090"
          }
        ]
      },
      {
        "title": "Printers",
        "slug": "printers",
        "items": [
          {
            "name": "ZR628",
            "slug": "zr628"
          },
          {
            "name": "ZE511",
            "slug": "ze511"
          },
          {
            "name": "ZE521",
            "slug": "ze521"
          },
          {
            "name": "ZT421",
            "slug": "zt421"
          },
          {
            "name": "ZT420",
            "slug": "zt420"
          },
          {
            "name": "ZT620",
            "slug": "zt620"
          },
          {
            "name": "170PAX4",
            "slug": "170pax4"
          },
          {
            "name": "QLN220",
            "slug": "qln220"
          },
          {
            "name": "QLN320",
            "slug": "qln320"
          },
          {
            "name": "QLN420",
            "slug": "qln420"
          },
          {
            "name": "RW220",
            "slug": "rw220"
          },
          {
            "name": "RW420",
            "slug": "rw420"
          },
          {
            "name": "ZQ520",
            "slug": "zq520"
          },
          {
            "name": "ZQ521",
            "slug": "zq521"
          },
          {
            "name": "ZQ610",
            "slug": "zq610"
          },
          {
            "name": "ZQ620",
            "slug": "zq620"
          },
          {
            "name": "ZQ630",
            "slug": "zq630"
          },
          {
            "name": "ZQ630 Plus",
            "slug": "zq630-plus"
          },
          {
            "name": "ZR138",
            "slug": "zr138"
          },
          {
            "name": "ZR318",
            "slug": "zr318"
          },
          {
            "name": "ZR328",
            "slug": "zr328"
          },
          {
            "name": "ZR338",
            "slug": "zr338"
          },
          {
            "name": "LP 2824",
            "slug": "lp-2824"
          },
          {
            "name": "LP 2844",
            "slug": "lp-2844"
          },
          {
            "name": "GK420D GX420D",
            "slug": "gk420d"
          },
          {
            "name": "GK420T GX420T GX430T",
            "slug": "gk420t"
          },
          {
            "name": "GK888T",
            "slug": "gk88t"
          },
          {
            "name": "GT800 / GT810 / GT820 / GT830",
            "slug": "gt800"
          },
          {
            "name": "ZD220D ZD230D",
            "slug": "zd220d"
          },
          {
            "name": "ZD888",
            "slug": "zd88"
          },
          {
            "name": "ZD620",
            "slug": "zd620"
          },
          {
            "name": "ZD500",
            "slug": "zd500"
          },
          {
            "name": "ZD621",
            "slug": "zd621"
          },
          {
            "name": "ZD421",
            "slug": "zd421"
          },
          {
            "name": "ZD420",
            "slug": "zd420"
          },
          {
            "name": "ZD410",
            "slug": "zd410"
          },
          {
            "name": "105SL ,105SLplus",
            "slug": "105sl"
          },
          {
            "name": "220XI4",
            "slug": "220xi4"
          },
          {
            "name": "110PAX3 110PAX4",
            "slug": "110pax3"
          },
          {
            "name": "110Xi3, 110Xi3 PLUS",
            "slug": "110xi3"
          },
          {
            "name": "110Xi4, 110XiIII Plus",
            "slug": "110xi4"
          },
          {
            "name": "140Xi4, 140XiII, 140XiIII",
            "slug": "140xi4"
          },
          {
            "name": "170XI4 170XI3+",
            "slug": "170xi4"
          },
          {
            "name": "ZM600",
            "slug": "zm600"
          },
          {
            "name": "Z4M Z4Mplus",
            "slug": "z4m"
          },
          {
            "name": "Z6M, Z6M Plus",
            "slug": "z6m"
          },
          {
            "name": "ZE500",
            "slug": "ze500"
          },
          {
            "name": "ZM400",
            "slug": "zm400"
          },
          {
            "name": "ZT211 ZT231",
            "slug": "zt211"
          },
          {
            "name": "ZT410",
            "slug": "zt410"
          }
        ]
      },
      {
        "title": "Wearable Computers",
        "slug": "wearable-computers",
        "items": [
          {
            "name": "RS6100",
            "slug": "rs6100"
          },
          {
            "name": "RS6000 RS6080",
            "slug": "rs6000-rs6080"
          },
          {
            "name": "RS5100",
            "slug": "rs5100"
          },
          {
            "name": "RS5000",
            "slug": "rs5000"
          },
          {
            "name": "RS4000",
            "slug": "rs4000"
          },
          {
            "name": "RS507 RS507X",
            "slug": "rs507-rs507x"
          },
          {
            "name": "RS409 RS419",
            "slug": "rs409-rs419"
          },
          {
            "name": "RS309",
            "slug": "rs309"
          },
          {
            "name": "WS50",
            "slug": "ws50"
          },
          {
            "name": "WT6400 WT64B",
            "slug": "wt6400-wt64b"
          },
          {
            "name": "WT6300 WT63B0",
            "slug": "wt6300-wt63b0"
          },
          {
            "name": "WT6000 WT60A0",
            "slug": "wt6000-wt60a0"
          },
          {
            "name": "WT5400",
            "slug": "wt5400"
          },
          {
            "name": "WT41N0 V0W",
            "slug": "wt41n0-v0w"
          },
          {
            "name": "WT41N0",
            "slug": "wt41n0"
          },
          {
            "name": "WT4070 WT4090",
            "slug": "wt4070-wt4090"
          },
          {
            "name": "WT41N0 VOW",
            "slug": "wi41no"
          },
          {
            "name": "RS6000 ,RS60B0",
            "slug": "rs6000"
          }
        ]
      },
      {
        "title": "Tablet Vehicle Mounted",
        "slug": "tablet-vehicle-mounted",
        "items": [
          {
            "name": "ET85",
            "slug": "et85"
          },
          {
            "name": "ET80",
            "slug": "et80"
          },
          {
            "name": "ET65",
            "slug": "et65"
          },
          {
            "name": "ET60",
            "slug": "et60"
          },
          {
            "name": "ET56",
            "slug": "et56"
          },
          {
            "name": "ET55",
            "slug": "et55"
          },
          {
            "name": "ET45",
            "slug": "et45"
          },
          {
            "name": "ET40",
            "slug": "et40"
          },
          {
            "name": "VC8300",
            "slug": "vc8300"
          },
          {
            "name": "VC80x",
            "slug": "vc80x"
          },
          {
            "name": "VC80",
            "slug": "vc80"
          },
          {
            "name": "VC70N0",
            "slug": "vc70n0"
          },
          {
            "name": "VC5090-Full",
            "slug": "vc5090-full"
          },
          {
            "name": "VC5090-Half",
            "slug": "vc5090-half"
          },
          {
            "name": "\"Psion Teklogix 8516",
            "slug": "psion-teklogix"
          }
        ]
      },
      {
        "title": "Refurbished Devices",
        "slug": "refurbished-devices",
        "items": []
      }
    ]
  },
  {
    "id": "honeywall",
    "name": "Honeywall",
    "sections": [
      {
        "title": "Mobile Computers",
        "slug": "honeywall-mobile-computers",
        "items": [
          {
            "name": "9500",
            "slug": "9500"
          },
          {
            "name": "CK62",
            "slug": "ck62"
          },
          {
            "name": "CK75",
            "slug": "ck75"
          },
          {
            "name": "CK67",
            "slug": "ck67"
          },
          {
            "name": "CK65",
            "slug": "ck65"
          },
          {
            "name": "CK3X",
            "slug": "ck3x"
          },
          {
            "name": "CK3R",
            "slug": "ck3r"
          },
          {
            "name": "CN85",
            "slug": "cn85"
          },
          {
            "name": "CN80",
            "slug": "cn80"
          },
          {
            "name": "CN75e",
            "slug": "cn75e"
          },
          {
            "name": "CN75",
            "slug": "cn75"
          },
          {
            "name": "CN51",
            "slug": "cn51"
          },
          {
            "name": "ScanPal EDA40K",
            "slug": "scanpal-eda40k"
          },
          {
            "name": "ScanPal EDA50",
            "slug": "scanpal-eda50"
          },
          {
            "name": "ScanPal EDA50K",
            "slug": "scanpal-eda50k"
          },
          {
            "name": "ScanPal EDA50KP",
            "slug": "scanpal-eda50kp"
          },
          {
            "name": "ScanPal EDA51",
            "slug": "scanpal-eda51"
          },
          {
            "name": "ScanPal EDA51K",
            "slug": "scanpal-eda51k"
          },
          {
            "name": "ScanPal EDA51K RFID",
            "slug": "scanpal-eda51k-rfid"
          },
          {
            "name": "ScanPal EDA52",
            "slug": "scanpal-eda52"
          },
          {
            "name": "ScanPal EDA56",
            "slug": "scanpal-eda56"
          },
          {
            "name": "ScanPal EDA57",
            "slug": "scanpal-eda57"
          },
          {
            "name": "ScanPal EDA5S",
            "slug": "scanpal-eda5s"
          },
          {
            "name": "ScanPal EDA60K",
            "slug": "scanpal-eda60k"
          },
          {
            "name": "ScanPal EDA61K",
            "slug": "scanpal-eda61k"
          },
          {
            "name": "ScanPal EDA70",
            "slug": "scanpal-eda70"
          },
          {
            "name": "ScanPal EDA71",
            "slug": "scanpal-eda71"
          },
          {
            "name": "ScanPal EDA75",
            "slug": "scanpal-eda75"
          },
          {
            "name": "CT30 XP",
            "slug": "ct30-xp"
          },
          {
            "name": "CT37",
            "slug": "ct37"
          },
          {
            "name": "CT40 XP",
            "slug": "ct40-xp"
          },
          {
            "name": "CT40",
            "slug": "ct40"
          },
          {
            "name": "CT45XP",
            "slug": "ct45xp"
          },
          {
            "name": "CT45",
            "slug": "ct45"
          },
          {
            "name": "CT47",
            "slug": "ct47"
          },
          {
            "name": "CT50",
            "slug": "ct50"
          },
          {
            "name": "CT60",
            "slug": "ct60"
          },
          {
            "name": "CT60XP",
            "slug": "ct60xp"
          },
          {
            "name": "9700",
            "slug": "9700"
          },
          {
            "name": "9900",
            "slug": "9900"
          },
          {
            "name": "9950",
            "slug": "9950"
          },
          {
            "name": "70e Black",
            "slug": "70e-black"
          },
          {
            "name": "60S",
            "slug": "60s"
          },
          {
            "name": "6110",
            "slug": "6110"
          },
          {
            "name": "99GX",
            "slug": "99gx"
          },
          {
            "name": "9951",
            "slug": "9951"
          }
        ]
      },
      {
        "title": "Barcode Scanners",
        "slug": "honeywall-barcode-scanners",
        "items": [
          {
            "name": "Granit 1280i",
            "slug": "granit-1280i"
          },
          {
            "name": "Granit 1910iER",
            "slug": "granit-1910ier"
          },
          {
            "name": "Granit 1911iER",
            "slug": "granit-1911ier"
          },
          {
            "name": "Granit 1920i",
            "slug": "granit-1920i"
          },
          {
            "name": "Granit 1981iFR",
            "slug": "granit-1981ifr"
          },
          {
            "name": "Granit 1980iFR",
            "slug": "granit-1980ifr"
          },
          {
            "name": "Granit 1990iSR",
            "slug": "granit-1990isr"
          },
          {
            "name": "Granit 1990iXR",
            "slug": "granit-1990ixr"
          },
          {
            "name": "Granit 1990ixLR",
            "slug": "granit-1990ixlr"
          },
          {
            "name": "Granit 1991iSR",
            "slug": "granit-1991isr"
          },
          {
            "name": "Granit 1991iXR",
            "slug": "granit-1991ixr"
          },
          {
            "name": "Granit 1991ixLR",
            "slug": "granit-1991ixlr"
          },
          {
            "name": "PowerScan PD9532",
            "slug": "powerscan-pd9532"
          },
          {
            "name": "Granit 1911iER",
            "slug": "granit"
          }
        ]
      },
      {
        "title": "Rugged Tablet",
        "slug": "honeywall-rugged-tablet",
        "items": [
          {
            "name": "Thor VM1C VM1W",
            "slug": "thor-vm1c-vm1w"
          },
          {
            "name": "Thor VM3A",
            "slug": "thor-vm3a"
          },
          {
            "name": "RT10A",
            "slug": "rt10a"
          },
          {
            "name": "RT10W",
            "slug": "rt10w"
          },
          {
            "name": "Thor VM1A",
            "slug": "thor-vm1a"
          },
          {
            "name": "Thor VM2",
            "slug": "thor-vm2"
          },
          {
            "name": "Thor VM3",
            "slug": "thor-vm3"
          }
        ]
      },
      {
        "title": "Printers",
        "slug": "honeywall-printers",
        "items": [
          {
            "name": "RP2",
            "slug": "rp2"
          },
          {
            "name": "RP4 / SAV 4",
            "slug": "rp4-sav4"
          },
          {
            "name": "RP4F RP4D",
            "slug": "rp4f-rp4d"
          },
          {
            "name": "RL3e",
            "slug": "rl3e"
          },
          {
            "name": "RL4",
            "slug": "rl4"
          },
          {
            "name": "PC42D",
            "slug": "pc42d"
          },
          {
            "name": "PD45 PD45s",
            "slug": "pd45-pd45s"
          },
          {
            "name": "PM23 PM42 PM43",
            "slug": "pm23-pm42-pm43"
          },
          {
            "name": "PM45",
            "slug": "pm45"
          },
          {
            "name": "PX6i PX6ie",
            "slug": "px6i-px6ie"
          },
          {
            "name": "PX4i PX4ie",
            "slug": "px4i-px4ie"
          },
          {
            "name": "PX45",
            "slug": "px45"
          },
          {
            "name": "PX65",
            "slug": "px65"
          },
          {
            "name": "PX940",
            "slug": "px940"
          },
          {
            "name": "MPD31D",
            "slug": "mpd31d"
          }
        ]
      },
      {
        "title": "Refurbished Devices",
        "slug": "honeywall-refurbished-devices",
        "items": []
      },
      {
        "title": "Wearable Computers",
        "slug": "honeywall-wearable-computers",
        "items": [
          {
            "name": "8650 Ring Scanner",
            "slug": "8650-ring-scanner"
          },
          {
            "name": "8670 Ring Scanner",
            "slug": "8670-ring-scanner"
          },
          {
            "name": "8675i Ring Scanner",
            "slug": "8675i-ring-scanner"
          },
          {
            "name": "8680i Ring Scanner",
            "slug": "8680i-ring-scanner"
          },
          {
            "name": "8690i Ring Scanner",
            "slug": "8690i-ring-scanner"
          },
          {
            "name": "CW45",
            "slug": "cw45"
          }
        ]
      },
      {
        "title": "Voice Automated Solutions",
        "slug": "voice-automated",
        "items": [
          {
            "name": "Talkman TT-700-100",
            "slug": "talkman"
          },
          {
            "name": "Talkman A730x",
            "slug": "talkman-a730x"
          },
          {
            "name": "Talkman A730",
            "slug": "talkman-a730"
          }
        ]
      },
      {
        "title": "Tablet - Vehicle-Mounted",
        "slug": "tablet-vehicle",
        "items": [
          {
            "name": "ScanPal EDA10A",
            "slug": "scanpal-eda10a"
          }
        ]
      }
    ]
  },
  {
    "id": "datalogic",
    "name": "Datalogic",
    "sections": [
      {
        "title": "Mobile Computers",
        "slug": "datalogic-mobile-computers",
        "items": [
          {
            "name": "ELF",
            "slug": "elf"
          },
          {
            "name": "Memor K",
            "slug": "memor-k"
          },
          {
            "name": "Memor 30X",
            "slug": "memor-30x"
          },
          {
            "name": "Memor 10",
            "slug": "memor-10"
          },
          {
            "name": "Memor 11",
            "slug": "memor-11"
          },
          {
            "name": "Memor 12",
            "slug": "memor-12"
          },
          {
            "name": "Skorpio X3",
            "slug": "skorpio-x3"
          },
          {
            "name": "Skorpio X4",
            "slug": "skorpio-x4"
          },
          {
            "name": "Skorpio X5",
            "slug": "skorpio-x5"
          },
          {
            "name": "Falcon X3",
            "slug": "falcon-x3"
          },
          {
            "name": "Falcon X3+",
            "slug": "falcon-x3-plus"
          },
          {
            "name": "Falcon X4",
            "slug": "falcon-x4"
          },
          {
            "name": "Falcon ® 4420",
            "slug": "falcon4420"
          },
          {
            "name": "Memor 20",
            "slug": "memor-20"
          },
          {
            "name": "Falcon ® 4410",
            "slug": "falcon-4410"
          },
          {
            "name": "Memor 30",
            "slug": "momor-30"
          },
          {
            "name": "Memor X3",
            "slug": "memor-x3"
          }
        ]
      },
      {
        "title": "Barcode Scanners",
        "slug": "datalogic-barcode-scanners",
        "items": [
          {
            "name": "PowerScan D8300",
            "slug": "powerscan-d8300"
          },
          {
            "name": "PowerScan D8330",
            "slug": "powerscan-d8330"
          },
          {
            "name": "PowerScan D8340",
            "slug": "powerscan-d8340"
          },
          {
            "name": "PowerScan D8530",
            "slug": "powerscan-d8530"
          },
          {
            "name": "PowerScan M8300",
            "slug": "powerscan-m8300"
          },
          {
            "name": "PowerScan M8500",
            "slug": "powerscan-m8500"
          },
          {
            "name": "PowerScan PBT8300",
            "slug": "powerscan-pbt8300"
          },
          {
            "name": "PowerScan PBT9300",
            "slug": "powerscan-pbt9300"
          },
          {
            "name": "PowerScan PBT9500",
            "slug": "powerscan-pbt9500"
          },
          {
            "name": "PowerScan PBT9501",
            "slug": "powerscan-pbt9501"
          },
          {
            "name": "PowerScan PD9130",
            "slug": "powerscan-pd9130"
          },
          {
            "name": "PowerScan PD9330",
            "slug": "powerscan-pd9330"
          },
          {
            "name": "PowerScan PD9530",
            "slug": "powerscan-pd9530"
          },
          {
            "name": "PowerScan PD9531",
            "slug": "powerscan-pd9531"
          },
          {
            "name": "PowerScan PM9100",
            "slug": "powerscan-pm9100"
          },
          {
            "name": "PowerScan PM9300",
            "slug": "powerscan-pm9300"
          },
          {
            "name": "PowerScan PM9500",
            "slug": "powerscan-pm9500"
          },
          {
            "name": "PowerScan PM9501",
            "slug": "powerscan-pm9501"
          }
        ]
      },
      {
        "title": "Refurbished Devices",
        "slug": "datalogic-refurbished-devices",
        "items": []
      }
    ]
  },
  {
    "id": "intermec",
    "name": "Intermec",
    "sections": [
      {
        "title": "Rugged Tablet",
        "slug": "intermec-rugged-tablet",
        "items": [
          {
            "name": "CV61",
            "slug": "cv61"
          },
          {
            "name": "CV60",
            "slug": "cv60"
          },
          {
            "name": "CV41",
            "slug": "cv41"
          },
          {
            "name": "CV31",
            "slug": "cv31"
          },
          {
            "name": "CV30",
            "slug": "cv30"
          }
        ]
      },
      {
        "title": "Mobile Computers",
        "slug": "intermec-mobile-computers",
        "items": [
          {
            "name": "CK75",
            "slug": "ck75-device"
          },
          {
            "name": "CK71",
            "slug": "ck71-device"
          },
          {
            "name": "CK70",
            "slug": "ck70-device"
          },
          {
            "name": "CK3X",
            "slug": "ck3x-device"
          },
          {
            "name": "CK3R",
            "slug": "ck3r-device"
          },
          {
            "name": "CK3",
            "slug": "ck3-device"
          },
          {
            "name": "CN75",
            "slug": "cn75-device"
          },
          {
            "name": "CN70",
            "slug": "cn70-device"
          },
          {
            "name": "CN51",
            "slug": "cn51-device"
          },
          {
            "name": "CN50",
            "slug": "cn50-device"
          },
          {
            "name": "CN4",
            "slug": "cn4"
          },
          {
            "name": "CK31",
            "slug": "ck31"
          },
          {
            "name": "CN4E",
            "slug": "cn4e"
          }
        ]
      },
      {
        "title": "Printers",
        "slug": "intermec-printers",
        "items": [
          {
            "name": "PB50",
            "slug": "pb50-printer"
          },
          {
            "name": "PB51",
            "slug": "pb51-printer"
          },
          {
            "name": "PC23D",
            "slug": "pc23d-printer"
          },
          {
            "name": "PC42T",
            "slug": "pc42t-printer"
          },
          {
            "name": "PC43T PC43D PD43 PD43C",
            "slug": "pc43t-pc43d-pd43-pd43c-printer"
          },
          {
            "name": "PD41 PD42",
            "slug": "pd41-pd42-printer"
          },
          {
            "name": "PM23 PM42 PM43",
            "slug": "pm23-pm42-pm43-printer"
          },
          {
            "name": "PM45",
            "slug": "pm45-printer"
          },
          {
            "name": "PM4i / PM4d / PF4i",
            "slug": "pm4i-pm4d-pf4i-printer"
          },
          {
            "name": "PR2",
            "slug": "pr2-printer"
          },
          {
            "name": "PR3",
            "slug": "pr3-printer"
          },
          {
            "name": "PX4i",
            "slug": "px4i-printer"
          },
          {
            "name": "PX4ie",
            "slug": "px4ie-printer"
          },
          {
            "name": "PX6i",
            "slug": "px6i-printer"
          },
          {
            "name": "PX6ie",
            "slug": "px6ie-printer"
          },
          {
            "name": "PX940",
            "slug": "px940-printer"
          }
        ]
      },
      {
        "title": "Refurbished Devices",
        "slug": "intermec-refurbished-devices",
        "items": []
      }
    ]
  },
  {
    "id": "urovo",
    "name": "Urovo",
    "sections": [
      {
        "title": "Mobile Computers",
        "slug": "urovo-mobile-computers",
        "items": [
          {
            "name": "DT50 DT50s",
            "slug": "dt50-dt50s-device"
          },
          {
            "name": "RT40 RT40S",
            "slug": "rt40-rt40s-device"
          },
          {
            "name": "DT40 DT40S",
            "slug": "dt40-dt40s-device"
          },
          {
            "name": "DT66",
            "slug": "dt66-device"
          },
          {
            "name": "CT48",
            "slug": "ct48-device"
          },
          {
            "name": "CT58S",
            "slug": "ct58s-device"
          },
          {
            "name": "RT30",
            "slug": "rt30-device"
          },
          {
            "name": "i6300",
            "slug": "i6300-device"
          }
        ]
      },
      {
        "title": "Wearable Computers & Barcode Scanners",
        "slug": "urovo-wearable-computers",
        "items": [
          {
            "name": "U2 / U2S",
            "slug": "u2---u2s"
          },
          {
            "name": "R7 Series",
            "slug": "r7-series"
          },
          {
            "name": "SR5600",
            "slug": "sr5600"
          }
        ]
      },
      {
        "title": "RFID Devices",
        "slug": "urovo-rfid-devices",
        "items": [
          {
            "name": "P80",
            "slug": "p80"
          },
          {
            "name": "P80L",
            "slug": "p80l"
          },
          {
            "name": "K4",
            "slug": "k4"
          },
          {
            "name": "K3",
            "slug": "k3"
          },
          {
            "name": "K3S",
            "slug": "k3s"
          },
          {
            "name": "K2",
            "slug": "k2"
          },
          {
            "name": "K2S",
            "slug": "k2s"
          }
        ]
      },
      {
        "title": "Printers",
        "slug": "urovo-printers",
        "items": [
          {
            "name": "DT40",
            "slug": "dt40"
          },
          {
            "name": "DT30",
            "slug": "dt30"
          },
          {
            "name": "DT20",
            "slug": "dt20"
          }
        ]
      },
      {
        "title": "Payment-terminals",
        "slug": "urovo-payment-terminals",
        "items": [
          {
            "name": "i9200",
            "slug": "i9200"
          },
          {
            "name": "i5300L",
            "slug": "i5300l"
          },
          {
            "name": "i5300",
            "slug": "i5300"
          },
          {
            "name": "i9100",
            "slug": "i9100"
          },
          {
            "name": "i9000S",
            "slug": "i9000s"
          },
          {
            "name": "i5000",
            "slug": "i5000"
          },
          {
            "name": "Q200",
            "slug": "q200"
          }
        ]
      },
      {
        "title": "Devices",
        "slug": "urovo-devices",
        "items": [
          {
            "name": "All Model",
            "slug": "all-model"
          }
        ]
      },
      {
        "title": "Rugged Tablets",
        "slug": "urovo-rugged-tablets",
        "items": [
          {
            "name": "P8100P Series",
            "slug": "p8100p-series"
          },
          {
            "name": "P8100",
            "slug": "p8100"
          }
        ]
      }
    ]
  },
  {
    "id": "tsc-bluebird",
    "name": "TSC-Bluebird",
    "sections": [
      {
        "title": "Printers",
        "slug": "tsc-printers",
        "items": [
          {
            "name": "MF2400T",
            "slug": "mf2400t-a83b68"
          },
          {
            "name": "MB240",
            "slug": "mb240-48fff9"
          },
          {
            "name": "MB241",
            "slug": "mb241-de26f9"
          },
          {
            "name": "ME-240",
            "slug": "me-240-0f1173"
          },
          {
            "name": "MF2400T",
            "slug": "mf2400t-1-5db75c"
          },
          {
            "name": "MH241",
            "slug": "mh241-4541b1"
          },
          {
            "name": "MH261T",
            "slug": "mh261t-7533cc"
          },
          {
            "name": "MX240P",
            "slug": "mx240p-6e6f2f"
          },
          {
            "name": "LP6820T--2",
            "slug": "lp6820t--2-85c894"
          },
          {
            "name": "TDP-247",
            "slug": "tdp-247-159a30"
          },
          {
            "name": "TTP-2410MT",
            "slug": "ttp-2410mt-51fafa"
          },
          {
            "name": "TTP-286MT",
            "slug": "ttp-286mt-4bf883"
          }
        ]
      },
      {
        "title": "Mobile Computers",
        "slug": "tsc-mobile-computers",
        "items": [
          {
            "name": "X40",
            "slug": "x40-874cd2"
          },
          {
            "name": "SF650",
            "slug": "sf650-bc14b1"
          },
          {
            "name": "HF550X",
            "slug": "hf550x-e6a4f4"
          },
          {
            "name": "SF550",
            "slug": "sf550-464699"
          },
          {
            "name": "S10",
            "slug": "s10-3857ea"
          },
          {
            "name": "S20",
            "slug": "s20-3a6180"
          },
          {
            "name": "S50",
            "slug": "s50-ac98bc"
          },
          {
            "name": "EF551",
            "slug": "ef551-da96e0"
          },
          {
            "name": "EF550",
            "slug": "ef550-ea1f00"
          },
          {
            "name": "VX500",
            "slug": "vx500-692112"
          },
          {
            "name": "VF550",
            "slug": "vf550-ac8038"
          },
          {
            "name": "VF550 iBio",
            "slug": "vf550-ibio-fd022a"
          },
          {
            "name": "EK430",
            "slug": "ek430-ef816d"
          },
          {
            "name": "S70",
            "slug": "s70-f5ba84"
          },
          {
            "name": "S70 Explosion Protection",
            "slug": "s70-explosion-protection-b388b9"
          },
          {
            "name": "EF550R",
            "slug": "ef550r-a1150c"
          },
          {
            "name": "BP30",
            "slug": "bp30-cba70c"
          },
          {
            "name": "VX500 PTT",
            "slug": "vx500-ptt-354736"
          }
        ]
      },
      {
        "title": "Refurbished Devices",
        "slug": "tsc-refurbished-devices",
        "items": []
      },
      {
        "title": "Rugged Tablet",
        "slug": "tsc-rugged-tablet",
        "items": [
          {
            "name": "T30",
            "slug": "t30-d1ff13"
          },
          {
            "name": "RT104",
            "slug": "rt104-6210f9"
          },
          {
            "name": "RT080",
            "slug": "rt080-97e61a"
          },
          {
            "name": "RT080 iBio",
            "slug": "rt080-ibio-afe641"
          },
          {
            "name": "RT100",
            "slug": "rt100-482f42"
          },
          {
            "name": "RT103",
            "slug": "rt103-a4ba2a"
          }
        ]
      }
    ]
  },
  {
    "id": "zenove-accessory",
    "name": "ZENOVA Accessory",
    "sections": [
      {
        "title": "Screen Protector",
        "slug": "zenova-screen-protector",
        "items": [
          {
            "name": "Zebra",
            "slug": "zebra-a24d8b"
          },
          {
            "name": "Honeywell",
            "slug": "honeywell-937ac0"
          },
          {
            "name": "Datalogic",
            "slug": "datalogic-620207"
          },
          {
            "name": "Newland",
            "slug": "newland-e8f1a9"
          },
          {
            "name": "idata",
            "slug": "idata-b83b3c"
          },
          {
            "name": "Urovo",
            "slug": "urovo-caac8e"
          },
          {
            "name": "Seuic",
            "slug": "seuic-135ae0"
          },
          {
            "name": "Sunmi",
            "slug": "sunmi-a09fe3"
          },
          {
            "name": "MobyData",
            "slug": "mobydata-0bbfc0"
          },
          {
            "name": "Hikvision",
            "slug": "hikvision-ee4309"
          }
        ]
      },
      {
        "title": "Protective Case",
        "slug": "zenova-protective-case",
        "items": [
          {
            "name": "Zebra",
            "slug": "zebra-a076d1"
          },
          {
            "name": "Honeywell",
            "slug": "honeywell-265a95"
          },
          {
            "name": "Datalogic",
            "slug": "datalogic-e168ad"
          },
          {
            "name": "Intermec",
            "slug": "intermec-74d713"
          },
          {
            "name": "Newland",
            "slug": "newland-c70b0d"
          },
          {
            "name": "idata",
            "slug": "idata-b9b2d9"
          },
          {
            "name": "Urovo",
            "slug": "urovo-ba4868"
          },
          {
            "name": "Seuic",
            "slug": "seuic-b76585"
          },
          {
            "name": "Sunmi",
            "slug": "sunmi-41bc60"
          },
          {
            "name": "MobyData",
            "slug": "mobydata-946234"
          }
        ]
      },
      {
        "title": "Hand Strap",
        "slug": "zenova-hand-strap",
        "items": [
          {
            "name": "Zebra",
            "slug": "zebra-94c40c"
          },
          {
            "name": "Honeywell",
            "slug": "honeywell-387c5b"
          },
          {
            "name": "Datalogic",
            "slug": "datalogic-850b56"
          },
          {
            "name": "Intermec",
            "slug": "intermec-70a8ef"
          },
          {
            "name": "Newland",
            "slug": "newland-b7a55e"
          },
          {
            "name": "Urovo",
            "slug": "urovo-e7165d"
          },
          {
            "name": "Seuic",
            "slug": "seuic-a39592"
          },
          {
            "name": "Sunmi",
            "slug": "sunmi-cfc7df"
          },
          {
            "name": "MobyData",
            "slug": "mobydata-274120"
          }
        ]
      },
      {
        "title": "Device Carrying Case",
        "slug": "zenoca-device-carrying-case",
        "items": []
      },
      {
        "title": "Repair Tools",
        "slug": "zenova-repair-tools",
        "items": []
      },
      {
        "title": "Customized",
        "slug": "zenova-customized",
        "items": []
      },
      {
        "title": "ZenPower Battery",
        "slug": "zenova-zenpower-battery",
        "items": []
      }
    ]
  },
  {
    "id": "other-brands",
    "name": "Other Brands",
    "sections": [
      {
        "title": "Newland",
        "slug": "newland",
        "items": [
          {
            "name": "MT90",
            "slug": "mt90-513769"
          },
          {
            "name": "MT66",
            "slug": "mt66-8fbe55"
          },
          {
            "name": "MT69",
            "slug": "mt69-d00c0f"
          },
          {
            "name": "MT60E",
            "slug": "mt60e-25331d"
          },
          {
            "name": "MT30",
            "slug": "mt30-fafc8e"
          },
          {
            "name": "NLS-N7",
            "slug": "nls-n7-b72fca"
          },
          {
            "name": "NLS-NFT10",
            "slug": "nls-nft10-68f09e"
          },
          {
            "name": "MT95",
            "slug": "mt95-a070b8"
          }
        ]
      },
      {
        "title": "Chainway",
        "slug": "chainway",
        "items": [
          {
            "name": "C6000",
            "slug": "c6000-aca68e"
          },
          {
            "name": "P80",
            "slug": "p80-c61bdc"
          },
          {
            "name": "C66",
            "slug": "c66-5226aa"
          },
          {
            "name": "C61",
            "slug": "c61-8dce7c"
          }
        ]
      },
      {
        "title": "Unitech",
        "slug": "unitech",
        "items": [
          {
            "name": "EA520",
            "slug": "ea520"
          },
          {
            "name": "EA502",
            "slug": "ea502"
          }
        ]
      },
      {
        "title": "M3 Mobile",
        "slug": "m3-mobile",
        "items": [
          {
            "name": "SM30",
            "slug": "sm30-d3d830"
          },
          {
            "name": "SM24",
            "slug": "sm24-a63803"
          },
          {
            "name": "SM25",
            "slug": "sm25-945677"
          },
          {
            "name": "UL30",
            "slug": "ul30-7ccc8a"
          },
          {
            "name": "SM15X / SM15N / SM15W",
            "slug": "sm15x-sm15n-sm15w-cdde3f"
          },
          {
            "name": "UL20X / UL20F / UL20W",
            "slug": "ul20x-ul20f-ul20w-334ce9"
          },
          {
            "name": "SL10-N / SL10-W",
            "slug": "sl10-n-sl10-w-ddc413"
          },
          {
            "name": "SL10K-N / SL10K-W",
            "slug": "sl10k-n-sl10k-w-18b124"
          }
        ]
      },
      {
        "title": "Ulefone Cipherlab",
        "slug": "ulefone-cipherlab",
        "items": [
          {
            "name": "Armor Series",
            "slug": "armor-series"
          }
        ]
      },
      {
        "title": "Idata",
        "slug": "idata",
        "items": [
          {
            "name": "K1S",
            "slug": "k1s-d1823f"
          },
          {
            "name": "K1 Pro",
            "slug": "k1-pro-4d75c4"
          },
          {
            "name": "K3S",
            "slug": "k3s-4835c1"
          },
          {
            "name": "K3 Pro",
            "slug": "k3-pro-33cdfc"
          }
        ]
      },
      {
        "title": "Seuic",
        "slug": "seuic",
        "items": [
          {
            "name": "CRUISE2 5G Pro",
            "slug": "cruise2-5g-pro-2511fc"
          },
          {
            "name": "CRUISE GeP",
            "slug": "cruise-gep-ceced2"
          },
          {
            "name": "AUTOID 3P",
            "slug": "autoid-3p-674ddb"
          },
          {
            "name": "AUTOID 10",
            "slug": "autoid-10-997803"
          },
          {
            "name": "AUTOID Q7",
            "slug": "autoid-q7-bf038f"
          }
        ]
      },
      {
        "title": "Sunmi",
        "slug": "sunmi",
        "items": [
          {
            "name": "V3 PLUS",
            "slug": "v3-plus-f0e8a2"
          },
          {
            "name": "V2 PRO",
            "slug": "v2-pro-34e828"
          },
          {
            "name": "V2s PLUS",
            "slug": "v2s-plus-77053a"
          },
          {
            "name": "V2s",
            "slug": "v2s-c5b050"
          },
          {
            "name": "L3",
            "slug": "l3-65a0b8"
          },
          {
            "name": "L2s PRO",
            "slug": "l2s-pro-228cae"
          },
          {
            "name": "P3h",
            "slug": "p3h-cfcdc5"
          },
          {
            "name": "P3 mix",
            "slug": "p3-mix-9dcc64"
          }
        ]
      },
      {
        "title": "Datamax",
        "slug": "datamax",
        "items": []
      }
    ]
  }
];

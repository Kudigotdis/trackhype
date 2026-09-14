/*
 * ================================================================
 * GLOBAL MOBILE MONEY / BANKING SERVICES DATASET
 * ================================================================
 *
 * APP FLOW
 * --------
 *
 * COUNTRY
 *    ↓
 * MOBILE NETWORK
 *    ↓
 * MOBILE MONEY / BANKING SERVICE
 *
 *
 * EXAMPLE
 * -------
 *
 * Botswana
 *    ↓
 * Mascom
 *    ↓
 * MyZaka
 *
 * Botswana
 *    ↓
 * Orange
 *    ↓
 * Orange Money
 *
 * Botswana
 *    ↓
 * BTC BeMobile
 *    ↓
 * Smega
 *
 *
 * IMPORTANT
 * ---------
 * This dataset is structured around the mobile-network relationship,
 * rather than simply providing a flat list of mobile money brands.
 *
 * This allows the application to ask:
 *
 * "Which mobile network do you use?"
 *
 * and then:
 *
 * "Which mobile money / banking service do you use on that network?"
 *
 * ================================================================
 */

(function (window) {

    "use strict";


    /* ================================================================
       MAIN DATA
       ================================================================ */

    const MOBILE_MONEY_BANKING_SERVICES = {

        /* ============================================================
           AFRICA
           ============================================================ */

        "Botswana": {

            "BTC BeMobile": [
                "Smega"
            ],

            "Mascom": [
                "MyZaka"
            ],

            "Orange": [
                "Orange Money"
            ]

        },


        "Zimbabwe": {

            "Econet Wireless Zimbabwe": [
                "EcoCash"
            ],

            "Telecel Zimbabwe": [
                "Telecash"
            ],

            "NetOne": [
                "OneMoney"
            ]

        },


        "Kenya": {

            "Safaricom": [
                "M-Pesa"
            ],

            "Airtel Kenya": [
                "Airtel Money"
            ],

            "Telkom Kenya": [
                "T-Kash"
            ]

        },


        "Ghana": {

            "MTN Ghana": [
                "MTN MoMo"
            ],

            "Telecel Ghana": [
                "Telecel Cash"
            ],

            "AT Ghana": [
                "AT Money"
            ]

        },


        "Nigeria": {

            "MTN Nigeria": [
                "MoMo PSB"
            ],

            "Airtel Nigeria": [
                "SmartCash PSB"
            ],

            "Globacom": [
                "Glo Money",
                "MoneyMaster PSB"
            ],

            "9mobile": [
                "9PSB"
            ]

        },


        "Uganda": {

            "MTN Uganda": [
                "MTN MoMo Uganda"
            ],

            "Airtel Uganda": [
                "Airtel Money Uganda"
            ],

            "Uganda Telecom (UTel)": [
                "UTel Pay"
            ]

        },


        "Tanzania": {

            "Vodacom Tanzania": [
                "M-Pesa Tanzania"
            ],

            "Tigo Tanzania": [
                "Tigo Pesa"
            ],

            "Airtel Tanzania": [
                "Airtel Money Tanzania"
            ],

            "Halotel": [
                "HaloPesa"
            ]

        },


        "Ivory Coast": {

            "Orange Côte d'Ivoire": [
                "Orange Money"
            ],

            "MTN Ivory Coast": [
                "MTN MoMo CI"
            ],

            "Moov Africa Côte d'Ivoire": [
                "Moov Money"
            ]

        },


        "Senegal": {

            "Orange Senegal": [
                "Orange Money Senegal"
            ],

            "Free Senegal": [
                "Free Money"
            ],

            "Expresso Senegal": [
                "E-Money"
            ]

        },


        "Cameroon": {

            "Orange Cameroon": [
                "Orange Money Cameroon"
            ],

            "MTN Cameroon": [
                "MTN MoMo Cameroon"
            ]

        },


        "Mali": {

            "Orange Mali": [
                "Orange Finances Mobiles Mali"
            ],

            "Moov Africa Malitel": [
                "Moov Money Mali"
            ]

        },


        "Burkina Faso": {

            "Orange Burkina Faso": [
                "Orange Money Burkina"
            ],

            "Moov Africa Burkina Faso": [
                "Moov Money"
            ]

        },


        "Benin": {

            "MTN Benin": [
                "MTN Mobile Money Benin"
            ],

            "Moov Africa Benin": [
                "Moov Money Benin"
            ],

            "SBIN (Celtis)": [
                "Celtis Cash"
            ]

        },


        "Democratic Republic of the Congo": {

            "Vodacom DRC": [
                "M-Pesa DRC"
            ],

            "Airtel DRC": [
                "Airtel Money DRC"
            ],

            "Orange DRC": [
                "Orange Money DRC"
            ],

            "Africell DRC": [
                "Afrimoney DRC"
            ]

        },


        "Rwanda": {

            "MTN Rwanda": [
                "MTN MoMo Rwanda"
            ],

            "Airtel Rwanda": [
                "Airtel Money Rwanda"
            ]

        },


        "Zambia": {

            "MTN Zambia": [
                "MTN MoMo Zambia"
            ],

            "Airtel Zambia": [
                "Airtel Money Zambia"
            ],

            "Zamtel": [
                "Zamtel Kwacha"
            ]

        },


        "Malawi": {

            "Airtel Malawi": [
                "Airtel Money Malawi"
            ],

            "TNM": [
                "TNM Mpamba"
            ]

        },


        "Liberia": {

            "Lonestar Cell MTN": [
                "Lonestar Cell MoMo"
            ],

            "Orange Liberia": [
                "Orange Money Liberia"
            ]

        },


        "Sierra Leone": {

            "Orange Sierra Leone": [
                "Orange Money Sierra Leone"
            ],

            "Africell Sierra Leone": [
                "Afrimoney Sierra Leone"
            ]

        },


        "Guinea": {

            "Orange Guinea": [
                "Orange Money Guinea"
            ],

            "MTN Guinea": [
                "MTN MoMo Guinea"
            ]

        },


        "Guinea-Bissau": {

            "Orange Guinea-Bissau": [
                "Orange Money"
            ],

            "MTN Guinea-Bissau": [
                "MTN MoMo"
            ]

        },


        "Central African Republic": {

            "Orange CAR": [
                "Orange Money CAR"
            ]

        },


        "Republic of the Congo": {

            "MTN Congo": [
                "MTN MoMo Congo"
            ],

            "Airtel Congo": [
                "Airtel Money Congo"
            ]

        },


        "South Sudan": {

            "MTN South Sudan": [
                "MTN MoMo South Sudan"
            ],

            "Zain South Sudan": [
                "m-Gurush"
            ]

        },


        "Eswatini": {

            "MTN Eswatini": [
                "MTN MoMo Eswatini"
            ]

        },


        "South Africa": {

            "Vodacom South Africa": [
                "VodaPay"
            ],

            "MTN South Africa": [
                "MTN MoMo South Africa"
            ],

            "Telkom South Africa": [
                "Telkom Pay"
            ]

        },


        "Ethiopia": {

            "Ethio Telecom": [
                "Telebirr"
            ],

            "Safaricom Ethiopia": [
                "M-Pesa Ethiopia"
            ]

        },


        "Madagascar": {

            "Telma": [
                "MVola"
            ],

            "Orange Madagascar": [
                "Orange Money Madagascar"
            ],

            "Airtel Madagascar": [
                "Airtel Money Madagascar"
            ]

        },


        /* ============================================================
           MIDDLE EAST & NORTH AFRICA
           ============================================================ */


        "Saudi Arabia": {

            "Saudi Telecom Company (STC)": [
                "stc pay"
            ],

            "Mobily": [
                "Mobily Pay"
            ],

            "Zain Saudi Arabia": [
                "Zain Cash",
                "Yaqoot"
            ]

        },


        "Egypt": {

            "Vodafone Egypt": [
                "Vodafone Cash"
            ],

            "Orange Egypt": [
                "Orange Cash"
            ],

            "e& Egypt": [
                "Etisalat Cash"
            ],

            "Telecom Egypt (WE)": [
                "WE Pay"
            ]

        },


        "United Arab Emirates": {

            "e& (Etisalat Group)": [
                "e& money"
            ],

            "du": [
                "du Pay"
            ]

        },


        "Jordan": {

            "Zain Jordan": [
                "Zain Cash Jordan"
            ],

            "Orange Jordan": [
                "Orange Money Jordan"
            ],

            "Uminit": [
                "Uwallet"
            ]

        },


        "Iraq": {

            "Zain Iraq": [
                "Zain Cash Iraq"
            ],

            "Asiacell": [
                "AsiaHawala"
            ],

            "Korek Telecom": [
                "Korek Cash"
            ]

        },


        "Morocco": {

            "Maroc Telecom": [
                "MT Cash"
            ],

            "Orange Morocco": [
                "Orange Money Maroc"
            ],

            "Inwi": [
                "Inwi Money"
            ]

        },


        "Tunisia": {

            "Ooredoo Tunisia": [
                "M-Tissir"
            ],

            "Orange Tunisia": [
                "Mobimv"
            ]

        },


        "Qatar": {

            "Ooredoo Qatar": [
                "Ooredoo Money"
            ],

            "Vodafone Qatar": [
                "Vodafone Cash Qatar"
            ]

        },


        /* ============================================================
           ASIA & SOUTH ASIA
           ============================================================ */


        "Vietnam": {

            "Viettel Group": [
                "Viettel Money"
            ],

            "VNPT (VinaPhone)": [
                "VNPT Money"
            ],

            "MobiFone": [
                "MobiFone Money"
            ]

        },


        "Indonesia": {

            "Telkomsel": [
                "LinkAja"
            ],

            "Indosat Ooredoo Hutchison": [
                "Dompetku"
            ],

            "XL Axiata": [
                "XL Tunai"
            ]

        },


        "Philippines": {

            "Globe Telecom": [
                "GCash"
            ],

            "Smart Communications": [
                "Maya"
            ]

        },


        "Pakistan": {

            "Telenor Pakistan": [
                "Easypaisa"
            ],

            "Jazz": [
                "JazzCash"
            ],

            "Zong 4G": [
                "PayMax"
            ],

            "Ufone": [
                "UPaisa"
            ]

        },


        "Bangladesh": {

            "Grameenphone": [
                "GP Wallet",
                "bKash"
            ],

            "Robi Axiata": [
                "Robi Cash"
            ],

            "Banglalink": [
                "Banglalink Wallet"
            ],

            "Teletalk": [
                "Nagad"
            ]

        },


        "Myanmar": {

            "MPT": [
                "KBZPay"
            ],

            "Telenor Myanmar / Atom": [
                "Wave Money"
            ],

            "Mytel": [
                "MytelPay"
            ],

            "Ooredoo Myanmar": [
                "M-Pitesan"
            ]

        },


        "Cambodia": {

            "Smart Axiata": [
                "SmartLuy"
            ],

            "Cellcard": [
                "Cellcard Money"
            ],

            "Metfone": [
                "eMoney"
            ]

        },


        "Sri Lanka": {

            "Dialog Axiata": [
                "eZ Cash"
            ],

            "Mobitel": [
                "mCash"
            ]

        },


        /* ============================================================
           LATIN AMERICA & CARIBBEAN
           ============================================================ */


        "Mexico": {

            "Telcel": [
                "Claro Pay",
                "Mi Telcel"
            ],

            "AT&T Mexico": [
                "AT&T Wallet"
            ]

        },


        "Colombia": {

            "Claro Colombia": [
                "Claro Pay"
            ],

            "Tigo Colombia": [
                "Tigo Money"
            ],

            "Movistar Colombia": [
                "Movistar Money"
            ]

        },


        "Paraguay": {

            "Tigo Paraguay": [
                "Tigo Money Paraguay"
            ],

            "Personal Paraguay": [
                "Personal Pay"
            ],

            "Claro Paraguay": [
                "Claro Pay"
            ]

        },


        "Bolivia": {

            "Tigo Bolivia": [
                "Tigo Money Bolivia"
            ],

            "Entel Bolivia": [
                "Entel Financiero"
            ]

        },


        "Guatemala": {

            "Tigo Guatemala": [
                "Tigo Money Guatemala"
            ],

            "Claro Guatemala": [
                "Claro Pay"
            ]

        },


        "Honduras": {

            "Tigo Honduras": [
                "Tigo Money Honduras"
            ],

            "Claro Honduras": [
                "Claro Pay"
            ]

        },


        "El Salvador": {

            "Tigo El Salvador": [
                "Tigo Money El Salvador"
            ]

        },


        "Haiti": {

            "Digicel Haiti": [
                "MonCash"
            ],

            "Natcom": [
                "Natcash"
            ]

        },


        /* ============================================================
           EUROPE
           ============================================================ */

        /*
         * Most European countries do not have the same MNO-led
         * mobile-money model found in Africa.
         *
         * Therefore these countries should NOT be populated with
         * invented mobile-money products.
         *
         * Where an MNO has a genuine operator-linked financial
         * product, it can be added here later.
         */


        "United Kingdom": {

            "EE": [],

            "O2": [],

            "Three": [],

            "Vodafone": []

        },


        "France": {

            "Orange": [],

            "SFR": [],

            "Bouygues Telecom": [],

            "Free Mobile": []

        },


        "Germany": {

            "Telekom Deutschland": [],

            "Vodafone Germany": [],

            "O2 Telefónica": []

        },


        "Italy": {

            "TIM": [],

            "Vodafone Italy": [],

            "Wind Tre": [],

            "Iliad Italy": []

        },


        "Spain": {

            "Movistar": [],

            "Vodafone Spain": [],

            "Orange Spain": [],

            "Yoigo": []

        },


        /* ============================================================
           NORTH AMERICA
           ============================================================ */


        "United States": {

            "AT&T": [],

            "T-Mobile": [],

            "Verizon": []

        },


        "Canada": {

            "Rogers": [],

            "Bell": [],

            "Telus": []

        },


        /* ============================================================
           OCEANIA
           ============================================================ */


        "Australia": {

            "Telstra": [],

            "Optus": [],

            "Vodafone Australia": []

        },


        "New Zealand": {

            "Spark": [],

            "One NZ": [],

            "2degrees": []

        }

    };


    /* ================================================================
       GET NETWORKS FOR A COUNTRY
       ================================================================ */

    function getNetworks(country) {

        if (!country) {
            return [];
        }

        return Object.keys(
            MOBILE_MONEY_BANKING_SERVICES[country] || {}
        );

    }


    /* ================================================================
       GET MOBILE MONEY SERVICES
       ================================================================ */

    function getServices(country, network) {

        if (
            !country ||
            !network ||
            !MOBILE_MONEY_BANKING_SERVICES[country]
        ) {
            return [];
        }

        return (
            MOBILE_MONEY_BANKING_SERVICES[country][network] || []
        );

    }


    /* ================================================================
       GET ALL COUNTRIES
       ================================================================ */

    function getCountries() {

        return Object.keys(
            MOBILE_MONEY_BANKING_SERVICES
        );

    }


    /* ================================================================
       GET COUNTRY DATA
       ================================================================ */

    function getCountry(country) {

        return (
            MOBILE_MONEY_BANKING_SERVICES[country] || {}
        );

    }


    /* ================================================================
       POPULATE NETWORK SELECT
       ================================================================ */

    function populateNetworkSelect(
        selectElement,
        country
    ) {

        if (!selectElement) {
            return;
        }

        selectElement.innerHTML =
            '<option value="">Select Mobile Network</option>';

        const networks = getNetworks(country);

        networks.forEach(function (network) {

            const option =
                document.createElement("option");

            option.value = network;
            option.textContent = network;

            selectElement.appendChild(option);

        });

        selectElement.disabled =
            networks.length === 0;

    }


    /* ================================================================
       POPULATE MOBILE MONEY SERVICE SELECT
       ================================================================ */

    function populateServiceSelect(
        selectElement,
        country,
        network
    ) {

        if (!selectElement) {
            return;
        }

        selectElement.innerHTML =
            '<option value="">Select Mobile Money / Banking Service</option>';

        const services =
            getServices(country, network);

        services.forEach(function (service) {

            const option =
                document.createElement("option");

            option.value = service;
            option.textContent = service;

            selectElement.appendChild(option);

        });

        selectElement.disabled =
            services.length === 0;

    }


    /* ================================================================
       SEARCH SERVICES
       ================================================================ */

    function searchServices(query) {

        if (!query) {
            return [];
        }

        const results = [];

        const search =
            query.toLowerCase();

        Object.keys(
            MOBILE_MONEY_BANKING_SERVICES
        ).forEach(function (country) {

            const networks =
                MOBILE_MONEY_BANKING_SERVICES[country];

            Object.keys(networks).forEach(function (network) {

                networks[network].forEach(function (service) {

                    if (
                        service
                            .toLowerCase()
                            .includes(search)
                    ) {

                        results.push({

                            country: country,

                            network: network,

                            service: service

                        });

                    }

                });

            });

        });

        return results;

    }


    /* ================================================================
       INITIALISE CASCADING FORM
       ================================================================ */

    function init(config) {

        config = config || {};

        const countrySelect =
            document.getElementById(
                config.countrySelectId
            );

        const networkSelect =
            document.getElementById(
                config.networkSelectId
            );

        const serviceSelect =
            document.getElementById(
                config.serviceSelectId
            );


        if (
            !countrySelect ||
            !networkSelect ||
            !serviceSelect
        ) {

            console.error(
                "Mobile Money Form: Required select elements were not found."
            );

            return;

        }


        /* COUNTRY → NETWORK */

        countrySelect.addEventListener(
            "change",
            function () {

                const country =
                    countrySelect.value;

                populateNetworkSelect(
                    networkSelect,
                    country
                );

                serviceSelect.innerHTML =
                    '<option value="">Select Mobile Money / Banking Service</option>';

                serviceSelect.disabled =
                    true;

            }
        );


        /* NETWORK → MOBILE MONEY */

        networkSelect.addEventListener(
            "change",
            function () {

                const country =
                    countrySelect.value;

                const network =
                    networkSelect.value;

                populateServiceSelect(
                    serviceSelect,
                    country,
                    network
                );

            }
        );

    }


    /* ================================================================
       GET SELECTED VALUES
       ================================================================ */

    function getSelection(
        countrySelect,
        networkSelect,
        serviceSelect
    ) {

        return {

            country:
                countrySelect
                    ? countrySelect.value
                    : "",

            network:
                networkSelect
                    ? networkSelect.value
                    : "",

            service:
                serviceSelect
                    ? serviceSelect.value
                    : ""

        };

    }


    /* ================================================================
       VALIDATE SELECTION
       ================================================================ */

    function validateSelection(
        country,
        network,
        service
    ) {

        if (!country) {

            return {
                valid: false,
                error: "Please select a country."
            };

        }


        if (!network) {

            return {
                valid: false,
                error: "Please select a mobile network."
            };

        }


        const services =
            getServices(
                country,
                network
            );


        if (!service) {

            return {
                valid: false,
                error:
                    "Please select your mobile money or banking service."
            };

        }


        if (
            services.length > 0 &&
            !services.includes(service)
        ) {

            return {
                valid: false,
                error:
                    "The selected service is not available for this mobile network."
            };

        }


        return {

            valid: true,

            country: country,

            network: network,

            service: service

        };

    }


    /* ================================================================
       PUBLIC API
       ================================================================ */

    window.MOBILE_MONEY_BANKING_SERVICES =
        MOBILE_MONEY_BANKING_SERVICES;


    window.MobileMoneyBanking =
        {

            getCountries:
                getCountries,

            getCountry:
                getCountry,

            getNetworks:
                getNetworks,

            getServices:
                getServices,

            searchServices:
                searchServices,

            populateNetworkSelect:
                populateNetworkSelect,

            populateServiceSelect:
                populateServiceSelect,

            getSelection:
                getSelection,

            validateSelection:
                validateSelection,

            init:
                init

        };


})(window);
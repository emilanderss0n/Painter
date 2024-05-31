"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const Traders_1 = require("C:/snapshot/project/obj/models/enums/Traders");
const baseJson = __importStar(require("../db/base.json"));
const assortJson = __importStar(require("../db/assort.json"));
const path = __importStar(require("path"));
const fs = require('fs');
const modPath = path.normalize(path.join(__dirname, '..'));
class painter {
    mod;
    logger;
    configServer;
    ragfairConfig;
    constructor() {
        this.mod = "aMoxoPixel-Painter";
    }
    preAkiLoad(container) {
        this.logger = container.resolve("WinstonLogger");
        const preAkiModLoader = container.resolve("PreAkiModLoader");
        const imageRouter = container.resolve("ImageRouter");
        const configServer = container.resolve("ConfigServer");
        const traderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        this.registerProfileImage(preAkiModLoader, imageRouter);
        this.setupTraderUpdateTime(traderConfig);
        Traders_1.Traders["PAINTERSHOP"] = "PAINTERSHOP";
    }
    postDBLoad(container) {
        this.configServer = container.resolve("ConfigServer");
        this.ragfairConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.RAGFAIR);
        const databaseServer = container.resolve("DatabaseServer");
        const configServer = container.resolve("ConfigServer");
        const imageRouter = container.resolve("ImageRouter");
        const traderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const jsonUtil = container.resolve("JsonUtil");
        const tables = databaseServer.getTables();
        this.addTraderToDb(baseJson, tables, jsonUtil);
        this.addTraderToLocales(tables, baseJson.name, "Ivan Samoylov", baseJson.nickname, baseJson.location, "Ivan Samoylov is a master craftsman renowned for his exceptional skill in creating exquisite weapon cosmetics. With an innate talent for blending artistry and functionality, he transforms ordinary weapons into mesmerizing works of art.");
        this.ragfairConfig.traders[baseJson._id] = true;
        this.importQuests(tables);
        this.importQuestLocales(tables);
        this.routeQuestImages(imageRouter);
    }
    registerProfileImage(preAkiModLoader, imageRouter) {
        const imageFilepath = `./${preAkiModLoader.getModPath(this.mod)}res`;
        imageRouter.addRoute(baseJson.avatar.replace(".jpg", ""), `${imageFilepath}/painter.jpg`);
    }
    setupTraderUpdateTime(traderConfig) {
        const traderRefreshRecord = { traderId: baseJson._id, seconds: { min: 2000, max: 6600 } };
        traderConfig.updateTime.push(traderRefreshRecord);
    }
    addTraderToDb(traderDetailsToAdd, tables, jsonUtil) {
        tables.traders[traderDetailsToAdd._id] = {
            assort: jsonUtil.deserialize(jsonUtil.serialize(assortJson)),
            base: jsonUtil.deserialize(jsonUtil.serialize(traderDetailsToAdd)),
            questassort: {
                started: {},
                success: {
                    "PA_CONTAINER": "painter_7",
                    "PA_556_M855A1": "painter_7"
                },
                fail: {}
            }
        };
    }
    addTraderToLocales(tables, fullName, firstName, nickName, location, description) {
        const locales = Object.values(tables.locales.global);
        for (const locale of locales) {
            locale[`${baseJson._id} FullName`] = fullName;
            locale[`${baseJson._id} FirstName`] = firstName;
            locale[`${baseJson._id} Nickname`] = nickName;
            locale[`${baseJson._id} Location`] = location;
            locale[`${baseJson._id} Description`] = description;
        }
    }
    loadFiles(dirPath, extName, cb) {
        if (!fs.existsSync(dirPath))
            return;
        const dir = fs.readdirSync(dirPath, { withFileTypes: true });
        dir.forEach(item => {
            const itemPath = path.normalize(`${dirPath}/${item.name}`);
            if (item.isDirectory())
                this.loadFiles(itemPath, extName, cb);
            else if (extName.includes(path.extname(item.name)))
                cb(itemPath);
        });
    }
    importQuests(tables) {
        let questCount = 0;
        this.loadFiles(`${modPath}/db/quests/`, [".json"], function (filePath) {
            const item = require(filePath);
            if (Object.keys(item).length < 1)
                return;
            for (const quest in item) {
                tables.templates.quests[quest] = item[quest];
                questCount++;
            }
        });
    }
    importQuestLocales(tables) {
        const serverLocales = ['ch', 'cz', 'en', 'es', 'es-mx', 'fr', 'ge', 'hu', 'it', 'jp', 'pl', 'po', 'ru', 'sk', 'tu'];
        const addedLocales = {};
        for (const locale of serverLocales) {
            this.loadFiles(`${modPath}/db/locales/${locale}`, [".json"], function (filePath) {
                const localeFile = require(filePath);
                if (Object.keys(localeFile).length < 1)
                    return;
                for (const currentItem in localeFile) {
                    tables.locales.global[locale][currentItem] = localeFile[currentItem];
                    if (!Object.keys(addedLocales).includes(locale))
                        addedLocales[locale] = {};
                    addedLocales[locale][currentItem] = localeFile[currentItem];
                }
            });
        }
        for (const locale of serverLocales) {
            if (locale == "en")
                continue;
            for (const englishItem in addedLocales["en"]) {
                if (locale in addedLocales) {
                    if (englishItem in addedLocales[locale])
                        continue;
                }
                if (tables.locales.global[locale] != undefined)
                    tables.locales.global[locale][englishItem] = addedLocales["en"][englishItem];
            }
        }
    }
    routeQuestImages(imageRouter) {
        let imageCount = 0;
        this.loadFiles(`${modPath}/res/quests/`, [".png", ".jpg"], function (filePath) {
            imageRouter.addRoute(`/files/quest/icon/${path.basename(filePath, path.extname(filePath))}`, filePath);
            imageCount++;
        });
    }
}
module.exports = { mod: new painter() };
//# sourceMappingURL=mod.js.map
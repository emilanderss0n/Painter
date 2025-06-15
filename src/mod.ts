import { DependencyContainer } from "tsyringe";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { ImageRouter } from "@spt/routers/ImageRouter";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { ITraderAssort, ITraderBase } from "@spt/models/eft/common/tables/ITrader";
import { ITraderConfig, IUpdateTime } from "@spt/models/spt/config/ITraderConfig";
import { IQuestConfig } from "@spt/models/spt/config/IQuestConfig";
import { IRagfairConfig } from "@spt/models/spt/config/IRagfairConfig";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { Traders } from "@spt/models/enums/Traders";

import { IInventoryConfig } from "@spt/models/spt/config/IInventoryConfig";
import { DatabaseService } from "@spt/services/DatabaseService";
import { CustomItemService } from "@spt/services/mod/CustomItemService";

import { CustomItemsManager } from "./CustomItemsManager";
import * as configJson from "../config.json";
import * as baseJson from "../db/base.json";
import * as assortJson from "../db/assort.json";
import * as path from "path";
import * as fs from "fs";

const modPath = path.normalize(path.join(__dirname, ".."));

class PainterTrader implements IPreSptLoadMod, IPostDBLoadMod 
{
    mod: string
    logger: ILogger
    private configServer: ConfigServer
    private ragfairConfig: IRagfairConfig

    constructor() 
    {
        this.mod = "aMoxoPixel-Painter"
    }

    public preSptLoad(container: DependencyContainer): void 
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");

        const PreSptModLoader: PreSptModLoader = container.resolve<PreSptModLoader>("PreSptModLoader");
        const imageRouter: ImageRouter = container.resolve<ImageRouter>("ImageRouter");
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        const traderConfig: ITraderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER);
        const questConfig: IQuestConfig = configServer.getConfig<IQuestConfig>(ConfigTypes.QUEST);

        if (!traderConfig.moddedTraders) 
        {
            traderConfig.moddedTraders = { clothingService: [] };
        }

        if (configJson.enableRepeatableQuests) 
        {
            const PainterRepeatQuests = {
                traderId: "668aaff35fd574b6dcc4a686",
                name: "painter",
                questTypes: ["Completion", "Exploration", "Elimination"],
                rewardBaseWhitelist: [
                    "543be6564bdc2df4348b4568",
                    "5448e5284bdc2dcb718b4567",
                    "5485a8684bdc2da71d8b4567",
                    "57864a3d24597754843f8721",
                    "55818af64bdc2d5b648b4570",
                    "57864e4c24597754843f8723",
                    "57864a66245977548f04a81f",
                    "57864ee62459775490116fc1",
                    "590c745b86f7743cc433c5f2"
                ],
                rewardCanBeWeapon: true,
                weaponRewardChancePercent: 20
            };
            questConfig.repeatableQuests[0].traderWhitelist.push(PainterRepeatQuests); // Daily quests
            questConfig.repeatableQuests[1].traderWhitelist.push(PainterRepeatQuests); // Weekly quests
            this.logger.info("Painter repeatable quests added to quest config");
        }

        this.registerProfileImage(PreSptModLoader, imageRouter);
        this.setupTraderUpdateTime(traderConfig);
        this.setupTraderServices(traderConfig);

        Traders["668aaff35fd574b6dcc4a686"] = "668aaff35fd574b6dcc4a686";
    }

    public postDBLoad(container: DependencyContainer): void 
    {
        this.configServer = container.resolve<ConfigServer>("ConfigServer");
        this.ragfairConfig = this.configServer.getConfig(ConfigTypes.RAGFAIR)

        const configServer: ConfigServer = container.resolve<ConfigServer>("ConfigServer")
        const imageRouter: ImageRouter = container.resolve<ImageRouter>("ImageRouter")
        const jsonUtil: JsonUtil = container.resolve<JsonUtil>("JsonUtil")
        const databaseServer: DatabaseServer = container.resolve<DatabaseServer>("DatabaseServer")

        const databaseService = container.resolve<DatabaseService>("DatabaseService")
        const customItem = container.resolve<CustomItemService>("CustomItemService")
        const inventoryConfig: IInventoryConfig = configServer.getConfig(ConfigTypes.INVENTORY)
        const tables: IDatabaseTables = databaseService.getTables()

        if (configJson.enableRepeatableQuests) 
        {
            const repeatableQuests = databaseServer.getTables().templates.repeatableQuests;
            const rqLocales = databaseServer.getTables().locales.global.en;

            if (repeatableQuests.templates.Elimination) 
            {
                repeatableQuests.templates.Elimination.successMessageText = "A damn beast you are, hehe. Good work, here's your share.";
                repeatableQuests.templates.Elimination.description = "I have a mission for you. I need you to eliminate some trash from Tarkov's streets. You up for it?";
            }
            if (repeatableQuests.templates.Completion) 
            {
                repeatableQuests.templates.Completion.successMessageText = "There you are! You got everything? Good stuff.";
                repeatableQuests.templates.Completion.description = "I have a mission for you. I need you to gather some items for me. You up for it?";
            }
            if (repeatableQuests.templates.Exploration) 
            {
                repeatableQuests.templates.Exploration.successMessageText = "Marvelous, young man. Thank you for some fine work.";
                repeatableQuests.templates.Exploration.description = "Ah, mercenary, do you want to do a good deed? My clients are asking to ensure a safe area to conduct a specific secret operation. I would like to appoint you for this, as you are the most competent of the local workers. You will have to survey the area and report back to me. Good luck.";
            }

            // Update localization files
            rqLocales["616041eb031af660100c9967 successMessageText 668aaff35fd574b6dcc4a686 0"] = "Marvelous, young man. Thank you for the work.";
            rqLocales["616041eb031af660100c9967 description 668aaff35fd574b6dcc4a686 0"] = "Ah, mercenary, do you want to do a good deed? My clients are asking to ensure a safe area to conduct a specific secret operation. I would like to appoint you for this, as you are the most competent of the local workers. You will have to survey the area and report back to me. Good luck.";
            rqLocales["61604635c725987e815b1a46 successMessageText 668aaff35fd574b6dcc4a686 0"] = "There you are! You got everything? Good stuff.";
            rqLocales["61604635c725987e815b1a46 description 668aaff35fd574b6dcc4a686 0"] = "I have a mission for you. I need you to gather some items for me. You up for it?";
            rqLocales["616052ea3054fc0e2c24ce6e successMessageText 668aaff35fd574b6dcc4a686 0"] = "A damn beast you are, hehe. Good work, here's your share.";
            rqLocales["616052ea3054fc0e2c24ce6e description 668aaff35fd574b6dcc4a686 0"] = "I have a mission for you. I need you to eliminate some trash from Tarkov's streets. You up for it?";

            this.logger.info("Painter repeatable quest messages added to localization files");
        }

        this.addTraderToDb(baseJson, tables, jsonUtil)
        this.addTraderToLocales(tables, baseJson.name, "Ivan Samoylov", baseJson.nickname, baseJson.location, "Ivan Samoylov is a master craftsman renowned for his exceptional skill in creating exquisite weapon cosmetics. With an innate talent for blending artistry and functionality, he transforms ordinary weapons into mesmerizing works of art.")
        this.ragfairConfig.traders[baseJson._id] = true

        this.importQuests(tables)
        this.importQuestLocales(tables)
        this.routeQuestImages(imageRouter)

        // Create all custom items using the CustomItemsManager
        const customItemsManager = new CustomItemsManager(this.logger);
        customItemsManager.createCustomItems(customItem, configServer, tables, inventoryConfig, configJson.enableLootBoxes);
    }

    private registerProfileImage(preSptModLoader: PreSptModLoader, imageRouter: ImageRouter): void
    {
        const imageFilepath = `./${preSptModLoader.getModPath(this.mod)}res`

        imageRouter.addRoute(baseJson.avatar.replace(".jpg", ""), `${imageFilepath}/painter.jpg`)
    }

    private setupTraderUpdateTime(traderConfig: ITraderConfig): void 
    {
        const traderRefreshRecord: IUpdateTime = { traderId: baseJson._id, seconds: { min: 2000, max: 6600 } }

        traderConfig.updateTime.push(traderRefreshRecord)
    }

    private setupTraderServices(traderConfig: ITraderConfig): void
    {
        const traderId = baseJson._id;
        if (!traderConfig.moddedTraders)
        {
            traderConfig.moddedTraders = { clothingService: [] };
        }
        traderConfig.moddedTraders.clothingService.push(traderId);
    }

    private addTraderToDb(traderDetailsToAdd: any, tables: IDatabaseTables, jsonUtil: JsonUtil): void
    {
        tables.traders[traderDetailsToAdd._id] = {
            assort: jsonUtil.deserialize(jsonUtil.serialize(assortJson)) as ITraderAssort,
            base: jsonUtil.deserialize(jsonUtil.serialize(traderDetailsToAdd)) as ITraderBase,
            questassort: {
                started: {},
                success: {
                    "672e2804a0529208b4e10e18": "668aad3c3ff8f5b258e3a65b",
                    "672e284a363b798192b802af": "668c18eb12542b3c3ff6e20f",
                    "672e289bb4096716fcb918a7": "668c18eb12542b3c3ff6e20f"
                },
                fail: {}
            }
        }
    }

    private addTraderToLocales(tables: IDatabaseTables, fullName: string, firstName: string, nickName: string, location: string, description: string)
    {
        const locales = Object.values(tables.locales.global) as Record<string, string>[]
        for (const locale of locales)
        {
            locale[`${baseJson._id} FullName`] = fullName
            locale[`${baseJson._id} FirstName`] = firstName
            locale[`${baseJson._id} Nickname`] = nickName
            locale[`${baseJson._id} Location`] = location
            locale[`${baseJson._id} Description`] = description
        }
    }

    public loadFiles(dirPath, extName, cb)
    {
        if (!fs.existsSync(dirPath)) return
        const dir = fs.readdirSync(dirPath, { withFileTypes: true })
        dir.forEach(item =>
        {
            const itemPath = path.normalize(`${dirPath}/${item.name}`)
            if (item.isDirectory()) this.loadFiles(itemPath, extName, cb)
            else if (extName.includes(path.extname(item.name))) cb(itemPath)
        });
    }

    public importQuests(tables)
    {
        this.loadFiles(`${modPath}/db/quests/`, [".json"], function (filePath)
        {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const item = require(filePath)
            if (Object.keys(item).length < 1) return
            for (const quest in item)
            {
                tables.templates.quests[quest] = item[quest]
            }
        })
    }

    public importQuestLocales(tables)
    {
        const serverLocales = ["ch", "cz", "en", "es", "es-mx", "fr", "ge", "hu", "it", "jp", "pl", "po", "ru", "sk", "tu"]
        const addedLocales = {}

        for (const locale of serverLocales)
        {
            this.loadFiles(`${modPath}/db/locales/${locale}`, [".json"], function (filePath)
            {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const localeFile = require(filePath)
                if (Object.keys(localeFile).length < 1) return
                for (const currentItem in localeFile)
                {
                    tables.locales.global[locale][currentItem] = localeFile[currentItem]
                    if (!Object.keys(addedLocales).includes(locale)) addedLocales[locale] = {}
                    addedLocales[locale][currentItem] = localeFile[currentItem]
                }
            })
        }

        for (const locale of serverLocales)
        {
            if (locale == "en") continue
            for (const englishItem in addedLocales["en"])
            {
                if (locale in addedLocales)
                {
                    if (englishItem in addedLocales[locale]) continue
                }
                if (tables.locales.global[locale] != undefined) tables.locales.global[locale][englishItem] = addedLocales["en"][englishItem]
            }
        }
    }

    public routeQuestImages(imageRouter)
    {
        this.loadFiles(`${modPath}/res/quests/`, [".png", ".jpg"], function (filePath)
        {
            imageRouter.addRoute(`/files/quest/icon/${path.basename(filePath, path.extname(filePath))}`, filePath);
        })
    }
}

module.exports = { mod: new PainterTrader() }
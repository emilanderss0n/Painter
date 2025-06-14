import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { CustomItemService } from "@spt/services/mod/CustomItemService";
import { NewItemFromCloneDetails } from "@spt/models/spt/mod/NewItemDetails";
import { IItemConfig } from "@spt/models/spt/config/IItemConfig";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { IInventoryConfig } from "@spt/models/spt/config/IInventoryConfig";
import { ILogger } from "@spt/models/spt/utils/ILogger";

/**
 * Manages creation of custom items for the Painter mod
 */
export class CustomItemsManager 
{
    constructor(private logger: ILogger) 
    {}

    /**
     * Create all custom items for the Painter mod
     */
    public createCustomItems(
        customItemService: CustomItemService, 
        configServer: ConfigServer, 
        tables: IDatabaseTables, 
        inventoryConfig: IInventoryConfig,
        enableLootBoxes: boolean
    ): void 
    {
        // Create figurines
        this.createFigurines(customItemService, configServer, tables);
        
        // Create loot boxes if enabled
        if (enableLootBoxes) 
        {
            this.createLootBoxes(customItemService, tables, inventoryConfig);
        }
    }

    /**
     * Create Batman and Golden Turd figurines
     */
    private createFigurines(customItemService: CustomItemService, configServer: ConfigServer, tables: IDatabaseTables): void 
    {
        const batmanFigurine: NewItemFromCloneDetails = {
            itemTplToClone: "655c67782a1356436041c9c5",
            overrideProperties: {
                Name: "Batman figurine",
                ShortName: "Batman",
                Description: "Rare larger figurine of Batman, a superhero of the American comic book publisher DC Comics, Batman.",
                Prefab: {
                    "path": "figurine_batman.bundle",
                    "rcid": ""
                },
                CanRequireOnRagfair: false,
                CanSellOnRagfair: true
            },
            parentId: "57864a3d24597754843f8721",
            newId: "672e2e75d78fe9e90c8cb393",
            fleaPriceRoubles: 154000,
            handbookPriceRoubles: 154000,
            handbookParentId: "5b47574386f77428ca22b2f1",
            locales: {
                en: {
                    name: "Batman figurine",
                    shortName: "Batman",
                    description: "Rare larger figurine of Batman, a superhero of the American comic book publisher DC Comics, Batman."
                }
            }
        };

        const dodoFigurine: NewItemFromCloneDetails = {
            itemTplToClone: "59e3647686f774176a362507",
            overrideProperties: {
                Name: "Golden Turd figurine",
                ShortName: "Turd",
                Description: "Awarded to the master of annoying tasks, it is said that it was made from the golden poop of a dodo bird.",
                Prefab: {
                    "path": "dodo338383899.bundle",
                    "rcid": ""
                },
                CanRequireOnRagfair: false,
                CanSellOnRagfair: false,
                Weight: 69,
                ExaminedByDefault: false
            },
            parentId: "57864a3d24597754843f8721",
            newId: "684db00229850b2f1f7832c1",
            fleaPriceRoubles: 69,
            handbookPriceRoubles: 69,
            handbookParentId: "5b47574386f77428ca22b2f1",
            locales: {
                en: {
                    name: "Golden Turd figurine",
                    shortName: "Turd",
                    description: "Awarded to the master of annoying tasks, it is said that it was made from the golden poop of a dodo bird."
                }
            }
        };

        customItemService.createItemFromClone(batmanFigurine);
        customItemService.createItemFromClone(dodoFigurine);
        this.logger.info("Painter custom items added");

        // Add figurines to Hall of Fame
        this.addToHallOfFame(tables, "672e2e75d78fe9e90c8cb393", "655c67782a1356436041c9c5", "Batman figurine");
        this.addToHallOfFame(tables, "684db00229850b2f1f7832c1", "59e3647686f774176a362507", "Golden Turd figurine");

        // Prevent dodoFigurine from being lootable
        this.preventDodoFromBeingLootable(configServer);
    }

    /**
     * Create mystery loot boxes
     */
    private createLootBoxes(customItemService: CustomItemService, tables: IDatabaseTables, inventoryConfig: IInventoryConfig): void 
    {
        const mysteryBoxOne: NewItemFromCloneDetails = {
            itemTplToClone: "6489b2b131a2135f0d7d0fcb",
            overrideProperties: {
                Name: "Painter's Special Delivery",
                ShortName: "Painter Lootbox",
                Description: "A lootbox filled with various items, including some of the most sought after barter items.",
                Weight: 25,
                Prefab: {
                    "path": "mysterybox.bundle",
                    "rcid": ""
                },
                Width: 4,
                Height: 4,
                BackgroundColor: "blue",
                CanRequireOnRagfair: false,
                CanSellOnRagfair: false
            },
            parentId: "62f109593b54472778797866",
            newId: "668ff5bde41a0cce3b142464",
            fleaPriceRoubles: 500000,
            handbookPriceRoubles: 500000,
            handbookParentId: "5b5f6fa186f77409407a7eb7",
            locales: {
                en: {
                    name: "Painter's Special Delivery",
                    shortName: "Painter Lootbox",
                    description: "A lootbox filled with 20 items, including some of the most sought after barter items. Get a LEDX or go broke. The choise is yours."
                }
            }
        };

        customItemService.createItemFromClone(mysteryBoxOne);

        // Change item _name to remove it from the *actual* sealed weapon crate logic, this removes it from airdrops and allows easier access to change the contents
        const customIteminDB = tables.templates.items["668ff5bde41a0cce3b142464"];
        customIteminDB._name = "668ff5bde41a0cce3b142464";

        // Configure loot pool for mystery box
        this.configureMysteryBoxLoot(inventoryConfig);

        const mysteryBoxTwo: NewItemFromCloneDetails = {
            itemTplToClone: "6489981f7063b903ff4b8565",
            overrideProperties: {
                Name: "Painter's War Box",
                ShortName: "Painter Warbox",
                Description: "A lootbox filled with various items, some of the most sought after military items.",
                Weight: 30,
                Prefab: {
                    "path": "mysterybox_2.bundle",
                    "rcid": ""
                },
                Width: 4,
                Height: 3,
                BackgroundColor: "blue",
                CanRequireOnRagfair: false,
                CanSellOnRagfair: false
            },
            parentId: "62f109593b54472778797866",
            newId: "6699546547ad52e0fccf6da9",
            fleaPriceRoubles: 500000,
            handbookPriceRoubles: 500000,
            handbookParentId: "5b5f6fa186f77409407a7eb7",
            locales: {
                en: {
                    name: "Painter's War Box",
                    shortName: "Painter Warbox",
                    description: "A lootbox filled with various items, some of the most sought after military items."
                }
            }
        };

        customItemService.createItemFromClone(mysteryBoxTwo);
        this.logger.info("Painter loot boxes added");
    }

    /**
     * Configure the mystery box loot pool with various high-value items
     */
    private configureMysteryBoxLoot(inventoryConfig: IInventoryConfig): void 
    {
        inventoryConfig.randomLootContainers["668ff5bde41a0cce3b142464"] = {
            rewardCount: 20,
            foundInRaid: true,
            rewardTplPool: {
                "5bc9be8fd4351e00334cae6e": 5,
                "5d03794386f77420415576f5": 1,
                "5672cb124bdc2d1a0f8b4568": 10,
                "6389c85357baa773a825b356": 1,
                "59faf98186f774067b6be103": 5,
                "5d1b32c186f774252167a530": 5,
                "590de71386f774347051a052": 5,
                "590de7e986f7741b096e5f32": 5,
                "573475fb24597737fb1379e1": 10,
                "6389c6c7dbfd5e4b95197e68": 5,
                "5e2af4d286f7746d4159f07a": 5,
                "62a0a098de7ac8199358053b": 5,
                "62a091170b9d3c46de5b6cf2": 5,
                "5bc9c049d4351e44f824d360": 5,
                "62a08f4c4f842e1bd12d9d62": 5,
                "57347c5b245977448d35f6e1": 10,
                "59e361e886f774176c10a2a5": 5,
                "62a0a043cf4a99369e2624a5": 5,
                "59e3606886f77417674759a5": 5,
                "56742c324bdc2d150f8b456d": 10,
                "5c1265fc86f7743f896a21c2": 5,
                "5d1b309586f77425227d1676": 10,
                "59e3639286f7741777737013": 1,
                "619cbfeb6b8a1b37a54eebfa": 5,
                "5c06779c86f77426e00dd782": 10,
                "5e54f6af86f7742199090bf3": 5,
                "5af0484c86f7740f02001f7f": 10,
                "60391a8b3364dc22b04d0ce5": 5,
                "62a09ee4cf4a99369e262453": 10,
                "5c06782b86f77426df5407d2": 10,
                "5733279d245977289b77ec24": 5,
                "59e3658a86f7741776641ac4": 5,
                "573474f924597738002c6174": 5,
                "5c1267ee86f77416ec610f72": 5,
                "57347b8b24597737dd42e192": 10,
                "59e358a886f7741776641ac3": 5,
                "590c2c9c86f774245b1f03f2": 10,
                "5e2af41e86f774755a234b67": 5,
                "59e35cbb86f7741778269d83": 5,
                "5734779624597737e04bf329": 10,
                "56742c284bdc2d98058b456d": 10,
                "5e2aee0a86f774755a234b62": 5,
                "590a386e86f77429692b27ab": 5,
                "5bc9b9ecd4351e3bac122519": 5,
                "5d1b3f2d86f774253763b735": 5,
                "590a373286f774287540368b": 5,
                "57347c1124597737fb1379e3": 10,
                "5734781f24597737e04bf32a": 5,
                "5672cb304bdc2dc2088b456a": 5,
                "59e35de086f7741778269d84": 5,
                "5d1b2fa286f77425227d1674": 5,
                "6389c70ca33d8c4cdf4932c6": 5,
                "590a3cd386f77436f20848cb": 10,
                "5d1b371186f774253763a656": 5,
                "6389c7f115805221fb410466": 1,
                "63a0b208f444d32d6f03ea1e": 1,
                "5bc9b355d4351e6d1509862a": 5,
                "5d63d33b86f7746ea9275524": 10,
                "5d4042a986f7743185265463": 10,
                "5e2af47786f7746d404f3aaa": 5,
                "5d1b2f3f86f774252167a52c": 1,
                "5b43575a86f77424f443fe62": 5,
                "590a3efd86f77437d351a25b": 5,
                "590c595c86f7747884343ad7": 5,
                "5672cb724bdc2dc2088b456b": 5,
                "5bc9b720d4351e450201234b": 5,
                "62a09cfe4f842e1bd12da3e4": 5,
                "5734758f24597738025ee253": 5,
                "5bc9bc53d4351e00367fbcee": 5,
                "5d235a5986f77443f6329bc6": 5,
                "57347ca924597744596b4e71": 1,
                "5e2aedd986f7746d404f3aa4": 5,
                "5d6fc78386f77449d825f9dc": 5,
                "5d6fc87386f77449db3db94e": 5,
                "590c5a7286f7747884343aea": 5,
                "5d1b317c86f7742523398392": 5,
                "573478bc24597738002c6175": 5,
                "5e2af2bc86f7746d3f3c33fc": 5,
                "5734795124597738002c6176": 10,
                "5d0377ce86f774186372f689": 1,
                "5e2af29386f7746d4159f077": 5,
                "5c0530ee86f774697952d952": 1,
                "5d1b392c86f77425243e98fe": 10,
                "60b0f7057897d47c5b04ab94": 5,
                "60b0f561c4449e4cb624c1d7": 5,
                "590a391c86f774385a33c404": 5,
                "573476d324597737da2adc13": 10,
                "5b4335ba86f7744d2837a264": 5,
                "619cc01e0a7c3a1a2731940c": 5,
                "5d40419286f774318526545f": 10,
                "5d1b36a186f7742523398433": 1,
                "61bf7b6302b3924be92fa8c3": 10,
                "6389c7750ef44505c87f5996": 1,
                "5d0375ff86f774186372f685": 1,
                "5d0376a486f7747d8050965c": 1,
                "5c052f6886f7746b1e3db148": 1,
                "619cbf476b8a1b37a54eebf8": 5,
                "5d03784a86f774203e7e0c4d": 1,
                "5d0378d486f77420421a5ff4": 1,
                "5d40425986f7743185265461": 10,
                "5d1b2ffd86f77425243e8d17": 10,
                "5d0379a886f77420407aa271": 1,
                "5bc9c377d4351e3bac12251b": 5,
                "5af0534a86f7743b6f354284": 5,
                "5d4041f086f7743cac3f22a7": 5,
                "59e3556c86f7741776641ac2": 10,
                "5e2af02c86f7746d420957d4": 10,
                "590c31c586f774245e3141b2": 10,
                "59e35ef086f7741777737012": 10,
                "59e35abd86f7741778269d82": 5,
                "59e3596386f774176c10a2a2": 5,
                "5c12688486f77426843c7d32": 5,
                "573477e124597737dd42e191": 10,
                "5d03775b86f774203e7e0c4b": 1,
                "5d1b313086f77425227d1678": 10,
                "59faff1d86f7746c51718c9c": 1,
                "59e366c186f7741778269d85": 10,
                "5d1b3a5d86f774252167ba22": 5,
                "619cbfccbedcde2f5b3f7bdd": 5,
                "590c2b4386f77425357b6123": 10,
                "5af04b6486f774195a3ebb49": 10,
                "5c052e6986f7746b207bc3c9": 1,
                "5af0561e86f7745f5f3ad6ac": 5,
                "59e36c6f86f774176c10a2a7": 5,
                "57347c2e24597744902c94a1": 5,
                "5d1b327086f7742525194449": 5,
                "62a09cb7a04c0c5c6e0a84f8": 5,
                "590a3b0486f7743954552bdb": 1,
                "577e1c9d2459773cd707c525": 5,
                "59fafb5d86f774067a6f2084": 1,
                "5d1c774f86f7746d6620f8db": 10,
                "57347baf24597738002c6178": 10,
                "60391afc25aff57af81f7085": 1,
                "5e54f62086f774219b0f1937": 5,
                "590a358486f77429692b2790": 5,
                "5e2aef7986f7746d3f3c33f5": 5,
                "5e2af4a786f7746d3f3c3400": 5,
                "59faf7ca86f7740dbe19f6c2": 5,
                "5d1b31ce86f7742523398394": 10,
                "5d40412b86f7743cb332ac3a": 5,
                "590c2d8786f774245b1f03f3": 10,
                "57347c77245977448d35f6e2": 10,
                "62a0a0bb621468534a797ad5": 5,
                "61bf83814088ec1a363d7097": 5,
                "590c35a486f774273531c822": 10,
                "5d1b39a386f774252339976f": 10,
                "5bc9bdb8d4351e003562b8a1": 5,
                "5e2af00086f7746d3f3c33f7": 10,
                "5c13cd2486f774072c757944": 10,
                "590a3c0a86f774385a33c450": 10,
                "5734770f24597738025ee254": 10,
                "5e2af37686f774755a234b65": 10,
                "5c12620d86f7743f8b198b72": 1,
                "5c13cef886f774072e618e82": 10,
                "590c2e1186f77425357b6124": 5,
                "57347c93245977448d35f6e3": 10,
                "60391b0fb847c71012789415": 5,
                "57347cd0245977445a2d6ff1": 10,
                "5e2af22086f7746d3f3c33fa": 10,
                "5c052fb986f7746b2101e909": 1,
                "590a3d9c86f774385926e510": 10,
                "5909e99886f7740c983b9984": 10,
                "5f745ee30acaeb0d490d8c5b": 5,
                "5c05308086f7746b2101e90b": 1,
                "5c05300686f7746dce784e5d": 1,
                "5d1b385e86f774252167b98a": 5,
                "590c5bbd86f774785762df04": 10,
                "590c5c9f86f77477c91c36e7": 10,
                "5d1c819a86f774771b0acd6c": 5,
                "573476f124597737e04bf328": 10,
                "59e3647686f774176a362507": 5,
                "5d1b304286f774253763a528": 5,
                "590c311186f77424d1667482": 5,
                "590c346786f77423e50ed342": 10,
                "56742c2e4bdc2d95058b456d": 10
            }
        };
    }

    /**
     * Add custom figurines to Hall of Fame filters
     */
    private addToHallOfFame(tables: IDatabaseTables, newItemId: string, originalItemId: string, itemName: string): void 
    {
        const hallOfFame1 = tables.templates.items["63dbd45917fff4dee40fe16e"];
        const hallOfFame2 = tables.templates.items["65424185a57eea37ed6562e9"];
        const hallOfFame3 = tables.templates.items["6542435ea57eea37ed6562f0"];
        
        const hallOfFames = [hallOfFame1, hallOfFame2, hallOfFame3];
        let totalAdditions = 0;
        
        hallOfFames.forEach((hall) => 
        {
            if (hall && hall._props && hall._props.Slots) 
            {
                let additionsThisHall = 0;
                for (const slot of hall._props.Slots) 
                {
                    if (slot._props && slot._props.filters) 
                    {
                        for (const filter of slot._props.filters) 
                        {
                            // Only add the new item if the original cloned item is already in this filter
                            if (filter.Filter && filter.Filter.includes(originalItemId) && !filter.Filter.includes(newItemId)) 
                            {
                                filter.Filter.push(newItemId);
                                additionsThisHall++;
                                totalAdditions++;
                            }
                        }
                    }
                }
                if (additionsThisHall > 0) 
                {
                    this.logger.debug(`Added ${itemName} to ${additionsThisHall} slot(s) in ${hall._name}`);
                }
            }
        });
        
        if (totalAdditions > 0) 
        {
            this.logger.debug(`Successfully added ${itemName} (${newItemId}) to ${totalAdditions} total Hall of Fame slot(s)`);
        } 
        else 
        {
            this.logger.debug(`WARNING: No Hall of Fame slots found for ${itemName} - original item ${originalItemId} may not be in any Hall of Fame filters`);
        }
    }

    /**
     * Prevent the Golden Turd figurine from being lootable
     */
    private preventDodoFromBeingLootable(configServer: ConfigServer): void 
    {
        const itemConfig: IItemConfig = configServer.getConfig(ConfigTypes.ITEM);
        const dodoFigurineId = "684db00229850b2f1f7832c1";
        
        // Add to lootable item blacklist to prevent it from spawning in any loot containers or loose loot
        if (!itemConfig.lootableItemBlacklist.includes(dodoFigurineId)) 
        {
            itemConfig.lootableItemBlacklist.push(dodoFigurineId);
        }
    }
}

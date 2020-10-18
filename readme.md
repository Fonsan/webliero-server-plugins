// declare interface WLInitOptions {
//     roomName?: string
//     password?: string
//     maxPlayers?: number
//     public?: boolean
//     geo?: {code: string, lat: number, lon: number}
//     token?: string
// }

// declare interface WLJoiningPlayer extends WLPlayer{
//     auth: string;
//     conn: string;
// }

// declare interface WLPlayer {
//     id: number;
//     name: string;
//     admin: boolean;
//     team: number;
// }

// declare interface WLGameSettings {
//     scoreLimit: number;
//     timeLimit: number;
//     loadingTimes: number;
//     gameMode: "dm" | "tdm" | "lms" | "htf";
//     teamsLocked: boolean;
//     forceRandomizeWeapons: boolean;
//     damageMultiplier: number;
//     levelPool: "rng" | "all" | "allBest" | "arenasBest" | "arenasGood" | "arenasOk" | "arenas" | "crampedBest" | "crampedGood" | "crampedOk" | "cramped";
//     expandLevel: boolean;
//     respawnDelay: number;
//     reloadWeaponsOnSpawn: boolean;
//     lockWeaponsDuringMatch: boolean;
//     bonusSpawnFrequency: number;
//     bonusDrops: "health" | "weapons" | "healthAndWeapons" | "none";
//     maxDuplicateWeapons: number;
//     weaponChangeDelay: number;
// }

// declare type WLTextStyle = "normal"|"bold"|"italic"|"small"|"small-bold"|"small-italic";

// declare interface WLRoom {
//     sendAnnouncement(message: string, targetId?:number, color?:number, style?: WLTextStyle, sound?:number): void;
//     setPlayerAdmin(id: number, admin: boolean): void;
//     setPlayerTeam(id: number, team: number): void;
//     kickPlayer(id: number, reason: string, ban: boolean): void;
//     clearBan(id: number): void;
//     clearBans(): void;
//     restartGame(): void;
//     endGame(): void;
//     setPassword(password?: string): void;
//     setSettings(settingsObj: Partial<WLGameSettings>): void;
//     loadLev(filename: string, data: ArrayBuffer): void;
//     loadMod(zipData: ArrayBuffer): void;
//     getPlayerList(): WLPlayer[];
//     getSettings(): WLGameSettings;
//     getPlayer(id: number): WLPlayer | null;
//     getPlayerScore(id: number): {kills: number, deaths: number, score: number} | null;
//     getTeamScore(team: number): number;


// sendChat
// sendAnnouncement
// setPlayerAdmin
// setPlayerTeam
// kickPlayer
// clearBan
// clearBans
// restartGame
// endGame
// setPassword
// setSettings
// loadLev
// loadPNGLevel
// loadRawLevel
// loadMod
// getPlayerList
// getSettings
// getPlayer
// getPlayerScore
// getTeamScore

//     onPlayerJoin: (player : WLJoiningPlayer) => void;
//     onPlayerLeave: (player : WLPlayer) => void;
//     onPlayerKicked: (player : WLPlayer, reason : string, ban : boolean, byPlayer : WLPlayer) => void;
//     onPlayerChat: (player : WLPlayer, message : string) => boolean;
//     onPlayerTeamChange: (player : WLPlayer, byPlayer : WLPlayer) => void;
//     onPlayerAdminChange: (player : WLPlayer, byPlayer : WLPlayer) => void;
//     onGameTick: () => void;
//     onPlayerActivity: (player : WLPlayer) => void;
//     onRoomLink: (link: string) => void;
//     onGameStart: () => void;
//     onGameEnd: () => void;
//     onGameEnd2: () => void;
//     onPlayerKilled: (killed : WLPlayer, killer : WLPlayer) => void;
// }

// declare interface Window {
//     WLInit(options: WLInitOptions): WLRoom;
//     onWLLoaded: () => void;
// }

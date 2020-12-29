const fs = require("fs");
const demofile = require("demofile");

let currentRound = 1;
let game = []

const readAndParseDemo = (filepath) => {

    fs.readFile(filepath,  (err, buffer) => {
        const demoFile = new demofile.DemoFile();

        demoFile.gameEvents.on("round_start", e => {
            game.push({
                ["Round" + currentRound]: {
                    kills: [],
                    grenades: {
                        flashes: [],
                        smokes: [],
                        hegrenades: [],
                        molotovs: [],
                        decoys: []
                    },               
                    score: {}
                }
            })
        });

        demoFile.gameEvents.on("round_officially_ended", e => {
            const teams = demoFile.teams;

            const terrorists = teams[2];
            const cts = teams[3];

            game[currentRound - 1]["Round"+currentRound].score = {
                    [terrorists.clanName]:  terrorists.score,
                    [cts.clanName]: cts.score,
            }

            currentRound++
        });

        demoFile.gameEvents.on("player_death", e => {
            const victim = demoFile.entities.getByUserId(e.userid);
            const victimName = victim ? victim.name : "unnamed";
            const attacker = demoFile.entities.getByUserId(e.attacker);
            const attackerName = attacker ? attacker.name : "unnamed";
            const attackerPlace = attacker ? attacker.placeName : "unkownPlace";
            const attackerPosition = attacker ? attacker.position : "unknownPosition"
            const assister = demoFile.entities.getByUserId(e.assister);
            const assisterName = assister ? assister.name : null
            const flashAssister = demoFile.entities.getByUserId(e.assistedflash);
            const flashAssisterName = flashAssister ? flashAssister.name : null

            const time = demoFile.currentTime;

            let index = currentRound -1

            if(game[index]) {
                game[index]["Round"+currentRound].kills.push({
                    time: time,
                    attackerPlace: attackerPlace,
                    attackerPosition: attackerPosition,
                    attackerName: attackerName,
                    assister: assisterName,
                    flashAssister: flashAssisterName,
                    noscope: e.noscope,
                    thrusmoke: e.thrusmoke,
                    attackerblind: e.attackerblind,
                    weapon: e.weapon,
                    headshot: e.headshot ? true : false,
                    victimName: victimName
                })
            }
        });

        demoFile.gameEvents.on("flashbang_detonate", e => {

            const thrownBy = demoFile.entities.getByUserId(e.userid);
            const thrownByName = thrownBy ? thrownBy.name : "unnamed";

            let index = currentRound -1
            const time = demoFile.currentTime;

            if(game[index]) {
                game[index]["Round"+currentRound].grenades.flashes.push({
                    time: time,
                    thrownBy: thrownByName,
                    position: {
                        x: e.x,
                        y: e.y,
                        z: e.z
                    }
                })
            }
        })

        demoFile.gameEvents.on("smokegrenade_detonate", e => {

            const thrownBy = demoFile.entities.getByUserId(e.userid);
            const thrownByName = thrownBy ? thrownBy.name : "unnamed";

            let index = currentRound -1
            const time = demoFile.currentTime;

            if(game[index]) {
                game[index]["Round"+currentRound].grenades.smokes.push({
                    time: time,
                    thrownBy: thrownByName,
                    position: {
                        x: e.x,
                        y: e.y,
                        z: e.z
                    }
                })
            }
        })
        
        demoFile.gameEvents.on("hegrenade_detonate", e => {

            const thrownBy = demoFile.entities.getByUserId(e.userid);
            const thrownByName = thrownBy ? thrownBy.name : "unnamed";

            let index = currentRound -1
            const time = demoFile.currentTime;

            if(game[index]) {
                game[index]["Round"+currentRound].grenades.hegrenades.push({
                    time: time,
                    thrownBy: thrownByName,
                    position: {
                        x: e.x,
                        y: e.y,
                        z: e.z
                    }
                })
            }
        })

        demoFile.gameEvents.on("inferno_startburn", e => {
            const molotovID = demoFile.entities.entities[e.entityid]
            const thrownBy = molotovID.owner;
            const thrownByName = thrownBy ? thrownBy.name : "unnamed";

            let index = currentRound -1
            const time = demoFile.currentTime;

            if(game[index]) {
                game[index]["Round"+currentRound].grenades.molotovs.push({
                    time: time,
                    thrownBy: thrownByName,
                    position: {
                        x: e.x,
                        y: e.y,
                        z: e.z
                    }
                })
            }
        })

        demoFile.gameEvents.on("decoy_detonate", e => {

            const thrownBy = demoFile.entities.getByUserId(e.userid);
            const thrownByName = thrownBy ? thrownBy.name : "unnamed";

            let index = currentRound -1
            const time = demoFile.currentTime;

            if(game[index]) {
                game[index]["Round"+currentRound].grenades.decoys.push({
                    time: time,
                    thrownBy: thrownByName,
                    position: {
                        x: e.x,
                        y: e.y,
                        z: e.z
                    }
                })
            }
        })

        demoFile.gameEvents.on("cs_match_end_restart", e => {
            //match is over, write json file - not sure if this is the best approach
            game.pop()
            let data = JSON.stringify(game);
            fs.writeFileSync("analyzedDemo.json", data);
        })

        demoFile.parse(buffer)
        
    });
}


readAndParseDemo("testGOTV.dem");

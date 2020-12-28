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

            if(terrorists.score == 16 || cts.score == 16) {
                let data = JSON.stringify(game);
                fs.writeFileSync("analyzedDemo.json", data)
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

        demoFile.parse(buffer)
        
    });
}


readAndParseDemo("testGOTV.dem");

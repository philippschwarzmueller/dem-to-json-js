const fs = require("fs");
const demofile = require("demofile");

let currentRound = 1;

let game = []


const readAndParseDemo = () => {

    fs.readFile("testGOTV.dem",  (err, buffer) => {
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

            const headshotText = e.headshot ? " HS" : "";

            const time = demoFile.currentTime;

            let index = currentRound -1

            if(game[index]) {
                game[index]["Round"+currentRound].kills.push({
                    time: time,
                    attackerPlace: attackerPlace,
                    attackerName: attackerName,
                    weapon: e.weapon,
                    headshot: e.headshot ? true : false,
                    victimName: victimName
                })
            }
        });

        demoFile.parse(buffer)
        
    });
}


readAndParseDemo();

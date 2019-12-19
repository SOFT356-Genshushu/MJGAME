var PlayerManager = require("./../../model/PlayerManager.js");


class User extends PlayerManager{
    constructor(){
        super();
    }

    setPlayerGameInstance(playerId,table){
        var info = this.playerInfos.getOrCreate(playerId);
        info.gameInstance = table;
    }

    getPlayerGameInstance(playerId){
        var info = this.playerInfos.getOrCreate(playerId);
        return info.gameInstance;
    }

    send(playerId,eventName,data){
        var session = this.getSession(playerId);
        if(session){
            try{
                session.proxy[eventName](data);
            }catch(e){

            }
        }
    }

    deletePlayer(playerId){
        this.playerInfos.remove(playerId);
    }
}
User.g=new User();
module.exports = User.g;
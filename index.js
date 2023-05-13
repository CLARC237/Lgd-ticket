const { Client } = require("discord.js"); 
const { token, guildId } = require("./settings"); 


const client = new Client({   
  intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"], 
});  


client.on("ready", async () => {   
  console.log(`${client.user.username} est en ligne`);   
  
  
  let guild = client.guilds.cache.get(guildId);   

  if (guild) {     
    await guild.commands.set([       
      {         
        name: "ping",         
        description: `teste la latence du bot`,         
        type: "CHAT_INPUT",       
      },       
      {         
        name: "setup",         
        description: `configure le système de tickets`,         
        type: "CHAT_INPUT",       
      },     
    ]);   
  }   

  
  require("./ticket_system")(client); 
});  


client.login(token);
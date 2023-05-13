const { Client, MessageEmbed, MessageActionRow, MessageButton, Modal, TextInputComponent } = require("discord.js");
const settings = require("./settings");

/**
 * @ {Client} client
 */
module.exports = async (client) => {


  
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      if (interaction.commandName == "ping") {
        return interaction.reply({
          content: `> Pong :: ${client.ws.ping}`,
        });
      } else if (interaction.commandName == "setup") {
        

        
        let ticketChannel = interaction.guild.channels.cache.get(settings.ticketChannel);
        if (!ticketChannel) return;

        
        let embed = new MessageEmbed()
          .setColor("BLURPLE")
          .setTitle(`Système de Tickets`)
          .setDescription(`> Cliquez sur le bouton pour créer un ticket`);

       
        let btnrow = new MessageActionRow().addComponents([
          new MessageButton()
            .setCustomId("ticket_create")
            .setStyle("SECONDARY")
            .setLabel(`Créer un Ticket`)
            .setEmoji("🎟️"),
        ]);

        
        await ticketChannel.send({
          embeds: [embed],
          components: [btnrow],
        });

        interaction.reply({
          content: `Le système de tickets a été configuré dans ${ticketChannel}`,
        });
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId == "ticket_create") {
       
        const ticket_modal = new Modal()
          .setTitle("Système de Tickets")
          .setCustomId("ticket_modal");

        const user_name = new TextInputComponent()
          .setCustomId("ticket_username")
          .setLabel(`Quel est votre nom ?`.substring(0, 45))
          .setMinLength(3)
          .setMaxLength(50)
          .setRequired(true)
          .setStyle("SHORT");

       
        const user_reason = new TextInputComponent()
          .setCustomId("ticket_reason")
          .setLabel(`Pourquoi créez-vous ce ticket ?`.substring(0, 45))
          .setMinLength(3)
          .setMaxLength(100)
          .setRequired(true)
          .setStyle("PARAGRAPH");

     
        const row_username = new MessageActionRow().addComponents(user_name);
        const row_user_reason = new MessageActionRow().addComponents(user_reason);
        ticket_modal.addComponents(row_username, row_user_reason);

        await interaction.showModal(ticket_modal);
      } else if (interaction.customId == "ticket_delete") {
        // Suppression d'un canal de ticket
        let ticketname = `ticket-${interaction.user.id}`;
        let oldChannel = interaction.guild.channels.cache.find((ch) => ch.name == ticketname);
        if (!oldChannel) return;
        interaction.reply({
          content: `> Le ticket va être supprimé dans quelques secondes`,
        });
        setTimeout(() => {
          oldChannel.delete().catch((e) => {});
        }, 5000);
      }
    }

    if (interaction.isModalSubmit()) {
      
      const ticket_username = interaction.fields.getTextInputValue("ticket_username");
      const ticket_user_reason = interaction.fields.getTextInputValue("ticket_reason");

      let ticketname = `ticket-${interaction.user.id}`;

      
      await interaction.guild.channels
        .create(ticketname, {
          type: "GUILD_TEXT",
          topic: `Ticket de ${interaction.user.tag}`,
          parent: settings.ticketCategory || interaction.channel.parentId,
          permissionOverwrites: [
            {
              id: interaction.guildId,
              deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
            },
            {
              id: interaction.user.id,
              allow: [
                "VIEW_CHANNEL",
                "SEND_MESSAGES",
                "READ_MESSAGE_HISTORY",
                "EMBED_LINKS",
                "ATTACH_FILES",
                "MANAGE_CHANNELS",
                "ADD_REACTIONS",
                "USE_APPLICATION_COMMANDS",
              ],
            },
            {
              id: client.user.id,
              allow: ["ADMINISTRATOR", "MANAGE_CHANNELS"],
            },
          ],
        })
        .then(async (ch) => {
          let embed = new MessageEmbed()
            .setColor("BLURPLE")
            .setTitle(`Ticket de ${interaction.user.username}`)
            .addFields([
              {
                name: `Nom`,
                value: `> ${ticket_username}`,
              },
              {
                name: `Raison`,
                value: `> ${ticket_user_reason}`,
              },
            ]);

          let btnrow = new MessageActionRow().addComponents([
            new MessageButton()
              .setCustomId(`ticket_delete`)
              .setStyle("DANGER")
              .setLabel(`Supprimer`),
          ]);
          ch.send({
            content: `${interaction.member} || ${settings.ticketRoles.map(
              (r) => `<@&${r}>`
            )}`,
            embeds: [embed],
            components: [btnrow],
          });
          interaction.reply({
            content: `> Votre ticket a été Créé en ${ch}`,
            ephemeral: true,
          });
        })
        .catch((e) => {
          interaction.reply({
            content: `Erreur \n \`${e.message}\``,
            ephemeral: true,
          });
        });
    }
  });
};

require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

// ==========================================
// CLIENTE
// ==========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ==========================================
// CONFIGURACIÓN DE CANALES
// ==========================================

const CHANNELS = {
    HACER: '1546463556340547676',
    PENDIENTES: '1546463704357277766',
    APROBADAS: '1546463761488027648',
    RECHAZADAS: '1546463812826435615'
};

// ==========================================
// SOLO ESTOS ROLES PUEDEN CORREGIR
// ==========================================

const STAFF_ROLES = [
    '1542528387170570352',
    '1542528604695560383',
    '1546467935839588385'
];

// ==========================================
// ROLES AUTOMÁTICOS
// ==========================================

const ROLES = {
    APROBADA: '1546468458403733585',
    RECHAZADA: '1546468521406500884'
};

// Guardar temporalmente respuestas
const whitelistData = new Map();


// ==========================================
// BOT LISTO
// ==========================================

client.once('ready', async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);

    try {
        const channel = await client.channels.fetch(CHANNELS.HACER);

        if (!channel) return;

        // Comprobar si el panel ya existe
        const messages = await channel.messages.fetch({ limit: 20 });

        const yaExiste = messages.some(msg =>
            msg.author.id === client.user.id &&
            msg.components.length > 0 &&
            msg.components.some(row =>
                row.components.some(
                    component => component.customId === 'iniciar_whitelist'
                )
            )
        );

        if (yaExiste) {
            console.log('ℹ️ Panel de whitelist ya existente.');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('💙 EXAMEN DE WHITELIST - URBAN 💙')
            .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━━━━━

💥 **¡Bienvenido al sistema de Whitelist de URBAN!** 💥

Para garantizar una buena calidad de rol dentro de nuestro servidor, todos los usuarios que deseen acceder deberán completar correctamente la solicitud de whitelist.

⏳ **Información sobre la Whitelist:**

• La solicitud consta de varias preguntas relacionadas con el Roleplay y FiveM.

• Responde todas las preguntas con sinceridad y de forma clara.

• Una vez enviada, tu solicitud pasará a **revisión**.

• El equipo de URBAN revisará personalmente tus respuestas.

• Recibirás el resultado cuando un miembro del staff decida **aprobar o rechazar** tu whitelist.

🛑 **IMPORTANTE:** No envíes solicitudes falsas, incompletas o realizadas sin tomarte el proceso en serio.

━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 **Presiona el botón de abajo cuando estés listo para comenzar tu Whitelist.**

**¡Mucha suerte y bienvenido a URBAN! 💙**

━━━━━━━━━━━━━━━━━━━━━━━━━━
            `);

        const button = new ButtonBuilder()
            .setCustomId('iniciar_whitelist')
            .setLabel('Comenzar Whitelist')
            .setEmoji('📝')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        console.log('✅ Panel enviado correctamente');

    } catch (error) {
        console.error(error);
    }
});


// ==========================================
// INTERACCIONES
// ==========================================

client.on('interactionCreate', async interaction => {

    // ==========================================
    // BOTONES
    // ==========================================

    if (interaction.isButton()) {

        // ------------------------------------------
        // INICIAR WHITELIST
        // ------------------------------------------

        if (interaction.customId === 'iniciar_whitelist') {

            const modal = new ModalBuilder()
                .setCustomId('whitelist_parte_1')
                .setTitle('Whitelist URBAN | Parte 1');

            const edad = new TextInputBuilder()
                .setCustomId('edad')
                .setLabel('1. ¿Cuál es tu edad OOC?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const discord = new TextInputBuilder()
                .setCustomId('discord')
                .setLabel('2. ¿Cuál es tu ID de Discord?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const mg = new TextInputBuilder()
                .setCustomId('mg')
                .setLabel('3. ¿Qué es MG?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const pg = new TextInputBuilder()
                .setCustomId('pg')
                .setLabel('4. ¿Qué es PG?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const dm = new TextInputBuilder()
                .setCustomId('dm')
                .setLabel('5. ¿Qué es DM?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(edad),
                new ActionRowBuilder().addComponents(discord),
                new ActionRowBuilder().addComponents(mg),
                new ActionRowBuilder().addComponents(pg),
                new ActionRowBuilder().addComponents(dm)
            );

            return interaction.showModal(modal);
        }


        // ------------------------------------------
        // CONTINUAR A PARTE 2
        // ------------------------------------------

        if (interaction.customId === 'continuar_whitelist') {

            if (!whitelistData.has(interaction.user.id)) {
                return interaction.reply({
                    content: '❌ Error. Vuelve a iniciar la whitelist.',
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId('whitelist_parte_2')
                .setTitle('Whitelist URBAN | Parte 2');

            const tiempo = new TextInputBuilder()
                .setCustomId('tiempo')
                .setLabel('6. ¿Cuánto tiempo llevas en FiveM?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const servidor = new TextInputBuilder()
                .setCustomId('servidor')
                .setLabel('7. ¿Has roleado en algún servidor serio?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const historia = new TextInputBuilder()
                .setCustomId('historia')
                .setLabel('8. Historia de tu personaje')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(tiempo),
                new ActionRowBuilder().addComponents(servidor),
                new ActionRowBuilder().addComponents(historia)
            );

            return interaction.showModal(modal);
        }


        // ==========================================
        // APROBAR WHITELIST
        // ==========================================

        if (interaction.customId.startsWith('aprobar_')) {

            const tienePermiso = interaction.member.roles.cache.some(
                role => STAFF_ROLES.includes(role.id)
            );

            if (!tienePermiso) {
                return interaction.reply({
                    content: '❌ No tienes permiso para corregir whitelists.',
                    ephemeral: true
                });
            }

            const userId = interaction.customId.replace('aprobar_', '');

            try {
                // Buscar usuario en el servidor
                const member = await interaction.guild.members.fetch(userId);

                // Quitar rol rechazado si lo tiene
                await member.roles.remove(ROLES.RECHAZADA).catch(() => {});

                // DAR ROL APROBADO AUTOMÁTICAMENTE
                await member.roles.add(ROLES.APROBADA);

                // Canal aprobadas
                const aprobadasChannel = await client.channels.fetch(
                    CHANNELS.APROBADAS
                );

                const aprobadoEmbed = new EmbedBuilder()
                    .setTitle('✅ WHITELIST APROBADA')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━

👤 **Usuario:** <@${userId}>

🎉 **Tu solicitud de Whitelist ha sido APROBADA.**

El equipo de URBAN ha revisado tus respuestas correctamente.

🔓 Ya tienes acceso como usuario aprobado.

**¡Bienvenido a URBAN! 💙**

━━━━━━━━━━━━━━━━━━━━
                    `);

                await aprobadasChannel.send({
                    embeds: [aprobadoEmbed]
                });

                // Actualizar mensaje y quitar botones
                return interaction.update({
                    content: `✅ **WHITELIST APROBADA** por ${interaction.user}\n🎭 Rol aprobado asignado automáticamente.`,
                    components: []
                });

            } catch (error) {
                console.error(error);

                return interaction.reply({
                    content: '❌ Error al aprobar la whitelist. Revisa que el rol del bot esté por encima del rol aprobado.',
                    ephemeral: true
                });
            }
        }


        // ==========================================
        // RECHAZAR WHITELIST
        // ==========================================

        if (interaction.customId.startsWith('rechazar_')) {

            const tienePermiso = interaction.member.roles.cache.some(
                role => STAFF_ROLES.includes(role.id)
            );

            if (!tienePermiso) {
                return interaction.reply({
                    content: '❌ No tienes permiso para corregir whitelists.',
                    ephemeral: true
                });
            }

            const userId = interaction.customId.replace('rechazar_', '');

            try {
                // Buscar usuario
                const member = await interaction.guild.members.fetch(userId);

                // Quitar aprobado si lo tiene
                await member.roles.remove(ROLES.APROBADA).catch(() => {});

                // DAR ROL RECHAZADO AUTOMÁTICAMENTE
                await member.roles.add(ROLES.RECHAZADA);

                // Canal rechazadas
                const rechazadasChannel = await client.channels.fetch(
                    CHANNELS.RECHAZADAS
                );

                const rechazadoEmbed = new EmbedBuilder()
                    .setTitle('❌ WHITELIST RECHAZADA')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━

👤 **Usuario:** <@${userId}>

❌ **Tu solicitud de Whitelist ha sido RECHAZADA.**

Puedes revisar la normativa y volver a intentarlo cuando corresponda.

━━━━━━━━━━━━━━━━━━━━
                    `);

                await rechazadasChannel.send({
                    embeds: [rechazadoEmbed]
                });

                // Actualizar mensaje
                return interaction.update({
                    content: `❌ **WHITELIST RECHAZADA** por ${interaction.user}\n🎭 Rol rechazado asignado automáticamente.`,
                    components: []
                });

            } catch (error) {
                console.error(error);

                return interaction.reply({
                    content: '❌ Error al rechazar la whitelist. Revisa la posición de los roles del bot.',
                    ephemeral: true
                });
            }
        }
    }


    // ==========================================
    // FORMULARIOS
    // ==========================================

    if (interaction.isModalSubmit()) {

        // ==========================================
        // PARTE 1
        // ==========================================

        if (interaction.customId === 'whitelist_parte_1') {

            const edad = interaction.fields.getTextInputValue('edad');
            const discord = interaction.fields.getTextInputValue('discord');
            const mg = interaction.fields.getTextInputValue('mg');
            const pg = interaction.fields.getTextInputValue('pg');
            const dm = interaction.fields.getTextInputValue('dm');

            // Guardar respuestas temporalmente
            whitelistData.set(interaction.user.id, {
                edad,
                discord,
                mg,
                pg,
                dm
            });

            const continuar = new ButtonBuilder()
                .setCustomId('continuar_whitelist')
                .setLabel('Continuar')
                .setEmoji('➡️')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder()
                .addComponents(continuar);

            return interaction.reply({
                content: '✅ **Parte 1 completada correctamente.**\n\nPulsa **Continuar** para responder las últimas preguntas.',
                components: [row],
                ephemeral: true
            });
        }


        // ==========================================
        // PARTE 2
        // ==========================================

        if (interaction.customId === 'whitelist_parte_2') {

            const data = whitelistData.get(interaction.user.id);

            if (!data) {
                return interaction.reply({
                    content: '❌ Error. Vuelve a iniciar la whitelist.',
                    ephemeral: true
                });
            }

            const tiempo = interaction.fields.getTextInputValue('tiempo');
            const servidor = interaction.fields.getTextInputValue('servidor');
            const historia = interaction.fields.getTextInputValue('historia');

            try {
                const pendientesChannel = await client.channels.fetch(
                    CHANNELS.PENDIENTES
                );

                const embed = new EmbedBuilder()
                    .setTitle('📝 WHITELIST EN REVISIÓN')
                    .setDescription(`
━━━━━━━━━━━━━━━━━━━━

👤 **Usuario:** ${interaction.user}
🆔 **ID del usuario:** ${interaction.user.id}

━━━━━━━━━━━━━━━━━━━━

**1️⃣ Edad OOC**
> ${data.edad}

**2️⃣ ID Discord**
> ${data.discord}

**3️⃣ ¿Qué es MG?**
> ${data.mg}

**4️⃣ ¿Qué es PG?**
> ${data.pg}

**5️⃣ ¿Qué es DM?**
> ${data.dm}

**6️⃣ ¿Cuánto tiempo llevas en FiveM?**
> ${tiempo}

**7️⃣ ¿Has roleado en algún servidor serio?**
> ${servidor}

**8️⃣ Historia de tu personaje**
> ${historia}

━━━━━━━━━━━━━━━━━━━━

⏳ **ESTADO: PENDIENTE DE REVISIÓN**
                    `);

                const aprobar = new ButtonBuilder()
                    .setCustomId(`aprobar_${interaction.user.id}`)
                    .setLabel('Aprobar')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success);

                const rechazar = new ButtonBuilder()
                    .setCustomId(`rechazar_${interaction.user.id}`)
                    .setLabel('Rechazar')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder()
                    .addComponents(aprobar, rechazar);

                await pendientesChannel.send({
                    embeds: [embed],
                    components: [row]
                });

                // Borrar datos temporales
                whitelistData.delete(interaction.user.id);

                return interaction.reply({
                    content: `📝 **WHITELIST EN REVISIÓN**

Tu solicitud ha sido enviada correctamente.

⏳ Un miembro del staff revisará personalmente tus respuestas.

Recibirás el resultado cuando tu whitelist sea aprobada o rechazada.`,
                    ephemeral: true
                });

            } catch (error) {
                console.error(error);

                return interaction.reply({
                    content: '❌ Ha ocurrido un error al enviar tu whitelist.',
                    ephemeral: true
                });
            }
        }
    }
});


// ==========================================
// INICIAR BOT
// ==========================================

client.login(process.env.TOKEN);
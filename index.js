const { Client, Intents, MessageEmbed } = require('discord.js');
const axios = require("axios")
require('dotenv').config()

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', (client) => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
	// client.channels.cache.get(process.env.CHANNEL_ID).send('Hello there!');

	// Anonymous async function to query Forta API, and parse positive results into Discord messages
	(async () => {
		const forta_response = await forta_api_request();
		parse_forta_response(forta_response, client)
	})();	
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);

// Forta GraphQL API request
const query = `query recentAlerts($input: AlertsInput) {
    alerts(input: $input) {
      alerts {
        createdAt
        name
        source {
          transactionHash
        }
        severity
      }
    }
  }`;

// TEST INPUT VARIABLES FOR BALANCER FORTA AGENT

// const input = `{
//     "input": {
//       "first": 5,
//       "agents": ["0x324e694b557ed964895179ef10d7ec3b730ca6b7c1f360bbf1017bf9be544bac"],
//       "createdSince": 999900000,
//       "chainId": 1
//     }
//   }`;

// INPUT VARIABLES FOR SOLACE FORTA AGENTS

const input = `{
    "input": {
      "first": 10,
      "agents": ["0x143f7fd87abb8aff430bdf0a5d94ce8da09159c2fc509f72f6a34838eb9bc15d", "0xda27257407055ba19ddf476e199ba03ff10d6a6ac140c0495e2c487cddbbe6ee", "0x407cf0397de5fc49f8e1329b556dcc5b91286d66532a8ecd979214d7cbc3c276", "0x022eb176480a2cd02ef5cb928a48fce47578afa79a9a7d861c7d22ff8426aee9", "0x7d631d5f2c51d939b6d38cee614c535da1d84606fdf46bd75973099ddc251f07"],
      "createdSince": 320,
      "chainId": 1
    }
  }
`;

async function forta_api_request() {
	try {
        let resp = await axios({
            url: "https://api.forta.network/graphql",
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                query,
                variables: input,
            })
        })

        const alerts = resp.data.data.alerts.alerts
		return alerts
    } catch(e) {
        console.error(e)
    }
}

// Parse successful Forta API query into Discord embed message
function parse_forta_response(forta_response, client) {
	if ( forta_response.length > 0 ) {
		console.log(forta_response.length + " NEW FORTA ALERTS!")

		forta_response.forEach(element => {
		  const alert_description = element.name
		  const alert_tx_hash = element.source.transactionHash
		  const severity = element.severity

		  const embed = new MessageEmbed()
		  .setTitle(`${severity} ALERT`)
		  .setDescription(`${alert_description}`)
		  .setURL(`https://etherscan.io/tx/${alert_tx_hash}`)
		  .setThumbnail('https://forta.org/assets/img/forta_white.png')
		  .setColor("#ff0000")
		  .setTimestamp()
		  .addFields(
			{ name: '\u200B', value: `https://etherscan.io/tx/${alert_tx_hash}` },
		)

		  client.channels.cache.get(process.env.CHANNEL_ID).send({ embeds: [embed] })
		});
		
	} else {
		// client.channels.cache.get(process.env.CHANNEL_ID).send("NO NEW FORTA ALERTS!")
		console.log("NO NEW FORTA ALERTS")
	}
}
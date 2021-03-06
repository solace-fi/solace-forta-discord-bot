const { Client, Intents, MessageEmbed } = require('discord.js');
const axios = require("axios");
require("dotenv").config();

exports.handler = async (event) => {
  try {
    const promise = new Promise(function(resolve, reject) {
      console.log("Running Forta-Discord Agent...");
      
      // Create a new client instance
      const client = new Client({ ws: { intents: [Intents.FLAGS.GUILDS] } });

      // Login to Discord with your client's token
      client.login(process.env.TOKEN);

      // When the client is ready, run this code (only once)
      client.once("ready", async () => {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        try {
          // Get Eth mainnet alerts
          const forta_response_mainnet = await forta_api_request(input_mainnet);
          await parse_forta_response(forta_response_mainnet, client);

          // Get Polygon mainnet alerts
          const forta_response_polygon = await forta_api_request(input_polygon);
          await parse_forta_response(forta_response_polygon, client);

          const response = {
            statusCode: 200,
            body: JSON.stringify("The Forta-Discord Bot ran successfully"),
          };
          
          console.log("Running Forta-Discord Agent has been finished.");

          resolve(response)
        } catch(e) {
          console.error(e);
          reject(e);
        }

      });

    })

    return promise;

  } catch (e) {
    console.log("The error has been occurred while running Forta-Discord Agent.");
    console.error(e);
    const response = {
      statusCode: 500,
      body: JSON.stringify("Something went wrong"),
    };
    return response;
  }
};

async function forta_api_request(input) {
  let resp = await axios({
    url: "https://api.forta.network/graphql",
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      query,
      variables: input,
    }),
  });

  const alerts = resp.data.data.alerts.alerts;
  return alerts;
}

// Parse successful Forta API query into Discord embed message
async function parse_forta_response(forta_response, client) {
  if (forta_response.length > 0) {
    console.log(forta_response.length + " NEW FORTA ALERTS!");

    for (const element of forta_response) {
      const alert_description = element.name;
      const alert_tx_hash = element.source.transactionHash;
      const severity = element.severity;

      const embed = new MessageEmbed()
        .setTitle(`${severity} ALERT`)
        .setDescription(`${alert_description}`)
        .setURL(`https://etherscan.io/tx/${alert_tx_hash}`)
        .setThumbnail("https://forta.org/assets/img/forta_white.png")
        .setColor("#ff0000")
        .setTimestamp()
        .addFields({ name: "\u200B", value: `https://etherscan.io/tx/${alert_tx_hash}` });

      await client.channels.cache.get(process.env.CHANNEL_ID).send(embed);
    }

  } else {
    console.log("NO NEW FORTA ALERTS");
  }
}

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

// const input_mainnet = `{
//   "input": {
//     "first": 5,
//     "agents": ["0x324e694b557ed964895179ef10d7ec3b730ca6b7c1f360bbf1017bf9be544bac"],
//     "createdSince": 999900000,
//     "chainId": 1
//   }
// }`;

// INPUT VARIABLES FOR SOLACE FORTA AGENTS

const input_mainnet = `{
    "input": {
      "first": 10,
      "agents": ["0x143f7fd87abb8aff430bdf0a5d94ce8da09159c2fc509f72f6a34838eb9bc15d", "0xda27257407055ba19ddf476e199ba03ff10d6a6ac140c0495e2c487cddbbe6ee", "0x407cf0397de5fc49f8e1329b556dcc5b91286d66532a8ecd979214d7cbc3c276", "0x022eb176480a2cd02ef5cb928a48fce47578afa79a9a7d861c7d22ff8426aee9", "0x7d631d5f2c51d939b6d38cee614c535da1d84606fdf46bd75973099ddc251f07","0x4a1cd614f1b4783a3a4d2c8679323cd6e58bc3a080ee22cb23b6074ca40f2cd0"],
      "createdSince": 320,
      "chainId": 1
    }
  }
`;

const input_polygon = `{
    "input": {
      "first": 10,
      "agents": ["0x143f7fd87abb8aff430bdf0a5d94ce8da09159c2fc509f72f6a34838eb9bc15d", "0xda27257407055ba19ddf476e199ba03ff10d6a6ac140c0495e2c487cddbbe6ee", "0x407cf0397de5fc49f8e1329b556dcc5b91286d66532a8ecd979214d7cbc3c276", "0x022eb176480a2cd02ef5cb928a48fce47578afa79a9a7d861c7d22ff8426aee9", "0x7d631d5f2c51d939b6d38cee614c535da1d84606fdf46bd75973099ddc251f07","0x4a1cd614f1b4783a3a4d2c8679323cd6e58bc3a080ee22cb23b6074ca40f2cd0"],
      "createdSince": 320,
      "chainId": 137
    }
  }
`;
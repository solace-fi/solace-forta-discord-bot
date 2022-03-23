Discord bot to track Forta agent alerts

Five Forta agents from Solace contest - https://docs.forta.network/en/latest/contest5-solace/

This script is intended to be run every 5 minutes with `node .`
- This will query the Forta API for the last 5 minutes of alerts
- If there is a new Forta alert, the Forta Bot will post a new message in the #forta-alerts channel in the Solace Discord
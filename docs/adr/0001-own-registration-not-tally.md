# Own registration page instead of Tally

Registration is a page on our own server writing straight to our database, not a Tally form. Tally would keep Participants' student IDs and names on a third-party service, and feeding every Station's start screen would need a webhook into our database: a second system that can fail on event day. The form is only six fields, so building it costs less than the integration would. Personal data stays on our VPS, which makes PDPA handling simple: export a CSV for the report, then wipe 30 days after the event.

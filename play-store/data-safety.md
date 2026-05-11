# Data Safety Form

Play Console → App content → Data safety. Answers below.

## Overview

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS to Supabase) |
| Do you provide a way for users to request that their data is deleted? | **Yes** — via email contact |

## Data types collected

### Personal info → Name
- **Collected:** Yes (the optional player nickname users enter)
- **Shared with third parties:** No
- **Processed ephemerally:** No (persisted as part of game history)
- **Required or optional:** Optional (user-chosen nicknames; can be left blank or pseudonym)
- **Purposes:** App functionality (display in game history and leaderboards)

### App activity → App interactions
- **Collected:** Yes (card counts, scores, game outcomes)
- **Shared with third parties:** No
- **Processed ephemerally:** No
- **Required or optional:** Required (this is the core feature)
- **Purposes:** App functionality (score history, stats)

### Device or other IDs → Device or other IDs
- **Collected:** Yes (a random UUID generated on the device on first launch)
- **Shared with third parties:** No
- **Processed ephemerally:** No
- **Required or optional:** Required
- **Purposes:** App functionality (associate games with the device that recorded them)

## Data types you do NOT collect (leave unchecked)

- Personal info other than name (email, phone, address, etc.)
- Financial info
- Health and fitness
- Messages
- Photos / videos / audio
- Files and docs
- Calendar
- Contacts
- App info and performance (no crash reporting tools installed)
- Web browsing history
- Location

## Security practices

- ✅ Data is encrypted in transit (HTTPS)
- ✅ You can request that data be deleted
- ❌ Independent security review — not claimed
- ❌ Committed to follow Play Families Policy — not targeting children

## User-deletion mechanism

In the form, when asked how users can request deletion, paste:

```
Users can request deletion of any data associated with their device by emailing lena.berw@gmail.com with their device ID (shown in app Settings) or a description of the games they want removed. Requests are processed within a reasonable period. Users can also clear all local data via the in-app Settings → Clear Data option, and uninstalling the app removes the locally cached records.
```

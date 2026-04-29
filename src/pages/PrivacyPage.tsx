import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

const LAST_UPDATED = '2026-04-29'
const CONTACT_EMAIL = 'lena.berw@gmail.com'

export function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">Privacy Policy</h1>
      </div>

      <Card>
        <CardContent className="prose prose-sm max-w-none space-y-4 py-4 text-forest-700">
          <p className="text-xs text-forest-400">Last updated: {LAST_UPDATED}</p>

          <p>
            Forest Shuffle Companion (&quot;the App&quot;) is an unofficial fan-made score
            calculator and game tracker for the Forest Shuffle board game. This Privacy
            Policy explains what data the App handles, how it is stored, and your choices.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Who we are</h2>
          <p>
            The App is developed and operated as an independent project. Forest Shuffle
            Companion is not affiliated with, endorsed by, or sponsored by the publisher of
            the Forest Shuffle game.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">No accounts required</h2>
          <p>
            The App does not require you to sign up or sign in. We do not collect your
            email address, phone number, real name, date of birth, location, or any other
            government-issued identifier.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Data we handle</h2>
          <p>The App handles the following information:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Device identifier</strong> — a random UUID generated on first launch
              and stored in your device&apos;s local storage. This identifier is used only
              to associate game data with your device. It is not linked to any personal
              information and cannot identify you as a person.
            </li>
            <li>
              <strong>Player profiles you create</strong> — display names and color
              choices you enter for the people you play with. These are nicknames you
              choose and are not verified against any real-world identity.
            </li>
            <li>
              <strong>Game data</strong> — the games you record: date played, edition,
              expansions used, scores, card counts, rankings, and any optional notes you
              enter.
            </li>
            <li>
              <strong>Live session data</strong> — when you host or join a multiplayer
              scoring session, your chosen player nickname, scoring inputs (card counts,
              tree occupancy), and submission status are shared in real time with other
              participants in that session.
            </li>
            <li>
              <strong>Preferences</strong> — your selected language, game edition, and
              expansion toggles.
            </li>
          </ul>

          <h2 className="font-heading text-base font-semibold text-forest-800">Where data is stored</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong>On your device</strong> — most data (device ID, preferences, cached
              games and players) is stored locally on your device using browser storage.
              It stays on your device until you clear it.
            </li>
            <li>
              <strong>On Supabase</strong> — to enable multi-device sync and live
              multiplayer sessions, game data is also stored on Supabase (a third-party
              hosted database service operated by Supabase, Inc.). Data is transmitted
              over HTTPS. See Supabase&apos;s privacy policy at{' '}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest-600 underline"
              >
                supabase.com/privacy
              </a>
              .
            </li>
          </ul>

          <h2 className="font-heading text-base font-semibold text-forest-800">How we use the data</h2>
          <p>The App uses the data you provide to:</p>
          <ul className="list-disc pl-5">
            <li>Calculate scores and display game history.</li>
            <li>Show statistics and leaderboards across the games you record.</li>
            <li>
              Synchronize the state of a live multiplayer scoring session between
              participants who share a session code.
            </li>
            <li>Remember your preferences between visits.</li>
          </ul>
          <p>
            The App does not sell your data. It does not use the data for advertising,
            profiling, or marketing. There are no analytics, tracking pixels, or
            advertising SDKs in the App.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Sharing</h2>
          <p>
            Game and player data is associated with your randomly generated device ID and
            is not shared with other users by default. When you host or join a live
            multiplayer scoring session, the nickname and score inputs you submit during
            that session are visible to other participants in the same session for the
            duration of the session.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Third-party services</h2>
          <p>
            The App loads typefaces from{' '}
            <a
              href="https://fonts.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-600 underline"
            >
              Google Fonts
            </a>
            . When the App is opened, your device makes an HTTPS request to Google&apos;s
            font servers, which may log standard request metadata (such as IP address and
            user-agent) according to{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-600 underline"
            >
              Google&apos;s privacy policy
            </a>
            . No identifiers from the App are sent with these requests.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Children</h2>
          <p>
            The App does not knowingly collect personal information from children. Because
            no account is required and no personal identifiers are requested, the App is
            suitable for use by players of all ages under adult supervision.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Your choices and data deletion</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong>Clear local data</strong> — open Settings in the App and use
              &quot;Clear data&quot; to remove all game and preference data stored on your
              device.
            </li>
            <li>
              <strong>Export your data</strong> — Settings includes an &quot;Export&quot;
              option that downloads your players and games as a JSON file.
            </li>
            <li>
              <strong>Delete remote data</strong> — to request deletion of any game data
              associated with your device ID from the Supabase backend, contact us at the
              address below and provide the device ID shown in Settings (if displayed) or
              describe the games you wish to remove. We will action the request within a
              reasonable period.
            </li>
            <li>
              <strong>Uninstall</strong> — uninstalling the App removes the locally cached
              data on your device. Records previously synced to the backend are retained
              until deleted on request.
            </li>
          </ul>

          <h2 className="font-heading text-base font-semibold text-forest-800">Security</h2>
          <p>
            All communication with the backend is encrypted in transit using HTTPS. Data
            is stored by Supabase, which provides industry-standard infrastructure
            security. Because the App does not collect sensitive personal information, the
            data exposure risk is limited to the nicknames and game records you choose to
            enter.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The date at the top of the
            document indicates the most recent revision. Material changes will be
            communicated through the App.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Contact</h2>
          <p>
            For privacy questions or data deletion requests, contact:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-forest-600 underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

const LAST_UPDATED = '2026-09-08'
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
            Forest Shuffle Scorer (&quot;the App&quot;) is an unofficial fan-made score
            calculator and game tracker for the Forest Shuffle board game. This Privacy
            Policy explains what data the App handles, how it is stored, and your choices.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Who we are</h2>
          <p>
            The App is developed and operated as an independent project. Forest Shuffle
            Scorer is not affiliated with, endorsed by, or sponsored by the publisher of
            the Forest Shuffle game.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Accounts are optional</h2>
          <p>
            The App works without signing up. On first launch it creates an anonymous
            account with a random identifier so that your games can be stored; no
            personal information is attached to it. If you want to keep your history when
            you change phone, you can optionally link an e-mail address to that account
            in Settings. We never ask for a password, phone number, real name, date of
            birth, location, or any government-issued identifier.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Data we handle</h2>
          <p>The App handles the following information:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Device and account identifiers</strong> — a random UUID generated on
              first launch and stored in your device&apos;s local storage, plus the random
              identifier of your anonymous account. They are used only to associate game
              data with your device or account and cannot identify you as a person.
            </li>
            <li>
              <strong>E-mail address (optional)</strong> — only if you choose to link one
              to your account. It is used solely to send you sign-in codes so you can
              restore your history on another device. We do not send newsletters or
              marketing.
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
              <strong>On your device</strong> — most data (device ID, session token,
              preferences, cached games and players) is stored locally on your device
              using browser storage. It stays on your device until you clear it.
            </li>
            <li>
              <strong>On Supabase</strong> — to enable multi-device sync and live
              multiplayer sessions, game data and your account (including the optional
              e-mail address) are stored on Supabase (a third-party hosted database and
              authentication service operated by Supabase, Inc.). Data is transmitted
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
            <li>
              Send you a one-time sign-in code when you link an e-mail address or restore
              your history on another device.
            </li>
            <li>
              Reply to feedback you send through the App, if you chose to include your
              e-mail address. The address is optional and is used for no other purpose.
            </li>
          </ul>
          <p>
            The App does not sell your data. It does not use the data for advertising,
            profiling, or marketing. The App counts page views with Vercel Web Analytics,
            which is cookie-free, does not store IP addresses, and does not track you
            across websites (see below). There are no tracking pixels or advertising SDKs
            in the App.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Sharing</h2>
          <p>
            Game and player data is associated with your account and is not shared with
            other users by default. When you host or join a live multiplayer scoring
            session, the nickname and score inputs you submit during that session are
            visible to other participants in the same session for the duration of the
            session.
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
          <p>
            The App is hosted on Vercel and uses{' '}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-600 underline"
            >
              Vercel Web Analytics
            </a>{' '}
            to measure aggregate usage (page views, country, device type). It sets no
            cookies and stores no IP addresses; visitors are counted with a hash that is
            discarded after 24 hours. Your identifiers and game data are never sent to it.
            See{' '}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-600 underline"
            >
              Vercel&apos;s privacy policy
            </a>
            .
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Children</h2>
          <p>
            The App does not knowingly collect personal information from children. Because
            no sign-up is required and the only personal identifier (an e-mail address)
            is optional, the App is suitable for use by players of all ages under adult
            supervision.
          </p>

          <h2 className="font-heading text-base font-semibold text-forest-800">Your choices and data deletion</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong>Delete your account and all data</strong> — open Settings in the App
              and use &quot;Clear All Data&quot;. This deletes your account, every game,
              player and score stored on our servers, and all local data on your device.
              No e-mail or waiting period is needed.
            </li>
            <li>
              <strong>Sign out</strong> — if you linked an e-mail, Settings lets you sign
              out on one device. Your history stays in your account; the device starts
              with a fresh anonymous account.
            </li>
            <li>
              <strong>Export your data</strong> — Settings includes an &quot;Export&quot;
              option that downloads your players and games as a JSON file.
            </li>
            <li>
              <strong>Deletion without the App</strong> — if you no longer have the App
              installed, e-mail us at the address below with the e-mail address linked to
              your account, or describe the games you wish to remove. We will action the
              request within a reasonable period.
            </li>
            <li>
              <strong>Uninstall</strong> — uninstalling the App removes the locally cached
              data on your device. Records previously synced to the backend are retained
              until you delete them as described above.
            </li>
          </ul>

          <h2 className="font-heading text-base font-semibold text-forest-800">Security</h2>
          <p>
            All communication with the backend is encrypted in transit using HTTPS. Data
            is stored by Supabase, which provides industry-standard infrastructure
            security. Sign-in uses one-time codes sent by e-mail; the App never stores a
            password. Because the App collects no sensitive personal information, the
            data exposure risk is limited to the nicknames, optional e-mail address and
            game records you choose to enter.
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

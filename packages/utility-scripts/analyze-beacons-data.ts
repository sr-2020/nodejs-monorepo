import { Firestore, Timestamp } from '@google-cloud/firestore';
import * as commandLineArgs from 'command-line-args';

// Example command to run:
//   ts-node analyze-beacons-data.ts  --id=8

const db = new Firestore();

const optionDefinitions = [{ name: 'id', type: String }];
const userId = commandLineArgs(optionDefinitions).id;

const allDocs = db.collection(`characters/${userId}/wakeups`);

function formatTimestamp(t: Timestamp) {
  const d = t.toDate();
  return `${d.getHours()}:${d.getMinutes()}`;
}

async function main() {
  console.log(`Analyzing data for the user with id = ${userId} for the last 10 hours`);
  for (let i = 0; i < 10; ++i) {
    const now = Timestamp.now();
    const to = new Timestamp(now.seconds - 3600 * i, now.nanoseconds);
    const from = new Timestamp(to.seconds - 3600, to.nanoseconds);
    const latestDocs = await allDocs.where('timestamp', '>=', from).where('timestamp', '<=', to).get();

    const wakeups = latestDocs.docs
      .map((d) => d.data() as { total_beacons: number; timestamp: Timestamp })
      .sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);

    const totalWakeups = wakeups.length;
    let maxDiff = 0;
    for (let j = 0; j < totalWakeups - 1; ++j) {
      maxDiff = Math.max(maxDiff, wakeups[j + 1].timestamp.seconds - wakeups[j].timestamp.seconds);
    }
    const wakeupsWithBeacons = wakeups.filter((w) => w.total_beacons > 0).length;
    console.log(
      `In the interval ${formatTimestamp(from)}-${formatTimestamp(
        to,
      )} there were ${totalWakeups} wakeups total, from them ${wakeupsWithBeacons} were with beacon(s). Max delay = ${
        maxDiff / 60
      } minutes`,
    );
  }
}

main().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);

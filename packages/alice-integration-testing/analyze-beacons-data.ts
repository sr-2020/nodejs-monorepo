import { Firestore, Timestamp } from '@google-cloud/firestore';
import * as commandLineArgs from 'command-line-args';

// Example command to run:
//   ts-node analyze-beacons-data.ts  --id=8

const db = new Firestore();

const optionDefinitions = [{ name: 'id', type: String }];
const userId = commandLineArgs(optionDefinitions).id;

let allDocs = db.collection(`characters/${userId}/wakeups`);

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
    const latestDocs = await allDocs
      .where('timestamp', '>=', from)
      .where('timestamp', '<=', to)
      .get();
    const totalWakeups = latestDocs.size;
    const wakeupsWithBeacons = latestDocs.docs.filter((d) => d.data().total_beacons > 0).length;
    console.log(
      `In the interval ${formatTimestamp(from)}-${formatTimestamp(
        to,
      )} there were ${totalWakeups} wakeups total, from them ${wakeupsWithBeacons} were with beacon(s).`,
    );
  }
}

main().then(() => console.log('Finished OK'), (e) => console.log(`Finished with error: ${e}`));

import mongoose from "mongoose";
import { CivicReport } from "../models/civic-report.js";
import { Petition } from "../models/petition.js";
import { Signature } from "../models/signature.js";
import { User } from "../models/user.js";

/**
 * A real `mongod` for the integration suite.
 *
 * Why a real database rather than the mocks the unit suites use: the
 * guarantees under test are enforced by MongoDB, not by application code.
 * A unique index either exists in the running server or it does not, and
 * no mock can tell the difference. The signature fake in the unit tests
 * deliberately *emulates* an E11000, which proves the route handles the
 * error correctly but would behave identically against a schema carrying
 * no index at all.
 *
 * Why an already-running server rather than `mongodb-memory-server`:
 * that package was evaluated first and does work — it starts a genuine
 * `mongod`, so index enforcement is real. It was rejected on cost. It
 * pulled 37 packages and downloaded a 781 MB MongoDB 8.2.6 archive on
 * first use, which is slow locally and slower in CI, and it silently
 * validated against a different server version than the `mongo:7.0` this
 * project actually deploys. Connecting to a server that already exists
 * removes the dependency, removes the download, and pins the suite to
 * the deployed version:
 *
 *  - locally, `docker compose up -d mongo redis` is already step 3 of the
 *    README's setup, so the server is running before the suite is;
 *  - in CI, a `mongo:7.0` service container provides the same thing.
 *
 * The suite uses its **own** database name and drops it afterwards, so it
 * can never write to — or clean up in — the development database holding
 * a developer's own reports and petitions.
 *
 * The server is standalone, not a replica set, matching the deployment
 * target. Nothing here needs a multi-document transaction, which is the
 * same reason production does not use one (see
 * `services/petition-signatures.ts`).
 */

const TEST_DB_NAME = "cap_integration_test";
const DEFAULT_URI = "mongodb://127.0.0.1:27017";

/** Models whose indexes or validators carry a guarantee worth testing. */
const indexedModels = [User, CivicReport, Petition, Signature];

export const startMongo = async (): Promise<void> => {
  const uri = process.env.MONGODB_TEST_URI ?? DEFAULT_URI;

  try {
    await mongoose.connect(uri, { dbName: TEST_DB_NAME, serverSelectionTimeoutMS: 5_000 });
  } catch (error) {
    // Failing loudly beats skipping: an integration suite that quietly
    // does nothing when its database is absent is worse than no suite,
    // because CI stays green while the guarantee goes unchecked.
    throw new Error(
      `Could not reach MongoDB at ${uri}. Start one with "docker compose up -d mongo", ` +
        `or point MONGODB_TEST_URI at an existing server. Original error: ${(error as Error).message}`
    );
  }

  // Mirrors server.ts: build every index before the suite asserts on
  // them, rather than letting autoIndex race the first query.
  await Promise.all(indexedModels.map((model) => model.init()));
};

export const stopMongo = async (): Promise<void> => {
  // Drop rather than merely disconnect, so a shared server is left as it
  // was found.
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};

/** Empties every collection between tests without dropping the indexes. */
export const clearCollections = async (): Promise<void> => {
  const collections = mongoose.connection.db ? await mongoose.connection.db.collections() : [];
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};
